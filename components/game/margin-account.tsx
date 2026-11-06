/**
 * PASTFOLIO - COMPONENT: compte sur marge
 * MarginAccount : où est le cash quand on a des découverts
 *   (réservé au rachat, bloqué en garantie, disponible) et niveau de marge
 * MarginAlert : bandeau d'alerte (garantie insuffisante, appel de marge proche)
 * Rien ne s'affiche sans position à découvert.
 */

'use client';

import { useI18n } from '@/lib/i18n/client';
import { SHORT_MARGIN_RATIO } from '@/lib/game/portfolio-math';
import { MAINTENANCE_MARGIN_RATIO, MARGIN_WARNING_RATIO, toleratedRise } from '@/lib/game/margin-call';
import { cn } from '@/lib/utils/cn';
import type { PortfolioSummary } from '@/types/game';

const EPSILON = 0.005;

function marginRatio(portfolio: PortfolioSummary): number | null {
  return portfolio.shortLiability > EPSILON ? portfolio.totalValue / portfolio.shortLiability : null;
}

function ratioTone(ratio: number): string {
  return ratio < MARGIN_WARNING_RATIO ? 'text-loss' : ratio < SHORT_MARGIN_RATIO ? 'text-brass-bright' : 'text-gain';
}

// ==========================================
// COMPTE SUR MARGE
// ==========================================

export function MarginAccount({ portfolio, currency, className }: { portfolio: PortfolioSummary; currency: string; className?: string }) {
  const { m, f, fmt } = useI18n();
  const t = m.game.machine.marginAccount;
  const ratio = marginRatio(portfolio);
  if (ratio === null) return null;

  const cash = portfolio.currentBalance;
  const reserved = portfolio.shortLiability;
  const available = portfolio.availableCash;
  // Garantie prise sur les liquidités ; le reste est couvert par les titres détenus
  const lockedCash = Math.min(Math.max(cash - reserved - available, 0), portfolio.marginRequired);
  const bySecurities = portfolio.marginRequired - lockedCash;
  const rise = toleratedRise({ equity: portfolio.totalValue, liability: portfolio.shortLiability });
  const percent = (value: number) => f.percent(value * 100, 0, false);

  const rows = [
    { label: t.reserved, value: -reserved, hint: fmt(t.reservedHint, { proceeds: f.currency(portfolio.shortProceeds, currency) }), locked: true },
    {
      label: t.collateral,
      value: -lockedCash,
      hint: fmt(t.collateralHint, { ratio: percent(SHORT_MARGIN_RATIO), required: f.currency(portfolio.marginRequired, currency) }),
      note: bySecurities > EPSILON ? fmt(t.coveredBySecurities, { amount: f.currency(bySecurities, currency) }) : undefined,
      locked: true,
    },
  ];

  // Jauge de 0 à 100 % : repères au seuil d'appel et à la marge initiale
  const scale = (value: number) => `${Math.min(Math.max(value, 0), 1) * 100}%`;

  return (
    <section className={cn('rounded-sm border border-line bg-ink/60 p-3 text-sm', className)} aria-labelledby="margin-account-title">
      <p id="margin-account-title" className="label mb-2 text-[10px] text-brass-bright">
        {t.title}
      </p>

      <dl className="space-y-1.5">
        <div className="flex justify-between gap-3">
          <dt className="text-paper-dim">{t.cash}</dt>
          <dd className="num text-paper">{f.currency(cash, currency)}</dd>
        </div>
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3 pl-3" title={row.hint}>
            <dt className="text-paper-dim">
              <span aria-hidden="true">🔒 </span>
              {row.label}
              {row.note && <span className="block text-[11px] text-paper-faint">{row.note}</span>}
            </dt>
            <dd className="num text-paper-dim">{f.currency(row.value, currency)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 border-t border-line pt-1.5 font-semibold" title={t.availableHint}>
          <dt className="text-paper">{t.available}</dt>
          <dd className={cn('num', available < -EPSILON ? 'text-loss' : 'text-paper')}>{f.currency(available, currency)}</dd>
        </div>
      </dl>

      <div className="mt-3" title={fmt(t.ratioHint, { initial: percent(SHORT_MARGIN_RATIO), threshold: percent(MAINTENANCE_MARGIN_RATIO) })}>
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-paper-dim">{t.ratio}</span>
          <span className={cn('num font-semibold', ratioTone(ratio))}>{percent(ratio)}</span>
        </div>
        <div className="relative mt-1 h-2 overflow-hidden rounded-full bg-[#120C16] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]">
          <div
            className={cn('h-full rounded-full transition-[width] duration-700', ratio < MARGIN_WARNING_RATIO ? 'bg-loss' : ratio < SHORT_MARGIN_RATIO ? 'bg-brass' : 'bg-gain')}
            style={{ width: scale(ratio) }}
          />
          <span className="absolute inset-y-0 w-px bg-loss" style={{ left: scale(MAINTENANCE_MARGIN_RATIO) }} aria-hidden="true" />
          <span className="absolute inset-y-0 w-px bg-paper-dim" style={{ left: scale(SHORT_MARGIN_RATIO) }} aria-hidden="true" />
        </div>
        <div className="relative mt-0.5 h-3 text-[10px] text-paper-faint" aria-hidden="true">
          <span className="num absolute -translate-x-1/2 text-loss" style={{ left: scale(MAINTENANCE_MARGIN_RATIO) }}>
            {percent(MAINTENANCE_MARGIN_RATIO)}
          </span>
          <span className="num absolute -translate-x-1/2" style={{ left: scale(SHORT_MARGIN_RATIO) }}>
            {percent(SHORT_MARGIN_RATIO)}
          </span>
        </div>
        {rise !== null && (
          <p className={cn('mt-1.5 text-xs', rise <= 0 ? 'font-semibold text-loss' : ratio < MARGIN_WARNING_RATIO ? 'text-loss' : 'text-paper-dim')}>
            {rise <= 0 ? t.called : fmt(t.rise, { rise: `+${f.percent(rise * 100, 1, false)}` })}
          </p>
        )}
      </div>
    </section>
  );
}

// ==========================================
// ALERTE
// ==========================================

export function MarginAlert({ portfolio, currency, className }: { portfolio: PortfolioSummary; currency: string; className?: string }) {
  const { m, f, fmt } = useI18n();
  const t = m.game.machine.marginAlert;
  const ratio = marginRatio(portfolio);
  if (ratio === null) return null;

  const percent = (value: number) => f.percent(value * 100, 0, false);
  const rise = toleratedRise({ equity: portfolio.totalValue, liability: portfolio.shortLiability }) ?? 0;
  const values = {
    ratio: percent(ratio),
    threshold: percent(MAINTENANCE_MARGIN_RATIO),
    rise: `+${f.percent(Math.max(rise, 0) * 100, 1, false)}`,
    missing: f.currency(-portfolio.availableCash, currency),
  };

  let alert: { title: string; text: string; danger: boolean } | null = null;
  if (ratio < MAINTENANCE_MARGIN_RATIO) {
    alert = { title: t.calledTitle, text: fmt(t.called, values), danger: true };
  } else if (ratio < MARGIN_WARNING_RATIO) {
    alert = { title: t.warningTitle, text: fmt(t.warning, values), danger: true };
  } else if (portfolio.availableCash < -EPSILON) {
    alert = { title: t.blockedTitle, text: fmt(t.blocked, values), danger: false };
  }
  if (!alert) return null;

  return (
    <aside
      role={alert.danger ? 'alert' : 'status'}
      className={cn(
        'ivory flex flex-col gap-2 border-l-4 px-4 py-3 shadow-[0_6px_14px_rgba(0,0,0,0.45)] sm:flex-row sm:items-center sm:gap-5 sm:px-5',
        alert.danger ? 'border-l-loss' : 'border-l-brass',
        className
      )}
    >
      <span
        className={cn(
          'shrink-0 self-start border-2 px-2 py-0.5 font-label text-xs font-bold uppercase tracking-[0.2em] sm:self-center',
          alert.danger ? 'border-loss text-loss' : 'border-brass text-brass'
        )}
      >
        {alert.title}
      </span>
      <p className="min-w-0 flex-1 text-sm text-ivory-ink">{alert.text}</p>
    </aside>
  );
}
