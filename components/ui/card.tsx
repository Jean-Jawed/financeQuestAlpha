/**
 * FINANCEQUEST - UI COMPONENT: Card
 * Panneau « plaque gravée » ; variante certificate = cadre de titre au porteur
 */

'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

// ==========================================
// TYPES
// ==========================================

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** glass : conservé pour compatibilité, rendu comme default */
  variant?: 'default' | 'elevated' | 'glass' | 'certificate';
  hover?: boolean;
}

// ==========================================
// COMPONENT
// ==========================================

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', hover = false, children, ...props }, ref) => {
    // Variants
    const variants = {
      default: 'panel',
      elevated: 'panel bg-ink-3 shadow-lift',
      glass: 'panel',
      certificate: 'certificate',
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base (rayon et bordure portés par .panel / .certificate)
          'p-6 transition-[border-color,transform] duration-200',
          // Variant
          variants[variant],
          // Hover effect
          hover && 'hover:-translate-y-0.5 hover:border-brass/60',
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
      className={cn('font-display text-2xl font-semibold text-paper', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('mt-1 text-sm text-paper-dim', className)} {...props} />
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
      className={cn('mt-6 border-t border-line pt-4', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';
