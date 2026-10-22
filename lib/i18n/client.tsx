/**
 * FINANCEQUEST - I18N: CÔTÉ CLIENT
 * Fournisseur de traductions (posé par le layout de langue) et hook useI18n
 */

'use client';

import { createContext, useContext, useMemo } from 'react';
import type { Locale } from './config';
import { createFormatters, fmt, plural } from './format';
import type { UiMessages } from './messages/types';
import { localizePath } from './paths';

interface I18nContextValue {
  locale: Locale;
  messages: UiMessages;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  messages,
  children,
}: I18nContextValue & { children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Textes, formats et liens de la langue courante
 *
 * @example
 * const { m, f, fmt, href } = useI18n();
 * <Link href={href('/dashboard')}>{m.nav.dashboard}</Link>
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n doit être utilisé sous <I18nProvider>');
  }

  const { locale, messages } = context;
  const f = useMemo(() => createFormatters(locale), [locale]);

  return {
    locale,
    m: messages,
    f,
    fmt,
    plural: (count: number, one: string, other: string) => plural(locale, count, one, other),
    href: (path: string) => localizePath(locale, path),
  };
}
