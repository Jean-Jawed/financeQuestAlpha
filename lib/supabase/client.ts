/**
 * FINANCEQUEST - SUPABASE CLIENT (BROWSER)
 * Client Supabase pour usage côté client (auth UI, session)
 */

import { createBrowserClient } from '@supabase/ssr';

// Vérification variables d'environnement publiques
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
}

console.log('[Supabase Client] Initializing with URL:', supabaseUrl);

/**
 * Client Supabase pour le browser
 * Usage: composants Client Components uniquement
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

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