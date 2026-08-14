import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { env } from './env';

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
const sql = neon(dbUrl);
export const db = drizzle(sql, { schema });
export type DB = typeof db;
export * from './schema';
