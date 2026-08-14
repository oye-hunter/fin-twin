'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XCircle, CheckCircle2 } from 'lucide-react';

export function ComparisonSection() {
  const comparisonItems = [
    {
      problem: 'Selecting 6 form dropdowns (category, account, date, tag) for a $3 coffee',
      solution: 'Type or speak plain sentences — AI parses amounts, dates, and categories in 200ms',
    },
    {
      problem: 'Forgetting who owes you money for concert tickets or shared Airbnb bookings',
      solution: 'Built-in lending tracker with 1-click transactional email reminders',
    },
    {
      problem: 'AI dashboards that make math errors and cost high token fees on every view',
      solution: 'Deterministic, zero-AI aggregations: pure SQL calculation with zero hallucination',
    },
    {
      problem: 'Cold, cluttered enterprise interfaces with 50 flashing blue buttons',
      solution: 'Zelt Warm Editorial design: soothing parchment, crisp paper, and 1 Honey accent',
    },
  ];

  return (
    <section id="problems" className="py-16 max-w-5xl mx-auto px-4 space-y-10">
      <div className="text-center space-y-3">
        <Badge variant="apricot" className="font-semibold text-xs py-1 px-3">
          The Problem We Solve
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Why traditional finance apps fail.
        </h2>
        <p className="text-sm sm:text-base text-ink/70 max-w-xl mx-auto">
          Budgeting shouldn&apos;t feel like filing taxes. Here is how Fin-Twin transforms your daily money workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* The Old Way */}
        <Card variant="linen" className="p-6 md:p-8 space-y-6 border border-ink/10">
          <div className="flex items-center gap-2.5 text-red-700 font-bold text-lg border-b border-ink/8 pb-4">
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>The Old Way (Spreadsheets &amp; Dropdowns)</span>
          </div>

          <div className="space-y-4">
            {comparisonItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-red-500 font-bold text-sm shrink-0 mt-0.5">&times;</span>
                <p className="text-xs sm:text-sm text-ink/70 leading-relaxed font-normal">
                  {item.problem}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* The Fin-Twin Way */}
        <Card variant="paper" className="p-6 md:p-8 space-y-6 border-honey shadow-sm bg-amber-50/20">
          <div className="flex items-center gap-2.5 text-ink font-bold text-lg border-b border-ink/8 pb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span>The Fin-Twin Way (Spoken Simplicity)</span>
          </div>

          <div className="space-y-4">
            {comparisonItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-ink font-medium leading-relaxed">
                  {item.solution}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
