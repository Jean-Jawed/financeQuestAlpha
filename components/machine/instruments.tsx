/**
 * FINANCEQUEST - MACHINE: instruments
 * <Medallion> : avatar dans sa couronne de laiton, ruban de niveau
 * <XpTube> : l'expérience dans un tube de verre cerclé de laiton
 * <Odometer> : compteur à tambours qui roule à chaque changement
 * <Gauge> : manomètre à cadran ivoire (liquidités, exposition)
 * <EnamelButton> : bouton émaillé qui s'enfonce
 */

'use client';

import { forwardRef, useId } from 'react';
import { MedallionFrame } from '@/components/brand/ornaments';
import { useI18n } from '@/lib/i18n/client';
import { avatarUrl, getAvatar } from '@/lib/profile/avatars';
import { initials } from '@/lib/profile/rules';
import { cn } from '@/lib/utils/cn';
import { levelInfo, titleFor } from '@/lib/xp/rules';

// ==========================================
// MÉDAILLON
// ==========================================

interface MedallionProps {
  avatarId: string | null | undefined;
  name: string;
  /** XP totale : ruban de niveau (omise : pas de ruban) */
  xpTotal?: number;
  /** Diamètre de la couronne, en pixels */
  size?: number;
  /** Volutes latérales (fiche du joueur) */
  ornate?: boolean;
  className?: string;
}

/**
 * Proportions de MedallionFrame : couronne de 200, avatar dans le disque de rayon 63
 * (version ornée : viewBox élargie à 268 × 214 pour les volutes)
 */
export function Medallion({ avatarId, name, xpTotal, size = 160, ornate = false, className }: MedallionProps) {
  const { fmt, m } = useI18n();
  const avatar = getAvatar(avatarId);
  const scale = size / 200;
  const face = 118 * scale;
  const level = xpTotal === undefined ? null : levelInfo(xpTotal).level;

  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size + (level ? 12 * scale : 0) }}>
      <MedallionFrame
        scrolls={ornate}
        beads={size >= 64}
        className="absolute drop-shadow-[0_8px_10px_rgba(0,0,0,0.65)]"
        // Version ornée : la viewBox déborde de 34 unités à gauche et à droite
        style={
          ornate
            ? { left: -34 * scale, top: 0, width: 268 * scale, height: 214 * scale }
            : { left: 0, top: 0, width: size, height: size }
        }
      />
      <span
        className="absolute overflow-hidden rounded-full bg-ink-3"
        style={{ left: (size - face) / 2, top: (size - face) / 2, width: face, height: face }}
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl(avatar.id)} alt="" width={face} height={face} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display font-semibold text-brass" style={{ fontSize: face * 0.38 }}>
            {initials(name)}
          </span>
        )}
        <span aria-hidden="true" className="absolute inset-0 rounded-full shadow-[inset_0_6px_14px_rgba(0,0,0,0.55),inset_0_-2px_6px_rgba(255,230,180,0.15)]" />
      </span>
      {level !== null && (
        <span
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[3px] border-2 border-brass-shine bg-[#5A43A0] px-3 font-label font-bold uppercase tracking-[0.18em] text-ivory shadow-[0_3px_4px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.3)]"
          style={{ top: size - 14 * scale, fontSize: Math.max(10, 14 * scale), lineHeight: `${Math.max(16, 26 * scale)}px` }}
          title={m.xp.titles[titleFor(level)]}
        >
          {fmt(m.xp.level, { level })}
        </span>
      )}
    </div>
  );
}

// ==========================================
// TUBE D'XP
// ==========================================

export function XpTube({ xpTotal, compact = false, className }: { xpTotal: number; compact?: boolean; className?: string }) {
  const { m, fmt, f } = useI18n();
  const info = levelInfo(xpTotal);

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="label text-[10px] text-paper">{m.xp.titles[titleFor(info.level)]}</span>
        {!compact && (
          <span className="num text-xs text-paper-dim">
            {f.number(info.intoLevel, 0)} / {f.number(info.levelSize, 0)} XP
          </span>
        )}
      </div>
      <div
        className="mt-1.5 h-4 rounded-full bg-gradient-to-b from-brass-deep via-brass-bright to-brass-shadow p-[3px] shadow-[0_2px_3px_rgba(0,0,0,0.5)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={info.levelSize}
        aria-valuenow={info.intoLevel}
        aria-label={fmt(m.xp.toNext, { xp: info.levelSize - info.intoLevel, level: info.level + 1 })}
      >
        <div className="h-full overflow-hidden rounded-full bg-[#120C16] shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]">
          <div
            className="h-full rounded-full bg-gradient-to-b from-[#A78CE0] via-[#6E52B5] to-[#4C3790] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-[width] duration-700"
            style={{ width: `${Math.round(info.progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPTEUR À TAMBOURS
// ==========================================

/**
 * Valeur formatée affichée chiffre par chiffre ; la clé `rollKey` relance l'animation
 * (une nouvelle séance fait rouler les tambours)
 */
export function Odometer({ text, rollKey, className }: { text: string; rollKey?: string | number; className?: string }) {
  return (
    <span key={rollKey} className={cn('num inline-flex flex-nowrap items-center motion-safe:animate-odometer', className)} aria-label={text}>
      {[...text].map((char, index) =>
        /\d/.test(char) ? (
          <span key={index} aria-hidden="true" className="drum">
            {char}
          </span>
        ) : (
          <span key={index} aria-hidden="true" className="px-0.5 text-brass">
            {char === ' ' || char === ' ' || char === ' ' ? '·' : char}
          </span>
        )
      )}
    </span>
  );
}

// ==========================================
// MANOMÈTRE
// ==========================================

/**
 * Cadran ivoire, aiguille de -70° (0 %) à +70° (100 %), zone rouge au-delà de `danger`
 */
export function Gauge({ value, label, danger, size = 92, className }: { value: number; label: string; danger?: number; size?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  const clamped = Math.min(Math.max(value, 0), 100);
  const angle = -70 + (clamped / 100) * 140;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${label} : ${Math.round(clamped)} %`} className={className}>
      <defs>
        <linearGradient id={`bez${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4D891" />
          <stop offset="0.5" stopColor="#7A5720" />
          <stop offset="1" stopColor="#D7AE62" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#bez${id})`} />
      <circle cx="50" cy="50" r="41" fill="#F2E8D2" stroke="#5A3F12" strokeWidth={1} />
      {danger !== undefined && (
        <path
          d={arc(50, 56, 32, -70 + (danger / 100) * 140, 70)}
          fill="none"
          stroke="#B9503A"
          strokeWidth={4}
          opacity={0.8}
        />
      )}
      <g stroke="#2A2014" strokeWidth={1.4}>
        {[-70, -35, 0, 35, 70].map((tick) => {
          const a = ((tick - 90) * Math.PI) / 180;
          return (
            // Coordonnées arrondies : le serveur et le navigateur doivent produire le même SVG
            <line
              key={tick}
              x1={(50 + 35 * Math.cos(a)).toFixed(2)}
              y1={(56 + 35 * Math.sin(a)).toFixed(2)}
              x2={(50 + 29 * Math.cos(a)).toFixed(2)}
              y2={(56 + 29 * Math.sin(a)).toFixed(2)}
            />
          );
        })}
      </g>
      <text x="50" y="82" textAnchor="middle" fontFamily="var(--font-label)" fontWeight={600} fontSize="9" letterSpacing="1" fill="#5A4A30">
        {label.toUpperCase()}
      </text>
      <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '50px 56px', transition: 'transform 0.7s cubic-bezier(.3,1.5,.5,1)' }}>
        <path d="M50 56 L48.5 30 L50 24 L51.5 30 Z" fill="#1E1A14" />
      </g>
      <circle cx="50" cy="56" r="4.5" fill={`url(#bez${id})`} stroke="#3E2A0C" strokeWidth={0.8} />
    </svg>
  );
}

function arc(cx: number, cy: number, r: number, fromDeg: number, toDeg: number): string {
  const point = (deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  };
  return `M ${point(fromDeg)} A ${r} ${r} 0 0 1 ${point(toDeg)}`;
}

// ==========================================
// BOUTON ÉMAILLÉ
// ==========================================

/** Noms complets : Tailwind ne garde que les classes écrites en entier dans le code */
const TONES = {
  brass: 'enamel-brass',
  green: 'enamel-green',
  red: 'enamel-red',
} as const;

interface EnamelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'brass' | 'green' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

export const EnamelButton = forwardRef<HTMLButtonElement, EnamelButtonProps>(function EnamelButton(
  { tone = 'brass', size = 'md', className, children, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'enamel inline-flex items-center justify-center gap-2 font-label font-semibold uppercase tracking-[0.12em]',
        TONES[tone],
        size === 'sm' && 'min-h-[36px] px-3 text-xs',
        size === 'md' && 'min-h-[44px] px-5 text-sm',
        size === 'lg' && 'min-h-[56px] px-6 text-lg',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
