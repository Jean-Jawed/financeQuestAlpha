/**
 * FINANCEQUEST - UI COMPONENT: Card
 * Composant Card avec effet glassmorphism
 */

'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

// ==========================================
// TYPES
// ==========================================

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass';
  hover?: boolean;
}

// ==========================================
// COMPONENT
// ==========================================

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', hover = false, children, ...props }, ref) => {
    // Variants
    const variants = {
      default: 'bg-slate-800 border-slate-700',
      elevated: 'bg-slate-800 border-slate-700 shadow-2xl',
      glass: 'bg-slate-800/50 backdrop-blur-lg border-slate-700/50',
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base
          'rounded-2xl border p-6',
          'transition-all duration-300',
          // Variant
          variants[variant],
          // Hover effect
          hover && 'hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ==========================================
// CARD SUBCOMPONENTS
// ==========================================

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-bold text-white', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-slate-400 text-sm mt-1', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-6 pt-4 border-t border-slate-700/50', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';
