/**
 * FINANCEQUEST - COMPONENT: PriceChart
 * Courbe des cours de clôture jusqu'au jour simulé (jamais au-delà), tracée à la
 * plume : filet laiton, aplat d'encre, volumes en pied, axe des dates.
 * Lecture des cours : réticule qui suit la souris ; au doigt, on appuie et on glisse
 * (le défilement vertical de la page reste possible). Chiffres clés en dessous.
 */

'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { computePriceStats, pctChange, type PricePoint } from '@/lib/market/price-stats';
import { cn } from '@/lib/utils/cn';

// ==========================================
// TYPES
// ==========================================

interface PriceChartProps {
  symbol: string;
  /** Jour simulé : dernier point de la courbe */
  currentDate: string;
  /** Devise de cotation de l'actif (les cours ne sont pas convertis ici) */
  currency: string;
  /** Prix de revient du joueur, en devise de cotation (position détenue) */
  costPrice?: number;
}

type Period = 'm1' | 'm3' | 'm6' | 'y1';

const PERIOD_DAYS: Record<Period, number> = { m1: 31, m3: 92, m6: 183, y1: 366 };

// ==========================================
// HELPERS
// ==========================================

function shiftDate(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

const WIDTH = 600;
const PRICE_HEIGHT = 150;
const VOLUME_HEIGHT = 32;
const HEIGHT = PRICE_HEIGHT + VOLUME_HEIGHT;
const PAD_Y = 10;

// ==========================================
// COMPONENT
// ==========================================

export function PriceChart({ symbol, currentDate, currency, costPrice }: PriceChartProps) {
  const { m, f, fmt } = useI18n();
  const t = m.game.chart;
  const gradientId = useId();
  const [history, setHistory] = useState<PricePoint[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [period, setPeriod] = useState<Period>('m3');
  const [hover, setHover] = useState<number | null>(null);
  const [touch, setTouch] = useState(false);

  // Un an d'historique, chargé une fois : les durées plus courtes en sont des extraits
  useEffect(() => {
    let cancelled = false;
    setHistory(null);
    setFailed(false);

    const params = new URLSearchParams({ symbol, from: shiftDate(currentDate, -PERIOD_DAYS.y1), to: currentDate });
    fetch(`/api/market/history?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json) => {
        if (cancelled) return;
        const points: PricePoint[] = (json.data?.history ?? [])
          .map((p: { date: string; close: number; volume?: number }) => ({
            date: p.date,
            close: Number(p.close),
            volume: p.volume ? Number(p.volume) : null,
          }))
          .filter((p: PricePoint) => p.close > 0);
        setHistory(points);
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [symbol, currentDate]);

  // Mobile : l'aide parle du doigt plutôt que de la souris
  useEffect(() => {
    setTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const stats = useMemo(() => (history ? computePriceStats(history) : null), [history]);
  const points = useMemo(() => {
    if (!history) return [];
    const from = shiftDate(currentDate, -PERIOD_DAYS[period]);
    return history.filter((p) => p.date > from);
  }, [history, currentDate, period]);

  if (failed || (history !== null && points.length < 2)) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded border border-line bg-ink text-sm text-paper-dim">
        {t.unavailable}
      </div>
    );
  }

  if (history === null) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded border border-line bg-ink">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  // Échelles (le prix de revient reste visible s'il sort de la plage)
  const closes = points.map((p) => p.close);
  const min = Math.min(...closes, ...(costPrice ? [costPrice] : []));
  const max = Math.max(...closes, ...(costPrice ? [costPrice] : []));
  const range = max - min || 1;
  const xRatio = (i: number) => i / (points.length - 1);
  const x = (i: number) => xRatio(i) * WIDTH;
  const yRatio = (v: number) => (PAD_Y + (1 - (v - min) / range) * (PRICE_HEIGHT - PAD_Y * 2)) / HEIGHT;
  const y = (v: number) => yRatio(v) * HEIGHT;

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(p.close).toFixed(1)}`).join('');
  const area = `${line}L${WIDTH} ${PRICE_HEIGHT}L0 ${PRICE_HEIGHT}Z`;
  const maxVolume = Math.max(...points.map((p) => p.volume ?? 0));
  const barWidth = Math.max(WIDTH / points.length - 1, 1);

  // Point lu : celui sous le curseur, sinon le dernier
  const index = hover ?? points.length - 1;
  const point = points[index];
  const change = pctChange(points[0].close, point.close);
  const up = (change ?? 0) >= 0;

  function pick(clientX: number, target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    setHover(Math.round(ratio * (points.length - 1)));
  }

  // Quatre repères de dates, répartis sur la période
  const ticks = [0, 1, 2, 3].map((k) => Math.round((k / 3) * (points.length - 1)));

  const statItems = stats
    ? [
        { label: t.stats.day, value: stats.day, kind: 'change' as const },
        { label: t.stats.week, value: stats.week, kind: 'change' as const },
        { label: t.stats.month, value: stats.month, kind: 'change' as const },
        { label: t.stats.ytd, value: stats.ytd, kind: 'change' as const },
        { label: t.stats.high, value: stats.high, kind: 'price' as const },
        { label: t.stats.low, value: stats.low, kind: 'price' as const },
        { label: t.stats.volatility, value: stats.volatility, kind: 'plain' as const },
        { label: t.stats.volume, value: stats.averageVolume, kind: 'volume' as const },
      ]
    : [];

  return (
    <figure className="rounded border border-line bg-ink p-3">
      {/* Point lu et choix de la durée */}
      <figcaption className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div aria-live="polite">
          <p className="label text-[10px]">
            {hover === null ? fmt(t.inCurrency, { currency }) : f.date(point.date)}
          </p>
          <p className="mt-0.5 flex items-baseline gap-2">
            <span className="num text-lg text-paper">{f.currency(point.close, currency)}</span>
            {change !== null && (
              <span className={cn('num text-sm', up ? 'text-gain' : 'text-loss')}>
                {up ? '▲ ' : '▼ '}
                {f.percent(change, 1)}
                <span className="text-paper-faint"> {t.overPeriod}</span>
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-1 rounded border border-line bg-ink-2 p-0.5" role="tablist" aria-label={t.periodLabel}>
          {(Object.keys(PERIOD_DAYS) as Period[]).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={period === value}
              onClick={() => {
                setPeriod(value);
                setHover(null);
              }}
              className={cn(
                'h-7 min-w-[2.5rem] rounded-sm px-2 font-label text-xs font-semibold uppercase tracking-label transition-colors',
                period === value ? 'bg-brass text-ink' : 'text-paper-dim hover:text-paper'
              )}
            >
              {t.periods[value]}
            </button>
          ))}
        </div>
      </figcaption>

      {/* Courbe et volumes */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="block h-[190px] w-full"
          role="img"
          aria-label={fmt(t.aria, {
            symbol,
            from: f.currency(points[0].close, currency),
            to: f.currency(points[points.length - 1].close, currency),
          })}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#C9A45C" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#C9A45C" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Graduations horizontales */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              x2={WIDTH}
              y1={PAD_Y + ratio * (PRICE_HEIGHT - PAD_Y * 2)}
              y2={PAD_Y + ratio * (PRICE_HEIGHT - PAD_Y * 2)}
              stroke="rgb(239 230 210 / 0.08)"
              strokeDasharray="2 4"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Volumes */}
          {maxVolume > 0 &&
            points.map((p, i) =>
              p.volume ? (
                <rect
                  key={p.date}
                  x={x(i) - barWidth / 2}
                  width={barWidth}
                  y={HEIGHT - (p.volume / maxVolume) * (VOLUME_HEIGHT - 4)}
                  height={(p.volume / maxVolume) * (VOLUME_HEIGHT - 4)}
                  fill={i === index ? '#C9A45C' : 'rgb(239 230 210 / 0.14)'}
                />
              ) : null
            )}

          <path d={area} fill={`url(#${gradientId})`} />
          <path d={line} fill="none" stroke="#C9A45C" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />

          {/* Prix de revient */}
          {costPrice !== undefined && (
            <line
              x1="0"
              x2={WIDTH}
              y1={y(costPrice)}
              y2={y(costPrice)}
              stroke="#EFE6D2"
              strokeOpacity="0.55"
              strokeDasharray="6 4"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {/* Réticule et point lu (en HTML : pas déformés par l'étirement du SVG) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-px bg-paper/30"
          style={{ left: `${xRatio(index) * 100}%` }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-brass-bright"
          style={{ left: `${xRatio(index) * 100}%`, top: `${yRatio(point.close) * 100}%` }}
        />
        {costPrice !== undefined && (
          <span
            className="label pointer-events-none absolute right-1 -translate-y-full bg-ink/80 px-1 text-[9px] text-paper-dim"
            style={{ top: `${yRatio(costPrice) * 100}%` }}
          >
            {t.costLine}
          </span>
        )}

        {/* Zone de lecture : souris ou doigt ; défilement vertical conservé */}
        <div
          className="absolute inset-0 cursor-crosshair touch-pan-y"
          onPointerMove={(e) => pick(e.clientX, e.currentTarget)}
          onPointerDown={(e) => pick(e.clientX, e.currentTarget)}
          onPointerLeave={() => setHover(null)}
          onPointerCancel={() => setHover(null)}
        />
      </div>

      {/* Axe des dates */}
      <div className="num relative mt-1 h-4 text-[10px] text-paper-faint">
        {ticks.map((tick, k) => (
          <span
            key={tick}
            className={cn('absolute', k === 0 ? 'left-0' : k === ticks.length - 1 ? 'right-0' : '-translate-x-1/2')}
            style={k === 0 || k === ticks.length - 1 ? undefined : { left: `${xRatio(tick) * 100}%` }}
          >
            {f.dayMonth(points[tick].date)}
          </span>
        ))}
      </div>
      <p className="mt-1 text-[10px] text-paper-faint">{touch ? t.hintTouch : t.hint}</p>

      {/* Chiffres clés (sur un an d'historique) */}
      {statItems.length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-4">
          {statItems.map((item) => (
            <div key={item.label} className="bg-ink-2 px-3 py-2">
              <dt className="label truncate text-[9px]">{item.label}</dt>
              <dd
                className={cn(
                  'num mt-0.5 text-sm',
                  item.kind === 'change' && item.value !== null
                    ? item.value > 0
                      ? 'text-gain'
                      : item.value < 0
                        ? 'text-loss'
                        : 'text-paper'
                    : 'text-paper'
                )}
              >
                {item.value === null
                  ? '—'
                  : item.kind === 'change'
                    ? f.percent(item.value, 1)
                    : item.kind === 'price'
                      ? f.currency(item.value, currency)
                      : item.kind === 'volume'
                        ? f.compact(item.value)
                        : f.percent(item.value, 0, false)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </figure>
  );
}
