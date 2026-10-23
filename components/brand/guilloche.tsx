/**
 * FINANCEQUEST - BRAND: Guilloche
 * Guillochis (motifs de billets de banque) affichés en masque CSS : le tracé est un
 * fichier SVG mis en cache (/motifs/…, voir lib/brand/guilloche-svg.ts), la couleur
 * est celle du texte (currentColor : text-brass, text-paper…)
 */

import { cn } from '@/lib/utils/cn';

/** Style d'un motif : fond de la couleur du texte, découpé par le tracé du fichier */
function maskStyle(url: string, size: string, repeat: 'no-repeat' | 'repeat-x'): React.CSSProperties {
  return {
    backgroundColor: 'currentColor',
    maskImage: `url(${url})`,
    WebkitMaskImage: `url(${url})`,
    maskSize: size,
    WebkitMaskSize: size,
    maskRepeat: repeat,
    WebkitMaskRepeat: repeat,
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
  };
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
 */
export function Rosette({ size = 240, className, strands = 18, strokeWidth = 0.5 }: RosetteProps) {
  const file = `/motifs/rosette-${strands}-${Math.round(strokeWidth * 100)}.svg`;

  return (
    <span
      aria-hidden="true"
      className={cn('engraving inline-block shrink-0', className)}
      style={{ width: size, height: size, ...maskStyle(file, 'contain', 'no-repeat') }}
    />
  );
}

interface GuillocheBandProps {
  height?: number;
  className?: string;
  strands?: number;
}

/**
 * Bande d'ondes entrelacées (bordure de billet) : une période du motif, répétée en largeur
 */
export function GuillocheBand({ height = 24, className, strands = 8 }: GuillocheBandProps) {
  const file = `/motifs/band-${strands}-${height}.svg`;

  return (
    <span
      aria-hidden="true"
      className={cn('engraving block w-full', className)}
      style={{ height, ...maskStyle(file, `auto ${height}px`, 'repeat-x') }}
    />
  );
}
