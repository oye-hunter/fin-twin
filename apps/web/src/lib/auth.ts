import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@fin-twin/db';
import * as schema from '@fin-twin/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'https://fin-twin-web.vercel.app',
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ],
  secret:
    process.env.BETTER_AUTH_SECRET ||
    process.env.BETTER_AUTH_API_KEY ||
    'fin-twin-dev-secret-key-32-chars-long!',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
});
