/**
 * PASTFOLIO - INSTALLATION DE L'APPLICATION
 * - Chrome, Edge, Samsung Internet, Opera : le navigateur propose l'installation
 *   (événement beforeinstallprompt), qu'on garde pour la déclencher d'un bouton
 * - Safari (iPhone, iPad, Mac) : pas d'invite ; on montre la marche à suivre
 * - Firefox sur ordinateur : pas d'installation possible, les incitations restent cachées
 * Le service worker est enregistré au même endroit, une seule fois.
 */

'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

/** Comment l'installation se fait sur cet appareil */
export type InstallMode =
  /** Le navigateur a proposé l'installation : un bouton suffit */
  | 'prompt'
  /** iPhone et iPad : Partager, puis « Sur l'écran d'accueil » */
  | 'ios'
  /** Safari sur Mac : Fichier, puis « Ajouter au Dock » */
  | 'macos'
  /** Déjà installée, ou navigateur sans installation */
  | 'none';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ==========================================
// ÉTAT PARTAGÉ (avant même le montage des composants)
// ==========================================

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
let started = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari iOS
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Écoute l'invite d'installation et enregistre le service worker (une fois) */
export function startPwa() {
  if (started || typeof window === 'undefined') return;
  started = true;
  installed = isStandalone();

  window.addEventListener('beforeinstallprompt', (event) => {
    // On garde l'invite pour nos propres boutons, au bon moment
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    deferred = null;
    notify();
  });

  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('[PWA] Service worker :', error));
    });
  }
}

function currentMode(): InstallMode {
  if (installed) return 'none';
  if (deferred) return 'prompt';
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
  if (iOS) return 'ios';
  // Safari sur Mac (pas Chrome, Edge ni Firefox, qui mentionnent aussi « Safari »)
  const macSafari = ua.includes('Macintosh') && ua.includes('Safari') && !/Chrome|Chromium|Edg|Firefox|OPR/.test(ua);
  if (macSafari) return 'macos';
  return 'none';
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Déclenche l'invite du navigateur ; true si le joueur a accepté */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const event = deferred;
  deferred = null;
  await event.prompt();
  const { outcome } = await event.userChoice;
  if (outcome === 'accepted') installed = true;
  notify();
  return outcome === 'accepted';
}

// ==========================================
// HOOKS
// ==========================================

/** Mode d'installation sur cet appareil ('none' au rendu serveur) */
export function useInstallMode(): InstallMode {
  return useSyncExternalStore(subscribe, currentMode, () => 'none');
}

const DISMISS_PREFIX = 'fq-install-dismissed:';
const DISMISS_DAYS = 30;

/**
 * Incitation masquable : refermée, elle se tait 30 jours (mémorisé dans ce navigateur)
 * @param placement - Emplacement de l'incitation (« landing », « dashboard »…)
 */
export function useInstallDismissal(placement: string): [boolean, () => void] {
  // Masquée jusqu'à la lecture du stockage : pas de clignotement
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const at = Number(window.localStorage.getItem(DISMISS_PREFIX + placement) ?? 0);
      setDismissed(Date.now() - at < DISMISS_DAYS * 86_400_000);
    } catch {
      setDismissed(false);
    }
  }, [placement]);

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_PREFIX + placement, String(Date.now()));
    } catch {
      // Stockage indisponible : masquée pour cette visite seulement
    }
  }

  return [dismissed, dismiss];
}
