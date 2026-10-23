/**
 * LA GAZETTE - Fiche : C'est quoi la volatilité ? (français)
 */

import { VolatilityDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, InlineCta, KeyFigure, MagLink, P, Summary, Table } from '@/components/mag/prose';
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
        <li>La volatilité mesure l’ampleur des variations d’un prix, à la hausse comme à la baisse.</li>
        <li>Elle s’exprime en pourcentage annuel : environ 15 à 20 % pour un grand indice.</li>
        <li>Une forte volatilité ne veut pas dire une perte, mais des creux plus profonds en chemin.</li>
        <li>Le VIX, l’« indice de la peur », mesure la volatilité attendue sur le S&amp;P 500.</li>
      </Summary>

      <Definition term="Volatilité">
        L’écart-type des rendements d’un actif, le plus souvent ramené à une année. Plus il est grand, plus le prix
        s’éloigne vite et loin de sa tendance.
      </Definition>

      <H2 id="lire">Comment la lire</H2>
      <P>
        Une volatilité de 20 % par an signifie, grossièrement, que deux années sur trois, le rendement tombe à
        moins de 20 points de sa moyenne, au-dessus ou au-dessous. Rapportée à une seule séance, elle donne des
        variations quotidiennes d’environ 1,3 %. Ce n’est qu’un ordre de grandeur : les marchés connaissent plus de
        journées extrêmes que ne le prévoient les calculs.
      </P>

      <VolatilityDiagram locale="fr" />

      <H2 id="ordres">Les ordres de grandeur</H2>
      <Table
        head={['Actif', 'Volatilité annuelle habituelle']}
        rows={[
          ['Grand indice (S&P 500, CAC 40)', '15 à 20 %'],
          ['Action d’une grande entreprise', '20 à 35 %'],
          ['Petite entreprise, biotech', '40 % et plus'],
          ['Bitcoin', 'souvent 50 à 80 %'],
        ]}
      />

      <H2 id="peur">Le VIX, l’indice de la peur</H2>
      <P>
        Le VIX, calculé par la bourse de Chicago à partir des prix des options, mesure la volatilité que le marché{' '}
        <Em>attend</Em> pour le S&amp;P 500 dans les trente jours à venir. En temps calme, il tourne autour de 12 à
        20. Il s’envole pendant les paniques.
      </P>
      <KeyFigure value="82,69">
        Le record de clôture du VIX, le 16 mars 2020, en pleine panique liée au Covid. Il avait atteint 80,86 en
        novembre 2008.
      </KeyFigure>

      <H2 id="risque">Volatilité et risque</H2>
      <P>
        La volatilité n’est pas la perte définitive : un indice très agité peut finir en forte hausse. Mais elle
        compte, parce qu’on peut être forcé de vendre au pire moment, et parce qu’une forte baisse demande une
        hausse encore plus forte pour être effacée. Les grands{' '}
        <MagLink id="krachs" locale="fr">
          krachs
        </MagLink>{' '}
        sont les moments où elle explose.
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Dans le jeu, la fiche de chaque valeur affiche sa volatilité annualisée : comparez un indice et une crypto.
      </InlineCta>
    </>
  );
}
