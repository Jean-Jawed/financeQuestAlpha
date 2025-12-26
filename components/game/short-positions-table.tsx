/**
 * FINANCEQUEST - COMPONENT: ShortPositionsTable
 * Table des positions short avec bouton couvrir
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatQuantity } from '@/lib/utils/formatting';
import { getAsset } from '@/lib/market/assets';
import type { HoldingWithValue } from '@/types/game';

// ==========================================
// TYPES
// ==========================================

interface ShortPositionsTableProps {
  holdings: HoldingWithValue[];
  gameId: string;
  onTradeComplete: () => void;
}

// ==========================================
// COMPONENT
// ==========================================

export function ShortPositionsTable({
  holdings,
  gameId,
  onTradeComplete,
}: ShortPositionsTableProps) {
  const { toast } = useToast();
  const [selectedShort, setSelectedShort] = useState<HoldingWithValue | null>(null);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  // Filtrer positions short uniquement
  const shortHoldings = holdings.filter((h) => h.isShort);

  async function handleCover() {
    if (!selectedShort || !quantity) return;

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0 || qty > parseFloat(selectedShort.quantity)) {
      toast.error('Quantité invalide');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/trades/cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, symbol: selectedShort.symbol, quantity: qty }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la couverture');
        setLoading(false);
        return;
      }

      toast.success(data.message || 'Position couverte');
      setSelectedShort(null);
      setQuantity('');
      onTradeComplete();
    } catch (error) {
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  if (shortHoldings.length === 0) {
    return null; // Ne rien afficher si pas de positions short
  }

  return (
    <>
      <Card variant="glass" className="border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-yellow-400">
            Positions Short ({shortHoldings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {shortHoldings.map((short) => {
              const asset = getAsset(short.symbol);
              const pnl = short.profitLoss; // Pour short, profitLoss = P&L
              const isProfit = pnl > 0;

              return (
                <div
                  key={short.id}
                  className="flex items-center justify-between p-3 bg-yellow-900/10 rounded-lg border border-yellow-500/30 hover:border-yellow-500/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{short.symbol}</span>
                      <span className="text-xs text-slate-500">{asset?.name}</span>
                    </div>
                    <div className="text-sm text-slate-400">
                      {formatQuantity(parseFloat(short.quantity))} × {formatCurrency(parseFloat(short.averageCost))} (emprunt)
                    </div>
                  </div>

                  <div className="text-right mr-4">
                    <div className="font-semibold text-white">
                      Prix actuel: {formatCurrency(short.currentPrice)}
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        isProfit ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      P&L: {isProfit ? '+' : ''}
                      {formatCurrency(pnl)}
                    </div>
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setSelectedShort(short);
                      setQuantity(short.quantity);
                    }}
                  >
                    Couvrir
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Warning */}
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-400">
              ⚠️ Les positions short ont un risque de perte illimité. Surveillez vos positions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal Cover */}
      {selectedShort && (
        <Modal
          isOpen={true}
          onClose={() => !loading && setSelectedShort(null)}
          title={`Couvrir position short ${selectedShort.symbol}`}
        >
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Quantité short</p>
                  <p className="font-semibold text-white">{formatQuantity(parseFloat(selectedShort.quantity))}</p>
                </div>
                <div>
                  <p className="text-slate-400">Prix emprunt</p>
                  <p className="font-semibold text-white">{formatCurrency(parseFloat(selectedShort.averageCost))}</p>
                </div>
                <div>
                  <p className="text-slate-400">Prix actuel</p>
                  <p className="font-semibold text-white">{formatCurrency(selectedShort.currentPrice)}</p>
                </div>
                <div>
                  <p className="text-slate-400">P&L estimé</p>
                  <p className={`font-semibold ${selectedShort.profitLoss > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedShort.profitLoss > 0 ? '+' : ''}{formatCurrency(selectedShort.profitLoss)}
                  </p>
                </div>
              </div>
            </div>

            <Input
              type="number"
              label="Quantité à couvrir"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              min="0"
              max={selectedShort.quantity}
              step="0.00000001"
              disabled={loading}
            />

            {quantity && parseFloat(quantity) > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-slate-300">
                  Coût rachat : <span className="font-semibold text-red-400">
                    ~{formatCurrency(parseFloat(quantity) * selectedShort.currentPrice)}
                  </span>
                </p>
              </div>
            )}
          </div>

          <ModalFooter>
            <Button variant="ghost" onClick={() => setSelectedShort(null)} disabled={loading}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleCover} loading={loading}>
              Couvrir la position
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
