/**
 * PASTFOLIO - COMPONENT: mot de passe oublié et nouveau mot de passe
 * 1. ForgotPasswordForm : Supabase envoie un lien vers /reset-password
 * 2. ResetPasswordForm : le lien ouvre une session de récupération (échange
 *    du code par le client Supabase), puis le joueur choisit son mot de passe
 * L'adresse /[locale]/reset-password doit figurer dans les « Redirect URLs »
 * de Supabase (Authentication → URL Configuration).
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n/client';
import { AuthError, AuthField, PasswordField, SUBMIT_CLASS } from './auth-fields';

function Frame({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  const { m } = useI18n();

  return (
    <div className="mx-auto w-full max-w-md animate-rise">
      <div className="certificate p-8 sm:p-10">
        <div className="mb-8">
          <p className="label mb-3 text-brass">{m.auth.register}</p>
          <h1 className="mb-2 font-display text-4xl font-semibold text-paper">{title}</h1>
          <p className="text-paper-dim">{intro}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

// ==========================================
// MOT DE PASSE OUBLIÉ
// ==========================================

export function ForgotPasswordForm() {
  const { m, href } = useI18n();
  const t = m.auth.forgot;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}${href('/reset-password')}`,
    });
    setLoading(false);

    // Même réponse que l'adresse existe ou non : ne pas révéler les comptes
    if (resetError && resetError.status !== 400) {
      setError(t.failed);
      return;
    }
    setSent(true);
  }

  return (
    <Frame title={t.title} intro={t.intro}>
      {error && <AuthError message={error} />}

      {sent ? (
        <p className="rounded border border-gain/40 bg-gain/10 px-4 py-3 text-sm text-paper">{t.sent}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthField
            id="email"
            type="email"
            autoComplete="email"
            label={m.auth.email}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={loading}
            placeholder={m.auth.emailPlaceholder}
          />
          <button type="submit" disabled={loading} className={SUBMIT_CLASS}>
            {loading ? t.submitting : t.submit}
          </button>
        </form>
      )}

      <div className="mt-8 border-t border-line pt-6 text-center">
        <Link href={href('/login')} className="text-sm font-medium text-brass underline-offset-4 hover:text-brass-bright hover:underline">
          {t.back}
        </Link>
      </div>
    </Frame>
  );
}

// ==========================================
// NOUVEAU MOT DE PASSE
// ==========================================

export function ResetPasswordForm() {
  const { m, href } = useI18n();
  const t = m.auth.reset;

  const [state, setState] = useState<'checking' | 'ready' | 'invalid'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Le client Supabase échange le code du lien contre une session à son
  // initialisation : getSession() attend la fin de cet échange
  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);

    (async () => {
      if (params.get('error') || params.get('error_description')) {
        if (!cancelled) setState('invalid');
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!cancelled) setState(data.session ? 'ready' : 'invalid');
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (password !== confirm) {
      setError(t.mismatch);
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.code === 'weak_password' ? t.weak : t.failed);
      setLoading(false);
      return;
    }

    // Connecté avec le nouveau mot de passe : rechargement complet vers le tableau de bord
    window.location.href = href('/dashboard');
  }

  return (
    <Frame title={t.title} intro={state === 'ready' ? t.intro : state === 'checking' ? t.checking : t.invalid}>
      {error && <AuthError message={error} />}

      {state === 'ready' && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordField
            id="password"
            autoComplete="new-password"
            label={t.password}
            hint={m.auth.signup.passwordHint}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
          <PasswordField
            id="confirm"
            autoComplete="new-password"
            label={t.confirm}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
          <button type="submit" disabled={loading} className={SUBMIT_CLASS}>
            {loading ? t.submitting : t.submit}
          </button>
        </form>
      )}

      {state === 'invalid' && (
        <Link href={href('/forgot-password')} className={`${SUBMIT_CLASS} flex items-center justify-center`}>
          {t.retry}
        </Link>
      )}
    </Frame>
  );
}
