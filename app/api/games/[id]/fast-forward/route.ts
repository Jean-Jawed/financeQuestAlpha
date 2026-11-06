/**
 * PASTFOLIO - API ROUTE: AVANCE RAPIDE
 * GET  /api/games/[id]/fast-forward : séances atteignables (et ce qui les borne)
 * POST /api/games/[id]/fast-forward : avancer jusqu'à une date ({ targetDate })
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth, requireOwnership } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fastForward, fastForwardBounds, FastForwardError } from '@/lib/game/fast-forward-server';
import { refreshGroupCompletion } from '@/lib/game/group-server';
import { getApiI18n } from '@/lib/i18n/server';

const bodySchema = z.object({
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

type Api = Awaited<ReturnType<typeof getApiI18n>>['api'];

const ERRORS: Record<FastForwardError['key'], (api: Api) => string> = {
  ended: (api) => api.gameEnded,
  synchro: (api) => api.fastForwardSynchro,
  no_session: (api) => api.fastForwardNoSession,
  invalid_date: (api) => api.fastForwardInvalidDate,
  already_advanced: (api) => api.alreadyAdvanced,
};

async function loadOwnedGame(userId: string, gameId: string) {
  const game = await db.query.games.findFirst({ where: eq(games.id, gameId) });
  if (game) await requireOwnership(userId, game.userId);
  return game;
}

function errorResponse(error: unknown, api: Api, label: string) {
  if (error instanceof FastForwardError) {
    return NextResponse.json({ error: ERRORS[error.key](api) }, { status: 400 });
  }
  if (error instanceof Error && error.message === 'Forbidden: You do not own this resource') {
    return NextResponse.json({ error: api.forbidden }, { status: 403 });
  }
  console.error(`[API] ${label} error:`, error);
  return NextResponse.json({ error: api.internal }, { status: 500 });
}

export const GET = withAuth(async (_req, { userId }, context) => {
  const { api } = await getApiI18n();
  try {
    const { id } = await context.params;
    const game = await loadOwnedGame(userId, id);
    if (!game) return NextResponse.json({ error: api.gameNotFound }, { status: 404 });

    const bounds = await fastForwardBounds(game);
    return NextResponse.json({ success: true, data: bounds });
  } catch (error) {
    return errorResponse(error, api, 'Fast-forward bounds');
  }
});

export const POST = withAuth(async (req, { userId }, context) => {
  const { api, fmt, f } = await getApiI18n();
  try {
    const { id } = await context.params;
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: api.validationFailed }, { status: 400 });

    const game = await loadOwnedGame(userId, id);
    if (!game) return NextResponse.json({ error: api.gameNotFound }, { status: 404 });

    const outcome = await fastForward(game, parsed.data.targetDate);
    if (outcome.endReason && game.groupId) await refreshGroupCompletion(game.groupId);

    return NextResponse.json({
      success: true,
      data: { ...outcome, endReason: outcome.endReason ?? null },
      message: fmt(api.advanced, { date: f.date(outcome.newDate) }),
    });
  } catch (error) {
    return errorResponse(error, api, 'Fast-forward');
  }
});
