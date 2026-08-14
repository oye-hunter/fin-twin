'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  BarChart3,
  Users,
  Tag,
  Receipt,
  Palette,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export function FeaturesGrid() {
  const features = [
    {
      icon: Sparkles,
      badge: 'AI Intake',
      title: 'Conversational Dump Parser',
      description:
        'Powered by Groq Llama 3.3. Decomposes compound multi-item thoughts into structured, editable confirmation cards in under 200ms.',
      link: '/dump',
      linkText: 'Try AI Dump',
    },
    {
      icon: Users,
      badge: 'Lending Tracker',
      title: '1-Click Transactional Reminders',
      description:
        'Attach real contacts to lent money. Send gentle, formatted payment reminder emails directly from your dashboard with one click.',
      link: '/people',
      linkText: 'Manage Contacts',
    },
    {
      icon: BarChart3,
      badge: 'Zero-AI Math',
      title: 'Deterministic Analytics',
      description:
        'AI never touches your dashboard math. Pure SQL aggregations compute expenses, income, net savings, and category breakdowns with 100% accuracy.',
      link: '/dashboard',
      linkText: 'Explore Dashboard',
    },
    {
      icon: Receipt,
      badge: 'Full Control',
      title: 'Complete Ledger & CRUD',
      description:
        'Filter by expenses, income, lent, or borrowed. Add manual entries on the fly, toggle debt statuses between Open and Settled, or edit records.',
      link: '/entries',
      linkText: 'View Ledger',
    },
    {
      icon: Tag,
      badge: 'Categorization',
      title: 'Predefined + Custom Categories',
      description:
        'AI matches against starter categories or your custom tags. If ambiguous, it falls back strictly to "Uncategorized" without hallucinating.',
      link: '/categories',
      linkText: 'Custom Categories',
    },
    {
      icon: Palette,
      badge: 'Design System',
      title: 'Zelt Warm Editorial Design',
      description:
        'Sunlit Parchment canvas, crisp paper cards, hairline borders, and a single Honey accent. No cold enterprise clutter or blinding blue buttons.',
      link: '/dashboard',
      linkText: 'See Design',
    },
  ];

  return (
    <section id="features" className="py-16 max-w-5xl mx-auto px-4 space-y-12">
      <div className="text-center space-y-3">
        <Badge variant="honey" className="font-bold text-xs py-1 px-3">
          Comprehensive Features
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Crafted for calm, effortless money management.
        </h2>
        <p className="text-sm sm:text-base text-ink/70 max-w-xl mx-auto">
          Every component is designed to remove friction from daily tracking while giving you absolute mathematical clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <Card
              key={idx}
              variant="paper"
              className="p-6 md:p-7 space-y-4 hover:border-ink/20 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-[10px] bg-linen flex items-center justify-center border border-ink/8 text-ink group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="linen" className="text-[11px] py-0.5 px-2">
                    {f.badge}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-ink tracking-tight">{f.title}</h3>
                <p className="text-xs sm:text-sm text-ink/65 leading-relaxed">
                  {f.description}
                </p>
              </div>

              <div className="pt-3 border-t border-ink/6">
                <Link
                  href={f.link}
                  className="text-xs font-bold text-ink underline flex items-center gap-1 group-hover:text-amber-800 transition-colors"
                >
                  <span>{f.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
