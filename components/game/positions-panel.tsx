/**
 * PASTFOLIO - COMPONENT: PositionsPanel
 * Le portefeuille de titres : positions acheteuses puis à découvert,
 * vente ou rachat via le ticket d'ordre
 */

'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { TradeTicket, type TradeSelection } from '@/components/game/trade-ticket';
import { useI18n } from '@/lib/i18n/client';
import { getScenario } from '@/lib/game/scenarios';
import { cn } from '@/lib/utils/cn';
import { marginCallPrice, type MarginBook } from '@/lib/game/margin-call';
import type { HoldingWithValue } from '@/types/game';
import type { GameState } from '@/types/game';

// ==========================================
// TYPES
// ==========================================

interface PositionsPanelProps {
  holdings: HoldingWithValue[];
  gameId: string;
  currentDate: string;
  /** Devise de la partie */
  currency: string;
  feeRate: number;
  /** Scénario de la partie : la vente ou le rachat peuvent être interdits */
  scenario: string;
  /** Appelé avec l'état de la partie renvoyé par l'ordre */
  onTradeComplete: (state?: GameState) => void;
  /** Écran de jeu : la position choisie s'affiche au centre (sinon : ticket en fenêtre) */
  onSelect?: (selection: TradeSelection) => void;
  /** Posé sur le bois d'un cadre (écran de jeu) : sans fond ni bordure propres */
  framed?: boolean;
  /** Valeur nette et dette des shorts : cours d'appel de marge de chaque découvert */
  marginBook?: MarginBook;
}

// ==========================================
// SOUS-COMPOSANT
// ==========================================

function PositionRow({
  holding,
  currency,
  actionLabel,
  lockedLabel,
  onAction,
  compact = false,
  flash = false,
  marginBook,
}: {
  marginBook?: MarginBook;
  /** Colonne étroite : sans le cours d'origine */
  compact?: boolean;
  /** Nouvelle séance : la ligne s'allume selon son mouvement du jour */
  flash?: boolean;
  holding: HoldingWithValue;
  currency: string;
  actionLabel: string;
  /** Fermeture interdite par le scénario : le motif remplace le bouton */
  lockedLabel?: string;
  onAction: () => void;
}) {
  const { m, f, fmt } = useI18n();
  const quantity = parseFloat(holding.quantity);
  const up = holding.profitLoss >= 0;
  const day = holding.openedToday ? null : (holding.dayChange ?? null);
  const dayUp = (day ?? 0) >= 0;
  const dayPercent = holding.sessionPercent ?? null;
  // Découvert : cours d'appel de marge, ramené au cours de cotation
  const callPrice =
    holding.isShort && marginBook && holding.currentPrice > 0
      ? marginCallPrice(marginBook, quantity, holding.currentPrice)
      : null;
  const callQuoted = callPrice !== null && holding.assetPrice > 0 ? (callPrice * holding.assetPrice) / holding.currentPrice : callPrice;
  const callCurrency = holding.assetPrice > 0 ? holding.assetCurrency : currency;

  return (
    <li
      className={cn(
        'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-3',
        compact ? 'px-2' : 'px-5',
        flash && day !== null && day !== 0 && (dayUp ? 'motion-safe:animate-flash-gain' : 'motion-safe:animate-flash-loss')
      )}
    >
      <div className="min-w-0">
        <p className="flex items-baseline gap-2">
          <span className="num font-semibold text-paper">{holding.symbol}</span>
          <span className="truncate text-xs text-paper-dim">{holding.name}</span>
        </p>
        <p className="num text-xs text-paper-dim">
          {f.quantity(quantity)} × {f.currency(parseFloat(holding.averageCost), currency)}
          {holding.isShort && (
            <span className="text-paper-faint">
              {' · '}
              {fmt(m.game.positions.proceeds, { amount: f.currency(quantity * parseFloat(holding.averageCost), currency) })}
            </span>
          )}
          {!compact && holding.assetCurrency !== currency && holding.assetPrice > 0 && (
            <span className="text-paper-faint">
              {' · '}
              {fmt(m.game.positions.quoted, { price: f.currency(holding.assetPrice, holding.assetCurrency) })}
            </span>
          )}
        </p>
      </div>

      <div className="text-right">
        <p className="num text-paper">
          {holding.isShort && <span className="mr-1 font-sans text-[10px] text-paper-faint">{m.game.positions.buyback}</span>}
          {holding.isShort ? f.currency(holding.currentPrice * quantity, currency) : f.currency(holding.currentValue, currency)}
        </p>
        {/* La séance d'abord, en pastille ; la plus-value depuis l'achat en dessous, discrète */}
        {holding.openedToday ? (
          <span className="label mt-0.5 inline-block rounded-sm border border-brass/50 px-1.5 py-px text-[10px] text-brass">{m.game.positions.newToday}</span>
        ) : day !== null && dayPercent !== null ? (
          <span
            className={cn(
              'ivory num mt-0.5 inline-block whitespace-nowrap px-1.5 py-px text-xs font-semibold',
              dayUp ? 'text-enamel-green' : 'text-enamel-red'
            )}
            title={m.game.summary.session}
          >
            {dayUp ? '▲ +' : '▼ '}
            {f.currency(day, currency)} · {f.percent(dayPercent, 1)}
          </span>
        ) : null}
        <p className="num mt-0.5 whitespace-nowrap text-[11px] text-paper-dim">
          {m.game.positions.sinceBuy}{' '}
          <span className={up ? 'text-gain' : 'text-loss'}>
            {f.percent(holding.profitLossPercentage, 1)}
            {!compact && <> ({up ? '+' : ''}{f.currency(holding.profitLoss, currency)})</>}
          </span>
        </p>
      </div>

      {callQuoted !== null && (
        <p className={cn('num col-span-2 text-[11px]', callPrice !== null && callPrice <= holding.currentPrice ? 'font-semibold text-loss' : 'text-paper-dim')}>
          {callPrice !== null && callPrice <= holding.currentPrice
            ? m.game.positions.callReached
            : fmt(m.game.positions.callAbove, { price: f.currency(callQuoted, callCurrency) })}
        </p>
      )}

      {lockedLabel ? (
        <p className="col-span-2 font-label text-xs font-semibold uppercase tracking-label text-paper-faint">
          {lockedLabel}
        </p>
      ) : (
        <button
          type="button"
          onClick={onAction}
          className="col-span-2 justify-self-start font-label text-xs font-semibold uppercase tracking-label text-brass transition-colors hover:text-brass-bright"
        >
          {actionLabel} →
        </button>
      )}
    </li>
  );
}

// ==========================================
// COMPONENT
// ==========================================

export function PositionsPanel({
  holdings,
  gameId,
  currentDate,
  currency,
  feeRate,
  scenario,
  onTradeComplete,
  onSelect,
  framed = false,
  marginBook,
}: PositionsPanelProps) {
  const allowed = getScenario(scenario).rules.actions;
  const { m, fmt } = useI18n();
  const t = m.game.positions;
  const [selected, setSelected] = useState<HoldingWithValue | null>(null);
  // Les lignes ne s'allument qu'après une séance jouée sous les yeux du joueur
  const openedOn = useRef(currentDate);
  const flash = currentDate !== openedOn.current;

  function pick(holding: HoldingWithValue) {
    if (!onSelect) return setSelected(holding);
    onSelect({
      asset: { symbol: holding.symbol, name: holding.name },
      mode: holding.isShort ? 'cover' : 'sell',
      heldQuantity: parseFloat(holding.quantity),
      averageCost: parseFloat(holding.averageCost),
    });
  }

  const longs = holdings.filter((h) => !h.isShort);
  const shorts = holdings.filter((h) => h.isShort);

  return (
    <section className={framed ? undefined : 'panel'} aria-labelledby="positions-title">
      <header className="border-b border-line px-5 py-4">
        <p className="label text-brass">{t.label}</p>
        <h2 id="positions-title" className="font-display text-2xl font-semibold text-paper">
          {t.title}
        </h2>
      </header>

      {holdings.length === 0 ? (
        <div className="flex flex-col items-center px-5 py-10 text-center">
          <Image src="/gravures/taureau.webp" alt="" width={120} height={120} className="engraving opacity-60" />
          <p className="mt-3 text-paper-dim">{t.empty}</p>
          <p className="text-sm text-paper-faint">{t.emptyHint}</p>
        </div>
      ) : (
        <>
          {longs.length > 0 && (
            <div>
              <h3 className="label flex items-center gap-2 bg-ink px-5 py-2">
                <span className="text-gain">▲</span> {fmt(t.longs, { count: longs.length })}
              </h3>
              <ul className="divide-y divide-line">
                {longs.map((holding) => (
                  <PositionRow
                    key={`${holding.id}-${currentDate}`}
                    flash={flash}
                    holding={holding}
                    currency={currency}
                    actionLabel={t.sell}
                    lockedLabel={allowed.includes('sell') ? undefined : t.locked}
                    onAction={() => pick(holding)}
                    compact={framed}
                  />
                ))}
              </ul>
            </div>
          )}

          {shorts.length > 0 && (
            <div>
              <h3 className="label flex items-center gap-2 bg-ink px-5 py-2">
                <span className="text-loss">▼</span> {fmt(t.shorts, { count: shorts.length })}
              </h3>
              <ul className="divide-y divide-line">
                {shorts.map((holding) => (
                  <PositionRow
                    key={`${holding.id}-${currentDate}`}
                    flash={flash}
                    holding={holding}
                    currency={currency}
                    actionLabel={t.cover}
                    lockedLabel={allowed.includes('cover') ? undefined : t.locked}
                    onAction={() => pick(holding)}
                    compact={framed}
                    marginBook={marginBook}
                  />
                ))}
              </ul>
              <p className="border-t border-line px-5 py-3 text-xs text-paper-dim">{t.shortWarning}</p>
            </div>
          )}
        </>
      )}

      {selected && (
        <TradeTicket
          gameId={gameId}
          currentDate={currentDate}
          currency={currency}
          feeRate={feeRate}
          asset={{ symbol: selected.symbol, name: selected.name }}
          mode={selected.isShort ? 'cover' : 'sell'}
          heldQuantity={parseFloat(selected.quantity)}
          averageCost={parseFloat(selected.averageCost)}
          onClose={() => setSelected(null)}
          onDone={onTradeComplete}
        />
      )}
    </section>
  );
}
