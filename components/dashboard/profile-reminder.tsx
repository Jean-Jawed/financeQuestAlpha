/**
 * FINANCEQUEST - COMPONENT: ProfileReminder
 * « Complétez votre carte d'agent » : pour qui a passé l'accueil (ou les comptes
 * antérieurs au profil). Masquable ; le choix est mémorisé dans ce navigateur.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlayerAvatar } from '@/components/profile/player-avatar';
import { useI18n } from '@/lib/i18n/client';

const STORAGE_KEY = 'fq-profile-reminder-hidden';

export function ProfileReminder({ name, avatarId }: { name: string; avatarId: string | null }) {
  const { m, href } = useI18n();
  const t = m.profile.reminder;
  // Masqué jusqu'à la lecture du stockage : pas de clignotement
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(window.localStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      setHidden(false);
    }
  }, []);

  if (hidden) return null;

  function dismiss() {
    setHidden(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Stockage indisponible (navigation privée) : masqué pour cette visite seulement
    }
  }

  return (
    <aside className="wood flex flex-col gap-4 rounded-xl border-2 border-brass-deep p-5 sm:flex-row sm:items-center">
      <PlayerAvatar avatarId={avatarId} name={name} size={48} />
      <div className="flex-1">
        <p className="font-display text-lg font-semibold text-paper">{t.title}</p>
        <p className="text-sm text-paper-dim">{t.text}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="px-3 font-label text-xs font-semibold uppercase tracking-label text-paper-dim hover:text-paper"
        >
          {t.dismiss}
        </button>
        <Link
          href={href('/profile')}
          className="inline-flex h-9 items-center rounded border border-brass/70 px-4 font-label text-xs font-semibold uppercase tracking-label text-brass transition-colors hover:bg-brass/10"
        >
          {t.cta}
        </Link>
      </div>
    </aside>
  );
}
