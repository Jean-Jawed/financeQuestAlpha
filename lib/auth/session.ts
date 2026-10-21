/**
 * FINANCEQUEST - AUTH SESSION SERVICE
 * Gestion des sessions utilisateur avec Supabase Auth
 */

import { createServerClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { User } from '@supabase/supabase-js';

// ==========================================
// TYPES
// ==========================================

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface AuthResponse {
  success: boolean;
  user?: SessionUser;
  error?: string;
}

// ==========================================
// SESSION FUNCTIONS
// ==========================================

/**
 * Obtenir l'utilisateur de la session courante
 * Retourne null si non authentifié
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const supabase = await createServerClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();


    if (error || !user) {
      return null;
    }

    // Récupérer les infos complètes depuis notre table users

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });



    if (!dbUser) {
      console.warn(`[Auth] ⚠️ User ${user.id} exists in Supabase but not in database`);
      return null;
    }


    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      createdAt: dbUser.createdAt,
    };
  } catch (error) {
    console.error('[Auth] 💥 Error getting session user:', error);
    return null;
  }
}

/**
 * Vérifier si l'utilisateur est authentifié
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getSessionUser();
  return user !== null;
}

/**
 * Obtenir l'ID de l'utilisateur courant
 * Lance une erreur si non authentifié (pour usage dans API routes)
 */
export async function requireAuth(): Promise<string> {
  const user = await getSessionUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user.id;
}

/**
 * Vérifier que l'utilisateur courant est administrateur
 * Le rôle est lu dans app_metadata (modifiable uniquement côté serveur,
 * attribué par docs/reviewOct2026/sql/02_projet_A_structure.sql)
 *
 * @returns 'ok' | 'unauthenticated' | 'forbidden'
 */
export async function checkAdmin(): Promise<'ok' | 'unauthenticated' | 'forbidden'> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return 'unauthenticated';
    }

    return user.app_metadata?.role === 'admin' ? 'ok' : 'forbidden';
  } catch (error) {
    console.error('[Auth] Error checking admin role:', error);
    return 'unauthenticated';
  }
}

/**
 * Obtenir l'utilisateur courant avec erreur si non authentifié
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

// ==========================================
// AUTH OPERATIONS
// ==========================================

/**
 * Créer un nouveau compte utilisateur
 * 
 * @param email - Email de l'utilisateur
 * @param password - Mot de passe (sera hashé par Supabase)
 * @param name - Nom de l'utilisateur
 */
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  try {
    const supabase = await createServerClient();

    // 1. Créer le compte Supabase Auth
    // Le profil public.users est créé par le trigger `on_auth_user_created`
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim() },
      },
    });

    if (error) {
      console.error('[Auth] Signup error:', error);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Failed to create user' };
    }

    // 2. Se connecter automatiquement après signup
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('[Auth] Auto-login after signup failed:', signInError);
      return { 
        success: false, 
        error: 'Account created but login failed. Please try logging in manually.' 
      };
    }

    // 3. Récupérer l'utilisateur complet
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return {
        success: false,
        error: 'Account created but session failed. Please try logging in.'
      };
    }

    return { success: true, user: sessionUser };
  } catch (error) {
    console.error('[Auth] Signup error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Connexion avec email/password
 * 
 * @param email - Email de l'utilisateur
 * @param password - Mot de passe
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const supabase = await createServerClient();

    // 1. Login via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Auth] Login error:', error);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Login failed' };
    }

    console.log(`[Auth] User logged in: ${email}`);

    // 2. Récupérer l'utilisateur complet
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return { success: false, error: 'Failed to retrieve user session' };
    }

    return { success: true, user: sessionUser };
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Déconnexion
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[Auth] Logout error:', error);
      return { success: false, error: error.message };
    }

    console.log('[Auth] User logged out');

    return { success: true };
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Vérifier si un email existe déjà
 */
export async function emailExists(email: string): Promise<boolean> {
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return existingUser !== undefined;
  } catch (error) {
    console.error('[Auth] Error checking email:', error);
    return false;
  }
}

/**
 * Mettre à jour le nom de l'utilisateur
 */
export async function updateUserName(userId: string, name: string): Promise<boolean> {
  try {
    await db.update(users).set({ name, updatedAt: new Date() }).where(eq(users.id, userId));

    console.log(`[Auth] User name updated: ${userId}`);

    return true;
  } catch (error) {
    console.error('[Auth] Error updating user name:', error);
    return false;
  }
}