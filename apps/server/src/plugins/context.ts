import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { eq } from "drizzle-orm";
import * as crypto from "crypto";
import {
  TenantContext,
  TenantRepository,
  WorkspaceManager,
  users,
  organizations,
  memberships,
  workspaces
} from "@business-os/workspace";

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

  // Initialize Clerk Client if credentials are provided in env
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  const clerk = clerkSecretKey ? createClerkClient({ secretKey: clerkSecretKey }) : null;

  if (clerk) {
    console.log("🔒 [Auth] Clerk Managed Identity Provider activated (SaaS Mode).");
  } else {
    console.log("⚠️ [Auth] Clerk credentials missing. Running in Mock Fallback Mode (Local Dev/Tests).");
  }

  fastify.addHook("preHandler", async (request, reply) => {
    // 1. Skip checks for non-API, health checks, or events
    if (
      !request.url.startsWith("/api/") ||
      request.url === "/api/events"
    ) {
      return;
    }

    const db = options.manager.db;
    if (!db) {
      return reply.status(503).send({
        success: false,
        error: "Service Unavailable: Database connection is not established."
      });
    }

    let tenantContext: TenantContext | null = null;

    if (clerk) {
      // ========================================================
      // A. CLERK AUTHENTICATED SaaS MODE (Production Identity Proof)
      // ========================================================
      const authHeader = request.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.status(401).send({
          success: false,
          error: "Unauthorized: Missing Bearer Token in Authorization header."
        });
      }

      const token = authHeader.split(" ")[1];

      try {
        // Validate Clerk JWT
        const verifiedToken = await verifyToken(token, {
          secretKey: clerkSecretKey
        });
        const clerkUserId = verifiedToken.sub;
        
        // Resolve user record from local database
        let userRows = await db
          .select()
          .from(users)
          .where(eq(users.clerkUserId, clerkUserId))
          .limit(1);

        let userId: string;
        let organizationId: string;
        let activeWorkspaceId: string;

        if (userRows.length === 0) {
          // AUTO-PROVISIONING: First-time sign-in of this authenticated user
          userId = crypto.randomUUID();
          organizationId = crypto.randomUUID();
          activeWorkspaceId = crypto.randomUUID();

          // Resolve email from Clerk token claim
          const email = (verifiedToken as any).email || (verifiedToken as any).email_address || "no-email@clerk.user";

          console.log(`🚀 [SaaS Auto-Provisioning] Initializing tenant ecosystem for user: ${email}...`);

          await db.transaction(async (tx: any) => {
            await tx.insert(users).values({
              id: userId,
              clerkUserId,
              email,
              createdAt: new Date().toISOString()
            });

            await tx.insert(organizations).values({
              id: organizationId,
              name: `${email.split("@")[0]}'s Company`,
              createdAt: new Date().toISOString()
            });

            await tx.insert(memberships).values({
              id: crypto.randomUUID(),
              userId,
              organizationId,
              role: "owner",
              createdAt: new Date().toISOString()
            });

            await tx.insert(workspaces).values({
              id: activeWorkspaceId,
              organizationId,
              name: "Default Workspace",
              createdAt: new Date().toISOString()
            });
          });
        } else {
          // EXISTING USER: Load tenant records from DB
          userId = userRows[0].id;

          const memberRows = await db
            .select()
            .from(memberships)
            .where(eq(memberships.userId, userId))
            .limit(1);

          if (memberRows.length === 0) {
            // Self-repair: Create Organization if membership link is missing
            organizationId = crypto.randomUUID();
            activeWorkspaceId = crypto.randomUUID();

            await db.transaction(async (tx: any) => {
              await tx.insert(organizations).values({
                id: organizationId,
                name: "Default Company",
                createdAt: new Date().toISOString()
              });

              await tx.insert(memberships).values({
                id: crypto.randomUUID(),
                userId,
                organizationId,
                role: "owner",
                createdAt: new Date().toISOString()
              });

              await tx.insert(workspaces).values({
                id: activeWorkspaceId,
                organizationId,
                name: "Default Workspace",
                createdAt: new Date().toISOString()
              });
            });
          } else {
            organizationId = memberRows[0].organizationId;

            // Load first active workspace within organization
            const workspaceRows = await db
              .select()
              .from(workspaces)
              .where(eq(workspaces.organizationId, organizationId))
              .limit(1);

            if (workspaceRows.length === 0) {
              activeWorkspaceId = crypto.randomUUID();
              await db.insert(workspaces).values({
                id: activeWorkspaceId,
                organizationId,
                name: "Default Workspace",
                createdAt: new Date().toISOString()
              });
            } else {
              activeWorkspaceId = workspaceRows[0].id;
            }
          }
        }

        tenantContext = {
          userId,
          organizationId,
          activeWorkspaceId,
          role: "owner" // Scoped to owner for first workspace; can be mapped from memberships.role
        };

      } catch (err: any) {
        fastify.log.error(`Clerk Verification Error: ${err.message}`);
        return reply.status(401).send({
          success: false,
          error: `Unauthorized: Invalid Clerk Access Token: ${err.message}`
        });
      }
    } else {
      // ========================================================
      // B. MOCK FALLBACK MODE (Local Dev/Testing - Zero Configuration)
      // ========================================================
      const userId = (request.headers["x-user-id"] as string) || "mock-user-id";
      const organizationId = (request.headers["x-organization-id"] as string) || "mock-org-id";
      const activeWorkspaceId = (request.headers["x-workspace-id"] as string) || "mock-workspace-id";
      const role = (request.headers["x-role"] as string) || "owner";

      tenantContext = {
        userId,
        organizationId,
        activeWorkspaceId,
        role: role as any
      };
    }

    // 6. Bind request contexts
    request.tenantContext = tenantContext;
    request.repo = new TenantRepository(db, tenantContext);
  });
};

export default fp(contextPlugin);
