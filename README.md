# Fin-Twin (Financial Twin)

> **Your AI financial counterpart** — dump raw expenses and lent money in conversational language, track cashflow with deterministic precision, and recover money owed to you without awkward texts.

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-ef4444?logo=turborepo)](https://turbo.build/)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3-f97316)](https://groq.com/)
[![NeonDB](https://img.shields.io/badge/NeonDB-Serverless%20Postgres-00e599?logo=postgresql)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F)](https://orm.drizzle.team/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-v5-ff4154?logo=reactquery)](https://tanstack.com/query)
[![GSAP](https://img.shields.io/badge/GSAP-3.12-88CE02?logo=greensock)](https://gsap.com/)

---

## 🌟 The Problem & The Solution

| The Traditional Problem | The Fin-Twin Solution |
|---|---|
| **Spreadsheet & Form Fatigue:** Selecting 6 dropdowns to log a $3 coffee makes people abandon budgeting. | **Natural Language AI Dump:** Just type or paste: *"Spent $35 on dinner and lent $20 to Sarah for coffee"*. Parsed into structured cards in 200ms. |
| **Awkward Debt Recovery:** Forgetting who owes what for split bills, dinners, or tickets leads to lost money. | **Built-in Contact Lending Tracker:** Attach real contacts to lent money and dispatch 1-click transactional reminder emails. |
| **Hallucinating AI Dashboards:** LLMs doing mathematical calculations on the fly are slow, token-heavy, and error-prone. | **Zero-AI Deterministic Dashboard:** AI is strictly isolated to the intake parser. All analytics and totals are pure, deterministic SQL math. |

---

## ✨ Core Features & Pages

### 1. 🌐 Animated Landing Page (`/`)
* **Editorial Aesthetics:** Warm Zelt styling (Parchment, Linen, Paper, Ink, and single Honey primary accent).
* **GSAP Choreography:** Staggered headline entrance, floating ambient glow badges, and dynamic "Go to Dashboard &rarr;" action button when authenticated.
* **Live Interactive Typing Simulation:** Real-time animated simulator cycling through real-world financial scenarios.
* **Interactive Testing Sandbox:** Visitors can test custom statements live with instant card breakdown.
* **Problem vs. Solution Matrix & FAQs:** Transparent side-by-side comparison explaining the friction-free value proposition.

### 2. 📊 Deterministic Financial Dashboard (`/dashboard`)
* **Zero AI Calls:** Instant, cost-free SQL aggregations via Drizzle ORM.
* **Key Metrics:** Monthly Total Expenses, Monthly Total Income, Net Balance, and Total Money Owed to You.
* **Category Breakdown:** Neutral-palette horizontal bar chart showing category distributions.
* **Spending Trend:** Daily accumulation curve across the current month.
* **Money Owed to You:** Live debt tracker with one-click **"Attach Contact"** and **"Send Reminder"** buttons.

### 3. 🗣️ Conversational AI Dump (`/dump`)
* Parse compound freeform sentences into individual transaction records using Groq's high-speed inference.
* Decomposes multi-item sentences into discrete entries (e.g. separates personal food expenses from money lent to a friend).
* Displays **Editable Confirmation Cards** before saving to the database.
* Case-insensitive category normalizer that matches user/starter categories and falls back strictly to `"Uncategorized"`.

### 4. 📝 Complete Entries Ledger & CRUD (`/entries`)
* Filter by movement type (`All`, `Expenses`, `Income`, `Lent`, `Borrowed`), Category, Debt Status (`Open` vs `Settled`), or text search.
* Direct **"+ Record Entry"** modal for manual income or expense logging without using AI.
* Inline editing, contact attachment, debt status toggles, and delete actions with instant TanStack Query cache synchronization.

### 5. 👥 People & Contact Management (`/people`)
* Manage contacts with name, email (required for reminder dispatch), and optional phone number.
* Contacts link directly to open debts for transactional payment reminders.

### 6. 🏷️ Category Management (`/categories`)
* Predefined starter categories (*Food, Groceries, Fuel, Transport, Trips, Bills, Rent, Entertainment, Salary/Income, Uncategorized*).
* Custom user-defined category creation.

### 7. 🎨 Sidebar Navigation & Responsive Drawer
* **Desktop Sidebar:** Fixed left drawer with instant access to Dashboard, Entries, AI Dump, People, and Categories.
* **Mobile Slide-Over Drawer:** Touch-friendly hamburger menu for smartphones and tablets.
* **Context-Aware Shell:** Sidebar automatically hides on public routes (`/`, `/login`, `/register`) and activates within the app.

---

## 🏗️ Monorepo Architecture

```
fin-twin/
├── apps/
│   └── web/                   → Next.js 15 App Router (React 19, Tailwind CSS, TanStack Query, GSAP)
│       ├── src/app/           → App routes (/, /dashboard, /entries, /dump, /people, /categories, /login)
│       ├── src/components/    → UI design system, sidebar layout, landing sections, dialogs, charts
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
* **AI Provider:** [Groq SDK](https://groq.com/) (`openai/gpt-oss-20b`)
* **Database & ORM:** [NeonDB](https://neon.tech/) (Serverless Postgres) + [Drizzle ORM](https://orm.drizzle.team/)
* **State & Data Fetching:** [TanStack Query v5](https://tanstack.com/query) (React Query)
* **Animation:** [GSAP 3](https://gsap.com/) + [@gsap/react](https://gsap.com/resources/React)
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
