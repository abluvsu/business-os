import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  WorkspaceManager,
  observations,
  businessEntities,
  companyProfiles,
} from "@business-os/workspace";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

// -----------------------------------------------------------------------------
// Priority 3: Brain Interface (Multi-Provider LLM)
// -----------------------------------------------------------------------------

export function registerMarketingRoutes(
  fastify: FastifyInstance,
  manager: WorkspaceManager,
) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // Helper to create an AI client based on .env config
  const createAIClient = (prefix: "PRIMARY_AI" | "FALLBACK_AI") => {
    const key = process.env[`${prefix}_API_KEY`];
    const baseURL = process.env[`${prefix}_BASE_URL`];
    const model = process.env[`${prefix}_MODEL`];

    if (!key || !model) return null;

    return {
      client: new OpenAI({ apiKey: key, baseURL, timeout: 2000 }),
      model,
      provider: process.env[`${prefix}_PROVIDER`] || "unknown",
    };
  };

  const primaryAI = createAIClient("PRIMARY_AI");
  const fallbackAI = createAIClient("FALLBACK_AI");

  server.post(
    "/api/chat",
    {
      schema: {
        body: z.object({ message: z.string() }),
        response: {
          200: z.object({
            text: z.string(),
            chart: z.any().optional(),
            recommendations: z.array(z.string()).optional(),
          }),
        },
      },
    },
    async (request, reply) => {
      const db = manager.db;
      if (!db) return reply.status(500).send({ text: "Database offline." });

      try {
        // Fetch company profile for context
        const tenantContext = (request as any).tenantContext;
        const workspaceId = tenantContext?.activeWorkspaceId;

        let companyProfile = null;
        if (workspaceId) {
          const profiles = await db
            .select()
            .from(companyProfiles)
            .where(eq(companyProfiles.workspaceId, workspaceId))
            .limit(1);
          companyProfile = profiles[0] || null;
        }

        const entities = await request.repo!.getBusinessEntities();
        const metrics = await request.repo!.getObservations();

        const contextSummary = entities
          .map(
            (e: { id: string; name: string; status: string; type: string }) => {
              const entityMetrics = metrics.filter(
                (m: { entityId: string | null }) => m.entityId === e.id,
              );
              const metricsStr = entityMetrics
                .map(
                  (m: { observationType: string; value: number }) =>
                    `${m.observationType}: ${m.value}`,
                )
                .join(", ");
              return `[${e.type}] ${e.name} (${e.status}): ${metricsStr || "no metrics"}`;
            },
          )
          .join("\n");

        // Include company profile in context
        let companyContext = "";
        if (companyProfile) {
          const competitors = companyProfile.competitorNames?.length
            ? `\nCompetitors: ${companyProfile.competitorNames.join(", ")}`
            : "";
          const healthMetrics = companyProfile.healthMetrics
            ? `\nHealth Metrics: ${JSON.stringify(companyProfile.healthMetrics)}`
            : "";

          companyContext = `
=== COMPANY PROFILE ===
Company: ${companyProfile.name}
${companyProfile.website ? `Website: ${companyProfile.website}` : ""}
${companyProfile.industry ? `Industry: ${companyProfile.industry}` : ""}
${companyProfile.stage ? `Stage: ${companyProfile.stage}` : ""}
${companyProfile.businessModel ? `Business Model: ${companyProfile.businessModel}` : ""}
${companyProfile.description ? `Description: ${companyProfile.description}` : ""}
${companyProfile.valueProposition ? `Value Proposition: ${companyProfile.valueProposition}` : ""}
${companyProfile.targetAudience ? `Target Audience: ${companyProfile.targetAudience}` : ""}${competitors}${healthMetrics}`;
        }

        const campaigns = entities.filter(
          (e: { type: string }) =>
            e.type === "campaign" || e.type === "organic_post",
        ) as Array<{ id: string; name: string; type: string }>;
        const chartData = {
          title: campaigns.some(
            (c: { type: string }) => c.type === "organic_post",
          )
            ? "Organic Post Engagement (Likes)"
            : "Campaign Performance (Clicks)",
          xAxis: campaigns.map((c: { name: string }) => c.name),
          series: campaigns.map(
            (c: { id: string }) =>
              metrics.find(
                (m: { entityId: string | null; observationType: string }) =>
                  m.entityId === c.id && m.observationType === "clicks",
              )?.value || 0,
          ),
        };

        let aiText = "";
        let recommendations: string[] = [];
        let success = false;

        const systemPrompt = `You are BusinessOS, an expert marketing analyst.
Here is the current performance context from the database:
${contextSummary}${companyContext}

Provide a 2-3 sentence analysis of the data focusing on the user's question.
You MUST output exactly 2 recommendations at the end, each on a new line starting with a dash (e.g. "- Recommendation text"). Do not use any other bullet characters or numbers.`;

        // Try Primary AI first
        if (primaryAI && !success) {
          try {
            const response = await primaryAI.client.chat.completions.create({
              model: primaryAI.model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: request.body.message },
              ],
              temperature: 0.2,
            });

            const result = response.choices[0].message.content || "";
            const lines = result.split("\n");
            recommendations = lines
              .filter(
                (l) => l.trim().startsWith("-") || l.trim().startsWith("*"),
              )
              .map((l) => l.replace(/^[-*]\s*/, ""));
            aiText = lines
              .filter(
                (l) => !l.trim().startsWith("-") && !l.trim().startsWith("*"),
              )
              .join("\n")
              .trim();
            success = true;
          } catch (err) {
            console.warn(`Primary AI (${primaryAI.provider}) failed:`, err);
          }
        }

        // Try Fallback AI if Primary failed
        if (fallbackAI && !success) {
          try {
            console.log(
              `Falling back to secondary AI (${fallbackAI.provider})...`,
            );
            const response = await fallbackAI.client.chat.completions.create({
              model: fallbackAI.model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: request.body.message },
              ],
              temperature: 0.2,
            });

            const result = response.choices[0].message.content || "";
            const lines = result.split("\n");
            recommendations = lines
              .filter(
                (l) => l.trim().startsWith("-") || l.trim().startsWith("*"),
              )
              .map((l) => l.replace(/^[-*]\s*/, ""));
            aiText = lines
              .filter(
                (l) => !l.trim().startsWith("-") && !l.trim().startsWith("*"),
              )
              .join("\n")
              .trim();
            success = true;
          } catch (err) {
            console.warn(`Fallback AI (${fallbackAI.provider}) failed:`, err);
          }
        }

        // Final local heuristic fallback if both APIs fail
        if (!success) {
          aiText = `Based on your data, ${campaigns[0]?.name || "your top campaign"} is generating the most clicks relative to spend. (Note: This is a local fallback response because all AI providers are currently unavailable.)`;
          recommendations = [
            "Reallocate 15% budget to the best performing campaign.",
            "Pause underperforming ad sets to improve ROAS.",
          ];
        }

        return {
          text: aiText,
          chart: chartData,
          recommendations: recommendations,
        };
      } catch (err: unknown) {
        console.error(err);
        return reply
          .status(500)
          .send({ text: "Internal Server Error analyzing data." });
      }
    },
  );
}
