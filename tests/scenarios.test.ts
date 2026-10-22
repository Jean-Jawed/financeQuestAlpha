/**
 * Tests des scénarios (lib/game/scenarios.ts) et de leurs textes
 */

import { describe, expect, it } from 'vitest';
import {
  SCENARIOS,
  getScenario,
  isActionAllowed,
  isAssetAllowed,
  isScenarioId,
  latestStartDate,
} from '@/lib/game/scenarios';
import { ui as uiFr } from '@/lib/i18n/messages/fr/ui';
import { ui as uiEn } from '@/lib/i18n/messages/en/ui';

describe('fiches de scénario', () => {
  it('a des identifiants uniques au format accepté par la base', () => {
    const ids = SCENARIOS.map((scenario) => scenario.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]{2,40}$/);
  });

  it('a un nom, une règle et un texte dans les deux langues', () => {
    for (const { id } of SCENARIOS) {
      for (const ui of [uiFr, uiEn]) {
        const texts = ui.scenarios[id];
        expect(texts.name.length).toBeGreaterThan(0);
        expect(texts.rule.length).toBeGreaterThan(0);
        expect(texts.text.length).toBeGreaterThan(0);
      }
    }
  });

  it('retombe sur « libre » pour un identifiant inconnu', () => {
    expect(getScenario('inconnu').id).toBe('libre');
    expect(isScenarioId('inconnu')).toBe(false);
    expect(isScenarioId('crypto')).toBe(true);
  });
});

describe('ordres autorisés', () => {
  it("L'ours : vente à découvert et rachat seulement", () => {
    const ours = getScenario('ours');
    expect(isActionAllowed(ours, 'short')).toBe(true);
    expect(isActionAllowed(ours, 'cover')).toBe(true);
    expect(isActionAllowed(ours, 'buy')).toBe(false);
    expect(isActionAllowed(ours, 'sell')).toBe(false);
  });

  it('Mains de diamant : achat seulement', () => {
    const diamant = getScenario('diamant');
    expect(isActionAllowed(diamant, 'buy')).toBe(true);
    expect(isActionAllowed(diamant, 'sell')).toBe(false);
    expect(isActionAllowed(diamant, 'short')).toBe(false);
  });
});

describe('actifs autorisés', () => {
  it('Crypto : uniquement le type CRYPTO', () => {
    const crypto = getScenario('crypto');
    expect(isAssetAllowed(crypto, 'CRYPTO', 'CRYPTO')).toBe(true);
    expect(isAssetAllowed(crypto, 'STOCK', 'NASDAQ')).toBe(false);
  });

  it('Orient : uniquement Tokyo, Hong Kong et Shanghai', () => {
    const orient = getScenario('orient');
    expect(isAssetAllowed(orient, 'STOCK', 'TSE')).toBe(true);
    expect(isAssetAllowed(orient, 'INDEX', 'TSE')).toBe(true);
    expect(isAssetAllowed(orient, 'STOCK', 'NYSE')).toBe(false);
    // Paire de devises : pas de place de cotation
    expect(isAssetAllowed(orient, 'CURRENCY', null)).toBe(false);
  });

  it('Libre : tout est permis', () => {
    expect(isAssetAllowed(getScenario('libre'), 'CURRENCY', null)).toBe(true);
  });
});

describe('dates', () => {
  it('laisse assez de séances pour prendre sa retraite', () => {
    expect(latestStartDate('2024-12-31')).toBe('2024-11-26');
  });

  it('la période de la ruée sur les banques couvre mars 2023', () => {
    expect(getScenario('ruee-bancaire').rules.period).toEqual({ start: '2023-03-01', end: '2023-03-31' });
  });
});
