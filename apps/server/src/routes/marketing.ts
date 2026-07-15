import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  WorkspaceManager,
  observations,
  businessEntities,
  companyProfiles,
  WorkspaceContextBuilder,
  WorkspaceContextCache,
  WorkspacePromptFormatter,
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
        const tenantContext = (request as any).tenantContext;
        const workspaceId = tenantContext?.activeWorkspaceId;

        const entities = await request.repo!.getBusinessEntities();
        const metrics = await request.repo!.getObservations();

        let workspaceContext = null;
        let formattedWorkspaceContext = "";
        if (workspaceId) {
          workspaceContext = WorkspaceContextCache.get(workspaceId);
          if (!workspaceContext) {
            const builder = new WorkspaceContextBuilder(db, tenantContext);
            workspaceContext = await builder.build();
            WorkspaceContextCache.set(workspaceId, workspaceContext);
          }
          formattedWorkspaceContext = WorkspacePromptFormatter.format(workspaceContext);
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

        const isDogfood = process.env.DOGFOOD_MODE === "true";

        const systemPrompt = `You are BusinessOS, an expert marketing analyst.
Here is the current performance context from the SQLite database:
${formattedWorkspaceContext}

Provide a 2-3 sentence analysis of the data focusing on the user's question.

CRITICAL DOGFOODING RULES:
1. You must be strictly truthful and evidence-backed. Mention the specific data sources (e.g. organic Instagram posts, Gmail thread count) and date coverage if known.
2. If there is insufficient data, missing integrations, or uncertainty, explicitly state the limitations and say what is missing rather than inventing or pretending.
3. Never issue paid-ad, budget reallocation, or ROAS recommendations (e.g. pausing ad sets) unless there is active, non-zero spend or paid ad data present in the database context. If you only see organic posts or email activity, focus recommendations strictly on organic engagement or email management.
4. You MUST output exactly 2 recommendations at the end, each on a new line starting with a dash (e.g. "- Recommendation text"). Do not use any other bullet characters or numbers.`;

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
          if (isDogfood) {
            aiText = "I was unable to analyze your data because the AI providers are currently offline or unavailable. Please check your network connection and configuration key in apps/server/.env.";
            recommendations = [
              "Verify PRIMARY_AI_API_KEY is correct and active.",
              "Ensure your internet connection is active."
            ];
          } else {
            aiText = `Based on your data, ${campaigns[0]?.name || "your top campaign"} is generating the most clicks relative to spend. (Note: This is a local fallback response because all AI providers are currently unavailable.)`;
            recommendations = [
              "Reallocate 15% budget to the best performing campaign.",
              "Pause underperforming ad sets to improve ROAS.",
            ];
          }
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
