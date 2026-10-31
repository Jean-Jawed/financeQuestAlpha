/**
 * FINANCEQUEST - API ROUTE: NEXT ACHIEVEMENT
 * GET /api/games/[id]/next-achievement : le succès le plus proche d'être débloqué
 * (progression mesurable), sinon les derniers succès obtenus
 * Lu par l'écran de jeu après chaque ordre ou séance, sans retarder l'action
 */

import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { withAuth, requireOwnership } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { achievements, games, userAchievements } from '@/lib/db/schema';
import { loadNearestAchievement } from '@/lib/game/achievements';
import { getApiI18n } from '@/lib/i18n/server';

export const GET = withAuth(async (_req, { userId }, context: { params: Promise<{ id: string }> }) => {
  const { api, server } = await getApiI18n();

  try {
    const { id: gameId } = await context.params;
    const game = await db.query.games.findFirst({ where: eq(games.id, gameId) });
    if (!game) return NextResponse.json({ error: api.gameNotFound }, { status: 404 });
    await requireOwnership(userId, game.userId);

    const label = (name: string) => server.achievements[name] ?? { name, description: '' };

    const nearest = await loadNearestAchievement(gameId);
    if (nearest) {
      return NextResponse.json({
        success: true,
        data: {
          nearest: {
            ...label(nearest.achievement.name),
            points: nearest.achievement.points,
            ...nearest.progress,
          },
          recent: [],
        },
      });
    }

    // Plus rien de mesurable : les derniers succès de la partie
    const recent = await db
      .select({ name: achievements.name, points: achievements.points })
      .from(userAchievements)
      .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
      .where(eq(userAchievements.gameId, gameId))
      .orderBy(desc(userAchievements.unlockedAt))
      .limit(3);

    return NextResponse.json({
      success: true,
      data: { nearest: null, recent: recent.map((row) => ({ ...label(row.name), points: row.points })) },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Forbidden: You do not own this resource') {
      return NextResponse.json({ error: api.forbidden }, { status: 403 });
    }
    console.error('[API] Next achievement:', error);
    return NextResponse.json({ error: api.internal }, { status: 500 });
  }
});
