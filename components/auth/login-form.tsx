/**
 * FINANCEQUEST - COMPONENT: LoginForm
 * Formulaire de connexion
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n/client';
import { isSafeRedirect } from '@/lib/i18n/paths';
import { AuthError, AuthField, PasswordField, SUBMIT_CLASS } from './auth-fields';

// ==========================================
// COMPONENT
// ==========================================

export function LoginForm() {
  const { m, href } = useI18n();
  const t = m.auth;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authentification directe côté client
      // (ne jamais logger `data` : il contient access_token et refresh_token)
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(t.login.invalid);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError(t.login.failed);
        setLoading(false);
        return;
      }

      // Redirection avec rechargement complet (pour que le proxy lise les cookies)
      // vers la page demandée avant connexion (?redirect=, posé par le proxy),
      // uniquement si c'est un chemin interne (pas de redirection ouverte)
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      window.location.href = isSafeRedirect(redirect) ? redirect : href('/dashboard');
    } catch (err) {
      console.error('[LoginForm] Unexpected error:', err);
      setError(m.common.networkError);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md animate-rise">
      <div className="certificate p-8 sm:p-10">
        <div className="mb-8">
          <p className="label mb-3 text-brass">{t.register}</p>
          <h1 className="mb-2 font-display text-4xl font-semibold text-paper">{t.login.title}</h1>
          <p className="text-paper-dim">{t.login.intro}</p>
        </div>

        {error && <AuthError message={error} />}

        <form onSubmit={handleSubmit} className="space-y-5">
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
            autoComplete="current-password"
            label={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading} className={SUBMIT_CLASS}>
            {loading ? t.login.submitting : t.login.submit}
          </button>
        </form>

        <div className="mt-8 border-t border-line pt-6 text-center">
          <p className="text-sm text-paper-dim">
            {t.login.noAccount}{' '}
            <Link href={href('/signup')} className="font-medium text-brass underline-offset-4 hover:text-brass-bright hover:underline">
              {t.login.signupLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
