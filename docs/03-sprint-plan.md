# Fin-Twin (Financial Twin) — Sprint Plan

This document outlines the step-by-step sprint execution roadmap for building **Fin-Twin**.
Each sprint produces a working, testable milestone.

---

## Sprint 1: Monorepo Foundation & Database Layer
**Focus:** Workspace setup, NeonDB + Drizzle ORM schema, and category seed script.

### Deliverables:
1. **Turborepo Workspace Configuration:**
   - Root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`.
   - Packages: `packages/db`, `packages/core`, `apps/web`.
2. **Database Package (`packages/db`):**
   - Environment schema & validation (`env.ts`).
   - Drizzle schema (`schema.ts`):
     - `users` (Better Auth compatible)
     - `people` (`id`, `userId`, `name`, `email`, `phone`, `createdAt`)
     - `categories` (`id`, `userId`, `name`, `isPredefined`, `createdAt`)
     - `entries` (`id`, `userId`, `amount`, `direction`, `categoryId`, `personId`, `date`, `note`, `status`, `reminderSentAt`, `createdAt`)
   - Drizzle client (`client.ts`) configured for NeonDB serverless Postgres.
   - Seed script (`seed.ts`) for default starter categories (*Food, Groceries, Fuel, Transport, Trips, Bills, Rent, Entertainment, Salary/Income, Uncategorized*).
3. **Verification:**
   - Drizzle migrations run cleanly and generate schema SQL.
   - Seed script populates global starter categories.

---

## Sprint 2: Core AI Dump Parsing Engine (`packages/core`)
**Focus:** Groq SDK client, prompt engineering, and deterministic Zod schema validation.

### Deliverables:
1. **Schema & Types (`packages/core/src/dump.ts`, `types.ts`):**
   - Zod schema for structured dump items: `amount` (positive number), `direction` (`income` | `expense` | `lend` | `borrow`), `categoryName` (string), `personName` (optional string), `date` (ISO date or null), `note` (original text).
2. **Category Matching & Guardrails (`packages/core/src/categories.ts`):**
   - Case-insensitive matcher against user + predefined categories.
   - Strict fallback to `"Uncategorized"` if the AI infers a non-existent category.
3. **Prompt & Groq Client (`packages/core/src/prompt.ts`, `packages/core/src/agent.ts`):**
   - Groq SDK runner with JSON mode / structured output.
   - Retry loop with deterministic fallback on network or parse failure.
   - System prompt tuned for multi-item sentence decomposition (e.g. *"Spent 30 on lunch and lent 15 to Mark"* -> 2 distinct entries).
4. **Verification:**
   - Unit tests covering single expense, split multi-transaction sentences, lending with names, and invalid category fallbacks.

---

## Sprint 3: Web App Shell, Design System & Auth (`apps/web`)
**Focus:** Next.js App Router, Zelt design tokens, Better Auth, and People/Category CRUD.

### Deliverables:
1. **Design System & Base Shell:**
   - Tailwind CSS config implementing Zelt design tokens (Parchment `#e4e0dd`, Linen `#f6f3ef`, Paper `#ffffff`, Ink `#121718`, Honey `#ffcd6d`, Apricot `#ffe2aa`).
   - 12px pill radius, hairline 1px borders, zero drop shadows.
   - Main layout with floating navigation bar.
2. **Authentication:**
   - Better Auth integration with session providers and route guards.
3. **Categories & People Management:**
   - People management page / modal (manual add/edit: name, required email, optional phone).
   - Category viewer + custom category creation.
4. **Verification:**
   - Auth sign-up / sign-in flow works.
   - User can add a contact and create a custom category.

---

## Sprint 4: AI Dump Interface & Lending Reminders (`apps/web`)
**Focus:** The AI Dump user experience, editable confirmation cards, batch persistence, and email reminders.

### Deliverables:
1. **AI Dump UI:**
   - Freeform natural language input box with quick submit.
   - Real-time parse status indicator.
2. **Editable Confirmation Cards:**
   - Dynamic cards representing each parsed entry before saving.
   - Interactive overrides: change amount, toggle direction, re-select category from dropdown, attach/create person for `lend` entries.
   - Honey-accented "Confirm & Save Entries" primary button.
3. **Transactional Lending Reminders:**
   - API route integrating email provider (e.g. Resend) to send payment reminders to contacts on open `lend` entries.
   - Updates `reminderSentAt` timestamp in DB.
4. **Verification:**
   - Type multi-item prompt -> edit parsed items -> batch save to DB.
   - Trigger reminder email on an open lend entry.

---

## Sprint 5: Pure Aggregation Dashboard & Visual Analytics (`apps/web`)
**Focus:** Zero-AI statistical aggregation, charts, and open debt tracking.

### Deliverables:
1. **Aggregation Backend Queries:**
   - Pure SQL / Drizzle aggregation helpers:
     - Monthly total expenses, income, net savings.
     - Group-by category expense breakdown for current month.
     - Daily / weekly spending trend for current month.
     - Open `lend` entries joined with `people` table.
2. **Dashboard UI:**
   - Summary stat cards (Linen/Paper fill, hairline borders).
   - Category Breakdown Chart (shadcn/Recharts using monochrome / ink-opacity palette, no rainbow colors).
   - Monthly Spending Trend Chart.
   - "Money Owed to You" section with individual contact details and "Send Reminder" button.
3. **Verification:**
   - Aggregations match saved database entries accurately.
   - Responsive layout across desktop and mobile screens.
