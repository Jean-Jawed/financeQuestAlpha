/**
 * FINANCEQUEST - API ROUTE: START GROUP
 * POST /api/groups/[id]/start
 * Tempo synchronisé : l'organisateur lance la partie (fin de la salle d'attente)
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { loadGroup, startGroup } from '@/lib/game/group-server';
import { groupErrorResponse } from '@/lib/game/group-api';
import { getApiI18n } from '@/lib/i18n/server';

export const POST = withAuth(async (_req, { userId }, context: { params: Promise<{ id: string }> }) => {
  const { api } = await getApiI18n();

  try {
    const { id } = await context.params;
    await startGroup(await loadGroup(id), userId);
    return NextResponse.json({ success: true, message: api.groupStarted });
  } catch (error) {
    return groupErrorResponse(error, api, 'Start group');
  }
});
