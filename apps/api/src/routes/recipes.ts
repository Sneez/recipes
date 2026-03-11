import { contract } from '@recipes/contracts';
import { db, recipes } from '@recipes/db';
import { initServer } from '@ts-rest/fastify';
import { and, count, eq, ilike, or } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

import { requireAuth } from '../plugins/clerk.js';

const s = initServer();

const impl = s.router(contract.recipes, {
  list: async ({ request, reply, query }) => {
    const auth = requireAuth(request, reply);
    if (!auth)
      return { status: 401 as const, body: { message: 'Unauthorized' } };

    const { page, limit, search, cuisine, difficulty } = query;
    const offset = (page - 1) * limit;

    const filters = and(
      cuisine ? eq(recipes.cuisine, cuisine) : undefined,
      difficulty ? eq(recipes.difficulty, difficulty) : undefined,
      search
        ? or(
            ilike(recipes.title, `%${search}%`),
            ilike(recipes.description, `%${search}%`),
          )
        : undefined,
    );

    const [items, [{ value: total }]] = await Promise.all([
      db.select().from(recipes).where(filters).limit(limit).offset(offset),
      db.select({ value: count() }).from(recipes).where(filters),
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

    const [recipe] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, params.id))
      .limit(1);

    if (!recipe)
      return { status: 404 as const, body: { message: 'Recipe not found' } };

    return { status: 200 as const, body: recipe };
  },

  create: async ({ request, reply, body }) => {
    const auth = requireAuth(request, reply);
    if (!auth)
      return { status: 401 as const, body: { message: 'Unauthorized' } };

    const [recipe] = await db
      .insert(recipes)
      .values({ ingredients: [], ...body, authorId: auth.userId })
      .returning();

    if (!recipe)
      return {
        status: 422 as const,
        body: { message: 'Failed to create recipe' },
      };

    return { status: 201 as const, body: recipe };
  },

  update: async ({ request, reply, params, body }) => {
    const auth = requireAuth(request, reply);
    if (!auth)
      return { status: 401 as const, body: { message: 'Unauthorized' } };

    const [existing] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, params.id))
      .limit(1);

    if (!existing)
      return { status: 404 as const, body: { message: 'Recipe not found' } };
    if (existing.authorId !== auth.userId)
      return { status: 403 as const, body: { message: 'Forbidden' } };

    const [updated] = await db
      .update(recipes)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(recipes.id, params.id), eq(recipes.authorId, auth.userId)))
      .returning();

    if (!updated)
      return { status: 404 as const, body: { message: 'Recipe not found' } };

    return { status: 200 as const, body: updated };
  },

  delete: async ({ request, reply, params }) => {
    const auth = requireAuth(request, reply);
    if (!auth)
      return { status: 401 as const, body: { message: 'Unauthorized' } };

    const [existing] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, params.id))
      .limit(1);

    if (!existing)
      return { status: 404 as const, body: { message: 'Recipe not found' } };
    if (existing.authorId !== auth.userId)
      return { status: 403 as const, body: { message: 'Forbidden' } };

    await db
      .delete(recipes)
      .where(and(eq(recipes.id, params.id), eq(recipes.authorId, auth.userId)));

    return { status: 200 as const, body: { success: true } };
  },
});

export async function recipesRouter(app: FastifyInstance) {
  await app.register(s.plugin(impl));
}
