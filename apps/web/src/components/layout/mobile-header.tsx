'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  onOpenMobile: () => void;
}

export function MobileHeader({ onOpenMobile }: MobileHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-30 w-full bg-paper/95 backdrop-blur-md border-b border-ink/8 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-[8px] text-ink/70 hover:text-ink hover:bg-linen transition-colors"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[6px] bg-honey flex items-center justify-center font-bold text-ink text-xs">
            FT
          </div>
          <span className="text-base font-bold tracking-tight text-ink">
            fin-twin
          </span>
        </Link>
      </div>

      <Link href="/dump">
        <Button size="sm" variant="primary" className="text-xs px-3 py-1.5 gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Dump
        </Button>
      </Link>
    </header>
  );
}
