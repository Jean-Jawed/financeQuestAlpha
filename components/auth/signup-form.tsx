/**
 * FINANCEQUEST - COMPONENT: SignupForm
 * Formulaire d'inscription
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n/client';
import { isSafeRedirect } from '@/lib/i18n/paths';
import { randomAvatarId } from '@/lib/profile/avatars';
import { cleanName, nameIssue, PROFILE_LIMITS } from '@/lib/profile/rules';
import { cn } from '@/lib/utils/cn';
import { AuthError, AuthField, PasswordField, SUBMIT_CLASS } from './auth-fields';

type NameStatus = 'idle' | 'checking' | 'available' | 'invalid';

/** Délai avant de vérifier le pseudo pendant la saisie */
const NAME_CHECK_DELAY_MS = 400;

// ==========================================
// COMPONENT
// ==========================================

export function SignupForm() {
  const { m, href, locale } = useI18n();
  const t = m.auth;

  const [name, setName] = useState('');
  const [nameStatus, setNameStatus] = useState<NameStatus>('idle');
  const [nameMessage, setNameMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pseudo : règles vérifiées tout de suite, disponibilité après une courte pause
  useEffect(() => {
    const cleaned = cleanName(name);
    if (!cleaned) {
      setNameStatus('idle');
      setNameMessage('');
      return;
    }

    const issue = nameIssue(cleaned);
    if (issue) {
      setNameStatus('invalid');
      setNameMessage(t.nameIssues[issue]);
      return;
    }

    setNameStatus('checking');
    setNameMessage(t.signup.nameChecking);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/profile/name-available?name=${encodeURIComponent(cleaned)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          // Vérification indisponible : le serveur tranchera à l'inscription
          setNameStatus('idle');
          setNameMessage('');
        } else if (data.available) {
          setNameStatus('available');
          setNameMessage(t.signup.nameAvailable);
        } else {
          setNameStatus('invalid');
          setNameMessage(data.issue === 'taken' ? t.signup.nameTaken : data.error);
        }
      } catch {
        // Requête annulée (nouvelle saisie) ou réseau : rien à afficher
      }
    }, NAME_CHECK_DELAY_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [name, t]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (nameStatus === 'invalid') {
      setError(nameMessage);
      return;
    }

    setLoading(true);

    try {
      // 1. Créer le compte Supabase Auth
      // Le profil public.users est créé par le trigger `on_auth_user_created`
      // à partir de options.data.name (voir docs/reviewOct2026/sql/02_projet_A_structure.sql)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Avatar tiré au hasard dès l'inscription : personne n'apparaît sans visage
          data: { name: cleanName(name), avatar: randomAvatarId(), locale },
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
      // 3. Accueil (« Votre carte d'agent »), puis la page demandée avant l'inscription
      //    (invitation à un groupe…), avec rechargement complet
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      const welcome = href('/welcome');
      window.location.href = isSafeRedirect(redirect) ? `${welcome}?redirect=${encodeURIComponent(redirect)}` : welcome;
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
            minLength={PROFILE_LIMITS.nameMin}
            maxLength={PROFILE_LIMITS.nameMax}
            disabled={loading}
            placeholder={t.signup.namePlaceholder}
            aria-describedby="name-status"
          />
          <p
            id="name-status"
            aria-live="polite"
            className={cn(
              '-mt-3 text-xs',
              nameStatus === 'available' ? 'text-gain' : nameStatus === 'invalid' ? 'text-loss' : 'text-paper-dim'
            )}
          >
            {nameMessage || t.signup.nameHint}
          </p>

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

          <button type="submit" disabled={loading || nameStatus === 'invalid'} className={SUBMIT_CLASS}>
            {loading ? t.signup.submitting : t.signup.submit}
          </button>

          <p className="text-center text-xs text-paper-dim">
            {t.signup.privacy.split('{link}')[0]}
            <Link href={href('/privacy')} className="text-brass underline-offset-4 hover:underline">
              {t.signup.privacyLink}
            </Link>
            {t.signup.privacy.split('{link}')[1]}
          </p>
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
