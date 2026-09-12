# Fin-Twin (Financial Twin) — Data Model

Drizzle ORM schema, targeting NeonDB (Postgres). This is a spec for `packages/db/src/schema.ts`
— exact column types can be adapted to Drizzle's Postgres syntax, but do not change the
shape (tables, relationships, enums) without updating this doc first.

## Tables (Phase 1 — hackathon build)

### `users`
Managed by Better Auth — do not hand-roll. Reference its generated schema for exact shape.
Every other table below scopes its rows to a `userId`.

### `people`
People the user has manually added — used only for attaching "lend"/"borrow" entries.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| userId | uuid, FK → users.id | owner |
| name | text, required | |
| email | text, required | used for reminder sends |
| phone | text, nullable | optional, not used for sending anything yet |
| createdAt | timestamp | default now |

### `categories`
Predefined + user-created. Predefined ones are seeded per-user (or globally, with a
`isPredefined` flag) at signup.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| userId | uuid, FK → users.id, nullable | null = global/predefined category |
| name | text, required | e.g. "Food", "Fuel", "Trips" |
| isPredefined | boolean | true for the seeded starter set |
| createdAt | timestamp | default now |

**Seed set (predefined, `isPredefined: true`, `userId: null`):**
Food, Groceries, Fuel, Transport, Trips, Bills, Rent, Entertainment, Salary/Income, Uncategorized

### `entries`
The core table. Every dump-parsed or manually-added money movement lands here.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| userId | uuid, FK → users.id | owner |
| amount | numeric, required | always positive; `direction` carries the sign meaning |
| direction | enum: `income` \| `expense` \| `lend` \| `borrow` | `lend` = money the user gave out and expects back; `borrow` = money the user received and owes back (optional — MVP can start with just income/expense/lend and add borrow later if time allows) |
| categoryId | uuid, FK → categories.id, nullable | nullable falls back to "Uncategorized" |
| personId | uuid, FK → people.id, nullable | only set when direction is `lend` (or `borrow`) |
| date | date, required | defaults to entry creation date unless the dump text specifies otherwise |
| note | text, nullable | raw original dump text, kept for reference/debugging and as a fallback display string |
| status | enum: `open` \| `settled`, nullable | only meaningful for `lend`/`borrow` entries — whether the money has been paid back |
| reminderSentAt | timestamp, nullable | last time a reminder email was sent for this entry |
| createdAt | timestamp | default now |

## Key relationships (Phase 1)
- `entries.personId` → `people.id` (nullable, only for lend/borrow)
- `entries.categoryId` → `categories.id` (nullable, falls back to Uncategorized)
- `people` and `categories` and `entries` are all scoped to `userId`

## Aggregation queries the Dashboard needs (pure SQL/Drizzle, no AI)
- Sum of `amount` where `direction = 'expense'` and `date` within current month
- Sum of `amount` where `direction = 'income'` and `date` within current month
- Group-by `categoryId`, sum `amount`, filtered to `direction = 'expense'`, current month — for the category breakdown chart
- Day-by-day or week-by-week sum of expenses within the current month — for the trend chart
- All entries where `direction = 'lend'` and `status = 'open'`, joined to `people` for name/email — for the "money owed to you" list

---

## Tables (Phase 2 — post-hackathon additions)

### `slack_links`
Maps a user's Fin-Twin account to their Slack user, via a one-time linking code generated in the web app.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| userId | uuid, FK → users.id, unique | one Slack user per account |
| slackUserId | text, unique | Slack's member ID for this user, once linked — used to open a DM via `conversations.open` / send via `chat.postMessage` |
| linkCode | text, nullable | the one-time code shown in-app before linking; cleared once used |
| linkedAt | timestamp, nullable | null until the user actually sends the code to the bot |
| createdAt | timestamp | default now |

### `budgets`
A monthly spending cap the user sets per category.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| userId | uuid, FK → users.id | owner |
| categoryId | uuid, FK → categories.id | one budget row per category per user |
| monthlyLimit | numeric, required | |
| createdAt | timestamp | default now |

### `repayments`
Partial paybacks logged against an open `lend`/`borrow` entry, so a debt doesn't have to be all-or-nothing settled.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| entryId | uuid, FK → entries.id | the parent lend/borrow entry this repayment reduces |
| amount | numeric, required | |
| date | date, required | |
| createdAt | timestamp | default now |

**Note:** an entry's outstanding balance is `entries.amount` minus the sum of its `repayments.amount`. `entries.status` moves to `settled` once that balance hits zero — this should be computed, not manually toggled once repayments exist.

## Key relationships (Phase 2 additions)
- `slack_links.userId` → `users.id` (1:1)
- `budgets.userId` → `users.id`, `budgets.categoryId` → `categories.id`
- `repayments.entryId` → `entries.id` (many repayments per entry)
