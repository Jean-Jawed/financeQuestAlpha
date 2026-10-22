/**
 * FINANCEQUEST - SCÉNARIOS
 * Fiches de règles des scénarios (fonctions pures, utilisables côté client)
 *
 * La base ne stocke que l'identifiant (games.scenario) : ajouter un scénario
 * revient à ajouter une fiche ici, et ses textes dans les dictionnaires
 * (ui.scenarios). Voir docs/reviewOct2026/phase2/06_scenarios.md
 */

// ==========================================
// TYPES
// ==========================================

export type TradeAction = 'buy' | 'sell' | 'short' | 'cover';

export const TRADE_ACTIONS: readonly TradeAction[] = ['buy', 'sell', 'short', 'cover'];

export interface ScenarioRules {
  /** Ordres autorisés */
  actions: readonly TradeAction[];
  /** Types d'actifs autorisés (codes asset_types : STOCK, CRYPTO…) ; tous si absent */
  assetTypes?: readonly string[];
  /** Places de cotation autorisées (codes markets : TSE, HKEX…) ; toutes si absent */
  markets?: readonly string[];
  /** Période imposée (YYYY-MM-DD) : départ fixe, fin automatique à la dernière séance */
  period?: { start: string; end: string };
}

export interface Scenario {
  id: string;
  /** Vignette (public/gravures) */
  image: string;
  /** Indice de comparaison du bilan (symbole de la base prix) */
  benchmark: string;
  rules: ScenarioRules;
}

// ==========================================
// RÈGLES COMMUNES
// ==========================================

/** Séances jouées avant de pouvoir prendre sa retraite (et figurer au classement) */
export const MIN_SESSIONS_TO_RETIRE = 20;

/**
 * Marge entre la date de départ et la fin des données, en jours calendaires :
 * assez pour jouer MIN_SESSIONS_TO_RETIRE séances, fériés compris
 */
const START_MARGIN_DAYS = 35;

/** Dernière date de départ possible (hors période imposée), YYYY-MM-DD */
export function latestStartDate(coverageEnd: string): string {
  return new Date(Date.parse(`${coverageEnd}T00:00:00Z`) - START_MARGIN_DAYS * 86_400_000).toISOString().slice(0, 10);
}

// ==========================================
// FICHES
// ==========================================

export const SCENARIOS = [
  {
    id: 'libre',
    image: '/gravures/scenario-libre.webp',
    benchmark: '^GSPC',
    rules: { actions: TRADE_ACTIONS },
  },
  {
    // Faillite de Silicon Valley Bank (10 mars), sauvetage de Credit Suisse (19 mars)
    id: 'ruee-bancaire',
    image: '/gravures/scenario-ruee-bancaire.webp',
    benchmark: '^GSPC',
    rules: { actions: TRADE_ACTIONS, period: { start: '2023-03-01', end: '2023-03-31' } },
  },
  {
    id: 'ours',
    image: '/gravures/scenario-ours.webp',
    benchmark: '^GSPC',
    rules: { actions: ['short', 'cover'] },
  },
  {
    id: 'crypto',
    image: '/gravures/scenario-crypto.webp',
    benchmark: 'BTC',
    rules: { actions: TRADE_ACTIONS, assetTypes: ['CRYPTO'] },
  },
  {
    id: 'orient',
    image: '/gravures/scenario-orient.webp',
    benchmark: '^N225',
    rules: { actions: TRADE_ACTIONS, markets: ['TSE', 'HKEX', 'SSE'] },
  },
  {
    // Aucune vente : on choisit, puis on tient jusqu'à la retraite
    id: 'diamant',
    image: '/gravures/scenario-diamant.webp',
    benchmark: '^GSPC',
    rules: { actions: ['buy'] },
  },
] as const satisfies readonly Scenario[];

export type ScenarioId = (typeof SCENARIOS)[number]['id'];

export const SCENARIO_IDS = SCENARIOS.map((scenario) => scenario.id) as [ScenarioId, ...ScenarioId[]];

export const DEFAULT_SCENARIO: ScenarioId = 'libre';

// ==========================================
// ACCÈS
// ==========================================

export function isScenarioId(value: unknown): value is ScenarioId {
  return typeof value === 'string' && (SCENARIO_IDS as readonly string[]).includes(value);
}

/** Fiche d'un scénario ; un identifiant inconnu (ancienne partie) retombe sur « libre » */
export function getScenario(id: string): Scenario {
  return SCENARIOS.find((scenario) => scenario.id === id) ?? SCENARIOS[0];
}

export function isActionAllowed(scenario: Scenario, action: TradeAction): boolean {
  return scenario.rules.actions.includes(action);
}

/**
 * L'actif est-il négociable dans ce scénario ?
 * @param typeCode - Code du type d'actif (asset_types.code)
 * @param marketCode - Code de la place (markets.code), absent pour les devises
 */
export function isAssetAllowed(scenario: Scenario, typeCode: string | null, marketCode: string | null): boolean {
  const { assetTypes, markets } = scenario.rules;
  if (assetTypes && (!typeCode || !assetTypes.includes(typeCode))) return false;
  if (markets && (!marketCode || !markets.includes(marketCode))) return false;
  return true;
}
