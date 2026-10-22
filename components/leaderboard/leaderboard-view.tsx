/**
 * FINANCEQUEST - COMPONENT: LeaderboardView
 * Tableau d'honneur : choix du scénario et de la période, podium et registre
 */

'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';
import { DEFAULT_SCENARIO, SCENARIOS, isScenarioId, type ScenarioId } from '@/lib/game/scenarios';
import { cn } from '@/lib/utils/cn';
import type { LeaderboardEntry } from '@/types/api';

// ==========================================
// TYPES
// ==========================================

type Period = 'all_time' | 'monthly' | 'weekly';

// ==========================================
// PAGE
// ==========================================

export function LeaderboardView() {
  const { toast } = useToast();
  const { m } = useI18n();
  const t = m.leaderboard;

  const [period, setPeriod] = useState<Period>('all_time');
  const [scenario, setScenario] = useState<ScenarioId>(DEFAULT_SCENARIO);

  // Scénario demandé par le lien du bilan (?scenario=crypto)
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('scenario');
    if (isScenarioId(requested)) setScenario(requested);
  }, []);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLeaderboard(selectedPeriod: Period, selectedScenario: ScenarioId) {
    setLoading(true);

    try {
      const res = await fetch(`/api/leaderboard?scenario=${selectedScenario}&period=${selectedPeriod}&limit=50`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || m.common.loadError);
        setLoading(false);
        return;
      }

      setEntries(data.data.entries);
    } catch (error) {
      toast.error(m.common.networkError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaderboard(period, scenario);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, scenario]);

  const periods: Array<{ value: Period; label: string }> = [
    { value: 'all_time', label: t.allTime },
    { value: 'monthly', label: t.monthly },
    { value: 'weekly', label: t.weekly },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-5">
        <div>
          <p className="label text-brass">{t.label}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-paper md:text-5xl">{t.title}</h1>
          <p className="mt-2 text-paper-dim">{t.intro}</p>
        </div>

        <div className="flex gap-1 rounded border border-line bg-ink-2 p-1" role="tablist" aria-label={t.period}>
          {periods.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={period === item.value}
              onClick={() => setPeriod(item.value)}
              className={
                period === item.value
                  ? 'h-9 rounded-sm bg-brass px-4 font-label text-sm font-semibold uppercase tracking-label text-ink'
                  : 'h-9 rounded-sm px-4 font-label text-sm font-semibold uppercase tracking-label text-paper-dim hover:text-paper'
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Scénarios */}
      <nav aria-label={t.scenario} className="-mx-4 mb-10 flex gap-2 overflow-x-auto px-4 pb-1">
        {SCENARIOS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={scenario === item.id}
            onClick={() => setScenario(item.id)}
            className={cn(
              'shrink-0 rounded border px-4 py-2 font-display text-base transition-colors',
              scenario === item.id ? 'border-brass bg-brass/10 text-brass' : 'border-line text-paper-dim hover:text-paper'
            )}
          >
            {m.scenarios[item.id].name}
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <LeaderboardTable entries={entries} />
      )}
    </div>
  );
}
