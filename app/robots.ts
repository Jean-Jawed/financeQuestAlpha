/**
 * FINANCEQUEST - ROBOTS
 * /robots.txt : pages publiques ouvertes, API et pages privées fermées
 */

import type { MetadataRoute } from 'next';
import { LOCALES } from '@/lib/i18n/config';
import { absoluteUrl } from '@/lib/seo';

const PRIVATE_PATHS = ['/dashboard', '/game/', '/admin/', '/login'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', ...LOCALES.flatMap((locale) => PRIVATE_PATHS.map((path) => `/${locale}${path}`))],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
