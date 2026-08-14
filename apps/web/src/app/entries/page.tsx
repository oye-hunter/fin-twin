'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Send,
  UserPlus,
  ArrowUpRight,
  ArrowDownLeft,
  HandCoins,
  CheckCircle2,
  Loader2,
  Tag,
  Receipt,
} from 'lucide-react';
import {
  useEntries,
  useCategories,
  useDeleteEntry,
  useUpdateEntry,
  useSendReminder,
  EntryItem,
} from '@/lib/queries';
import { EntryDialog } from '@/components/entries/entry-dialog';
import { AttachContactDialog } from '@/components/people/attach-contact-dialog';
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';

export default function EntriesPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const { data: catData } = useCategories();

  // Filters State
  const [directionFilter, setDirectionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs State
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EntryItem | null>(null);
  const [attachDialogState, setAttachDialogState] = useState<{
    isOpen: boolean;
    entryId: string;
    amount: number;
    note?: string | null;
    personId?: string | null;
  }>({
    isOpen: false,
    entryId: '',
    amount: 0,
  });

  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  // TanStack Queries & Mutations
  const { data, isLoading } = useEntries({
    direction: directionFilter,
    categoryId: categoryFilter,
    status: statusFilter,
    search: searchQuery,
  });

  const deleteEntryMutation = useDeleteEntry();
  const updateEntryMutation = useUpdateEntry();
  const sendReminderMutation = useSendReminder();

  const entries = data?.entries || [];
  const categories = catData?.categories || [];

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setIsEntryDialogOpen(true);
  };

  const handleOpenEdit = (entry: EntryItem) => {
    setEditingEntry(entry);
    setIsEntryDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction entry?')) {
      await deleteEntryMutation.mutateAsync(id);
    }
  };

  const handleToggleStatus = async (entry: EntryItem) => {
    const nextStatus = entry.status === 'open' ? 'settled' : 'open';
    await updateEntryMutation.mutateAsync({
      id: entry.id,
      updates: { status: nextStatus },
    });
  };

  const handleSendReminder = async (entry: EntryItem) => {
    setReminderMessage(null);
    try {
      await sendReminderMutation.mutateAsync(entry.id);
      setReminderMessage(`Reminder dispatched to ${entry.personName || 'debtor'}!`);
    } catch (err: any) {
      setReminderMessage(err?.message || 'Failed to send reminder email');
    }
  };

  if (!sessionPending && !session?.user) {
    return (
      <Card variant="paper" className="text-center py-16">
        <h2 className="text-xl font-bold text-ink">Sign in to view all transactions</h2>
        <p className="text-sm text-ink/60 mt-2 mb-6">
          Access your complete financial ledger with income, expenses, and lent tracking.
        </p>
        <Link href="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">All Entries</h1>
          <p className="text-sm text-ink/60 mt-1">
            Complete transaction ledger with manual edits, income recording, and debt tracking.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 self-start sm:self-auto font-semibold"
        >
          <Plus className="w-4 h-4" />
          Record Entry
        </Button>
      </div>

      {reminderMessage && (
        <div className="p-3.5 rounded-[12px] bg-paper border border-ink/10 text-xs text-ink flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          {reminderMessage}
        </div>
      )}

      {/* Filter Toolbar */}
      <Card variant="paper" className="p-5 space-y-4">
        {/* Direction Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-linen rounded-[10px] border border-ink/8 w-fit">
          {[
            { id: 'all', label: 'All' },
            { id: 'expense', label: 'Expenses' },
            { id: 'income', label: 'Income' },
            { id: 'lend', label: 'Lent' },
            { id: 'borrow', label: 'Borrowed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDirectionFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                directionFilter === tab.id
                  ? 'bg-paper text-ink shadow-sm'
                  : 'text-ink/60 hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category/Status dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-ink/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes or names..."
              className="w-full pl-9 pr-3 py-2 rounded-[8px] bg-linen border border-ink/10 text-xs text-ink focus:outline-none focus:border-ink/30"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-[8px] bg-linen border border-ink/10 text-xs text-ink focus:outline-none focus:border-ink/30"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {(directionFilter === 'lend' || directionFilter === 'borrow' || directionFilter === 'all') && (
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] bg-linen border border-ink/10 text-xs text-ink focus:outline-none focus:border-ink/30"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open Debts Only</option>
                <option value="settled">Settled Only</option>
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Entries List Table / Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-ink/40" />
        </div>
      ) : entries.length === 0 ? (
        <Card variant="linen" className="text-center py-16">
          <Receipt className="w-10 h-10 text-ink/30 mx-auto mb-3" />
          <h3 className="text-base font-bold text-ink">No transactions found</h3>
          <p className="text-xs text-ink/60 mt-1 max-w-sm mx-auto mb-4">
            Try adjusting your search filters, recording a manual entry, or using the AI Dump.
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            + Record Entry
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const isIncome = entry.direction === 'income';
            const isLend = entry.direction === 'lend';
            const isBorrow = entry.direction === 'borrow';

            return (
              <Card
                key={entry.id}
                variant="paper"
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-ink/20 transition-all"
              >
                {/* Left details */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${
                      isIncome
                        ? 'bg-green-100 text-green-800'
                        : isLend
                        ? 'bg-amber-100 text-ink'
                        : isBorrow
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-linen text-ink border border-ink/8'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : isLend ? (
                      <HandCoins className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-ink">
                        {entry.note || entry.categoryName || 'Transaction'}
                      </span>
                      <Badge
                        variant={isIncome ? 'honey' : 'linen'}
                        className="text-[11px] py-0.5 px-2 capitalize"
                      >
                        {entry.direction}
                      </Badge>
                      {entry.categoryName && (
                        <span className="text-[11px] text-ink/60 bg-linen px-2 py-0.5 rounded-[6px] border border-ink/6">
                          {entry.categoryName}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-ink/50 flex items-center gap-2 mt-1 flex-wrap">
                      <span>{entry.date}</span>
                      {(isLend || isBorrow) && (
                        <>
                          <span>&middot;</span>
                          {entry.personName ? (
                            <span className="font-semibold text-ink/80 flex items-center gap-1">
                              Contact: {entry.personName} {entry.personEmail ? `(${entry.personEmail})` : ''}
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                setAttachDialogState({
                                  isOpen: true,
                                  entryId: entry.id,
                                  amount: entry.amount,
                                  note: entry.note,
                                  personId: entry.personId,
                                })
                              }
                              className="text-amber-800 font-semibold underline flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-[4px]"
                            >
                              <UserPlus className="w-3 h-3" />
                              + Attach Contact
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right actions & amount */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-ink/8">
                  {/* Status Toggle for Debts */}
                  {(isLend || isBorrow) && (
                    <button
                      onClick={() => handleToggleStatus(entry)}
                      title="Click to toggle debt status"
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-[6px] transition-colors ${
                        entry.status === 'settled'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {entry.status === 'settled' ? '✓ Settled' : '⏳ Open'}
                    </button>
                  )}

                  {/* Amount */}
                  <div
                    className={`font-bold text-lg tracking-tight ${
                      isIncome ? 'text-green-700' : 'text-ink'
                    }`}
                  >
                    {isIncome ? '+' : '-'}${entry.amount.toFixed(2)}
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center gap-1">
                    {/* Send reminder button if lend + open + has email */}
                    {isLend && entry.status === 'open' && entry.personEmail && (
                      <button
                        onClick={() => handleSendReminder(entry)}
                        disabled={sendReminderMutation.isPending}
                        title="Send payment reminder email"
                        className="p-1.5 rounded-[6px] text-ink/60 hover:text-ink hover:bg-linen transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}

                    {/* Edit button */}
                    <button
                      onClick={() => handleOpenEdit(entry)}
                      title="Edit transaction"
                      className="p-1.5 rounded-[6px] text-ink/60 hover:text-ink hover:bg-linen transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleteEntryMutation.isPending}
                      title="Delete transaction"
                      className="p-1.5 rounded-[6px] text-ink/40 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Entry Dialog (Add/Edit) */}
      <EntryDialog
        isOpen={isEntryDialogOpen}
        onClose={() => setIsEntryDialogOpen(false)}
        entryToEdit={editingEntry}
      />

      {/* Attach Contact Dialog */}
      <AttachContactDialog
        isOpen={attachDialogState.isOpen}
        onClose={() => setAttachDialogState((prev) => ({ ...prev, isOpen: false }))}
        entryId={attachDialogState.entryId}
        entryAmount={attachDialogState.amount}
        entryNote={attachDialogState.note}
        currentPersonId={attachDialogState.personId}
      />
    </div>
  );
}
