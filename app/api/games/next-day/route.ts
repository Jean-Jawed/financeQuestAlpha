/**
 * FINANCEQUEST - API ROUTE: NEXT DAY
 * POST /api/games/next-day
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { requireOwnership } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { advanceToNextDay } from '@/lib/game/next-day';
import { z } from 'zod';
import { getApiI18n } from '@/lib/i18n/server';

// ==========================================
// VALIDATION SCHEMA
// ==========================================

const nextDaySchema = z.object({
  gameId: z.string().uuid('ID de game invalide'),
});

// ==========================================
// API HANDLER
// ==========================================

export const POST = withAuth(async (req, { userId }) => {
  const { api, fmt, f } = await getApiI18n();

  try {
    // 1. Parser et valider le body
    const body = await req.json();
    const validation = nextDaySchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => err.message);
      return NextResponse.json(
        { error: api.validationFailed, details: errors },
        { status: 400 }
      );
    }

    const { gameId } = validation.data;

    // 2. Vérifier ownership
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return NextResponse.json({ error: api.gameNotFound }, { status: 404 });
    }

    await requireOwnership(userId, game.userId);

    // 3. Avancer d'un jour
    const result = await advanceToNextDay(game);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // 4. Retourner le résultat
    return NextResponse.json({
      success: true,
      data: {
        newDate: result.newDate,
        state: result.state,
        achievementsUnlocked: result.achievementsUnlocked || [],
      },
      message: fmt(api.advanced, { date: f.date(result.newDate!) }),
    });
  } catch (error) {
    console.error('[API] Next day error:', error);

    if (error instanceof Error && error.message === 'Forbidden: You do not own this resource') {
      return NextResponse.json({ error: api.forbidden }, { status: 403 });
    }

    return NextResponse.json({ error: api.internal }, { status: 500 });
  }
});
