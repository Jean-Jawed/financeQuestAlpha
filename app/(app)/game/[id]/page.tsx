/**
 * FINANCEQUEST - PAGE: Game
 * /game/[id]
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { PortfolioSummary } from '@/components/game/portfolio-summary';
import { HoldingsTable } from '@/components/game/holdings-table';
import { ShortPositionsTable } from '@/components/game/short-positions-table';
import { AssetList } from '@/components/game/asset-list';
import { NextDayButton } from '@/components/game/next-day-button';
import { TransactionHistory } from '@/components/game/transaction-history';
import { useToast } from '@/hooks/use-toast';
import type { GameWithStats, PortfolioSummary as PortfolioType, HoldingWithValue } from '@/types/game';
import type { Transaction } from '@/types/database';

// ==========================================
// PAGE
// ==========================================

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const gameId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<GameWithStats | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioType | null>(null);
  const [holdings, setHoldings] = useState<HoldingWithValue[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch game data
  async function fetchGameData() {
    try {
      const res = await fetch(`/api/games/${gameId}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors du chargement');
        router.push('/dashboard');
        return;
      }

      setGame(data.data.game);
      setPortfolio(data.data.portfolio);
      setHoldings(data.data.holdings);
      setTransactions(data.data.recentTransactions);
    } catch (error) {
      toast.error('Erreur réseau');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && gameId) {
      fetchGameData();
    }
  }, [user, authLoading, gameId]);

  if (loading || authLoading) {
    return <LoadingPage />;
  }

  if (!game || !portfolio) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Partie du {new Date(game.startDate).toLocaleDateString('fr-FR')}
              </h1>
              <p className="text-slate-400">
                {game.startDate} → {game.currentDate}
              </p>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Portfolio */}
          <div className="space-y-6">
            <NextDayButton
              gameId={game.id}
              currentDate={game.currentDate}
              startDate={game.startDate}
              onDayAdvanced={fetchGameData}
            />

            <PortfolioSummary portfolio={portfolio} />

            <HoldingsTable
              holdings={holdings}
              gameId={game.id}
              onTradeComplete={fetchGameData}
            />

            <ShortPositionsTable
              holdings={holdings}
              gameId={game.id}
              onTradeComplete={fetchGameData}
            />
          </div>

          {/* Center Column - Assets */}
          <div className="lg:col-span-2 space-y-6">
            <AssetList
              gameId={game.id}
              currentDate={game.currentDate}
              allowShorting={game.settings.allow_shorting}
              onTradeComplete={fetchGameData}
            />

            <TransactionHistory transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  );
}
