// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinanceQuest - Simulation de Trading Historique',
  description: 'Apprenez le trading avec des données réelles historiques. Simulez vos investissements et testez vos stratégies sans risque.',
  keywords: 'trading, simulation, bourse, investissement, finance, apprentissage',
  authors: [{ name: 'FinanceQuest' }],
  
  // Favicon
  icons: {
    icon: '/favicon.ico',
  },
  
  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://financequest.com', // Remplacez par votre URL réelle
    siteName: 'FinanceQuest',
    title: 'FinanceQuest - Simulation de Trading Historique',
    description: 'Apprenez le trading avec des données réelles historiques. Simulez vos investissements et testez vos stratégies sans risque.',
    images: [
      {
        url: '/logo_complet_gris.jpg', // Image de partage
        width: 1200,
        height: 630,
        alt: 'FinanceQuest - Simulation de Trading',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'FinanceQuest - Simulation de Trading Historique',
    description: 'Apprenez le trading avec des données réelles historiques. Simulez vos investissements et testez vos stratégies sans risque.',
    images: ['/logo_complet_gris.jpg'],
  },
  
  // Métadonnées supplémentaires
  robots: {
    index: true,
    follow: true,
  },
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}