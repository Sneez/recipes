/**
 * @recipes/db/zod
 *
 * All Zod schemas are generated from the Drizzle schema via drizzle-zod.
 * This is the canonical source of truth for request/response types.
 * Nothing downstream should hand-write Zod schemas for entities that
 * exist in the database.
 *
 * Data flow:
 *   Drizzle schema → drizzle-zod → @recipes/contracts → hooks → components
 */
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { recipes, users } from './schema/index';

// ── Users ─────────────────────────────────────────────────────────────────────

export const selectUserSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users);

export type UserDto = z.infer<typeof selectUserSchema>;

// ── Recipes ───────────────────────────────────────────────────────────────────

export const selectRecipeSchema = createSelectSchema(recipes).extend({
  ingredients: z.array(z.string()),
});

export const insertRecipeSchema = createInsertSchema(recipes).extend({
  title: z.string().min(2, 'Title must be at least 2 characters').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  instructions: z.string().min(20, 'Please provide detailed instructions'),
  prepTimeMinutes: z.number().int().min(0).max(1440),
  cookTimeMinutes: z.number().int().min(0).max(1440),
  servings: z.number().int().min(1).max(100),
});

// Shape used for creating a recipe (omit server-set fields)
export const createRecipeSchema = insertRecipeSchema
  .omit({
    id: true,
    authorId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  })
  .extend({
    ingredients: z
      .union([
        z.string().transform((s) =>
          s
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean),
        ),
        z.array(z.string().trim()),
      ])
      .optional()
      .default([]),
    imageUrl: z
      .string()
      .url()
      .optional()
      .nullable()
      .or(z.literal(''))
      .transform((v) => (v === '' || v === null ? undefined : v)),
  });

// Shape used for updating (all fields optional except id)
export const updateRecipeSchema = createRecipeSchema.omit({}).partial();

// Query / filter params
export const recipeListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  search: z.string().optional(),
  cuisine: selectRecipeSchema.shape.cuisine.optional(),
  difficulty: selectRecipeSchema.shape.difficulty.optional(),
});

export type RecipeDto = z.infer<typeof selectRecipeSchema>;
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type RecipeListQuery = z.infer<typeof recipeListQuerySchema>;

// ── Shared ────────────────────────────────────────────────────────────────────

export const paginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  });

export const errorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
