'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Mail, Phone, Loader2 } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';

interface Person {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export default function PeoplePage() {
  const { data: session, isPending: sessionPending } = useSession();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/people');
      const data = await res.json();
      if (data.people) {
        setPeople(data.people);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchPeople();
    } else if (!sessionPending) {
      setLoading(false);
    }
  }, [session, sessionPending]);

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add contact');
      }

      setName('');
      setEmail('');
      setPhone('');
      setShowAddModal(false);
      fetchPeople();
    } catch (err: any) {
      setError(err?.message || 'Error adding contact');
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionPending || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-ink/40" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <Card variant="paper" className="text-center py-16">
        <h2 className="text-xl font-bold text-ink">Sign in to manage contacts</h2>
        <p className="text-sm text-ink/60 mt-2 mb-6">
          Add friends and colleagues to attach to lent money and automated reminder emails.
        </p>
        <Link href="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">People & Contacts</h1>
          <p className="text-sm text-ink/60 mt-1">
            Manual contacts for tracking lent/borrowed money and sending payment reminders.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add Person
        </Button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm p-4">
          <Card variant="paper" className="w-full max-w-[440px] p-6 relative">
            <h2 className="text-xl font-bold text-ink mb-1">Add Contact</h2>
            <p className="text-xs text-ink/60 mb-6">
              Name and email are required to send payment reminders.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-[8px] bg-red-50 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleAddPerson} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink/70 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 rounded-[8px] bg-linen border border-ink/10 text-ink text-sm focus:outline-none focus:border-ink/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink/70 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="w-full px-3.5 py-2.5 rounded-[8px] bg-linen border border-ink/10 text-ink text-sm focus:outline-none focus:border-ink/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink/70 mb-1.5">
                  Phone number (optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 rounded-[8px] bg-linen border border-ink/10 text-ink text-sm focus:outline-none focus:border-ink/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Person'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* People Grid */}
      {people.length === 0 ? (
        <Card variant="linen" className="text-center py-16">
          <Users className="w-10 h-10 text-ink/30 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-ink">No contacts added yet</h3>
          <p className="text-xs text-ink/60 mt-1 max-w-sm mx-auto">
            Contacts you add here will be linked whenever you record lent money in the AI Dump.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((p) => (
            <Card key={p.id} variant="paper" className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-linen flex items-center justify-center font-bold text-ink text-sm border border-ink/8">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-bold text-ink">{p.name}</h4>
                  <Badge variant="apricot" className="text-[11px] py-0.5 px-2 mt-0.5">
                    Contact
                  </Badge>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-ink/70 mt-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-ink/40" />
                  <span>{p.email}</span>
                </div>
                {p.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-ink/40" />
                    <span>{p.phone}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
