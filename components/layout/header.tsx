/**
 * FINANCEQUEST - COMPONENT: Header
 * En-tête : sceau, navigation en capitales condensées, langue, son, joueur
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/brand/logo';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { SoundToggle } from '@/components/layout/sound-toggle';
import { useI18n } from '@/lib/i18n/client';
import { stripLocale } from '@/lib/i18n/paths';
import { cn } from '@/lib/utils/cn';
import { MobileNav } from './mobile-nav';

// ==========================================
// NAVIGATION
// ==========================================

/** Chemins sans langue ; libellés dans le dictionnaire (ui.nav) */
export const NAV_ITEMS = [
  { path: '/dashboard', key: 'dashboard' },
  { path: '/leaderboard', key: 'leaderboard' },
  { path: '/about', key: 'game' },
  { path: '/mag', key: 'mag' },
] as const;

// ==========================================
// COMPONENT
// ==========================================

export function Header() {
  const { m, href } = useI18n();
  const pathname = stripLocale(usePathname());
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-line bg-ink/95">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-6">
            <Link href={href(user ? '/dashboard' : '/')} aria-label={user ? m.nav.homeLabel : m.nav.backHome}>
              <Logo size="md" />
            </Link>

            <nav className="hidden h-full items-stretch gap-1 md:flex" aria-label={m.nav.main}>
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
                return (
                  <Link
                    key={item.path}
                    href={href(item.path)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative flex items-center px-3 font-label text-sm font-semibold uppercase tracking-label transition-colors lg:px-4',
                      active ? 'text-brass' : 'text-paper-dim hover:text-paper'
                    )}
                  >
                    {m.nav[item.key]}
                    {active && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-brass lg:inset-x-4" />}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <SoundToggle className="hidden md:inline-flex" />

              {/* Visiteur sur une page publique (magazine, FAQ) : accès à la connexion */}
              {!user && !loading && (
                <Link
                  href={href('/login')}
                  className="hidden whitespace-nowrap font-label text-sm font-semibold uppercase tracking-label text-brass transition-colors hover:text-brass-bright md:block"
                >
                  {m.nav.login}
                </Link>
              )}

              {user && (
                <>
                  <span className="hidden text-right leading-tight xl:block">
                    <span className="label block text-[10px]">{m.nav.broker}</span>
                    <span className="font-display text-sm italic text-paper">{user.name}</span>
                  </span>
                  <button
                    onClick={logout}
                    className="hidden font-label text-xs font-semibold uppercase tracking-label text-paper-dim transition-colors hover:text-loss md:block"
                  >
                    {m.nav.logout}
                  </button>
                </>
              )}

              <button
                className="p-2 text-paper-dim hover:text-paper md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label={m.nav.openMenu}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <line x1="4" x2="20" y1="7" y2="7" />
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="17" y2="17" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={user ? logout : undefined}
        showLogin={!user && !loading}
      />
    </>
  );
}
