/**
 * FINANCEQUEST - PAGE: SIGNUP
 * /[locale]/signup
 */

import type { Metadata } from 'next';
import { SignupForm } from '@/components/auth/signup-form';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo';

// Page d'arrivée des appels à jouer : indexée, avec sa propre description
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { site } = getI18n(locale);
  return pageMetadata({
    locale,
    path: '/signup',
    title: site.seo.signupTitle,
    description: site.seo.signupDescription,
  });
}

export default function SignupPage() {
  return <SignupForm />;
}
