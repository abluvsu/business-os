import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { WorkspaceManager, analyticsEvents } from "@business-os/workspace";

// -----------------------------------------------------------------------------
// Priority 2: Product Analytics Layer (Founder Dogfooding)
// BusinessOS analyzing itself to reduce TTFI and identify friction points.
// -----------------------------------------------------------------------------

export function registerAnalyticsRoutes(
  fastify: FastifyInstance,
  manager: WorkspaceManager,
) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // POST ingest event
  server.post(
    "/api/analytics/event",
    {
      schema: {
        body: z.object({
          sessionId: z.string(),
          eventName: z.string(),
          category: z.string(), // "Acquisition", "Activation", "Engagement", "Retention", "Friction"
          properties: z.record(z.any()).optional(),
        }),
        response: {
          202: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      const db = manager.db;
      if (!db) {
        // If DB is offline, we silently drop events (MVP tradeoff) to avoid blocking the user
        return reply.status(202).send({ success: true });
      }

      const { sessionId, eventName, category, properties } = request.body;

      try {
        await db.insert(analyticsEvents).values({
          id: `evt-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          sessionId,
          eventName,
          category,
          properties: properties ? JSON.stringify(properties) : null,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to ingest analytics event:", err);
      }

      return reply.status(202).send({ success: true });
    },
  );

  // GET Product Health Dashboard
  server.get(
    "/api/analytics/health",
    {
      schema: {
        response: {
          200: z.object({
            acquisition: z.object({ totalSessions: z.number() }),
            activation: z.object({
              workspacesCreated: z.number(),
              instasConnected: z.number(),
            }),
            engagement: z.object({ totalQuestions: z.number() }),
            friction: z.object({
              mostAbandoned: z.string().nullable(),
              abandonReason: z.string().nullable(),
            }),
            ttfi: z.object({ averageSeconds: z.number().nullable() }),
          }),
        },
      },
    },
    async (request, reply) => {
      const db = manager.db;
      if (!db) {
        return {
          acquisition: { totalSessions: 0 },
          activation: { workspacesCreated: 0, instasConnected: 0 },
          engagement: { totalQuestions: 0 },
          friction: { mostAbandoned: null, abandonReason: null },
          ttfi: { averageSeconds: null },
        };
      }

      try {
        const events = await db.select().from(analyticsEvents);

        const totalSessions = new Set(
          events.map((e: { sessionId: string }) => e.sessionId),
        ).size;
        const workspacesCreated = events.filter(
          (e: { eventName: string }) => e.eventName === "Workspace Created",
        ).length;
        const instasConnected = events.filter(
          (e: { eventName: string }) => e.eventName === "Instagram Connected",
        ).length;
        const totalQuestions = events.filter(
          (e: { eventName: string }) => e.eventName === "Question Asked",
        ).length;

        // Calculate Average Time To First Insight (TTFI)
        let totalTTFI = 0;
        let ttfiCount = 0;

        const sessions = Array.from(
          new Set(events.map((e: { sessionId: string }) => e.sessionId)),
        );
        for (const session of sessions) {
          const sessionEvents = events
            .filter((e: { sessionId: string }) => e.sessionId === session)
            .sort((a: { createdAt: string }, b: { createdAt: string }) =>
              a.createdAt.localeCompare(b.createdAt),
            );
          const start = sessionEvents.find(
            (e: { eventName: string }) => e.eventName === "Application Opened",
          );
          const insight = sessionEvents.find(
            (e: { eventName: string }) => e.eventName === "Insight Generated",
          );

          if (start && insight) {
            const durationSecs =
              (new Date(insight.createdAt).getTime() -
                new Date(start.createdAt).getTime()) /
              1000;
            totalTTFI += durationSecs;
            ttfiCount++;
          }
        }

        return {
          acquisition: { totalSessions },
          activation: { workspacesCreated, instasConnected },
          engagement: { totalQuestions },
          friction: {
            mostAbandoned: "Connectors Setup", // Mocked for MVP demo until we have more robust querying
            abandonReason:
              "Wait between authentication and first insight exceeds 15 seconds.",
          },
          ttfi: {
            averageSeconds: ttfiCount > 0 ? totalTTFI / ttfiCount : null,
          },
        };
      } catch (err) {
        return {
          acquisition: { totalSessions: 0 },
          activation: { workspacesCreated: 0, instasConnected: 0 },
          engagement: { totalQuestions: 0 },
          friction: { mostAbandoned: null, abandonReason: null },
          ttfi: { averageSeconds: null },
        };
      }
    },
  );
}
