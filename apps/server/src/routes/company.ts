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

async function fetchWebsiteContent(url: string): Promise<{ html: string; textContent: string }> {
  const MAX_RETRIES = 2;
  const TIMEOUT_MS = 15000;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
        },
        signal: controller.signal,
        redirect: "follow",
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Don't retry client errors (4xx) except 429 (rate limit)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new Error(
            `Website returned HTTP ${response.status}. The site may be blocking automated access.`,
          );
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Extract text content from HTML (basic extraction)
      const textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, " ")
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 15000); // Limit to ~15k chars for token efficiency

      return { html, textContent };
    } catch (error) {
      const isAbort =
        error instanceof Error && error.name === "AbortError";
      const isTransient =
        error instanceof Error &&
        (error.message.includes("HTTP 5") ||
          error.message.includes("HTTP 429") ||
          error.message.includes("ECONNRESET") ||
          error.message.includes("ETIMEDOUT") ||
          error.message.includes("fetch failed") ||
          isAbort);

      if (isTransient && attempt < MAX_RETRIES) {
        const delay = (attempt + 1) * 1500;
        console.warn(
          `⚠️ [Website Fetch] Attempt ${attempt + 1} failed for ${url}, retrying in ${delay}ms...`,
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      console.error(`Failed to fetch website ${url}:`, error);

      if (isAbort) {
        throw new Error(
          "Website took too long to respond. It may be down or blocking automated requests.",
        );
      }

      throw new Error(
        `Could not fetch website: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // Should never reach here, but TypeScript requires it
  throw new Error("Could not fetch website after multiple attempts.");
}

function calculateSeoHealth(html: string): number {
  let score = 0;
  
  // 1. Title tag presence and length (optimal length: 10-60 chars)
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch && titleMatch[1].trim().length > 0) {
    const titleLen = titleMatch[1].trim().length;
    score += (titleLen >= 10 && titleLen <= 60) ? 20 : 10;
  }
  
  // 2. Meta description presence and length (optimal length: 50-160 chars)
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([\s\S]*?)["']/i) ||
                    html.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]*name=["']description["']/i);
  if (descMatch && descMatch[1].trim().length > 0) {
    const descLen = descMatch[1].trim().length;
    score += (descLen >= 50 && descLen <= 160) ? 20 : 10;
  }
  
  // 3. Viewport tag presence
  if (/<meta[^>]+name=["']viewport["']/i.test(html)) {
    score += 15;
  }
  
  // 4. Canonical link tag
  if (/<link[^>]+rel=["']canonical["']/i.test(html)) {
    score += 15;
  }
  
  // 5. Structure: Heading tags (presence of H1 and H2)
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
  if (h1Count === 1) {
    score += 15; // Optimal: exactly one H1
  } else if (h1Count > 1) {
    score += 8;
  }
  
  if (/<h2[^>]*>/i.test(html)) {
    score += 15;
  }
  
  return Math.min(score, 100);
}

function calculateGeoHealth(html: string, textContent: string): number {
  let score = 0;
  const lowerContent = textContent.toLowerCase();
  
  // 1. Structured Data: JSON-LD presence
  if (/<script[^>]+type=["']application\/ld\+json["']/i.test(html)) {
    score += 25;
  }
  
  // 2. Brand Facts / Specifications (AEO-friendly clear listing of specifications)
  const brandKeywords = ["compatibility", "supports", "operating system", "license", "pricing", "pricing plan", "open source", "mit license"];
  let brandMatches = 0;
  brandKeywords.forEach(k => {
    if (lowerContent.includes(k)) brandMatches++;
  });
  score += Math.min(brandMatches * 4, 25);
  
  // 3. Q&A / FAQ presence (highly targeted by search/answering engines)
  const faqKeywords = ["faq", "frequently asked questions", "q&a", "what is", "how do i", "how to", "is it free"];
  let faqMatches = 0;
  faqKeywords.forEach(k => {
    if (lowerContent.includes(k)) faqMatches++;
  });
  score += Math.min(faqMatches * 5, 25);
  
  // 4. AI Crawler Access rules & sitemaps (standard robot.txt allows crawlers)
  const robotsIndex = !/content=["']noindex["']/i.test(html);
  if (robotsIndex) {
    score += 25;
  }
  
  return Math.min(score, 100);
}

async function extractCompanyIntelligence(
  websiteContent: string,
  websiteUrl: string,
  html: string,
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

      const parsed = JSON.parse(response.choices[0].message.content || "{}");
      const result: ExtractedCompanyIntel = {
        name: parsed.name || "Unknown Company",
        industry: parsed.industry || "Technology",
        stage: parsed.stage || "seed",
        description: parsed.description || "No description available.",
        valueProposition:
          parsed.valueProposition || "No value proposition available.",
        targetAudience: parsed.targetAudience || "General audience.",
        businessModel: parsed.businessModel || "SaaS",
        competitorNames: Array.isArray(parsed.competitorNames)
          ? parsed.competitorNames
          : [],
        competitorUrls: Array.isArray(parsed.competitorUrls)
          ? parsed.competitorUrls
          : [],
        healthMetrics: {
          estimatedMonthlyTraffic:
            Number(parsed.healthMetrics?.estimatedMonthlyTraffic) || 0,
          estimatedTeamSize:
            Number(parsed.healthMetrics?.estimatedTeamSize) || 0,
          fundingStageScore:
            Number(parsed.healthMetrics?.fundingStageScore) || 50,
          marketPositionScore:
            Number(parsed.healthMetrics?.marketPositionScore) || 50,
          techSophisticationScore:
            Number(parsed.healthMetrics?.techSophisticationScore) || 50,
          seoHealth: calculateSeoHealth(html),
          geoHealth: calculateGeoHealth(html, websiteContent),
        },
      };
      return result;
    } catch (error) {
      console.warn("AI extraction failed, using heuristic fallback:", error);
    }
  }

  // Heuristic fallback
  return heuristicExtraction(websiteContent, websiteUrl, html);
}

function heuristicExtraction(
  content: string,
  url: string,
  html: string,
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
      seoHealth: calculateSeoHealth(html),
      geoHealth: calculateGeoHealth(html, content),
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
          website: z.string().min(1, "Website URL is required"),
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

      let { website } = request.body;
      website = website.trim();
      if (!/^https?:\/\//i.test(website)) {
        website = `https://${website}`;
      }
      const workspace = manager.active();
      const hasWorkspace =
        workspace || request.tenantContext?.activeWorkspaceId;
      if (!hasWorkspace) {
        return reply
          .status(400)
          .send({ success: false, error: "No active workspace" });
      }

      try {
        // Fetch website content
        const { html, textContent } = await fetchWebsiteContent(website);

        if (!textContent || textContent.length < 100) {
          return reply.status(400).send({
            success: false,
            error: "Could not extract meaningful content from website",
          });
        }

        // Extract intelligence using AI
        const intel = await extractCompanyIntelligence(textContent, website, html);

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
      const hasWorkspace =
        workspace || request.tenantContext?.activeWorkspaceId;
      if (!hasWorkspace) {
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
