/**
 * FINANCEQUEST - AUTH PROVIDER
 * Provider React pour l'authentification globale
 */

'use client';

import { useEffect } from 'react';
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
  const { checkSession } = useAuth();

  // Vérifier la session au montage de l'app
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return <>{children}</>;
}

/**
 * Hook pour forcer le refresh de la session
 * Utile après login/logout dans les composants
 */
export { useRefreshSession } from '@/hooks/use-auth';
