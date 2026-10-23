/**
 * LA GAZETTE - Fiche : C'est quoi un indice boursier ? (français)
 */

import { IndexDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, InlineCta, MagLink, P, Summary, Table } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('fr').mag;
const SIGNUP = localizePath('fr', '/signup');

export const toc: TocEntry[] = [];

export default function Article() {
  return (
    <>
      <Summary title={mag.summary}>
        <li>Un indice résume en un seul chiffre l’évolution d’un groupe d’actions.</li>
        <li>La plupart pèsent chaque entreprise selon sa taille en bourse.</li>
        <li>Le Dow Jones et le Nikkei 225 font exception : ils pèsent selon le prix de l’action.</li>
        <li>On ne peut pas acheter un indice directement, mais un ETF qui le reproduit.</li>
      </Summary>

      <Definition term="Indice boursier">
        Une moyenne pondérée des cours d’un ensemble d’actions, calculée en continu pendant la séance. Il sert de
        thermomètre à un marché, et de référence pour juger une performance.
      </Definition>

      <H2 id="calcul">Comment il se calcule</H2>
      <P>
        Un indice part d’une valeur de base à une date choisie : 1 000 points au 31 décembre 1987 pour le CAC 40.
        Ensuite, il monte ou baisse selon les variations des actions qui le composent, chacune comptant pour son{' '}
        <Em>poids</Em>.
      </P>

      <IndexDiagram locale="fr" />

      <P>
        Dans la plupart des indices modernes, comme le S&amp;P 500 ou le CAC 40, le poids dépend de la{' '}
        <Em>capitalisation</Em> : plus une entreprise vaut cher en bourse, plus elle fait bouger l’indice. Quelques
        géants peuvent ainsi peser très lourd. Le Dow Jones, créé en 1896 avec douze valeurs, et le Nikkei 225
        sont pondérés par le <Em>prix</Em> : une action à 500 $ y compte plus qu’une action à 50 $, quelle que soit
        la taille des entreprises.
      </P>

      <H2 id="grands-indices">Les indices à connaître</H2>
      <Table
        head={['Indice', 'Marché', 'Valeurs']}
        rows={[
          ['S&P 500', 'Grandes entreprises américaines', '500'],
          ['Dow Jones', 'Grandes valeurs américaines', '30'],
          ['Nasdaq Composite', 'Bourse Nasdaq, très technologique', 'plus de 3 000'],
          ['CAC 40', 'Bourse de Paris', '40'],
          ['DAX', 'Bourse de Francfort', '40'],
          ['Nikkei 225', 'Bourse de Tokyo', '225'],
        ]}
      />

      <H2 id="dividendes">Un piège : les dividendes</H2>
      <P>
        La plupart des indices affichés dans les journaux sont des indices <Em>de prix</Em> : ils ne comptent pas
        les{' '}
        <MagLink id="dividende" locale="fr">
          dividendes
        </MagLink>{' '}
        versés. Or, sur le long terme, ces dividendes représentent une part importante du gain d’un actionnaire.
        Pour comparer honnêtement, il faut regarder la version « dividendes réinvestis », comme le CAC 40 GR.
      </P>
      <P>
        On ne peut pas acheter un indice : c’est un calcul, pas un titre. Pour en suivre un, on achète un{' '}
        <MagLink id="etf" locale="fr">
          ETF
        </MagLink>{' '}
        qui le reproduit.
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Le journal des marchés du jeu affiche chaque jour le S&amp;P 500, le CAC 40 et le Nikkei de la date
        simulée.
      </InlineCta>
    </>
  );
}
