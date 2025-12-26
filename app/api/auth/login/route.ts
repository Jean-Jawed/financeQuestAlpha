/**
 * FINANCEQUEST - API ROUTE: LOGIN
 * POST /api/auth/login
 */

import { NextResponse } from 'next/server';
import { signIn } from '@/lib/auth/session';
import { z } from 'zod';

// ==========================================
// VALIDATION SCHEMA
// ==========================================

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

// ==========================================
// API HANDLER
// ==========================================

export async function POST(req: Request) {
  try {
    // 1. Parser et valider le body
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // 2. Tenter la connexion
    const result = await signIn(email, password);

    if (!result.success) {
      // Message générique pour ne pas révéler si l'email existe
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // 3. Retourner l'utilisateur connecté
    return NextResponse.json({
      success: true,
      user: result.user,
      message: 'Connexion réussie',
    });
  } catch (error) {
    console.error('[API] Login error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
