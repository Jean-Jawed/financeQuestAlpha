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
const client = postgres(connectionString, {
  max: 10, // Max connections pool
  idle_timeout: 20, // Secondes avant fermeture connexion idle
  connect_timeout: 10, // Timeout connexion
});

// Client Drizzle avec schema complet
export const db = drizzle(client, { schema });

// Export du schema pour usage externe
export { schema };

// Types utiles
export type Database = typeof db;
