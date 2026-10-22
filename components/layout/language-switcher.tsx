/**
 * FINANCEQUEST - COMPONENT: LanguageSwitcher
 * « FR · EN » : même page dans l'autre langue (chemin et paramètres conservés)
 */

'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useI18n } from '@/lib/i18n/client';
import { LOCALES, LOCALE_SWITCH_LABELS } from '@/lib/i18n/config';
import { switchLocalePath } from '@/lib/i18n/paths';
import { cn } from '@/lib/utils/cn';

interface LanguageSwitcherProps {
  className?: string;
  /** Taille du texte : compacte dans les en-têtes, plus grande dans le menu mobile */
  size?: 'sm' | 'lg';
  /**
   * Adresses de la page dans chaque langue, quand elles diffèrent
   * (articles du magazine aux adresses traduites)
   */
  paths?: Partial<Record<(typeof LOCALES)[number], string>>;
}

function Switcher({ className, size = 'sm', paths }: LanguageSwitcherProps) {
  const { locale, m } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return (
    <nav aria-label={m.language.label} className={cn('flex items-center', className)}>
      {LOCALES.map((target, index) => {
        const active = target === locale;
        const href = `${paths?.[target] ?? switchLocalePath(pathname, target)}${query ? `?${query}` : ''}`;

        return (
          <span key={target} className="flex items-center">
            {index > 0 && (
              <span aria-hidden="true" className="px-1.5 text-paper-faint">
                ·
              </span>
            )}
            {active ? (
              <span
                aria-current="true"
                className={cn(
                  'font-label font-semibold uppercase tracking-label text-brass underline decoration-brass/60 underline-offset-[6px]',
                  size === 'lg' ? 'text-lg' : 'text-sm'
                )}
              >
                {target}
              </span>
            ) : (
              <Link
                href={href}
                hrefLang={target}
                lang={target}
                // Le prochain rendu se fait dans l'autre langue : pas de cache client
                prefetch={false}
                title={LOCALE_SWITCH_LABELS[target]}
                aria-label={LOCALE_SWITCH_LABELS[target]}
                className={cn(
                  'font-label font-semibold uppercase tracking-label text-paper-dim transition-colors hover:text-paper',
                  size === 'lg' ? 'text-lg' : 'text-sm'
                )}
              >
                {target}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function LanguageSwitcher(props: LanguageSwitcherProps) {
  // useSearchParams exige une frontière Suspense sur les pages statiques
  return (
    <Suspense fallback={<span className={cn('h-5 w-14', props.className)} />}>
      <Switcher {...props} />
    </Suspense>
  );
}
