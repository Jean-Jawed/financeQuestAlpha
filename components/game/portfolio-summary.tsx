/**
 * FINANCEQUEST - COMPONENT: PortfolioSummary
 * Affiche le résumé financier du portfolio
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceBadge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/formatting';
import type { PortfolioSummary as PortfolioSummaryType } from '@/types/game';

// ==========================================
// TYPES
// ==========================================

interface PortfolioSummaryProps {
  portfolio: PortfolioSummaryType;
}

// ==========================================
// COMPONENT
// ==========================================

export function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  const isProfit = portfolio.profitLoss > 0;

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-xl">Finances</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Valeur totale */}
        <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/10 rounded-lg p-4 border border-cyan-500/20">
          <p className="text-sm text-slate-400 mb-1">Valeur totale</p>
          <p className="text-3xl font-bold text-white mb-2">
            {formatCurrency(portfolio.totalValue)}
          </p>
          <div className="flex items-center gap-2">
            <PerformanceBadge value={portfolio.returnPercentage} />
            <span
              className={`text-sm font-medium ${
                isProfit ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isProfit ? '+' : ''}
              {formatCurrency(portfolio.profitLoss)}
            </span>
          </div>
        </div>

        {/* Détails */}
        <div className="space-y-3">
          {/* Liquidités */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Liquidités</span>
            <span className="font-semibold text-white">
              {formatCurrency(portfolio.currentBalance)}
            </span>
          </div>

          {/* Valeur actifs */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Valeur actifs (long)</span>
            <span className="font-semibold text-white">
              {formatCurrency(portfolio.portfolioValueLong)}
            </span>
          </div>

          {/* P&L positions short */}
          {portfolio.shortPositionsPnl !== 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">P&L positions short</span>
              <span
                className={`font-semibold ${
                  portfolio.shortPositionsPnl > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {portfolio.shortPositionsPnl > 0 ? '+' : ''}
                {formatCurrency(portfolio.shortPositionsPnl)}
              </span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-700/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Capital initial</span>
              <span className="text-sm text-slate-500">
                {formatCurrency(portfolio.initialBalance)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
