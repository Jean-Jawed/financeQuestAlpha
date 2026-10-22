/**
 * FINANCEQUEST - COMPONENT: PriceChart
 * Courbe des cours de clôture jusqu'au jour simulé (jamais au-delà),
 * tracée à la plume : filet laiton, aplat d'encre, graduations discrètes
 */

'use client';

import { useEffect, useId, useState } from 'react';
import { useI18n } from '@/lib/i18n/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// ==========================================
// TYPES
// ==========================================

interface PricePoint {
  date: string;
  close: number;
}

interface PriceChartProps {
  symbol: string;
  /** Jour simulé : dernier point de la courbe */
  currentDate: string;
  /** Devise de cotation de l'actif (les cours ne sont pas convertis ici) */
  currency: string;
  /** Profondeur d'historique en jours calendaires */
  days?: number;
}

// ==========================================
// HELPERS
// ==========================================

function shiftDate(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

const WIDTH = 600;
const HEIGHT = 180;
const PAD_Y = 12;

// ==========================================
// COMPONENT
// ==========================================

export function PriceChart({ symbol, currentDate, currency, days = 120 }: PriceChartProps) {
  const { m, f, fmt } = useI18n();
  const t = m.game.chart;
  const gradientId = useId();
  const [points, setPoints] = useState<PricePoint[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPoints(null);
    setFailed(false);

    const params = new URLSearchParams({ symbol, from: shiftDate(currentDate, -days), to: currentDate });
    fetch(`/api/market/history?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json) => {
        if (cancelled) return;
        const history: PricePoint[] = (json.data?.history ?? [])
          .map((p: { date: string; close: number }) => ({ date: p.date, close: Number(p.close) }))
          .filter((p: PricePoint) => p.close > 0);
        setPoints(history);
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [symbol, currentDate, days]);

  if (failed || (points !== null && points.length < 2)) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded border border-line bg-ink text-sm text-paper-dim">
        {t.unavailable}
      </div>
    );
  }

  if (points === null) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded border border-line bg-ink">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  const closes = points.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const x = (i: number) => (i / (points.length - 1)) * WIDTH;
  const y = (v: number) => PAD_Y + (1 - (v - min) / range) * (HEIGHT - PAD_Y * 2);

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(p.close).toFixed(1)}`).join('');
  const area = `${line}L${WIDTH} ${HEIGHT}L0 ${HEIGHT}Z`;

  const first = closes[0];
  const last = closes[closes.length - 1];
  const change = ((last - first) / first) * 100;
  const up = change >= 0;

  return (
    <figure className="rounded border border-line bg-ink p-3">
      <figcaption className="mb-2 flex items-baseline justify-between gap-3">
        <span className="label text-[10px]">{fmt(t.caption, { days, currency })}</span>
        <span className={`num text-sm ${up ? 'text-gain' : 'text-loss'}`}>
          {up ? '▲ ' : '▼ '}
          {f.percent(change, 1)}
        </span>
      </figcaption>

      <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="block h-[150px] w-full"
        role="img"
        aria-label={fmt(t.aria, { symbol, from: f.currency(first, currency), to: f.currency(last, currency) })}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#C9A45C" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#C9A45C" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Graduations horizontales */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1="0"
            x2={WIDTH}
            y1={PAD_Y + t * (HEIGHT - PAD_Y * 2)}
            y2={PAD_Y + t * (HEIGHT - PAD_Y * 2)}
            stroke="rgb(239 230 210 / 0.08)"
            strokeDasharray="2 4"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke="#C9A45C" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* Dernier cours : point HTML (le SVG est étiré, un cercle y deviendrait ovale) */}
      <span
        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brass-bright ring-2 ring-ink"
        style={{ left: '100%', top: `${(y(last) / HEIGHT) * 100}%` }}
      />
      </div>

      <div className="num mt-1 flex justify-between text-[11px] text-paper-dim">
        <span>{fmt(t.low, { price: f.currency(min, currency) })}</span>
        <span>{fmt(t.high, { price: f.currency(max, currency) })}</span>
      </div>
    </figure>
  );
}
