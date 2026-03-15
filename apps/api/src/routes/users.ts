import { contract } from '@recipes/contracts';
import { db, users } from '@recipes/db';
import { initServer } from '@ts-rest/fastify';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

import { notFound, unauthorized } from '../lib/errors';
import { clerkClient, requireAuth } from '../plugins/clerk.js';

const s = initServer();

const impl = s.router(contract.users, {
  getMe: async ({ request }) => {
    let auth;
    try {
      auth = requireAuth(request);
    } catch {
      return unauthorized();
    }

    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, auth.userId))
      .limit(1);

    // First sign-in — fetch from Clerk and upsert into our DB
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(auth.userId);
        const primaryEmail = clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId,
        );
        if (!primaryEmail) {
          return {
            status: 404 as const,
            body: { message: 'No email found for user' },
          };
        }
        [user] = await db
          .insert(users)
          .values({
            id: auth.userId,
            email: primaryEmail.emailAddress,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl,
          })
          .onConflictDoUpdate({
            target: users.id,
            set: {
              email: primaryEmail.emailAddress,
              firstName: clerkUser.firstName,
              lastName: clerkUser.lastName,
              imageUrl: clerkUser.imageUrl,
              updatedAt: new Date(),
            },
          })
          .returning();
      } catch (err) {
        request.log.error({ err }, 'Failed to sync user from Clerk');
        return notFound('User');
      }
    }

    if (!user) return notFound('User');

    return { status: 200 as const, body: user };
  },

  updateMe: async ({ request, body }) => {
    let auth;
    try {
      auth = requireAuth(request);
    } catch {
      return unauthorized();
    }

    const [updated] = await db
      .update(users)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(users.id, auth.userId))
      .returning();

    if (!updated) return notFound('User');

    return { status: 200 as const, body: updated };
  },
});

export async function usersRouter(app: FastifyInstance) {
  await app.register(s.plugin(impl));
}
