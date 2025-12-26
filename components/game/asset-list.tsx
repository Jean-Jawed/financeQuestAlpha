/**
 * FINANCEQUEST - COMPONENT: AssetList
 * Liste des assets avec modal de trading
 */

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { ALL_ASSETS, type Asset, type AssetType } from '@/lib/market/assets';
import { formatCurrency } from '@/lib/utils/formatting';

// ==========================================
// TYPES
// ==========================================

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

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<AssetType | 'all'>('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [tradeAction, setTradeAction] = useState<'buy' | 'short'>('buy');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Filtrer assets
  const filteredAssets = useMemo(() => {
    let filtered = ALL_ASSETS;

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter((a) => a.type === selectedType);
    }

    // Filtre par recherche
    if (debouncedSearch) {
      const lower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.symbol.toLowerCase().includes(lower) || a.name.toLowerCase().includes(lower)
      );
    }

    return filtered;
  }, [selectedType, debouncedSearch]);

  // Fetch price when asset selected
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
      }
    } catch (error) {
      toast.error('Erreur lors de la récupération du prix');
    }
  }

  async function handleTrade() {
    if (!selectedAsset || !quantity || !price) return;

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Quantité invalide');
      return;
    }

    setLoading(true);

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
        setLoading(false);
        return;
      }

      toast.success(data.message || 'Transaction réussie');
      setSelectedAsset(null);
      setQuantity('');
      onTradeComplete();
    } catch (error) {
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Assets Disponibles ({filteredAssets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="space-y-3 mb-4">
            <Input
              placeholder="Rechercher un asset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex gap-2 flex-wrap">
              {(['all', 'stock', 'bond', 'index'] as const).map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                >
                  {type === 'all' ? 'Tous' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Asset List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredAssets.map((asset) => (
              <div
                key={asset.symbol}
                className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 transition-colors cursor-pointer"
                onClick={() => handleSelectAsset(asset)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{asset.symbol}</span>
                    <Badge variant="neutral" size="sm">
                      {asset.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">{asset.name}</p>
                </div>

                <Button variant="primary" size="sm">
                  Trader
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trading Modal */}
      {selectedAsset && (
        <Modal
          isOpen={true}
          onClose={() => !loading && setSelectedAsset(null)}
          title={`${selectedAsset.symbol} - ${selectedAsset.name}`}
          size="lg"
        >
          <div className="space-y-4">
            {/* Prix */}
            {price !== null && (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-1">Prix actuel</p>
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
              disabled={loading || price === null}
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
            <Button variant="ghost" onClick={() => setSelectedAsset(null)} disabled={loading}>
              Annuler
            </Button>
            <Button
              variant={tradeAction === 'buy' ? 'primary' : 'danger'}
              onClick={handleTrade}
              loading={loading}
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