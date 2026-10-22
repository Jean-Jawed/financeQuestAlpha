/**
 * FINANCEQUEST - LAYOUT RACINE PAR LANGUE
 * /fr/… et /en/… : polices, langue du document, traductions, identité du site
 */

import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Barlow_Condensed, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { I18nProvider } from '@/lib/i18n/client';
import { LOCALES, type Locale } from '@/lib/i18n/config';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { localizePath } from '@/lib/i18n/paths';
import { JsonLd } from '@/components/seo/json-ld';
import { absoluteUrl, getSiteUrl, pageMetadata } from '@/lib/seo';
import '../globals.css';

// Polices auto-hébergées par next/font (pas de requête bloquante, pas de saut au chargement)
const display = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const label = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-label',
  display: 'swap',
});

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

/** Les deux langues sont générées à la construction (pages publiques statiques) */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { site } = getI18n(locale);

  return {
    metadataBase: new URL(getSiteUrl()),
    ...pageMetadata({ locale, path: '/', title: site.seo.defaultTitle, absoluteTitle: true }),
    title: {
      default: site.seo.defaultTitle,
      template: `%s · ${site.seo.siteName}`,
    },
    keywords: site.seo.keywords,
    applicationName: site.seo.siteName,
    creator: 'Virgule Studio',
    publisher: 'Virgule Studio',
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F1D19',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale: Locale = await resolveLocale(params);
  const { ui, site } = getI18n(locale);
  const home = absoluteUrl(localizePath(locale, '/'));

  return (
    <html lang={locale} className={`${display.variable} ${label.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <JsonLd
          data={[
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': `${getSiteUrl()}/#studio`,
              name: 'Virgule Studio',
              url: 'https://virgule-studio.fr',
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': `${home}#website`,
              name: site.seo.siteName,
              url: home,
              inLanguage: locale,
              description: site.seo.defaultDescription,
              publisher: { '@id': `${getSiteUrl()}/#studio` },
            },
          ]}
        />
        <I18nProvider locale={locale} messages={ui}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
