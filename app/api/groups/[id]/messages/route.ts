/**
 * FINANCEQUEST - API ROUTE: GROUP MESSAGES
 * POST /api/groups/[id]/messages : envoyer un message (membres, deux secondes entre deux messages)
 * DELETE /api/groups/[id]/messages?message=<id> : retirer un message (organisateur)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth/middleware';
import { GROUP_LIMITS } from '@/lib/game/groups';
import { deleteMessage, loadGroup, postMessage } from '@/lib/game/group-server';
import { groupErrorResponse } from '@/lib/game/group-api';
import { getApiI18n } from '@/lib/i18n/server';

const messageSchema = z.object({
  body: z.string().trim().min(1).max(GROUP_LIMITS.messageMax),
});

type Context = { params: Promise<{ id: string }> };

export const POST = withAuth(async (req, { userId }, context: Context) => {
  const { api } = await getApiI18n();

  try {
    const validation = messageSchema.safeParse(await req.json());
    if (!validation.success) {
      return NextResponse.json({ error: api.validationFailed }, { status: 400 });
    }

    const { id } = await context.params;
    await postMessage(await loadGroup(id), userId, validation.data.body);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return groupErrorResponse(error, api, 'Group message');
  }
});

export const DELETE = withAuth(async (req, { userId }, context: Context) => {
  const { api } = await getApiI18n();

  try {
    const messageId = Number(new URL(req.url).searchParams.get('message'));
    if (!Number.isInteger(messageId) || messageId <= 0) {
      return NextResponse.json({ error: api.validationFailed }, { status: 400 });
    }

    const { id } = await context.params;
    await deleteMessage(await loadGroup(id), userId, messageId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return groupErrorResponse(error, api, 'Delete group message');
  }
});
