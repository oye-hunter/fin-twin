'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Sparkles,
  Users,
  Tag,
  LogOut,
  Compass,
  X,
} from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/entries', label: 'All Entries', icon: Receipt },
    { href: '/dump', label: 'AI Dump', icon: Sparkles, badge: 'AI' },
    { href: '/people', label: 'People & Debts', icon: Users },
    { href: '/categories', label: 'Categories', icon: Tag },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-linen border-r border-ink/8 flex flex-col justify-between p-5 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between pb-6 mb-4 border-b border-ink/8">
            <Link
              href="/dashboard"
              onClick={onCloseMobile}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-[8px] bg-honey flex items-center justify-center font-bold text-ink text-sm shadow-none">
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

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-[8px] text-ink/50 hover:text-ink hover:bg-parchment transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-paper text-ink border border-ink/8 shadow-none font-semibold'
                      : 'text-ink/70 hover:text-ink hover:bg-parchment/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-ink' : 'text-ink/60'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-honey/80 text-ink px-1.5 py-0.5 rounded-[6px]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account / Footer */}
        <div className="pt-4 border-t border-ink/8 space-y-3">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2 text-xs text-ink/60 hover:text-ink px-2 py-1 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </Link>

          {session?.user ? (
            <div className="bg-paper rounded-[12px] p-3 border border-ink/8 flex items-center justify-between">
              <div className="truncate mr-2">
                <div className="text-xs font-bold text-ink truncate">
                  {session.user.name || 'User'}
                </div>
                <div className="text-[11px] text-ink/50 truncate">
                  {session.user.email}
                </div>
              </div>
              <button
                onClick={() => signOut()}
                title="Sign Out"
                className="p-1.5 text-ink/50 hover:text-ink hover:bg-linen rounded-[8px] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/login" onClick={onCloseMobile} className="block w-full">
                <Button variant="primary" size="sm" className="w-full text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={onCloseMobile} className="block w-full">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  Create Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
