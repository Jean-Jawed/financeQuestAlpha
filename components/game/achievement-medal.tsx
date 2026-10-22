/**
 * FINANCEQUEST - COMPONENT: AchievementMedal
 * Médaille frappée à l'écran quand un succès est débloqué
 * showMedals() depuis n'importe quel composant ; <MedalOverlay /> une fois par page
 */

'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { create } from 'zustand';
import { Rosette } from '@/components/brand/guilloche';
import { useI18n } from '@/lib/i18n/client';
import { playSound } from '@/lib/sound';

// ==========================================
// STORE
// ==========================================

export interface Medal {
  name: string;
  points: number;
}

interface MedalState {
  queue: Medal[];
  push: (medals: Medal[]) => void;
  shift: () => void;
}

const useMedalStore = create<MedalState>((set) => ({
  queue: [],
  push: (medals) => set((state) => ({ queue: [...state.queue, ...medals] })),
  shift: () => set((state) => ({ queue: state.queue.slice(1) })),
}));

/** Afficher les succès débloqués renvoyés par l'API (trade ou jour suivant) */
export function showMedals(medals: Medal[] | undefined) {
  if (medals && medals.length > 0) {
    useMedalStore.getState().push(medals);
  }
}

// ==========================================
// COMPONENT
// ==========================================

const DISPLAY_MS = 3200;

export function MedalOverlay() {
  const { m, fmt } = useI18n();
  const current = useMedalStore((state) => state.queue[0]);
  const shift = useMedalStore((state) => state.shift);

  useEffect(() => {
    if (!current) return;
    // La médaille tombe juste après le tampon ou la cloche
    const chime = setTimeout(() => playSound('medal'), 350);
    const timer = setTimeout(shift, DISPLAY_MS);
    return () => {
      clearTimeout(chime);
      clearTimeout(timer);
    };
  }, [current, shift]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-8 z-[90] flex justify-center px-4"
      role="status"
      aria-live="assertive"
    >
      <button
        type="button"
        onClick={shift}
        // key : chaque médaille rejoue l'animation
        key={current.name}
        className="certificate flex animate-rise items-center gap-5 bg-ink-3 py-4 pl-4 pr-8 text-left shadow-lift"
      >
        <span className="relative flex h-20 w-20 shrink-0 animate-stamp items-center justify-center">
          <Image src="/gravures/laurier.webp" alt="" width={80} height={80} className="engraving absolute inset-0" />
          <Rosette size={40} strands={8} strokeWidth={1} className="text-brass" />
          <span className="num absolute text-[11px] font-semibold text-brass-bright">+{current.points}</span>
        </span>
        <span>
          <span className="label block text-brass">{m.game.medal.unlocked}</span>
          <span className="mt-1 block font-display text-2xl font-semibold text-paper">{current.name}</span>
          <span className="mt-0.5 block text-sm text-paper-dim">{fmt(m.game.medal.points, { points: current.points })}</span>
        </span>
      </button>
    </div>
  );
}
