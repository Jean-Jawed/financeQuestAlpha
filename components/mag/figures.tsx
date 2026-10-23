/**
 * FINANCEQUEST - COMPONENTS: illustrations des articles de La Gazette
 * - ArchiveFigure : image d'archive libre de droits (public/mag/), avec auteur,
 *   date, licence et lien vers la source (content/mag/credits.json)
 * - EngravingFigure : gravure du site (public/gravures/)
 */

import Image from 'next/image';
import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils/cn';
import credits from '@/content/mag/credits.json';
import sizes from '@/content/mag/images.json';

type ArchiveName = keyof typeof credits & keyof typeof sizes;

const LABELS: Record<Locale, { publicDomain: string; source: string }> = {
  fr: { publicDomain: 'Domaine public', source: 'source' },
  en: { publicDomain: 'Public domain', source: 'source' },
};

interface ArchiveFigureProps {
  name: ArchiveName;
  locale: Locale;
  alt: string;
  caption: string;
  /** Pleine largeur de colonne (défaut) ou en vignette flottante sur grand écran */
  layout?: 'wide' | 'side';
}

export function ArchiveFigure({ name, locale, alt, caption, layout = 'wide' }: ArchiveFigureProps) {
  const credit = credits[name];
  const { width, height } = sizes[name];
  const license = credit.license === 'CC0' ? 'CC0' : LABELS[locale].publicDomain;

  return (
    <figure
      className={cn(
        'my-10',
        layout === 'side' && 'sm:float-right sm:mb-6 sm:ml-8 sm:mt-2 sm:w-[46%]'
      )}
    >
      <div className="overflow-hidden rounded border-[5px] border-double border-brass/50 bg-paper p-1.5">
        <Image
          src={`/mag/${name}.webp`}
          alt={alt}
          width={width}
          height={height}
          sizes={layout === 'side' ? '(min-width: 640px) 320px, 100vw' : '(min-width: 768px) 680px, 100vw'}
          className="h-auto w-full"
        />
      </div>
      <figcaption className="mt-3 text-sm leading-snug text-paper-dim">
        {caption}
        <span className="mt-1 block text-xs text-paper-faint">
          {credit.author}, {credit.date} · {license} ·{' '}
          <a href={credit.source} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-paper">
            {LABELS[locale].source}
          </a>
        </span>
      </figcaption>
    </figure>
  );
}

interface EngravingFigureProps {
  /** Nom du fichier de public/gravures, sans extension */
  name: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

export function EngravingFigure({ name, width, height, alt, caption }: EngravingFigureProps) {
  return (
    <figure className="my-10">
      <div className="overflow-hidden rounded border-[5px] border-double border-brass/50 bg-paper p-1.5">
        <Image
          src={`/gravures/${name}.webp`}
          alt={alt}
          width={width}
          height={height}
          sizes="(min-width: 768px) 680px, 100vw"
          className="engraving h-auto w-full"
        />
      </div>
      {caption && <figcaption className="mt-3 text-sm text-paper-dim">{caption}</figcaption>}
    </figure>
  );
}
