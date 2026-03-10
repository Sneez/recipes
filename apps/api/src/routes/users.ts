import { contract } from '@recipes/contracts';
import { db, users } from '@recipes/db';
import { initServer } from '@ts-rest/fastify';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

import { requireAuth } from '../plugins/clerk.js';

const s = initServer();

const impl = s.router(contract.users, {
  getMe: async ({ request, reply }) => {
    const auth = requireAuth(request, reply);
    if (!auth)
      return { status: 401 as const, body: { message: 'Unauthorized' } };

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, auth.userId))
      .limit(1);
    if (!user)
      return { status: 404 as const, body: { message: 'User not found' } };

    return { status: 200 as const, body: user };
  },

  updateMe: async ({ request, reply, body }) => {
    const auth = requireAuth(request, reply);
    if (!auth)
      return { status: 401 as const, body: { message: 'Unauthorized' } };

    const [updated] = await db
      .update(users)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(users.id, auth.userId))
      .returning();

    if (!updated)
      return { status: 401 as const, body: { message: 'User not found' } };

    return { status: 200 as const, body: updated };
  },
});

export async function usersRouter(app: FastifyInstance) {
  await app.register(s.plugin(impl));
}
