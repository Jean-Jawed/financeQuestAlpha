/**
 * LA GAZETTE - Pourquoi la plupart des traders particuliers perdent de l'argent (français)
 */

import { ArchiveFigure } from '@/components/mag/figures';
import { TradingFrequencyDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, InlineCta, KeyFigure, List, MagLink, P, Table } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('fr').mag;
const SIGNUP = localizePath('fr', '/signup');

export const toc: TocEntry[] = [
  { id: 'chiffres', title: 'Ce que disent les chiffres' },
  { id: 'frais', title: 'Les frais, une pente à remonter' },
  { id: 'levier', title: 'Le levier' },
  { id: 'adversaires', title: 'Face à des professionnels' },
  { id: 'biais', title: 'Les biais' },
  { id: 'methode', title: 'Faire partie de la minorité' },
];

export default function Article() {
  return (
    <>
      <P>
        Les publicités montrent des traders qui gagnent depuis leur canapé. Les études, elles, racontent une autre
        histoire : sur la plupart des marchés et des périodes étudiés, une large majorité des particuliers qui
        tradent activement perdent de l’argent. Ce n’est pas une fatalité, mais il faut comprendre pourquoi, avant
        d’espérer faire mieux.
      </P>

      <H2 id="chiffres">Ce que disent les chiffres</H2>
      <P>
        Les régulateurs et les chercheurs ont mesuré le phénomène à plusieurs reprises, sur des produits et des pays
        différents. Les résultats se ressemblent.
      </P>
      <Table
        head={['Étude', 'Population observée', 'Résultat']}
        rows={[
          ['AMF (France), 2014', 'Particuliers sur le Forex, 2009-2012', '89 % de perdants, perte moyenne ≈ 11 000 €'],
          ['ESMA (Europe), 2018', 'Comptes de particuliers sur CFD', '74 à 89 % de comptes perdants'],
          ['Barber et Odean, 2000', '66 000 foyers américains, 1991-1996', 'Les plus actifs : 11,4 %/an, contre 17,9 % pour le marché'],
          ['Chague et al., 2019', 'Day traders brésiliens tenant plus de 300 séances', '97 % de perdants'],
        ]}
      />
      <P>
        Depuis 2018, les courtiers européens en CFD, des produits à fort effet de levier, doivent d’ailleurs afficher
        sur leur site la proportion de comptes de particuliers qui perdent de l’argent. Elle dépasse le plus souvent
        70 %.
      </P>
      <KeyFigure value="97 %">
        Des Brésiliens qui ont pratiqué le day trading plus de 300 jours ont perdu de l’argent ; à peine plus de 1 %
        en ont tiré plus que le salaire minimum (Chague, De-Losso et Giovannetti, 2019).
      </KeyFigure>

      <H2 id="frais">Les frais : une pente à remonter chaque jour</H2>
      <P>
        Chaque ordre coûte quelque chose : une commission, la{' '}
        <Em>fourchette</Em> entre prix d’achat et prix de vente, parfois des frais de financement. Pris un par un, ces
        coûts semblent négligeables. Multipliés par le nombre d’ordres, ils deviennent le premier adversaire du trader
        actif.
      </P>
      <KeyFigure value="−39 %">
        Ce que coûte, en un an, un aller-retour quotidien avec seulement 0,1 % de frais par ordre : 500 ordres sur 250
        séances grignotent près de 40 % du capital, avant même de compter les gains ou les pertes.
      </KeyFigure>
      <P>
        C’est la conclusion de Barber et Odean : les foyers qui tradaient le plus ne choisissaient pas forcément de
        plus mauvais titres, mais leurs frais effaçaient l’essentiel de leur rendement. Moins d’ordres, c’est souvent
        mieux.
      </P>
      <TradingFrequencyDiagram locale="fr" />

      <H2 id="levier">Le levier, accélérateur de ruine</H2>
      <P>
        Les produits les plus vendus aux particuliers, CFD et Forex en tête, fonctionnent avec un effet de levier :
        on engage bien plus que sa mise. Avec un levier de 20, une variation de 5 % contre soi suffit à perdre la
        totalité de la somme engagée.
      </P>
      <Definition term="CFD (contrat sur la différence)">
        Un contrat qui permet de parier sur la hausse ou la baisse d’un actif sans le posséder, en général avec un
        effet de levier. Le gain ou la perte est la différence de prix entre l’ouverture et la fermeture de la
        position.
      </Definition>
      <P>
        Le levier n’améliore pas les décisions : il accélère leurs conséquences. Or les débutants se trompent souvent ;
        c’est normal. Avec du levier, ces erreurs ordinaires ne laissent pas le temps d’apprendre.
      </P>

      <H2 id="adversaires">Face à des professionnels mieux armés</H2>
      <P>
        Sur les durées courtes, le trading ressemble à un jeu à somme nulle, avant frais : ce que gagne l’un, un autre
        le perd. Or, de l’autre côté de l’écran, on trouve des fonds, des banques et des{' '}
        <MagLink id="micro-trading" locale="fr">
          algorithmes à haute fréquence
        </MagLink>{' '}
        qui disposent de meilleures données, de coûts plus faibles et d’une exécution plus rapide.
      </P>
      <P>
        Chercher à battre ces acteurs sur quelques minutes, c’est jouer sur leur terrain. Le particulier a d’autres
        atouts : il n’a pas de comptes à rendre chaque trimestre, il peut attendre, et il peut ne rien faire.
      </P>

      <ArchiveFigure
        name="panique-1907"
        locale="fr"
        alt="Foule massée dans une rue de Wall Street pendant la panique de 1907"
        caption="Wall Street pendant la panique d’octobre 1907. Quand la peur gagne la foule, les particuliers vendent souvent au pire moment."
      />

      <H2 id="biais">Les biais : le cerveau contre le portefeuille</H2>
      <P>
        La finance comportementale a montré que nos réflexes naturels sont mal adaptés aux marchés. Trois biais pèsent
        particulièrement sur les traders particuliers.
      </P>
      <List>
        <li>
          <Em>L’excès de confiance.</Em> Quelques gains suffisent à se croire doué. On trade alors davantage, on
          augmente ses mises, et les frais comme les pertes grossissent.
        </li>
        <li>
          <Em>L’effet de disposition.</Em> On vend vite ce qui gagne pour « sécuriser » et on garde ce qui perd en
          espérant revenir à son prix d’achat. Résultat : des petits gains et de grosses pertes (voir{' '}
          <MagLink id="quand-vendre" locale="fr">
            quand vendre une action
          </MagLink>
          ).
        </li>
        <li>
          <Em>La recherche du coup.</Em> Suivre une rumeur, un forum ou un titre qui vient de bondir de 50 %, souvent
          trop tard, quand les premiers acheteurs commencent à vendre.
        </li>
      </List>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Mesurez vos propres biais sans risquer un euro : rejouez une crise sur les cours réels.
      </InlineCta>

      <H2 id="methode">Comment faire partie de la minorité</H2>
      <P>
        Il n’existe pas de méthode garantie, mais les mêmes habitudes reviennent chez ceux qui s’en sortent mieux que
        la moyenne.
      </P>
      <List ordered>
        <li>
          <Em>Trader moins souvent.</Em> Chaque ordre doit avoir une raison écrite, pas seulement une envie.
        </li>
        <li>
          <Em>Limiter le risque par position.</Em> Une règle courante : ne jamais risquer plus de 1 à 2 % de son
          capital sur une seule idée.
        </li>
        <li>
          <Em>Décider de la sortie avant l’entrée</Em> : à quel prix on admet s’être trompé, et pourquoi.
        </li>
        <li>
          <Em>Éviter le levier</Em> tant que l’on n’a pas fait ses preuves sans lui.
        </li>
        <li>
          <Em>Tenir un journal</Em> : chaque ordre, sa raison, son résultat. On apprend plus de ses erreurs écrites
          que de ses souvenirs.
        </li>
        <li>
          <Em>S’entraîner d’abord.</Em> Les erreurs coûtent moins cher sur un simulateur.
        </li>
      </List>
      <P>
        Dans PastFolio, les frais sont appliqués à chaque ordre et le lendemain reste inconnu, comme sur un vrai
        marché. Le bilan de fin de partie compare votre résultat à celui de l’indice du scénario : vous voyez si
        votre activité vous a rapporté quelque chose, ou si elle vous a coûté.
      </P>
    </>
  );
}
