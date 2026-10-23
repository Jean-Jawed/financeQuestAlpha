/**
 * FINANCEQUEST - GUILLOCHIS : GÉNÉRATION DES FICHIERS SVG
 * Les motifs sont servis comme fichiers mis en cache (/motifs/…), et non plus
 * dessinés dans chaque page : ils pesaient environ 300 Ko par page, recopiés une
 * seconde fois pour React. Les composants les affichent en masque CSS, dans la
 * couleur du texte (currentColor).
 *
 * Une rosace est un ensemble de courbes r(θ) = R + A·sin(nθ + φ), décalées en phase :
 * leurs croisements forment le treillis caractéristique des billets.
 */

/** Courbe fermée r(θ) = radius + amplitude·sin(lobes·θ + phase), centrée en (cx, cy) */
export function wavyCirclePath(
  cx: number,
  cy: number,
  radius: number,
  amplitude: number,
  lobes: number,
  phase: number,
  steps = 240
): string {
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const r = radius + amplitude * Math.sin(lobes * theta + phase);
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return points.join('') + 'Z';
}

/** Onde horizontale y = A·sin(2π·x / wavelength + phase), de 0 à width */
export function wavePath(width: number, y: number, amplitude: number, wavelength: number, phase: number): string {
  const steps = Math.ceil(width / 2);
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const yy = y + amplitude * Math.sin((2 * Math.PI * x) / wavelength + phase);
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${yy.toFixed(2)}`);
  }
  return points.join('');
}

function svg(viewBox: string, body: string, extra = ''): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${extra}><g fill="none" stroke="#000">${body}</g></svg>`;
}

/** Rosace : trois anneaux de courbes entrelacées, cadre double */
export function rosetteSvg(strands: number, strokeWidth: number): string {
  const rings = [
    { radius: 86, amplitude: 9, lobes: 24 },
    { radius: 62, amplitude: 12, lobes: 16 },
    { radius: 38, amplitude: 10, lobes: 10 },
  ];
  const paths = rings
    .flatMap((ring) =>
      Array.from({ length: strands }, (_, i) =>
        `<path d="${wavyCirclePath(100, 100, ring.radius, ring.amplitude, ring.lobes, (i / strands) * Math.PI * 2, 180)}"/>`
      )
    )
    .join('');
  return svg(
    '0 0 200 200',
    `<g stroke-width="${strokeWidth}">${paths}</g><circle cx="100" cy="100" r="97" stroke-width="${strokeWidth * 2}"/><circle cx="100" cy="100" r="99" stroke-width="${strokeWidth}"/>`
  );
}

/** Longueur d'onde des bandes : la tuile fait exactement une période, répétée sans couture */
export const BAND_WAVELENGTH = 46;

/** Bande d'ondes entrelacées (bordure de billet), une période de large */
export function bandSvg(strands: number, height: number): string {
  const paths = Array.from({ length: strands }, (_, i) =>
    `<path d="${wavePath(BAND_WAVELENGTH, height / 2, height * 0.38, BAND_WAVELENGTH, (i / strands) * Math.PI * 2)}"/>`
  ).join('');
  return svg(`0 0 ${BAND_WAVELENGTH} ${height}`, `<g stroke-width="0.6">${paths}</g>`, ` preserveAspectRatio="none"`);
}

/** Anneau guilloché du sceau (le reste du sceau reste dessiné dans la page) */
export function sealRingSvg(strands: number, strokeWidth: number): string {
  const paths = Array.from({ length: strands }, (_, i) =>
    `<path d="${wavyCirclePath(50, 50, 38.5, 4, 18, (i / strands) * Math.PI * 2, 180)}"/>`
  ).join('');
  return svg('0 0 100 100', `<g stroke-width="${strokeWidth}">${paths}</g>`);
}

/**
 * Nom de fichier → contenu SVG, ou null si le nom est inconnu
 * rosette-22-35.svg (22 courbes, trait 0,35) · band-8-24.svg (8 ondes, 24 px) · seal-14.svg
 */
export function motifSvg(file: string): string | null {
  const rosette = file.match(/^rosette-(\d{1,2})-(\d{1,3})\.svg$/);
  if (rosette) {
    const strands = Number(rosette[1]);
    const stroke = Number(rosette[2]) / 100;
    return strands >= 3 && strands <= 40 && stroke > 0 && stroke <= 3 ? rosetteSvg(strands, stroke) : null;
  }
  const band = file.match(/^band-(\d{1,2})-(\d{1,3})\.svg$/);
  if (band) {
    const strands = Number(band[1]);
    const height = Number(band[2]);
    return strands >= 2 && strands <= 20 && height >= 6 && height <= 120 ? bandSvg(strands, height) : null;
  }
  const seal = file.match(/^seal-(\d{1,2})\.svg$/);
  if (seal) {
    const strands = Number(seal[1]);
    return strands >= 3 && strands <= 30 ? sealRingSvg(strands, strands <= 6 ? 0.9 : 0.45) : null;
  }
  return null;
}
