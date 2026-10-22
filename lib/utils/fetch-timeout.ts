/**
 * FINANCEQUEST - FETCH AVEC DÉLAI D'ABANDON
 * Une requête sans réponse au-delà du délai est abandonnée (TimeoutError),
 * au lieu de laisser un bouton tourner indéfiniment
 */

/** Délai d'abandon des actions de jeu (ordre, séance) */
export const ACTION_TIMEOUT_MS = 20_000;

export class TimeoutError extends Error {
  constructor() {
    super('Request timed out');
    this.name = 'TimeoutError';
  }
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = ACTION_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) throw new TimeoutError();
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
