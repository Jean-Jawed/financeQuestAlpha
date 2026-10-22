/**
 * FINANCEQUEST - UI COMPONENT: Badge
 * Composant Badge pour afficher statuts, performances, etc.
 */

'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/client';

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
    success: 'bg-gain/10 text-gain border-gain/40',
    danger: 'bg-loss/10 text-loss border-loss/40',
    warning: 'bg-brass/10 text-brass-bright border-brass/40',
    info: 'bg-paper/5 text-paper border-line-strong',
    neutral: 'bg-transparent text-paper-dim border-line-strong',
  };

  // Sizes
  const sizes = {
    sm: 'px-1.5 py-px text-[11px]',
    md: 'px-2 py-0.5 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-sm border font-label font-semibold uppercase tracking-[0.1em]',
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
  const { f } = useI18n();
  const variant = value > 0 ? 'success' : value < 0 ? 'danger' : 'neutral';
  // Flèche en plus de la couleur : lisible sans distinguer rouge et vert
  const arrow = value > 0 ? '▲' : value < 0 ? '▼' : '■';

  return (
    <Badge variant={variant} className="num normal-case tracking-normal">
      {arrow} {f.percent(value, 2)}
    </Badge>
  );
}

/**
 * Badge pour afficher les statuts de game
 */
export function GameStatusBadge({ status }: { status: 'active' | 'paused' | 'completed' }) {
  const { m } = useI18n();

  const variants = {
    active: 'success' as const,
    paused: 'warning' as const,
    completed: 'neutral' as const,
  };

  return <Badge variant={variants[status]}>{m.status[status]}</Badge>;
}
