/**
 * PASTFOLIO - COMPONENT: KitView
 * Recette de la boîte à outils : chaque pièce dans ses états, en largeur
 * bureau puis dans un cadre de 390 px (téléphone). Page /admin/kit.
 */

'use client';

import { useState } from 'react';
import { Gear, OrnateDivider } from '@/components/brand/ornaments';
import { Frame, Plate } from './frame';
import { EnamelButton, Gauge, Medallion, Odometer, XpTube } from './instruments';
import { CATEGORY_COLORS } from '@/lib/market/category-colors';

const SAMPLE_VALUES = ['12 486,20 €', '12 812,50 €', '12 936,80 €', '12 882,40 €'];

function Specimens({ compact = false }: { compact?: boolean }) {
  const [step, setStep] = useState(0);
  const value = SAMPLE_VALUES[step % SAMPLE_VALUES.length];
  const xp = 2278 + step * 180;

  return (
    <div className="space-y-10">
      {/* Fiche du joueur */}
      <Frame crest="amethyst" fleuron className="flex flex-wrap items-center gap-6 overflow-hidden p-6 sm:pl-12">
        <Gear className="absolute -left-14 -top-12 h-48 w-48 opacity-25" />
        <Medallion avatarId="aquarelle-loup" name="Le Loup" xpTotal={xp} size={compact ? 120 : 170} ornate={!compact} />
        <div className="relative min-w-0 flex-1">
          <Plate className="font-display text-lg normal-case tracking-normal">Le Loup</Plate>
          <XpTube xpTotal={xp} className="mt-4 max-w-sm" />
        </div>
      </Frame>

      {/* Compteur en cadre miroir */}
      <Frame variant="mirror" crest={step % 4 === 3 ? 'ruby' : 'emerald'} className="flex flex-col items-center gap-3 px-6 pb-6 pt-9 text-center">
        <p className="font-display text-sm uppercase tracking-[0.22em] text-brass-bright">Valeur du portefeuille</p>
        <OrnateDivider />
        <div className="glass px-4 py-3">
          <Odometer text={value} rollKey={step} className={compact ? 'text-2xl' : 'text-4xl'} />
        </div>
      </Frame>

      {/* Pupitre */}
      <Frame className="flex flex-wrap items-center gap-5 p-5">
        <EnamelButton tone="brass" size="lg" onClick={() => setStep((s) => s + 1)} className="flex-1">
          Séance suivante
        </EnamelButton>
        <Gauge value={31 + (step % 4) * 6} label="Liquidités" danger={80} />
      </Frame>

      {/* Guichet */}
      <Frame className="space-y-4 p-5">
        <Plate>Le guichet</Plate>
        <div className="flex flex-wrap gap-3">
          <EnamelButton tone="green">Acheter</EnamelButton>
          <EnamelButton tone="red">Vendre</EnamelButton>
          <EnamelButton tone="brass" size="sm">
            −
          </EnamelButton>
          <EnamelButton tone="green" disabled>
            Indisponible
          </EnamelButton>
        </div>
        <div className="ivory grid grid-cols-2 gap-1 px-4 py-3 text-sm">
          <span className="text-ivory-dim">Cours</span>
          <span className="num text-right">94,62 €</span>
          <span className="font-semibold">Total</span>
          <span className="num text-right font-semibold">1 138,28 €</span>
        </div>
      </Frame>

      {/* Couleurs des catégories */}
      <Frame corners={false} className="flex flex-wrap gap-3 p-5">
        {Object.entries(CATEGORY_COLORS).map(([code, color]) => (
          <span key={code} className="label inline-flex items-center gap-2 text-paper">
            <span className="h-3 w-3 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" style={{ background: color }} />
            {code}
          </span>
        ))}
      </Frame>

      {/* Médaillons, toutes tailles */}
      <div className="flex flex-wrap items-end gap-6">
        {[48, 72, 120].map((size) => (
          <Medallion key={size} avatarId="gravure-courtier-hilare" name="Jawed Tahir" xpTotal={4600} size={size} />
        ))}
        <Medallion avatarId={null} name="Sans Avatar" size={72} />
      </div>
    </div>
  );
}

export function KitView() {
  return (
    <div className="container mx-auto space-y-16 px-4 py-12">
      <section>
        <h1 className="font-display text-4xl text-paper">Boîte à outils · bureau</h1>
        <p className="mt-2 text-paper-dim">Cliquer sur « Séance suivante » fait rouler le compteur, monter l’XP et bouger l’aiguille.</p>
        <div className="mt-10 max-w-4xl">
          <Specimens />
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl text-paper">Téléphone (390 px)</h2>
        <div className="mt-8 w-[390px] max-w-full rounded-[2rem] border-8 border-[#111] bg-ink p-4 shadow-2xl">
          <Specimens compact />
        </div>
      </section>
    </div>
  );
}
