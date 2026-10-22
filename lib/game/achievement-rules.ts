/**
 * FINANCEQUEST - ACHIEVEMENT RULES
 * Évaluation pure (sans accès base) des critères d'achievements
 *
 * Le contexte est chargé une seule fois (voir achievements.ts), puis chaque
 * achievement est évalué en mémoire : quelques requêtes au total au lieu
 * d'une à quatre par achievement.
 */

// ==========================================
// TYPES
// ==========================================

export interface RuleTransaction {
  type: 'buy' | 'sell' | 'short' | 'cover';
  symbol: string;
  quantity: number;
  price: number;
  /** Date de jeu (YYYY-MM-DD) */
  date: string;
}

export interface AchievementContext {
  startDate: string;
  currentDate: string;
  /** Transactions de la partie, dans l'ordre chronologique */
  transactions: RuleTransaction[];
  /** Valeur courante de chaque position long, par symbole */
  longValueBySymbol: Map<string, number>;
  /** Type d'actif en minuscules (stock, crypto, bond, index…), par symbole */
  assetTypeBySymbol: Map<string, string>;
  /** Valeur totale ramenée à un capital de départ de 10 000 (seuils portfolio_value) */
  totalValue: number;
  returnPercentage: number;
}

type CriteriaValue = Record<string, unknown>;

/**
 * Critères évaluables. Les autres types présents en base
 * (balanced_portfolio, comeback, perfect_timing, swing_trade) nécessitent
 * un historique de valeur quotidien ou une définition métier : ignorés.
 */
export const IMPLEMENTED_CRITERIA = new Set([
  'first_transaction',
  'transaction_count',
  'asset_count',
  'portfolio_value',
  'return_percentage',
  'specific_trade',
  'days_played',
  'hold_duration',
  'profitable_trades',
  'short_profit',
  'sector_focus',
]);

// ==========================================
// HELPERS
// ==========================================

const EPSILON = 0.00000001;

function num(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Nombre de jours calendaires entre deux dates YYYY-MM-DD (en UTC)
 */
export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000);
}

interface ReplayResult {
  /** Ventes avec une plus-value ≥ seuil (%), calculée sur le coût moyen */
  profitableSellsPct: number[];
  /** Nombre de couvertures de short gagnantes */
  profitableCovers: number;
  /** Date d'ouverture (date de jeu) des positions long encore ouvertes */
  openLongSince: Map<string, string>;
}

/**
 * Rejouer les transactions pour reconstituer coûts moyens et dates d'ouverture
 */
export function replayTransactions(transactions: RuleTransaction[]): ReplayResult {
  const longs = new Map<string, { quantity: number; averageCost: number; openedAt: string }>();
  const shorts = new Map<string, { quantity: number; averageCost: number }>();
  const profitableSellsPct: number[] = [];
  let profitableCovers = 0;

  for (const tx of transactions) {
    if (tx.type === 'buy') {
      const position = longs.get(tx.symbol);
      if (!position || position.quantity <= EPSILON) {
        longs.set(tx.symbol, { quantity: tx.quantity, averageCost: tx.price, openedAt: tx.date });
      } else {
        const quantity = position.quantity + tx.quantity;
        position.averageCost =
          (position.quantity * position.averageCost + tx.quantity * tx.price) / quantity;
        position.quantity = quantity;
      }
    } else if (tx.type === 'sell') {
      const position = longs.get(tx.symbol);
      if (position && position.averageCost > 0) {
        profitableSellsPct.push(((tx.price - position.averageCost) / position.averageCost) * 100);
        position.quantity -= tx.quantity;
        if (position.quantity <= EPSILON) longs.delete(tx.symbol);
      }
    } else if (tx.type === 'short') {
      const position = shorts.get(tx.symbol);
      if (!position || position.quantity <= EPSILON) {
        shorts.set(tx.symbol, { quantity: tx.quantity, averageCost: tx.price });
      } else {
        const quantity = position.quantity + tx.quantity;
        position.averageCost =
          (position.quantity * position.averageCost + tx.quantity * tx.price) / quantity;
        position.quantity = quantity;
      }
    } else if (tx.type === 'cover') {
      const position = shorts.get(tx.symbol);
      if (position) {
        if (tx.price < position.averageCost) profitableCovers++;
        position.quantity -= tx.quantity;
        if (position.quantity <= EPSILON) shorts.delete(tx.symbol);
      }
    }
  }

  const openLongSince = new Map<string, string>();
  for (const [symbol, position] of longs) {
    openLongSince.set(symbol, position.openedAt);
  }

  return { profitableSellsPct, profitableCovers, openLongSince };
}

// ==========================================
// EVALUATION
// ==========================================

/**
 * Évaluer un critère d'achievement sur un contexte déjà chargé
 * (le rejeu des transactions est passé en paramètre pour n'être fait qu'une fois)
 */
export function evaluateAchievement(
  criteriaType: string,
  criteriaValue: CriteriaValue,
  ctx: AchievementContext,
  replay: ReplayResult
): boolean {
  const minCount = num(criteriaValue.min_count, 1);

  switch (criteriaType) {
    case 'first_transaction':
      return ctx.transactions.length >= 1;

    case 'transaction_count':
      return ctx.transactions.length >= minCount;

    case 'asset_count':
      return ctx.longValueBySymbol.size >= minCount;

    case 'portfolio_value':
      return ctx.totalValue >= num(criteriaValue.min_value, Infinity);

    case 'return_percentage':
      return ctx.returnPercentage >= num(criteriaValue.min_return, Infinity);

    case 'specific_trade': {
      // « Faire N transactions d'un type » (buy, sell, short…)
      if (typeof criteriaValue.transaction_type === 'string') {
        const type = criteriaValue.transaction_type;
        return ctx.transactions.filter((tx) => tx.type === type).length >= minCount;
      }

      // « Avoir acheté N actifs différents d'une catégorie » (stock, crypto…)
      // Compté sur l'historique d'achats : revendre ne fait pas perdre le badge
      if (typeof criteriaValue.asset_type === 'string') {
        const assetType = criteriaValue.asset_type.toLowerCase();
        const symbols = new Set(
          ctx.transactions
            .filter((tx) => tx.type === 'buy' && ctx.assetTypeBySymbol.get(tx.symbol) === assetType)
            .map((tx) => tx.symbol)
        );
        return symbols.size >= minCount;
      }

      return false;
    }

    case 'days_played':
      return daysBetween(ctx.startDate, ctx.currentDate) >= num(criteriaValue.min_days, Infinity);

    case 'hold_duration': {
      const minDays = num(criteriaValue.min_days, Infinity);
      for (const openedAt of replay.openLongSince.values()) {
        if (daysBetween(openedAt, ctx.currentDate) >= minDays) return true;
      }
      return false;
    }

    case 'profitable_trades': {
      const minProfit = num(criteriaValue.min_profit, 0);
      return replay.profitableSellsPct.filter((pct) => pct >= minProfit).length >= minCount;
    }

    case 'short_profit':
      return replay.profitableCovers >= minCount;

    case 'sector_focus': {
      // Seule la catégorie d'actif est connue (pas de secteur « tech » en base)
      const sector = typeof criteriaValue.sector === 'string' ? criteriaValue.sector.toLowerCase() : '';
      if (sector !== 'crypto') return false;

      let total = 0;
      let inSector = 0;
      for (const [symbol, value] of ctx.longValueBySymbol) {
        total += value;
        if (ctx.assetTypeBySymbol.get(symbol) === sector) inSector += value;
      }
      return total > 0 && (inSector / total) * 100 >= num(criteriaValue.min_percentage, 100);
    }

    default:
      return false;
  }
}
