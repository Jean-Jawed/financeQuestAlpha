/**
 * FINANCEQUEST - SUPABASE CLIENT (BROWSER)
 * Client Supabase pour usage côté client (auth UI, session)
 */

import { createBrowserClient } from '@supabase/ssr';

// Vérification variables d'environnement publiques
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
}

/**
 * Client Supabase pour le browser
 * Usage: composants Client Components uniquement
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { supabase } from '@/lib/supabase/client';
 * 
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'user@example.com',
 *   password: 'password'
 * });
 * ```
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Helper pour obtenir la session courante
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('[Supabase Client] Error getting session:', error);
    return null;
  }
  
  return data.session;
}

/**
 * Helper pour obtenir l'utilisateur courant
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('[Supabase Client] Error getting user:', error);
    return null;
  }
  
  return data.user;
}

/**
 * Helper pour se déconnecter
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('[Supabase Client] Error signing out:', error);
    throw error;
  }
}
