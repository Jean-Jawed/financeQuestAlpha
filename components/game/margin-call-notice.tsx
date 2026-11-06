/**
 * PASTFOLIO - COMPONENT: MarginCallNotice
 * Avis d'appel de marge : les ordres passés d'office par le courtier à
 * l'ouverture de la séance en cours (lus dans le livre d'ordres, donc visibles
 * aussi après un rechargement ou une séance avancée par le groupe)
 */

'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/client';
import { MAINTENANCE_MARGIN_RATIO } from '@/lib/game/margin-call';
import { cn } from '@/lib/utils/cn';
import type { Transaction } from '@/types/database';

interface MarginCallNoticeProps {
  transactions: Transaction[];
  currentDate: string;
  currency: string;
  className?: string;
}

export function MarginCallNotice({ transactions, currentDate, currency, className }: MarginCallNoticeProps) {
  const { m, f, fmt } = useI18n();
  const t = m.game.machine.marginCall;
  // Refermé pour cette séance seulement
  const [closedOn, setClosedOn] = useState<string | null>(null);

  const forced = transactions.filter((tx) => tx.forced && tx.transactionDate === currentDate);
  if (forced.length === 0 || closedOn === currentDate) return null;

  return (
    <aside
      role="alert"
      className={cn(
        'ivory relative flex flex-col gap-3 border-l-4 border-l-loss px-4 py-3 shadow-[0_6px_14px_rgba(0,0,0,0.45)] sm:flex-row sm:items-center sm:gap-5 sm:px-5',
        className
      )}
    >
      <span className="shrink-0 self-start border-2 border-loss px-2 py-0.5 font-label text-xs font-bold uppercase tracking-[0.2em] text-loss sm:self-center">
        {t.title}
      </span>
      <div className="min-w-0 flex-1 text-sm text-ivory-ink">
        <p>{fmt(t.text, { threshold: f.percent(MAINTENANCE_MARGIN_RATIO * 100, 0, false) })}</p>
        <ul className="num mt-1 space-y-0.5 text-[13px]">
          {forced.map((tx) => (
            <li key={tx.id}>
              — {fmt(tx.type === 'sell' ? t.sell : t.cover, {
                quantity: f.quantity(parseFloat(tx.quantity)),
                symbol: tx.symbol,
                price: f.currency(parseFloat(tx.price), currency),
              })}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={() => setClosedOn(currentDate)}
        className="shrink-0 self-end rounded-sm border border-ivory-ink/60 bg-ivory-ink px-3 py-1.5 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-ivory transition-opacity hover:opacity-85 sm:self-center"
      >
        {t.close}
      </button>
    </aside>
  );
}
