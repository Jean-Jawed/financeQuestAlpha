/**
 * PASTFOLIO - COMPONENT: GameCard
 * Une partie présentée comme un titre encadré : moulure de laiton, noyer,
 * valeur sous verre, rendement sur carte ivoire, bouton émaillé
 */

'use client';

import Link from 'next/link';
import { GameStatusBadge } from '@/components/ui/badge';
import { Frame } from '@/components/machine/frame';
import { useI18n } from '@/lib/i18n/client';
import { getScenario } from '@/lib/game/scenarios';
import { cn } from '@/lib/utils/cn';
import type { GameWithStats } from '@/types/game';
import type { GroupMode, GroupTempo } from '@/lib/game/groups';

// ==========================================
// TYPES
// ==========================================

interface GameCardProps {
  game: GameWithStats;
  /** Partie de groupe : nom du groupe, mode et tempo */
  group?: { name: string; mode: GroupMode; tempo: GroupTempo };
}

// ==========================================
// COMPONENT
// ==========================================

export function GameCard({ game, group }: GameCardProps) {
  const { m, f, fmt, href } = useI18n();
  const t = m.dashboard.gameCard;
  const serial = game.id.replace(/-/g, '').slice(0, 8).toUpperCase();
  const scenario = getScenario(game.scenario);
  const scenarioName = (m.scenarios[scenario.id as keyof typeof m.scenarios] as { name: string }).name;
  const ended = game.status === 'completed';
  const up = game.returnPercentage >= 0;

  return (
    <Frame outerClassName={cn('group transition-transform duration-200 hover:-translate-y-0.5', ended && 'opacity-85 hover:opacity-100')} className="flex flex-col p-5">
      {/* En-tête du titre */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {group ? (
            <span className="inline-block rounded-sm border border-xp/60 bg-[#3A2A68] px-2 py-0.5 font-label text-[10px] font-semibold uppercase tracking-label text-ivory shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
              {m.groups.badge} · {m.groups.modes[group.mode].name} · {m.groups.tempos[group.tempo].name}
            </span>
          ) : (
            <p className="label text-[10px] text-brass-bright">
              {scenarioName} · {fmt(t.serial, { serial })}
            </p>
          )}
          <h3 className="mt-1.5 truncate font-display text-xl font-semibold text-paper">
            {group ? group.name : fmt(t.session, { date: f.date(game.startDate) })}
          </h3>
        </div>
        <GameStatusBadge status={game.status} />
      </div>

      {/* Valeur sous verre, rendement sur ivoire */}
      <div className="glass mt-4 px-4 py-3">
        <p className="label text-[10px]">{ended ? t.finalReturn : t.netValue}</p>
        <p className="num mt-1 text-2xl font-semibold text-paper sm:text-3xl">{f.currency(game.totalValue, game.currency)}</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={cn('ivory num px-2.5 py-0.5 text-sm font-semibold', up ? 'text-enamel-green' : 'text-enamel-red')}>
          {up ? '▲ ' : '▼ '}
          {f.percent(game.returnPercentage, 2)}
        </span>
        <span className="label text-[10px]">
          {ended && game.endedAt ? fmt(t.ended, { date: f.dateShort(new Date(game.endedAt).toISOString().slice(0, 10)) }) : t.sinceOpening}
        </span>
      </div>

      {/* Pied */}
      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-black/30 pt-3 text-sm shadow-[0_-1px_0_rgba(255,222,170,0.12)]">
        <div>
          <dt className="label text-[10px]">{t.gameDate}</dt>
          <dd className="num mt-0.5 text-paper">{f.dateShort(game.currentDate)}</dd>
        </div>
        <div>
          <dt className="label text-[10px]">{t.currency}</dt>
          <dd className="num mt-0.5 text-paper">{game.currency}</dd>
        </div>
        <div>
          <dt className="label text-[10px]">{t.achievements}</dt>
          <dd className="num mt-0.5 text-brass-bright">{game.achievementsUnlocked}</dd>
        </div>
      </dl>

      {/* Toute la carte est cliquable (lien étiré sur le bouton) */}
      <Link
        href={href(`/game/${game.id}`)}
        className={cn(
          'enamel mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 font-label text-sm font-semibold uppercase tracking-[0.12em] after:absolute after:inset-0 after:content-[""]',
          ended ? 'enamel-green' : 'enamel-brass'
        )}
      >
        {ended ? t.summary : t.resume}
        <span aria-hidden="true">→</span>
      </Link>
    </Frame>
  );
}
