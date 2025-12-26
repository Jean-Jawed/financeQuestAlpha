/**
 * FINANCEQUEST - UI COMPONENT: Badge
 * Composant Badge pour afficher statuts, performances, etc.
 */

'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

// ==========================================
// TYPES
// ==========================================

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

// ==========================================
// COMPONENT
// ==========================================

export function Badge({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  // Variants
  const variants = {
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    neutral: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
  };

  // Sizes
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Badge pour afficher les performances (avec couleur auto)
 */
export function PerformanceBadge({ value }: { value: number }) {
  const variant = value > 0 ? 'success' : value < 0 ? 'danger' : 'neutral';
  const sign = value > 0 ? '+' : '';

  return (
    <Badge variant={variant}>
      {sign}
      {value.toFixed(2)}%
    </Badge>
  );
}

/**
 * Badge pour afficher les statuts de game
 */
export function GameStatusBadge({ status }: { status: 'active' | 'paused' | 'completed' }) {
  const labels = {
    active: 'Actif',
    paused: 'En pause',
    completed: 'Terminé',
  };

  const variants = {
    active: 'success' as const,
    paused: 'warning' as const,
    completed: 'neutral' as const,
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
