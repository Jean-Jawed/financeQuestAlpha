/**
 * LA GAZETTE - Quand vendre une action ? (français)
 */

import { ArchiveFigure } from '@/components/mag/figures';
import { StopLossDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, InlineCta, KeyFigure, List, MagLink, P, Table } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('fr').mag;
const SIGNUP = localizePath('fr', '/signup');

export const toc: TocEntry[] = [
  { id: 'piege', title: 'Le piège du prix d’achat' },
  { id: 'disposition', title: 'L’effet de disposition' },
  { id: 'raisons', title: 'Cinq bonnes raisons de vendre' },
  { id: 'stop', title: 'Le stop, une sortie décidée à l’avance' },
  { id: 'mauvaises', title: 'Les mauvaises raisons' },
  { id: 'regle', title: 'Écrire sa règle de sortie' },
];

export default function Article() {
  return (
    <>
      <P>
        Acheter est facile : on a une idée, un espoir, une histoire. Vendre est bien plus difficile, parce que vendre
        oblige à trancher. Avec un gain, on craint de partir trop tôt ; avec une perte, on refuse de l’admettre. La
        plupart des débutants n’ont pas de mauvaises idées d’achat ; ils n’ont simplement pas de plan de sortie.
      </P>

      <ArchiveFigure
        name="courtier-telescripteur-1894"
        locale="fr"
        alt="Un homme en chapeau haut-de-forme lit le ruban d’un téléscripteur boursier"
        caption="En 1894, un courtier lit les cours sur le ruban d’un téléscripteur. La question n’a pas changé depuis : garder, ou vendre ?"
        layout="side"
      />

      <H2 id="piege">Le piège du prix d’achat</H2>
      <P>
        Le marché ne sait pas à quel prix vous avez acheté, et cela ne l’intéresse pas. Pourtant, ce prix occupe
        presque toute la place dans la tête de l’investisseur : on attend de « revenir à zéro » pour vendre une
        perdante, ou on vend une gagnante dès qu’elle affiche un joli pourcentage.
      </P>
      <P>
        La seule question utile est tournée vers l’avenir : <Em>si je n’avais pas ce titre aujourd’hui, est-ce que je
        l’achèterais à ce prix ?</Em> Si la réponse est non, le garder revient à le racheter chaque jour.
      </P>

      <H2 id="disposition">L’effet de disposition : vendre les gagnants, garder les perdants</H2>
      <Definition term="Effet de disposition">
        La tendance à vendre trop tôt les titres qui ont monté et à garder trop longtemps ceux qui ont baissé. Décrit
        par Hersh Shefrin et Meir Statman en 1985, il découle de l’aversion à la perte : réaliser une perte fait
        plus mal que de la laisser « latente ».
      </Definition>
      <P>
        Terrance Odean l’a mesuré en 1998 sur 10 000 comptes de particuliers américains : ils vendaient leurs titres
        gagnants environ une fois et demie plus volontiers que leurs perdants. Et c’était un mauvais calcul.
      </P>
      <KeyFigure value="3,4 pts">
        Sur l’année suivante, les titres gagnants vendus ont fait mieux que les perdants conservés d’environ
        3,4 points de pourcentage (Odean, 1998). Les investisseurs gardaient précisément les mauvais.
      </KeyFigure>

      <H2 id="raisons">Cinq bonnes raisons de vendre</H2>
      <List ordered>
        <li>
          <Em>La raison de l’achat n’existe plus.</Em> Vous achetiez pour la croissance d’un produit qui est abandonné,
          pour un dirigeant qui part, pour un contrat perdu : l’histoire a changé, le titre doit être réexaminé.
        </li>
        <li>
          <Em>Votre seuil de perte est atteint.</Em> Le niveau où vous aviez décidé, avant d’acheter, d’admettre vous
          être trompé.
        </li>
        <li>
          <Em>La position est devenue trop lourde.</Em> Une valeur qui a doublé peut peser une part démesurée du
          portefeuille. Alléger pour revenir à la répartition voulue, c’est la{' '}
          <MagLink id="avant-de-trader" locale="fr">
            diversification
          </MagLink>{' '}
          appliquée.
        </li>
        <li>
          <Em>Vous avez trouvé mieux.</Em> L’argent placé dans un titre ne l’est pas ailleurs. Une meilleure idée,
          clairement argumentée, est une raison valable de changer.
        </li>
        <li>
          <Em>Vous avez besoin de l’argent.</Em> D’où l’intérêt de n’investir que des sommes dont on n’a pas besoin à
          court terme, pour que ce motif arrive le plus tard possible.
        </li>
      </List>

      <H2 id="stop">Le stop : une sortie décidée à l’avance</H2>
      <P>
        Pour échapper aux biais, le plus simple est de décider de sa sortie <Em>avant</Em> d’entrer, à froid. C’est le
        rôle du stop.
      </P>
      <Definition term="Ordre stop (stop loss)">
        Un ordre de vente qui se déclenche automatiquement si le cours tombe sous un seuil choisi à l’avance. Il
        limite la perte sur une position, sans avoir à surveiller l’écran.
      </Definition>
      <P>
        Le <Em>stop fixe</Em> reste à un niveau donné, par exemple 10 % sous le prix d’achat. Le{' '}
        <Em>stop suiveur</Em> monte avec le cours : il reste toujours à 10 % sous le plus haut atteint, et ne
        redescend jamais. Il protège à la fois contre les pertes et contre le fait de rendre tous ses gains.
      </P>
      <StopLossDiagram locale="fr" />
      <P>
        Deux limites à connaître. Un stop trop serré se déclenche sur de simples variations de bruit : il faut le
        placer en tenant compte de la{' '}
        <MagLink id="volatilite" locale="fr">
          volatilité
        </MagLink>{' '}
        du titre. Et un stop ne garantit pas le prix : si le cours ouvre en forte baisse après une mauvaise nouvelle,
        l’ordre s’exécute au premier prix disponible, parfois bien en dessous du seuil.
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Fixez vos seuils de sortie et tenez-les, séance après séance, sur les cours réels.
      </InlineCta>

      <H2 id="mauvaises">Les mauvaises raisons de vendre (ou de garder)</H2>
      <Table
        head={['Ce qu’on se dit', 'Ce qui se passe vraiment']}
        rows={[
          ['« J’attends de revenir à mon prix d’achat »', 'Le prix d’achat n’a aucune influence sur le cours futur'],
          ['« Je sécurise mon gain, c’est déjà bien »', 'On coupe parfois ses meilleures idées trop tôt'],
          ['« Tout le monde vend, je vends aussi »', 'Les paniques font vendre près des points bas'],
          ['« Ça a trop monté, ça va forcément baisser »', 'Un titre en hausse peut le rester longtemps'],
          ['« Je ne regarde plus, ça finira par remonter »', 'Certaines valeurs ne remontent jamais'],
        ]}
      />
      <P>
        Pensez enfin à la fiscalité : vendre une position gagnante réalise une plus-value, en général imposable selon
        le type de compte et le pays. C’est un coût à intégrer, jamais une raison suffisante de garder un titre dont
        on ne veut plus.
      </P>

      <H2 id="regle">Écrire sa règle de sortie</H2>
      <P>
        La meilleure décision de vente se prend au moment de l’achat. Avant chaque ordre, écrivez trois lignes :
      </P>
      <List>
        <li>
          <Em>Pourquoi j’achète</Em> : l’idée, en une phrase.
        </li>
        <li>
          <Em>Quand je saurai que j’ai tort</Em> : un seuil de prix, ou un événement.
        </li>
        <li>
          <Em>Ce que je ferai si tout va bien</Em> : alléger à partir d’un certain poids, ou suivre avec un stop.
        </li>
      </List>
      <P>
        PastFolio n’exécute pas d’ordres automatiques : c’est à vous d’appliquer votre seuil à chaque séance, en
        regardant la variation de vos positions. Un excellent exercice de discipline, sans le moindre risque, avant de
        le faire avec de l’argent réel.
      </P>
    </>
  );
}
