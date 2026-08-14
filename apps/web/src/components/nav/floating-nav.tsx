'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, LayoutDashboard, Users, Tag, LogOut, ArrowRight } from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

export function FloatingNav() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dump', label: 'AI Dump', icon: Sparkles },
    { href: '/people', label: 'People', icon: Users },
    { href: '/categories', label: 'Categories', icon: Tag },
  ];

  return (
    <header className="sticky top-6 z-50 w-full max-w-[1100px] mx-auto px-4">
      <div className="bg-paper/95 backdrop-blur-md rounded-[12px] border border-ink/8 px-6 py-3.5 flex items-center justify-between shadow-sm">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-[8px] bg-honey flex items-center justify-center font-bold text-ink text-sm">
            FT
          </div>
          <span className="text-[17px] font-bold tracking-tight text-ink">
            fin-twin
          </span>
          <span className="hidden sm:inline-block text-[11px] uppercase tracking-wider text-ink/40 bg-linen px-2 py-0.5 rounded-[6px]">
            Financial Twin
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'bg-linen text-ink'
                    : 'text-ink/70 hover:text-ink hover:bg-parchment/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-2">
          {!isPending && session?.user ? (
            <div className="flex items-center gap-3">
              <span className="hidden lg:inline text-xs text-ink/60 font-medium truncate max-w-[140px]">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                title="Sign out"
                className="p-2 rounded-[8px] text-ink/60 hover:text-ink hover:bg-linen transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="primary" className="text-[13px] px-3.5 py-1.5">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
