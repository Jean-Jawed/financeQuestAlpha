/**
 * FINANCEQUEST - UI COMPONENT: LoadingSpinner
 * Rosace guillochée qui tourne ; page de chargement avec le téléscripteur
 */

'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { Rosette } from '@/components/brand/guilloche';
import { useI18n } from '@/lib/i18n/client';

// ==========================================
// TYPES
// ==========================================

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 16,
    md: 32,
    lg: 56,
  };
  const { m } = useI18n();

  return (
    <div className={cn('flex items-center justify-center', className)} role="status" aria-label={m.common.loading}>
      <Rosette
        size={sizes[size]}
        strands={size === 'sm' ? 5 : 9}
        strokeWidth={size === 'sm' ? 2.2 : 1}
        className="animate-[spin_2.4s_linear_infinite] text-brass"
      />
    </div>
  );
}

/**
 * Chargement pleine page
 */
export function LoadingPage() {
  const { m } = useI18n();
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <Image
          src="/gravures/telescripteur.webp"
          alt=""
          width={180}
          height={180}
          priority
          className="engraving mx-auto opacity-80"
        />
        <p className="label mt-4 animate-pulse">{m.common.readingQuote}</p>
      </div>
    </div>
  );
}
