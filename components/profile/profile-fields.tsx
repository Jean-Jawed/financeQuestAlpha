/**
 * PASTFOLIO - COMPONENT: champs du profil
 * Pays, expérience, enregistrement (partagés par la page profil et l'accueil)
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/lib/i18n/client';
import { INTL_LOCALE } from '@/lib/i18n/config';
import { COUNTRY_CODES, EXPERIENCE_LEVELS, type ExperienceLevel } from '@/lib/profile/rules';
import { cn } from '@/lib/utils/cn';
import type { ProfilePatch, ProfileView } from '@/types/profile';

export const FIELD_CLASS =
  'h-11 w-full rounded border border-line-strong bg-ink px-3 text-paper placeholder:text-paper-faint focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass disabled:cursor-not-allowed disabled:opacity-50';

// ==========================================
// PAYS
// ==========================================

interface CountrySelectProps {
  id: string;
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

/** Liste des pays, nommés et triés dans la langue du site (Intl.DisplayNames) */
export function CountrySelect({ id, value, onChange, disabled }: CountrySelectProps) {
  const { m, locale } = useI18n();
  // Noms et ordre des pays varient entre le serveur (ICU de Node) et le navigateur :
  // la liste complète n'est construite qu'après l'hydratation
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const options = useMemo(() => {
    const names = new Intl.DisplayNames([INTL_LOCALE[locale]], { type: 'region' });
    const collator = new Intl.Collator(INTL_LOCALE[locale]);
    const codes = mounted ? COUNTRY_CODES : value ? [value] : [];
    return codes
      .map((code) => ({ code, name: mounted ? (names.of(code) ?? code) : code }))
      .sort((a, b) => collator.compare(a.name, b.name));
  }, [locale, mounted, value]);

  return (
    <select
      id={id}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value || null)}
      disabled={disabled}
      className={FIELD_CLASS}
    >
      <option value="">{m.profile.identity.noCountry}</option>
      {options.map((option) => (
        <option key={option.code} value={option.code}>
          {option.name}
        </option>
      ))}
    </select>
  );
}

/** Code pays discret à côté d'un pseudo (les drapeaux emoji ne s'affichent pas sous Windows) */
export function CountryTag({ code, className }: { code: string | null | undefined; className?: string }) {
  const { locale } = useI18n();
  if (!code) return null;
  const name = new Intl.DisplayNames([INTL_LOCALE[locale]], { type: 'region' }).of(code) ?? code;

  return (
    // Nom du pays (infobulle) calculé par Intl : peut différer entre serveur et navigateur
    <abbr title={name} suppressHydrationWarning className={cn('label no-underline text-[10px] text-paper-faint', className)}>
      {code}
    </abbr>
  );
}

/** Dé (bouton « au hasard ») : le caractère ⚄ manque dans les polices du site */
export function DiceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={cn('h-4 w-4', className)}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ==========================================
// EXPÉRIENCE
// ==========================================

interface ExperienceChoiceProps {
  value: ExperienceLevel | null;
  onChange: (value: ExperienceLevel | null) => void;
  disabled?: boolean;
}

/** Trois boutons ; recliquer sur le choix actif l'annule */
export function ExperienceChoice({ value, onChange, disabled }: ExperienceChoiceProps) {
  const { m } = useI18n();
  const t = m.profile.experience;

  return (
    <div role="group" aria-label={t.label} className="grid gap-2 sm:grid-cols-3">
      {EXPERIENCE_LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          aria-pressed={value === level}
          disabled={disabled}
          onClick={() => onChange(value === level ? null : level)}
          className={cn(
            'rounded border px-3 py-2.5 text-sm transition-colors',
            value === level ? 'border-brass bg-brass/15 text-brass' : 'border-line-strong text-paper-dim hover:text-paper'
          )}
        >
          {t[level]}
        </button>
      ))}
    </div>
  );
}

// ==========================================
// ENREGISTREMENT
// ==========================================

export type SaveResult = { ok: true; profile: ProfileView } | { ok: false; error: string };

/**
 * Enregistrer une modification du profil, puis mettre l'en-tête à jour
 * (pseudo, avatar) sans recharger la page
 */
export function useSaveProfile() {
  const { m } = useI18n();
  const { user, setUser } = useAuth();

  return useCallback(
    async (patch: ProfilePatch): Promise<SaveResult> => {
      try {
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });
        const data = await res.json();
        if (!res.ok) return { ok: false, error: data.error || m.profile.failed };

        const profile = data.data as ProfileView;
        if (user) {
          setUser({ ...user, name: profile.name, avatarId: profile.avatarId, onboardingDone: profile.onboardingDone });
        }
        return { ok: true, profile };
      } catch {
        return { ok: false, error: m.common.networkError };
      }
    },
    [m, user, setUser]
  );
}
