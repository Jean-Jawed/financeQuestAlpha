/**
 * FINANCEQUEST - API ROUTE: LOGOUT
 * POST /api/auth/logout
 */

import { NextResponse } from 'next/server';
import { signOut } from '@/lib/auth/session';
import { getApiI18n } from '@/lib/i18n/server';

// ==========================================
// API HANDLER
// ==========================================

export async function POST(req: Request) {
  const { api, fmt, f } = await getApiI18n();

  try {
    // Déconnecter l'utilisateur
    const result = await signOut();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Échec de la déconnexion' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: api.loggedOut,
    });
  } catch (error) {
    console.error('[API] Logout error:', error);
    return NextResponse.json(
      { error: api.internal },
      { status: 500 }
    );
  }
}
