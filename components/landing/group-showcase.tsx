/**
 * FINANCEQUEST - LANDING: GroupShowcase
 * Section « En groupe » de l'accueil et de la page Le jeu : le principe, ce qu'on
 * voit des autres, les deux tempos et les cinq modes (textes du jeu lui-même)
 */

import Link from 'next/link';
import { GuillocheBand } from '@/components/brand/guilloche';
import { GROUP_MODES, GROUP_TEMPOS } from '@/lib/game/groups';
import type { Locale } from '@/lib/i18n/config';
import { getI18n } from '@/lib/i18n/server';

export function GroupShowcase({ locale }: { locale: Locale }) {
  const { ui, site, href } = getI18n(locale);
  const t = site.groupsShowcase;

  return (
    <section aria-labelledby="groups-showcase-title" className="container mx-auto px-4 py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div>
          <p className="label text-brass">{t.eyebrow}</p>
          <h2 id="groups-showcase-title" className="mt-3 font-display text-4xl font-semibold leading-tight text-paper md:text-5xl">
            {t.title}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-paper-dim">{t.text}</p>
          <p className="mt-4 border-l-2 border-brass/60 pl-4 text-paper">{t.visibility}</p>
          <Link
            href={href('/dashboard')}
            className="mt-8 inline-flex h-12 items-center rounded border border-brass/70 px-7 font-label text-base font-semibold uppercase tracking-[0.14em] text-brass transition-colors hover:bg-brass/10"
          >
            {t.cta}
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="label text-brass">{t.tempoTitle}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {GROUP_TEMPOS.map((tempo) => (
                <div key={tempo} className="rounded border-2 border-brass/40 bg-ink-2 p-5">
                  <p className="font-display text-xl font-semibold text-paper">{ui.groups.tempos[tempo].name}</p>
                  <p className="mt-2 text-sm text-paper-dim">{ui.groups.tempos[tempo].text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="certificate p-6">
            <h3 className="label text-brass">{t.modesTitle}</h3>
            <GuillocheBand className="my-4 text-brass/25" height={12} strands={4} />
            <ul className="space-y-4">
              {GROUP_MODES.map((mode) => (
                <li key={mode} className="flex gap-3">
                  <span aria-hidden="true" className="mt-1 text-brass">
                    ◆
                  </span>
                  <div>
                    <p className="font-display text-lg font-semibold text-paper">{ui.groups.modes[mode].name}</p>
                    <p className="text-sm text-paper-dim">{ui.groups.modes[mode].text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
