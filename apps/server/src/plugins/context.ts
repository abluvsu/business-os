import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { TenantContext, TenantRepository, WorkspaceManager } from "@business-os/workspace";

// Extend Fastify's interface definitions to include tenant context and repository
declare module "fastify" {
  interface FastifyRequest {
    tenantContext?: TenantContext;
    repo?: TenantRepository;
  }
}

interface ContextPluginOptions {
  manager: WorkspaceManager;
}

const contextPlugin: FastifyPluginAsync<ContextPluginOptions> = async (fastify, options) => {
  fastify.decorateRequest("tenantContext", undefined);
  fastify.decorateRequest("repo", undefined);

  fastify.addHook("preHandler", async (request, reply) => {
    // 1. Skip checks for non-API, health check, event stream, or workspace metadata routes
    if (
      !request.url.startsWith("/api/") ||
      request.url.startsWith("/api/workspace/") || // Workspace container ops (create/open/list) are global
      request.url === "/api/events"
    ) {
      return;
    }

    // 2. Resolve parameters from incoming headers (Identity & Tenancy)
    const userId = request.headers["x-user-id"] as string;
    const organizationId = request.headers["x-organization-id"] as string;
    const activeWorkspaceId = request.headers["x-workspace-id"] as string;
    const role = (request.headers["x-role"] as string) || "owner";

    // 3. Guard tenant-scoped API routes
    if (!userId || !organizationId || !activeWorkspaceId) {
      return reply.status(401).send({
        success: false,
        error: "Unauthorized: Request requires identity and tenant context headers (x-user-id, x-organization-id, x-workspace-id)."
      });
    }

    // 4. Validate roles
    if (role !== "owner" && role !== "admin" && role !== "member" && role !== "read_only") {
      return reply.status(403).send({
        success: false,
        error: "Forbidden: Invalid organization membership role specified."
      });
    }

    const context: TenantContext = {
      userId,
      organizationId,
      activeWorkspaceId,
      role
    };

    // 5. Attach resolved Tenant Context and pre-scoped repository
    const db = options.manager.db;
    if (!db) {
      return reply.status(503).send({
        success: false,
        error: "Service Unavailable: Database connection is not established."
      });
    }

    request.tenantContext = context;
    request.repo = new TenantRepository(db, context);
  });
};

export default fp(contextPlugin);
