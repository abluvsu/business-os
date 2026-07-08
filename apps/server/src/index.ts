import Fastify from "fastify";
import cors from "@fastify/cors";
import { validatorCompiler, serializerCompiler } from "fastify-type-provider-zod";
import { WorkspaceManager } from "@business-os/workspace";
import { registerWorkspaceRoutes } from "./routes/workspace";
import { registerMarketingRoutes } from "./routes/marketing";

const fastify = Fastify({
  logger: true,
});

// Setup Zod compilers
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

// Register CORS for web app communication
fastify.register(cors, {
  origin: "*",
});

// Initialize workspace manager (automatically loads last open workspace if valid)
const manager = new WorkspaceManager();

// Register Workspace routes
registerWorkspaceRoutes(fastify, manager);
registerMarketingRoutes(fastify);

// Health check
fastify.get("/health", async () => {
  const ws = manager.active();
  return {
    workspace: ws ? "opened" : "closed",
    database: ws ? "connected" : "disconnected",
    version: "0.0.1",
    uptime: process.uptime(),
  };
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
    // Listen locally only
    await fastify.listen({ port: 4000, host: "127.0.0.1" });
    console.log("Server listening on http://127.0.0.1:4000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
