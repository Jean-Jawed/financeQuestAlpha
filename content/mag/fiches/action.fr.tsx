/**
 * LA GAZETTE - Fiche : C'est quoi une action ? (français)
 */

import { ArchiveFigure } from '@/components/mag/figures';
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
        <li>Une action est une part du capital d’une entreprise.</li>
        <li>Elle donne droit à une part des bénéfices (le dividende) et, en général, à un vote.</li>
        <li>Son prix se forme en bourse, à chaque échange entre un acheteur et un vendeur.</li>
        <li>On peut tout perdre si l’entreprise fait faillite, mais jamais plus que sa mise.</li>
      </Summary>

      <Definition term="Action">
        Un titre de propriété qui représente une fraction du capital d’une société. Celui qui la détient est un
        actionnaire : il possède un petit morceau de l’entreprise.
      </Definition>

      <H2 id="pourquoi">Pourquoi les entreprises vendent des actions</H2>
      <P>
        Pour grandir, une entreprise a besoin d’argent. Elle peut l’emprunter, ou bien faire entrer de nouveaux
        associés en leur vendant des parts de son capital. Quand elle s’introduit en bourse, ces parts deviennent
        négociables par tout le monde : on peut les acheter et les revendre chaque jour de séance.
      </P>
      <P>
        L’idée est ancienne. En 1602, la Compagnie néerlandaise des Indes orientales vend ses parts à des milliers
        d’épargnants d’Amsterdam, qui peuvent ensuite se les échanger. C’est souvent considéré comme la naissance du
        marché des actions.
      </P>

      <H2 id="droits">Ce que vous donne une action</H2>
      <List>
        <li>
          <Em>Une part des bénéfices</Em>, quand l’entreprise décide d’en distribuer : c’est le{' '}
          <MagLink id="dividende" locale="fr">
            dividende
          </MagLink>
          .
        </li>
        <li>
          <Em>Un droit de vote</Em> aux assemblées générales, en général une voix par action.
        </li>
        <li>
          <Em>Une part de la valeur de l’entreprise</Em> : si elle grandit et gagne plus, le prix de ses actions
          a tendance à monter.
        </li>
      </List>
      <P>
        Une action n’est pas une <Em>obligation</Em>. L’obligation est un prêt : l’entreprise s’engage à verser des
        intérêts et à rembourser à une date fixée. L’action, elle, ne promet rien. Elle rapporte plus en moyenne
        sur le long terme, justement parce qu’elle est plus risquée.
      </P>

      <ArchiveFigure
        name="obligation-1887"
        locale="fr"
        layout="side"
        alt="Titre d’obligation imprimé de 1887, orné de gravures de trains, de ponts et d’armoiries"
        caption="Une obligation de 1887 d’une compagnie de chemins de fer catalane. Avant l’informatique, actions et obligations étaient des papiers imprimés, avec des coupons à découper."
      />

      <H2 id="prix">Comment se forme le prix</H2>
      <P>
        Le prix d’une action, son <Em>cours</Em>, est simplement le prix du dernier échange. Si plus de gens veulent
        acheter que vendre, les acheteurs doivent proposer davantage, et le cours monte. Dans le cas inverse, il
        baisse. Les résultats de l’entreprise, les nouvelles, les taux d’intérêt et l’humeur générale déplacent cet
        équilibre en permanence.
      </P>
      <P>
        Multipliez le cours par le nombre total d’actions, et vous obtenez la <Em>capitalisation boursière</Em> :
        ce que le marché estime que vaut l’entreprise entière, à cet instant.
      </P>
      <KeyFigure value="1 Md €">
        Une action à 100 € et 10 millions d’actions en circulation : la capitalisation est de 1 milliard d’euros.
      </KeyFigure>

      <H2 id="risque">Ce que vous risquez</H2>
      <P>
        Le pire cas est la faillite : l’action peut alors tomber à zéro. Mais votre perte s’arrête là, à la somme
        investie. C’est pour cela qu’on évite de tout mettre sur une seule valeur, et qu’on préfère souvent un
        panier d’actions, comme un{' '}
        <MagLink id="indice" locale="fr">
          indice
        </MagLink>{' '}
        ou un{' '}
        <MagLink id="etf" locale="fr">
          ETF
        </MagLink>
        .
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Achetez vos premières actions sur une vraie date du passé, sans argent réel.
      </InlineCta>
    </>
  );
}
