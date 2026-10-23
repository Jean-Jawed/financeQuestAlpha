/**
 * FINANCEQUEST - LANDING: CorbeilleScene
 * La gravure de la corbeille « s'imprime » au fil du défilement : d'abord le trait,
 * de haut en bas comme une épreuve tirée de la presse, puis l'image entière s'ouvre
 * depuis le centre. Trois légendes se succèdent, la bande de cotations traverse l'écran.
 */

import Image from 'next/image';
import { TickerTape, type TickerTapeItem } from '@/components/brand/ticker-tape';
import { ScrollScene } from './scroll-scene';
import { sceneFrom, sceneWindow } from './scene-style';

interface CorbeilleSceneProps {
  alt: string;
  caption: string;
  /** Trois légendes successives */
  lines: [string, string, string];
  tickerTitle: string;
  ticker: TickerTapeItem[];
}

// Avancement du trait (0 → 0,45) puis de l'image complète (0,35 → 0,8)
const LINES_REVEAL = 'clamp(0, calc(var(--p) / 0.45), 1)';
const FULL_REVEAL = 'clamp(0, calc((var(--p) - 0.35) / 0.45), 1)';

export function CorbeilleScene({ alt, caption, lines, tickerTitle, ticker }: CorbeilleSceneProps) {
  return (
    <ScrollScene screens={3} stageClassName="flex flex-col items-center justify-center" aria-labelledby="corbeille-caption">
      <figure className="relative mx-auto w-full max-w-6xl px-4">
        <div className="relative overflow-hidden rounded border-[6px] border-double border-brass/60 bg-paper p-2 shadow-lift">
          <div className="relative h-[60svh] max-h-[600px] sm:h-[68svh]">
            {/* Le trait seul : très contrasté, révélé de haut en bas */}
            <Image
              src="/gravures/corbeille.webp"
              alt=""
              fill
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="engraving object-cover [filter:grayscale(1)_contrast(2.2)_brightness(1.25)]"
              style={{ clipPath: `inset(0 0 calc((1 - ${LINES_REVEAL}) * 100%) 0)` }}
            />
            {/* L'épreuve complète, qui s'ouvre depuis le centre */}
            <Image
              src="/gravures/corbeille.webp"
              alt={alt}
              fill
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="engraving object-cover"
              style={{ clipPath: `circle(calc(${FULL_REVEAL} * 80%) at 50% 55%)` }}
            />
          </div>
        </div>
        <figcaption id="corbeille-caption" className="label mt-3 text-center text-paper-faint">
          {caption}
        </figcaption>

        {/* Légendes successives, sur un bandeau d'encre */}
        <div className="pointer-events-none absolute inset-x-4 bottom-16 flex justify-center sm:bottom-24">
          {lines.map((line, index) => (
            <p
              key={line}
              className="absolute bottom-0 max-w-[90%] rounded bg-ink/85 px-5 py-3 text-center font-display text-xl italic text-paper shadow-lift backdrop-blur-sm sm:text-3xl"
              style={index < 2 ? sceneWindow(0.04 + index * 0.3, 0.3 + index * 0.3) : sceneFrom(0.66)}
            >
              {line}
            </p>
          ))}
        </div>
      </figure>

      {/* La bande de cotations traverse l'écran en biais */}
      {ticker.length > 0 && (
        <div
          className="pointer-events-none absolute -left-[10%] -right-[10%] top-[12%]"
          style={{
            ...sceneFrom(0.5, 0.1),
            transform: 'rotate(-3deg) translateX(calc((0.75 - var(--p)) * 40%))',
          }}
        >
          <p className="sr-only">{tickerTitle}</p>
          <TickerTape items={ticker} className="shadow-lift" />
        </div>
      )}
    </ScrollScene>
  );
}
