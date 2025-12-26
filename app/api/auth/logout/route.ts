/**
 * FINANCEQUEST - API ROUTE: LOGOUT
 * POST /api/auth/logout
 */

import { NextResponse } from 'next/server';
import { signOut } from '@/lib/auth/session';

// ==========================================
// API HANDLER
// ==========================================

export async function POST(req: Request) {
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
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    console.error('[API] Logout error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
