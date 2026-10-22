/**
 * FINANCEQUEST - COMPONENT: WelcomeCard
 * En-tête « registre » du joueur : nom, parties, succès, meilleur rendement
 */

'use client';

import { Rosette } from '@/components/brand/guilloche';
import { useI18n } from '@/lib/i18n/client';
import { cn } from '@/lib/utils/cn';

// ==========================================
// TYPES
// ==========================================

interface WelcomeCardProps {
  name: string;
  gamesPlayed: number;
  achievementsUnlocked: number;
  /** Meilleur rendement parmi les parties (null : aucune partie) */
  bestReturn: number | null;
}

// ==========================================
// COMPONENT
// ==========================================

export function WelcomeCard({ name, gamesPlayed, achievementsUnlocked, bestReturn }: WelcomeCardProps) {
  const { m, f } = useI18n();
  const t = m.dashboard.welcome;

  const stats = [
    { label: t.games, value: String(gamesPlayed), tone: 'text-paper' },
    { label: t.achievements, value: String(achievementsUnlocked), tone: 'text-brass' },
    {
      label: t.bestReturn,
      value:
        bestReturn === null
          ? '—'
          : `${bestReturn > 0 ? '▲ ' : bestReturn < 0 ? '▼ ' : ''}${f.percent(bestReturn, 1)}`,
      tone: bestReturn === null ? 'text-paper-dim' : bestReturn >= 0 ? 'text-gain' : 'text-loss',
    },
  ];

  return (
    <section className="relative overflow-hidden">
      <Rosette
        size={420}
        strands={18}
        strokeWidth={0.35}
        className="absolute -right-24 -top-36 hidden text-brass/10 md:block"
      />

      <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label text-brass">{t.register}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-paper md:text-5xl">
            {t.hello.split('{name}')[0]}
            <span className="italic">{name}</span>
            {t.hello.split('{name}')[1]}
          </h1>
          <p className="mt-2 text-paper-dim">{t.intro}</p>
        </div>

        <dl className="grid grid-cols-3 divide-x divide-line rounded border border-line bg-ink-2">
          {stats.map((stat) => (
            <div key={stat.label} className="px-3 py-4 sm:px-5">
              <dt className="label text-[10px]">{stat.label}</dt>
              <dd className={cn('num mt-1 whitespace-nowrap text-lg font-semibold sm:text-2xl', stat.tone)}>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
