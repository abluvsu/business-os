import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { verifyToken } from "@clerk/fastify";

declare module "fastify" {
  interface FastifyRequest {
    tenantId?: string;
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  const secretKey = process.env.CLERK_SECRET_KEY;

  fastify.decorateRequest("tenantId", "");

  fastify.addHook("preHandler", async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      reply.code(411).send({ error: "Missing authorization token" });
      return;
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = await verifyToken(token, {
        secretKey,
      });
      request.tenantId = decoded.sub; // Clerk sub matches our tenantId
    } catch (err) {
      reply.code(401).send({ error: "Invalid authorization token" });
    }
  });
};

export default fp(authPlugin);
