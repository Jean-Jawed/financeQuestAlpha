/**
 * LA GAZETTE - Les grands krachs boursiers, de 1720 à 2020 (français)
 */

import { CrashesDiagram } from '@/components/mag/diagrams';
import { ArchiveFigure } from '@/components/mag/figures';
import { Definition, Em, H2, InlineCta, KeyFigure, List, MagLink, P, Table } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('fr').mag;
const SIGNUP = localizePath('fr', '/signup');

export const toc: TocEntry[] = [
  { id: 'bulles', title: '1720 : les premières bulles' },
  { id: 'xixe', title: 'Or et paniques du XIXe siècle' },
  { id: '1929', title: '1929 : le grand krach' },
  { id: '1987', title: '1987 : le lundi noir' },
  { id: '2000', title: '2000 : la bulle internet' },
  { id: '2008', title: '2008 : la crise financière' },
  { id: '2020', title: '2020 : le krach éclair' },
  { id: 'remonter', title: 'Combien de temps pour remonter' },
  { id: 'lecons', title: 'Ce que les krachs enseignent' },
];

export default function Article() {
  return (
    <>
      <P>
        Un krach est une chute brutale et généralisée des cours, souvent de plus de 20 % en quelques jours ou
        quelques semaines. Chacun a ses causes propres, mais presque tous suivent le même scénario : une histoire
        séduisante, de l’argent emprunté pour en profiter, des prix qui décollent de la réalité, puis un
        déclencheur, et la peur qui se propage plus vite que l’information.
      </P>
      <Definition term="Krach">
        Effondrement soudain des cours sur un marché entier. On parle de marché « baissier » quand un indice perd
        plus de 20 % depuis son sommet.
      </Definition>

      <H2 id="bulles">1720 : les premières bulles</H2>
      <P>
        À Paris, l’Écossais John Law convainc le Régent de créer une banque qui émet du papier-monnaie, et une
        compagnie chargée de commercer avec la Louisiane, la Compagnie du Mississippi. Ses actions, payables en
        billets de la banque, passent d’environ 500 livres à près de 10 000 livres en 1719. Rue Quincampoix, on
        s’arrache les titres. Au début de 1720, les plus avisés convertissent leurs gains en or ; la confiance se
        retourne, les cours s’effondrent, et Law fuit la France à la fin de l’année.
      </P>
      <ArchiveFigure
        name="bulle-mississippi-1720"
        locale="fr"
        layout="side"
        alt="Gravure hollandaise : un char tiré par des coqs, sous une tour d’où l’on jette du vent, entouré de spéculateurs"
        caption="« L’inventeur du négoce du vent sur son char de triomphe » : une satire hollandaise de 1720 contre John Law et la folie des actions."
      />
      <P>
        La même année, à Londres, la Compagnie des mers du Sud promet des profits fabuleux dans le commerce avec
        l’Amérique espagnole. Son action passe d’environ 130 livres en janvier à près de 1 000 livres en été, avant
        de retomber vers 150 à l’automne. Selon la tradition, Isaac Newton lui-même y aurait perdu une fortune.
        Le graveur William Hogarth en tirera la planche qui illustre cet article : un manège où tournent les
        dupes, pendant que l’Honnêteté est suppliciée sur la roue.
      </P>

      <H2 id="xixe">Or et paniques du XIXe siècle</H2>
      <P>
        Le 24 septembre 1869, deux spéculateurs new-yorkais, Jay Gould et James Fisk, tentent d’accaparer tout l’or
        disponible pour en faire monter le prix. Quand le gouvernement américain décide de vendre ses réserves, le
        cours de l’or s’effondre en quelques minutes : c’est le premier « vendredi noir » de Wall Street, qui ruine
        de nombreuses maisons de courtage.
      </P>
      <ArchiveFigure
        name="chute-or-1869"
        locale="fr"
        alt="Gravure de Thomas Nast : Wall Street en ruines devant l’église Trinity, une pancarte « fermé pour réparations »"
        caption="« Quelle chute ce fut, mes compatriotes ! » : Thomas Nast dessine Wall Street en ruines après le vendredi noir de 1869."
      />
      <P>
        En octobre 1907, l’échec d’une manœuvre sur l’action d’une compagnie de cuivre provoque une ruée sur les
        banques new-yorkaises. Faute de banque centrale, c’est le banquier John Pierpont Morgan qui réunit ses
        confrères pour éteindre l’incendie. Le choc est si fort que les États-Unis créent la Réserve fédérale six
        ans plus tard.
      </P>
      <ArchiveFigure
        name="panique-1907"
        locale="fr"
        alt="Photographie d’une foule massée dans Wall Street devant le Sub-Treasury, en octobre 1907"
        caption="Wall Street pendant la panique d’octobre 1907. Les épargnants font la queue pour retirer leur argent."
      />

      <H2 id="1929">1929 : le grand krach</H2>
      <P>
        Les années 1920 sont euphoriques. On achète des actions à crédit, en n’apportant parfois que 10 % de la
        somme. Le Dow Jones est multiplié par six en huit ans et atteint 381 points le 3 septembre 1929. Le jeudi
        24 octobre, la panique éclate ; le lundi 28, l’indice perd près de 13 %, le mardi 29, encore près de 12 %.
        Les acheteurs à crédit, sommés de rembourser, doivent vendre à n’importe quel prix.
      </P>
      <P>
        Le pire est pourtant à venir. Faillites bancaires, effondrement du commerce mondial, chômage de masse : le
        Dow Jones touche 41 points en juillet 1932, soit une chute de 89 % depuis le sommet.
      </P>
      <KeyFigure value="25 ans">
        Le temps qu’il a fallu au Dow Jones pour retrouver son sommet de 1929, en novembre 1954 (hors dividendes).
      </KeyFigure>

      <H2 id="1987">1987 : le lundi noir</H2>
      <P>
        Le lundi 19 octobre 1987, le Dow Jones perd 22,6 % en une seule séance, la pire journée de son histoire.
        Il n’y a pas eu de faillite retentissante ce jour-là. En cause : des marchés très chers, des taux en hausse,
        et des programmes informatiques d’« assurance de portefeuille » qui vendaient automatiquement quand les
        cours baissaient, accélérant la chute. Après ce krach, les bourses ont créé des coupe-circuits, qui
        suspendent les échanges en cas de baisse trop rapide.
      </P>

      <H2 id="2000">2000 : la bulle internet</H2>
      <P>
        À la fin des années 1990, tout ce qui touche à internet s’arrache, même des entreprises sans bénéfice ni
        chiffre d’affaires. Le Nasdaq, la bourse des valeurs technologiques, culmine à 5 048 points le 10 mars
        2000, puis perd 78 % en deux ans et demi. Beaucoup de vedettes de l’époque disparaissent ; quelques-unes
        survivent et deviennent des géants. Le Nasdaq ne retrouvera son sommet qu’en 2015.
      </P>

      <H2 id="2008">2008 : la crise financière</H2>
      <P>
        Aux États-Unis, des millions de crédits immobiliers ont été accordés à des ménages fragiles, puis
        découpés et revendus dans le monde entier sous forme de titres complexes. Quand les prix de l’immobilier
        baissent, personne ne sait plus qui détient les pertes. Le 15 septembre 2008, la banque Lehman Brothers
        fait faillite ; les banques cessent de se prêter entre elles. Le S&amp;P 500 perd 57 % entre octobre 2007
        et mars 2009.
      </P>

      <H2 id="2020">2020 : le krach éclair</H2>
      <P>
        En février 2020, l’épidémie de Covid-19 gagne l’Europe et les États-Unis. Le S&amp;P 500 perd 34 % en à
        peine plus d’un mois, la chute la plus rapide de son histoire, et les coupe-circuits se déclenchent quatre
        fois en mars. Puis les banques centrales et les États interviennent massivement : l’indice retrouve son
        sommet dès le mois d’août. Ceux qui avaient vendu au plus bas ont cristallisé leurs pertes.
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Vivez une crise de l’intérieur, séance après séance, sans jamais savoir ce que réserve le lendemain.
      </InlineCta>

      <H2 id="remonter">Combien de temps pour remonter</H2>
      <CrashesDiagram locale="fr" />
      <Table
        head={['Krach', 'Chute du sommet au creux', 'Retour au sommet']}
        rows={[
          ['1929 (Dow Jones)', '−89 %', 'environ 25 ans'],
          ['1987 (Dow Jones)', '−23 % en un jour', 'environ 2 ans'],
          ['2000 (Nasdaq)', '−78 %', 'environ 15 ans'],
          ['2008 (S&P 500)', '−57 %', 'environ 5 ans et demi'],
          ['2020 (S&P 500)', '−34 %', 'environ 6 mois'],
        ]}
      />
      <P>
        Ces durées sont calculées sur les indices de prix, sans les{' '}
        <MagLink id="dividende" locale="fr">
          dividendes
        </MagLink>
        . Dividendes réinvestis, la remontée est plus courte, mais l’écart entre les cas reste immense : quelques
        mois, ou une génération.
      </P>

      <H2 id="lecons">Ce que les krachs enseignent</H2>
      <List>
        <li>
          <Em>Ils reviennent.</Em> Aucune époque n’en a été épargnée ; la question n’est pas « si », mais « quand ».
        </li>
        <li>
          <Em>Le crédit les aggrave.</Em> En 1720, en 1929 ou en 2008, c’est l’argent emprunté qui transforme une
          baisse en désastre, parce qu’il oblige à vendre au pire moment.
        </li>
        <li>
          <Em>La diversification limite les dégâts.</Em> Ceux qui avaient tout misé sur les valeurs internet en
          2000 ont attendu quinze ans ; un portefeuille réparti s’en est remis bien plus vite.
        </li>
        <li>
          <Em>Vendre dans la panique coûte cher.</Em> Les meilleures séances arrivent souvent juste après les pires.
          Les manquer suffit à abîmer durablement une performance.
        </li>
        <li>
          <Em>La volatilité fait partie du voyage.</Em> Mieux vaut savoir à l’avance combien de{' '}
          <MagLink id="volatilite" locale="fr">
            volatilité
          </MagLink>{' '}
          on supporte que de le découvrir pendant la tempête.
        </li>
      </List>
      <P>
        Pour qui pense que les cours vont baisser, il existe aussi la{' '}
        <MagLink id="vente-a-decouvert" locale="fr">
          vente à découvert
        </MagLink>
        , un outil puissant mais dangereux. Le scénario <Em>La ruée sur les banques</Em> du jeu vous plonge au
        cœur d’une panique bancaire récente : de quoi tester vos réflexes.
      </P>
    </>
  );
}
