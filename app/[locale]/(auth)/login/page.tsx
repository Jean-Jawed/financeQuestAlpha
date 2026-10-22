/**
 * FINANCEQUEST - PAGE: LOGIN
 * /[locale]/login
 */

import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { site } = getI18n(locale);
  return pageMetadata({ locale, path: '/login', title: site.seo.loginTitle, noindex: true });
}

export default function LoginPage() {
  return <LoginForm />;
}
