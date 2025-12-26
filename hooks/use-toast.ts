/**
 * FINANCEQUEST - HOOK: useToast
 * Hook pour afficher des notifications toast
 */

'use client';

import { create } from 'zustand';

// ==========================================
// TYPES
// ==========================================

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

// ==========================================
// STORE
// ==========================================

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove après duration (default: 3s)
    const duration = toast.duration || 3000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// ==========================================
// HOOK
// ==========================================

export function useToast() {
  const { addToast, removeToast } = useToastStore();

  return {
    toast: {
      success: (message: string, duration?: number) =>
        addToast({ type: 'success', message, duration }),
      error: (message: string, duration?: number) =>
        addToast({ type: 'error', message, duration }),
      info: (message: string, duration?: number) =>
        addToast({ type: 'info', message, duration }),
      warning: (message: string, duration?: number) =>
        addToast({ type: 'warning', message, duration }),
    },
    dismiss: removeToast,
  };
}

// Export store for ToastContainer component
export { useToastStore };
