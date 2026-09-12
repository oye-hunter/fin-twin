import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is missing');
  process.exit(1);
}

const sql = neon(dbUrl);

async function migrate() {
  console.log('Migrating slack_links table to database...');
  await sql`
    CREATE TABLE IF NOT EXISTS "slack_links" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" text NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
      "slack_user_id" text UNIQUE,
      "link_code" text,
      "pending_dump" text,
      "linked_at" timestamp,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `;
  console.log('✓ slack_links table verified/created successfully!');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
