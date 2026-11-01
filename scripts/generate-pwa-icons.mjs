/**
 * PASTFOLIO - ICÔNES DE L'APPLICATION INSTALLÉE
 * Rend le sceau (app/icon.svg) en PNG pour le manifeste et iOS :
 * - icon-192 / icon-512 : sceau rond sur fond transparent
 * - maskable-512 : sceau réduit au centre d'un carré plein (zone sûre Android)
 * - apple-touch-icon : 180 px sur fond plein (iOS arrondit lui-même les coins)
 *
 * Usage : node scripts/generate-pwa-icons.mjs
 */

import { mkdir, readFile } from 'node:fs/promises';
import sharp from 'sharp';

const BACKGROUND = '#0F1D19';
const svg = await readFile(new URL('../app/icon.svg', import.meta.url));
const out = new URL('../public/icons/', import.meta.url);
await mkdir(out, { recursive: true });

/** Sceau rendu à `size` px, posé au centre d'un carré de `canvas` px */
async function render(name, canvas, size, background) {
  const seal = await sharp(svg, { density: 72 * (size / 100) * 2 }).resize(size, size).png().toBuffer();
  await sharp({
    create: { width: canvas, height: canvas, channels: 4, background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: seal, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(new URL(name, out).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  console.log('ok', name);
}

await render('icon-192.png', 192, 192);
await render('icon-512.png', 512, 512);
// Zone sûre des icônes masquables : cercle de 80 % du côté
await render('maskable-512.png', 512, 400, BACKGROUND);
await render('apple-touch-icon.png', 180, 160, BACKGROUND);
