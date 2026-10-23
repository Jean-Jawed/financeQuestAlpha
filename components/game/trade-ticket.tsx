/**
 * FINANCEQUEST - COMPONENT: TradeTicket
 * Ticket d'ordre unique pour acheter, vendre, vendre à découvert, racheter
 * Cours du jour (d'origine et converti), courbe, frais, tampon à l'exécution
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PriceChart } from '@/components/game/price-chart';
import { showMedals } from '@/components/game/achievement-medal';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';
import { playSound } from '@/lib/sound';
import { TRADE_ACTIONS, type TradeAction } from '@/lib/game/scenarios';
import { cn } from '@/lib/utils/cn';
import { TimeoutError, fetchWithTimeout } from '@/lib/utils/fetch-timeout';
import type { GameState } from '@/types/game';

// ==========================================
// TYPES
// ==========================================

export type { TradeAction };

export interface TicketAsset {
  symbol: string;
  name: string;
}

interface TradeTicketProps {
  gameId: string;
  currentDate: string;
  /** Devise de la partie */
  currency: string;
  /** Frais de transaction en % (game.settings.transaction_fees) */
  feeRate: number;
  asset: TicketAsset;
  /** 'open' : achat ou vente à découvert ; 'sell' / 'cover' : fermer une position */
  mode: 'open' | 'sell' | 'cover';
  allowShorting?: boolean;
  /** Ordres autorisés par le scénario de la partie */
  allowedActions?: readonly TradeAction[];
  /** Quantité détenue (sell / cover) */
  heldQuantity?: number;
  /** Coût moyen dans la devise de la partie (sell / cover) */
  averageCost?: number;
  /** Liquidités disponibles, pour le bouton « Max » à l'achat */
  availableCash?: number;
  onClose: () => void;
  /** Appelé avec l'état de la partie renvoyé par l'ordre */
  onDone: (state?: GameState) => void;
}

interface QuoteState {
  price: number;
  assetPrice: number;
  assetCurrency: string;
}

/** Libellés dans le dictionnaire (ui.game.ticket) ; couleur du tampon par sens */
const ACTIONS: Record<TradeAction, { verb: 'buy' | 'sell' | 'short' | 'cover'; stamp: 'stampBuy' | 'stampSell' | 'stampShort' | 'stampCover'; tone: string }> = {
  buy: { verb: 'buy', stamp: 'stampBuy', tone: 'text-gain border-gain' },
  sell: { verb: 'sell', stamp: 'stampSell', tone: 'text-brass-bright border-brass-bright' },
  short: { verb: 'short', stamp: 'stampShort', tone: 'text-loss border-loss' },
  cover: { verb: 'cover', stamp: 'stampCover', tone: 'text-brass-bright border-brass-bright' },
};

const STAMP_MS = 750;

// ==========================================
// COMPONENT
// ==========================================

export function TradeTicket({
  gameId,
  currentDate,
  currency,
  feeRate,
  asset,
  mode,
  allowShorting = false,
  allowedActions = TRADE_ACTIONS,
  heldQuantity,
  averageCost,
  availableCash,
  onClose,
  onDone,
}: TradeTicketProps) {
  const { toast } = useToast();
  const { m, f, fmt } = useI18n();
  const t = m.game.ticket;
  // Sens proposés à l'ouverture : achat et vente à découvert, selon le scénario
  const openActions = (['buy', 'short'] as const).filter(
    (value) => allowedActions.includes(value) && (value === 'buy' || allowShorting)
  );
  const [action, setAction] = useState<TradeAction>(mode === 'open' ? (openActions[0] ?? 'buy') : mode);
  const [quantity, setQuantity] = useState(heldQuantity ? String(heldQuantity) : '');
  const [quote, setQuote] = useState<QuoteState | null>(null);
  const [quoteError, setQuoteError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stamped, setStamped] = useState<TradeAction | null>(null);
  // Identifiant de l'ordre : un renvoi après une réponse perdue n'est pas réexécuté
  const orderId = useRef<string | null>(null);

  // Le ticket se détache du carnet
  useEffect(() => playSound('ticket', 0.8), []);

  // Cours du jour, converti dans la devise de la partie
  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ symbol: asset.symbol, date: currentDate, currency });

    fetch(`/api/market/price?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json) => {
        if (cancelled) return;
        setQuote({
          price: json.data.price,
          assetPrice: json.data.assetPrice,
          assetCurrency: json.data.assetCurrency,
        });
      })
      .catch(() => !cancelled && setQuoteError(true));

    return () => {
      cancelled = true;
    };
  }, [asset.symbol, currentDate, currency]);

  const qty = parseFloat(quantity);
  const validQty = Number.isFinite(qty) && qty > 0;
  const subtotal = quote && validQty ? qty * quote.price : 0;
  const fee = subtotal * (feeRate / 100);
  const debits = action === 'buy' || action === 'cover';
  const total = debits ? subtotal + fee : subtotal - fee;
  const overHeld = heldQuantity !== undefined && validQty && qty > heldQuantity + 1e-9;

  // Plus-value réalisée estimée (sell / cover)
  const realized =
    averageCost !== undefined && quote && validQty
      ? action === 'sell'
        ? (quote.price - averageCost) * qty
        : action === 'cover'
          ? (averageCost - quote.price) * qty
          : null
      : null;

  function fillMax() {
    if (heldQuantity !== undefined) {
      setQuantity(String(heldQuantity));
    } else if (quote && availableCash && availableCash > 0) {
      // Quantité entière maximale, frais compris
      const max = Math.floor(availableCash / (quote.price * (1 + feeRate / 100)));
      setQuantity(String(Math.max(max, 0)));
    }
  }

  /** Envoyer l'ordre ; en cas de délai dépassé, renvoyer le même ordre une fois */
  async function send(attempt: number): Promise<Response> {
    try {
      return await fetchWithTimeout(`/api/trades/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, symbol: asset.symbol, quantity: qty, orderId: orderId.current }),
      });
    } catch (error) {
      if (error instanceof TimeoutError && attempt === 1) {
        toast.info(t.retrying);
        return send(2);
      }
      throw error;
    }
  }

  async function submit() {
    if (!validQty || !quote || overHeld) return;
    setLoading(true);
    orderId.current ??= crypto.randomUUID();

    try {
      const res = await send(1);
      const data = await res.json();

      if (!res.ok) {
        playSound('refusal');
        toast.error(data.error || t.refused);
        // Ordre refusé : jamais enregistré, le prochain essai aura son propre identifiant
        orderId.current = null;
        setLoading(false);
        return;
      }

      // Le tampon s'abat, puis le ticket se referme ; une position fermée
      // fait aussi sonner la caisse
      setStamped(action);
      playSound('stamp');
      if (action === 'sell' || action === 'cover') {
        window.setTimeout(() => playSound('till', 0.8), 260);
      }
      showMedals(data.data?.achievementsUnlocked);
      setTimeout(() => {
        onDone(data.data?.state);
        onClose();
      }, STAMP_MS);
    } catch (error) {
      if (error instanceof TimeoutError) {
        // Toujours pas de réponse : la page relit la partie, le joueur voit si l'ordre est passé
        toast.error(t.noAnswer);
        onDone();
        onClose();
        return;
      }
      toast.error(m.common.networkError);
      setLoading(false);
    }
  }

  const verb = t[ACTIONS[action].verb];
  const showConversion = quote && quote.assetCurrency !== currency;

  return (
    <Modal isOpen onClose={() => !loading && onClose()} title={`${asset.symbol} · ${asset.name}`} size="lg">
      <div className="relative space-y-5">
        {/* Choix du sens (ouverture seulement) */}
        {mode === 'open' && openActions.length > 1 && (
          <div className="grid grid-cols-2 gap-1 rounded border border-line bg-ink p-1" role="tablist">
            {openActions.map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={action === value}
                onClick={() => setAction(value)}
                className={cn(
                  'h-9 rounded-sm font-label text-sm font-semibold uppercase tracking-label transition-colors disabled:opacity-40',
                  action === value
                    ? value === 'buy'
                      ? 'bg-gain/15 text-gain'
                      : 'bg-loss/15 text-loss'
                    : 'text-paper-dim hover:text-paper'
                )}
              >
                {t[ACTIONS[value].verb]}
              </button>
            ))}
          </div>
        )}

        {/* Cours */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label">{t.close}</p>
            {quote ? (
              <p className="num mt-1 text-3xl font-semibold text-paper">{f.currency(quote.price, currency)}</p>
            ) : quoteError ? (
              <p className="mt-1 text-loss">{t.unavailable}</p>
            ) : (
              <p className="mt-2 h-8 w-40 animate-pulse rounded bg-ink-3" />
            )}
            {showConversion && (
              <p className="num mt-1 text-sm text-paper-dim">
                {fmt(t.converted, { price: f.currency(quote.assetPrice, quote.assetCurrency) })}
              </p>
            )}
          </div>
          {heldQuantity !== undefined && (
            <div className="text-right">
              <p className="label">{mode === 'cover' ? t.heldShort : t.held}</p>
              <p className="num mt-1 text-paper">
                {f.quantity(heldQuantity)} × {averageCost !== undefined ? f.currency(averageCost, currency) : '—'}
              </p>
            </div>
          )}
        </div>

        <PriceChart
          symbol={asset.symbol}
          currentDate={currentDate}
          currency={quote?.assetCurrency ?? currency}
          // Prix de revient ramené en devise de cotation (la courbe n'est pas convertie)
          costPrice={averageCost !== undefined && quote && quote.price > 0 ? (averageCost * quote.assetPrice) / quote.price : undefined}
        />

        {/* Quantité */}
        <div className="flex items-end gap-2">
          <Input
            id="ticket-quantity"
            type="number"
            label={t.quantity}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            min="0"
            step="any"
            disabled={loading || !quote}
            error={overHeld ? fmt(t.overHeld, { quantity: f.quantity(heldQuantity ?? 0) }) : undefined}
          />
          <Button variant="secondary" onClick={fillMax} disabled={loading || !quote} className="mb-px h-11">
            {t.max}
          </Button>
        </div>

        {/* Bordereau */}
        <dl className="perforated space-y-2 rounded-b border border-t-0 border-line bg-ink px-4 pb-4 pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-paper-dim">{t.amount}</dt>
            <dd className="num text-paper">{f.currency(subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-paper-dim">{fmt(t.fees, { rate: f.percent(feeRate, 2, false) })}</dt>
            <dd className="num text-paper">{f.currency(fee, currency)}</dd>
          </div>
          {realized !== null && (
            <div className="flex justify-between">
              <dt className="text-paper-dim">{t.realized}</dt>
              <dd className={cn('num', realized >= 0 ? 'text-gain' : 'text-loss')}>
                {realized >= 0 ? '▲ +' : '▼ '}
                {f.currency(realized, currency)}
              </dd>
            </div>
          )}
          <div className="flex justify-between border-t border-line pt-2 font-semibold">
            <dt className="text-paper">{debits ? t.debited : t.credited}</dt>
            <dd className="num text-brass">{f.currency(total, currency)}</dd>
          </div>
          {action === 'short' && (
            <p className="pt-1 text-xs text-paper-dim">{t.shortNote}</p>
          )}
        </dl>

        {/* Tampon d'exécution */}
        {stamped && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className={cn('stamp animate-stamp bg-ink/80 text-4xl', ACTIONS[stamped].tone)}>
              {t[ACTIONS[stamped].stamp]}
            </span>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {m.common.cancel}
        </Button>
        <Button
          variant={action === 'short' ? 'danger' : 'primary'}
          onClick={submit}
          loading={loading}
          disabled={!validQty || !quote || overHeld}
        >
          {loading ? t.sending : verb}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
