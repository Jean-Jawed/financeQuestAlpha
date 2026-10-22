/**
 * FINANCEQUEST - COMPONENT: SignupForm
 * Formulaire d'inscription
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n/client';
import { AuthError, AuthField, PasswordField, SUBMIT_CLASS } from './auth-fields';

// ==========================================
// COMPONENT
// ==========================================

export function SignupForm() {
  const { m, href } = useI18n();
  const t = m.auth;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Créer le compte Supabase Auth
      // Le profil public.users est créé par le trigger `on_auth_user_created`
      // à partir de options.data.name (voir docs/reviewOct2026/sql/02_projet_A_structure.sql)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name.trim() },
        },
      });

      if (authError) {
        // Messages Supabase traduits par leur code ; repli générique sinon
        if (authError.code === 'user_already_exists' || authError.message.includes('already registered')) {
          setError(t.signup.emailTaken);
        } else if (authError.code === 'weak_password') {
          setError(t.signup.weakPassword);
        } else if (authError.code === 'email_address_invalid' || authError.code === 'validation_failed') {
          setError(t.signup.invalidEmail);
        } else {
          setError(t.signup.failed);
        }

        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError(t.signup.failed);
        setLoading(false);
        return;
      }

      // 2. Supabase connecte le joueur dans la foulée : cookies de session déjà posés
      // 3. Redirection avec rechargement complet
      window.location.href = href('/dashboard');
    } catch (err) {
      console.error('[SignupForm] Unexpected error:', err);
      setError(m.common.networkError);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md animate-rise">
      <div className="certificate p-8 sm:p-10">
        <div className="mb-8">
          <p className="label mb-3 text-brass">{t.register}</p>
          <h1 className="mb-2 font-display text-4xl font-semibold text-paper">{t.signup.title}</h1>
          <p className="text-paper-dim">{t.signup.intro}</p>
        </div>

        {error && <AuthError message={error} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthField
            id="name"
            type="text"
            autoComplete="nickname"
            label={t.signup.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={50}
            disabled={loading}
            placeholder={t.signup.namePlaceholder}
          />

          <AuthField
            id="email"
            type="email"
            autoComplete="email"
            label={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder={t.emailPlaceholder}
          />

          <PasswordField
            id="password"
            autoComplete="new-password"
            label={t.password}
            hint={t.signup.passwordHint}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />

          <button type="submit" disabled={loading} className={SUBMIT_CLASS}>
            {loading ? t.signup.submitting : t.signup.submit}
          </button>
        </form>

        <div className="mt-8 border-t border-line pt-6 text-center">
          <p className="text-sm text-paper-dim">
            {t.signup.hasAccount}{' '}
            <Link href={href('/login')} className="font-medium text-brass underline-offset-4 hover:text-brass-bright hover:underline">
              {t.signup.loginLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
