/**
 * FINANCEQUEST - IMAGES DE PARTAGE (Open Graph)
 * Gabarit 1200 × 630 : titre en Bodoni sur l'encre, gravure sur papier, double filet laiton
 * Les gravures sont lues en JPEG dans public/og/ (format accepté par le moteur de rendu)
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

const INK = '#0F1D19';
const PAPER = '#EFE6D2';
const PAPER_DIM = '#A9A08C';
const BRASS = '#C9A45C';

/**
 * Police Google en TTF, réduite aux caractères du texte (requête légère)
 * Renvoie null si Google Fonts est injoignable : la police par défaut prend le relais
 */
async function loadGoogleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const source = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!source) return null;
    const response = await fetch(source[1]);
    return response.ok ? await response.arrayBuffer() : null;
  } catch {
    return null;
  }
}

async function loadEngraving(file: string): Promise<string | null> {
  try {
    const data = await readFile(path.join(process.cwd(), 'public', 'og', file));
    return `data:image/jpeg;base64,${data.toString('base64')}`;
  } catch {
    return null;
  }
}

interface OgImageOptions {
  /** Petite ligne en capitales au-dessus du titre */
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** Fichier JPEG de public/og/ */
  engraving: string;
}

export async function renderOgImage({ eyebrow, title, subtitle, engraving }: OgImageOptions) {
  const text = `${eyebrow}${title}${subtitle ?? ''}FinanceQuest`;
  const [display, label, image] = await Promise.all([
    loadGoogleFont('Bodoni Moda', 600, text),
    loadGoogleFont('Barlow Condensed', 600, text.toUpperCase()),
    loadEngraving(engraving),
  ]);

  const fonts = [
    ...(display ? [{ name: 'Bodoni', data: display, weight: 600 as const, style: 'normal' as const }] : []),
    ...(label ? [{ name: 'Barlow', data: label, weight: 600 as const, style: 'normal' as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: INK,
          padding: 28,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            border: `3px solid ${BRASS}`,
            padding: 8,
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              border: `1px solid ${BRASS}66`,
              padding: '44px 48px',
              gap: 44,
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div
                style={{
                  fontFamily: 'Barlow',
                  fontSize: 24,
                  letterSpacing: 4,
                  color: BRASS,
                  textTransform: 'uppercase',
                }}
              >
                {eyebrow}
              </div>
              <div
                style={{
                  fontFamily: 'Bodoni',
                  fontSize: title.length > 48 ? 54 : 66,
                  lineHeight: 1.05,
                  color: PAPER,
                  marginTop: 22,
                }}
              >
                {title}
              </div>
              {subtitle && (
                <div style={{ fontFamily: 'Bodoni', fontSize: 28, color: PAPER_DIM, marginTop: 22, lineHeight: 1.3 }}>
                  {subtitle}
                </div>
              )}
              <div
                style={{
                  fontFamily: 'Barlow',
                  fontSize: 22,
                  letterSpacing: 3,
                  color: PAPER_DIM,
                  marginTop: 34,
                  textTransform: 'uppercase',
                }}
              >
                FinanceQuest
              </div>
            </div>
            {image && (
              <div
                style={{
                  width: 400,
                  height: 440,
                  display: 'flex',
                  background: PAPER,
                  border: `4px solid ${BRASS}`,
                  padding: 8,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" width={372} height={412} style={{ objectFit: 'cover' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length > 0 ? fonts : undefined }
  );
}
