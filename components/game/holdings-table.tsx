/**
 * FINANCEQUEST - COMPONENT: HoldingsTable
 * Table des positions long avec bouton vendre
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatQuantity, formatPercentage } from '@/lib/utils/formatting';
import { getAsset } from '@/lib/market/assets';
import type { HoldingWithValue } from '@/types/game';

// ==========================================
// TYPES
// ==========================================

interface HoldingsTableProps {
  holdings: HoldingWithValue[];
  gameId: string;
  onTradeComplete: () => void;
}

// ==========================================
// COMPONENT
// ==========================================

export function HoldingsTable({ holdings, gameId, onTradeComplete }: HoldingsTableProps) {
  const { toast } = useToast();
  const [selectedHolding, setSelectedHolding] = useState<HoldingWithValue | null>(null);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  // Filtrer positions long uniquement
  const longHoldings = holdings.filter((h) => !h.isShort);

  async function handleSell() {
    if (!selectedHolding || !quantity) return;

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0 || qty > parseFloat(selectedHolding.quantity)) {
      toast.error('Quantité invalide');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/trades/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, symbol: selectedHolding.symbol, quantity: qty }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la vente');
        setLoading(false);
        return;
      }

      toast.success(data.message || 'Vente réussie');
      setSelectedHolding(null);
      setQuantity('');
      onTradeComplete();
    } catch (error) {
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  if (longHoldings.length === 0) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Mes Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-400 py-8">Aucune position</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Mes Positions ({longHoldings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {longHoldings.map((holding) => {
              const asset = getAsset(holding.symbol);
              const isProfit = holding.profitLoss > 0;

              return (
                <div
                  key={holding.id}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{holding.symbol}</span>
                      <span className="text-xs text-slate-500">{asset?.name}</span>
                    </div>
                    <div className="text-sm text-slate-400">
                      {formatQuantity(parseFloat(holding.quantity))} × {formatCurrency(parseFloat(holding.averageCost))}
                    </div>
                  </div>

                  <div className="text-right mr-4">
                    <div className="font-semibold text-white">
                      {formatCurrency(holding.currentValue)}
                    </div>
                    <div
                      className={`text-sm ${
                        isProfit ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}
                      {formatCurrency(holding.profitLoss)} ({formatPercentage(holding.profitLossPercentage, 2, true)})
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedHolding(holding);
                      setQuantity(holding.quantity);
                    }}
                  >
                    Vendre
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal Vendre */}
      {selectedHolding && (
        <Modal
          isOpen={true}
          onClose={() => !loading && setSelectedHolding(null)}
          title={`Vendre ${selectedHolding.symbol}`}
        >
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Quantité détenue</p>
                  <p className="font-semibold text-white">{formatQuantity(parseFloat(selectedHolding.quantity))}</p>
                </div>
                <div>
                  <p className="text-slate-400">Prix actuel</p>
                  <p className="font-semibold text-white">{formatCurrency(selectedHolding.currentPrice)}</p>
                </div>
              </div>
            </div>

            <Input
              type="number"
              label="Quantité à vendre"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              min="0"
              max={selectedHolding.quantity}
              step="0.00000001"
              disabled={loading}
            />

            {quantity && parseFloat(quantity) > 0 && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                <p className="text-sm text-slate-300">
                  Montant estimé : <span className="font-semibold text-cyan-400">
                    ~{formatCurrency(parseFloat(quantity) * selectedHolding.currentPrice)}
                  </span>
                </p>
              </div>
            )}
          </div>

          <ModalFooter>
            <Button variant="ghost" onClick={() => setSelectedHolding(null)} disabled={loading}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleSell} loading={loading}>
              Vendre
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
