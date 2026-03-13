import { createClerkClient } from '@clerk/backend';
import { config } from 'dotenv';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { resolve } from 'path';

// Load from the .env from the api root
config({ path: resolve(import.meta.dirname, '../../../.env') });
if (!process.env['CLERK_SECRET_KEY']) {
  throw new Error('CLERK_SECRET_KEY is required');
}
if (!process.env['CLERK_PUBLISHABLE_KEY']) {
  throw new Error('CLERK_PUBLISHABLE_KEY is required');
}

export const clerkClient = createClerkClient({
  secretKey: process.env['CLERK_SECRET_KEY'],
  publishableKey: process.env['CLERK_PUBLISHABLE_KEY'],
});

declare module 'fastify' {
  interface FastifyRequest {
    auth: { userId: string } | null;
  }
}

async function clerkPluginFn(app: FastifyInstance) {
  app.decorateRequest('auth', null);

  app.addHook('onRequest', async (request: FastifyRequest) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      request.auth = null;
      return;
    }

    try {
      const requestState = await clerkClient.authenticateRequest(
        new Request(`http://localhost${request.url}`, {
          method: request.method,
          headers: new Headers(request.headers as Record<string, string>),
        }),
      );

      if (requestState.isSignedIn) {
        request.auth = { userId: String(requestState.toAuth().userId) };
      } else {
        request.log.warn({ reason: requestState.reason }, 'Clerk auth failed');
        request.auth = null;
      }
    } catch (err) {
      request.log.warn({ err }, 'Clerk authenticateRequest error');
      request.auth = null;
    }
  });
}

export const clerkPlugin = fp(clerkPluginFn, { name: 'clerk' });

export function requireAuth(request: FastifyRequest): { userId: string } {
  if (!request.auth) throw new Error('Unauthorized');
  return request.auth;
}
