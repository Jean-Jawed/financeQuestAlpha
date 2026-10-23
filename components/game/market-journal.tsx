/**
 * FINANCEQUEST - COMPONENT: MarketJournal
 * Le journal de la séance : grands indices, humeur du marché, plus fortes hausses
 * et baisses de la séance ou de la semaine (valeurs du scénario). Un clic sur une
 * valeur ouvre son ticket d'ordre.
 */

'use client';

import { useEffect, useState } from 'react';
import { TradeTicket, type TicketAsset } from '@/components/game/trade-ticket';
import { useI18n } from '@/lib/i18n/client';
import { getScenario } from '@/lib/game/scenarios';
import { cn } from '@/lib/utils/cn';
import type { MarketMovers, Mover } from '@/lib/market/movers';
import type { GameState } from '@/types/game';

interface MarketJournalProps {
  gameId: string;
  currentDate: string;
  currency: string;
  scenario: string;
  allowShorting: boolean;
  feeRate: number;
  availableCash: number;
  onTradeComplete: (state?: GameState) => void;
}

type Period = 'day' | 'week';

// ==========================================
// SOUS-COMPOSANTS
// ==========================================

function Change({ value, className }: { value: number | null; className?: string }) {
  const { f } = useI18n();
  if (value === null) return <span className={cn('num text-paper-faint', className)}>—</span>;
  return (
    <span className={cn('num', value > 0 ? 'text-gain' : value < 0 ? 'text-loss' : 'text-paper-faint', className)}>
      {value > 0 ? '▲ ' : value < 0 ? '▼ ' : '■ '}
      {f.percent(value, 1)}
    </span>
  );
}

function MoverList({
  title,
  movers,
  onSelect,
}: {
  title: string;
  movers: Mover[];
  onSelect: (mover: Mover) => void;
}) {
  const { m } = useI18n();

  return (
    <div className="min-w-0">
      <h3 className="label mb-1 px-5 text-[10px]">{title}</h3>
      {movers.length === 0 ? (
        <p className="px-5 py-3 text-sm text-paper-faint">{m.game.journal.none}</p>
      ) : (
        <ol className="divide-y divide-line">
          {movers.map((mover, index) => (
            // Sur téléphone, les 3 premières suffisent : la page reste courte
            <li key={mover.symbol} className={index >= 3 ? 'hidden sm:block' : undefined}>
              <button
                type="button"
                onClick={() => onSelect(mover)}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-2 text-left transition-colors hover:bg-ink-3"
              >
                <span className="min-w-0">
                  <span className="num block text-sm font-semibold text-paper">{mover.symbol}</span>
                  <span className="block truncate text-xs text-paper-dim">{mover.name}</span>
                </span>
                <Change value={mover.changePercent} className="text-sm" />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ==========================================
// COMPONENT
// ==========================================

export function MarketJournal({
  gameId,
  currentDate,
  currency,
  scenario,
  allowShorting,
  feeRate,
  availableCash,
  onTradeComplete,
}: MarketJournalProps) {
  const { m, fmt } = useI18n();
  const t = m.game.journal;
  const [period, setPeriod] = useState<Period>('day');
  const [data, setData] = useState<MarketMovers | null>(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<TicketAsset | null>(null);

  // Relu à chaque séance (les cours passés ne changent pas : réponse mise en cache)
  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    const params = new URLSearchParams({ date: currentDate, scenario });

    fetch(`/api/market/movers?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json) => !cancelled && setData(json.data))
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [currentDate, scenario]);

  const ranking = data ? data[period] : null;
  const breadth = data?.breadth;
  const total = breadth ? breadth.up + breadth.down + breadth.flat : 0;

  return (
    <section className="panel" aria-labelledby="journal-title">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <p className="label text-brass">{t.label}</p>
          <h2 id="journal-title" className="font-display text-2xl font-semibold text-paper">
            {t.title}
          </h2>
        </div>
        <div className="flex gap-1 rounded border border-line bg-ink p-1" role="tablist" aria-label={t.period}>
          {(['day', 'week'] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={period === value}
              onClick={() => setPeriod(value)}
              className={cn(
                'h-8 rounded-sm px-3 font-label text-xs font-semibold uppercase tracking-label transition-colors',
                period === value ? 'bg-brass text-ink' : 'text-paper-dim hover:text-paper'
              )}
            >
              {t[value]}
            </button>
          ))}
        </div>
      </header>

      {failed ? (
        <p className="px-5 py-8 text-center text-sm text-paper-dim">{t.unavailable}</p>
      ) : !data || !ranking ? (
        <div className="space-y-2 px-5 py-6" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className="block h-4 animate-pulse rounded-sm bg-ink-3" />
          ))}
        </div>
      ) : (
        <>
          {/* Grands indices */}
          <dl className="grid grid-cols-2 gap-px border-b border-line bg-line sm:grid-cols-4" aria-label={t.indices}>
            {data.indices.map((index) => (
              <div key={index.symbol} className="bg-ink-2 px-4 py-3">
                <dt className="label truncate text-[10px]">{index.name}</dt>
                <dd className="mt-0.5 text-sm">
                  <Change value={period === 'day' ? index.day : index.week} />
                </dd>
              </div>
            ))}
          </dl>

          {/* Humeur du marché (séance) */}
          {breadth && total > 0 && (
            <div className="border-b border-line px-5 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="label whitespace-nowrap text-[10px]">{t.breadthLabel}</span>
                <span className="num whitespace-nowrap text-xs text-paper-dim">{fmt(t.breadth, { up: breadth.up, down: breadth.down })}</span>
              </div>
              <div className="mt-2 flex h-1.5 overflow-hidden rounded-sm bg-ink" aria-hidden="true">
                <span className="bg-gain" style={{ width: `${(breadth.up / total) * 100}%` }} />
                <span className="bg-paper-faint/40" style={{ width: `${(breadth.flat / total) * 100}%` }} />
                <span className="bg-loss" style={{ width: `${(breadth.down / total) * 100}%` }} />
              </div>
            </div>
          )}

          {/* Palmarès */}
          <div className="grid gap-4 py-3 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-line">
            <MoverList title={t.gainers} movers={ranking.gainers} onSelect={(mover) => setSelected(mover)} />
            <MoverList title={t.losers} movers={ranking.losers} onSelect={(mover) => setSelected(mover)} />
          </div>
          <p className="border-t border-line px-5 py-2 text-[11px] text-paper-faint">{t.note}</p>
        </>
      )}

      {selected && (
        <TradeTicket
          gameId={gameId}
          currentDate={currentDate}
          currency={currency}
          feeRate={feeRate}
          asset={{ symbol: selected.symbol, name: selected.name }}
          mode="open"
          allowShorting={allowShorting}
          allowedActions={getScenario(scenario).rules.actions}
          availableCash={availableCash}
          onClose={() => setSelected(null)}
          onDone={onTradeComplete}
        />
      )}
    </section>
  );
}
