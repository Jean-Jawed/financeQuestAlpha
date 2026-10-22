/**
 * FINANCEQUEST - SONS
 * Lecteur Web Audio : sons décodés une fois, joués sans délai, superposables
 * Fichiers générés par scripts/generate-sounds.py dans public/sons/
 */

'use client';

import { create } from 'zustand';

// ==========================================
// CATALOGUE
// ==========================================

export const SOUNDS = {
  /** Clôture d'une séance */
  bell: '/sons/cloche.mp3',
  /** Volets du tableau d'affichage (changement de date) */
  flaps: '/sons/volets.mp3',
  /** Ordre d'achat ou de vente à découvert */
  stamp: '/sons/tampon.mp3',
  /** Vente ou rachat : position fermée */
  till: '/sons/caisse.mp3',
  /** Succès débloqué */
  medal: '/sons/medaille.mp3',
  /** Ouverture du ticket d'ordre */
  ticket: '/sons/ticket.mp3',
  /** Ordre refusé, erreur */
  refusal: '/sons/refus.mp3',
  /** Nouvelle partie */
  opening: '/sons/ouverture.mp3',
} as const;

export type SoundName = keyof typeof SOUNDS;

/** Volume global : présent sans couvrir le reste */
const MASTER_VOLUME = 0.6;

const STORAGE_KEY = 'fq-sound-muted';

// ==========================================
// PRÉFÉRENCE (muet)
// ==========================================

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    // Stockage bloqué (navigation privée, cookies refusés) : son actif par défaut
    return false;
  }
}

interface SoundState {
  muted: boolean;
  hydrated: boolean;
  hydrate: () => void;
  toggle: () => void;
}

export const useSoundStore = create<SoundState>((set, get) => ({
  muted: false,
  hydrated: false,
  hydrate: () => {
    if (!get().hydrated) set({ muted: readMuted(), hydrated: true });
  },
  toggle: () => {
    const muted = !get().muted;
    set({ muted });
    try {
      window.localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    } catch {
      // Préférence non mémorisée : elle vaut pour la visite en cours
    }
  },
}));

// ==========================================
// LECTEUR
// ==========================================

let context: AudioContext | null = null;
let master: GainNode | null = null;
const buffers = new Map<SoundName, Promise<AudioBuffer | null>>();

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!context) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
    master = context.createGain();
    master.gain.value = MASTER_VOLUME;
    master.connect(context.destination);
  }
  return context;
}

function loadBuffer(name: SoundName): Promise<AudioBuffer | null> {
  const ctx = getContext();
  if (!ctx) return Promise.resolve(null);

  let pending = buffers.get(name);
  if (!pending) {
    pending = fetch(SOUNDS[name])
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error(String(res.status)))))
      .then((data) => ctx.decodeAudioData(data))
      .catch(() => {
        // Son absent ou illisible : le jeu continue en silence, on réessaiera
        buffers.delete(name);
        return null;
      });
    buffers.set(name, pending);
  }
  return pending;
}

/**
 * Précharger les sons du jeu (à l'arrivée sur une partie)
 * Le décodage n'a lieu qu'une fois ; le contexte audio sera débloqué au premier geste
 */
export function preloadSounds(names: SoundName[] = Object.keys(SOUNDS) as SoundName[]) {
  names.forEach((name) => void loadBuffer(name));
}

/**
 * Jouer un son (sans effet si le joueur a coupé le son)
 *
 * @param volume - Volume relatif, de 0 à 1
 */
export function playSound(name: SoundName, volume = 1) {
  if (useSoundStore.getState().muted) return;

  const ctx = getContext();
  if (!ctx || !master) return;

  // Les navigateurs suspendent l'audio tant que la page n'a pas reçu de geste :
  // les sons sont toujours déclenchés par un clic, la reprise est donc autorisée
  if (ctx.state === 'suspended') void ctx.resume();

  void loadBuffer(name).then((buffer) => {
    if (!buffer || !master) return;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(gain).connect(master);
    source.start();
  });
}
