/**
 * FINANCEQUEST - COMPONENT: PortfolioSummary
 * Valeur liquidative et décomposition : liquidités + titres + découverts = total
 */

'use client';

import { PerformanceBadge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n/client';
import { cn } from '@/lib/utils/cn';
import type { PortfolioSummary as PortfolioSummaryType } from '@/types/game';

// ==========================================
// TYPES
// ==========================================

interface PortfolioSummaryProps {
  portfolio: PortfolioSummaryType;
  /** Devise de la partie */
  currency: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function PortfolioSummary({ portfolio, currency }: PortfolioSummaryProps) {
  const { m, f } = useI18n();
  const t = m.game.summary;
  const up = portfolio.profitLoss >= 0;

  const lines = [
    { label: t.cash, value: portfolio.availableCash, signed: false },
    { label: t.securities, value: portfolio.portfolioValueLong, signed: false },
    ...(portfolio.shortPositionsPnl !== 0 || portfolio.shortLiability > 0
      ? [{ label: t.shorts, value: portfolio.shortPositionsPnl, signed: true }]
      : []),
  ];

  return (
    <section className="panel overflow-hidden" aria-labelledby="summary-title">
      <div className="border-b border-line px-5 py-5">
        <p id="summary-title" className="label text-brass">
          {t.netValue}
        </p>
        <p className="num mt-2 text-4xl font-semibold leading-none text-paper">
          {f.currency(portfolio.totalValue, currency)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <PerformanceBadge value={portfolio.returnPercentage} />
          <span className={cn('num text-sm', up ? 'text-gain' : 'text-loss')}>
            {up ? '+' : ''}
            {f.currency(portfolio.profitLoss, currency)}
          </span>
        </div>
      </div>

      {/* Décomposition : les lignes s'additionnent pour donner la valeur */}
      <dl className="space-y-2.5 px-5 py-4 text-sm">
        {lines.map((line) => (
          <div key={line.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-paper-dim">{line.label}</dt>
            <dd
              className={cn(
                'num',
                line.signed ? (line.value >= 0 ? 'text-gain' : 'text-loss') : 'text-paper'
              )}
            >
              {line.signed && line.value > 0 ? '+' : ''}
              {f.currency(line.value, currency)}
            </dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-2.5">
          <dt className="text-paper-faint">{t.initial}</dt>
          <dd className="num text-paper-faint">{f.currency(portfolio.initialBalance, currency)}</dd>
        </div>
      </dl>
    </section>
  );
}
