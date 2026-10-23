/**
 * FINANCEQUEST - COURBE DE LA PAGE D'ACCUEIL
 * Clôtures réelles du S&P 500 du 3 février au 31 août 2020 (krach du Covid et rebond),
 * vers content/landing/sp500-2020.json. Période hors de la base prix du jeu : elles
 * viennent de l'historique public de Yahoo Finance, comme les imports de la base.
 *
 *     node scripts/export-landing-curve.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';

const FROM = Date.UTC(2020, 1, 3) / 1000;
const TO = Date.UTC(2020, 8, 1) / 1000;
const url = `https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?period1=${FROM}&period2=${TO}&interval=1d`;

const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
if (!response.ok) throw new Error(`Yahoo : HTTP ${response.status}`);
const [result] = (await response.json()).chart.result;
const closes = result.indicators.quote[0].close;

const points = result.timestamp
  .map((timestamp, index) => [new Date(timestamp * 1000).toISOString().slice(0, 10), closes[index]])
  .filter(([, close]) => typeof close === 'number')
  .map(([date, close]) => [date, Math.round(close * 100) / 100]);

mkdirSync('content/landing', { recursive: true });
writeFileSync('content/landing/sp500-2020.json', JSON.stringify(points));
console.log(`${points.length} séances, de ${points[0][0]} à ${points.at(-1)[0]}`);
