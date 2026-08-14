'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn.email({
        email,
        password,
      });

      if (res.error) {
        setError(res.error.message || 'Invalid email or password');
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
            Welcome back to Fin-Twin
          </h1>
          <p className="text-sm text-ink/60 mt-1.5">
            Log in to view your financial twin
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
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-[8px] bg-linen border border-ink/10 text-ink text-sm focus:outline-none focus:border-ink/30 transition-colors"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-ink/60">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-ink underline">
            Create account
          </Link>
        </div>
      </Card>
    </div>
  );
}
