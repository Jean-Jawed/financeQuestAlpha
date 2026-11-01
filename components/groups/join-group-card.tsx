/**
 * PASTFOLIO - COMPONENT: JoinGroupCard
 * Saisir le code reçu de l'organisateur : mène à la page d'invitation du groupe
 */

'use client';

import { useState } from 'react';
import { Frame } from '@/components/machine/frame';
import { EnamelButton } from '@/components/machine/instruments';
import { useRouter } from 'next/navigation';
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
    <Frame outerClassName="h-full" className="flex min-h-[220px] flex-col justify-center p-6">
    <form
      className="flex flex-col justify-center"
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
          className="num h-11 min-w-0 flex-1 rounded border border-ivory-line bg-ivory px-3 text-lg uppercase tracking-[0.25em] text-ivory-ink shadow-[inset_0_2px_3px_rgba(0,0,0,0.3)] focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
        />
        <EnamelButton type="submit" tone="green" disabled={!valid}>
          {t.cta}
        </EnamelButton>
      </div>
    </form>
    </Frame>
  );
}
