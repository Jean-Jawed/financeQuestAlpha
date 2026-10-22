/**
 * FINANCEQUEST - AUTH PROVIDER
 * Provider React pour l'authentification globale
 */

'use client';

import { useAuth } from '@/hooks/use-auth';

// ==========================================
// COMPONENT
// ==========================================

/**
 * AuthProvider
 * Wrap l'application pour initialiser l'auth au chargement
 * 
 * Usage dans layout.tsx:
 * ```tsx
 * <AuthProvider>
 *   {children}
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // useAuth vérifie la session au montage (un seul appel, partagé avec l'en-tête)
  useAuth();

  return <>{children}</>;
}

/**
 * Hook pour forcer le refresh de la session
 * Utile après login/logout dans les composants
 */
export { useRefreshSession } from '@/hooks/use-auth';
