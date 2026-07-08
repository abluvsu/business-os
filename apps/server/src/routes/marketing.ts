import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

const MOCK_CAMPAIGNS = [
  { id: "c1", name: "Summer Instagram Promo", platform: "Instagram", reach: 12500, clicks: 725, ctr: 5.8, conversions: 82, spend: 350, status: "active" },
  { id: "c2", name: "Google Search Ads", platform: "Google Ads", reach: 8900, clicks: 374, ctr: 4.2, conversions: 45, spend: 400, status: "active" },
  { id: "c3", name: "Insta Product Launch", platform: "Instagram", reach: 15000, clicks: 525, ctr: 3.5, conversions: 24, spend: 200, status: "completed" },
  { id: "c4", name: "Google Display Ads", platform: "Google Ads", reach: 6000, clicks: 90, ctr: 1.5, conversions: 6, spend: 120, status: "paused" },
  { id: "c5", name: "Insta Brand Story", platform: "Instagram", reach: 4500, clicks: 126, ctr: 2.8, conversions: 8, spend: 80, status: "active" }
];

export function registerMarketingRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET campaigns list
  server.get("/api/campaigns", {
    schema: {
      response: {
        200: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            platform: z.string(),
            reach: z.number(),
            clicks: z.number(),
            ctr: z.number(),
            conversions: z.number(),
            spend: z.number(),
            status: z.string(),
          })
        ),
      },
    },
  }, async () => {
    return MOCK_CAMPAIGNS;
  });

  // GET connectors status
  server.get("/api/connectors/status", {
    schema: {
      response: {
        200: z.object({
          instagram: z.object({ connected: z.boolean(), lastSync: z.string().nullable() }),
          gmail: z.object({ connected: z.boolean(), lastSync: z.string().nullable() }),
          googleAds: z.object({ connected: z.boolean(), lastSync: z.string().nullable() }),
          website: z.object({ connected: z.boolean(), lastSync: z.string().nullable() }),
        }),
      },
    },
  }, async () => {
    return {
      instagram: { connected: true, lastSync: new Date().toISOString() },
      gmail: { connected: false, lastSync: null },
      googleAds: { connected: false, lastSync: null },
      website: { connected: false, lastSync: null }
    };
  });

  // POST chat message parsing
  server.post("/api/chat", {
    schema: {
      body: z.object({
        message: z.string(),
      }),
      response: {
        200: z.object({
          text: z.string(),
          chart: z.object({
            title: z.string(),
            type: z.string(),
            categories: z.array(z.string()),
            series: z.array(
              z.object({
                name: z.string(),
                data: z.array(z.number()),
              })
            ),
          }).nullable(),
          recommendations: z.array(z.string()),
        }),
      },
    },
  }, async (request) => {
    const { message } = request.body;
    const cleanMsg = message.toLowerCase().trim();

    if (cleanMsg.includes("campaign") || cleanMsg.includes("last 5") || cleanMsg.includes("ctr")) {
      return {
        text: `Here is the performance analysis of your last 5 marketing campaigns across active social and search ad channels. 

The **Summer Instagram Promo** is currently your best-performing channel, achieving a stellar **5.8% CTR** and delivering **82 conversions** on a modest $350 spend. 

Conversely, the **Google Display Ads** campaigns are heavily underperforming, yielding only a **1.5% CTR** and 6 conversions. Total spend across all channels is **$1,150** with **165 total conversions** generated.`,
        chart: {
          title: "Last 5 Campaigns CTR (%)",
          type: "bar",
          categories: MOCK_CAMPAIGNS.map(c => c.name),
          series: [
            {
              name: "CTR %",
              data: MOCK_CAMPAIGNS.map(c => c.ctr)
            }
          ]
        },
        recommendations: [
          "⭐⭐⭐⭐⭐ Allocate 50% more budget to 'Summer Instagram Promo' as it currently delivers the highest conversion volume and efficiency.",
          "⚠️ Pause 'Google Display Ads' immediately. The current CTR (1.5%) is below threshold limits and is wasting ad spend.",
          "💡 Refresh ad copy and visuals on the 'Insta Brand Story' campaign to push it from 2.8% CTR to our 4% benchmark."
        ]
      };
    }

    return {
      text: "Hello! I am your Business OS AI assistant. I have connected to your active Instagram account and synced the campaign logs. Try asking me: **'How are my last 5 campaigns?'** and I will compile a metric analysis report and chart for you.",
      chart: null,
      recommendations: []
    };
  });
}
