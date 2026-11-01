/**
 * PASTFOLIO - MANIFESTE
 * /manifest.webmanifest : l'application installable (écran d'accueil, dock, menu
 * Démarrer). Icônes générées par scripts/generate-pwa-icons.mjs.
 */

import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'PastFolio',
    short_name: 'PastFolio',
    description: 'Rejouez la Bourse avec les cours réels · Replay the stock market with real prices',
    // Sans langue : le proxy envoie vers la langue du joueur, puis vers la connexion si besoin
    start_url: '/dashboard?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'any',
    background_color: '#0F1D19',
    theme_color: '#0F1D19',
    categories: ['games', 'finance', 'education'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    shortcuts: [
      { name: 'Tableau de bord · Dashboard', url: '/dashboard?source=pwa', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'La Gazette', url: '/mag?source=pwa', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
