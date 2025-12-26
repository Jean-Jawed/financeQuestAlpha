/**
 * FINANCEQUEST - UI COMPONENT: Button
 * Composant Button avec variants et sizes
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
      primary: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/30',
      secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30',
      ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-300',
      outline: 'bg-transparent border-2 border-cyan-600 hover:bg-cyan-600/10 text-cyan-400',
    };

    // Sizes
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3.5 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base
          'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900',
          'disabled:opacity-50 disabled:cursor-not-allowed',
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
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
