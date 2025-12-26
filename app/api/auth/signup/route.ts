/**
 * FINANCEQUEST - API ROUTE: SIGNUP
 * POST /api/auth/signup
 */

import { NextResponse } from 'next/server';
import { signUp, emailExists } from '@/lib/auth/session';
import { z } from 'zod';

// ==========================================
// VALIDATION SCHEMA
// ==========================================

const signupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
});

// ==========================================
// API HANDLER
// ==========================================

export async function POST(req: Request) {
  try {
    // 1. Parser et valider le body
    const body = await req.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;

    // 2. Vérifier si l'email existe déjà
    const exists = await emailExists(email);
    if (exists) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    // 3. Créer le compte
    const result = await signUp(email, password, name);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Échec de la création du compte' },
        { status: 400 }
      );
    }

    // 4. Retourner l'utilisateur créé
    return NextResponse.json(
      {
        success: true,
        user: result.user,
        message: 'Compte créé avec succès',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Signup error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
