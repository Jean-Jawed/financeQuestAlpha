/**
 * FINANCEQUEST - DRIZZLE CLIENT
 * Client PostgreSQL configuré pour Supabase
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Vérification variable d'environnement
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Connexion PostgreSQL
const connectionString = process.env.DATABASE_URL;

// Client postgres.js
// - prepare: false : obligatoire derrière le pooler Supabase en mode transaction (port 6543)
// - max: 5 : en serverless, chaque instance a son propre pool ; peu de connexions
//   par instance évite de saturer les 60 connexions de la base
// - En dev, le client est conservé sur globalThis pour ne pas ouvrir un nouveau
//   pool à chaque rechargement à chaud (HMR)
const globalForDb = globalThis as unknown as { pgClient?: postgres.Sql };

const client =
  globalForDb.pgClient ??
  postgres(connectionString, {
    prepare: false,
    max: 5,
    idle_timeout: 20, // Secondes avant fermeture connexion idle
    connect_timeout: 10, // Timeout connexion
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pgClient = client;
}

// Client Drizzle avec schema complet
export const db = drizzle(client, { schema });

// Export du schema pour usage externe
export { schema };

// Types utiles
export type Database = typeof db;

/** Client utilisable pour lire/écrire : `db` ou une transaction `tx` */
export type DbExecutor = Database | Parameters<Parameters<Database['transaction']>[0]>[0];
