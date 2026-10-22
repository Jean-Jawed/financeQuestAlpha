/**
 * FINANCEQUEST - API ROUTE: END GAME
 * POST /api/games/end
 * Prendre sa retraite (à partir de MIN_SESSIONS_TO_RETIRE séances) ou abandonner :
 * positions soldées au cours de clôture, partie terminée, bilan renvoyé
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { withAuth, requireOwnership } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { endGame } from '@/lib/game/end';
import { MIN_SESSIONS_TO_RETIRE } from '@/lib/game/scenarios';
import { loadGameState } from '@/lib/game/state';
import { getApiI18n } from '@/lib/i18n/server';

// ==========================================
// VALIDATION SCHEMA
// ==========================================

const endSchema = z.object({
  gameId: z.string().uuid(),
  reason: z.enum(['retired', 'abandoned']),
});

// ==========================================
// API HANDLER
// ==========================================

export const POST = withAuth(async (req, { userId }) => {
  const { api, fmt } = await getApiI18n();

  try {
    const validation = endSchema.safeParse(await req.json());
    if (!validation.success) {
      return NextResponse.json({ error: api.validationFailed }, { status: 400 });
    }

    const { gameId, reason } = validation.data;

    const game = await db.query.games.findFirst({ where: eq(games.id, gameId) });
    if (!game) {
      return NextResponse.json({ error: api.gameNotFound }, { status: 404 });
    }

    await requireOwnership(userId, game.userId);

    if (game.status !== 'active') {
      return NextResponse.json({ error: api.gameEnded }, { status: 400 });
    }

    // La retraite se mérite : sinon un coup de chance d'un jour suffirait
    if (reason === 'retired' && game.sessionsPlayed < MIN_SESSIONS_TO_RETIRE) {
      return NextResponse.json(
        {
          error: fmt(api.retireTooEarly, {
            min: MIN_SESSIONS_TO_RETIRE,
            remaining: MIN_SESSIONS_TO_RETIRE - game.sessionsPlayed,
          }),
        },
        { status: 400 }
      );
    }

    const ended = await endGame(gameId, reason);
    if (!ended) {
      return NextResponse.json({ error: api.gameEnded }, { status: 409 });
    }

    const state = await loadGameState(ended);

    return NextResponse.json({ success: true, data: { state } });
  } catch (error) {
    console.error('[API] End game error:', error);

    if (error instanceof Error && error.message === 'Forbidden: You do not own this resource') {
      return NextResponse.json({ error: api.forbidden }, { status: 403 });
    }

    return NextResponse.json({ error: api.internal }, { status: 500 });
  }
});
