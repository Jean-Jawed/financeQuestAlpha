/**
 * LA GAZETTE - Ce qu'il faut savoir avant de commencer à trader (français)
 */

import { ArchiveFigure } from '@/components/mag/figures';
import { DiversificationDiagram, FeesDiagram, LossRecoveryDiagram, ShortPayoffDiagram, SpreadDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, InlineCta, KeyFigure, List, P } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('fr').mag;
const SIGNUP = localizePath('fr', '/signup');

export const toc: TocEntry[] = [
  { id: 'trader-investir', title: 'Trader, investir, spéculer' },
  { id: 'cours', title: 'Ce qu’est vraiment un cours' },
  { id: 'rendement-risque', title: 'Rendement et risque' },
  { id: 'diversification', title: 'La diversification' },
  { id: 'frais', title: 'Les frais' },
  { id: 'vente-a-decouvert', title: 'La vente à découvert' },
  { id: 'levier', title: 'L’effet de levier' },
  { id: 'biais', title: 'Les biais psychologiques' },
  { id: 'entrainement', title: 'S’entraîner d’abord' },
];

export default function Article() {
  return (
    <>
      <P>
        Trader, c’est acheter et vendre des actifs financiers (actions, indices, matières premières, devises,
        cryptomonnaies) dans l’espoir de profiter de leurs variations de prix. L’idée est simple ; la pratique,
        beaucoup moins. Avant le premier ordre, il faut comprendre ce qu’est un cours, comment le risque
        accompagne toujours le rendement, ce que coûtent les frais, et pourquoi notre propre cerveau est souvent
        notre pire conseiller.
      </P>

      <ArchiveFigure
        name="bourse-paris-xixe"
        locale="fr"
        alt="Le palais de la Bourse de Paris, gravure du XIXe siècle"
        caption="Le palais Brongniart, siège de la Bourse de Paris de 1826 à 1987. On y criait les cours à la corbeille."
      />

      <H2 id="trader-investir">Trader, investir, spéculer : trois choses différentes</H2>
      <P>
        Les trois mots sont souvent employés l’un pour l’autre. Ils désignent pourtant des démarches distinctes,
        qui ne demandent ni le même temps, ni le même tempérament.
      </P>
      <List>
        <li>
          <Em>Investir</Em>, c’est acheter une part d’entreprise, d’obligation ou d’indice pour la garder des
          années, en comptant sur la croissance des bénéfices, les dividendes ou les intérêts.
        </li>
        <li>
          <Em>Trader</Em>, c’est intervenir sur des durées plus courtes, de quelques minutes à quelques semaines,
          pour tirer parti des mouvements de prix plutôt que de la valeur de long terme.
        </li>
        <li>
          <Em>Spéculer</Em>, c’est parier sur un mouvement de prix précis, souvent avec des positions concentrées
          ou de l’effet de levier. Toute opération de trading comporte une part de spéculation.
        </li>
      </List>
      <P>
        La différence compte, parce que les règles du jeu changent avec l’horizon. Sur dix ans, une action suit en
        général la santé de l’entreprise. Sur une journée, son cours dépend surtout de l’humeur du marché, des
        nouvelles et du hasard.
      </P>

      <H2 id="cours">Ce qu’est vraiment un cours</H2>
      <P>
        Un cours n’est pas la « valeur » d’une entreprise. C’est le prix auquel le dernier échange a eu lieu entre
        un acheteur et un vendeur. À chaque instant, le carnet d’ordres affiche deux prix : le meilleur prix
        proposé par les acheteurs, et le meilleur prix demandé par les vendeurs.
      </P>
      <Definition term="Fourchette (spread)">
        L’écart entre le meilleur prix d’achat proposé et le meilleur prix de vente demandé. C’est un coût caché :
        acheter puis revendre immédiatement fait perdre cet écart.
      </Definition>
      <P>
        Deux types d’ordres suffisent pour commencer. L’<Em>ordre au marché</Em> s’exécute tout de suite, au
        meilleur prix disponible, quel qu’il soit. L’<Em>ordre à cours limité</Em> fixe un prix maximum à
        l’achat, ou minimum à la vente : il protège du mauvais prix, mais peut ne jamais s’exécuter.
      </P>
      <P>
        Dans FinanceQuest, les ordres passent au <Em>cours de clôture</Em> de la séance, le dernier prix de la
        journée. C’est le prix de référence que retiennent les journaux, les indices et les fonds.
      </P>

      <SpreadDiagram locale="fr" />

      <H2 id="rendement-risque">Le rendement ne va jamais sans le risque</H2>
      <P>
        C’est la règle la plus importante de la finance : un rendement espéré plus élevé se paie toujours par un
        risque plus élevé. Un placement qui promet beaucoup sans risque est, presque toujours, une arnaque.
      </P>
      <Definition term="Volatilité">
        L’ampleur des variations d’un prix, mesurée par l’écart-type de ses rendements, le plus souvent en rythme
        annuel. Plus elle est forte, plus le prix peut s’éloigner vite de son point de départ, dans un sens comme
        dans l’autre.
      </Definition>
      <P>
        Les grands indices boursiers ont historiquement une volatilité de l’ordre de 15 à 20 % par an. Une action
        seule est en général plus agitée, et une cryptomonnaie comme le bitcoin l’est souvent deux à quatre fois
        plus qu’un indice. Plus la volatilité est forte, plus les pertes temporaires peuvent être profondes, et
        c’est là que l’arithmétique devient cruelle.
      </P>
      <LossRecoveryDiagram locale="fr" />
      <P>
        Une perte et un gain de même pourcentage ne s’annulent pas : après −50 %, il faut doubler pour revenir au
        point de départ. C’est pourquoi les traders expérimentés pensent d’abord à limiter leurs pertes, avant de
        chercher à maximiser leurs gains.
      </P>

      <H2 id="diversification">Diversifier : ne pas tout miser sur une valeur</H2>
      <P>
        Une entreprise peut rater un produit, perdre un procès ou faire faillite. Ce risque propre à chaque société
        se réduit fortement quand on répartit son capital entre plusieurs valeurs, de secteurs, de pays et de
        classes d’actifs différents. Les mauvaises surprises des unes sont alors compensées, en partie, par les
        bonnes surprises des autres.
      </P>
      <P>
        La diversification a une limite : elle ne protège pas du risque de marché, celui qui touche tout le monde
        en même temps. En 2008 ou en mars 2020, presque toutes les actions ont baissé ensemble. Mélanger des actifs
        qui réagissent différemment (actions, obligations, or, devises) amortit mieux ces chocs que d’accumuler
        des actions semblables.
      </P>
      <DiversificationDiagram locale="fr" />

      <KeyFigure value="5 à 10 %">
        Une règle de prudence répandue : ne jamais engager plus de 5 à 10 % de son capital sur une seule position.
      </KeyFigure>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Construisez un portefeuille diversifié sur une date du passé, puis regardez-le traverser les séances
        suivantes.
      </InlineCta>

      <H2 id="frais">Les frais, ce poison lent</H2>
      <P>
        Chaque ordre coûte : frais de courtage, fourchette, parfois taxes. Pris un par un, ils semblent minimes.
        Accumulés, ils deviennent l’un des premiers facteurs de sous-performance, surtout chez ceux qui passent
        beaucoup d’ordres.
      </P>
      <P>
        Un exemple simple : avec 0,1 % de frais à l’achat et 0,1 % à la vente, un aller-retour coûte 0,2 % du
        montant engagé. Cent allers-retours par an sur la totalité du capital, et ce sont 20 % du capital qui
        partent en frais, avant même le premier gain. Sur le long terme, 1 % de frais annuels en plus suffit à
        réduire d’environ un quart le capital final au bout de trente ans.
      </P>
      <P>
        Dans le jeu, chaque partie applique des frais de courtage sur chaque ordre, et le ticket les affiche avant
        validation. C’est un bon moyen de sentir combien la fréquence des ordres pèse sur le résultat.
      </P>

      <FeesDiagram locale="fr" />

      <H2 id="vente-a-decouvert">Vendre à découvert : gagner à la baisse</H2>
      <Definition term="Vente à découvert">
        Vendre un titre que l’on ne possède pas, en l’empruntant, pour le racheter plus tard. On gagne si le cours
        baisse entre la vente et le rachat ; on perd s’il monte.
      </Definition>

      <ArchiveFigure
        name="triomphe-ours-1903"
        locale="fr" layout="side"
        alt="Caricature d’un ours brandissant une épée au-dessus d’un taureau terrassé, sous la foule de Wall Street"
        caption="« Le triomphe de l’ours dans l’arène de Wall Street » : l’ours, qui gagne à la baisse, terrasse le taureau. Puck, 1903."
      />
      <P>
        La vente à découvert est utile : elle permet de parier contre une valeur jugée trop chère, ou de protéger
        un portefeuille. Mais son profil de risque est inversé. À l’achat, la perte maximale est la mise : un titre
        ne peut pas valoir moins que zéro. À découvert, le gain maximal est de 100 % (si le titre tombe à zéro),
        alors que la perte n’a <Em>pas de plafond</Em> : un cours peut doubler, tripler, ou davantage.
      </P>
      <P>
        Quand de nombreux vendeurs à découvert doivent racheter en même temps, leurs achats font encore monter le
        cours : c’est un <Em>short squeeze</Em>. En janvier 2021, l’action GameStop a été multipliée par plus de
        dix en quelques semaines, en partie pour cette raison, infligeant de lourdes pertes aux vendeurs.
      </P>
      <P>
        C’est pourquoi le produit d’une vente à découvert reste bloqué en garantie, et qu’une marge minimale est
        exigée. FinanceQuest applique cette logique : votre valeur nette doit couvrir la moitié de vos positions à
        découvert.
      </P>

      <ShortPayoffDiagram locale="fr" />

      <H2 id="levier">L’effet de levier et le risque de ruine</H2>
      <P>
        L’effet de levier consiste à engager plus d’argent que l’on n’en possède, en empruntant. Avec un levier de
        10, une hausse de 1 % rapporte 10 %… et une baisse de 10 % efface la totalité de la mise. Au-delà, le
        courtier exige des fonds supplémentaires (un <Em>appel de marge</Em>) ou ferme la position d’office, au
        pire moment.
      </P>
      <P>
        Le levier ne change pas la qualité d’une décision ; il change seulement la vitesse à laquelle on gagne ou
        on perd. Pour un débutant, il transforme des erreurs ordinaires en pertes irréversibles. Les régulateurs
        européens obligent d’ailleurs les courtiers en CFD, des produits à fort levier, à afficher la part de
        comptes de particuliers qui perdent de l’argent : elle dépasse souvent 70 %.
      </P>

      <H2 id="biais">Vos pires ennemis : vos propres biais</H2>
      <P>
        Les études de finance comportementale le montrent depuis les travaux de Daniel Kahneman et Amos Tversky :
        nous ne décidons pas comme des machines à calculer. Quelques biais reviennent sans cesse chez les
        traders.
      </P>

      <ArchiveFigure
        name="foule-wall-street-1929"
        locale="fr"
        alt="Foule dense massée devant la Bourse de New York"
        caption="Le 24 octobre 1929, le « jeudi noir », la foule se presse devant la Bourse de New York. La panique se propage d’un investisseur à l’autre."
      />
      <List>
        <li>
          <Em>L’aversion à la perte</Em> : une perte fait environ deux fois plus mal qu’un gain équivalent ne fait
          plaisir. On garde alors des positions perdantes « jusqu’à ce qu’elles remontent ».
        </li>
        <li>
          <Em>L’effet de disposition</Em>, son corollaire : on vend trop tôt ce qui gagne, et trop tard ce qui
          perd.
        </li>
        <li>
          <Em>L’excès de confiance</Em> : quelques succès suffisent à se croire plus fort que le marché, et à
          augmenter ses mises.
        </li>
        <li>
          <Em>La peur de manquer une hausse</Em> : on achète ce qui vient de monter fortement, souvent près d’un
          sommet.
        </li>
        <li>
          <Em>Le biais de confirmation</Em> : on ne retient que les informations qui donnent raison à sa position.
        </li>
      </List>
      <P>
        Le meilleur remède est la méthode : décider à l’avance de ses règles (taille des positions, seuil de
        sortie, raisons d’acheter), les écrire, et les relire avant chaque ordre.
      </P>

      <H2 id="entrainement">S’entraîner avant de risquer de l’argent</H2>
      <P>
        Aucun pilote n’apprend en avion de ligne. Un simulateur permet de faire ses erreurs sans en payer le prix :
        sentir l’effet des frais, voir un portefeuille trop concentré plonger, constater qu’une position à
        découvert peut déraper, et mesurer ses décisions au rendement.
      </P>
      <P>
        FinanceQuest repose sur une règle qui rend l’exercice honnête : vous rejouez le passé avec les cours réels,
        mais <Em>sans jamais voir le lendemain</Em>. Impossible d’utiliser ce que l’on sait aujourd’hui ; on décide
        avec l’information du moment, comme un investisseur de l’époque. Une bonne façon de tester ses règles
        avant de les appliquer pour de vrai, et de découvrir son propre tempérament face aux hausses et aux
        baisses.
      </P>
    </>
  );
}
