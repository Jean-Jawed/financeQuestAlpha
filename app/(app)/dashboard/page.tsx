/**
 * FINANCEQUEST - PAGE: Dashboard
 * /dashboard
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { WelcomeCard } from '@/components/dashboard/welcome-card';
import { CreateGameCard } from '@/components/dashboard/create-game-card';
import { GameCard } from '@/components/dashboard/game-card';
import { db } from '@/lib/db';
import { games as gamesTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { calculatePortfolio } from '@/lib/game/calculations';
import { getUnlockedAchievements } from '@/lib/game/achievements';
import { getRemainingDays } from '@/lib/game/next-day';
import type { GameWithStats } from '@/types/game';

// ==========================================
// PAGE
// ==========================================

export default async function DashboardPage() {
  // Vérifier auth
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch games directement depuis la DB (pas d'API)
  let games: GameWithStats[] = [];
  let gamesPlayed = 0;
  let achievementsTotal = 0;

  try {
    const userGames = await db.query.games.findMany({
      where: eq(gamesTable.userId, user.id),
      orderBy: (gamesTable, { desc }) => [desc(gamesTable.updatedAt)],
    });

    games = await Promise.all(
      userGames.map(async (game) => {
        const portfolio = await calculatePortfolio(game.id, game.currentDate);
        const achievements = await getUnlockedAchievements(game.id);
        const remainingDays = getRemainingDays(game.currentDate);

        return {
          ...game,
          portfolioValue: portfolio?.portfolioValueLong || 0,
          shortPositionsPnl: portfolio?.shortPositionsPnl || 0,
          totalValue: portfolio?.totalValue || parseFloat(game.currentBalance),
          returnPercentage: portfolio?.returnPercentage || 0,
          score: portfolio?.score || 0,
          achievementsUnlocked: achievements.length,
          remainingDays,
        } as GameWithStats;
      })
    );

    gamesPlayed = games.length;
    achievementsTotal = games.reduce((sum, g) => sum + g.achievementsUnlocked, 0);
  } catch (error) {
    console.error('[Dashboard] Error loading games:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Card */}
          <WelcomeCard gamesPlayed={gamesPlayed} achievementsUnlocked={achievementsTotal} />

          {/* Create Game Card */}
          <CreateGameCard />

          {/* Active Games */}
          {games.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Mes Parties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {games.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucune partie en cours
              </h3>
              <p className="text-slate-400 mb-6">
                Créez votre première partie pour commencer à trader !
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}