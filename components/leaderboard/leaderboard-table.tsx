/**
 * FINANCEQUEST - COMPONENT: LeaderboardTable
 * Podium couronné de laurier, puis registre des agents de change
 */

'use client';

import Image from 'next/image';
import { PerformanceBadge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n/client';
import { cn } from '@/lib/utils/cn';
import type { LeaderboardEntry } from '@/types/api';

// ==========================================
// TYPES
// ==========================================

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

const ROMAN = ['I', 'II', 'III'];

// ==========================================
// SOUS-COMPOSANT
// ==========================================

function PodiumStep({ entry, place }: { entry: LeaderboardEntry; place: 0 | 1 | 2 }) {
  const { m, f, fmt } = useI18n();
  const first = place === 0;

  return (
    <li
      className={cn(
        'certificate flex flex-col items-center px-6 pb-6 text-center',
        first ? 'pt-4 md:order-2 md:-translate-y-6' : place === 1 ? 'pt-6 md:order-1' : 'pt-6 md:order-3'
      )}
    >
      <div className={cn('relative flex items-center justify-center', first ? 'h-36 w-36' : 'h-28 w-28')}>
        <Image
          src="/gravures/laurier.webp"
          alt=""
          width={160}
          height={160}
          className={cn('engraving absolute inset-0 h-full w-full', !first && 'opacity-60')}
        />
        <span className={cn('font-display font-bold italic', first ? 'text-5xl text-brass-bright' : 'text-4xl text-paper-dim')}>
          {ROMAN[place]}
        </span>
      </div>
      <h3 className="mt-2 font-display text-2xl font-semibold text-paper">{entry.userName}</h3>
      <div className="mt-3">
        <PerformanceBadge value={entry.returnPercentage} />
      </div>
      <p className="num mt-3 text-lg text-paper">{f.currency(entry.totalValue, entry.currency)}</p>
      <p className="label mt-1 text-[10px]">{fmt(m.leaderboard.pointsValue, { points: entry.score })}</p>
    </li>
  );
}

// ==========================================
// COMPONENT
// ==========================================

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const { m, f } = useI18n();
  const t = m.leaderboard;

  if (entries.length === 0) {
    return (
      <div className="panel flex flex-col items-center px-6 py-14 text-center">
        <Image src="/gravures/laurier.webp" alt="" width={140} height={140} className="engraving opacity-50" />
        <p className="mt-4 font-display text-2xl text-paper">{t.emptyTitle}</p>
        <p className="mt-1 text-paper-dim">{t.emptyText}</p>
      </div>
    );
  }

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-12">
      <ol className="grid grid-cols-1 items-end gap-6 pt-6 md:grid-cols-3" aria-label={t.podium}>
        {podium.map((entry, index) => (
          <PodiumStep key={entry.gameId} entry={entry} place={index as 0 | 1 | 2} />
        ))}
      </ol>

      {rest.length > 0 && (
        <section className="panel overflow-x-auto" aria-label={t.rest}>
          <table className="w-full text-sm">
            <thead>
              <tr className="label border-b border-line text-left text-[10px]">
                <th scope="col" className="px-5 py-3 font-semibold">{t.rank}</th>
                <th scope="col" className="px-2 py-3 font-semibold">{t.player}</th>
                <th scope="col" className="px-2 py-3 text-right font-semibold">{t.return}</th>
                <th scope="col" className="hidden px-2 py-3 text-right font-semibold sm:table-cell">{t.value}</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">{t.points}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rest.map((entry) => (
                <tr key={entry.gameId} className="hover:bg-ink-3">
                  <td className="num px-5 py-3 text-paper-dim">{String(entry.rank).padStart(2, '0')}</td>
                  <td className="px-2 py-3 font-display text-base text-paper">{entry.userName}</td>
                  <td className="px-2 py-3 text-right">
                    <PerformanceBadge value={entry.returnPercentage} />
                  </td>
                  <td className="num hidden px-2 py-3 text-right text-paper sm:table-cell">
                    {f.currency(entry.totalValue, entry.currency)}
                  </td>
                  <td className="num px-5 py-3 text-right text-brass">{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
