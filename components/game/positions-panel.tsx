/**
 * FINANCEQUEST - COMPONENT: PositionsPanel
 * Le portefeuille de titres : positions acheteuses puis à découvert,
 * vente ou rachat via le ticket d'ordre
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TradeTicket, type TradeSelection } from '@/components/game/trade-ticket';
import { useI18n } from '@/lib/i18n/client';
import { getScenario } from '@/lib/game/scenarios';
import { cn } from '@/lib/utils/cn';
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
}: {
  /** Colonne étroite : sans le cours d'origine */
  compact?: boolean;
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

  return (
    <li className={cn('grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-3', compact ? 'px-2' : 'px-5')}>
      <div className="min-w-0">
        <p className="flex items-baseline gap-2">
          <span className="num font-semibold text-paper">{holding.symbol}</span>
          <span className="truncate text-xs text-paper-dim">{holding.name}</span>
        </p>
        <p className="num text-xs text-paper-dim">
          {f.quantity(quantity)} × {f.currency(parseFloat(holding.averageCost), currency)}
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
          {holding.isShort ? f.currency(holding.currentPrice * quantity, currency) : f.currency(holding.currentValue, currency)}
        </p>
        <p className={cn('num text-xs', up ? 'text-gain' : 'text-loss')}>
          {up ? '▲ +' : '▼ '}
          {f.currency(holding.profitLoss, currency)} ({f.percent(holding.profitLossPercentage, 1)})
        </p>
      </div>

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
}: PositionsPanelProps) {
  const allowed = getScenario(scenario).rules.actions;
  const { m, fmt } = useI18n();
  const t = m.game.positions;
  const [selected, setSelected] = useState<HoldingWithValue | null>(null);

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
                    key={holding.id}
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
                    key={holding.id}
                    holding={holding}
                    currency={currency}
                    actionLabel={t.cover}
                    lockedLabel={allowed.includes('cover') ? undefined : t.locked}
                    onAction={() => pick(holding)}
                    compact={framed}
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
