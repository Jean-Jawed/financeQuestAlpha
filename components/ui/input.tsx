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
          <label htmlFor={props.id} className="label mb-2 block">
            {label}
            {props.required && <span className="ml-1 text-loss">*</span>}
          </label>
        )}

        <input
          ref={ref}
          type={type}
          className={cn(
            // Base
            'h-11 w-full rounded px-3',
            'border bg-ink text-paper placeholder:text-paper-faint',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-1',
            (type === 'number' || type === 'date') && 'num',
            // States
            error
              ? 'border-loss focus:border-loss focus:ring-loss'
              : 'border-line-strong focus:border-brass focus:ring-brass',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />

        {error && (
          <p className="mt-2 flex items-center gap-1 text-sm text-loss">
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
          <p className="mt-2 text-sm text-paper-dim">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
