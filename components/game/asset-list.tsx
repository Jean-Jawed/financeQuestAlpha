/**
 * FINANCEQUEST - COMPONENT: AssetList
 * La cote : valeurs négociables avec cours du jour et variation, filtres,
 * ouverture du ticket d'ordre
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { TradeTicket, type TicketAsset } from '@/components/game/trade-ticket';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { useI18n } from '@/lib/i18n/client';
import { cn } from '@/lib/utils/cn';
import type { GameState } from '@/types/game';

// ==========================================
// TYPES
// ==========================================

interface Asset {
  symbol: string;
  name: string;
  type: string;
  market?: string;
  currency?: string;
  /** Cours dans la devise de la partie (null : pas de cours ce jour) */
  price: number | null;
  changePercent: number | null;
}

interface FilterOption {
  id: number;
  code: string;
  name?: string;
  label?: string;
}

interface AssetListProps {
  gameId: string;
  currentDate: string;
  /** Devise de la partie : cours convertis au taux du jour */
  currency: string;
  allowShorting: boolean;
  /** Frais de transaction en % */
  feeRate: number;
  availableCash: number;
  /** Appelé avec l'état de la partie renvoyé par l'ordre */
  onTradeComplete: (state?: GameState) => void;
}

const SELECT_CLASS =
  'h-10 rounded border border-line-strong bg-ink px-3 text-sm text-paper focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass';

// ==========================================
// COMPONENT
// ==========================================

export function AssetList({
  gameId,
  currentDate,
  currency,
  allowShorting,
  feeRate,
  availableCash,
  onTradeComplete,
}: AssetListProps) {
  const { toast } = useToast();
  const { m, f, plural } = useI18n();
  const t = m.game.assets;

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [assetTypes, setAssetTypes] = useState<FilterOption[]>([]);
  const [markets, setMarkets] = useState<FilterOption[]>([]);

  const [search, setSearch] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('all');
  const [selectedMarketId, setSelectedMarketId] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<TicketAsset | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // 1. Filtres
  useEffect(() => {
    fetch('/api/market/filters')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json) return;
        setAssetTypes(json.data.types);
        setMarkets(json.data.markets);
      })
      .catch((error) => console.error('Error fetching filters:', error));
  }, []);

  // 2. Valeurs + cours du jour (relu à chaque séance)
  useEffect(() => {
    let cancelled = false;
    setLoadingAssets(true);

    const params = new URLSearchParams({ limit: '60', date: currentDate, currency });
    if (selectedTypeId !== 'all') params.append('type', selectedTypeId);
    if (selectedMarketId !== 'all') params.append('market', selectedMarketId);
    if (debouncedSearch) params.append('search', debouncedSearch);

    fetch(`/api/market/assets?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json) => !cancelled && setAssets(json.data.assets))
      .catch(() => !cancelled && toast.error(t.loadFailed))
      .finally(() => !cancelled && setLoadingAssets(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTypeId, selectedMarketId, debouncedSearch, currentDate, currency]);

  return (
    <section className="panel" aria-labelledby="cote-title">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <p className="label text-brass">{t.label}</p>
          <h2 id="cote-title" className="font-display text-2xl font-semibold text-paper">
            {t.title}
          </h2>
        </div>
        <p className="label">{loadingAssets ? t.reading : plural(assets.length, t.countOne, t.count)}</p>
      </header>

      {/* Filtres */}
      <div className="flex flex-col gap-2 border-b border-line px-5 py-3 sm:flex-row">
        <input
          type="search"
          placeholder={t.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={t.searchLabel}
          className={cn(SELECT_CLASS, 'flex-1 placeholder:text-paper-faint')}
        />
        <select
          className={SELECT_CLASS}
          value={selectedTypeId}
          onChange={(e) => setSelectedTypeId(e.target.value)}
          aria-label={t.typeLabel}
        >
          <option value="all">{t.allTypes}</option>
          {assetTypes.map((t) => (
            <option key={t.id} value={t.id.toString()}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          className={SELECT_CLASS}
          value={selectedMarketId}
          onChange={(e) => setSelectedMarketId(e.target.value)}
          aria-label={t.marketLabel}
        >
          <option value="all">{t.allMarkets}</option>
          {markets.map((m) => (
            <option key={m.id} value={m.id.toString()}>
              {m.code} · {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Liste */}
      <div className="max-h-[560px] overflow-y-auto">
        {loadingAssets && assets.length === 0 ? (
          <ul className="divide-y divide-line" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i} className="flex items-center justify-between px-5 py-3">
                <span className="h-4 w-40 animate-pulse rounded-sm bg-ink-3" />
                <span className="h-4 w-24 animate-pulse rounded-sm bg-ink-3" />
              </li>
            ))}
          </ul>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <Image src="/gravures/loupe.webp" alt="" width={140} height={140} className="engraving opacity-70" />
            <p className="mt-4 font-display text-xl text-paper">{t.noMatch}</p>
            <p className="mt-1 text-sm text-paper-dim">{t.noMatchHint}</p>
          </div>
        ) : (
          <ul className={cn('divide-y divide-line transition-opacity', loadingAssets && 'opacity-60')}>
            {assets.map((asset) => {
              const change = asset.changePercent;
              return (
                <li key={asset.symbol}>
                  <button
                    type="button"
                    onClick={() => setSelectedAsset({ symbol: asset.symbol, name: asset.name })}
                    disabled={asset.price === null}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-ink-3 disabled:cursor-not-allowed disabled:opacity-50 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="num font-semibold text-paper">{asset.symbol}</span>
                        <span className="rounded-sm border border-line px-1 font-label text-[10px] uppercase tracking-[0.1em] text-paper-dim">
                          {asset.market || asset.type}
                        </span>
                      </span>
                      <span className="block truncate text-sm text-paper-dim">{asset.name}</span>
                    </span>

                    <span className="text-right">
                      <span className="num block text-paper">
                        {asset.price === null ? '—' : f.currency(asset.price, currency)}
                      </span>
                      <span
                        className={cn(
                          'num block text-xs',
                          change === null || change === 0 ? 'text-paper-faint' : change > 0 ? 'text-gain' : 'text-loss'
                        )}
                      >
                        {change === null
                          ? '—'
                          : `${change > 0 ? '▲ ' : change < 0 ? '▼ ' : '■ '}${f.percent(change, 2)}`}
                      </span>
                    </span>

                    <span className="hidden font-label text-xs font-semibold uppercase tracking-label text-brass sm:block">
                      {t.order}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedAsset && (
        <TradeTicket
          gameId={gameId}
          currentDate={currentDate}
          currency={currency}
          feeRate={feeRate}
          asset={selectedAsset}
          mode="open"
          allowShorting={allowShorting}
          availableCash={availableCash}
          onClose={() => setSelectedAsset(null)}
          onDone={onTradeComplete}
        />
      )}
    </section>
  );
}
