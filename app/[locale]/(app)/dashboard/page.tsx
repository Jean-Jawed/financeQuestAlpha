/**
 * FINANCEQUEST - PAGE: Dashboard
 * /[locale]/dashboard
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionState } from '@/lib/auth/session';
import { WelcomeCard } from '@/components/dashboard/welcome-card';
import { CreateGameCard } from '@/components/dashboard/create-game-card';
import { GameCard } from '@/components/dashboard/game-card';
import { db } from '@/lib/db';
import { games as gamesTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { calculatePortfolio } from '@/lib/game/calculations';
import { getUnlockedAchievements } from '@/lib/game/achievements';
import { getRemainingDays } from '@/lib/game/next-day';
import { getPriceCoverage } from '@/lib/market/calendar';
import { ProfileMissing } from '@/components/dashboard/profile-missing';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo';
import type { GameWithStats } from '@/types/game';

// ==========================================
// CONFIG - Force dynamic rendering
// ==========================================

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { site } = getI18n(locale);
  return pageMetadata({ locale, path: '/dashboard', title: site.seo.dashboardTitle, noindex: true });
}

// ==========================================
// PAGE
// ==========================================

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { ui, fmt, href } = getI18n(await resolveLocale(params));

  // Auth déjà vérifiée par le proxy
  const session = await getSessionState();

  if (session.status === 'anonymous') {
    redirect(href('/login'));
  }

  // Compte Supabase Auth sans profil : afficher un message au lieu de
  // rediriger vers /login (qui renverrait ici : boucle de redirection)
  if (session.status === 'no-profile') {
    return <ProfileMissing />;
  }

  const user = session.user;

  // Plage de dates jouable (base prix) : bornes du sélecteur de date
  const coverage = await getPriceCoverage();
  const lastStartDate = new Date(Date.parse(`${coverage.end}T00:00:00Z`) - 86_400_000)
    .toISOString()
    .slice(0, 10);

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
        const [portfolio, achievements] = await Promise.all([
          calculatePortfolio(game.id, game.currentDate),
          getUnlockedAchievements(game.id),
        ]);
        const remainingDays = getRemainingDays(game.currentDate, coverage.end);

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

  // Limite de 5 parties actives (voir validateGameCreation)
  const MAX_ACTIVE_GAMES = 5;
  const activeGames = games.filter((g) => g.status === 'active').length;
  const bestReturn = games.length > 0 ? Math.max(...games.map((g) => g.returnPercentage)) : null;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="space-y-12">
        <WelcomeCard
          name={user.name}
          gamesPlayed={gamesPlayed}
          achievementsUnlocked={achievementsTotal}
          bestReturn={bestReturn}
        />

        <section aria-labelledby="games-title">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-line pb-3">
            <h2 id="games-title" className="font-display text-3xl font-semibold text-paper">
              {ui.dashboard.myGames}
            </h2>
            <p className="label">{fmt(ui.dashboard.activeGames, { active: activeGames, max: MAX_ACTIVE_GAMES })}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
            {activeGames < MAX_ACTIVE_GAMES && (
              <CreateGameCard minDate={coverage.start} maxDate={lastStartDate} isFirst={gamesPlayed === 0} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
