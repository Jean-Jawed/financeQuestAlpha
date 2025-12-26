/**
 * FINANCEQUEST - COMPONENT: GameCard
 * Card affichant les détails d'une partie
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, PerformanceBadge, GameStatusBadge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatting';
import type { GameWithStats } from '@/types/game';

// ==========================================
// TYPES
// ==========================================

interface GameCardProps {
  game: GameWithStats;
}

// ==========================================
// COMPONENT
// ==========================================

export function GameCard({ game }: GameCardProps) {
  const isPositive = game.returnPercentage > 0;

  return (
    <Card variant="glass" hover>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">
              Partie du {new Date(game.startDate).toLocaleDateString('fr-FR')}
            </CardTitle>
            <p className="text-sm text-slate-400 mt-1">
              {game.startDate} → {game.currentDate}
            </p>
          </div>
          <GameStatusBadge status={game.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Valeur totale */}
        <div>
          <p className="text-sm text-slate-400 mb-1">Valeur totale</p>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(game.totalValue)}
          </p>
        </div>

        {/* Performance */}
        <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
          <span className="text-sm text-slate-400">Performance</span>
          <PerformanceBadge value={game.returnPercentage} />
        </div>

        {/* Stats secondaires */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-400">Score</p>
            <p className="font-semibold text-white">{game.score} pts</p>
          </div>
          <div>
            <p className="text-slate-400">Achievements</p>
            <p className="font-semibold text-white">{game.achievementsUnlocked}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/game/${game.id}`} className="w-full">
          <Button variant="primary" className="w-full">
            Continuer
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
