/**
 * @recipes/db/enums
 *
 * Browser-safe export — contains only enum definitions with no Node.js
 * dependencies (no postgres client, no drizzle client, no fs/Buffer).
 * Import this in web app components instead of @recipes/db directly.
 */
export { difficultyEnum, cuisineEnum } from './schema/recipes';
