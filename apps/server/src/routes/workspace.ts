import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  WorkspaceManager,
  businessEntities,
  observations,
} from "@business-os/workspace";

export function registerWorkspaceRoutes(
  fastify: FastifyInstance,
  manager: WorkspaceManager,
) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET active workspace
  server.get(
    "/api/workspace/active",
    {
      schema: {
        response: {
          200: z.object({
            active: z.boolean(),
            workspace: z
              .object({
                path: z.string(),
                name: z.string(),
                version: z.number(),
                owner: z.string(),
                databasePath: z.string(),
                schemaVersion: z.string(),
                status: z.string(),
              })
              .nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      const ws = manager.active();
      return {
        active: !!ws,
        workspace: ws,
      };
    },
  );

  // GET recent workspaces
  server.get(
    "/api/workspace/recent",
    {
      schema: {
        response: {
          200: z.array(
            z.object({
              name: z.string(),
              path: z.string(),
              lastOpened: z.string(),
            }),
          ),
        },
      },
    },
    async () => {
      return manager.recent();
    },
  );

  // POST open workspace
  server.post(
    "/api/workspace/open",
    {
      schema: {
        body: z.object({
          path: z.string().min(1),
          force: z.boolean().default(false),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            workspace: z.object({
              path: z.string(),
              name: z.string(),
              version: z.number(),
              owner: z.string(),
              schemaVersion: z.string(),
              status: z.string(),
            }),
          }),
          400: z.object({
            success: z.literal(false),
            error: z.string(),
            crashed: z.boolean().optional(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { path: wsPath, force } = request.body;
      try {
        const ws = manager.open(wsPath, force);
        return {
          success: true as const,
          workspace: {
            path: ws.path,
            name: ws.name,
            version: ws.version,
            owner: ws.owner,
            schemaVersion: ws.schemaVersion,
            status: ws.status,
          },
        };
      } catch (err: any) {
        reply.status(400);

        // Check if it's a crashed session lock to prompt recovery in UI
        const val = manager.validate(wsPath);
        const isCrashed = val.lockStatus === "crashed";

        return {
          success: false as const,
          error: err.message || "Failed to open workspace",
          crashed: isCrashed,
        };
      }
    },
  );

// POST create workspace
  server.post(
    "/api/workspace/create",
    {
      schema: {
        body: z.object({
          path: z.string().optional(),
          name: z.string().min(1),
          owner: z.string().min(1),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            workspace: z.object({
              path: z.string(),
              name: z.string(),
              version: z.number(),
              owner: z.string(),
              schemaVersion: z.string(),
              status: z.string(),
            }),
          }),
          400: z.object({
            success: z.literal(false),
            error: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { path: wsPath, name, owner } = request.body;
      try {
        const ws = await manager.create(name, owner, wsPath);
        return {
          success: true as const,
          workspace: {
            path: ws.path,
            name: ws.name,
            version: ws.version,
            owner: ws.owner,
            schemaVersion: ws.schemaVersion,
            status: ws.status,
          },
        };
      } catch (err: any) {
        reply.status(400);
        return {
          success: false as const,
          error: err.message || "Failed to create workspace",
        };
      }
    },
  );

  // POST close workspace
  server.post(
    "/api/workspace/close",
    {
      schema: {
        response: {
          200: z.object({
            success: z.boolean(),
          }),
        },
      },
    },
    async () => {
      manager.close();
      return { success: true as const };
    },
  );

  server.get("/api/dev/entities", async (request, reply) => {
    if (!request.repo) return { success: false, error: "offline" };
    const entities = await request.repo.getBusinessEntities();
    const metrics = await request.repo.getObservations();
    return { entities, metrics };
  });

  server.post("/api/dev/clean-mock", async (request, reply) => {
    const db = manager.db;
    if (!db) return { success: false, error: "offline" };

    const { like, or } = require("drizzle-orm");

    await db
      .delete(observations)
      .where(
        or(
          like(observations.entityId, "ent-gm-t%"),
          like(observations.entityId, "ent-ig-%"),
          like(observations.entityId, "ent-ad-%"),
        ),
      );

    await db
      .delete(businessEntities)
      .where(
        or(
          like(businessEntities.id, "ent-gm-t%"),
          like(businessEntities.id, "ent-ig-%"),
          like(businessEntities.id, "ent-ad-%"),
        ),
      );

    return { success: true, message: "Mock data purged." };
  });
}
