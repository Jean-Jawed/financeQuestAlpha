/**
 * FINANCEQUEST - COMPONENT: SoundToggle
 * Couper ou rétablir les sons du jeu (choix mémorisé dans le navigateur)
 */

'use client';

import { useEffect } from 'react';
import { useSoundStore } from '@/lib/sound';
import { useI18n } from '@/lib/i18n/client';
import { cn } from '@/lib/utils/cn';

interface SoundToggleProps {
  className?: string;
  /** Afficher le libellé à côté de l'icône (menu mobile) */
  withLabel?: boolean;
}

export function SoundToggle({ className, withLabel = false }: SoundToggleProps) {
  const { m } = useI18n();
  const muted = useSoundStore((state) => state.muted);
  const toggle = useSoundStore((state) => state.toggle);
  const hydrate = useSoundStore((state) => state.hydrate);

  // Préférence lue après le montage : le rendu serveur et le premier rendu client concordent
  useEffect(hydrate, [hydrate]);

  const label = muted ? m.sound.off : m.sound.on;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!muted}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center gap-2 p-1 text-paper-dim transition-colors hover:text-brass',
        className
      )}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        {/* Cloche */}
        <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z" strokeLinejoin="round" />
        <path d="M10 20.5a2 2 0 0 0 4 0" />
        {muted && <path d="M4 4l16 16" className="text-loss" stroke="currentColor" />}
      </svg>
      {withLabel && <span className="font-label text-sm font-semibold uppercase tracking-label">{label}</span>}
    </button>
  );
}
