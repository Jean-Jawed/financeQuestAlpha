/**
 * FINANCEQUEST - COMPONENT: GameCard
 * Une partie présentée comme un titre au porteur : cadre, numéro, valeur
 */

'use client';

import Link from 'next/link';
import { PerformanceBadge, GameStatusBadge } from '@/components/ui/badge';
import { Rosette, GuillocheBand } from '@/components/brand/guilloche';
import { useI18n } from '@/lib/i18n/client';
import type { GameWithStats } from '@/types/game';

// ==========================================
// TYPES
// ==========================================

interface GameCardProps {
  game: GameWithStats;
}

// ==========================================
// COMPONENT
// ==========================================

export function GameCard({ game }: GameCardProps) {
  const { m, f, fmt, href } = useI18n();
  const t = m.dashboard.gameCard;
  const serial = game.id.replace(/-/g, '').slice(0, 8).toUpperCase();

  return (
    <Link
      href={href(`/game/${game.id}`)}
      className="certificate group relative flex flex-col overflow-hidden p-6 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brass"
    >
      <Rosette
        size={260}
        strands={16}
        strokeWidth={0.4}
        className="absolute -bottom-24 -right-20 text-brass/[0.12] transition-transform duration-700 group-hover:rotate-12"
      />

      {/* En-tête du titre */}
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="label text-[10px] text-brass">{fmt(t.serial, { serial })}</p>
          <h3 className="mt-1 font-display text-xl font-semibold text-paper">
            {fmt(t.session, { date: f.date(game.startDate) })}
          </h3>
        </div>
        <GameStatusBadge status={game.status} />
      </div>

      <GuillocheBand className="relative my-5 text-brass/25" height={14} strands={5} />

      {/* Valeur */}
      <div className="relative">
        <p className="label">{t.netValue}</p>
        <p className="num mt-1 text-3xl font-semibold text-paper">{f.currency(game.totalValue, game.currency)}</p>
        <div className="mt-2 flex items-center gap-3">
          <PerformanceBadge value={game.returnPercentage} />
          <span className="label text-[10px]">{t.sinceOpening}</span>
        </div>
      </div>

      {/* Pied */}
      <dl className="relative mt-6 grid grid-cols-3 gap-3 border-t border-line pt-4 text-sm">
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
          <dd className="num mt-0.5 text-brass">{game.achievementsUnlocked}</dd>
        </div>
      </dl>

      <span className="relative mt-6 inline-flex items-center gap-2 self-start font-label text-sm font-semibold uppercase tracking-label text-brass transition-colors group-hover:text-brass-bright">
        {t.resume}
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
