/**
 * FINANCEQUEST - HOOK: useAuth
 * Hook React pour gérer l'authentification côté client
 */

'use client';

import { create } from 'zustand';
import { useEffect } from 'react';

// ==========================================
// TYPES
// ==========================================

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
}

// ==========================================
// ZUSTAND STORE
// ==========================================

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  authenticated: false,

  setUser: (user) =>
    set({
      user,
      authenticated: user !== null,
      loading: false,
    }),

  setLoading: (loading) => set({ loading }),

  checkSession: async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();

      if (data.authenticated && data.user) {
        set({
          user: data.user,
          authenticated: true,
          loading: false,
        });
      } else {
        set({
          user: null,
          authenticated: false,
          loading: false,
        });
      }
    } catch (error) {
      console.error('[useAuth] Error checking session:', error);
      set({
        user: null,
        authenticated: false,
        loading: false,
      });
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      
      set({
        user: null,
        authenticated: false,
        loading: false,
      });

      // Rediriger vers login
      window.location.href = '/login';
    } catch (error) {
      console.error('[useAuth] Logout error:', error);
    }
  },
}));

// ==========================================
// HOOK
// ==========================================

/**
 * Hook useAuth
 * Usage dans les composants Client
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, loading, authenticated, logout } = useAuth();
 *   
 *   if (loading) return <Spinner />;
 *   if (!authenticated) return <LoginPrompt />;
 *   
 *   return <div>Hello {user.name}</div>;
 * }
 * ```
 */
export function useAuth() {
  const store = useAuthStore();

  // Vérifier la session au montage
  useEffect(() => {
    if (store.loading && !store.user) {
      store.checkSession();
    }
  }, []);

  return store;
}

/**
 * Hook pour forcer la vérification de la session
 * Utile après login/signup
 */
export function useRefreshSession() {
  const checkSession = useAuthStore((state) => state.checkSession);
  return checkSession;
}
