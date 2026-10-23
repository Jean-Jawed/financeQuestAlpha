/**
 * FINANCEQUEST - API ROUTE: JOIN GROUP
 * POST /api/groups/join
 * Rejoindre un groupe par son code : crée la partie du joueur aux réglages du groupe
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth/middleware';
import { INVITE_CODE_PATTERN } from '@/lib/game/groups';
import { findGroupByCode, joinGroup } from '@/lib/game/group-server';
import { groupErrorResponse } from '@/lib/game/group-api';
import { validateGameCreation } from '@/lib/game/validations';
import { getApiI18n } from '@/lib/i18n/server';

const joinSchema = z.object({
  code: z.string().trim().toUpperCase().regex(INVITE_CODE_PATTERN),
  /** Tempo synchronisé : le joueur s'engage à jouer au rythme du groupe */
  commit: z.boolean().optional(),
});

export const POST = withAuth(async (req, { userId }) => {
  const { api, fmt } = await getApiI18n();

  try {
    const validation = joinSchema.safeParse(await req.json());
    if (!validation.success) {
      return NextResponse.json({ error: api.groupNotFound }, { status: 404 });
    }

    const group = await findGroupByCode(validation.data.code);
    if (!group) {
      return NextResponse.json({ error: api.groupNotFound }, { status: 404 });
    }

    if (group.tempo === 'synchro' && !validation.data.commit) {
      return NextResponse.json({ error: api.groupCommitRequired }, { status: 400 });
    }

    const creation = await validateGameCreation(userId, group.startDate);
    if (!creation.valid) {
      return NextResponse.json({ error: creation.error }, { status: 400 });
    }

    const game = await joinGroup(userId, group);

    return NextResponse.json(
      { success: true, data: { groupId: group.id, gameId: game.id }, message: fmt(api.groupJoined, { name: group.name }) },
      { status: 201 }
    );
  } catch (error) {
    return groupErrorResponse(error, api, 'Join group');
  }
});
