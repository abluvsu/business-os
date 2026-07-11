import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import compress from "@fastify/compress";
import {
  validatorCompiler,
  serializerCompiler,
} from "fastify-type-provider-zod";
import { WorkspaceManager } from "@business-os/workspace";
import { registerWorkspaceRoutes } from "./routes/workspace";
import { registerMarketingRoutes } from "./routes/marketing";
import { registerConnectorRoutes } from "./routes/connectors";
import { registerAnalyticsRoutes } from "./routes/analytics";
import { registerCompanyRoutes } from "./routes/company";
import { startSyncWorker, syncEventEmitter } from "./sync-worker";
import contextPlugin from "./plugins/context";

const fastify = Fastify({
  logger: true,
  connectionTimeout: 30000,
  keepAliveTimeout: 65000,
  requestTimeout: 60000,
});

// Setup Zod compilers
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

// Enable compression (gzip/deflate) for all responses
fastify.register(compress, {
  global: true,
  threshold: 1024,
  encodings: ["gzip", "deflate"],
});

// Register CORS for web app communication
fastify.register(cors, {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// Initialize workspace manager (automatically loads last open workspace if valid)
const manager = new WorkspaceManager();

// Register context resolution plugin
fastify.register(contextPlugin, { manager });

// Register Workspace routes
registerWorkspaceRoutes(fastify, manager);
registerMarketingRoutes(fastify, manager);
registerConnectorRoutes(fastify, manager);
registerAnalyticsRoutes(fastify, manager);
registerCompanyRoutes(fastify, manager);

// Start background delta sync polling worker
startSyncWorker(manager);

// Health check - optimized for load balancer probes
fastify.get(
  "/health",
  {
    config: {
      logLevel: "silent",
    },
  },
  async () => {
    const ws = manager.active();
    return {
      workspace: ws ? "opened" : "closed",
      database: ws ? "connected" : "disconnected",
      version: "0.0.1",
      uptime: process.uptime(),
    };
  },
);

// Event stream for frontend sync completion notification (SSE)
fastify.get("/api/events", (request, reply) => {
  reply.raw.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "X-Accel-Buffering": "no", // Disable nginx buffering
  });

  const onSyncCompleted = (data: any) => {
    reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  syncEventEmitter.on("sync:completed", onSyncCompleted);

  request.raw.on("close", () => {
    syncEventEmitter.off("sync:completed", onSyncCompleted);
  });
});

// Handle graceful shutdown to release active workspace lock file
const shutdown = async () => {
  fastify.log.info("Shutting down gracefully...");
  try {
    manager.close();
  } catch (err) {
    fastify.log.error(err);
  }
  await fastify.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "4000", 10);
    const host =
      process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
    await fastify.listen({ port, host });
    console.log(`Server listening on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
