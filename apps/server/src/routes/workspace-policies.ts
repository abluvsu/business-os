import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import crypto from "crypto";
import {
  WorkspaceManager,
  WorkspacePolicyRepository,
  WorkspacePolicyService,
} from "@business-os/workspace";

export function registerWorkspacePolicyRoutes(
  fastify: FastifyInstance,
  manager: WorkspaceManager,
) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  const getPolicyService = (request: any) => {
    const db = manager.db;
    if (!db) throw new Error("Database offline");
    const tenantContext = request.tenantContext;
    if (!tenantContext || !tenantContext.activeWorkspaceId) {
      throw new Error("No active workspace context");
    }
    const repo = new WorkspacePolicyRepository(db, tenantContext);
    return new WorkspacePolicyService(repo);
  };

  const policySchema = z.object({
    id: z.string(),
    workspaceId: z.string(),
    type: z.enum([
      "BRAND",
      "CONTENT",
      "COMPLIANCE",
      "MARKETING",
      "LEGAL",
      "STYLE",
      "CUSTOM",
    ]),
    category: z.string(),
    title: z.string(),
    rule: z.string(),
    description: z.string().nullable(),
    severity: z.enum(["INFO", "WARNING", "ERROR", "BLOCKING"]),
    enabled: z.boolean(),
    metadata: z.record(z.unknown()).nullable(),
    version: z.number(),
    createdBy: z.enum(["SYSTEM", "FOUNDER", "AI"]),
    createdAt: z.string(),
    updatedAt: z.string(),
  });

  const errorSchema = z.object({
    success: z.literal(false),
    error: z.string(),
  });

  server.get(
    "/api/workspace/policies",
    {
      schema: {
        response: {
          200: z.object({
            success: z.literal(true),
            policies: z.array(policySchema),
          }),
          400: errorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const service = getPolicyService(request);
        const policies = await service.getPolicies();
        return { success: true as const, policies };
      } catch (err: any) {
        return reply
          .status(400)
          .send({ success: false as const, error: err.message });
      }
    },
  );

  server.post(
    "/api/workspace/policies",
    {
      schema: {
        body: z.object({
          type: z.enum([
            "BRAND",
            "CONTENT",
            "COMPLIANCE",
            "MARKETING",
            "LEGAL",
            "STYLE",
            "CUSTOM",
          ]),
          category: z.string(),
          title: z.string(),
          rule: z.string(),
          description: z.string().nullable().optional(),
          severity: z.enum(["INFO", "WARNING", "ERROR", "BLOCKING"]),
          enabled: z.boolean().optional(),
          metadata: z.record(z.unknown()).nullable().optional(),
          createdBy: z.enum(["SYSTEM", "FOUNDER", "AI"]).optional(),
        }),
        response: {
          200: z.object({
            success: z.literal(true),
            policy: policySchema,
          }),
          400: errorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const service = getPolicyService(request);
        const {
          type,
          category,
          title,
          rule,
          description,
          severity,
          enabled,
          metadata,
          createdBy,
        } = request.body;

        const policy = await service.createPolicy({
          id: crypto.randomUUID(),
          type,
          category,
          title,
          rule,
          description: description || null,
          severity,
          enabled: enabled !== undefined ? enabled : true,
          metadata: metadata || null,
          createdBy: createdBy || "FOUNDER",
        });

        return { success: true as const, policy };
      } catch (err: any) {
        return reply
          .status(400)
          .send({ success: false as const, error: err.message });
      }
    },
  );

  server.patch(
    "/api/workspace/policies/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: z.object({
          type: z
            .enum([
              "BRAND",
              "CONTENT",
              "COMPLIANCE",
              "MARKETING",
              "LEGAL",
              "STYLE",
              "CUSTOM",
            ])
            .optional(),
          category: z.string().optional(),
          title: z.string().optional(),
          rule: z.string().optional(),
          description: z.string().nullable().optional(),
          severity: z.enum(["INFO", "WARNING", "ERROR", "BLOCKING"]).optional(),
          metadata: z.record(z.unknown()).nullable().optional(),
          clientVersion: z.number().optional(),
        }),
        response: {
          200: z.object({
            success: z.literal(true),
            policy: policySchema,
          }),
          400: errorSchema,
          409: errorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const service = getPolicyService(request);
        const { id } = request.params;
        const { clientVersion, ...updates } = request.body;

        const policy = await service.updatePolicy(id, updates, clientVersion);
        return { success: true as const, policy };
      } catch (err: any) {
        if (err.message.includes("Conflict")) {
          return reply
            .status(409)
            .send({ success: false as const, error: err.message });
        }
        return reply
          .status(400)
          .send({ success: false as const, error: err.message });
      }
    },
  );

  server.delete(
    "/api/workspace/policies/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          200: z.object({
            success: z.literal(true),
          }),
          400: errorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const service = getPolicyService(request);
        const { id } = request.params;
        await service.deletePolicy(id);
        return { success: true as const };
      } catch (err: any) {
        return reply
          .status(400)
          .send({ success: false as const, error: err.message });
      }
    },
  );

  server.post(
    "/api/workspace/policies/:id/toggle",
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: z.object({ enabled: z.boolean() }),
        response: {
          200: z.object({
            success: z.literal(true),
            policy: policySchema,
          }),
          400: errorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const service = getPolicyService(request);
        const { id } = request.params;
        const { enabled } = request.body;
        const policy = await service.togglePolicy(id, enabled);
        return { success: true as const, policy };
      } catch (err: any) {
        return reply
          .status(400)
          .send({ success: false as const, error: err.message });
      }
    },
  );
}
