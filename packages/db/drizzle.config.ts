import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';
import { resolve } from 'path';

// Load from the monorepo root regardless of which directory the command runs from
config({ path: resolve(__dirname, '../../.env') });

// DATABASE_URL is only required for commands that connect to the database
// (migrate, studio, push). `drizzle-kit generate` only reads schema files.
if (!process.env['DATABASE_URL']) throw new Error('DATABASE_URL is required');
const dbUrl = process.env['DATABASE_URL'];

export default {
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: dbUrl },
} satisfies Config;
