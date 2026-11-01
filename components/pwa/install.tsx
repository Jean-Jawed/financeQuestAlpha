/**
 * PASTFOLIO - COMPONENTS: installation de l'application
 * - PwaStarter : écoute l'invite d'installation et enregistre le service worker
 * - InstallTelegram : télégramme en tête de la page d'accueil
 * - InstallCard : « le guichet de poche », au tableau de bord
 * - InstallFooterLine : une ligne en pied de toutes les pages
 * Rien ne s'affiche si l'appli est déjà installée ou si le navigateur ne sait pas l'installer.
 */

'use client';

import { useEffect, useId, useState } from 'react';
import { Frame } from '@/components/machine/frame';
import { EnamelButton } from '@/components/machine/instruments';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';
import { promptInstall, startPwa, useInstallDismissal, useInstallMode, type InstallMode } from '@/lib/pwa/install';
import { cn } from '@/lib/utils/cn';

// Au chargement du module : l'invite peut arriver avant le montage des composants
startPwa();

export function PwaStarter() {
  useEffect(() => startPwa(), []);
  return null;
}

// ==========================================
// DÉCLENCHEUR ET MODE D'EMPLOI
// ==========================================

/**
 * Invite du navigateur si elle existe, sinon la marche à suivre (Safari)
 * @returns l'action à brancher sur un bouton, et la fenêtre d'aide à rendre
 */
function useInstallAction(mode: InstallMode) {
  const { m } = useI18n();
  const { toast } = useToast();
  const [guideOpen, setGuideOpen] = useState(false);

  async function install() {
    if (mode === 'prompt') {
      if (await promptInstall()) toast.success(m.pwa.installed);
    } else {
      setGuideOpen(true);
    }
  }

  const guide = <InstallGuide mode={mode} isOpen={guideOpen} onClose={() => setGuideOpen(false)} />;
  return { install, guide };
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true" className="inline align-[-3px]">
      <path d="M12 3v12M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  );
}

function InstallGuide({ mode, isOpen, onClose }: { mode: InstallMode; isOpen: boolean; onClose: () => void }) {
  const { m } = useI18n();
  const t = m.pwa.guide;
  const mac = mode === 'macos';
  const steps = mac ? t.macSteps : t.iosSteps;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.title} size="sm">
      <p className="text-paper-dim">{mac ? t.macIntro : t.iosIntro}</p>
      <ol className="mt-5 space-y-4">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-4">
            <span className="plate flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-label text-sm font-bold">
              {index + 1}
            </span>
            <span className="pt-1 text-paper">
              {step} {index === 0 && <ShareIcon />}
            </span>
          </li>
        ))}
      </ol>
      {!mac && <p className="mt-5 text-sm text-paper-faint">{t.iosNote}</p>}
      <p className="mt-3 text-sm text-paper-dim">{t.done}</p>
      <EnamelButton tone="brass" className="mt-6 w-full" onClick={onClose}>
        {t.close}
      </EnamelButton>
    </Modal>
  );
}

// ==========================================
// TÉLÉPHONE GRAVÉ (sceau dans un combiné)
// ==========================================

function PocketPhone({ className }: { className?: string }) {
  const gradient = `pocket-brass-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 80 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4D891" />
          <stop offset="0.45" stopColor="#C29245" />
          <stop offset="1" stopColor="#7A5720" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="72" height="112" rx="12" fill={`url(#${gradient})`} />
      <rect x="9" y="12" width="62" height="92" rx="5" fill="#0F1D19" />
      <circle cx="40" cy="52" r="20" fill="none" stroke="#C9A45C" strokeWidth="2" />
      <circle cx="40" cy="52" r="15" fill="none" stroke="#C9A45C" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      <text x="40" y="58" textAnchor="middle" fill="#C9A45C" fontSize="15" fontStyle="italic" fontWeight="700" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
        PF
      </text>
      <rect x="20" y="82" width="40" height="5" rx="2.5" fill="#C9A45C" opacity="0.5" />
      <rect x="28" y="91" width="24" height="4" rx="2" fill="#C9A45C" opacity="0.3" />
      <circle cx="40" cy="110" r="2.5" fill="#0F1D19" opacity="0.6" />
    </svg>
  );
}

// ==========================================
// EMPLACEMENTS
// ==========================================

/** En tête de la page d'accueil : une bande de télégramme */
export function InstallTelegram({ className }: { className?: string }) {
  const { m } = useI18n();
  const t = m.pwa.telegram;
  const mode = useInstallMode();
  const [dismissed, dismiss] = useInstallDismissal('landing');
  const { install, guide } = useInstallAction(mode);

  if (mode === 'none' || dismissed) return guide;

  return (
    <>
      <div className={cn('ivory relative animate-rise rounded-none border-x-0 border-t-0 shadow-[0_4px_10px_rgba(0,0,0,0.45)]', className)}>
        <div className="container mx-auto flex items-center gap-3 px-4 py-2 sm:gap-4">
          <span className="hidden shrink-0 border border-ivory-ink/40 px-1.5 py-0.5 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-ivory-ink sm:inline">
            {t.label}
          </span>
          <p className="line-clamp-2 min-w-0 flex-1 font-mono text-[11px] uppercase leading-snug tracking-wide text-ivory-ink sm:text-xs">
            {t.text} <span className="font-bold">{t.stop}</span>
          </p>
          <button
            type="button"
            onClick={install}
            className="shrink-0 rounded-sm border border-ivory-ink/60 bg-ivory-ink px-3 py-1.5 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-ivory transition-opacity hover:opacity-85"
          >
            {t.cta}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t.close}
            className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center text-lg leading-none text-ivory-dim transition-colors hover:text-ivory-ink"
          >
            ×
          </button>
        </div>
      </div>
      {guide}
    </>
  );
}

/** Tableau de bord : « le guichet de poche » */
export function InstallCard() {
  const { m } = useI18n();
  const t = m.pwa.card;
  const mode = useInstallMode();
  const [dismissed, dismiss] = useInstallDismissal('dashboard');
  const { install, guide } = useInstallAction(mode);

  if (mode === 'none' || dismissed) return guide;

  return (
    <>
      <Frame as="aside" className="relative flex flex-col items-center gap-5 overflow-hidden p-5 text-center sm:flex-row sm:p-6 sm:text-left">
        <PocketPhone className="h-24 w-auto shrink-0 drop-shadow-[0_6px_8px_rgba(0,0,0,0.6)] motion-safe:animate-rise" />
        <div className="min-w-0 flex-1">
          <p className="label text-brass-bright">{t.eyebrow}</p>
          <p className="mt-1 font-display text-xl font-semibold text-paper sm:text-2xl">{t.title}</p>
          <p className="mt-2 text-sm text-paper-dim">{t.text}</p>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-2">
          <EnamelButton tone="brass" onClick={install}>
            {t.cta}
          </EnamelButton>
          <button
            type="button"
            onClick={dismiss}
            className="font-label text-xs font-semibold uppercase tracking-label text-paper-dim transition-colors hover:text-paper"
          >
            {t.later}
          </button>
        </div>
      </Frame>
      {guide}
    </>
  );
}

/** Pied de page : une ligne discrète, sur toutes les pages */
export function InstallFooterLine() {
  const { m } = useI18n();
  const t = m.pwa.footer;
  const mode = useInstallMode();
  const { install, guide } = useInstallAction(mode);

  if (mode === 'none') return guide;

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-line px-4 py-3 text-sm">
        <PocketPhone className="h-6 w-auto" />
        <span className="font-display italic text-paper">{t.text}</span>
        <button
          type="button"
          onClick={install}
          className="font-label text-xs font-semibold uppercase tracking-label text-brass underline decoration-brass/40 underline-offset-4 transition-colors hover:text-brass-bright"
        >
          {t.cta} →
        </button>
      </div>
      {guide}
    </>
  );
}
