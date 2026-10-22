/**
 * FINANCEQUEST - COMPONENT: Footer
 * Pied de page : bande guillochée, liens, mentions
 */

'use client';

import Link from 'next/link';
import { GuillocheBand } from '@/components/brand/guilloche';
import { useI18n } from '@/lib/i18n/client';

const FOOTER_LINKS = [
  { path: '/about', key: 'game' },
  { path: '/mag', key: 'mag' },
  { path: '/faq', key: 'faq' },
  { path: '/leaderboard', key: 'leaderboard' },
] as const;

export function Footer() {
  const { m, href } = useI18n();

  return (
    <footer className="mt-auto">
      <GuillocheBand className="text-brass/25" height={22} />
      <div className="border-t border-line bg-ink">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-paper-dim md:flex-row">
          <p className="label">{m.footer.tagline}</p>

          <nav aria-label={m.nav.main} className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.path}
                href={href(link.path)}
                className="font-label text-xs font-semibold uppercase tracking-label text-paper-dim transition-colors hover:text-paper"
              >
                {m.nav[link.key]}
              </Link>
            ))}
          </nav>

          <p className="text-center md:text-right">
            {m.footer.createdBy}{' '}
            <a
              href="https://virgule-studio.fr"
              target="_blank"
              rel="noopener"
              className="font-display italic text-paper underline decoration-brass/50 underline-offset-4 transition-colors hover:text-brass"
            >
              Virgule Studio
            </a>
            . {m.footer.realPrices}
          </p>
        </div>
      </div>
    </footer>
  );
}
