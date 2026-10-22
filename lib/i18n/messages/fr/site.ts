/**
 * FINANCEQUEST - I18N: PAGES PUBLIQUES (FRANÇAIS)
 * Accueil, « Le jeu », FAQ, magazine et métadonnées. Rendu côté serveur
 * uniquement : ces textes ne sont pas envoyés au navigateur avec l'interface.
 */

export const site = {
  seo: {
    siteName: 'FinanceQuest',
    defaultTitle: 'FinanceQuest : jeu de bourse gratuit sur les cours historiques réels',
    defaultDescription:
      'Simulateur de bourse gratuit : rejouez les marchés séance par séance avec les vrais cours de clôture, sans argent réel. Actions, indices, cryptos, devises, 7 devises de jeu et un classement.',
    keywords:
      'jeu de bourse, simulateur de bourse, simulation boursière, apprendre à trader, trading fictif, bourse virtuelle, portefeuille virtuel, jeu de trading gratuit',
    homeTitle: 'Jeu de bourse gratuit : rejouez les marchés avec les cours réels',
    aboutTitle: 'Les règles du jeu',
    aboutDescription:
      'Comment se joue FinanceQuest : ordres au cours de clôture, vente à découvert, devises de jeu, catalogue de valeurs. Les règles de la corbeille, expliquées.',
    faqTitle: 'Questions fréquentes',
    faqDescription:
      'Tout savoir sur FinanceQuest : gratuité, origine des cours, déroulement d’une partie, vente à découvert, devises, classement.',
    leaderboardTitle: 'Classement des joueurs',
    leaderboardDescription: 'Le tableau d’honneur de FinanceQuest : les meilleurs rendements des parties en cours.',
    loginTitle: 'Connexion',
    signupTitle: 'Créer un compte',
    signupDescription: 'Créez votre compte FinanceQuest gratuitement et recevez votre capital de départ fictif.',
    dashboardTitle: 'Tableau de bord',
    gameTitle: 'Partie en cours',
    magTitle: 'La Gazette : apprendre la bourse et le trading',
    magDescription:
      'Les articles de La Gazette de FinanceQuest : comprendre la bourse, les notions de trading et les stratégies, avant de s’entraîner sans risque.',
    ogAlt: 'FinanceQuest : rejouez la Bourse avec les cours réels',
    gameGenre: 'Simulation boursière',
  },

  home: {
    eyebrow: 'Bourse historique · Cours réels',
    title: 'Rejouez la Bourse.',
    subtitle: 'Les cours sont réels, l’argent ne l’est pas.',
    ctaPrimary: 'Ouvrir une partie',
    ctaSecondary: 'J’ai déjà un compte',
    heroAlt: 'Gravure : la foule des agents de change autour de la corbeille, à la Bourse de Paris vers 1900',
    heroCaption: 'La corbeille du palais Brongniart, vers 1900',
    tickerTitle: 'Variation sur la période couverte',
    stepsEyebrow: 'Une partie',
    stepsTitle: 'Une séance par clic, des années de marchés',
    steps: [
      {
        title: 'Remontez le temps',
        text: 'Choisissez une date de départ et une devise. Vous recevez votre capital, le marché ouvre.',
      },
      {
        title: 'Passez vos ordres',
        text: 'Achetez, vendez, vendez à découvert : actions, indices, matières premières, cryptos, devises.',
      },
      {
        title: 'Faites sonner la cloche',
        text: 'Un clic, une séance. Les cours de clôture réels tombent, votre portefeuille suit le marché.',
      },
    ],
    stats: {
      assets: 'Valeurs cotées',
      markets: 'Places de cotation',
      currencies: 'Devises de jeu',
      sessions: 'Séances de bourse',
    },
    introEyebrow: 'Le simulateur',
    introTitle: 'Un simulateur de bourse qui ne triche pas avec le temps',
    introParagraphs: [
      'FinanceQuest est un jeu de bourse gratuit. Vous partez d’une date du passé avec un capital fictif, puis vous gérez un portefeuille réel, au sens où chaque cours affiché est le vrai cours de clôture de ce jour-là.',
      'La règle d’or : vous ne voyez jamais le lendemain. Chaque séance se clôt d’un clic et révèle les cours suivants. Impossible de tricher avec ce que l’on sait aujourd’hui : comme un vrai investisseur, vous décidez avec l’information du moment.',
      'De quoi s’entraîner sans risque : comprendre l’effet des frais, de la diversification, du change ou de la vente à découvert, et mesurer ses décisions au rendement, face aux autres joueurs.',
    ],
    introPoints: [
      'Gratuit, sans carte bancaire',
      'Cours de clôture historiques réels',
      'Actions, indices, matières premières, cryptos et devises',
      'Sept devises de jeu, un classement au rendement',
    ],
    faqEyebrow: 'Questions fréquentes',
    faqTitle: 'Avant de commencer',
    faqMore: 'Toutes les questions',
    magEyebrow: 'La Gazette',
    magTitle: 'Comprendre avant de jouer',
    magMore: 'Lire La Gazette',
    finalTitle: 'Montez sur le podium',
    finalText:
      'Chaque partie est classée au rendement, quelle que soit la devise. Des succès à débloquer, un classement entre agents de change, et pas un euro réel en jeu.',
    finalCta: 'Prendre ma place',
    login: 'Se connecter',
  },

  about: {
    eyebrow: 'Le jeu',
    titleLine1: 'Tradez le passé,',
    titleLine2: 'séance par séance.',
    intro:
      'Choisissez une date de départ, recevez votre capital et construisez un portefeuille sur les cours réels. Puis avancez, une séance à la fois, sans jamais connaître le lendemain.',
    imageAlt: 'Gravure d’un téléscripteur de cotations sous sa cloche de verre',
    rulesTitle: 'Les quatre règles de la corbeille',
    rules: [
      {
        title: 'Le temps ne va que dans un sens',
        text: 'Vous voyez les cours jusqu’au jour simulé, jamais au-delà. Chaque clic clôt la séance et révèle les cours de clôture de la suivante.',
      },
      {
        title: 'Les ordres passent à la clôture',
        text: 'Un ordre s’exécute au cours de clôture du jour en jeu, frais de courtage inclus. Week-ends et jours fériés sont sautés.',
      },
      {
        title: 'Vendre à découvert se paie',
        text: 'Le produit d’une vente à découvert reste bloqué en garantie. Votre valeur nette doit couvrir {margin} des positions à découvert : le levier est limité à deux fois.',
      },
      {
        title: 'Le change compte aussi',
        text: 'Les titres restent cotés dans leur devise. Ils sont convertis dans votre devise de jeu au taux du jour, et votre portefeuille suit le change.',
      },
    ],
    catalogEyebrow: 'La cote',
    catalogTitle: '{total} valeurs, {families} familles',
    catalogText: 'Actions de New York à Shanghai, indices, matières premières, cryptos et paires de devises.',
    currencyEyebrow: 'Devise de jeu',
    currencyTitle: 'Jouez en euros, en yens ou en francs suisses',
    currencyText:
      'Capital, coûts et gains sont tenus dans la devise choisie à l’ouverture. Le classement compare les rendements, pas les montants.',
    finalTitle: 'La cloche va sonner',
    finalCta: 'Ouvrir une partie',
  },

  faq: {
    eyebrow: 'Questions fréquentes',
    title: 'Tout ce qu’il faut savoir avant d’ouvrir une partie',
    intro: 'Les réponses courtes d’abord, les détails ensuite.',
    items: [
      {
        q: 'Qu’est-ce que FinanceQuest ?',
        a: 'Un jeu de bourse gratuit dans le navigateur. Vous partez d’une date du passé avec un capital fictif et vous gérez un portefeuille sur les vrais cours de clôture, séance par séance, sans jamais connaître le lendemain.',
      },
      {
        q: 'Est-ce gratuit ? Faut-il mettre de l’argent réel ?',
        a: 'C’est gratuit et l’argent est fictif. Aucune carte bancaire n’est demandée, et aucun gain ni aucune perte n’ont de conséquence réelle. Il suffit d’un compte pour retrouver ses parties.',
      },
      {
        q: 'D’où viennent les cours ?',
        a: 'Ce sont les cours de clôture historiques réels de chaque valeur, issus de données de marché publiques. Ils sont ajustés des divisions d’actions : quand une société divise son action par dix, les cours passés le sont aussi, pour que les variations restent comparables.',
      },
      {
        q: 'Pourquoi rejouer le passé plutôt que le marché en direct ?',
        a: 'Parce qu’on avance à son rythme : une séance par clic, au lieu d’attendre le lendemain. On peut aussi s’entraîner sur des périodes très différentes. Et comme le jeu ne montre jamais le jour suivant, on décide dans les mêmes conditions qu’un investisseur de l’époque.',
      },
      {
        q: 'Comment se déroule une partie ?',
        a: 'Vous choisissez une date de départ et une devise de jeu, puis vous recevez votre capital. Vous passez des ordres d’achat, de vente ou de vente à découvert, exécutés au cours de clôture du jour. Quand vous êtes prêt, vous clôturez la séance : les cours du jour de bourse suivant tombent et votre portefeuille est réévalué.',
      },
      {
        q: 'Quels actifs peut-on acheter ?',
        a: 'Des actions de grandes places (New York, Paris, Londres, Francfort, Tokyo, Shanghai…), des indices boursiers, des matières premières, des cryptomonnaies et des paires de devises. La page « Le jeu » détaille le catalogue complet.',
      },
      {
        q: 'Qu’est-ce que la vente à découvert ?',
        a: 'Vendre un titre que l’on ne possède pas, en pariant sur sa baisse, puis le racheter plus tard. Si le cours baisse, on gagne la différence ; s’il monte, on perd, sans limite théorique. Dans le jeu, le produit de la vente reste bloqué en garantie et votre valeur nette doit couvrir la moitié des positions à découvert.',
      },
      {
        q: 'Quelle devise de jeu choisir ?',
        a: 'Celle qui vous parle : euro, dollar américain, livre sterling, franc suisse, yen, dollar canadien ou dollar australien. Les titres restent cotés dans leur devise et sont convertis au taux de change du jour. Le classement compare les rendements en pourcentage, donc aucune devise n’avantage.',
      },
      {
        q: 'Comment fonctionne le classement ?',
        a: 'Les parties en cours sont classées au rendement : la progression en pourcentage de la valeur du portefeuille depuis l’ouverture. Les succès débloqués rapportent des points affichés sur votre profil, sans changer le rang.',
      },
      {
        q: 'Est-ce que le jeu apprend vraiment à investir ?',
        a: 'Il apprend les mécanismes : passer un ordre, payer des frais, diversifier, subir le change, gérer une position à découvert, tenir ses décisions dans la durée. Il ne remplace pas une formation, et les performances passées ne préjugent pas des performances futures. C’est un terrain d’entraînement, sans risque.',
      },
      {
        q: 'Peut-on jouer sur mobile ?',
        a: 'Oui. FinanceQuest fonctionne dans le navigateur, sur ordinateur, tablette et téléphone, sans application à installer.',
      },
      {
        q: 'Peut-on jouer en anglais ?',
        a: 'Oui. Le sélecteur FR · EN, en haut de chaque page, change la langue à tout moment, y compris en pleine partie. La devise de jeu, elle, ne change pas.',
      },
    ],
    ctaTitle: 'Une question de plus ? Le mieux est d’essayer.',
    ctaButton: 'Ouvrir une partie',
  },

  mag: {
    name: 'La Gazette',
    eyebrow: 'La Gazette de FinanceQuest',
    title: 'Comprendre la bourse avant de s’y risquer',
    intro:
      'Des articles pour débutants curieux : les notions qui comptent, expliquées simplement, puis mises à l’épreuve dans le jeu.',
    readingTime: '{minutes} min de lecture',
    publishedOn: 'Publié le {date}',
    updatedOn: 'Mis à jour le {date}',
    by: 'Par la rédaction de FinanceQuest',
    read: 'Lire l’article',
    toc: 'Sommaire',
    related: 'À lire aussi',
    breadcrumbLabel: 'Fil d’Ariane',
    breadcrumbHome: 'Accueil',
    otherLanguage: 'Read in English',
    disclaimer: 'Contenu pédagogique, sans conseil en investissement.',
    ctaInlineLabel: 'À l’épreuve du jeu',
    ctaInlineButton: 'Essayer sans risque',
    ctaFinalTitle: 'Passez de la théorie à la séance',
    ctaFinalText:
      'Ouvrez une partie gratuite, choisissez une date du passé et testez ces notions sur les cours réels, sans argent en jeu.',
    ctaFinalButton: 'Ouvrir une partie',
    ctaFinalNote: 'Gratuit · Argent fictif · Cours historiques réels',
  },

  notFoundTitle: 'Page introuvable',
};
