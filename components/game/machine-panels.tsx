/**
 * PASTFOLIO - COMPONENT: panneaux de l'écran de jeu (« salle des machines »)
 * PlayerPlate : fiche du joueur (médaillon orné, plaque, titre, tube d'XP)
 * ValueCounter : valeur du portefeuille sur compteur à tambours, cadre miroir
 * NextAchievement : le succès le plus proche, ou les derniers obtenus
 * AllocationBar : répartition par catégorie d'actif et liquidités
 */

'use client';

import { useEffect, useState } from 'react';
import { Gear } from '@/components/brand/ornaments';
import { Frame, Plate } from '@/components/machine/frame';
import { Medallion, Odometer, XpTube } from '@/components/machine/instruments';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/lib/i18n/client';
import { categoryColor } from '@/lib/market/category-colors';
import { cn } from '@/lib/utils/cn';
import type { SessionChange } from '@/lib/game/session-change';
import type { HoldingWithValue, PortfolioSummary } from '@/types/game';

// ==========================================
// FICHE DU JOUEUR
// ==========================================

interface PlayerPlateProps {
  achievements: number;
  sessions: number;
  /** Partie de groupe : rang du joueur à sa date */
  groupRank?: { rank: number; total: number } | null;
  /** Version compacte (bandeau mobile) */
  compact?: boolean;
  className?: string;
}

export function PlayerPlate({ achievements, sessions, groupRank, compact = false, className }: PlayerPlateProps) {
  const { m, fmt } = useI18n();
  const t = m.game.machine;
  const { user } = useAuth();
  if (!user) return null;

  if (compact) {
    return (
      <div className={cn('flex min-w-0 items-center gap-3', className)}>
        <Medallion avatarId={user.avatarId} name={user.name} xpTotal={user.xpTotal} size={52} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base italic text-paper">{user.name}</p>
          <XpTube xpTotal={user.xpTotal} compact className="mt-0.5" />
        </div>
      </div>
    );
  }

  return (
    <Frame outerClassName={className} className="flex h-full items-center gap-4 overflow-hidden px-4 py-2.5 pl-7">
      <Gear className="absolute -left-12 -top-12 h-32 w-32 opacity-20" />
      <Medallion avatarId={user.avatarId} name={user.name} xpTotal={user.xpTotal} size={72} ornate />
      <div className="relative min-w-0 flex-1">
        <Plate className="max-w-full truncate px-3 py-1 font-display text-sm normal-case leading-tight tracking-normal">{user.name}</Plate>
        <XpTube xpTotal={user.xpTotal} className="mt-2" />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {groupRank && (
            <span className="ivory label px-2 py-0.5 text-[10px] text-ivory-ink">
              {fmt(t.groupRank, { rank: groupRank.rank, total: groupRank.total })}
            </span>
          )}
          <span className="ivory label px-2 py-0.5 text-[10px] text-ivory-ink">{fmt(t.achievements, { count: achievements })}</span>
          <span className="ivory label px-2 py-0.5 text-[10px] text-ivory-ink">{fmt(t.session, { count: sessions })}</span>
        </div>
      </div>
    </Frame>
  );
}

// ==========================================
// COMPTEUR DE VALEUR
// ==========================================

interface ValueCounterProps {
  portfolio: PortfolioSummary;
  currency: string;
  /** Variation de la séance (null : aucune position cotée) */
  session: SessionChange | null;
  /** Change à chaque séance : les tambours roulent */
  rollKey: string;
  compact?: boolean;
  className?: string;
}

export function ValueCounter({ portfolio, currency, session, rollKey, compact = false, className }: ValueCounterProps) {
  const { m, f } = useI18n();
  const t = m.game.summary;
  const day = session ?? { change: 0, percent: 0 };
  const up = day.change >= 0;
  const sinceStart = `${portfolio.profitLoss >= 0 ? '+' : ''}${f.currency(portfolio.profitLoss, currency)}`;

  const lines = [
    { label: t.sinceStart, value: sinceStart },
    { label: t.cash, value: f.currency(portfolio.availableCash, currency) },
    ...(portfolio.shortPositionsPnl !== 0 || portfolio.shortLiability > 0
      ? [{ label: t.shorts, value: f.currency(portfolio.shortPositionsPnl, currency) }]
      : []),
  ];

  // La séance d'abord : c'est ce que le joueur regarde après la cloche
  const chips = (
    <>
      <span className={cn('label whitespace-nowrap text-brass-bright', compact ? 'text-[11px]' : 'text-[10px]')}>{t.session}</span>
      <span className={cn('ivory num whitespace-nowrap font-semibold', compact ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs', up ? 'text-enamel-green' : 'text-enamel-red')}>
        {up ? '▲ +' : '▼ '}
        {f.currency(day.change, currency)}
      </span>
      <span className={cn('ivory num whitespace-nowrap font-semibold', compact ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs', up ? 'text-enamel-green' : 'text-enamel-red')}>
        {f.percent(day.percent, 2)}
      </span>
    </>
  );

  // Bandeau de tête (bureau) : compteur à gauche, rendement et détail à droite
  if (!compact) {
    return (
      <Frame variant="mirror" outerClassName={className} className="flex h-full flex-col justify-center gap-1.5 px-4 py-2">
        <p className="truncate font-display text-[10px] uppercase tracking-[0.16em] text-brass-bright">{t.netValue}</p>
        <div className="flex items-center gap-3">
          <div className="glass min-w-0 overflow-hidden px-2.5 py-1">
            <Odometer text={f.currency(portfolio.totalValue, currency)} rollKey={rollKey} className="text-lg 2xl:text-2xl" />
          </div>
          <div className="ml-auto flex shrink-0 flex-col items-end gap-1">{chips}</div>
        </div>
        <dl className="flex flex-wrap gap-x-3 whitespace-nowrap text-[10px]">
          {lines.map((line) => (
            <div key={line.label} className="flex gap-1">
              <dt className="text-paper-dim">{line.label}</dt>
              <dd className="num text-paper">{line.value}</dd>
            </div>
          ))}
        </dl>
      </Frame>
    );
  }

  return (
    <Frame
      variant="mirror"
      outerClassName={className}
      className="flex flex-col items-center justify-center gap-2 px-3 py-4 text-center"
    >
      <p className="font-display text-xs uppercase tracking-[0.22em] text-brass-bright">{t.netValue}</p>
      <div className="glass max-w-full overflow-hidden px-3 py-2.5">
        <Odometer text={f.currency(portfolio.totalValue, currency)} rollKey={rollKey} className="text-2xl" />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">{chips}</div>
      <p className="num text-xs text-paper-dim">
        {t.sinceStart} <span className="text-paper">{sinceStart}</span>
      </p>
    </Frame>
  );
}

// ==========================================
// SUCCÈS LE PLUS PROCHE
// ==========================================

interface NearestData {
  nearest: {
    name: string;
    description: string;
    points: number;
    current: number;
    target: number;
    ratio: number;
    unit: 'count' | 'percent' | 'days' | 'value';
  } | null;
  recent: Array<{ name: string; description: string; points: number }>;
}

/**
 * @param refreshKey - Change après chaque ordre ou séance : relecture, sans retarder l'action
 */
export function NextAchievement({ gameId, currency, refreshKey }: { gameId: string; currency: string; refreshKey: string }) {
  const { m, f, fmt } = useI18n();
  const t = m.game.machine;
  const [data, setData] = useState<NearestData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/games/${gameId}/next-achievement`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => !cancelled && json && setData(json.data))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [gameId, refreshKey]);

  if (!data || (!data.nearest && data.recent.length === 0)) return null;

  const show = (value: number, unit: NonNullable<NearestData['nearest']>['unit']) =>
    unit === 'percent'
      ? f.percent(value, 1)
      : unit === 'value'
        ? f.currency(value, currency === 'EUR' ? 'EUR' : currency)
        : unit === 'days'
          ? `${Math.round(value)} j`
          : f.number(value, 0);

  return (
    <Frame className="flex items-center gap-4 p-4">
      <svg width="58" height="58" viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
        <circle cx="32" cy="32" r="29" fill="#C9A45C" />
        <circle cx="32" cy="32" r="29" fill="none" stroke="#F4D891" strokeWidth={1.5} />
        <circle cx="32" cy="32" r="23" fill="#3B2C5E" stroke="#1A1230" strokeWidth={1} />
        <path d="M32 18l4 8.2 9 1.3-6.5 6.3 1.5 9-8-4.2-8 4.2 1.5-9L19 27.5l9-1.3z" fill="#E9DCC0" />
      </svg>
      {data.nearest ? (
        <div className="min-w-0 flex-1">
          <p className="label text-[10px] text-paper-dim">
            {t.nearest} · {fmt(t.points, { points: data.nearest.points })}
          </p>
          <p className="truncate font-display text-lg font-semibold text-paper">{data.nearest.name}</p>
          <div className="mt-1 flex justify-between gap-3 text-xs text-paper-dim">
            <span className="truncate">{data.nearest.description}</span>
            <span className="num shrink-0 text-paper">
              {show(data.nearest.current, data.nearest.unit)} / {show(data.nearest.target, data.nearest.unit)}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#120C16] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]">
            <div
              className="h-full rounded-full bg-gradient-to-b from-[#A78CE0] to-[#4C3790] transition-[width] duration-700"
              style={{ width: `${Math.round(data.nearest.ratio * 100)}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="min-w-0 flex-1">
          <p className="label text-[10px] text-paper-dim">{t.recent}</p>
          <ul className="mt-1 space-y-0.5">
            {data.recent.map((achievement) => (
              <li key={achievement.name} className="truncate font-display text-paper">
                {achievement.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Frame>
  );
}

// ==========================================
// RÉPARTITION
// ==========================================

export function AllocationBar({ holdings, portfolio }: { holdings: HoldingWithValue[]; portfolio: PortfolioSummary }) {
  const { m, f } = useI18n();
  const types = m.game.machine;

  const byType = new Map<string, number>();
  for (const holding of holdings) {
    if (holding.isShort) continue;
    const key = holding.assetType ?? 'OTHER';
    byType.set(key, (byType.get(key) ?? 0) + holding.currentValue);
  }
  const cash = Math.max(portfolio.availableCash, 0);
  const total = [...byType.values()].reduce((sum, value) => sum + value, 0) + cash;
  if (total <= 0) return null;

  const parts = [
    ...[...byType].sort((a, b) => b[1] - a[1]).map(([code, value]) => ({ code, value })),
    { code: 'CASH', value: cash },
  ].filter((part) => part.value > 0);

  return (
    <div>
      <p className="label mb-1.5 text-[10px] text-paper-dim">{types.allocation}</p>
      <div className="flex h-3 overflow-hidden rounded-sm border border-wood-edge shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
        {parts.map((part) => (
          <span
            key={part.code}
            title={`${part.code === 'CASH' ? types.cashShare : (types.categories[part.code] ?? part.code)} · ${f.percent((part.value / total) * 100, 0, false)}`}
            style={{ width: `${(part.value / total) * 100}%`, background: categoryColor(part.code) }}
          />
        ))}
      </div>
      <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-paper-dim">
        {parts.map((part) => (
          <li key={part.code} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: categoryColor(part.code) }} />
            {part.code === 'CASH' ? types.cashShare : (types.categories[part.code] ?? part.code)}{' '}
            <span className="num">{f.percent((part.value / total) * 100, 0, false)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
