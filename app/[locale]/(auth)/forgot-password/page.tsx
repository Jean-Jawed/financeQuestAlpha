/**
 * FINANCEQUEST - PAGE: FORGOT PASSWORD
 * /[locale]/forgot-password : demande d'un lien de réinitialisation
 */

import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/password-reset-forms';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { site } = getI18n(locale);
  return pageMetadata({ locale, path: '/forgot-password', title: site.seo.forgotTitle, noindex: true });
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
