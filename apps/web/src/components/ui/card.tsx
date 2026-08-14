import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'paper' | 'linen' | 'graphite';
  children: React.ReactNode;
}

export function Card({
  variant = 'paper',
  className,
  children,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-[12px] p-6 md:p-8 transition-all';

  const variants = {
    paper: 'bg-paper text-ink border border-ink/8 shadow-none',
    linen: 'bg-linen text-ink border border-ink/8 shadow-none',
    graphite: 'bg-graphite text-paper border border-white/10 shadow-none',
  };

  return (
    <div
      className={twMerge(clsx(baseStyles, variants[variant], className))}
      {...props}
    >
      {children}
    </div>
  );
}
