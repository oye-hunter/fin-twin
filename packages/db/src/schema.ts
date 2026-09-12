import { pgTable, text, timestamp, boolean, uuid, numeric, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const directionEnum = pgEnum('direction', ['income', 'expense', 'lend', 'borrow']);
export const statusEnum = pgEnum('status', ['open', 'settled']);

// Better Auth Tables
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// People (Contacts for Lend/Borrow)
export const people = pgTable('people', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Categories
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  isPredefined: boolean('is_predefined').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Entries (Core Transactions)
export const entries = pgTable('entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  direction: directionEnum('direction').notNull(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  personId: uuid('person_id').references(() => people.id, { onDelete: 'set null' }),
  date: timestamp('date').notNull().defaultNow(),
  note: text('note'),
  status: statusEnum('status'),
  reminderSentAt: timestamp('reminder_sent_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Slack Links (Inbound AI Dump Channel)
export const slackLinks = pgTable('slack_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  slackUserId: text('slack_user_id').unique(),
  linkCode: text('link_code'),
  pendingDump: text('pending_dump'),
  linkedAt: timestamp('linked_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  people: many(people),
  categories: many(categories),
  entries: many(entries),
  slackLink: one(slackLinks),
}));

export const slackLinksRelations = relations(slackLinks, ({ one }) => ({
  user: one(users, { fields: [slackLinks.userId], references: [users.id] }),
}));

export const peopleRelations = relations(people, ({ one, many }) => ({
  user: one(users, { fields: [people.userId], references: [users.id] }),
  entries: many(entries),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  entries: many(entries),
}));

export const entriesRelations = relations(entries, ({ one }) => ({
  user: one(users, { fields: [entries.userId], references: [users.id] }),
  category: one(categories, { fields: [entries.categoryId], references: [categories.id] }),
  person: one(people, { fields: [entries.personId], references: [people.id] }),
}));

// Starter Categories List
export const STARTER_CATEGORIES = [
  'Food',
  'Groceries',
  'Fuel',
  'Transport',
  'Trips',
  'Bills',
  'Rent',
  'Entertainment',
  'Salary/Income',
  'Uncategorized',
] as const;
