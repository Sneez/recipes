import { contract } from '@recipes/contracts';
import { db, recipes } from '@recipes/db';
import { initServer } from '@ts-rest/fastify';
import { and, count, eq, ilike, isNull, or } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

import { requireAuth } from '../plugins/clerk.js';

const s = initServer();

const UNAUTH = {
  status: 401 as const,
  body: { message: 'Unauthorized recipes' },
};
const FORBIDDEN = { status: 403 as const, body: { message: 'Forbidden' } };
const NOT_FOUND = {
  status: 404 as const,
  body: { message: 'Recipe not found' },
};

const impl = s.router(contract.recipes, {
  list: async ({ request, query }) => {
    try {
      requireAuth(request);
    } catch {
      return UNAUTH;
    }

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
      isNull(recipes.deletedAt),
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

  getById: async ({ request, params }) => {
    try {
      requireAuth(request);
    } catch {
      return UNAUTH;
    }

    const [recipe] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, params.id))
      .limit(1);
    if (!recipe) return NOT_FOUND;

    return { status: 200 as const, body: recipe };
  },

  create: async ({ request, body }) => {
    request.log.info({ body }, 'create recipe request body');
    let auth;
    try {
      auth = requireAuth(request);
    } catch {
      return UNAUTH;
    }

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

  update: async ({ request, params, body }) => {
    let auth;
    try {
      auth = requireAuth(request);
    } catch {
      return UNAUTH;
    }

    const [existing] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, params.id))
      .limit(1);
    if (!existing) return NOT_FOUND;
    if (existing.authorId !== auth.userId) return FORBIDDEN;

    const [updated] = await db
      .update(recipes)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(recipes.id, params.id), eq(recipes.authorId, auth.userId)))
      .returning();

    if (!updated) return NOT_FOUND;

    return { status: 200 as const, body: updated };
  },

  delete: async ({ request, params }) => {
    let auth;
    try {
      auth = requireAuth(request);
    } catch {
      return UNAUTH;
    }

    const [existing] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, params.id))
      .limit(1);
    if (!existing) return NOT_FOUND;
    if (existing.authorId !== auth.userId) return FORBIDDEN;

    const [updated] = await db
      .update(recipes)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(recipes.id, params.id), eq(recipes.authorId, auth.userId)))
      .returning();

    if (!updated) return NOT_FOUND;
    return { status: 200 as const, body: { success: true } };
  },
});

export async function recipesRouter(app: FastifyInstance) {
  await app.register(s.plugin(impl));
}
