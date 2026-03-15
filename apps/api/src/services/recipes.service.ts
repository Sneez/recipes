import {
  forbidden,
  notFound,
  unauthorized,
  unprocessable,
} from '@api/lib/errors';
import { created, ok } from '@api/lib/ts-rest-helpers';
import { db, recipes } from '@recipes/db';
import type { CreateRecipeInput, UpdateRecipeInput } from '@recipes/db/zod';
import { and, count, eq, ilike, isNull, or } from 'drizzle-orm';

export const notDeleted = isNull(recipes.deletedAt);

export async function listRecipes(
  userId: string | null,
  query: {
    page: number;
    limit: number;
    search?: string | undefined;
    cuisine?: string | undefined;
    difficulty?: string | undefined;
  },
) {
  if (!userId) return unauthorized();

  const { page, limit, search, cuisine, difficulty } = query;
  const offset = (page - 1) * limit;

  const filters = and(
    notDeleted,
    cuisine
      ? eq(recipes.cuisine, cuisine as typeof recipes.cuisine._.data)
      : undefined,
    difficulty
      ? eq(recipes.difficulty, difficulty as typeof recipes.difficulty._.data)
      : undefined,
    search
      ? or(
          ilike(recipes.title, `%${search}%`),
          ilike(recipes.description, `%${search}%`),
        )
      : undefined,
  );

  const [items, [countRow]] = await Promise.all([
    db.select().from(recipes).where(filters).limit(limit).offset(offset),
    db.select({ value: count() }).from(recipes).where(filters),
  ]);

  return ok({
    items,
    total: countRow!.value,
    page,
    limit,
    totalPages: Math.ceil(countRow!.value / limit),
  });
}

export async function getRecipeById(userId: string | null, id: string) {
  if (!userId) return unauthorized();

  const [recipe] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, id), notDeleted))
    .limit(1);

  if (!recipe) return notFound('Recipe');
  return ok(recipe);
}

export async function createRecipe(
  userId: string | null,
  body: CreateRecipeInput,
) {
  if (!userId) return unauthorized();

  const { ingredients, ...rest } = body;

  const [recipe] = await db
    .insert(recipes)
    .values({
      ...rest,
      ingredients: ingredients ?? [],
      authorId: userId,
    } as typeof recipes.$inferInsert)
    .returning();

  if (!recipe) return unprocessable('Failed to create recipe');
  return created(recipe);
}

export async function updateRecipe(
  userId: string | null,
  id: string,
  body: UpdateRecipeInput,
) {
  if (!userId) return unauthorized();

  const [existing] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, id), notDeleted))
    .limit(1);

  if (!existing) return notFound('Recipe');
  if (existing.authorId !== userId) return forbidden();

  const { ingredients, ...rest } = body;

  const [updated] = await db
    .update(recipes)
    .set({
      ...rest,
      ...(ingredients !== undefined ? { ingredients } : {}),
      updatedAt: new Date(),
    } as typeof recipes.$inferInsert)
    .where(and(eq(recipes.id, id), eq(recipes.authorId, userId), notDeleted))
    .returning();

  if (!updated) return notFound('Recipe');
  return ok(updated);
}

export async function deleteRecipe(userId: string | null, id: string) {
  if (!userId) return unauthorized();

  const [existing] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, id), notDeleted))
    .limit(1);

  if (!existing) return notFound('Recipe');
  if (existing.authorId !== userId) return forbidden();

  await db
    .update(recipes)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(recipes.id, id), eq(recipes.authorId, userId)));

  return ok({ success: true });
}
