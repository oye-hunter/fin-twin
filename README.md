# Fin-Twin (Financial Twin)

> **Your AI financial counterpart** — dump raw expenses and lent money in conversational language, track cashflow with deterministic precision, and recover money owed to you without awkward texts.

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-ef4444?logo=turborepo)](https://turbo.build/)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3-f97316)](https://groq.com/)
[![NeonDB](https://img.shields.io/badge/NeonDB-Serverless%20Postgres-00e599?logo=postgresql)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F)](https://orm.drizzle.team/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-v5-ff4154?logo=reactquery)](https://tanstack.com/query)

---

## 🌟 The Problem & The Solution

| The Traditional Problem | The Fin-Twin Solution |
|---|---|
| **Spreadsheet & Form Fatigue:** Selecting 6 dropdowns to log a $3 coffee makes people abandon budgeting. | **Natural Language AI Dump:** Just type or paste: *"Spent $35 on dinner and lent $20 to Sarah for coffee"*. Parsed into structured cards in 200ms. |
| **Awkward Debt Recovery:** Forgetting who owes what for split bills, dinners, or tickets leads to lost money. | **Built-in Contact Lending Tracker:** Attach real contacts to lent money and dispatch 1-click transactional reminder emails. |
| **Hallucinating AI Dashboards:** LLMs doing mathematical calculations on the fly are slow, token-heavy, and error-prone. | **Zero-AI Deterministic Dashboard:** AI is strictly isolated to the intake parser. All analytics and totals are pure, deterministic SQL math. |

---

## ✨ Core Features

### 1. 🗣️ Conversational AI Dump (`/dump`)
* Parse compound freeform sentences into individual transaction records using Groq's high-speed inference.
* Decomposes multi-item sentences into discrete entries (e.g. separates personal food expenses from money lent to a friend).
* Displays **Editable Confirmation Cards** before saving to the database.
* Case-insensitive category normalizer that matches user/starter categories and falls back strictly to `"Uncategorized"`.

### 2. 📊 Deterministic Dashboard (`/`)
* **Zero AI Calls:** Instant, cost-free SQL aggregations via Drizzle ORM.
* **Key Metrics:** Monthly Total Expenses, Monthly Total Income, Net Balance, and Total Money Owed to You.
* **Category Breakdown:** Neutral-palette horizontal bar chart showing category distributions.
* **Spending Trend:** Daily accumulation curve across the current month.
* **Money Owed to You:** Live debt tracker with one-click **"Attach Contact"** and **"Send Reminder"** buttons.

### 3. 📝 Complete Entries Ledger & CRUD (`/entries`)
* Filter by movement type (`All`, `Expenses`, `Income`, `Lent`, `Borrowed`), Category, Debt Status (`Open` vs `Settled`), or text search.
* Direct **"+ Record Entry"** modal for manual income or expense logging without using AI.
* Inline editing, contact attachment, debt status toggles, and delete actions with instant TanStack Query cache invalidation.

### 4. 👥 People & Contact Management (`/people`)
* Manage contacts with name, email (required for reminder dispatch), and optional phone number.
* Contacts link directly to open debts for transactional payment reminders.

### 5. 🏷️ Category Management (`/categories`)
* Predefined starter categories (*Food, Groceries, Fuel, Transport, Trips, Bills, Rent, Entertainment, Salary/Income, Uncategorized*).
* Custom user-defined category creation.

### 6. 🎨 "Zelt" Warm Editorial Design System
* **Warm Neutral Palette:** Sunlit Parchment canvas (`#e4e0dd`), Linen (`#f6f3ef`), Paper (`#ffffff`), and deep Ink (`#121718`).
* **Single Accent Rule:** Honey Amber (`#ffcd6d`) is reserved exclusively for the primary call-to-action per view.
* **Shape Language:** 12px pill radius, hairline borders (`1px` at `8%` opacity), and **zero drop shadows**.
* **Responsive Sidebar & Mobile Drawer:** Full desktop sidebar with slide-over drawer for mobile devices.

---

## 🏗️ Monorepo Architecture

```
fin-twin/
├── apps/
│   └── web/                   → Next.js 15 App Router (React 19, Tailwind CSS, TanStack Query)
│       ├── src/app/           → App routes (/, /entries, /dump, /people, /categories, /landing, /login)
│       ├── src/components/    → UI design system, sidebar layout, dialogs, charts
│       └── src/lib/           → TanStack Query hooks, Better Auth client, email utility
├── packages/
│   ├── core/                  → Groq AI Dump parser, Zod output schemas, category matching engine
│   └── db/                    → Drizzle ORM + NeonDB Postgres schema, client, and seed script
├── docs/                      → Technical documentation & specifications
│   ├── 00-project-overview.md
│   ├── 01-data-model.md
│   ├── 02-design-system.md
│   └── 03-sprint-plan.md
├── package.json               → Turborepo root workspace
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), TypeScript
* **Monorepo:** [Turborepo](https://turbo.build/) + [pnpm workspaces](https://pnpm.io/)
* **AI Provider:** [Groq SDK](https://groq.com/) (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`)
* **Database & ORM:** [NeonDB](https://neon.tech/) (Serverless Postgres) + [Drizzle ORM](https://orm.drizzle.team/)
* **State & Data Fetching:** [TanStack Query v5](https://tanstack.com/query) (React Query)
* **Authentication:** [Better Auth](https://better-auth.com/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) ("Zelt" editorial design tokens)
* **Data Visualization:** [Recharts](https://recharts.org/)
* **Transactional Email:** [Resend API](https://resend.com/)

---

## 🚀 Getting Started

### 1. Prerequisites
* [Node.js](https://nodejs.org/) `>= 18.0.0`
* [pnpm](https://pnpm.io/) `>= 9.0.0`

### 2. Clone & Install
```bash
git clone https://github.com/oye-hunter/fin-twin.git
cd fin-twin

# Install dependencies across all monorepo workspaces
pnpm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`):
```env
# NeonDB Serverless Postgres
DATABASE_URL="postgresql://user:password@endpoint-pooler.region.aws.neon.tech/neondb?sslmode=require"

# Groq API Key
GROQ_KEY="gsk_your_groq_api_key_here"

# Transactional Email (Optional for payment reminders)
RESEND_API_KEY="re_your_resend_key_here"
EMAIL_FROM="Fin-Twin <onboarding@resend.dev>"

# Better Auth Secret
BETTER_AUTH_SECRET="your-32-character-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
```

### 4. Database Setup & Seed
```bash
# Push schema migrations to NeonDB
pnpm --filter @fin-twin/db db:push

# Seed starter categories
pnpm --filter @fin-twin/db db:seed
```

### 5. Start Development Server
```bash
# Start Next.js web application
pnpm --filter web dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

```bash
# Run database schema & connection tests
pnpm --filter @fin-twin/db test

# Run Groq AI Dump parser test suite
pnpm --filter @fin-twin/core test

# Run full monorepo build verification
pnpm build
```

---

## 📄 License
MIT &copy; [oye-hunter](https://github.com/oye-hunter)
