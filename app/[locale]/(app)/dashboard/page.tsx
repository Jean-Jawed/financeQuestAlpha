/**
 * PASTFOLIO - PAGE: Dashboard
 * /[locale]/dashboard
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionState } from '@/lib/auth/session';
import { WelcomeCard } from '@/components/dashboard/welcome-card';
import { Plate } from '@/components/machine/frame';
import { CreateGameCard } from '@/components/dashboard/create-game-card';
import { CreateGroupCard } from '@/components/groups/create-group-card';
import { JoinGroupCard } from '@/components/groups/join-group-card';
import { groupsByGame } from '@/lib/game/group-server';
import { GameCard } from '@/components/dashboard/game-card';
import { db } from '@/lib/db';
import { games as gamesTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { calculatePortfolio } from '@/lib/game/calculations';
import { getUnlockedAchievements } from '@/lib/game/achievements';
import { getRemainingDays } from '@/lib/game/next-day';
import { getPriceCoverage } from '@/lib/market/calendar';
import { ProfileMissing } from '@/components/dashboard/profile-missing';
import { ProfileReminder } from '@/components/dashboard/profile-reminder';
import { InstallCard } from '@/components/pwa/install';
import { loadProfile } from '@/lib/profile/server';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo';
import { latestStartDate } from '@/lib/game/scenarios';
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
  // Préférences du profil : devise de jeu présélectionnée à la création
  const profile = await loadProfile(user.id);
  const preferredCurrency = profile?.preferredCurrency ?? undefined;

  // Plage de dates jouable (base prix) : bornes du sélecteur de date, avec assez
  // de séances devant soi pour pouvoir prendre sa retraite
  const coverage = await getPriceCoverage();
  const lastStartDate = latestStartDate(coverage.end);

  // Fetch games directement depuis la DB (pas d'API)
  let games: GameWithStats[] = [];
  let groupOf: Awaited<ReturnType<typeof groupsByGame>> = new Map();
  let gamesPlayed = 0;
  let achievementsTotal = 0;

  try {
    const userGames = await db.query.games.findMany({
      where: eq(gamesTable.userId, user.id),
      orderBy: (gamesTable, { desc }) => [desc(gamesTable.updatedAt)],
    });

    groupOf = await groupsByGame(user.id);

    games = await Promise.all(
      userGames.map(async (game) => {
        // Partie terminée : valeur et rendement finaux enregistrés, pas de valorisation
        const ended = game.status === 'completed';
        const [portfolio, achievements] = await Promise.all([
          ended ? null : calculatePortfolio(game.id, game.currentDate),
          getUnlockedAchievements(game.id),
        ]);
        const remainingDays = getRemainingDays(game.currentDate, coverage.end);

        return {
          ...game,
          portfolioValue: portfolio?.portfolioValueLong || 0,
          shortPositionsPnl: portfolio?.shortPositionsPnl || 0,
          totalValue: ended
            ? parseFloat(game.finalValue ?? game.currentBalance)
            : portfolio?.totalValue || parseFloat(game.currentBalance),
          returnPercentage: ended ? parseFloat(game.finalReturn ?? '0') : portfolio?.returnPercentage || 0,
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
  const endedGames = games.filter((g) => g.status === 'completed');
  const bestReturn = games.length > 0 ? Math.max(...games.map((g) => g.returnPercentage)) : null;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="space-y-14">
        <WelcomeCard
          name={user.name}
          avatarId={user.avatarId}
          xpTotal={user.xpTotal}
          motto={profile?.motto ?? null}
          gamesPlayed={gamesPlayed}
          achievementsUnlocked={achievementsTotal}
          bestReturn={bestReturn}
        />

        {!user.onboardingDone && <ProfileReminder name={user.name} avatarId={user.avatarId} />}

        <InstallCard />

        <section aria-labelledby="games-title">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <Plate as="h2" className="font-display text-base normal-case tracking-normal">
              <span id="games-title">{ui.dashboard.myGames}</span>
            </Plate>
            <p className="label">{fmt(ui.dashboard.activeGames, { active: activeGames, max: MAX_ACTIVE_GAMES })}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {games
              .filter((game) => game.status !== 'completed')
              .map((game) => (
                <GameCard key={game.id} game={game} group={groupOf.get(game.id)} />
              ))}
            {activeGames < MAX_ACTIVE_GAMES && (
              <CreateGameCard
                minDate={coverage.start}
                maxDate={lastStartDate}
                isFirst={gamesPlayed === 0}
                defaultCurrency={preferredCurrency}
              />
            )}
          </div>
        </section>

        {/* Parties de groupe : organiser, ou rejoindre avec un code */}
        <section aria-labelledby="groups-title">
          <div className="mb-7">
            <Plate as="h2" className="font-display text-base normal-case tracking-normal">
              <span id="groups-title">{ui.groups.sectionTitle}</span>
            </Plate>
            <p className="mt-3 text-paper-dim">{ui.groups.sectionIntro}</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {activeGames < MAX_ACTIVE_GAMES && <CreateGroupCard minDate={coverage.start} maxDate={lastStartDate} defaultCurrency={preferredCurrency} />}
            <JoinGroupCard />
          </div>
        </section>

        {endedGames.length > 0 && (
          <section aria-labelledby="archive-title">
            <div className="mb-7">
              <Plate as="h2" className="font-display text-base normal-case tracking-normal">
                <span id="archive-title">{ui.dashboard.archive}</span>
              </Plate>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {endedGames.map((game) => (
                <GameCard key={game.id} game={game} group={groupOf.get(game.id)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
