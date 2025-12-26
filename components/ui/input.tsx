/**
 * FINANCEQUEST - UI COMPONENT: Input
 * Composant Input avec validation et messages d'erreur
 */

'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

// ==========================================
// TYPES
// ==========================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          type={type}
          className={cn(
            // Base
            'w-full px-4 py-3 rounded-lg',
            'bg-slate-900/50 border text-white placeholder-slate-500',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2',
            // States
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-600 focus:ring-cyan-500 focus:border-cyan-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />

        {error && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-2 text-sm text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
