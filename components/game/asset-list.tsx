/**
 * FINANCEQUEST - COMPONENT: AssetList
 * Liste des assets avec modal de trading - Version Database
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { formatCurrency } from '@/lib/utils/formatting';

// ==========================================
// TYPES
// ==========================================

interface Asset {
  symbol: string;
  name: string;
  type: string;
  category?: string;
  market?: string;
  currency?: string;
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
  allowShorting: boolean;
  onTradeComplete: () => void;
}

// ==========================================
// COMPONENT
// ==========================================

export function AssetList({ gameId, currentDate, allowShorting, onTradeComplete }: AssetListProps) {
  const { toast } = useToast();

  // Data State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  // Filter Options State
  const [assetTypes, setAssetTypes] = useState<FilterOption[]>([]);
  const [markets, setMarkets] = useState<FilterOption[]>([]);

  // Selection State
  const [search, setSearch] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('all');
  const [selectedMarketId, setSelectedMarketId] = useState<string>('all');

  // Trading State
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [tradeAction, setTradeAction] = useState<'buy' | 'short'>('buy');
  const [quantity, setQuantity] = useState('');
  const [loadingTrade, setLoadingTrade] = useState(false);
  const [price, setPrice] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // 1. Fetch Filters on Mount
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch('/api/market/filters');
        if (res.ok) {
          const { data } = await res.json();
          setAssetTypes(data.types);
          setMarkets(data.markets);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    }
    fetchFilters();
  }, []);

  // 2. Fetch Assets when filters change
  useEffect(() => {
    async function fetchAssets() {
      setLoadingAssets(true);
      try {
        const params = new URLSearchParams();
        if (selectedTypeId !== 'all') params.append('type', selectedTypeId);
        if (selectedMarketId !== 'all') params.append('market', selectedMarketId);
        if (debouncedSearch) params.append('search', debouncedSearch);
        params.append('limit', '50'); // Limit for performance

        const res = await fetch(`/api/market/assets?${params.toString()}`);
        if (res.ok) {
          const { data } = await res.json();
          setAssets(data.assets);
        }
      } catch (error) {
        toast.error('Erreur chargement assets');
      } finally {
        setLoadingAssets(false);
      }
    }

    fetchAssets();
  }, [selectedTypeId, selectedMarketId, debouncedSearch]);

  // 3. Fetch Price when asset selected
  async function handleSelectAsset(asset: Asset) {
    setSelectedAsset(asset);
    setQuantity('');
    setPrice(null);

    try {
      const res = await fetch(
        `/api/market/price?symbol=${asset.symbol}&date=${currentDate}`
      );
      const data = await res.json();

      if (res.ok && data.data) {
        setPrice(data.data.price);
      } else {
        setPrice(null); // Price unavailable
      }
    } catch (error) {
      toast.error('Erreur lors de la récupération du prix');
    }
  }

  // 4. Handle Trade
  async function handleTrade() {
    if (!selectedAsset || !quantity || !price) return;

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Quantité invalide');
      return;
    }

    setLoadingTrade(true);

    const endpoint = tradeAction === 'buy' ? '/api/trades/buy' : '/api/trades/short';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, symbol: selectedAsset.symbol, quantity: qty }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la transaction');
        setLoadingTrade(false);
        return;
      }

      toast.success(data.message || 'Transaction réussie');
      setSelectedAsset(null);
      setQuantity('');
      onTradeComplete();
    } catch (error) {
      toast.error('Erreur réseau');
    } finally {
      setLoadingTrade(false);
    }
  }

  return (
    <>
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Assets Disponibles ({assets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex gap-2">
              <Input
                placeholder="Rechercher (ex: AAPL)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {/* Type Filter */}
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
              >
                <option value="all">Tous les types</option>
                {assetTypes.map((t) => (
                  <option key={t.id} value={t.id.toString()}>
                    {t.label}
                  </option>
                ))}
              </select>

              {/* Market Filter */}
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={selectedMarketId}
                onChange={(e) => setSelectedMarketId(e.target.value)}
              >
                <option value="all">Toutes les places</option>
                {markets.map((m) => (
                  <option key={m.id} value={m.id.toString()}>
                    {m.code} - {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Asset List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {loadingAssets ? (
              <div className="text-center py-8 text-slate-400">Chargement...</div>
            ) : assets.length === 0 ? (
              <div className="text-center py-8 text-slate-400">Aucun actif trouvé</div>
            ) : (
              assets.map((asset) => (
                <div
                  key={asset.symbol}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 transition-colors cursor-pointer"
                  onClick={() => handleSelectAsset(asset)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{asset.symbol}</span>
                      <Badge variant="neutral" size="sm">
                        {asset.type.toUpperCase()}
                      </Badge>
                      {asset.market && (
                        <span className="text-xs text-slate-500 border border-slate-700 px-1 rounded">
                          {asset.market}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">{asset.name}</p>
                  </div>

                  <Button variant="primary" size="sm">
                    Trader
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trading Modal (Identical to before) */}
      {selectedAsset && (
        <Modal
          isOpen={true}
          onClose={() => !loadingTrade && setSelectedAsset(null)}
          title={`${selectedAsset.symbol} - ${selectedAsset.name}`}
          size="lg"
        >
          <div className="space-y-4">
            {/* Prix */}
            {price === null ? (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 animate-pulse">
                <div className="h-4 w-20 bg-slate-700 rounded mb-2"></div>
                <div className="h-8 w-32 bg-slate-700 rounded"></div>
              </div>
            ) : (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-1">Prix actuel ({selectedAsset.currency || 'USD'})</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(price)}</p>
              </div>
            )}

            {/* Action tabs */}
            <div className="flex gap-2">
              <Button
                variant={tradeAction === 'buy' ? 'primary' : 'ghost'}
                onClick={() => setTradeAction('buy')}
                className="flex-1"
              >
                Acheter
              </Button>
              {allowShorting && (
                <Button
                  variant={tradeAction === 'short' ? 'danger' : 'ghost'}
                  onClick={() => setTradeAction('short')}
                  className="flex-1"
                >
                  Shorter
                </Button>
              )}
            </div>

            {/* Quantity input */}
            <Input
              type="number"
              label="Quantité"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              min="0"
              step="0.00000001"
              disabled={loadingTrade || price === null}
            />

            {/* Preview */}
            {quantity && parseFloat(quantity) > 0 && price !== null && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                <p className="text-sm text-slate-300">
                  Montant total : <span className="font-semibold text-cyan-400">
                    ~{formatCurrency(parseFloat(quantity) * price)}
                  </span>
                </p>
              </div>
            )}

            {tradeAction === 'short' && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-xs text-yellow-400">
                  ⚠️ La vente à découvert comporte un risque de perte illimité.
                </p>
              </div>
            )}
          </div>

          <ModalFooter>
            <Button variant="ghost" onClick={() => setSelectedAsset(null)} disabled={loadingTrade}>
              Annuler
            </Button>
            <Button
              variant={tradeAction === 'buy' ? 'primary' : 'danger'}
              onClick={handleTrade}
              loading={loadingTrade}
              disabled={!quantity || !price}
            >
              {tradeAction === 'buy' ? 'Acheter' : 'Shorter'}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}