/**
 * FINANCEQUEST - MACHINE: cadres et plaques
 * <Frame variant="tool"> : moulure de laiton et panneau de noyer (outils : guichet, carnet…)
 * <Frame variant="mirror"> : moulure, fine bande de noyer, filet, glace (courbes, compteur)
 * <Plate> : plaque gravée vissée (titres de panneau, onglet actif)
 */

import { BottomFleuron, Corners, Crest, type Gem } from '@/components/brand/ornaments';
import { cn } from '@/lib/utils/cn';

interface FrameProps {
  variant?: 'tool' | 'mirror';
  /** Fleuron à pierre au sommet (un seul par écran) */
  crest?: Gem;
  /** Filigranes de coin (cadres de plus de 280 px de large) */
  corners?: boolean;
  /** Fleuron au milieu du bas (cadres d'outil) */
  fleuron?: boolean;
  /** Classes du contenu (padding, flex…) */
  className?: string;
  /** Classes du cadre extérieur (placement dans la grille) */
  outerClassName?: string;
  as?: 'div' | 'section' | 'aside';
  'aria-label'?: string;
  children: React.ReactNode;
}

export function Frame({
  variant = 'tool',
  crest,
  corners = true,
  fleuron = false,
  className,
  outerClassName,
  as: Tag = 'div',
  children,
  ...rest
}: FrameProps) {
  const ornaments = (
    <>
      {corners && <Corners size={variant === 'mirror' ? 46 : 38} offset={-12} className="max-sm:hidden" />}
      {crest && <Crest gem={crest} />}
      {fleuron && variant === 'tool' && <BottomFleuron className="max-sm:hidden" />}
    </>
  );

  if (variant === 'mirror') {
    return (
      <Tag className={cn('frame-mirror', crest && 'mt-4', outerClassName)} {...rest}>
        {ornaments}
        <div className="frame-mirror-wood max-sm:p-1.5">
          <div className="frame-mirror-fillet">
            <div className={cn('frame-mirror-glass', className)}>{children}</div>
          </div>
        </div>
      </Tag>
    );
  }

  return (
    <Tag className={cn('frame-tool max-sm:p-2', crest && 'mt-4', outerClassName)} {...rest}>
      {ornaments}
      <div className={cn('wood h-full rounded-lg', className)}>{children}</div>
    </Tag>
  );
}

export function Plate({
  children,
  className,
  as: Tag = 'span',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'span' | 'h2' | 'h3';
}) {
  return <Tag className={cn('plate whitespace-nowrap font-label text-xs font-semibold uppercase tracking-label', className)}>{children}</Tag>;
}
