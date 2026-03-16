import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { resolve } from 'path';
import postgres from 'postgres';

import * as schema from './schema/index';

config({ path: resolve(import.meta.dirname, '../../../apps/api/.env') });
if (!process.env['DATABASE_URL']) throw new Error('DATABASE_URL is required');

const queryClient = postgres(process.env['DATABASE_URL']);
export const db = drizzle(queryClient, { schema });
export type DB = typeof db;
