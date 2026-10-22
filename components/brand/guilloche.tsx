/**
 * FINANCEQUEST - BRAND: Guilloche
 * Guillochis calculés (motifs de billets de banque), en SVG vectoriel
 *
 * Une rosace est un ensemble de courbes r(θ) = R + A·sin(nθ + φ), décalées
 * en phase : leurs croisements forment le treillis caractéristique des billets.
 */

import { cn } from '@/lib/utils/cn';

// ==========================================
// GÉOMÉTRIE
// ==========================================

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
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return points.join('') + 'Z';
}

/** Onde horizontale y = A·sin(2π·x / wavelength + phase), de 0 à width */
export function wavePath(width: number, y: number, amplitude: number, wavelength: number, phase: number): string {
  const steps = Math.ceil(width / 4);
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const yy = y + amplitude * Math.sin((2 * Math.PI * x) / wavelength + phase);
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${yy.toFixed(2)}`);
  }
  return points.join('');
}

// ==========================================
// COMPOSANTS
// ==========================================

interface RosetteProps {
  size?: number;
  className?: string;
  /** Nombre de courbes par anneau (densité du treillis) */
  strands?: number;
  strokeWidth?: number;
}

/**
 * Rosace guillochée : trois anneaux de courbes entrelacées
 * Couleur : currentColor (text-brass, text-paper…)
 */
export function Rosette({ size = 240, className, strands = 18, strokeWidth = 0.5 }: RosetteProps) {
  const c = 100;
  const rings = [
    { radius: 86, amplitude: 9, lobes: 24 },
    { radius: 62, amplitude: 12, lobes: 16 },
    { radius: 38, amplitude: 10, lobes: 10 },
  ];

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={cn('engraving', className)}
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
        {rings.flatMap((ring, ringIndex) =>
          Array.from({ length: strands }, (_, i) => (
            <path
              key={`${ringIndex}-${i}`}
              d={wavyCirclePath(c, c, ring.radius, ring.amplitude, ring.lobes, (i / strands) * Math.PI * 2, 360)}
            />
          ))
        )}
        <circle cx={c} cy={c} r={97} strokeWidth={strokeWidth * 2} />
        <circle cx={c} cy={c} r={99} />
      </g>
    </svg>
  );
}

interface GuillocheBandProps {
  width?: number;
  height?: number;
  className?: string;
  strands?: number;
}

/**
 * Bande d'ondes entrelacées (bordure de billet), étirable en largeur
 */
export function GuillocheBand({ width = 600, height = 24, className, strands = 8 }: GuillocheBandProps) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn('engraving block w-full', className)}
      style={{ height }}
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth={0.6}>
        {Array.from({ length: strands }, (_, i) => (
          <path
            key={i}
            vectorEffect="non-scaling-stroke"
            d={wavePath(width, height / 2, height * 0.38, 46, (i / strands) * Math.PI * 2)}
          />
        ))}
      </g>
    </svg>
  );
}
