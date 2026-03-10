import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { users } from './users';

export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);
export const cuisineEnum = pgEnum('cuisine', [
  'italian',
  'mexican',
  'asian',
  'american',
  'french',
  'mediterranean',
  'indian',
  'other',
]);

export const recipes = pgTable('recipes', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  ingredients: text('ingredients').array().notNull().default([]),
  instructions: text('instructions').notNull(),
  prepTimeMinutes: integer('prep_time_minutes').notNull().default(0),
  cookTimeMinutes: integer('cook_time_minutes').notNull().default(0),
  servings: integer('servings').notNull().default(4),
  difficulty: difficultyEnum('difficulty').notNull().default('medium'),
  cuisine: cuisineEnum('cuisine').notNull().default('other'),
  imageUrl: text('image_url'),
  authorId: varchar('author_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
