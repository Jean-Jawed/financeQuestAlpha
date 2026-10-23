/**
 * LA GAZETTE - Fiche : C'est quoi un ETF ? (français)
 */

import { EtfDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, InlineCta, KeyFigure, List, MagLink, P, Summary } from '@/components/mag/prose';
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
        <li>Un ETF est un fonds coté en bourse qui reproduit un indice.</li>
        <li>Une seule part donne accès à des dizaines, voire des milliers d’entreprises.</li>
        <li>Ses frais sont faibles, souvent moins de 0,3 % par an.</li>
        <li>Il monte et baisse avec son indice : il ne protège pas d’un krach.</li>
      </Summary>

      <Definition term="ETF (Exchange Traded Fund)">
        Un fonds d’investissement coté en bourse, qui cherche à reproduire le plus fidèlement possible la
        performance d’un indice. En français, on dit aussi « tracker » ou « fonds indiciel coté ».
      </Definition>

      <H2 id="principe">Le principe : tout un panier en une part</H2>
      <P>
        Pour suivre le{' '}
        <MagLink id="indice" locale="fr">
          S&amp;P 500
        </MagLink>
        , il faudrait acheter les actions de 500 entreprises américaines, chacune dans la bonne proportion, et
        rééquilibrer sans cesse. Un ETF le fait pour vous : le gestionnaire détient ces actions, et vous achetez
        des parts du fonds, en bourse, comme une action ordinaire.
      </P>

      <EtfDiagram locale="fr" />

      <P>
        Le premier ETF américain, le SPDR S&amp;P 500, a été lancé en janvier 1993. C’est aujourd’hui l’un des
        titres les plus échangés au monde, et les ETF gèrent ensemble des milliers de milliards de dollars.
      </P>

      <H2 id="avantages">Pourquoi ils ont autant de succès</H2>
      <List>
        <li>
          <Em>La diversification immédiate</Em> : une seule part répartit le risque sur tout l’indice.
        </li>
        <li>
          <Em>Des frais bas</Em> : pas de gérant qui choisit les titres, seulement une réplication. Les
          grands ETF prennent souvent entre 0,05 % et 0,3 % par an, contre 1,5 à 2 % pour beaucoup de fonds
          gérés activement.
        </li>
        <li>
          <Em>La simplicité</Em> : on l’achète et on le revend à tout moment de la séance, au prix du marché.
        </li>
      </List>
      <KeyFigure value="0,2 %">
        Des frais annuels typiques pour un ETF sur un grand indice. Sur trente ans, chaque point de frais évité
        peut représenter près d’un quart du capital final.
      </KeyFigure>

      <H2 id="limites">Ce qu’un ETF ne fait pas</H2>
      <P>
        Un ETF suit son indice, à la hausse comme à la baisse. Quand le marché perd 30 %, l’ETF perd à peu près
        30 %. Il ne vous fera jamais battre le marché : c’est même sa promesse de ne pas le faire. Il faut aussi
        vérifier ce qu’il contient. Un ETF sur un seul secteur ou un seul pays est bien moins diversifié qu’un
        ETF mondial. Et s’il est coté en dollars, vous portez un{' '}
        <MagLink id="change" locale="fr">
          risque de change
        </MagLink>
        .
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Dans FinanceQuest, les grands indices s’achètent comme une action : l’équivalent d’un ETF, sans frais de
        gestion.
      </InlineCta>
    </>
  );
}
