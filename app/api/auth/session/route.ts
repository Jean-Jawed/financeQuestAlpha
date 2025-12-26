/**
 * FINANCEQUEST - API ROUTE: SESSION
 * GET /api/auth/session
 * Retourne l'utilisateur de la session courante
 */

import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';

// ==========================================
// API HANDLER
// ==========================================

export async function GET(req: Request) {
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
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
