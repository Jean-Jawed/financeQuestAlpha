/**
 * FINANCEQUEST - API ROUTE: GROUP VIEW
 * GET /api/groups/[id]?after=<id du dernier message reçu>
 * Le groupe vu par le joueur : classement à sa date, messages, séance commune.
 * Appelée régulièrement par le panneau du groupe (rafraîchissement).
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { loadGroupView } from '@/lib/game/group-server';
import { groupErrorResponse } from '@/lib/game/group-api';
import { getApiI18n } from '@/lib/i18n/server';

export const GET = withAuth(async (req, { userId }, context: { params: Promise<{ id: string }> }) => {
  const { api } = await getApiI18n();

  try {
    const { id } = await context.params;
    const after = Number(new URL(req.url).searchParams.get('after'));
    const view = await loadGroupView(id, userId, Number.isInteger(after) && after > 0 ? after : undefined);

    return NextResponse.json({ success: true, data: view }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return groupErrorResponse(error, api, 'Group view');
  }
});
