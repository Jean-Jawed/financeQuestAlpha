/**
 * PASTFOLIO - COMPONENT: WelcomeCard
 * Fiche de personnage du tableau de bord : médaillon orné, pseudo sur plaque,
 * devise, titre et tube d'XP, puis les chiffres de carrière (parties, succès,
 * meilleur rendement). Seul fleuron à pierre de la page.
 */

'use client';

import Link from 'next/link';
import { Gear } from '@/components/brand/ornaments';
import { Frame, Plate } from '@/components/machine/frame';
import { Medallion, XpTube } from '@/components/machine/instruments';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/lib/i18n/client';
import { cn } from '@/lib/utils/cn';

// ==========================================
// TYPES
// ==========================================

interface WelcomeCardProps {
  name: string;
  avatarId: string | null;
  /** XP lue par le serveur (l'en-tête la met ensuite à jour en direct) */
  xpTotal: number;
  motto: string | null;
  gamesPlayed: number;
  achievementsUnlocked: number;
  /** Meilleur rendement parmi les parties (null : aucune partie) */
  bestReturn: number | null;
}

// ==========================================
// COMPONENT
// ==========================================

export function WelcomeCard({ name, avatarId, xpTotal, motto, gamesPlayed, achievementsUnlocked, bestReturn }: WelcomeCardProps) {
  const { m, f, href } = useI18n();
  const t = m.dashboard.welcome;
  const { user } = useAuth();
  const xp = Math.max(user?.xpTotal ?? 0, xpTotal);

  const stats = [
    { label: t.games, value: String(gamesPlayed), tone: 'text-ivory-ink' },
    { label: t.achievements, value: String(achievementsUnlocked), tone: 'text-ivory-ink' },
    {
      label: t.bestReturn,
      value: bestReturn === null ? '—' : `${bestReturn > 0 ? '▲ ' : bestReturn < 0 ? '▼ ' : ''}${f.percent(bestReturn, 1)}`,
      tone: bestReturn === null ? 'text-ivory-dim' : bestReturn >= 0 ? 'text-enamel-green' : 'text-enamel-red',
    },
  ];

  return (
    <Frame crest="amethyst" fleuron as="section" className="relative overflow-hidden p-5 sm:p-7 sm:pl-12">
      <Gear className="absolute -left-16 -top-16 h-56 w-56 opacity-20 max-sm:hidden" />
      <Gear reverse className="absolute -bottom-20 -right-10 h-44 w-44 opacity-15 max-sm:hidden" />

      <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
        <Link href={href('/profile')} aria-label={m.nav.profile} className="shrink-0 transition-transform hover:scale-[1.02]">
          <Medallion avatarId={avatarId} name={name} xpTotal={xp} size={150} ornate className="max-sm:hidden" />
          <Medallion avatarId={avatarId} name={name} xpTotal={xp} size={120} className="sm:hidden" />
        </Link>

        <div className="w-full min-w-0 flex-1 text-center sm:text-left">
          <p className="label text-brass-bright">{t.register}</p>
          <h1 className="mt-2">
            <Plate className="whitespace-normal font-display text-2xl normal-case leading-tight tracking-normal sm:text-3xl">{name}</Plate>
          </h1>
          {motto && <p className="mt-3 font-display text-lg italic text-paper-dim">« {motto} »</p>}
          <XpTube xpTotal={xp} className="mx-auto mt-4 max-w-md sm:mx-0" />
          <p className="mt-3 text-sm text-paper-dim">{t.intro}</p>
        </div>

        <dl className="grid w-full shrink-0 grid-cols-3 gap-2 sm:w-auto sm:grid-cols-1">
          {stats.map((stat) => (
            <div key={stat.label} className="ivory px-4 py-2 text-center sm:text-right">
              <dt className="label text-[10px] text-ivory-dim">{stat.label}</dt>
              <dd className={cn('num mt-0.5 whitespace-nowrap text-xl font-semibold', stat.tone)}>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Frame>
  );
}
