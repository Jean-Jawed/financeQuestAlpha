/**
 * FINANCEQUEST - COMPONENT: MobileNav
 * Menu plein écran sur mobile
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/brand/logo';
import { GuillocheBand } from '@/components/brand/guilloche';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { SoundToggle } from '@/components/layout/sound-toggle';
import { useI18n } from '@/lib/i18n/client';
import { stripLocale } from '@/lib/i18n/paths';
import { cn } from '@/lib/utils/cn';
import { NAV_ITEMS } from './header';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  /** Visiteur non connecté : lien de connexion */
  showLogin?: boolean;
}

export function MobileNav({ isOpen, onClose, onLogout, showLogin = false }: MobileNavProps) {
  const { m, href } = useI18n();
  const pathname = stripLocale(usePathname());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade flex-col bg-ink md:hidden">
      <div className="flex h-16 items-center justify-between border-b border-line px-4">
        <Logo size="md" />
        <button className="p-2 text-paper-dim hover:text-paper" onClick={onClose} aria-label={m.nav.closeMenu}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-6 py-10" aria-label={m.nav.main}>
        {NAV_ITEMS.map((item, index) => (
          <Link
            key={item.path}
            href={href(item.path)}
            onClick={onClose}
            className={cn(
              'flex items-baseline gap-4 border-b border-line py-5 font-display text-3xl transition-colors',
              pathname === item.path ? 'text-brass' : 'text-paper hover:text-brass'
            )}
          >
            <span className="num text-sm text-paper-faint">{String(index + 1).padStart(2, '0')}</span>
            {m.nav[item.key]}
          </Link>
        ))}

        <div className="mt-10 flex items-center justify-between gap-6">
          <LanguageSwitcher size="lg" />
          <SoundToggle withLabel />
        </div>

        {showLogin && (
          <Link
            href={href('/login')}
            onClick={onClose}
            className="mt-10 self-start font-label text-lg font-semibold uppercase tracking-label text-brass hover:text-brass-bright"
          >
            {m.nav.login}
          </Link>
        )}

        {onLogout && (
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="mt-10 self-start font-label text-sm font-semibold uppercase tracking-label text-paper-dim hover:text-loss"
          >
            {m.nav.logout}
          </button>
        )}
      </nav>

      <GuillocheBand className="text-brass/30" height={28} />
    </div>
  );
}
