/**
 * FINANCEQUEST - POOLS DE CONNEXIONS POSTGRES
 * Commun aux deux bases (jeu et prix)
 *
 * Sur Vercel (Fluid compute), une instance est mise en pause entre deux requêtes.
 * Une connexion laissée ouverte pendant la pause meurt côté réseau ; réutilisée au
 * réveil, sa requête attendait indéfiniment (504 au bout de 300 s, voir
 * docs/reviewOct2026/phase2/08_connexions.md). D'où :
 * - attachDatabasePool : Vercel garde l'instance active le temps de fermer les
 *   connexions inutilisées, avant la pause ;
 * - idleTimeoutMillis court : une connexion inutilisée est fermée en 5 s ;
 * - query_timeout : filet de sécurité, une requête sans réponse échoue en 15 s.
 */

import { attachDatabasePool } from '@vercel/functions';
import pg from 'pg';

// Colonnes DATE lues telles quelles (« 2023-03-01 ») : converties en Date, elles
// seraient décalées par le fuseau horaire du serveur (28 février à 23 h à Paris)
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

const globalForPools = globalThis as unknown as { fqPools?: Map<string, pg.Pool> };

/**
 * Pool de connexions pour une base
 * En développement, le pool est conservé sur globalThis pour ne pas en ouvrir un
 * nouveau à chaque rechargement à chaud (HMR)
 *
 * @param name - Nom du pool (une base = un pool)
 * @param connectionString - Chaîne de connexion (pooler Supabase, mode transaction)
 */
export function createPool(name: string, connectionString: string): pg.Pool {
  globalForPools.fqPools ??= new Map();
  const existing = globalForPools.fqPools.get(name);
  if (existing) return existing;

  const pool = new pg.Pool({
    connectionString,
    // Liaison chiffrée vers le pooler Supabase (certificat non vérifié : la chaîne
    // de Supabase n'est pas publique ; ajouter son certificat racine pour la vérifier)
    ssl: { rejectUnauthorized: false },
    // Peu de connexions par instance : chaque instance a son pool, la base en accepte 60
    max: 5,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
    query_timeout: 15_000,
    keepAlive: true,
  });

  // Une connexion inutilisée qui tombe (pooler redémarré…) ne doit pas faire planter le processus
  pool.on('error', (error) => console.error(`[DB:${name}] Connexion inactive perdue :`, error.message));

  attachDatabasePool(pool);
  globalForPools.fqPools.set(name, pool);
  return pool;
}
