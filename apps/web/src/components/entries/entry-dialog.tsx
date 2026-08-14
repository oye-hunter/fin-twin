'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';
import { useCategories, usePeople, useCreateEntry, useUpdateEntry, EntryItem } from '@/lib/queries';

interface EntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: EntryItem | null;
  defaultDirection?: 'income' | 'expense' | 'lend' | 'borrow';
}

export function EntryDialog({
  isOpen,
  onClose,
  entryToEdit,
  defaultDirection = 'expense',
}: EntryDialogProps) {
  const { data: catData } = useCategories();
  const { data: peopleData } = usePeople();
  const createEntryMutation = useCreateEntry();
  const updateEntryMutation = useUpdateEntry();

  const [direction, setDirection] = useState<'income' | 'expense' | 'lend' | 'borrow'>(
    defaultDirection
  );
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [personId, setPersonId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'open' | 'settled'>('open');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entryToEdit) {
      setDirection(entryToEdit.direction);
      setAmount(entryToEdit.amount.toString());
      setCategoryId(entryToEdit.categoryId || '');
      setPersonId(entryToEdit.personId || '');
      setDate(entryToEdit.date);
      setNote(entryToEdit.note || '');
      setStatus(entryToEdit.status || 'open');
    } else {
      setDirection(defaultDirection);
      setAmount('');
      setCategoryId('');
      setPersonId('');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setStatus('open');
    }
  }, [entryToEdit, defaultDirection, isOpen]);

  if (!isOpen) return null;

  const categories = catData?.categories || [];
  const people = peopleData?.people || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }

    try {
      if (entryToEdit) {
        await updateEntryMutation.mutateAsync({
          id: entryToEdit.id,
          updates: {
            amount: numAmount,
            direction,
            categoryId: categoryId || null,
            personId: (direction === 'lend' || direction === 'borrow') ? (personId || null) : null,
            date,
            note: note.trim() || null,
            status: (direction === 'lend' || direction === 'borrow') ? status : null,
          },
        });
      } else {
        await createEntryMutation.mutateAsync({
          amount: numAmount,
          direction,
          categoryId: categoryId || null,
          personId: (direction === 'lend' || direction === 'borrow') ? (personId || null) : null,
          date,
          note: note.trim() || null,
          status: (direction === 'lend' || direction === 'borrow') ? status : null,
        });
      }

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save entry');
    }
  };

  const isPending = createEntryMutation.isPending || updateEntryMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <Card variant="paper" className="w-full max-w-[480px] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-[8px] text-ink/40 hover:text-ink hover:bg-linen transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-bold text-ink mb-1">
          {entryToEdit ? 'Edit Transaction' : 'Record Transaction'}
        </h2>
        <p className="text-xs text-ink/60 mb-5">
          {entryToEdit
            ? 'Modify transaction details, re-categorize, or adjust status.'
            : 'Manually add income, expense, or lent money to your twin.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-[8px] bg-red-50 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Direction Tabs */}
          <div>
            <label className="block text-[11px] font-semibold text-ink/60 uppercase mb-1.5">
              Type of Movement
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-linen rounded-[10px] border border-ink/8">
              {(['expense', 'income', 'lend', 'borrow'] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setDirection(dir)}
                  className={`py-1.5 rounded-[8px] text-xs font-semibold capitalize transition-all ${
                    direction === dir
                      ? 'bg-paper text-ink shadow-sm'
                      : 'text-ink/60 hover:text-ink'
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-ink/60 uppercase mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-[8px] bg-linen border border-ink/10 text-base font-bold text-ink focus:outline-none focus:border-ink/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-ink/60 uppercase mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] bg-linen border border-ink/10 text-xs text-ink focus:outline-none focus:border-ink/30"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-ink/60 uppercase mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-[8px] bg-linen border border-ink/10 text-xs text-ink focus:outline-none focus:border-ink/30"
            >
              <option value="">Select Category (Optional)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Person Selector for Lend / Borrow */}
          {(direction === 'lend' || direction === 'borrow') && (
            <div className="p-3.5 rounded-[10px] bg-amber-50/40 border border-honey/50 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-ink/70 uppercase mb-1">
                  Attached Contact ({direction === 'lend' ? 'Debtor' : 'Creditor'})
                </label>
                <select
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  className="w-full px-3 py-2 rounded-[8px] bg-paper border border-ink/10 text-xs text-ink focus:outline-none focus:border-ink/30"
                >
                  <option value="">No Contact Attached</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink/70 uppercase mb-1">
                  Debt Status
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="open"
                      checked={status === 'open'}
                      onChange={() => setStatus('open')}
                      className="accent-ink"
                    />
                    <span>Open (Pending repayment)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="settled"
                      checked={status === 'settled'}
                      onChange={() => setStatus('settled')}
                      className="accent-ink"
                    />
                    <span>Settled (Repaid)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Note / Description */}
          <div>
            <label className="block text-[11px] font-semibold text-ink/60 uppercase mb-1">
              Note / Description
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Monthly freelance salary, Thai dinner, Concert ticket"
              className="w-full px-3 py-2 rounded-[8px] bg-linen border border-ink/10 text-xs text-ink focus:outline-none focus:border-ink/30"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-ink/8">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isPending}>
              {isPending
                ? 'Saving...'
                : entryToEdit
                ? 'Update Entry'
                : 'Save Entry'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
