import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-[12px]';

  const variants = {
    primary:
      'bg-honey text-ink hover:bg-[#f7c45f] active:bg-[#ebb750]', // Honey primary CTA
    secondary:
      'bg-linen text-ink border border-ink/10 hover:bg-parchment active:bg-[#dad5d1]',
    ghost:
      'bg-transparent text-ink border border-ink/15 hover:bg-linen active:bg-parchment',
    dark:
      'bg-graphite text-paper hover:bg-[#3d3d3d] active:bg-[#222222]',
    danger:
      'bg-transparent text-red-700 border border-red-200 hover:bg-red-50',
  };

  const sizes = {
    sm: 'text-[13px] px-3 py-1.5',
    md: 'text-[15px] px-5 py-2.5',
    lg: 'text-[16px] px-6 py-3.5',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </button>
  );
}
