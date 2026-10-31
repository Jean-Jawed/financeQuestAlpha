/**
 * FINANCEQUEST - UPLOAD DES AVATARS PAR DÉFAUT
 * Dépose assets-src/avatars/decoupes/*.webp (256 px, déjà convertis par
 * assets-src/avatars/decoupe.py) dans le bucket « avatars », sous defaults/.
 *
 * Prérequis : docs/reviewOct2026/sql/07_projet_A_avatars.sql lancé dans Supabase.
 * Usage : node --env-file=.env.local scripts/upload-avatars.mjs [--dry-run]
 * Rejouable : les fichiers existants sont remplacés (upsert).
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const SOURCE = 'assets-src/avatars/decoupes';
const BUCKET = 'avatars';
const PREFIX = 'defaults';
const CONCURRENCY = 6;
const dryRun = process.argv.includes('--dry-run');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (.env.local)');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const files = readdirSync(SOURCE).filter((f) => f.endsWith('.webp')).sort();
console.log(`${files.length} avatars à déposer dans ${BUCKET}/${PREFIX}/${dryRun ? ' (essai à blanc)' : ''}`);

if (!dryRun) {
  const { data: bucket, error } = await supabase.storage.getBucket(BUCKET);
  if (error || !bucket) {
    console.error(`Bucket « ${BUCKET} » introuvable : lancer d'abord 07_projet_A_avatars.sql`);
    process.exit(1);
  }
}

let done = 0;
const failures = [];

async function upload(file) {
  const body = readFileSync(join(SOURCE, file));
  if (dryRun) return;
  const { error } = await supabase.storage.from(BUCKET).upload(`${PREFIX}/${file}`, body, {
    contentType: 'image/webp',
    cacheControl: '31536000', // fichiers immuables : un an de cache
    upsert: true,
  });
  if (error) failures.push(`${file} : ${error.message}`);
  done++;
}

for (let i = 0; i < files.length; i += CONCURRENCY) {
  await Promise.all(files.slice(i, i + CONCURRENCY).map(upload));
}

if (!dryRun) {
  console.log(`${done - failures.length} déposés, ${failures.length} échecs`);
  failures.forEach((f) => console.error('  ' + f));
  console.log(`Exemple : ${url}/storage/v1/object/public/${BUCKET}/${PREFIX}/${files[0]}`);
}
