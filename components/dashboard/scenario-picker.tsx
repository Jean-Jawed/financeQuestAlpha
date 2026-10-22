/**
 * FINANCEQUEST - COMPONENT: ScenarioPicker
 * Choix du scénario à la création d'une partie : vignette gravée, nom, règle
 */

'use client';

import Image from 'next/image';
import { useI18n } from '@/lib/i18n/client';
import { SCENARIOS, type ScenarioId } from '@/lib/game/scenarios';
import { cn } from '@/lib/utils/cn';

interface ScenarioPickerProps {
  value: ScenarioId;
  onChange: (scenario: ScenarioId) => void;
  disabled?: boolean;
}

export function ScenarioPicker({ value, onChange, disabled = false }: ScenarioPickerProps) {
  const { m } = useI18n();

  return (
    <fieldset>
      <legend className="label mb-3 block">{m.scenarios.pick}</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup">
        {SCENARIOS.map((scenario) => {
          const texts = m.scenarios[scenario.id];
          const selected = scenario.id === value;

          return (
            <button
              key={scenario.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(scenario.id)}
              title={texts.text}
              className={cn(
                'flex flex-col overflow-hidden rounded border text-left transition-colors disabled:opacity-50',
                selected ? 'border-brass ring-1 ring-brass' : 'border-line hover:border-brass/60'
              )}
            >
              <span className="relative block aspect-[4/3] bg-paper">
                <Image src={scenario.image} alt="" fill sizes="160px" className="engraving object-contain p-1" />
              </span>
              <span className="block bg-ink px-3 py-2">
                <span className={cn('block font-display text-base font-semibold', selected ? 'text-brass' : 'text-paper')}>
                  {texts.name}
                </span>
                <span className="label block text-[10px]">{texts.rule}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 min-h-[2.5rem] text-sm text-paper-dim">{m.scenarios[value].text}</p>
    </fieldset>
  );
}
