/**
 * FINANCEQUEST - BRAND: Logo
 * Sceau guilloché + monogramme « FQ », et mot-symbole FINANCEQUEST
 * Vectoriel : net de 16 px (icône) à l'affiche
 */

'use client';

import { useI18n } from '@/lib/i18n/client';
import { cn } from '@/lib/utils/cn';
import { wavyCirclePath } from './guilloche';

// ==========================================
// SCEAU
// ==========================================

interface SealProps {
  size?: number;
  className?: string;
  /** Simplifie le treillis pour les petites tailles (< 40 px) */
  compact?: boolean;
}

export function Seal({ size = 40, className, compact = size < 40 }: SealProps) {
  const strands = compact ? 6 : 14;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn('shrink-0 text-brass', className)}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="49" fill="#0F1D19" />
      <g fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="47.5" strokeWidth="2" />
        <circle cx="50" cy="50" r="44" strokeWidth="0.6" />
        {Array.from({ length: strands }, (_, i) => (
          <path
            key={i}
            d={wavyCirclePath(50, 50, 38.5, 4, 18, (i / strands) * Math.PI * 2, 216)}
            strokeWidth={compact ? 0.9 : 0.45}
          />
        ))}
        <circle cx="50" cy="50" r="31" strokeWidth="0.8" />
      </g>
      <circle cx="50" cy="50" r="30.4" fill="#0F1D19" />
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        style={{ fontFamily: 'var(--font-display), Georgia, serif', fontStyle: 'italic', fontWeight: 700 }}
        fontSize="32"
        letterSpacing="-1.5"
      >
        FQ
      </text>
    </svg>
  );
}

// ==========================================
// LOGO COMPLET
// ==========================================

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const { m } = useI18n();
  const sizes = {
    sm: { seal: 28, text: 'text-lg', sub: 'hidden' },
    md: { seal: 36, text: 'text-xl', sub: 'text-[9px]' },
    lg: { seal: 64, text: 'text-4xl', sub: 'text-xs' },
  };
  const s = sizes[size];

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <Seal size={s.seal} />
      <span className="flex flex-col leading-none">
        <span className={cn('font-label font-bold uppercase tracking-[0.18em] text-paper', s.text)}>
          Finance<span className="text-brass">Quest</span>
        </span>
        <span className={cn('mt-1 font-label uppercase tracking-[0.32em] text-paper-dim', s.sub)}>
          {m.nav.logoTagline}
        </span>
      </span>
    </span>
  );
}
