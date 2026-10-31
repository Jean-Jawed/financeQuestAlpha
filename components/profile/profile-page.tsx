/**
 * FINANCEQUEST - COMPONENT: ProfilePage
 * Page « Mon profil » : carte d'agent, préférences, confidentialité, compte,
 * zone sensible, carrière. Chaque section s'enregistre séparément.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Rosette } from '@/components/brand/guilloche';
import { Button } from '@/components/ui/button';
import { PerformanceBadge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n/client';
import { LOCALES, LOCALE_SWITCH_LABELS, INTL_LOCALE, type Locale } from '@/lib/i18n/config';
import { switchLocalePath } from '@/lib/i18n/paths';
import { GAME_CURRENCIES, type GameCurrency } from '@/lib/game/currency';
import { getScenario, type ScenarioId } from '@/lib/game/scenarios';
import { randomAvatarId } from '@/lib/profile/avatars';
import { PROFILE_LIMITS, type ExperienceLevel } from '@/lib/profile/rules';
import { cn } from '@/lib/utils/cn';
import { AvatarPicker } from './avatar-picker';
import { PlayerAvatar } from './player-avatar';
import { XpBar } from '@/components/xp/xp-feedback';
import { CountrySelect, DiceIcon, CountryTag, ExperienceChoice, FIELD_CLASS, useSaveProfile } from './profile-fields';
import type { CareerStats, ProfileView } from '@/types/profile';

interface ProfilePageProps {
  profile: ProfileView;
  career: CareerStats;
}

export function ProfilePage({ profile: initial, career }: ProfilePageProps) {
  const [profile, setProfile] = useState(initial);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <div className="space-y-8">
        <IdentitySection profile={profile} onSaved={setProfile} />
        <div className="grid gap-8 md:grid-cols-2">
          <PreferencesSection profile={profile} onSaved={setProfile} />
          <CareerSection career={career} />
        </div>
        <PrivacySection profile={profile} onSaved={setProfile} />
        <AccountSection profile={profile} />
        <DangerSection profile={profile} />
      </div>
    </div>
  );
}

// ==========================================
// SECTIONS
// ==========================================

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('panel p-6', className)} aria-label={title}>
      <h2 className="label text-brass">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

interface EditableProps {
  profile: ProfileView;
  onSaved: (profile: ProfileView) => void;
}

/** Carte d'agent : avatar (enregistré dès qu'il est choisi), pseudo, devise, pays */
function IdentitySection({ profile, onSaved }: EditableProps) {
  const { m, f, fmt } = useI18n();
  const t = m.profile;
  const { toast } = useToast();
  const save = useSaveProfile();

  const [name, setName] = useState(profile.name);
  const [motto, setMotto] = useState(profile.motto ?? '');
  const [country, setCountry] = useState(profile.country);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const nameLocked = profile.nextNameChange !== null;
  const dirty = name.trim() !== profile.name || motto.trim() !== (profile.motto ?? '') || country !== profile.country;

  async function saveAvatar(avatarId: string) {
    setPickerOpen(false);
    const result = await save({ avatarId });
    if (result.ok) onSaved(result.profile);
    else toast.error(result.error);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const result = await save({
      ...(name.trim() !== profile.name && { name }),
      motto: motto.trim() || null,
      country,
    });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onSaved(result.profile);
    setName(result.profile.name);
    toast.success(t.saved);
  }

  return (
    <section className="certificate relative overflow-hidden p-6 sm:p-8" aria-label={t.identity.title}>
      <Rosette size={420} strands={18} strokeWidth={0.35} className="absolute -right-36 -top-36 text-brass/10" />

      <div className="relative">
        <p className="label text-brass">{t.identity.title}</p>

        <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-3">
            <PlayerAvatar avatarId={profile.avatarId} name={profile.name} size={128} className="ring-2 ring-brass" />
            <div className="flex flex-col items-center gap-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                {t.identity.changeAvatar}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => saveAvatar(randomAvatarId(profile.avatarId))}>
                <DiceIcon className="mr-1.5" />
                  {t.identity.random}
              </Button>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-4xl font-semibold text-paper">
              {profile.name} <CountryTag code={profile.country} className="ml-1 align-middle text-xs" />
            </h1>
            {profile.motto && <p className="mt-1 font-display text-lg italic text-paper-dim">« {profile.motto} »</p>}
            <p className="label mt-2 text-[10px]">{fmt(t.memberSince, { date: f.date(profile.createdAt.slice(0, 10)) })}</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="profile-name" className="label mb-2 block">
                  {t.identity.name}
                </label>
                <input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={PROFILE_LIMITS.nameMax}
                  disabled={nameLocked || saving}
                  className={FIELD_CLASS}
                  autoComplete="nickname"
                />
                <p className="mt-1 text-xs text-paper-dim">
                  {nameLocked
                    ? fmt(t.identity.nameLocked, { date: f.date(profile.nextNameChange!.slice(0, 10)) })
                    : t.identity.nameHint}
                </p>
              </div>

              <div>
                <label htmlFor="profile-motto" className="label mb-2 block">
                  {t.identity.motto}
                </label>
                <input
                  id="profile-motto"
                  value={motto}
                  onChange={(event) => setMotto(event.target.value)}
                  maxLength={PROFILE_LIMITS.mottoMax}
                  placeholder={t.identity.mottoPlaceholder}
                  disabled={saving}
                  className={FIELD_CLASS}
                />
                <p className="mt-1 text-xs text-paper-dim">{t.identity.mottoHint}</p>
              </div>

              <div>
                <label htmlFor="profile-country" className="label mb-2 block">
                  {t.identity.country}
                </label>
                <CountrySelect id="profile-country" value={country} onChange={setCountry} disabled={saving} />
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={saving} disabled={!dirty}>
                  {t.save}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <AvatarPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={profile.avatarId}
        name={profile.name}
        onChoose={saveAvatar}
      />
    </section>
  );
}

/** Devise de jeu préférée, langue, expérience */
function PreferencesSection({ profile, onSaved }: EditableProps) {
  const { m, locale } = useI18n();
  const t = m.profile;
  const { toast } = useToast();
  const save = useSaveProfile();
  const router = useRouter();
  const pathname = usePathname();

  const [currency, setCurrency] = useState<GameCurrency | null>(profile.preferredCurrency);
  const [language, setLanguage] = useState<Locale>(profile.locale ?? locale);
  const [experience, setExperience] = useState<ExperienceLevel | null>(profile.experience);
  const [saving, setSaving] = useState(false);

  const currencyNames = new Intl.DisplayNames([INTL_LOCALE[locale]], { type: 'currency' });
  const dirty =
    currency !== profile.preferredCurrency || language !== (profile.locale ?? locale) || experience !== profile.experience;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const result = await save({ preferredCurrency: currency, locale: language, experience });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onSaved(result.profile);
    toast.success(t.saved);
    // Nouvelle langue : afficher la même page dans cette langue
    if (language !== locale) router.push(switchLocalePath(pathname, language));
  }

  return (
    <Section title={t.preferences.title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="profile-currency" className="label mb-2 block">
            {t.preferences.currency}
          </label>
          <select
            id="profile-currency"
            value={currency ?? ''}
            onChange={(event) => setCurrency((event.target.value || null) as GameCurrency | null)}
            className={FIELD_CLASS}
          >
            <option value="">{t.preferences.noCurrency}</option>
            {GAME_CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code} · {currencyNames.of(code)}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-paper-dim">{t.preferences.currencyHint}</p>
        </div>

        <div>
          <label htmlFor="profile-language" className="label mb-2 block">
            {t.preferences.language}
          </label>
          <select
            id="profile-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as Locale)}
            className={FIELD_CLASS}
          >
            {LOCALES.map((code) => (
              <option key={code} value={code}>
                {LOCALE_SWITCH_LABELS[code]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="label mb-2">{t.experience.label}</p>
          <ExperienceChoice value={experience} onChange={setExperience} disabled={saving} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={saving} disabled={!dirty}>
            {t.save}
          </Button>
        </div>
      </form>
    </Section>
  );
}

/** Profil public : enregistré au changement */
function PrivacySection({ profile, onSaved }: EditableProps) {
  const { m, href } = useI18n();
  const t = m.profile.privacy;
  const { toast } = useToast();
  const save = useSaveProfile();
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    const result = await save({ profilePublic: !profile.profilePublic });
    setSaving(false);
    if (result.ok) onSaved(result.profile);
    else toast.error(result.error);
  }

  return (
    <Section title={t.title}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <p id="profile-public-label" className="text-paper">
            {t.public}
          </p>
          <p className="mt-1 text-sm text-paper-dim">{t.publicHint}</p>
          <Link href={href('/privacy')} className="mt-2 inline-block text-sm text-brass underline-offset-4 hover:underline">
            {t.policy}
          </Link>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={profile.profilePublic}
          aria-labelledby="profile-public-label"
          onClick={toggle}
          disabled={saving}
          className={cn(
            'relative mt-1 h-7 w-12 shrink-0 rounded-full border transition-colors disabled:opacity-50',
            profile.profilePublic ? 'border-brass bg-brass/30' : 'border-line-strong bg-ink'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-5 w-5 rounded-full transition-all',
              profile.profilePublic ? 'left-6 bg-brass' : 'left-0.5 bg-paper-faint'
            )}
          />
        </button>
      </div>
    </Section>
  );
}

/** Email et mot de passe (Supabase Auth, côté navigateur), déconnexion */
function AccountSection({ profile }: { profile: ProfileView }) {
  const { m, locale, href } = useI18n();
  const t = m.profile.account;
  const { toast } = useToast();
  const { logout } = useAuth();

  const [email, setEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  async function changeEmail(event: React.FormEvent) {
    event.preventDefault();
    if (email.trim().toLowerCase() === profile.email.toLowerCase()) {
      toast.error(t.sameEmail);
      return;
    }
    setEmailSaving(true);
    const { error } = await supabase.auth.updateUser(
      { email: email.trim() },
      { emailRedirectTo: `${window.location.origin}${href('/profile')}` }
    );
    setEmailSaving(false);
    if (error) {
      toast.error(t.emailFailed);
      return;
    }
    setEmail('');
    toast.success(t.emailSent, 8000);
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setPasswordSaving(true);
    try {
      // Vérifier l'ancien mot de passe avant d'accepter le nouveau
      const check = await supabase.auth.signInWithPassword({ email: profile.email, password: current });
      if (check.error) {
        toast.error(t.wrongPassword);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) {
        toast.error(error.code === 'weak_password' ? m.auth.reset.weak : m.auth.reset.failed);
        return;
      }
      setCurrent('');
      setNext('');
      toast.success(t.passwordChanged);
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <Section title={t.title}>
      <div className="grid gap-8 md:grid-cols-2">
        <form onSubmit={changeEmail} className="space-y-3">
          <p className="label">{t.email}</p>
          <p className="truncate text-paper" lang={locale}>
            {profile.email}
          </p>
          <label htmlFor="profile-email" className="sr-only">
            {t.newEmail}
          </label>
          <input
            id="profile-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t.newEmail}
            required
            disabled={emailSaving}
            className={FIELD_CLASS}
          />
          <Button type="submit" variant="secondary" size="sm" loading={emailSaving} disabled={!email.trim()}>
            {t.changeEmail}
          </Button>
        </form>

        <form onSubmit={changePassword} className="space-y-3">
          <p className="label">{t.changePassword}</p>
          <input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
            placeholder={t.currentPassword}
            aria-label={t.currentPassword}
            required
            disabled={passwordSaving}
            className={FIELD_CLASS}
          />
          <input
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(event) => setNext(event.target.value)}
            placeholder={t.newPassword}
            aria-label={t.newPassword}
            minLength={6}
            required
            disabled={passwordSaving}
            className={FIELD_CLASS}
          />
          <Button type="submit" variant="secondary" size="sm" loading={passwordSaving} disabled={!current || next.length < 6}>
            {t.changePassword}
          </Button>
        </form>
      </div>

      <div className="mt-6 border-t border-line pt-4">
        <Button type="button" variant="ghost" size="sm" onClick={logout}>
          {t.logout}
        </Button>
      </div>
    </Section>
  );
}

/** Suppression du compte, confirmée en tapant son pseudo */
function DangerSection({ profile }: { profile: ProfileView }) {
  const { m, fmt, href } = useI18n();
  const t = m.profile.danger;
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(event: React.FormEvent) {
    event.preventDefault();
    setDeleting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmName }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t.failed);
        setDeleting(false);
        return;
      }
      // Rechargement complet : le compte et la session n'existent plus
      window.location.href = href('/');
    } catch {
      toast.error(m.common.networkError);
      setDeleting(false);
    }
  }

  const matches = confirmName.trim().toLowerCase() === profile.name.toLowerCase();

  return (
    <section className="rounded border border-loss/40 p-6" aria-label={t.title}>
      <h2 className="label text-loss">{t.title}</h2>
      <p className="mt-3 text-sm text-paper-dim">{t.text}</p>

      {!open ? (
        <Button type="button" variant="outline" size="sm" className="mt-4 border-loss/60 text-loss hover:bg-loss/10" onClick={() => setOpen(true)}>
          {t.delete}
        </Button>
      ) : (
        <form onSubmit={handleDelete} className="mt-4 space-y-3">
          <label htmlFor="profile-delete" className="block text-sm text-paper">
            {fmt(t.confirm, { name: profile.name })}
          </label>
          <input
            id="profile-delete"
            value={confirmName}
            onChange={(event) => setConfirmName(event.target.value)}
            autoComplete="off"
            disabled={deleting}
            className={cn(FIELD_CLASS, 'max-w-sm')}
          />
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={deleting}>
              {m.common.cancel}
            </Button>
            <Button type="submit" variant="danger" size="sm" loading={deleting} disabled={!matches}>
              {t.confirmButton}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

/** Statistiques de toutes les parties (lecture seule) */
function CareerSection({ career }: { career: CareerStats }) {
  const { m, f, fmt } = useI18n();
  const t = m.profile.career;
  const { user } = useAuth();
  // L'en-tête suit les gains en direct ; la page, ce qui a été lu au chargement
  const xpTotal = Math.max(user?.xpTotal ?? 0, career.xpTotal);

  const stats = [
    { label: t.games, value: career.games },
    { label: t.completed, value: career.completed },
    { label: t.achievements, value: career.achievements },
    { label: t.groups, value: career.groups },
  ];

  return (
    <Section title={t.title}>
      <XpBar xpTotal={xpTotal} withLabel className="mb-1" />
      <p className="num mb-5 text-right text-xs text-paper-dim">{fmt(m.xp.total, { xp: f.number(xpTotal, 0) })}</p>

      <dl className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded border border-line bg-ink px-3 py-2">
            <dt className="label text-[10px]">{stat.label}</dt>
            <dd className="num mt-0.5 text-xl font-semibold text-paper">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <h3 className="label mt-5 text-[10px]">{t.best}</h3>
      {career.bestByScenario.length === 0 ? (
        <p className="mt-2 text-sm text-paper-dim">{t.none}</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {career.bestByScenario.map((entry) => (
            <li key={entry.scenario} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="text-paper">{m.scenarios[getScenario(entry.scenario).id as ScenarioId].name}</span>
              <PerformanceBadge value={entry.returnPercentage} />
            </li>
          ))}
        </ul>
      )}

      <h3 className="label mt-5 text-[10px]">{m.xp.journal}</h3>
      {career.recentXp.length === 0 ? (
        <p className="mt-2 text-sm text-paper-dim">{m.xp.journalEmpty}</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm">
          {career.recentXp.map((entry, index) => (
            <li key={`${entry.createdAt}-${index}`} className="flex items-center justify-between gap-3">
              <span className="truncate text-paper-dim">{m.xp.kinds[entry.kind] ?? entry.kind}</span>
              <span className="num shrink-0 text-xp-bright">+{entry.xp}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
