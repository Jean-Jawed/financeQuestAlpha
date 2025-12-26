/**
 * FINANCEQUEST - COMPONENT: LeaderboardTable
 * Table du classement avec podium
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatting';
import type { LeaderboardEntry } from '@/types/api';

// ==========================================
// TYPES
// ==========================================

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

// ==========================================
// COMPONENT
// ==========================================

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <Card variant="glass">
        <CardContent className="py-12">
          <p className="text-center text-slate-400">Aucune entrée dans le classement</p>
        </CardContent>
      </Card>
    );
  }

  // Podium (top 3)
  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-6">
      {/* Podium */}
      {podium.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1st place */}
          {podium[0] && (
            <Card
              variant="glass"
              className="bg-gradient-to-br from-yellow-900/30 to-slate-800/50 border-yellow-500/50"
            >
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500 mb-4">
                  <span className="text-3xl">🥇</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{podium[0].userName}</h3>
                <p className="text-3xl font-bold text-yellow-400 mb-2">
                  {formatCurrency(podium[0].totalValue)}
                </p>
                <Badge variant="success">
                  {formatPercentage(podium[0].returnPercentage)}
                </Badge>
                <p className="text-sm text-slate-400 mt-3">{podium[0].score} pts</p>
              </CardContent>
            </Card>
          )}

          {/* 2nd place */}
          {podium[1] && (
            <Card
              variant="glass"
              className="bg-gradient-to-br from-slate-700/30 to-slate-800/50 border-slate-500/50"
            >
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-500/20 border-2 border-slate-400 mb-4">
                  <span className="text-2xl">🥈</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{podium[1].userName}</h3>
                <p className="text-2xl font-bold text-slate-300 mb-2">
                  {formatCurrency(podium[1].totalValue)}
                </p>
                <Badge variant={podium[1].returnPercentage > 0 ? 'success' : 'danger'}>
                  {formatPercentage(podium[1].returnPercentage)}
                </Badge>
                <p className="text-sm text-slate-400 mt-3">{podium[1].score} pts</p>
              </CardContent>
            </Card>
          )}

          {/* 3rd place */}
          {podium[2] && (
            <Card
              variant="glass"
              className="bg-gradient-to-br from-orange-900/30 to-slate-800/50 border-orange-700/50"
            >
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-700/20 border-2 border-orange-600 mb-4">
                  <span className="text-2xl">🥉</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{podium[2].userName}</h3>
                <p className="text-2xl font-bold text-orange-400 mb-2">
                  {formatCurrency(podium[2].totalValue)}
                </p>
                <Badge variant={podium[2].returnPercentage > 0 ? 'success' : 'danger'}>
                  {formatPercentage(podium[2].returnPercentage)}
                </Badge>
                <p className="text-sm text-slate-400 mt-3">{podium[2].score} pts</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Rest of leaderboard */}
      {rest.length > 0 && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Classement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rest.map((entry) => (
                <div
                  key={entry.gameId}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                >
                  {/* Rank */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 text-center">
                      <span className="text-2xl font-bold text-slate-400">#{entry.rank}</span>
                    </div>

                    {/* User */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{entry.userName}</h4>
                      <p className="text-sm text-slate-400">{entry.score} pts</p>
                    </div>

                    {/* Performance */}
                    <div className="text-right">
                      <p className="font-bold text-white">{formatCurrency(entry.totalValue)}</p>
                      <Badge
                        variant={entry.returnPercentage > 0 ? 'success' : 'danger'}
                        size="sm"
                      >
                        {formatPercentage(entry.returnPercentage)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
