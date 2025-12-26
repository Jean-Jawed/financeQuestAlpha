/**
 * FINANCEQUEST - SUPABASE SERVER CLIENT
 * Client Supabase pour Server Components et API Routes
 */

import { createServerClient as createClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerClient() {
  const cookieStore = await cookies();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Ignore errors in Server Components où les cookies ne peuvent pas être modifiés
          }
        },
      },
    }
  );
}