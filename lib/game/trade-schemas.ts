/**
 * FINANCEQUEST - TRADE VALIDATION SCHEMAS
 * Schemas Zod pour validation des ordres de trading
 */

import { z } from 'zod';

// ==========================================
// BASE TRADE SCHEMA
// ==========================================

export const baseTradeSchema = z.object({
  gameId: z.string().uuid('ID de game invalide'),
  symbol: z.string().min(1, 'Symbole requis').max(20, 'Symbole trop long'),
  quantity: z.number().positive('La quantité doit être positive').finite('La quantité doit être un nombre valide'),
});

// ==========================================
// BUY SCHEMA
// ==========================================

export const buySchema = baseTradeSchema;

export type BuyInput = z.infer<typeof buySchema>;

// ==========================================
// SELL SCHEMA
// ==========================================

export const sellSchema = baseTradeSchema;

export type SellInput = z.infer<typeof sellSchema>;

// ==========================================
// SHORT SCHEMA
// ==========================================

export const shortSchema = baseTradeSchema;

export type ShortInput = z.infer<typeof shortSchema>;

// ==========================================
// COVER SCHEMA
// ==========================================

export const coverSchema = baseTradeSchema;

export type CoverInput = z.infer<typeof coverSchema>;

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Valider un input de trade
 * Retourne les données validées ou lance une erreur
 */
export function validateTradeInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  return schema.parse(data);
}

/**
 * Valider un input de trade (safe)
 * Retourne un objet avec success boolean et data ou errors
 */
export function validateTradeInputSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.errors.map((err) => err.message),
  };
}
