/**
 * FINANCEQUEST - MANIFESTE
 * /manifest.webmanifest : nom et couleurs pour l'ajout à l'écran d'accueil
 */

import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FinanceQuest',
    short_name: 'FinanceQuest',
    description: 'Rejouez la Bourse avec les cours réels · Replay the stock market with real prices',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F1D19',
    theme_color: '#0F1D19',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
