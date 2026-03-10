import { contract } from '@my-app/contracts';
import { db, posts } from '@my-app/db';
import { initServer } from '@ts-rest/fastify';
import { and, count, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

import { requireAuth } from '../plugins/clerk.js';

const s = initServer();

const postsRouterImpl = s.router(contract.posts, {
  list: async ({ request, reply, query }) => {
    const auth = requireAuth(request, reply);
    if (!auth)
      return { status: 401 as const, body: { message: 'Unauthorized' } };

    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const [items, [{ value: total }]] = await Promise.all([
      db.select().from(posts).limit(limit).offset(offset),
      db.select({ value: count() }).from(posts),
    ]);

    return {
      status: 200 as const,
      body: { items, total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  getById: async ({ request, reply, params }) => {
    const auth = requireAuth(request, reply);
    if (!auth)
      return { status: 401 as const, body: { message: 'Unauthorized' } };

    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, params.id))
      .limit(1);
    if (!post)
      return { status: 404 as const, body: { message: 'Post not found' } };

    return { status: 200 as const, body: post };
  },

  create: async ({ request, reply, body }) => {
    const auth = requireAuth(request, reply);
    if (!auth)
      return { status: 401 as const, body: { message: 'Unauthorized' } };

    const [post] = await db
      .insert(posts)
      .values({ ...body, authorId: auth.userId })
      .returning();
    if (!post)
      return {
        status: 422 as const,
        body: { message: 'Failed to create post' },
      };

    return { status: 201 as const, body: post };
  },

  update: async ({ request, reply, params, body }) => {
    const auth = requireAuth(request, reply);
    if (!auth)
      return { status: 401 as const, body: { message: 'Unauthorized' } };

    const [existing] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, params.id))
      .limit(1);
    if (!existing)
      return { status: 404 as const, body: { message: 'Post not found' } };
    if (existing.authorId !== auth.userId)
      return { status: 403 as const, body: { message: 'Forbidden' } };

    const [updated] = await db
      .update(posts)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(posts.id, params.id), eq(posts.authorId, auth.userId)))
      .returning();

    if (!updated)
      return { status: 404 as const, body: { message: 'Post not found' } };

    return { status: 200 as const, body: updated };
  },

  delete: async ({ request, reply, params }) => {
    const auth = requireAuth(request, reply);
    if (!auth)
      return { status: 401 as const, body: { message: 'Unauthorized' } };

    const [existing] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, params.id))
      .limit(1);
    if (!existing)
      return { status: 404 as const, body: { message: 'Post not found' } };
    if (existing.authorId !== auth.userId)
      return { status: 403 as const, body: { message: 'Forbidden' } };

    await db
      .delete(posts)
      .where(and(eq(posts.id, params.id), eq(posts.authorId, auth.userId)));

    return { status: 200 as const, body: { success: true } };
  },
});

export async function postsRouter(app: FastifyInstance) {
  const router = s.plugin(postsRouterImpl);
  await app.register(router);
}
