/**
 * FINANCEQUEST - API ROUTE: NAME AVAILABLE
 * GET /api/profile/name-available?name=… : le pseudo est-il valide et libre ?
 * Publique (formulaire d'inscription) ; un joueur connecté peut garder le sien
 */

import { NextResponse } from 'next/server';
import { withOptionalAuth } from '@/lib/auth/middleware';
import { getApiI18n } from '@/lib/i18n/server';
import { cleanName, nameIssue } from '@/lib/profile/rules';
import { isNameAvailable } from '@/lib/profile/server';

const ISSUE_KEYS = { length: 'nameLength', chars: 'nameChars', banned: 'nameBanned' } as const;

export const GET = withOptionalAuth(async (req, { userId }) => {
  const { api } = await getApiI18n();

  try {
    const name = cleanName(new URL(req.url).searchParams.get('name') ?? '');
    const issue = nameIssue(name);
    if (issue) {
      return NextResponse.json({ available: false, issue, error: api[ISSUE_KEYS[issue]] });
    }

    const available = await isNameAvailable(name, userId ?? undefined);
    return NextResponse.json(available ? { available } : { available, issue: 'taken', error: api.nameTaken });
  } catch (error) {
    console.error('[API] Name available:', error);
    return NextResponse.json({ error: api.internal }, { status: 500 });
  }
});
