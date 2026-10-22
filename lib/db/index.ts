/**
 * FINANCEQUEST - DRIZZLE CLIENT
 * Client PostgreSQL configuré pour Supabase
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { createPool } from './pool';

// Vérification variable d'environnement
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Pool node-postgres vers le pooler Supabase (mode transaction, port 6543) :
// requêtes non préparées par défaut, connexions fermées avant la mise en pause
// de l'instance Vercel (voir ./pool.ts)
const pool = createPool('jeu', process.env.DATABASE_URL);

// Client Drizzle avec schema complet
export const db = drizzle(pool, { schema });

// Export du schema pour usage externe
export { schema };

// Types utiles
export type Database = typeof db;

/** Client utilisable pour lire/écrire : `db` ou une transaction `tx` */
export type DbExecutor = Database | Parameters<Parameters<Database['transaction']>[0]>[0];
