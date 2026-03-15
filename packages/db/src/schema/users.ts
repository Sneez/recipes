import { pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt } from '../columns';

export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
