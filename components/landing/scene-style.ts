/**
 * FINANCEQUEST - LANDING: styles liés à l'avancement d'une ScrollScene (variable --p)
 * Fonctions simples, utilisables dans les composants serveur comme client
 */

import type { CSSProperties } from 'react';

/** Opacité d'un élément visible entre deux moments de la scène (fondu aux bords) */
export function sceneWindow(from: number, to: number, fade = 0.06): CSSProperties {
  const k = (1 / fade).toFixed(2);
  return {
    opacity: `clamp(0, min(calc((var(--p) - ${from}) * ${k}), calc((${to} - var(--p)) * ${k})), 1)`,
  };
}

/** Opacité d'un élément qui apparaît à un moment de la scène et reste visible */
export function sceneFrom(from: number, fade = 0.06): CSSProperties {
  return { opacity: `clamp(0, calc((var(--p) - ${from}) * ${(1 / fade).toFixed(2)}), 1)` };
}
