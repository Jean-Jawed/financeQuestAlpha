/**
 * FINANCEQUEST - COMPONENTS: mise en page des articles de La Gazette
 * Intertitres ancrés, encadrés, définitions, chiffres clés, appels à jouer
 */

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

// ==========================================
// TEXTE
// ==========================================

/** Intertitre de section, ancré pour le sommaire */
export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-14 scroll-mt-24 font-display text-3xl font-semibold leading-tight text-paper">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-8 font-display text-xl font-semibold text-paper">{children}</h3>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 text-lg leading-relaxed text-paper-dim">{children}</p>;
}

/** Mot mis en avant dans le texte */
export function Em({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-paper">{children}</strong>;
}

export function List({ children, ordered = false }: { children: React.ReactNode; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag
      className={cn(
        'mt-5 space-y-2 pl-6 text-lg leading-relaxed text-paper-dim marker:text-brass',
        ordered ? 'list-decimal' : 'list-[square]'
      )}
    >
      {children}
    </Tag>
  );
}

// ==========================================
// ENCADRÉS
// ==========================================

/** Définition : le terme, puis son explication en une phrase */
export function Definition({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <aside className="mt-8 rounded border-l-4 border-brass bg-ink-2 px-6 py-5">
      <p className="label text-brass">{term}</p>
      <p className="mt-2 text-paper">{children}</p>
    </aside>
  );
}

/** Chiffre clé, en grand */
export function KeyFigure({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <aside className="certificate mt-8 flex flex-col items-center gap-2 px-6 py-6 text-center sm:flex-row sm:gap-6 sm:text-left">
      <span className="shrink-0 whitespace-nowrap font-display text-4xl font-semibold text-brass md:text-5xl">{value}</span>
      <span className="text-paper-dim">{children}</span>
    </aside>
  );
}

/** Tableau simple : en-têtes, puis lignes */
export function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="panel mt-8 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="label border-b border-line text-[10px]">
            {head.map((cell) => (
              <th key={cell} scope="col" className="px-4 py-3 font-semibold">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.join('|')}>
              {row.map((cell, index) => (
                <td key={index} className={cn('px-4 py-3', index === 0 ? 'text-paper' : 'num text-paper-dim')}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==========================================
// APPELS À JOUER
// ==========================================

interface CtaProps {
  href: string;
  label: string;
  button: string;
  children: React.ReactNode;
}

/** Au fil du texte : un billet perforé, une phrase liée au sujet, un bouton */
export function InlineCta({ href, label, button, children }: CtaProps) {
  return (
    <aside className="my-12 rounded border border-brass/40 bg-ink-2 shadow-plate">
      <div className="perforated h-3 bg-ink" aria-hidden="true" />
      <div className="flex flex-col gap-5 px-6 pb-6 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label text-brass">{label}</p>
          <p className="mt-2 font-display text-xl text-paper">{children}</p>
        </div>
        <Link
          href={href}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded border border-brass-bright/60 bg-brass px-6 font-label text-sm font-semibold uppercase tracking-[0.14em] text-ink shadow-[0_2px_0_#8E7034] transition-colors hover:bg-brass-bright"
        >
          {button}
        </Link>
      </div>
    </aside>
  );
}

/** En fin d'article : le certificat laiton couronné de laurier */
export function FinalCta({
  href,
  title,
  text,
  button,
  note,
}: {
  href: string;
  title: string;
  text: string;
  button: string;
  note: string;
}) {
  return (
    <aside className="certificate relative mt-16 overflow-hidden px-8 py-12 text-center">
      <Image
        src="/gravures/laurier.webp"
        alt=""
        width={320}
        height={320}
        className="engraving mx-auto -mb-4 h-32 w-32 object-contain opacity-80"
      />
      <p className="font-display text-3xl font-semibold text-paper">{title}</p>
      <p className="mx-auto mt-3 max-w-lg text-paper-dim">{text}</p>
      <Link
        href={href}
        className="mt-7 inline-flex h-12 items-center rounded border border-brass-bright/60 bg-brass px-8 font-label text-base font-semibold uppercase tracking-[0.14em] text-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_3px_0_#8E7034] transition-colors hover:bg-brass-bright"
      >
        {button}
      </Link>
      <p className="label mt-4 text-paper-faint">{note}</p>
    </aside>
  );
}
