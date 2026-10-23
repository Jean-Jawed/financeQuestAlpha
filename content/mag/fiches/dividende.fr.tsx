/**
 * LA GAZETTE - Fiche : C'est quoi un dividende ? (français)
 */

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
        <li>Le dividende est la part du bénéfice qu’une entreprise verse à ses actionnaires.</li>
        <li>Il n’est jamais garanti : l’entreprise peut le réduire ou le supprimer.</li>
        <li>Le jour du détachement, le cours baisse à peu près du montant versé.</li>
        <li>Réinvestis, les dividendes pèsent lourd dans la performance de long terme.</li>
      </Summary>

      <Definition term="Dividende">
        La somme qu’une société distribue à ses actionnaires, prélevée sur ses bénéfices, en général une fois par
        an en Europe et chaque trimestre aux États-Unis.
      </Definition>

      <H2 id="decision">Qui décide, et combien</H2>
      <P>
        Chaque année, l’entreprise choisit ce qu’elle fait de son bénéfice : le garder pour investir et grandir, ou
        en reverser une partie à ses propriétaires, les{' '}
        <MagLink id="action" locale="fr">
          actionnaires
        </MagLink>
        . La proportion versée s’appelle le <Em>taux de distribution</Em>. Les entreprises mûres et stables
        (énergie, banques, biens de consommation) distribuent souvent beaucoup ; les jeunes entreprises en
        croissance, peu ou rien.
      </P>

      <H2 id="calendrier">Les dates à connaître</H2>
      <List>
        <li>
          <Em>La date de détachement</Em> : pour toucher le dividende, il faut détenir l’action la veille au soir. Ce
          jour-là, le cours s’ouvre en baisse d’environ le montant du dividende.
        </li>
        <li>
          <Em>La date de paiement</Em>, quelques jours plus tard : l’argent arrive sur le compte.
        </li>
      </List>
      <P>
        Le détachement explique un piège classique : acheter juste avant pour « toucher le dividende » ne rapporte
        rien de plus. Ce que vous recevez en argent, vous le perdez en valeur de l’action.
      </P>

      <H2 id="rendement">Le rendement du dividende</H2>
      <P>
        On compare souvent le dividende au cours de l’action : 3 € de dividende pour une action à 60 €, c’est un
        rendement de 5 %. Un rendement très élevé doit alerter plutôt que réjouir : il signale souvent que le
        cours a chuté parce que le marché doute que le dividende soit maintenu.
      </P>
      <KeyFigure value="≈ 40 %">
        La part du rendement total du S&amp;P 500 venue des dividendes réinvestis depuis 1930, selon des études
        souvent citées. Les indices de prix, affichés partout, l’ignorent.
      </KeyFigure>

      <H2 id="reinvestir">La force du réinvestissement</H2>
      <P>
        Un dividende réinvesti achète de nouvelles actions, qui versent à leur tour des dividendes. Sur plusieurs
        décennies, cet effet boule de neige fait une grande différence. C’est pour cela qu’il faut comparer un
        placement à un{' '}
        <MagLink id="indice" locale="fr">
          indice
        </MagLink>{' '}
        « dividendes réinvestis », et que de nombreux{' '}
        <MagLink id="etf" locale="fr">
          ETF
        </MagLink>{' '}
        réinvestissent automatiquement ce qu’ils reçoivent.
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Composez un portefeuille sur une date du passé, et regardez-le vivre séance après séance.
      </InlineCta>
    </>
  );
}
