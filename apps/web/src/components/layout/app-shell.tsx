'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { MobileHeader } from './mobile-header';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Public routes without sidebar
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/landing' ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register');

  if (isPublicRoute) {
    return <div className="min-h-screen bg-parchment flex flex-col">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-parchment flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <MobileHeader onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          {children}
        </main>
        <footer className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-ink/40 border-t border-ink/5">
          Fin-Twin &copy; {new Date().getFullYear()} &middot; Personal Financial Twin &middot; Zelt Warm Editorial Design
        </footer>
      </div>
    </div>
  );
}
