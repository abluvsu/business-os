import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { WorkspaceManager } from "@business-os/workspace";

export function registerWorkspaceRoutes(fastify: FastifyInstance, manager: WorkspaceManager) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET active workspace
  server.get("/api/workspace/active", {
    schema: {
      response: {
        200: z.object({
          active: z.boolean(),
          workspace: z.object({
            path: z.string(),
            name: z.string(),
            version: z.number(),
            owner: z.string(),
            databasePath: z.string(),
            status: z.string(),
          }).nullable(),
        }),
      },
    },
  }, async (request, reply) => {
    const ws = manager.getActiveWorkspace();
    return {
      active: !!ws,
      workspace: ws,
    };
  });

  // GET recent workspaces
  server.get("/api/workspace/recent", {
    schema: {
      response: {
        200: z.array(
          z.object({
            name: z.string(),
            path: z.string(),
            lastOpened: z.string(),
          })
        ),
      },
    },
  }, async () => {
    return manager.getRecentWorkspaces();
  });

  // POST open workspace
  server.post("/api/workspace/open", {
    schema: {
      body: z.object({
        path: z.string().min(1),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          workspace: z.object({
            path: z.string(),
            name: z.string(),
            version: z.number(),
            owner: z.string(),
            status: z.string(),
          }),
        }),
        400: z.object({
          success: z.literal(false),
          error: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    const { path: wsPath } = request.body;
    try {
      const ws = manager.openWorkspace(wsPath);
      return {
        success: true as const,
        workspace: {
          path: ws.path,
          name: ws.name,
          version: ws.version,
          owner: ws.owner,
          status: ws.status,
        },
      };
    } catch (err: any) {
      reply.status(400);
      return {
        success: false as const,
        error: err.message || "Failed to open workspace",
      };
    }
  });

  // POST create workspace
  server.post("/api/workspace/create", {
    schema: {
      body: z.object({
        path: z.string().min(1),
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
            status: z.string(),
          }),
        }),
        400: z.object({
          success: z.literal(false),
          error: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    const { path: wsPath, name, owner } = request.body;
    try {
      const ws = await manager.createWorkspace(wsPath, name, owner);
      return {
        success: true as const,
        workspace: {
          path: ws.path,
          name: ws.name,
          version: ws.version,
          owner: ws.owner,
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
  });

  // POST close workspace
  server.post("/api/workspace/close", {
    schema: {
      response: {
        200: z.object({
          success: z.boolean(),
        }),
      },
    },
  }, async () => {
    manager.closeWorkspace();
    return { success: true };
  });
}
