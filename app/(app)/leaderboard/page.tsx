/**
 * FINANCEQUEST - PAGE: Leaderboard
 * /leaderboard
 */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { useToast } from '@/hooks/use-toast';
import type { LeaderboardEntry } from '@/types/api';

// ==========================================
// TYPES
// ==========================================

type Period = 'all_time' | 'monthly' | 'weekly';

// ==========================================
// PAGE
// ==========================================

export default function LeaderboardPage() {
  const { toast } = useToast();

  const [period, setPeriod] = useState<Period>('all_time');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLeaderboard(selectedPeriod: Period) {
    setLoading(true);

    try {
      const res = await fetch(`/api/leaderboard?period=${selectedPeriod}&limit=50`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors du chargement');
        setLoading(false);
        return;
      }

      setEntries(data.data.entries);
    } catch (error) {
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏆 Classement</h1>
          <p className="text-slate-400">Les meilleurs traders de FinanceQuest</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-3 mb-8">
          <Button
            variant={period === 'all_time' ? 'primary' : 'ghost'}
            onClick={() => setPeriod('all_time')}
          >
            Tout le temps
          </Button>
          <Button
            variant={period === 'monthly' ? 'primary' : 'ghost'}
            onClick={() => setPeriod('monthly')}
          >
            Ce mois
          </Button>
          <Button
            variant={period === 'weekly' ? 'primary' : 'ghost'}
            onClick={() => setPeriod('weekly')}
          >
            Cette semaine
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Leaderboard */}
        {!loading && <LeaderboardTable entries={entries} />}
      </div>
    </div>
  );
}
