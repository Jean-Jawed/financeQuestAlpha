/**
 * FINANCEQUEST - BRAND: ornements de laiton
 * Filigranes de coin, fleuron à pierre, fleuron de bas de cadre, filet orné,
 * engrenage, couronne du médaillon. SVG en ligne, sans requête.
 * Dosage : docs/reviewOct2026/phase3/03_refonte_da.md (§ 1, règles d'ornement)
 */

import { useId } from 'react';
import { cn } from '@/lib/utils/cn';

const SHINE = '#F3D891';
const SHADE = '#3A2708';

/** Pierres disponibles pour les fleurons */
export const GEMS = {
  amethyst: '#4E3A86',
  emerald: '#2B7350',
  ruby: '#963722',
} as const;

export type Gem = keyof typeof GEMS;

// ==========================================
// COINS
// ==========================================

const CORNER_PATHS = [
  'M5 46 L5 14 Q5 5 14 5 L46 5',
  'M46 5 C55 5 58 13 53 17 C49 20 44 16 47 12',
  'M5 46 C5 55 13 58 17 53 C20 49 16 44 12 47',
];

function CornerFiligree({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" aria-hidden="true" className={cn('ornament', className)} style={style}>
      <g fill="none" strokeLinecap="round">
        <g stroke={SHADE} strokeWidth={2.6} opacity={0.55} transform="translate(0.8 1.2)">
          {CORNER_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g stroke={SHINE} strokeWidth={1.7}>
          {CORNER_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
          <path d="M11 11 C20 11 25 17 23 23 C17 25 11 20 11 11 Z" fill="rgba(243,216,145,0.22)" />
          <path d="M14 32 C14 25 18 19 25 17" strokeWidth={1} />
          <path d="M32 14 C25 14 19 18 17 25" strokeWidth={1} />
        </g>
      </g>
      <circle cx="31" cy="9" r="1.7" fill={SHINE} />
      <circle cx="9" cy="31" r="1.7" fill={SHINE} />
      <circle cx="24" cy="24" r="2.6" fill="#6E52B5" stroke={SHINE} strokeWidth={0.9} />
    </svg>
  );
}

/**
 * Les quatre filigranes d'un cadre (le parent est en position relative)
 * @param size - Côté en pixels (40 sur un cadre d'outil, 50 sur un cadre miroir)
 * @param offset - Décalage vers l'extérieur, pour chevaucher la moulure
 */
export function Corners({ size = 40, offset = -12, className }: { size?: number; offset?: number; className?: string }) {
  const base = { width: size, height: size };
  return (
    <>
      <CornerFiligree className={className} style={{ ...base, left: offset, top: offset }} />
      <CornerFiligree className={className} style={{ ...base, right: offset, top: offset, transform: 'scaleX(-1)' }} />
      <CornerFiligree className={className} style={{ ...base, left: offset, bottom: offset, transform: 'scaleY(-1)' }} />
      <CornerFiligree className={className} style={{ ...base, right: offset, bottom: offset, transform: 'scale(-1, -1)' }} />
    </>
  );
}

// ==========================================
// FLEURONS
// ==========================================

/** Fleuron à pierre, au sommet d'un cadre (un seul par écran) */
export function Crest({ gem = 'amethyst', className }: { gem?: Gem; className?: string }) {
  return (
    <svg
      viewBox="0 0 170 44"
      aria-hidden="true"
      className={cn('ornament left-1/2 top-[-19px] w-44 -translate-x-1/2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]', className)}
    >
      <path d="M60 10 L110 10 L104 34 L66 34 Z" fill="#141009" />
      <g fill="none" stroke={SHINE} strokeWidth={1.7} strokeLinecap="round">
        <path d="M8 30 C28 30 38 16 56 18 C67 19 67 31 58 31 C51 31 51 23 57 23" />
        <path d="M162 30 C142 30 132 16 114 18 C103 19 103 31 112 31 C119 31 119 23 113 23" />
        <path d="M64 36 Q85 43 106 36" />
        <path d="M70 8 Q85 1 100 8" strokeWidth={1.2} />
      </g>
      <circle cx="30" cy="27" r="1.6" fill={SHINE} />
      <circle cx="140" cy="27" r="1.6" fill={SHINE} />
      <path d="M85 6 L98 21 L85 38 L72 21 Z" fill={GEMS[gem]} stroke="#E0BC6C" strokeWidth={2.2} className="transition-[fill] duration-500" />
      <path d="M85 6 L85 38 M72 21 L98 21 M78 13 L92 29 M92 13 L78 29" stroke="rgba(255,255,255,0.22)" strokeWidth={0.7} />
      <path d="M79 12 L85 6 L88 10" stroke="rgba(255,255,255,0.55)" strokeWidth={1} fill="none" />
    </svg>
  );
}

/** Petit fleuron au milieu du bas d'un cadre d'outil */
export function BottomFleuron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 90 20"
      aria-hidden="true"
      className={cn('ornament bottom-[-9px] left-1/2 w-24 -translate-x-1/2 drop-shadow-[0_2px_1px_rgba(0,0,0,0.6)]', className)}
    >
      <g fill="none" stroke={SHINE} strokeWidth={1.6} strokeLinecap="round">
        <path d="M4 8 C16 8 22 16 32 13 C38 11 36 5 31 6" />
        <path d="M86 8 C74 8 68 16 58 13 C52 11 54 5 59 6" />
      </g>
      <circle cx="45" cy="10" r="6" fill={GEMS.amethyst} stroke={SHINE} strokeWidth={1.6} />
      <circle cx="43" cy="8" r="1.6" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

/** Filet orné à losange, sous un titre */
export function OrnateDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 14" aria-hidden="true" className={cn('mx-auto block h-3 w-52 text-brass', className)}>
      <g fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round">
        <path d="M4 7 L96 7 M144 7 L236 7" />
        <path d="M96 7 C104 7 106 1 112 3 C116 5 113 9 110 7 M144 7 C136 7 134 1 128 3 C124 5 127 9 130 7" />
      </g>
      <path d="M120 1 L126 7 L120 13 L114 7 Z" fill="currentColor" />
    </svg>
  );
}

// ==========================================
// ENGRENAGE
// ==========================================

const GEAR_PATH =
  'M90 50 L97.9 52.6 L97.3 58.1 L89 58.9 L86 67.4 L92.1 73.1 L89.1 77.9 L81.3 74.9 L74.9 81.3 L77.9 89.1 L73.1 92.1 L67.4 86 L58.9 89 L58.1 97.3 L52.6 97.9 L50 90 L41.1 89 L36.8 96.2 L31.5 94.3 L32.6 86 L25.1 81.3 L18.1 85.9 L14.1 81.9 L18.7 74.9 L14 67.4 L5.7 68.5 L3.8 63.2 L11 58.9 L10 50 L2.1 47.4 L2.7 41.9 L11 41.1 L14 32.6 L7.9 26.9 L10.9 22.1 L18.7 25.1 L25.1 18.7 L22.1 10.9 L26.9 7.9 L32.6 14 L41.1 11 L41.9 2.7 L47.4 2.1 L50 10 L58.9 11 L63.2 3.8 L68.5 5.7 L67.4 14 L74.9 18.7 L81.9 14.1 L85.9 18.1 L81.3 25.1 L86 32.6 L94.3 31.5 L96.2 36.8 L89 41.1 Z M62 50 A12 12 0 1 0 38 50 A12 12 0 1 0 62 50 Z';

/** Engrenage de laiton qui tourne lentement (arrêté si l'animation est réduite) */
export function Gear({ className, reverse = false }: { className?: string; reverse?: boolean }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={cn('pointer-events-none', reverse ? 'animate-[spin_26s_linear_infinite_reverse]' : 'animate-[spin_40s_linear_infinite]', className)}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E9C878" />
          <stop offset="1" stopColor="#7A5720" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id})`} fillRule="evenodd" d={GEAR_PATH} />
    </svg>
  );
}

// ==========================================
// COURONNE DU MÉDAILLON
// ==========================================

const C = 100;

function scallops(r: number, bump: number, n: number): string {
  const steps = n * 12;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (2 * Math.PI * i) / steps;
    const rr = r + bump * (0.5 + 0.5 * Math.cos(n * a)) ** 0.6;
    points.push(`${(C + rr * Math.cos(a)).toFixed(1)},${(C + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `M${points.join(' L')} Z`;
}

const SCALLOPS = scallops(84, 9, 24);
const BEADS = Array.from({ length: 40 }, (_, i) => {
  const a = (2 * Math.PI * i) / 40;
  return [C + 75 * Math.cos(a), C + 75 * Math.sin(a)];
});
const STUDS = Array.from({ length: 8 }, (_, i) => {
  const a = (2 * Math.PI * i) / 8 + Math.PI / 8;
  return [C + 86 * Math.cos(a), C + 86 * Math.sin(a)];
});
const SCROLLS = [
  'M14 100 C-14 86 -26 56 -8 40 C4 30 18 42 10 52 C4 58 -4 52 0 46',
  'M186 100 C214 86 226 56 208 40 C196 30 182 42 190 52 C196 58 204 52 200 46',
  'M18 128 C-6 140 -16 170 2 182 C14 190 24 176 14 170',
  'M182 128 C206 140 216 170 198 182 C186 190 176 176 186 170',
];

/**
 * Couronne d'un médaillon d'avatar (viewBox 200 × 200, l'avatar occupe le disque de rayon 63)
 * @param scrolls - Volutes latérales (version ornée : fiche du joueur)
 * @param beads - Rang de perles et clous d'améthyste (désactivés sous ~64 px)
 */
export function MedallionFrame({
  scrolls = false,
  beads = true,
  className,
  style,
}: {
  scrolls?: boolean;
  beads?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const uid = useId().replace(/:/g, '');
  const ring = `ring${uid}`;
  const bevel = `bevel${uid}`;
  const bead = `bead${uid}`;
  const stud = `stud${uid}`;

  return (
    <svg viewBox={scrolls ? '-34 0 268 214' : '0 0 200 200'} aria-hidden="true" className={cn('overflow-visible', className)} style={style}>
      <defs>
        <linearGradient id={ring} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FBE6A6" />
          <stop offset="0.3" stopColor="#C7964A" />
          <stop offset="0.55" stopColor="#6E4F1C" />
          <stop offset="0.8" stopColor="#E2BD6E" />
          <stop offset="1" stopColor="#7A5720" />
        </linearGradient>
        <linearGradient id={bevel} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF3C8" />
          <stop offset="0.5" stopColor="#9A7231" />
          <stop offset="1" stopColor="#3E2A0C" />
        </linearGradient>
        <radialGradient id={bead} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFF6CF" />
          <stop offset="0.5" stopColor="#C9A04F" />
          <stop offset="1" stopColor="#4E3712" />
        </radialGradient>
        <radialGradient id={stud} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#C9B6F2" />
          <stop offset="0.55" stopColor="#6E52B5" />
          <stop offset="1" stopColor="#241848" />
        </radialGradient>
      </defs>

      {scrolls && (
        <>
          <g fill="none" strokeLinecap="round">
            <g stroke={SHADE} strokeWidth={5} opacity={0.5} transform="translate(1 2)">
              {SCROLLS.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
            <g stroke={`url(#${ring})`} strokeWidth={3.4}>
              {SCROLLS.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
            <g stroke={SHINE} strokeWidth={1.2}>
              <path d="M8 80 C-4 74 -6 62 2 60" />
              <path d="M192 80 C204 74 206 62 198 60" />
              <path d="M10 146 C-2 152 -2 162 6 164" />
              <path d="M190 146 C202 152 202 162 194 164" />
            </g>
          </g>
          <path d="M-6 92 Q-18 100 -6 108 Q2 100 -6 92 Z M206 92 Q218 100 206 108 Q198 100 206 92 Z" fill={`url(#${ring})`} />
        </>
      )}

      {beads && <path d={SCALLOPS} fill={`url(#${ring})`} stroke="#3E2A0C" strokeWidth={1} />}
      <circle cx={C} cy={C} r={beads ? 79 : 92} fill="#2A1C0A" />
      <circle cx={C} cy={C} r={beads ? 78 : 91} fill={`url(#${ring})`} />
      {beads && BEADS.map(([x, y], i) => <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="2.1" fill={`url(#${bead})`} />)}
      {beads &&
        STUDS.map(([x, y], i) => (
          <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3.2" fill={`url(#${stud})`} stroke="#3E2A0C" strokeWidth={0.6} />
        ))}
      <circle cx={C} cy={C} r="69" fill={`url(#${bevel})`} />
      <circle cx={C} cy={C} r="63" fill="#140D07" stroke="#2A1C0A" strokeWidth={2} />
    </svg>
  );
}
