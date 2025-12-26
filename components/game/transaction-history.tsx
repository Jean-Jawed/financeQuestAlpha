/**
 * FINANCEQUEST - COMPONENT: TransactionHistory
 * Historique des transactions
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatQuantity } from '@/lib/utils/formatting';
import { formatDateDisplay } from '@/lib/utils/dates';
import type { Transaction } from '@/types/database';

// ==========================================
// TYPES
// ==========================================

interface TransactionHistoryProps {
  transactions: Transaction[];
}

// ==========================================
// COMPONENT
// ==========================================

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Historique des Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-400 py-8">Aucune transaction</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle>Historique des Transactions ({transactions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {transactions.map((transaction) => {
            const typeColors = {
              buy: 'info' as const,
              sell: 'success' as const,
              short: 'warning' as const,
              cover: 'danger' as const,
            };

            const typeLabels = {
              buy: 'Achat',
              sell: 'Vente',
              short: 'Short',
              cover: 'Cover',
            };

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Badge variant={typeColors[transaction.type]} size="sm">
                    {typeLabels[transaction.type]}
                  </Badge>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{transaction.symbol}</span>
                      <span className="text-xs text-slate-500">
                        {formatDateDisplay(transaction.transactionDate)}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400">
                      {formatQuantity(parseFloat(transaction.quantity))} × {formatCurrency(parseFloat(transaction.price))}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {formatCurrency(parseFloat(transaction.total))}
                    </div>
                    {parseFloat(transaction.fee) > 0 && (
                      <div className="text-xs text-slate-500">
                        Frais: {formatCurrency(parseFloat(transaction.fee))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
