import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { WorkspaceManager } from "@business-os/workspace";
import { eq } from "drizzle-orm";
import { companyProfiles, workspaces } from "@business-os/workspace";
import OpenAI from "openai";

interface ExtractedCompanyIntel {
  name: string;
  industry: string;
  stage: string;
  description: string;
  valueProposition: string;
  targetAudience: string;
  businessModel: string;
  competitorNames: string[];
  competitorUrls: string[];
  healthMetrics: Record<string, number>;
}

const createAIClient = () => {
  const key = process.env.PRIMARY_AI_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL =
    process.env.PRIMARY_AI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.PRIMARY_AI_MODEL || "gpt-4o-mini";

  if (!key) return null;

  return {
    client: new OpenAI({ apiKey: key, baseURL, timeout: 15000 }),
    model,
  };
};

async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BusinessOS/1.0; +https://business-os.ai/bot)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract text content from HTML (basic extraction)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 15000); // Limit to ~15k chars for token efficiency

    return textContent;
  } catch (error) {
    console.error(`Failed to fetch website ${url}:`, error);
    throw new Error(
      `Could not fetch website: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

async function extractCompanyIntelligence(
  websiteContent: string,
  websiteUrl: string,
): Promise<ExtractedCompanyIntel> {
  const ai = createAIClient();

  const systemPrompt = `You are a business intelligence analyst. Analyze the website content and extract structured company intelligence. Return ONLY valid JSON matching the exact schema below. No markdown, no explanations.

{
  "name": "Company name (extracted from content)",
  "industry": "Primary industry (e.g., SaaS, FinTech, HealthTech, E-commerce, AI/ML, Developer Tools, Marketing Tech)",
  "stage": "Company stage (pre-seed, seed, series-a, growth, mature)",
  "description": "2-3 sentence company description",
  "valueProposition": "Core value prop in one sentence",
  "targetAudience": "Primary target customer/ICP description",
  "businessModel": "Business model (SaaS, E-commerce, Marketplace, Services, Content/Ads, Freemium, Enterprise)",
  "competitorNames": ["Competitor 1", "Competitor 2", "Competitor 3"],
  "competitorUrls": ["https://competitor1.com", "https://competitor2.com", "https://competitor3.com"],
  "healthMetrics": {
    "estimatedMonthlyTraffic": 0,
    "estimatedTeamSize": 0,
    "fundingStageScore": 0,
    "marketPositionScore": 0,
    "techSophisticationScore": 0
  }
}`;

  if (ai) {
    try {
      const response = await ai.client.chat.completions.create({
        model: ai.model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Website URL: ${websiteUrl}\n\nWebsite Content:\n${websiteContent}`,
          },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result as ExtractedCompanyIntel;
    } catch (error) {
      console.warn("AI extraction failed, using heuristic fallback:", error);
    }
  }

  // Heuristic fallback
  return heuristicExtraction(websiteContent, websiteUrl);
}

function heuristicExtraction(
  content: string,
  url: string,
): ExtractedCompanyIntel {
  const lowerContent = content.toLowerCase();

  // Extract company name from title or h1 patterns
  let name = "Unknown Company";
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    name = titleMatch[1].split("|")[0].split("-")[0].trim();
  }

  // Detect industry
  let industry = "Technology";
  if (
    lowerContent.includes("saas") ||
    lowerContent.includes("software as a service")
  )
    industry = "SaaS";
  else if (
    lowerContent.includes("fintech") ||
    lowerContent.includes("financial technology")
  )
    industry = "FinTech";
  else if (
    lowerContent.includes("healthtech") ||
    lowerContent.includes("health tech") ||
    lowerContent.includes("medical")
  )
    industry = "HealthTech";
  else if (
    lowerContent.includes("e-commerce") ||
    lowerContent.includes("ecommerce") ||
    lowerContent.includes("shopify")
  )
    industry = "E-commerce";
  else if (
    lowerContent.includes("ai") ||
    lowerContent.includes("artificial intelligence") ||
    lowerContent.includes("machine learning")
  )
    industry = "AI/ML";
  else if (
    lowerContent.includes("marketing") ||
    lowerContent.includes("seo") ||
    lowerContent.includes("analytics")
  )
    industry = "MarTech";
  else if (
    lowerContent.includes("developer") ||
    lowerContent.includes("api") ||
    lowerContent.includes("devtools")
  )
    industry = "Developer Tools";

  // Detect stage
  let stage = "seed";
  if (
    lowerContent.includes("series a") ||
    lowerContent.includes("series b") ||
    lowerContent.includes("series c")
  )
    stage = "growth";
  else if (
    lowerContent.includes("pre-seed") ||
    lowerContent.includes("pre seed") ||
    lowerContent.includes("just started")
  )
    stage = "pre-seed";
  else if (
    lowerContent.includes("enterprise") &&
    lowerContent.includes("customers")
  )
    stage = "growth";

  // Detect business model
  let businessModel = "SaaS";
  if (
    lowerContent.includes("marketplace") ||
    lowerContent.includes("platform connecting")
  )
    businessModel = "Marketplace";
  else if (
    lowerContent.includes("e-commerce") ||
    lowerContent.includes("shopify") ||
    lowerContent.includes("buy now")
  )
    businessModel = "E-commerce";
  else if (
    lowerContent.includes("agency") ||
    lowerContent.includes("consulting") ||
    lowerContent.includes("services")
  )
    businessModel = "Services";
  else if (
    lowerContent.includes("freemium") ||
    lowerContent.includes("free plan")
  )
    businessModel = "Freemium";
  else if (
    lowerContent.includes("enterprise") &&
    lowerContent.includes("contact sales")
  )
    businessModel = "Enterprise";

  return {
    name,
    industry,
    stage,
    description: `${name} operates in the ${industry} space.`,
    valueProposition:
      "Helping businesses achieve their goals through innovative solutions.",
    targetAudience: "Businesses and professionals seeking efficient solutions.",
    businessModel,
    competitorNames: [],
    competitorUrls: [],
    healthMetrics: {
      estimatedMonthlyTraffic: 0,
      estimatedTeamSize: 0,
      fundingStageScore: stage === "growth" ? 70 : stage === "seed" ? 40 : 20,
      marketPositionScore: 50,
      techSophisticationScore: 50,
    },
  };
}

export function registerCompanyRoutes(
  fastify: FastifyInstance,
  manager: WorkspaceManager,
) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // POST /api/company/analyze-website - Analyze website and extract company intelligence
  server.post(
    "/api/company/analyze-website",
    {
      schema: {
        body: z.object({
          website: z.string().url("Must be a valid URL"),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            intel: z.object({
              name: z.string(),
              industry: z.string(),
              stage: z.string(),
              description: z.string(),
              valueProposition: z.string(),
              targetAudience: z.string(),
              businessModel: z.string(),
              competitorNames: z.array(z.string()),
              competitorUrls: z.array(z.string()),
              healthMetrics: z.record(z.number()),
            }),
          }),
          400: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const db = manager.db;
      if (!db) {
        return reply
          .status(503)
          .send({ success: false, error: "Database offline" });
      }

      const { website } = request.body;
      const workspace = manager.active();
      if (!workspace) {
        return reply
          .status(400)
          .send({ success: false, error: "No active workspace" });
      }

      try {
        // Fetch website content
        const websiteContent = await fetchWebsiteContent(website);

        if (!websiteContent || websiteContent.length < 100) {
          return reply.status(400).send({
            success: false,
            error: "Could not extract meaningful content from website",
          });
        }

        // Extract intelligence using AI
        const intel = await extractCompanyIntelligence(websiteContent, website);

        return { success: true, intel };
      } catch (error: any) {
        console.error("Website analysis error:", error);
        return reply.status(400).send({
          success: false,
          error: error.message || "Failed to analyze website",
        });
      }
    },
  );

  // POST /api/company/profile - Save company profile to workspace
  server.post(
    "/api/company/profile",
    {
      schema: {
        body: z.object({
          name: z.string().min(1),
          website: z.string().url().optional().nullable(),
          industry: z.string().optional(),
          stage: z.string().optional(),
          description: z.string().optional(),
          valueProposition: z.string().optional(),
          targetAudience: z.string().optional(),
          businessModel: z.string().optional(),
          competitorNames: z.array(z.string()).optional(),
          competitorUrls: z.array(z.string()).optional(),
          healthMetrics: z.record(z.number()).optional(),
        }),
        response: {
          200: z.object({ success: z.boolean(), profile: z.any() }),
          400: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const db = manager.db;
      if (!db) {
        return reply
          .status(503)
          .send({ success: false, error: "Database offline" });
      }

      const workspace = manager.active();
      if (!workspace) {
        return reply
          .status(400)
          .send({ success: false, error: "No active workspace" });
      }

      const tenantContext = (request as any).tenantContext;
      const workspaceId = tenantContext?.activeWorkspaceId;

      if (!workspaceId) {
        return reply
          .status(400)
          .send({ success: false, error: "Workspace context not found" });
      }

      const now = new Date().toISOString();
      const profileData = {
        id: crypto.randomUUID(),
        workspaceId,
        name: request.body.name,
        website: request.body.website || null,
        industry: request.body.industry || null,
        stage: request.body.stage || null,
        description: request.body.description || null,
        valueProposition: request.body.valueProposition || null,
        targetAudience: request.body.targetAudience || null,
        businessModel: request.body.businessModel || null,
        competitorNames: request.body.competitorNames || [],
        competitorUrls: request.body.competitorUrls || [],
        healthMetrics: request.body.healthMetrics || {},
        extractedAt: now,
        createdAt: now,
        updatedAt: now,
      };

      try {
        // Upsert company profile
        await db
          .insert(companyProfiles)
          .values(profileData)
          .onConflictDoUpdate({
            target: companyProfiles.workspaceId,
            set: {
              ...profileData,
              updatedAt: now,
            },
          });

        return { success: true, profile: profileData };
      } catch (error: any) {
        console.error("Save company profile error:", error);
        return reply.status(400).send({ success: false, error: error.message });
      }
    },
  );

  // GET /api/company/profile - Get company profile for active workspace
  server.get(
    "/api/company/profile",
    {
      schema: {
        response: {
          200: z.object({
            success: z.boolean(),
            profile: z.any().nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      const db = manager.db;
      if (!db) {
        return { success: false, profile: null };
      }

      const tenantContext = (request as any).tenantContext;
      const workspaceId = tenantContext?.activeWorkspaceId;

      if (!workspaceId) {
        return { success: false, profile: null };
      }

      try {
        const profiles = await db
          .select()
          .from(companyProfiles)
          .where(eq(companyProfiles.workspaceId, workspaceId))
          .limit(1);
        return { success: true, profile: profiles[0] || null };
      } catch (error) {
        console.error("Get company profile error:", error);
        return { success: false, profile: null };
      }
    },
  );
}
