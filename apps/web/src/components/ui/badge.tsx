import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'apricot' | 'linen' | 'ink' | 'honey';
  children: React.ReactNode;
}

export function Badge({
  variant = 'apricot',
  className,
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    'inline-flex items-center px-3 py-1 rounded-[12px] text-[13px] font-medium tracking-tight';

  const variants = {
    apricot: 'bg-apricot text-ink',
    linen: 'bg-linen text-ink border border-ink/8',
    honey: 'bg-honey text-ink',
    ink: 'bg-ink text-paper',
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, variants[variant], className))}
      {...props}
    >
      {children}
    </span>
  );
}
