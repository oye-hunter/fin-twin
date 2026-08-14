'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signUp.email({
        name,
        email,
        password,
      });

      if (res.error) {
        setError(res.error.message || 'Failed to create account');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[420px] mx-auto py-12">
      <Card variant="paper" className="p-8 md:p-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Create your Fin-Twin
          </h1>
          <p className="text-sm text-ink/60 mt-1.5">
            Your personalized AI financial counterpart
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-[8px] bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1.5">
              Full name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Smith"
              className="w-full px-3.5 py-2.5 rounded-[8px] bg-linen border border-ink/10 text-ink text-sm focus:outline-none focus:border-ink/30 transition-colors"
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
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-[8px] bg-linen border border-ink/10 text-ink text-sm focus:outline-none focus:border-ink/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              className="w-full px-3.5 py-2.5 rounded-[8px] bg-linen border border-ink/10 text-ink text-sm focus:outline-none focus:border-ink/30 transition-colors"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-ink/60">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-ink underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
