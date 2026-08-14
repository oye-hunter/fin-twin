'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, LayoutDashboard, LogIn } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

export function LandingNav() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-4 z-50 w-full max-w-[1140px] mx-auto px-4 sm:px-6">
      <div className="bg-paper/90 backdrop-blur-md rounded-[16px] border border-ink/8 px-5 sm:px-7 py-3 flex items-center justify-between shadow-sm">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-[8px] bg-honey flex items-center justify-center font-bold text-ink text-sm transition-transform group-hover:scale-105">
            FT
          </div>
          <div>
            <span className="text-[17px] font-bold tracking-tight text-ink block leading-none">
              fin-twin
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-ink/40 block mt-0.5">
              Financial Twin
            </span>
          </div>
        </Link>

        {/* Navigation Anchors */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-ink/70">
          <a href="#how-it-works" className="hover:text-ink transition-colors">
            How It Works
          </a>
          <a href="#problems" className="hover:text-ink transition-colors">
            Why Fin-Twin
          </a>
          <a href="#features" className="hover:text-ink transition-colors">
            Features
          </a>
          <a href="#demo" className="hover:text-ink transition-colors">
            Interactive Demo
          </a>
          <a href="#faq" className="hover:text-ink transition-colors">
            FAQ
          </a>
        </nav>

        {/* Dynamic CTA */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <Link href="/dashboard">
              <Button size="sm" variant="primary" className="font-bold text-xs gap-1.5 shadow-sm">
                <LayoutDashboard className="w-3.5 h-3.5" />
                Go to Dashboard &rarr;
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost" className="text-xs px-3.5 font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="primary" className="text-xs font-bold gap-1.5 shadow-sm">
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
