/**
 * FINANCEQUEST - COMPONENT: WelcomeOnboarding
 * Accueil après inscription : « Votre carte d'agent », entièrement facultatif.
 * L'avatar tiré au hasard est déjà en place ; « Plus tard » ne garde que lui.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rosette } from '@/components/brand/guilloche';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';
import { randomAvatarId } from '@/lib/profile/avatars';
import { PROFILE_LIMITS, type ExperienceLevel } from '@/lib/profile/rules';
import { AvatarPicker } from './avatar-picker';
import { PlayerAvatar } from './player-avatar';
import { CountrySelect, DiceIcon, ExperienceChoice, FIELD_CLASS, useSaveProfile } from './profile-fields';
import type { ProfileView } from '@/types/profile';

interface WelcomeOnboardingProps {
  profile: ProfileView;
  /** Page où aller ensuite (invitation à un groupe…), sinon le tableau de bord */
  redirect: string;
}

export function WelcomeOnboarding({ profile, redirect }: WelcomeOnboardingProps) {
  const { m, fmt } = useI18n();
  const t = m.profile;
  const router = useRouter();
  const { toast } = useToast();
  const save = useSaveProfile();

  const [avatarId, setAvatarId] = useState(profile.avatarId ?? randomAvatarId());
  const [motto, setMotto] = useState(profile.motto ?? '');
  const [country, setCountry] = useState(profile.country);
  const [experience, setExperience] = useState<ExperienceLevel | null>(profile.experience);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, setPending] = useState<'start' | 'later' | null>(null);

  async function finish(full: boolean) {
    setPending(full ? 'start' : 'later');
    const result = await save(
      full
        ? { avatarId, motto: motto.trim() || null, country, experience, onboardingDone: true }
        : { avatarId, onboardingDone: true }
    );

    if (!result.ok) {
      toast.error(result.error);
      setPending(null);
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  const busy = pending !== null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <section className="certificate relative overflow-hidden p-6 sm:p-10">
        <Rosette size={460} strands={20} strokeWidth={0.35} className="absolute -right-40 -top-40 text-brass/10" />

        <div className="relative">
          <p className="label text-brass">{t.welcome.register}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-paper md:text-5xl">{t.welcome.title}</h1>
          <p className="mt-3 text-paper-dim">{fmt(t.welcome.intro, { name: profile.name })}</p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
            <PlayerAvatar avatarId={avatarId} name={profile.name} size={128} className="ring-2 ring-brass" />
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <p className="font-display text-2xl italic text-paper">{profile.name}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)} disabled={busy}>
                  {t.identity.changeAvatar}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAvatarId(randomAvatarId(avatarId))}
                  disabled={busy}
                >
                  <DiceIcon className="mr-1.5" />
                  {t.identity.random}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <label htmlFor="welcome-motto" className="label mb-2 block">
                {t.identity.motto}
              </label>
              <input
                id="welcome-motto"
                value={motto}
                onChange={(event) => setMotto(event.target.value)}
                maxLength={PROFILE_LIMITS.mottoMax}
                placeholder={t.identity.mottoPlaceholder}
                disabled={busy}
                className={FIELD_CLASS}
              />
              <p className="mt-1 text-xs text-paper-dim">{t.identity.mottoHint}</p>
            </div>

            <div>
              <label htmlFor="welcome-country" className="label mb-2 block">
                {t.identity.country}
              </label>
              <CountrySelect id="welcome-country" value={country} onChange={setCountry} disabled={busy} />
            </div>

            <div>
              <p className="label mb-2">{t.experience.label}</p>
              <ExperienceChoice value={experience} onChange={setExperience} disabled={busy} />
            </div>
          </div>

          <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => finish(false)} loading={pending === 'later'} disabled={busy}>
              {t.welcome.later}
            </Button>
            <Button type="button" onClick={() => finish(true)} loading={pending === 'start'} disabled={busy}>
              {t.welcome.start}
            </Button>
          </div>
        </div>
      </section>

      <AvatarPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={avatarId}
        name={profile.name}
        onChoose={(id) => {
          setAvatarId(id);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
