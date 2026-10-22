/**
 * FINANCEQUEST - API ROUTE: GET GAME
 * GET /api/games/[id]
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { requireOwnership } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { loadGameState } from '@/lib/game/state';
import { getApiI18n } from '@/lib/i18n/server';

// ==========================================
// API HANDLER
// ==========================================

export const GET = withAuth(async (req, { userId }, context) => {
  const { api, fmt, f } = await getApiI18n();

  try {
    // CORRECTION: await params avant de l'utiliser
    const { id: gameId } = await context.params;

    // 1. Récupérer le game
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return NextResponse.json({ error: api.gameNotFound }, { status: 404 });
    }

    // 2. Vérifier ownership
    await requireOwnership(userId, game.userId);

    // 3. Portfolio, positions, transactions, succès et plage de données
    const state = await loadGameState(game);

    if (!state) {
      return NextResponse.json(
        { error: api.portfolioFailed },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    console.error('[API] Get game error:', error);

    if (error instanceof Error && error.message === 'Forbidden: You do not own this resource') {
      return NextResponse.json({ error: api.forbidden }, { status: 403 });
    }

    return NextResponse.json({ error: api.internal }, { status: 500 });
  }
});