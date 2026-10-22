/**
 * FINANCEQUEST - BRAND: TickerTape
 * Bande de téléscripteur qui défile (dupliquée pour une boucle sans couture)
 */

'use client';

import { useI18n } from '@/lib/i18n/client';
import { cn } from '@/lib/utils/cn';

export interface TickerTapeItem {
  symbol: string;
  name?: string;
  changePercent: number;
}

interface TickerTapeProps {
  items: TickerTapeItem[];
  className?: string;
}

export function TickerTape({ items, className }: TickerTapeProps) {
  const { m, f } = useI18n();
  if (items.length === 0) return null;

  // Signe moins typographique ; pas de décimale au-delà de 100 %
  const formatChange = (value: number) => {
    const abs = Math.abs(value);
    return `${value >= 0 ? '+' : '−'}${f.percent(abs, abs >= 100 ? 0 : 1, false)}`;
  };

  const loop = [...items, ...items];

  return (
    <div
      className={cn('group relative overflow-hidden border-y border-line bg-ink-2 py-2.5', className)}
      aria-label={m.common.tickerAria}
    >
      <div className="flex w-max animate-ticker group-hover:[animation-play-state:paused]">
        {loop.map((item, index) => {
          const up = item.changePercent >= 0;
          return (
            <span
              key={`${item.symbol}-${index}`}
              className="num flex items-center gap-2 whitespace-nowrap border-r border-line px-5 text-[13px]"
              aria-hidden={index >= items.length}
            >
              <span className="font-semibold text-paper">{item.symbol.replace('^', '')}</span>
              {item.name && <span className="hidden text-paper-faint sm:inline">{item.name}</span>}
              <span className={up ? 'text-gain' : 'text-loss'}>
                {up ? '▲' : '▼'} {formatChange(item.changePercent)}
              </span>
            </span>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink-2 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink-2 to-transparent" />
    </div>
  );
}
