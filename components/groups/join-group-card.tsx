/**
 * FINANCEQUEST - COMPONENT: JoinGroupCard
 * Saisir le code reçu de l'organisateur : mène à la page d'invitation du groupe
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/client';
import { INVITE_CODE_PATTERN } from '@/lib/game/groups';

export function JoinGroupCard() {
  const router = useRouter();
  const { m, href } = useI18n();
  const t = m.groups.join;
  const [code, setCode] = useState('');
  const normalized = code.trim().toUpperCase();
  const valid = INVITE_CODE_PATTERN.test(normalized);

  return (
    <form
      className="flex min-h-[220px] flex-col justify-center rounded border border-line bg-ink-2 p-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (valid) router.push(href(`/groups/join/${normalized}`));
      }}
    >
      <h3 className="font-display text-xl font-semibold text-paper">{t.cardTitle}</h3>
      <p className="mt-2 text-sm text-paper-dim">{t.cardText}</p>
      <div className="mt-4 flex gap-2">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          maxLength={8}
          placeholder={t.placeholder}
          aria-label={t.placeholder}
          autoCapitalize="characters"
          className="num h-11 min-w-0 flex-1 rounded border border-line-strong bg-ink px-3 text-lg uppercase tracking-[0.25em] text-paper focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
        />
        <Button type="submit" disabled={!valid}>
          {t.cta}
        </Button>
      </div>
    </form>
  );
}
