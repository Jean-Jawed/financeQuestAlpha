/**
 * FINANCEQUEST - PAGE: RESET PASSWORD
 * /[locale]/reset-password : arrivée du lien reçu par email, nouveau mot de passe
 */

import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/password-reset-forms';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { site } = getI18n(locale);
  return pageMetadata({ locale, path: '/reset-password', title: site.seo.resetTitle, noindex: true });
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
