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

---

# Phase 2 — Post-hackathon (in progress)

## Sprint 6: Groq Model Migration
**Focus:** Replace the now enterprise-gated `llama-3.3-70b-versatile` with a pay-as-you-go model, and upgrade to strict Structured Outputs.

### Deliverables:
1. **Model swap:**
   - Update `groqModel()` default in `packages/core/src/agent.ts` to `openai/gpt-oss-20b`.
2. **Structured Outputs upgrade:**
   - Switch from JSON Object Mode to Groq's strict Structured Outputs mode (schema-enforced), supported by `gpt-oss-20b`.
   - Simplify or remove the `extractJson()` fallback-parsing step where the strict mode makes it redundant.
3. **Regression check:**
   - Re-run the existing dump parser test suite (single expense, multi-item decomposition, lending with names, invalid category fallback) against the new model.
   - If parsing quality on ambiguous/multi-entry dumps regresses, fall back to `openai/gpt-oss-120b` instead.
4. **Verification:**
   - Dump parsing works end-to-end on the new model with equal or better accuracy than before.
   - No code hardcodes the old model ID anywhere outside the env-var default.

---

## Sprint 7: Slack Bot — Inbound AI Dump
**Focus:** Prove the "chat app → AI dump" flow end-to-end on Slack (chosen over Telegram, which is blocked/throttled in Pakistan, and over Discord, which can't DM a user without a shared server — see `00-project-overview.md` scope decisions for rationale).

### Deliverables:
1. **Slack App & Event Handling:**
   - New Slack app in a private single-user workspace (for testing).
   - Events API endpoint in `apps/web` (e.g. `/api/slack/events`) subscribed to `message.im`, or Socket Mode for local dev without a public URL.
2. **Account Linking:**
   - New `slack_links` table (see `01-data-model.md`).
   - User generates a one-time code in the web app's settings; sends it once to the bot's DM to link their Slack user ID to their Fin-Twin account.
3. **Message Handling:**
   - Text messages route directly into the existing `parseDumpEntries()`.
   - Voice messages: download the audio file attachment, transcribe (Groq's Whisper models), then route into the same parser.
   - Bot replies via `chat.postMessage` with a short structured summary and asks for confirmation ("Got it: Rs 800 · Food · today. Reply yes to save, or tell me what's wrong") before writing to the DB.
4. **Scope — out (do not build yet):** WhatsApp itself; proactive reminder sends over Slack (reminders stay on email for now).
5. **Verification:**
   - A linked user can send a text or voice message to the bot's DM and see the resulting entry appear in their web dashboard after confirming.

---

## Sprint 8: Budgets Per Category
**Focus:** Monthly spending caps per category, surfaced on the dashboard. Pure math, no AI.

### Deliverables:
1. **Schema:**
   - New `budgets` table (see `01-data-model.md`).
2. **Settings UI:**
   - Set/edit a monthly limit per category.
3. **Dashboard:**
   - Show "X% of budget used" per category with a limit set, built on the existing category-breakdown aggregation query.
4. **Verification:**
   - Setting a budget on a category shows correct percentage-used on the dashboard for the current month, with no AI calls involved.

---

## Sprint 9: Settle-Up / Partial Repayment
**Focus:** Support partial paybacks against an open lend entry instead of only a binary open/settled toggle.

### Deliverables:
1. **Schema:**
   - New `repayments` table (see `01-data-model.md`), keyed to a parent entry.
2. **UI:**
   - On the "money owed to you" list: show remaining balance after partial payments, add a "log repayment" action.
3. **Dashboard update:**
   - Net out repayments in the "money owed" aggregation.
4. **Verification:**
   - Logging a partial repayment correctly reduces the outstanding balance shown for that person.
   - An entry only moves to `settled` when its balance hits zero.

---

## Sprint 10: Recurring Entries
**Focus:** Let the user mark an entry as recurring (rent, subscriptions, salary) so it auto-populates monthly instead of being re-dumped every time.

### Deliverables:
1. **Schema:**
   - `isRecurring`, `recurrenceInterval` fields on `entries` (or a separate `recurring_templates` table).
2. **Scheduled job:**
   - Cron (e.g. Vercel Cron) that creates the month's instance from active templates.
3. **UI:**
   - View/manage active recurring entries.
4. **Verification:**
   - A recurring entry created once continues to appear in future months' dashboards without manual re-entry.

---

## Sprint 11: Shareable Balance Summary
**Focus:** Let the user export or share a clean summary of what a specific person owes them.

### Deliverables:
1. **Summary generation:**
   - PDF or shareable read-only link showing one person's full lend/repayment history and current balance.
2. **UI:**
   - "Share" action from the person's row in the "money owed" list.
3. **Verification:**
   - A generated summary accurately reflects the entry + repayment history for that person, and can be opened without logging in (link) or downloaded (PDF).

---

## Sprint 12: WhatsApp Integration
**Focus:** Bring the same inbound-dump + confirmation flow to WhatsApp, plus outbound reminder sends, after the Slack flow (Sprint 7) is proven.

### Deliverables:
1. **WhatsApp Business API setup:**
   - Meta Cloud API or Twilio. Expect approval/verification lead time — start this early.
2. **Inbound flow:**
   - Reuse the webhook → transcribe (if voice) → `parseDumpEntries()` → confirm → save flow built for Slack.
3. **Outbound:**
   - "Send Reminder" option to deliver via WhatsApp template message, alongside the existing email option.
4. **Verification:**
   - Feature parity with the Telegram flow.
   - At least one successful outbound reminder template message delivered.
