import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const envSchema = z.object({
  DATABASE_URL: z.string().default('postgresql://placeholder:placeholder@localhost:5432/placeholder'),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL || process.env.POSTGRES_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
});
