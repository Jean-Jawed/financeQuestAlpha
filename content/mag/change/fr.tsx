/**
 * LA GAZETTE - Le change : quand la devise décide de votre performance (français)
 */

import { FxDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, InlineCta, KeyFigure, List, MagLink, P, Table } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('fr').mag;
const SIGNUP = localizePath('fr', '/signup');

export const toc: TocEntry[] = [
  { id: 'lire', title: 'Lire un taux de change' },
  { id: 'deux-paris', title: 'Deux paris en un' },
  { id: 'exemples', title: '2017 et 2022 : deux exemples réels' },
  { id: 'proteger', title: 'Peut-on s’en protéger ?' },
  { id: 'jeu', title: 'Le change dans FinanceQuest' },
];

export default function Article() {
  return (
    <>
      <P>
        Quand un épargnant européen achète une action américaine, japonaise ou suisse, il ne prend pas seulement un
        risque sur l’entreprise. Il échange d’abord ses euros contre une autre monnaie, et il devra un jour faire
        le chemin inverse. Entre les deux, le cours de cette monnaie aura bougé, parfois autant que l’action
        elle-même.
      </P>

      <H2 id="lire">Lire un taux de change</H2>
      <Definition term="Taux de change EUR/USD">
        Le nombre de dollars qu’il faut pour acheter un euro. À 1,10, un euro vaut 1,10 dollar, et un dollar vaut
        environ 0,91 euro.
      </Definition>
      <P>
        Quand l’EUR/USD monte, l’euro se renforce : chaque dollar que vous détenez vaut moins d’euros. Quand il
        baisse, c’est l’inverse. Ces mouvements dépendent surtout des taux d’intérêt fixés par les banques
        centrales, de la croissance et des crises : en période de panique, les investisseurs se réfugient souvent
        dans le dollar, le franc suisse ou le yen.
      </P>

      <H2 id="deux-paris">Deux paris en un</H2>
      <P>
        La performance d’un placement étranger, mesurée en euros, combine deux mouvements : celui de l’actif dans
        sa monnaie, et celui de cette monnaie face à l’euro. Ils s’additionnent à peu près.
      </P>
      <FxDiagram locale="fr" />
      <P>
        Une action qui ne bouge pas à New York peut donc faire perdre de l’argent à un investisseur européen,
        simplement parce que le dollar a baissé. À l’inverse, un dollar qui se renforce peut amortir une baisse.
      </P>

      <H2 id="exemples">2017 et 2022 : deux exemples réels</H2>
      <Table
        head={['Année', 'S&P 500 en dollars', 'EUR/USD sur l’année', 'S&P 500 en euros']}
        rows={[
          ['2017', '+19 %', 'de 1,05 à 1,20', 'environ +5 %'],
          ['2022', '−19 %', 'de 1,14 à 1,07', 'environ −14 %'],
        ]}
      />
      <P>
        En 2017, l’indice américain a gagné près de 20 %, mais l’euro s’est envolé : un épargnant européen n’en a
        gardé qu’environ un quart. En 2022, c’est l’inverse. L’indice a perdu près de 20 %, mais le dollar s’est
        renforcé au point que l’euro est passé sous la parité pendant l’été : en euros, la perte n’a été que
        d’environ 14 %.
      </P>
      <KeyFigure value="−3/4">
        En 2017, le change a effacé environ les trois quarts de la hausse du S&amp;P 500 pour un investisseur en
        euros.
      </KeyFigure>

      <H2 id="proteger">Peut-on s’en protéger ?</H2>
      <List>
        <li>
          <Em>Les fonds couverts</Em> : certains{' '}
          <MagLink id="etf" locale="fr">
            ETF
          </MagLink>{' '}
          existent en version « couverte en euros ». Ils neutralisent l’essentiel des variations du change, contre
          un coût qui dépend de l’écart de taux d’intérêt entre les deux monnaies.
        </li>
        <li>
          <Em>La diversification</Em> : détenir des actifs dans plusieurs monnaies évite qu’une seule pèse sur tout
          le portefeuille.
        </li>
        <li>
          <Em>Le temps</Em> : sur de longues périodes, les effets de change ont tendance à se compenser en partie,
          sans que rien ne le garantisse.
        </li>
      </List>
      <P>
        Attention aussi aux frais : beaucoup de courtiers prennent une commission à chaque conversion, souvent
        quelques dixièmes de pour cent, qui s’ajoutent aux{' '}
        <MagLink id="avant-de-trader" locale="fr">
          frais de courtage
        </MagLink>
        .
      </P>

      <H2 id="jeu">Le change dans FinanceQuest</H2>
      <P>
        Chaque partie a sa devise de jeu, choisie au départ. Les actifs restent cotés dans leur monnaie
        d’origine : dollar pour Wall Street, yen pour Tokyo, livre pour Londres. Votre solde, vos coûts moyens et
        votre performance sont convertis au taux de change réel du jour simulé. Une action américaine peut donc
        monter à New York et peser sur votre portefeuille en euros, exactement comme dans la réalité. Le scénario{' '}
        <Em>Orient</Em>, avec ses bourses asiatiques, y est particulièrement sensible.
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Choisissez votre devise de jeu et achetez à l’étranger : le change fera le reste.
      </InlineCta>
    </>
  );
}
