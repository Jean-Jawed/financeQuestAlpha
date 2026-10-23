/**
 * FINANCEQUEST - MOTIFS GUILLOCHÉS
 * GET /motifs/rosette-22-35.svg · /motifs/band-8-24.svg · /motifs/seal-14.svg
 * Fichiers SVG calculés une fois, mis en cache sans limite (le contenu ne dépend que du nom)
 */

import { motifSvg } from '@/lib/brand/guilloche-svg';

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const body = motifSvg(file);

  if (!body) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(body, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
