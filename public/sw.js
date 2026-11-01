/**
 * PASTFOLIO - SERVICE WORKER
 * Rend l'application installable et tient bon hors connexion :
 * - pages : toujours le réseau (données du joueur, jamais mises en cache),
 *   et la page « hors connexion » si le réseau manque
 * - scripts et styles versionnés de Next : cache d'abord
 * - gravures, textures, sons, icônes : cache immédiat, rafraîchi en arrière-plan
 * - API : jamais interceptée
 */

const VERSION = 'v1';
const STATIC_CACHE = `pastfolio-static-${VERSION}`;
const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/icons/icon-192.png', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

/** Scripts et styles de Next : l'adresse change à chaque version */
function isHashed(url) {
  return url.pathname.startsWith('/_next/static/');
}

/** Images, sons et icônes du site : adresse fixe, contenu qui change rarement */
function isAsset(url) {
  return ['/gravures/', '/textures/', '/icons/', '/sons/', '/mag/'].some(
    (prefix) => url.pathname.startsWith(prefix) && url.pathname.includes('.')
  );
}

function store(request, response) {
  if (response.ok) {
    const copy = response.clone();
    caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  // Navigation : réseau, puis la page hors connexion
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Versionnés : le cache d'abord, le réseau seulement la première fois
  if (isHashed(url)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((r) => store(request, r))));
    return;
  }

  // Le reste : le cache tout de suite, rafraîchi en arrière-plan
  if (isAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((r) => store(request, r))
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
