/**
 * FINANCEQUEST - CHIFFRES CLÉS D'UN ACTIF
 * Calculés côté client sur l'historique d'un an (fonctions pures)
 */

export interface PricePoint {
  /** YYYY-MM-DD */
  date: string;
  close: number;
  volume: number | null;
}

export interface PriceStats {
  /** Variations en % (null si l'historique est trop court) */
  day: number | null;
  week: number | null;
  month: number | null;
  /** Depuis la dernière clôture de l'année précédente */
  ytd: number | null;
  high: number;
  low: number;
  /** Écart-type des rendements journaliers, annualisé (en %) */
  volatility: number | null;
  /** Volume moyen des 20 dernières séances */
  averageVolume: number | null;
}

/** Séances de bourse par an : base de l'annualisation */
const SESSIONS_PER_YEAR = 252;

/** Variation en % entre deux cours */
export function pctChange(from: number | undefined, to: number | undefined): number | null {
  return from && to && from > 0 ? ((to - from) / from) * 100 : null;
}

/** Dernier point dont la date est au plus `date` */
function lastOnOrBefore(points: PricePoint[], date: string): PricePoint | undefined {
  for (let i = points.length - 1; i >= 0; i--) {
    if (points[i].date <= date) return points[i];
  }
  return undefined;
}

function shiftDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Chiffres clés à partir d'un historique trié par date croissante
 * (le dernier point est le jour simulé)
 */
export function computePriceStats(points: PricePoint[]): PriceStats | null {
  if (points.length === 0) return null;

  const last = points[points.length - 1];
  const closes = points.map((p) => p.close);

  // Rendements journaliers logarithmiques
  const returns: number[] = [];
  for (let i = 1; i < points.length; i++) {
    if (points[i - 1].close > 0 && points[i].close > 0) {
      returns.push(Math.log(points[i].close / points[i - 1].close));
    }
  }
  let volatility: number | null = null;
  if (returns.length >= 20) {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (returns.length - 1);
    volatility = Math.sqrt(variance * SESSIONS_PER_YEAR) * 100;
  }

  const recentVolumes = points
    .slice(-20)
    .map((p) => p.volume)
    .filter((v): v is number => v !== null && v > 0);

  const yearStart = `${last.date.slice(0, 4)}-01-01`;
  const previousYearClose = lastOnOrBefore(points, shiftDays(yearStart, -1));

  return {
    day: points.length >= 2 ? pctChange(points[points.length - 2].close, last.close) : null,
    week: pctChange(lastOnOrBefore(points, shiftDays(last.date, -7))?.close, last.close),
    month: pctChange(lastOnOrBefore(points, shiftDays(last.date, -30))?.close, last.close),
    ytd: pctChange(previousYearClose?.close, last.close),
    high: Math.max(...closes),
    low: Math.min(...closes),
    volatility,
    averageVolume: recentVolumes.length > 0 ? recentVolumes.reduce((s, v) => s + v, 0) / recentVolumes.length : null,
  };
}
