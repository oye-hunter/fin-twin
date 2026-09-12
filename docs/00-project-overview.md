# Fin-Twin (Financial Twin) — Project Overview

## What this is
**Fin-Twin** (Financial Twin) is a personal finance web app (Next.js) with two core modules and two supporting manual modules:

1. **AI Dump** — user types a free-text sentence describing money movement (expense, income, or money lent/borrowed). An AI agent (Groq) parses it into one or more structured entries, shown as editable confirmation cards before saving.
2. **Dashboard** — pure aggregation (no AI) of saved entries: monthly totals, category breakdown, trend over time, and a "money owed to you" section.
3. **People** — manual add/list of people (name, email required, phone optional). Used to attach a "lend" entry to a real person so a reminder email can be sent.
4. **Categories** — a predefined starter set (Food, Groceries, Fuel, Transport, Trips, Bills, Rent, Entertainment, etc.) plus user-created custom categories.

## Explicit scope decisions (do not deviate without asking)
- **Web app only.** No mobile app, no React Native.
- **AI is used only in the Dump module.** The Dashboard does zero AI calls — it is pure math/aggregation over already-structured data. This is a deliberate cost control, not an oversight.
- **People are added manually only.** The AI never auto-creates a person. If a dump entry mentions an unrecognized name, the UI prompts the user to manually pick an existing person or add a new one — the AI does not guess or auto-create.
- **Categories are picked from existing list (predefined + custom) by the AI**, but **new categories are created by the user only**, never invented/created by the AI on the fly. If the AI can't confidently match a category, it falls back to "Uncategorized."
- **Reminder emails require a real send** (via an email provider), not just a mailto link — this should trigger from a "Send reminder" button next to any open lend entry.
- **Chat-platform inbound dump: Telegram, not Discord.** Discord bots cannot DM a user unless the user shares a server with the bot, and receiving free-text messages requires a persistent Gateway WebSocket connection rather than a simple webhook. Telegram allows a direct 1:1 chat with the bot (no shared server needed) over a stateless webhook, which fits this app's use case (a personal, private dump channel) and infra (serverless Next.js API routes) far better. WhatsApp is the eventual production target for the same flow, planned after Telegram validates it, due to WhatsApp Business API's longer approval/verification lead time.

## Tech stack
- **Framework:** Next.js (App Router), TypeScript
- **Monorepo:** Turborepo + pnpm workspaces
- **Database:** NeonDB (serverless Postgres) via Drizzle ORM
- **Auth:** Better Auth
- **AI provider:** Groq SDK (see `packages/core` pattern below) — fast inference matters here, since the dump module should feel near-instant. Default model is `openai/gpt-oss-20b` (see note below).
- **Email:** a transactional email provider (e.g. Resend) for reminder sends
- **UI:** Tailwind CSS + shadcn/ui components (including shadcn's chart wrapper, which uses Recharts underneath)
- **Validation:** Zod, shared between the AI agent's structured output and form input
- **Forms:** React Hook Form + Zod

### Note on the Groq model
The original default model, `llama-3.3-70b-versatile`, has moved to Groq's Enterprise/Contact-Sales tier and is no longer usable on a standard pay-as-you-go API key. The current default is `openai/gpt-oss-20b` — fast (~1000 tok/s), cheap, and supports Groq's strict Structured Outputs mode (schema-enforced JSON), which is a genuine upgrade over the old JSON Object Mode fallback-parsing approach. If parsing quality on ambiguous or multi-entry dumps needs more headroom, `openai/gpt-oss-120b` is the next step up (same structured-output support, higher cost/quality). Do not hardcode a model ID outside the env-var default in `groqModel()`.

## Monorepo structure
```
apps/
  web/                  → the Next.js app (only app in the monorepo)

packages/
  core/                 → the AI agent (dump parsing). Same pattern as an existing
                          working reference: Groq client, retry loop, Zod-validated
                          structured output, deterministic fallback on failure.
    src/
      agent.ts           → parseDumpEntries() — main entry point
      prompt.ts          → SYSTEM_PROMPT + buildPrompt(rawText, knownCategories)
      dump.ts             → Zod schema for AI output (array of parsed entries)
      categories.ts        → validates AI-chosen category against known list,
                            falls back to "Uncategorized" if AI invents one
      types.ts
      index.ts

  db/
    src/
      client.ts           → Drizzle + NeonDB client
      env.ts               → env var validation
      schema.ts            → people, categories, entries tables (+ Phase 2 additions,
                            see 01-data-model.md: telegram_links, budgets, repayments)
      seed.ts               → seeds default categories
      index.ts
    drizzle.config.ts
```

## Design reference
See `02-design-system.md` for the full token set. This app uses the "Zelt" warm-editorial
style: cream/parchment canvas, near-black ink text, one honey-amber accent used only for
primary actions, pill-shaped 12px-radius components, hairline borders, no drop shadows.

## Project status
The hackathon build (Sprints 1–5 in `03-sprint-plan.md`) is complete and shipped. The project is now in an active post-hackathon phase (Sprint 6 onward) — hardening the AI provider, adding a Telegram-based inbound dump channel, and building out budgets, partial repayments, recurring entries, and eventually WhatsApp.

## How to use these docs with an AI coding agent
Do not paste all four docs into one prompt. Feed them in this order, one sprint at a time:
1. Always give the agent this file (`00-project-overview.md`) as standing context.
2. Give it `01-data-model.md` once schema work starts, and keep it available for any sprint touching the DB.
3. Give it `02-design-system.md` for any sprint that touches UI.
4. Give it **only the current sprint's section** from `03-sprint-plan.md` — not future sprints. Tell it explicitly: "Implement only this sprint. Do not build ahead of scope."
