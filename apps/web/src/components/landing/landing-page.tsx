'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  Users,
  Send,
  BarChart3,
  Zap,
  Calculator,
  Layers,
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="space-y-20 py-4 md:py-8">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[12px] bg-apricot text-ink text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          The Zelt Warm Editorial Financial Counterpart
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-ink leading-[1.05]">
          Financial clarity, spoken naturally.
        </h1>

        <p className="text-base sm:text-lg text-ink/70 max-w-2xl mx-auto leading-relaxed">
          Stop wrestling with endless form dropdowns. Dump your expenses, income, and lent money in conversational sentences. Fin-Twin parses the chaos, tracks your cashflow, and recovers money owed to you.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" className="w-full sm:w-auto font-bold gap-2">
              Get Started with Fin-Twin
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dump" className="w-full sm:w-auto">
            <Button size="lg" variant="ghost" className="w-full sm:w-auto">
              Try AI Dump Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Interactive Transformation Demo Showcase */}
      <section className="max-w-4xl mx-auto">
        <Card variant="paper" className="p-6 md:p-10 border border-ink/10 shadow-sm relative overflow-hidden">
          <div className="text-xs uppercase tracking-wider font-bold text-ink/40 mb-4">
            How It Works in Practice
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Input Side */}
            <div className="p-5 rounded-[12px] bg-linen border border-ink/8 space-y-3">
              <span className="text-[11px] font-bold text-ink/60 uppercase tracking-wider block">
                1. Your Natural Thought
              </span>
              <p className="text-base text-ink font-medium italic leading-relaxed">
                &ldquo;Paid $48.50 for dinner with Alex and lent $25 to Sarah for the Uber ride&rdquo;
              </p>
              <div className="flex items-center gap-2 pt-2 text-[11px] text-ink/50">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Parsed via Groq Llama 3.3 in 180ms</span>
              </div>
            </div>

            {/* Output Side */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-ink/60 uppercase tracking-wider block">
                2. Structured Confirmation Cards
              </span>

              {/* Card 1 */}
              <div className="p-3.5 rounded-[10px] bg-paper border border-ink/10 flex items-center justify-between shadow-none">
                <div>
                  <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <span>Dinner with Alex</span>
                    <span className="bg-linen text-ink/70 text-[10px] px-1.5 py-0.5 rounded">Food</span>
                  </div>
                  <span className="text-[11px] text-ink/50">Expense &middot; Today</span>
                </div>
                <div className="font-bold text-sm text-ink">-$48.50</div>
              </div>

              {/* Card 2 */}
              <div className="p-3.5 rounded-[10px] bg-amber-50/50 border border-honey flex items-center justify-between shadow-none">
                <div>
                  <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <span>Uber ride</span>
                    <span className="bg-amber-100 text-ink text-[10px] px-1.5 py-0.5 rounded">Sarah (Debtor)</span>
                  </div>
                  <span className="text-[11px] text-ink/50">Lend &middot; Open Debt</span>
                </div>
                <div className="font-bold text-sm text-ink">$25.00</div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Problem vs Solution 3-Pillar Section */}
      <section className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-ink">
            What Problems Does Fin-Twin Solve?
          </h2>
          <p className="text-sm text-ink/60 max-w-xl mx-auto">
            Traditional finance apps force you into rigid menus. Pure AI bots hallucinate numbers. Fin-Twin blends the best of both.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <Card variant="paper" className="p-7 space-y-4">
            <div className="w-10 h-10 rounded-[10px] bg-linen flex items-center justify-center border border-ink/8">
              <Sparkles className="w-5 h-5 text-ink" />
            </div>
            <h3 className="text-lg font-bold text-ink">No More Form Fatigue</h3>
            <div className="text-xs text-ink/60 space-y-2 leading-relaxed">
              <p>
                <strong className="text-red-700">The Problem:</strong> Opening a banking app to select 6 dropdown menus for one coffee makes people quit budgeting in a week.
              </p>
              <p>
                <strong className="text-ink">Fin-Twin:</strong> Just type or paste your thoughts. Our AI splits multi-item sentences into clean, reviewable cards in seconds.
              </p>
            </div>
          </Card>

          {/* Pillar 2 */}
          <Card variant="paper" className="p-7 space-y-4">
            <div className="w-10 h-10 rounded-[10px] bg-linen flex items-center justify-center border border-ink/8">
              <Users className="w-5 h-5 text-ink" />
            </div>
            <h3 className="text-lg font-bold text-ink">Zero Awkward Debt Collection</h3>
            <div className="text-xs text-ink/60 space-y-2 leading-relaxed">
              <p>
                <strong className="text-red-700">The Problem:</strong> Forgetting who owes you money for concert tickets or shared dinners leads to lost cash and awkward texts.
              </p>
              <p>
                <strong className="text-ink">Fin-Twin:</strong> Automatically tracks lent money, links real contacts, and sends gentle 1-click email reminders.
              </p>
            </div>
          </Card>

          {/* Pillar 3 */}
          <Card variant="paper" className="p-7 space-y-4">
            <div className="w-10 h-10 rounded-[10px] bg-linen flex items-center justify-center border border-ink/8">
              <Calculator className="w-5 h-5 text-ink" />
            </div>
            <h3 className="text-lg font-bold text-ink">Deterministic Precision (Zero AI Hallucinations)</h3>
            <div className="text-xs text-ink/60 space-y-2 leading-relaxed">
              <p>
                <strong className="text-red-700">The Problem:</strong> AI dashboards that recalculate numbers on the fly are slow, expensive, and often make math mistakes.
              </p>
              <p>
                <strong className="text-ink">Fin-Twin:</strong> AI is isolated strictly to the Dump parser. All charts and totals are pure, deterministic SQL math.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Band */}
      <section className="max-w-4xl mx-auto">
        <Card variant="linen" className="p-8 md:p-12 text-center space-y-4 border border-ink/10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Ready to meet your financial twin?
          </h2>
          <p className="text-sm text-ink/70 max-w-md mx-auto">
            Take control of your cashflow in minutes with effortless natural language logging.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <Button size="lg" variant="primary" className="font-bold">
                Create Free Account
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
