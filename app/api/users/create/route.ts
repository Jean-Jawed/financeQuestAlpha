/**
 * FINANCEQUEST - API ROUTE: Create User in Database
 * POST /api/users/create
 * Appelé après signup Supabase pour créer l'entrée DB
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { z } from 'zod';

// ==========================================
// VALIDATION SCHEMA
// ==========================================

const createUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
});

// ==========================================
// API HANDLER
// ==========================================

export async function POST(req: Request) {
  try {
    // 1. Parser et valider le body
    const body = await req.json();
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { id, email, name } = validation.data;

    // 2. Créer l'entrée dans la table users
    await db.insert(users).values({
      id,
      email,
      name,
    });

    console.log(`[API] User created in database: ${email}`);

    // 3. Retourner succès
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('[API] Create user error:', error);
    
    // Si erreur de contrainte unique (email déjà existant)
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}