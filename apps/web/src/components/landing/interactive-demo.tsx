'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface ParsedCardItem {
  amount: number;
  direction: string;
  categoryName: string;
  personName: string | null;
  note: string;
}

export function InteractiveDemo() {
  const [text, setText] = useState('Spent $32 on Thai dinner with Dave and lent $15 to Sarah for dessert');
  const [loading, setLoading] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedCardItem[]>([
    {
      amount: 32,
      direction: 'expense',
      categoryName: 'Food',
      personName: null,
      note: 'Thai dinner with Dave',
    },
    {
      amount: 15,
      direction: 'lend',
      categoryName: 'Uncategorized',
      personName: 'Sarah',
      note: 'dessert',
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  const samplePrompts = [
    'Paid $65 for grocery run and lent $30 to Alex for pizza',
    'Received $4,200 salary and paid $1,150 apartment rent',
    'Spent $22 on morning train ticket to office',
  ];

  const handleTestParse = async (overrideText?: string) => {
    const raw = overrideText || text;
    if (!raw.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/dump/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: raw }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse');
      }

      if (data.entries && data.entries.length > 0) {
        setParsedItems(data.entries);
      } else {
        setError('Could not extract transactions from this sentence.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error executing AI parser');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="demo" className="py-16 max-w-5xl mx-auto px-4 space-y-10">
      <div className="text-center space-y-3">
        <Badge variant="apricot" className="font-semibold text-xs py-1 px-3">
          Interactive Live Parser
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Test the AI Dump in Real Time
        </h2>
        <p className="text-sm sm:text-base text-ink/70 max-w-xl mx-auto">
          Type any conversational expense or lending statement below to see how Fin-Twin parses it into structured cards.
        </p>
      </div>

      <Card variant="paper" className="p-6 md:p-10 border border-ink/10 shadow-sm space-y-6">
        {/* Input Text Area */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">
            Enter any money movement in plain English:
          </label>
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-4 rounded-[12px] bg-linen border border-ink/10 text-ink text-base focus:outline-none focus:border-ink/30 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Preset Prompt Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink/50">Quick examples:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setText(p);
                handleTestParse(p);
              }}
              className="text-xs bg-parchment/80 hover:bg-parchment text-ink px-3 py-1.5 rounded-[8px] border border-ink/8 transition-colors text-left"
            >
              &ldquo;{p}&rdquo;
            </button>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2 border-t border-ink/8">
          <span className="text-xs text-ink/50 hidden sm:inline">
            Tested on live Groq Llama 3.3 endpoint
          </span>
          <Button
            variant="primary"
            disabled={loading || !text.trim()}
            onClick={() => handleTestParse()}
            className="ml-auto font-bold gap-2 text-xs sm:text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Parse Live Sentence
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3.5 rounded-[8px] bg-red-50 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Parsed Output Result Cards */}
        {parsedItems.length > 0 && (
          <div className="pt-4 border-t border-ink/8 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/60 block">
              Generated Structured Output ({parsedItems.length} {parsedItems.length === 1 ? 'entry' : 'entries'}):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {parsedItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-[12px] border transition-all ${
                    item.direction === 'lend'
                      ? 'bg-amber-50/60 border-honey'
                      : 'bg-linen border-ink/8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={item.direction === 'lend' ? 'honey' : 'linen'}
                      className="text-[11px] py-0.5 px-2 capitalize font-semibold"
                    >
                      {item.direction}
                    </Badge>
                    <span className="font-bold text-base text-ink">
                      ${Number(item.amount).toFixed(2)}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-ink">{item.note}</div>
                  <div className="text-[11px] text-ink/50 mt-1 flex items-center gap-2">
                    <span>Category: {item.categoryName}</span>
                    {item.personName && (
                      <>
                        <span>&middot;</span>
                        <span className="text-amber-900 font-semibold">
                          Debtor: {item.personName}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 text-right">
              <Link href="/register">
                <Button size="sm" variant="primary" className="font-bold text-xs gap-1.5">
                  Save Entries with an Account &rarr;
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}
