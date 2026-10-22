/**
 * FINANCEQUEST - API ROUTE: SESSION
 * GET /api/auth/session
 * Retourne l'utilisateur de la session courante
 */

import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getApiI18n } from '@/lib/i18n/server';

// ==========================================
// API HANDLER
// ==========================================

export async function GET(req: Request) {
  const { api, fmt, f } = await getApiI18n();

  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error('[API] Session error:', error);
    return NextResponse.json(
      { error: api.internal },
      { status: 500 }
    );
  }
}
