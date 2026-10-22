/**
 * FINANCEQUEST - UI COMPONENT: Button
 * Bouton « plaque » : capitales condensées, laiton pour l'action principale
 */

'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

// ==========================================
// TYPES
// ==========================================

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

// ==========================================
// COMPONENT
// ==========================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    // Variants
    const variants = {
      primary:
        'bg-brass text-ink border border-brass-bright/60 shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_2px_0_#8E7034] hover:bg-brass-bright active:translate-y-px active:shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]',
      secondary: 'bg-ink-3 text-paper border border-line-strong hover:bg-ink-4',
      danger:
        'bg-loss text-ink border border-loss/60 shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_2px_0_#A8381F] hover:brightness-110 active:translate-y-px',
      ghost: 'bg-transparent text-paper-dim hover:text-paper hover:bg-ink-3',
      outline: 'bg-transparent border border-brass/70 text-brass hover:bg-brass/10',
    };

    // Sizes
    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-5 text-base',
      lg: 'h-12 px-7 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base
          'inline-flex items-center justify-center gap-2 rounded font-label font-semibold uppercase tracking-[0.12em]',
          'transition-[background-color,color,transform,box-shadow] duration-150',
          'disabled:opacity-45 disabled:cursor-not-allowed disabled:active:translate-y-0',
          // Variant
          variants[variant],
          // Size
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
