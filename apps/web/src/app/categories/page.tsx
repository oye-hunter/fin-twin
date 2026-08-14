'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, Plus, Lock, Loader2 } from 'lucide-react';
import { useCategories, useCreateCategory } from '@/lib/queries';
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';

export default function CategoriesPage() {
  const { data: session } = useSession();
  const { data, isLoading } = useCategories();
  const createCategoryMutation = useCreateCategory();

  const [newCatName, setNewCatName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const categories = data?.categories || [];

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    setError(null);

    try {
      await createCategoryMutation.mutateAsync(newCatName.trim());
      setNewCatName('');
    } catch (err: any) {
      setError(err?.message || 'Error creating category');
    }
  };

  const predefined = categories.filter((c) => c.isPredefined || !c.userId);
  const custom = categories.filter((c) => !c.isPredefined && c.userId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Categories</h1>
        <p className="text-sm text-ink/60 mt-1">
          Categories guide the AI Dump when auto-tagging transactions and categorizing expenses.
        </p>
      </div>

      {/* Add Custom Category Box */}
      {session?.user ? (
        <Card variant="paper" className="p-6">
          <h3 className="text-base font-bold text-ink mb-3">Add Custom Category</h3>
          {error && (
            <div className="mb-4 p-3 rounded-[8px] bg-red-50 text-xs text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Subscriptions, Pet Care, Fitness, Freelance"
              className="flex-1 px-3.5 py-2.5 rounded-[8px] bg-linen border border-ink/10 text-ink text-sm focus:outline-none focus:border-ink/30"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={createCategoryMutation.isPending || !newCatName.trim()}
              className="flex items-center gap-2 font-semibold"
            >
              <Plus className="w-4 h-4" />
              {createCategoryMutation.isPending ? 'Adding...' : 'Add Category'}
            </Button>
          </form>
        </Card>
      ) : (
        <Card variant="linen" className="p-6 flex items-center justify-between">
          <span className="text-sm text-ink/70">
            Sign in to create your own custom categories.
          </span>
          <Link href="/login">
            <Button size="sm" variant="primary">
              Sign In
            </Button>
          </Link>
        </Card>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-ink/40" />
        </div>
      ) : (
        <>
          {/* Custom Categories */}
          {custom.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-ink">Custom Categories</h2>
              <div className="flex flex-wrap gap-2.5">
                {custom.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant="honey"
                    className="text-[14px] px-4 py-2 border border-ink/10 font-semibold"
                  >
                    <Tag className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Predefined Categories */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-ink">Starter Categories</h2>
            <div className="flex flex-wrap gap-2.5">
              {predefined.map((cat) => (
                <Badge
                  key={cat.id}
                  variant="linen"
                  className="text-[14px] px-4 py-2 border border-ink/10"
                >
                  <Lock className="w-3.5 h-3.5 mr-1.5 opacity-40" />
                  {cat.name}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
