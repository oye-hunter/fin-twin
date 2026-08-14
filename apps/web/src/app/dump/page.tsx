'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Trash2, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { useCategories, usePeople } from '@/lib/queries';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ParsedCardItem {
  id: string;
  amount: number;
  direction: 'income' | 'expense' | 'lend' | 'borrow';
  categoryName: string;
  categoryId?: string | null;
  personName?: string | null;
  personId?: string | null;
  date: string;
  note: string;
}

export default function DumpPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { data: catData } = useCategories();
  const { data: peopleData } = usePeople();

  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsedCards, setParsedCards] = useState<ParsedCardItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const categories = catData?.categories || [];
  const people = peopleData?.people || [];

  const samplePrompts = [
    'Spent $45 on groceries and lent $20 to Sarah for coffee',
    'Received 3500 salary and paid 1100 rent',
    'Paid 24 for taxi to airport on Monday',
  ];

  const handleParse = async (textToParse?: string) => {
    const text = textToParse || rawText;
    if (!text.trim()) return;

    setParsing(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/dump/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse text');
      }

      if (data.entries && data.entries.length > 0) {
        const cards: ParsedCardItem[] = data.entries.map((item: any, idx: number) => {
          const cat = categories.find(
            (c) => c.name.toLowerCase() === item.categoryName?.toLowerCase()
          );

          const p = item.personName
            ? people.find((pers) => pers.name.toLowerCase() === item.personName?.toLowerCase())
            : null;

          return {
            id: 'card-' + Date.now() + '-' + idx,
            amount: item.amount,
            direction: item.direction,
            categoryName: item.categoryName || 'Uncategorized',
            categoryId: cat?.id || null,
            personName: item.personName || null,
            personId: p?.id || null,
            date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
            note: item.note || text,
          };
        });

        setParsedCards(cards);
      } else {
        setError('AI could not identify transactions from this text. Try another phrasing.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with AI parser');
    } finally {
      setParsing(false);
    }
  };

  const handleUpdateCard = (id: string, field: keyof ParsedCardItem, value: any) => {
    setParsedCards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;
        return { ...card, [field]: value };
      })
    );
  };

  const handleDeleteCard = (id: string) => {
    setParsedCards((prev) => prev.filter((card) => card.id !== id));
  };

  const handleSaveAll = async () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    if (parsedCards.length === 0) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/entries/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsedCards }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save entries');
      }

      // Invalidate TanStack query cache for instant sync
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      setSaveSuccess(true);
      setParsedCards([]);
      setRawText('');
    } catch (err: any) {
      setError(err?.message || 'Failed to save entries to database');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="honey" className="gap-1.5 py-1 px-3 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Natural Language Ingestion
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-ink">AI Dump</h1>
        <p className="text-sm text-ink/60 mt-1 max-w-2xl">
          Dump your expenses, income, or lent money in plain conversational text. Fin-Twin will decompose and structure it into editable confirmation cards.
        </p>
      </div>

      {/* Input Box */}
      <Card variant="paper" className="p-6 md:p-8 space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink/60">
            Write or paste financial notes
          </label>
          <textarea
            rows={3}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleParse();
              }
            }}
            placeholder="e.g. Spent $32 on Thai food with Mark and lent $50 to David for concert tickets"
            className="w-full p-4 rounded-[12px] bg-linen border border-ink/10 text-ink text-base focus:outline-none focus:border-ink/30 transition-colors resize-none placeholder:text-ink/40 font-normal leading-relaxed"
          />
        </div>

        {/* Prompt Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-ink/50">Try:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setRawText(p);
                handleParse(p);
              }}
              className="text-xs bg-parchment/70 hover:bg-parchment text-ink/80 px-3 py-1.5 rounded-[8px] border border-ink/8 transition-colors text-left truncate max-w-[320px]"
            >
              &ldquo;{p}&rdquo;
            </button>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[12px] text-ink/40 hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-parchment text-ink/70">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-parchment text-ink/70">Enter</kbd> to parse
          </span>
          <Button
            variant="primary"
            disabled={parsing || !rawText.trim()}
            onClick={() => handleParse()}
            className="ml-auto flex items-center gap-2 font-semibold"
          >
            {parsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Parsing with Groq...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Parse Sentence
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-[12px] bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success banner */}
      {saveSuccess && (
        <Card variant="linen" className="p-6 border-green-200 bg-[#f4faf4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <h4 className="font-bold text-ink text-sm">Entries saved to database!</h4>
              <p className="text-xs text-ink/60 mt-0.5">
                Your transactions are instantly synchronized with your dashboard and ledger.
              </p>
            </div>
          </div>
          <Link href="/">
            <Button size="sm" variant="primary" className="flex items-center gap-1.5 font-semibold">
              View Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </Card>
      )}

      {/* Parsed Confirmation Cards Section */}
      {parsedCards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink">
              Review & Confirm ({parsedCards.length} {parsedCards.length === 1 ? 'entry' : 'entries'})
            </h2>
            <Button
              variant="primary"
              disabled={saving}
              onClick={handleSaveAll}
              className="flex items-center gap-2 font-semibold"
            >
              {saving ? 'Saving...' : 'Save All Entries'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsedCards.map((card) => (
              <Card key={card.id} variant="paper" className="p-6 space-y-4 relative group">
                <button
                  type="button"
                  onClick={() => handleDeleteCard(card.id)}
                  title="Remove entry"
                  className="absolute top-4 right-4 p-1.5 text-ink/30 hover:text-red-600 hover:bg-red-50 rounded-[6px] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Amount & Direction Header */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-ink/60 uppercase mb-1">
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={card.amount}
                      onChange={(e) =>
                        handleUpdateCard(card.id, 'amount', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 rounded-[8px] bg-linen border border-ink/10 font-bold text-lg text-ink focus:outline-none focus:border-ink/30"
                    />
                  </div>

                  <div className="w-[140px]">
                    <label className="block text-[11px] font-semibold text-ink/60 uppercase mb-1">
                      Direction
                    </label>
                    <select
                      value={card.direction}
                      onChange={(e) =>
                        handleUpdateCard(card.id, 'direction', e.target.value)
                      }
                      className="w-full px-3 py-2.5 rounded-[8px] bg-linen border border-ink/10 text-sm font-medium text-ink focus:outline-none focus:border-ink/30 capitalize"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                      <option value="lend">Lend</option>
                      <option value="borrow">Borrow</option>
                    </select>
                  </div>
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-ink/60 uppercase mb-1">
                      Category
                    </label>
                    <select
                      value={card.categoryId || ''}
                      onChange={(e) => {
                        const cat = categories.find((c) => c.id === e.target.value);
                        handleUpdateCard(card.id, 'categoryId', e.target.value);
                        if (cat) handleUpdateCard(card.id, 'categoryName', cat.name);
                      }}
                      className="w-full px-3 py-2 rounded-[8px] bg-linen border border-ink/10 text-xs text-ink focus:outline-none focus:border-ink/30"
                    >
                      <option value="">{card.categoryName || 'Select category'}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-ink/60 uppercase mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={card.date}
                      onChange={(e) => handleUpdateCard(card.id, 'date', e.target.value)}
                      className="w-full px-3 py-2 rounded-[8px] bg-linen border border-ink/10 text-xs text-ink focus:outline-none focus:border-ink/30"
                    />
                  </div>
                </div>

                {/* Person selector for Lend/Borrow */}
                {(card.direction === 'lend' || card.direction === 'borrow') && (
                  <div>
                    <label className="block text-[11px] font-semibold text-ink/60 uppercase mb-1">
                      Attach Person (for payment reminders)
                    </label>
                    <select
                      value={card.personId || ''}
                      onChange={(e) => {
                        const p = people.find((pers) => pers.id === e.target.value);
                        handleUpdateCard(card.id, 'personId', e.target.value);
                        if (p) handleUpdateCard(card.id, 'personName', p.name);
                      }}
                      className="w-full px-3 py-2 rounded-[8px] bg-amber-50/60 border border-honey text-xs text-ink focus:outline-none focus:border-ink/30"
                    >
                      <option value="">
                        {card.personName ? `Detected: ${card.personName}` : 'Select contact'}
                      </option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Note */}
                <div>
                  <label className="block text-[11px] font-semibold text-ink/60 uppercase mb-1">
                    Note / Description
                  </label>
                  <input
                    type="text"
                    value={card.note}
                    onChange={(e) => handleUpdateCard(card.id, 'note', e.target.value)}
                    className="w-full px-3 py-2 rounded-[8px] bg-linen border border-ink/10 text-xs text-ink focus:outline-none focus:border-ink/30"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
