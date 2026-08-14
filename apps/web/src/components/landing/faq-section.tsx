'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function FAQSection() {
  const faqs = [
    {
      q: 'How is Fin-Twin different from regular budgeting apps?',
      a: 'Regular apps require you to click 5-6 dropdown menus for every single coffee or lunch. Fin-Twin lets you type or speak conversational text. Our Groq AI decomposes complex multi-item sentences into clean records in under 200ms.',
    },
    {
      q: 'Does Fin-Twin use AI for calculating monthly analytics?',
      a: 'No! AI is used strictly for parsing raw text during intake. Once entries are confirmed, all dashboard analytics, totals, category graphs, and trends are computed with 100% deterministic SQL. This guarantees zero hallucinations and instantaneous load times.',
    },
    {
      q: 'How does the lending reminder email feature work?',
      a: 'When you record money lent to a friend (e.g. "lent $40 to Sarah"), you can attach their contact with their email. Fin-Twin places it in your "Money Owed to You" tracker. A single click dispatches a polite, formatted transactional email reminder.',
    },
    {
      q: 'Can I add or edit entries manually without using the AI?',
      a: 'Yes. The "All Entries" page includes a full ledger with an "+ Add Entry" button, inline editing for categories, amounts, and dates, and instant status toggles between Open and Settled debts.',
    },
  ];

  return (
    <section id="faq" className="py-16 max-w-4xl mx-auto px-4 space-y-12">
      <div className="text-center space-y-3">
        <Badge variant="apricot" className="font-semibold text-xs py-1 px-3">
          Frequently Asked Questions
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Clear answers for a clear financial twin.
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <Card key={idx} variant="paper" className="p-6 md:p-7 space-y-2">
            <h3 className="text-base font-bold text-ink flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{item.q}</span>
            </h3>
            <p className="text-xs sm:text-sm text-ink/70 leading-relaxed pl-6">
              {item.a}
            </p>
          </Card>
        ))}
      </div>

      {/* Final Bottom CTA */}
      <Card variant="linen" className="p-8 sm:p-12 text-center space-y-4 border border-ink/10 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          Experience effortless money tracking today.
        </h2>
        <p className="text-sm text-ink/70 max-w-md mx-auto">
          Join Fin-Twin and turn chaotic transaction notes into structured, automated clarity.
        </p>
        <div className="pt-3">
          <Link href="/register">
            <Button size="lg" variant="primary" className="font-bold gap-2 text-base">
              Create Your Financial Twin Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </section>
  );
}
