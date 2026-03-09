import { createClerkClient } from "@clerk/backend";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

if (!process.env["CLERK_SECRET_KEY"]) {
  throw new Error("CLERK_SECRET_KEY is required");
}

export const clerkClient = createClerkClient({
  secretKey: process.env["CLERK_SECRET_KEY"],
});

declare module "fastify" {
  interface FastifyRequest {
    auth: { userId: string } | null;
  }
}

async function clerkPluginFn(app: FastifyInstance) {
  app.decorateRequest("auth", null);

  app.addHook("onRequest", async (request: FastifyRequest) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      request.auth = null;
      return;
    }
    const token = authHeader.slice(7);
    try {
      const payload = await clerkClient.verifyToken(token);
      request.auth = { userId: payload.sub };
    } catch {
      request.auth = null;
    }
  });
}

export const clerkPlugin = fp(clerkPluginFn, { name: "clerk" });

export function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  if (!request.auth) {
    void reply.status(401).send({ message: "Unauthorized" });
    return null;
  }
  return request.auth;
}
