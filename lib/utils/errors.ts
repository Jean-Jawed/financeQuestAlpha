/**
 * FINANCEQUEST - ERROR HANDLING
 * Système de gestion d'erreurs standardisé
 */

// ==========================================
// ERROR CLASSES
// ==========================================

/**
 * Erreur de validation
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Erreur d'authentification
 */
export class AuthenticationError extends Error {
  constructor(message: string = 'Non authentifié') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Erreur d'autorisation
 */
export class AuthorizationError extends Error {
  constructor(message: string = 'Non autorisé') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Erreur de ressource non trouvée
 */
export class NotFoundError extends Error {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

/**
 * Erreur de conflit (ex: email déjà utilisé)
 */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

/**
 * Erreur métier (business logic)
 */
export class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessError';
  }
}

/**
 * Erreur API externe
 */
export class ExternalApiError extends Error {
  constructor(service: string, message: string) {
    super(`${service} API Error: ${message}`);
    this.name = 'ExternalApiError';
  }
}

// ==========================================
// ERROR HANDLERS
// ==========================================

/**
 * Convertir une erreur en réponse HTTP
 * Usage dans API routes
 */
export function errorToResponse(error: unknown): {
  status: number;
  body: { error: string };
} {
  // Erreur connue
  if (error instanceof ValidationError) {
    return {
      status: 400,
      body: { error: error.message },
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      status: 401,
      body: { error: error.message },
    };
  }

  if (error instanceof AuthorizationError) {
    return {
      status: 403,
      body: { error: error.message },
    };
  }

  if (error instanceof NotFoundError) {
    return {
      status: 404,
      body: { error: error.message },
    };
  }

  if (error instanceof ConflictError) {
    return {
      status: 409,
      body: { error: error.message },
    };
  }

  if (error instanceof BusinessError) {
    return {
      status: 400,
      body: { error: error.message },
    };
  }

  if (error instanceof ExternalApiError) {
    return {
      status: 502,
      body: { error: error.message },
    };
  }

  // Erreur JS standard
  if (error instanceof Error) {
    console.error('[Error Handler] Unexpected error:', error);
    return {
      status: 500,
      body: { error: 'Erreur interne du serveur' },
    };
  }

  // Erreur inconnue
  console.error('[Error Handler] Unknown error:', error);
  return {
    status: 500,
    body: { error: 'Erreur inconnue' },
  };
}

/**
 * Logger une erreur avec contexte
 */
export function logError(
  context: string,
  error: unknown,
  additionalInfo?: Record<string, any>
): void {
  console.error(`[${context}] Error:`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...additionalInfo,
  });
}

/**
 * Wrapper try/catch pour API routes
 * Retourne automatiquement une Response en cas d'erreur
 */
export async function handleApiError<T>(
  handler: () => Promise<T>,
  context: string = 'API'
): Promise<T> {
  try {
    return await handler();
  } catch (error) {
    logError(context, error);
    throw error;
  }
}

// ==========================================
// ERROR MESSAGES (Centralisés)
// ==========================================

export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  EMAIL_ALREADY_EXISTS: 'Cet email est déjà utilisé',
  UNAUTHORIZED: 'Non authentifié',
  FORBIDDEN: 'Non autorisé',

  // Game
  GAME_NOT_FOUND: 'Partie non trouvée',
  GAME_NOT_ACTIVE: 'La partie n\'est pas active',
  MAX_GAMES_REACHED: 'Limite de 5 parties actives atteinte',
  INVALID_START_DATE: 'Date de départ invalide',
  FUTURE_DATE: 'La date ne peut pas être dans le futur',

  // Trading
  INSUFFICIENT_BALANCE: 'Solde insuffisant',
  INSUFFICIENT_QUANTITY: 'Quantité insuffisante',
  INVALID_SYMBOL: 'Symbole invalide',
  INVALID_QUANTITY: 'Quantité invalide',
  POSITION_NOT_FOUND: 'Position non trouvée',
  SHORT_NOT_ALLOWED: 'La vente à découvert n\'est pas activée',
  CONFLICTING_POSITION: 'Position conflictuelle',

  // Market
  PRICE_NOT_AVAILABLE: 'Prix non disponible',
  MARKET_DATA_ERROR: 'Erreur lors de la récupération des données',
  RATE_LIMIT_EXCEEDED: 'Limite de requêtes atteinte',

  // Generic
  INTERNAL_ERROR: 'Erreur interne du serveur',
  VALIDATION_ERROR: 'Erreur de validation',
  NOT_FOUND: 'Ressource non trouvée',
} as const;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Créer une erreur de validation avec message personnalisé
 */
export function validationError(field: string, message: string): ValidationError {
  return new ValidationError(`${field}: ${message}`);
}

/**
 * Vérifier si une valeur est définie (pas null/undefined)
 */
export function assertDefined<T>(
  value: T | null | undefined,
  errorMessage: string = 'Value is required'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new ValidationError(errorMessage);
  }
}

/**
 * Vérifier une condition, sinon lance une erreur
 */
export function assert(
  condition: boolean,
  errorMessage: string,
  ErrorClass: new (msg: string) => Error = ValidationError
): asserts condition {
  if (!condition) {
    throw new ErrorClass(errorMessage);
  }
}
