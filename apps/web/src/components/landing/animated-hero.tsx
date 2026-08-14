'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  Send,
  UserPlus,
  LayoutDashboard,
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const DEMO_SCENARIOS = [
  {
    raw: 'Paid $48.50 for dinner with Alex and lent $25 to Sarah for the Uber ride',
    items: [
      {
        title: 'Dinner with Alex',
        category: 'Food',
        type: 'Expense',
        amount: '-$48.50',
        meta: 'Today &middot; Personal',
        isLend: false,
      },
      {
        title: 'Uber ride',
        category: 'Sarah (Debtor)',
        type: 'Lend &middot; Open Debt',
        amount: '$25.00',
        meta: '1-click email reminder ready',
        isLend: true,
      },
    ],
  },
  {
    raw: 'Received $3,500 freelance client payment and paid $1,200 apartment rent',
    items: [
      {
        title: 'Freelance client payment',
        category: 'Salary/Income',
        type: 'Income',
        amount: '+$3,500.00',
        meta: 'Net positive cashflow',
        isLend: false,
      },
      {
        title: 'Apartment rent',
        category: 'Rent',
        type: 'Expense',
        amount: '-$1,200.00',
        meta: 'Monthly fixed bill',
        isLend: false,
      },
    ],
  },
  {
    raw: 'Bought concert tickets for $120 and lent $60 to Mark for his ticket',
    items: [
      {
        title: 'Concert ticket',
        category: 'Entertainment',
        type: 'Expense',
        amount: '-$60.00',
        meta: 'Today &middot; Personal share',
        isLend: false,
      },
      {
        title: 'Concert ticket share',
        category: 'Mark (Debtor)',
        type: 'Lend &middot; Open Debt',
        amount: '$60.00',
        meta: 'mark@example.com linked',
        isLend: true,
      },
    ],
  },
];

export function AnimatedHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // GSAP Entrance Timeline
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-badge', { opacity: 0, y: -15, duration: 0.6 })
        .from('.hero-title', { opacity: 0, y: 25, duration: 0.8 }, '-=0.3')
        .from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.7 }, '-=0.5')
        .from('.hero-cta', { opacity: 0, y: 15, duration: 0.6, stagger: 0.1 }, '-=0.4')
        .from('.hero-demo-card', { opacity: 0, y: 30, duration: 0.9 }, '-=0.3');
    },
    { scope: containerRef }
  );

  // Scenario typing simulation
  useEffect(() => {
    let currentIdx = 0;
    const targetText = DEMO_SCENARIOS[activeScenarioIdx].raw;
    setDisplayText('');
    setIsTyping(true);

    const interval = setInterval(() => {
      if (currentIdx < targetText.length) {
        setDisplayText(targetText.slice(0, currentIdx + 1));
        currentIdx++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [activeScenarioIdx]);

  return (
    <section ref={containerRef} className="pt-10 sm:pt-16 pb-12 text-center max-w-5xl mx-auto px-4">
      {/* Top Pill Badge */}
      <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] bg-apricot text-ink text-xs font-semibold mb-6 shadow-sm">
        <Sparkles className="w-3.5 h-3.5" />
        <span>The Zelt Warm Editorial Financial Counterpart</span>
      </div>

      {/* Main Headline */}
      <h1 className="hero-title text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-ink leading-[1.05] max-w-4xl mx-auto">
        Financial clarity, <br className="hidden sm:inline" />
        spoken naturally.
      </h1>

      {/* Subtitle */}
      <p className="hero-subtitle text-base sm:text-lg md:text-xl text-ink/70 max-w-2xl mx-auto mt-6 leading-relaxed font-normal">
        No tedious form dropdowns. Dump your expenses, income, and lent money in conversational sentences. Fin-Twin parses the chaos, tracks your ledger, and recovers money owed to you.
      </p>

      {/* CTA Buttons with Dynamic State */}
      <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-8">
        {session?.user ? (
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" className="w-full sm:w-auto font-bold gap-2 text-base shadow-sm">
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard &rarr;
            </Button>
          </Link>
        ) : (
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" className="w-full sm:w-auto font-bold gap-2 text-base shadow-sm">
              Start Free with Fin-Twin
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}

        <Link href="/dump" className="w-full sm:w-auto">
          <Button size="lg" variant="ghost" className="w-full sm:w-auto text-base">
            Try Interactive AI Dump
          </Button>
        </Link>
      </div>

      {/* Live Simulation Card */}
      <div className="hero-demo-card mt-14 max-w-4xl mx-auto text-left">
        <Card variant="paper" className="p-6 md:p-8 border border-ink/10 shadow-sm relative overflow-hidden">
          {/* Top scenario selector tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-ink/8">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50">
                Live Parsing Simulation:
              </span>
              <Badge variant="linen" className="text-[11px] py-0.5 px-2">
                Groq 180ms
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['Dinner + Lending', 'Freelance + Rent', 'Concert Tickets'].map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveScenarioIdx(idx)}
                  className={`text-xs px-3 py-1 rounded-[8px] font-semibold transition-all whitespace-nowrap ${
                    activeScenarioIdx === idx
                      ? 'bg-ink text-paper'
                      : 'bg-linen text-ink/70 hover:bg-parchment'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout: Input Thought vs Parsed Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Input Side */}
            <div className="p-5 rounded-[12px] bg-linen border border-ink/8 space-y-3 min-h-[160px] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-ink/60 uppercase tracking-wider block mb-1">
                  Conversational Text Input
                </span>
                <p className="text-base text-ink font-medium leading-relaxed">
                  &ldquo;{displayText}
                  <span className={`inline-block w-1.5 h-4 bg-ink ml-1 align-middle ${isTyping ? 'animate-pulse' : 'opacity-0'}`} />
                  &rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 text-[11px] text-ink/50 border-t border-ink/6">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>AI splits compound statements into discrete items</span>
              </div>
            </div>

            {/* Output Structured Cards Side */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-ink/60 uppercase tracking-wider block">
                Structured Confirmation Cards (Zero Manual Forms)
              </span>

              {DEMO_SCENARIOS[activeScenarioIdx].items.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-[10px] border flex items-center justify-between transition-all ${
                    item.isLend
                      ? 'bg-amber-50/60 border-honey shadow-none'
                      : 'bg-paper border-ink/10 shadow-none'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-ink flex items-center gap-1.5 flex-wrap">
                      <span>{item.title}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          item.isLend ? 'bg-amber-100 text-amber-900' : 'bg-linen text-ink/70'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-ink/50 block mt-0.5">{item.meta}</span>
                  </div>

                  <div
                    className={`font-bold text-sm tracking-tight ${
                      item.amount.startsWith('+') ? 'text-green-700' : 'text-ink'
                    }`}
                  >
                    {item.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
