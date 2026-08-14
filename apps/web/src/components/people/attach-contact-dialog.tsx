'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, X, Loader2, Check } from 'lucide-react';
import { usePeople, useCreatePerson, useUpdateEntry } from '@/lib/queries';

interface AttachContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entryId: string;
  entryAmount: number;
  entryNote?: string | null;
  currentPersonId?: string | null;
}

export function AttachContactDialog({
  isOpen,
  onClose,
  entryId,
  entryAmount,
  entryNote,
  currentPersonId,
}: AttachContactDialogProps) {
  const { data: peopleData, isLoading: peopleLoading } = usePeople();
  const createPersonMutation = useCreatePerson();
  const updateEntryMutation = useUpdateEntry();

  const [selectedPersonId, setSelectedPersonId] = useState<string>(currentPersonId || '');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const people = peopleData?.people || [];

  const handleAttachExisting = async () => {
    if (!selectedPersonId) return;
    setError(null);

    try {
      await updateEntryMutation.mutateAsync({
        id: entryId,
        updates: { personId: selectedPersonId },
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to attach contact');
    }
  };

  const handleCreateAndAttach = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newName.trim() || !newEmail.trim()) {
      setError('Name and Email are required');
      return;
    }

    try {
      const res = await createPersonMutation.mutateAsync({
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        phone: newPhone.trim() || null,
      });

      const newPersonId = res.person.id;
      await updateEntryMutation.mutateAsync({
        id: entryId,
        updates: { personId: newPersonId },
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create and attach contact');
    }
  };

  const isPending = updateEntryMutation.isPending || createPersonMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <Card variant="paper" className="w-full max-w-[460px] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-[8px] text-ink/40 hover:text-ink hover:bg-linen transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <Badge variant="honey" className="mb-1 text-[11px]">
            Lent Money Tracker
          </Badge>
          <h2 className="text-xl font-bold text-ink">Attach Contact</h2>
          <p className="text-xs text-ink/60 mt-0.5">
            Link a contact to ${entryAmount.toFixed(2)} {entryNote ? `("${entryNote}")` : ''} to enable payment reminder emails.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-[8px] bg-red-50 text-xs text-red-700">
            {error}
          </div>
        )}

        {!isCreatingNew ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink/70 mb-1.5">
                Select from existing contacts
              </label>
              {peopleLoading ? (
                <div className="py-4 text-center text-xs text-ink/40">Loading contacts...</div>
              ) : people.length === 0 ? (
                <div className="p-4 rounded-[8px] bg-linen border border-ink/8 text-center text-xs text-ink/60">
                  No contacts found in your account yet.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {people.map((p) => (
                    <label
                      key={p.id}
                      className={`flex items-center justify-between p-3 rounded-[8px] border cursor-pointer transition-colors ${
                        selectedPersonId === p.id
                          ? 'border-honey bg-amber-50/40'
                          : 'border-ink/8 bg-linen/50 hover:bg-linen'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="person"
                          value={p.id}
                          checked={selectedPersonId === p.id}
                          onChange={() => setSelectedPersonId(p.id)}
                          className="accent-ink"
                        />
                        <div>
                          <div className="text-xs font-bold text-ink">{p.name}</div>
                          <div className="text-[11px] text-ink/50">{p.email}</div>
                        </div>
                      </div>
                      {selectedPersonId === p.id && (
                        <Check className="w-4 h-4 text-ink" />
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-ink/8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="text-xs font-semibold text-ink underline flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + Add New Contact
              </button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!selectedPersonId || isPending}
                  onClick={handleAttachExisting}
                >
                  {isPending ? 'Attaching...' : 'Attach Contact'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateAndAttach} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-ink/70 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2 rounded-[8px] bg-linen border border-ink/10 text-xs text-ink focus:outline-none focus:border-ink/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink/70 mb-1">
                Email Address (required for reminders)
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full px-3 py-2 rounded-[8px] bg-linen border border-ink/10 text-xs text-ink focus:outline-none focus:border-ink/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink/70 mb-1">
                Phone Number (optional)
              </label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-[8px] bg-linen border border-ink/10 text-xs text-ink focus:outline-none focus:border-ink/30"
              />
            </div>

            <div className="pt-3 border-t border-ink/8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="text-xs font-semibold text-ink underline"
              >
                &larr; Back to list
              </button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save & Attach'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
