/**
 * FINANCEQUEST - COMPONENT: XP
 * showXp() après une action (ordre, séance, fin de partie…) : « +12 XP » qui
 * s'envole, écran de montée de niveau, en-tête mis à jour sans rechargement.
 * <XpOverlay /> une fois par page (layout de l'application).
 * <LevelBadge /> et <XpBar /> : niveau et progression, partout où le joueur apparaît.
 */

'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { useAuthStore } from '@/hooks/use-auth';
import { useI18n } from '@/lib/i18n/client';
import { playSound } from '@/lib/sound';
import { cn } from '@/lib/utils/cn';
import { levelInfo, titleFor } from '@/lib/xp/rules';
import type { XpOutcome } from '@/lib/xp/server';

// ==========================================
// STORE
// ==========================================

interface XpToast {
  id: number;
  outcome: XpOutcome;
}

interface XpStore {
  toasts: XpToast[];
  push: (outcome: XpOutcome) => void;
  remove: (id: number) => void;
}

let nextId = 1;

const useXpStore = create<XpStore>((set) => ({
  toasts: [],
  push: (outcome) => set((state) => ({ toasts: [...state.toasts, { id: nextId++, outcome }] })),
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

/** Afficher un gain d'XP (réponse d'une action) et mettre l'en-tête à jour */
export function showXp(outcome: XpOutcome | null | undefined) {
  if (!outcome || outcome.gained <= 0) return;
  useXpStore.getState().push(outcome);

  const auth = useAuthStore.getState();
  if (auth.user && auth.user.xpTotal < outcome.total) {
    auth.setUser({ ...auth.user, xpTotal: outcome.total });
  }
}

// ==========================================
// OVERLAY
// ==========================================

const GAIN_MS = 2400;
const LEVEL_UP_MS = 4200;

export function XpOverlay() {
  const toasts = useXpStore((state) => state.toasts);

  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      {toasts.map((toast) => (
        <XpToastView key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function XpToastView({ toast }: { toast: XpToast }) {
  const { m, fmt } = useI18n();
  const t = m.xp;
  const remove = useXpStore((state) => state.remove);
  const { outcome } = toast;
  const leveledUp = outcome.level > outcome.levelBefore;
  const titleChanged = leveledUp && titleFor(outcome.level) !== titleFor(outcome.levelBefore);

  useEffect(() => {
    if (leveledUp) playSound('medal');
    const timer = setTimeout(() => remove(toast.id), leveledUp ? LEVEL_UP_MS : GAIN_MS);
    return () => clearTimeout(timer);
  }, [leveledUp, remove, toast.id]);

  if (leveledUp) {
    return (
      <div className="animate-rise rounded-xl border border-xp/60 bg-ink-2/95 px-6 py-4 text-center shadow-[0_0_40px_rgb(164_124_255/0.35)]">
        <p className="label text-xp-bright">{t.levelUp}</p>
        <p className="mt-1 font-display text-3xl font-semibold text-paper">{fmt(t.levelLong, { level: outcome.level })}</p>
        {titleChanged && (
          <p className="mt-1 font-display italic text-brass-bright">
            {fmt(t.newTitle, { title: t.titles[titleFor(outcome.level)] })}
          </p>
        )}
        <p className="num mt-2 text-sm text-xp-bright">{fmt(t.gained, { xp: outcome.gained })}</p>
      </div>
    );
  }

  return (
    <div className="animate-xp-float rounded-full border border-xp/50 bg-ink-2/95 px-4 py-1.5 shadow-[0_0_18px_rgb(164_124_255/0.35)]">
      <span className="num font-semibold text-xp-bright">{fmt(t.gained, { xp: outcome.gained })}</span>
      {outcome.rested > 0 && <span className="ml-2 text-xs text-paper-dim">{fmt(t.rested, { xp: outcome.rested })}</span>}
    </div>
  );
}

// ==========================================
// NIVEAU
// ==========================================

/** Pastille de niveau (sur le médaillon d'avatar) */
export function LevelBadge({ xpTotal, className }: { xpTotal: number; className?: string }) {
  const info = levelInfo(xpTotal);
  return (
    <span
      className={cn(
        'num inline-flex min-w-[1.4rem] items-center justify-center rounded-full border-2 border-ink bg-xp px-1 text-[10px] font-semibold leading-4 text-[#10091F]',
        className
      )}
    >
      {info.level}
      {info.stars > 0 && '★'}
    </span>
  );
}

/** Barre de progression dans le niveau, avec titre et niveau en option */
export function XpBar({ xpTotal, withLabel = false, className }: { xpTotal: number; withLabel?: boolean; className?: string }) {
  const { m, fmt } = useI18n();
  const info = levelInfo(xpTotal);

  return (
    <div className={className}>
      {withLabel && (
        <div className="mb-1 flex items-baseline justify-between gap-3">
          <span className="label text-[10px] text-xp-bright">
            {m.xp.titles[titleFor(info.level)]} · {fmt(m.xp.level, { level: info.level })}
            {info.stars > 0 && ` · ${fmt(m.xp.stars, { count: info.stars })}`}
          </span>
          <span className="num text-[10px] text-paper-dim">
            {info.intoLevel} / {info.levelSize}
          </span>
        </div>
      )}
      <div
        className="h-1.5 overflow-hidden rounded-full bg-xp/20"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={info.levelSize}
        aria-valuenow={info.intoLevel}
        aria-label={fmt(m.xp.toNext, { xp: info.levelSize - info.intoLevel, level: info.level + 1 })}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-xp-deep to-xp-bright shadow-[0_0_8px_rgb(164_124_255/0.8)] transition-[width] duration-700"
          style={{ width: `${Math.round(info.progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
