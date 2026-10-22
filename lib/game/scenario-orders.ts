/**
 * FINANCEQUEST - RÈGLES DE SCÉNARIO APPLIQUÉES AUX ORDRES
 * Ordre et actif autorisés par le scénario de la partie (côté serveur)
 */

import { getAssetBySymbol } from '@/lib/market/assets';
import { getApiI18n } from '@/lib/i18n/server';
import { getScenario, isActionAllowed, isAssetAllowed, type TradeAction } from './scenarios';

/**
 * Vérifier qu'un ordre respecte le scénario
 * @returns Le message d'erreur dans la langue du joueur, ou null si l'ordre est permis
 */
export async function checkScenarioOrder(
  scenarioId: string,
  symbol: string,
  action: TradeAction
): Promise<string | null> {
  const scenario = getScenario(scenarioId);
  const { api } = await getApiI18n();

  if (!isActionAllowed(scenario, action)) {
    return api.scenarioAction;
  }

  if (scenario.rules.assetTypes || scenario.rules.markets) {
    const asset = await getAssetBySymbol(symbol);
    if (!asset || !isAssetAllowed(scenario, asset.type?.code ?? null, asset.market?.code ?? null)) {
      return api.scenarioAsset;
    }
  }

  return null;
}
