/**
 * FINANCEQUEST - I18N: PUBLIC PAGES (ENGLISH)
 * Même forme que le dictionnaire français (vérifié au typage)
 */

import type { SiteMessages } from '../types';

export const site: SiteMessages = {
  seo: {
    siteName: 'FinanceQuest',
    defaultTitle: 'FinanceQuest: a free stock market game on real historical prices',
    defaultDescription:
      'Free stock market simulator: replay the markets one session at a time with real closing prices, no real money involved. Stocks, indices, crypto, currencies, 7 game currencies and a leaderboard.',
    keywords:
      'stock market game, stock market simulator, trading simulator, learn to trade, paper trading, virtual stock exchange, virtual portfolio, free trading game',
    homeTitle: 'Free stock market game: replay the markets with real prices',
    aboutTitle: 'How the game works',
    aboutDescription:
      'How FinanceQuest is played: orders at the closing price, short selling, game currencies, the list of securities. The rules of the trading floor, explained.',
    faqTitle: 'Frequently asked questions',
    faqDescription:
      'Everything about FinanceQuest: is it free, where prices come from, how a game works, short selling, currencies, the leaderboard.',
    leaderboardTitle: 'Player leaderboard',
    leaderboardDescription: 'The FinanceQuest roll of honour: the best finished games, scenario by scenario.',
    loginTitle: 'Log in',
    signupTitle: 'Create an account',
    signupDescription: 'Create your free FinanceQuest account and receive your virtual starting capital.',
    dashboardTitle: 'Dashboard',
    gameTitle: 'Game in progress',
    magTitle: 'The Gazette: learn the stock market and trading',
    magDescription:
      'Articles from the FinanceQuest Gazette: understand the stock market, trading concepts and strategies, then practise without risk.',
    ogAlt: 'FinanceQuest: replay the stock market with real prices',
    gameGenre: 'Stock market simulation',
  },

  home: {
    eyebrow: 'Historical stock market · Real prices',
    title: 'Replay the market.',
    subtitle: 'The prices are real, the money is not.',
    ctaPrimary: 'Open a game',
    ctaSecondary: 'I already have an account',
    heroAlt: 'Engraving: the crowd of stockbrokers around the trading ring at the Paris Stock Exchange, around 1900',
    heroCaption: 'The trading ring of the Palais Brongniart, around 1900',
    tickerTitle: 'Change over the covered period',
    stepsEyebrow: 'A game',
    stepsTitle: 'One session per click, years of markets',
    steps: [
      {
        title: 'Go back in time',
        text: 'Pick a starting date and a currency. You receive your capital, and the market opens.',
      },
      {
        title: 'Place your orders',
        text: 'Buy, sell, sell short: stocks, indices, commodities, crypto, currencies.',
      },
      {
        title: 'Ring the bell',
        text: 'One click, one session. The real closing prices come in, and your portfolio follows the market.',
      },
    ],
    stats: {
      assets: 'Listed securities',
      markets: 'Exchanges',
      currencies: 'Game currencies',
      sessions: 'Trading sessions',
    },
    introEyebrow: 'The simulator',
    introTitle: 'A stock market simulator that does not cheat with time',
    introParagraphs: [
      'FinanceQuest is a free stock market game. You start from a date in the past with virtual capital, then manage a real portfolio, in the sense that every price you see is the actual closing price of that day.',
      'The golden rule: you never see tomorrow. Each session closes with a click and reveals the next prices. No cheating with what we know today: like a real investor, you decide with the information of the moment.',
      'A risk-free way to practise: understand the effect of fees, diversification, exchange rates or short selling, and measure your decisions by their return, against other players.',
    ],
    introPoints: [
      'Free, no credit card',
      'Real historical closing prices',
      'Stocks, indices, commodities, crypto and currencies',
      'Seven game currencies, a leaderboard ranked by return',
    ],
    faqEyebrow: 'Frequently asked questions',
    faqTitle: 'Before you start',
    faqMore: 'All questions',
    magEyebrow: 'The Gazette',
    magTitle: 'Understand before you play',
    magMore: 'Read The Gazette',
    finalTitle: 'Climb onto the podium',
    finalText:
      'Every game is ranked by return, whatever its currency. Achievements to unlock, a leaderboard among stockbrokers, and not a single real dollar at stake.',
    finalCta: 'Take my seat',
    landing: {
      bellLabel: 'Ring the bell',
      boardQuestion: 'Which session will you replay?',
      scrollCue: 'The session is about to open',
      corbeilleLines: [
        'One minute before the open, the floor fills up.',
        'The bell rings: orders pour in.',
        'Here, every price is the real closing price of the day.',
      ],
      crash: {
        eyebrow: 'The Covid crash, session by session',
        intro: 'February 2020. The market has never been higher.',
        question: 'Would you have sold?',
        missed: 'Those who sold at the bottom missed a {gain} rebound.',
        index: 'S&P 500',
        fromPeak: 'From the peak',
        peakLine: 'Peak of 19 February',
        notes: {
          peak: 'All-time high',
          halt: 'Trading halted',
          plunge: 'Worst day since 1987',
          trough: 'The bottom',
          record: 'New record',
        },
        conclusion:
          'In FinanceQuest, you never see tomorrow. You decide with the information of the day, like those who lived through these sessions.',
        cta: 'Hold on, or not',
      },
      certificateEyebrow: 'Certificate of admission',
      certificateTitle: 'Your seat on the trading floor awaits',
      certificateText:
        'A date from the past, virtual capital, real closing prices. Free, no credit card, and not a single real euro at stake.',
      stamp: 'Admitted',
    },
    login: 'Log in',
  },

  about: {
    eyebrow: 'The game',
    titleLine1: 'Trade the past,',
    titleLine2: 'one session at a time.',
    intro:
      'Pick a starting date, receive your capital and build a portfolio on real prices. Then move forward, one session at a time, never knowing what tomorrow brings.',
    imageAlt: 'Engraving of a stock ticker under its glass dome',
    rulesTitle: 'The four rules of the trading floor',
    rules: [
      {
        title: 'Time only moves one way',
        text: 'You see prices up to the simulated day, never beyond. Each click closes the session and reveals the closing prices of the next one.',
      },
      {
        title: 'Orders fill at the close',
        text: 'An order is executed at the closing price of the in-game day, brokerage fees included. Weekends and public holidays are skipped.',
      },
      {
        title: 'Selling short has a cost',
        text: 'The proceeds of a short sale stay locked as collateral. Your net value must cover {margin} of your short positions: leverage is capped at two.',
      },
      {
        title: 'Exchange rates matter too',
        text: 'Securities stay quoted in their own currency. They are converted into your game currency at the day’s rate, and your portfolio moves with the exchange rate.',
      },
    ],
    catalogEyebrow: 'The market',
    catalogTitle: '{total} securities, {families} families',
    catalogText: 'Stocks from New York to Shanghai, indices, commodities, crypto and currency pairs.',
    currencyEyebrow: 'Game currency',
    currencyTitle: 'Play in euros, yen or Swiss francs',
    currencyText:
      'Capital, costs and gains are kept in the currency chosen when the game opens. The leaderboard compares returns, not amounts.',
    finalTitle: 'The bell is about to ring',
    finalCta: 'Open a game',
  },

  faq: {
    eyebrow: 'Frequently asked questions',
    title: 'Everything you need to know before opening a game',
    intro: 'Short answers first, details after.',
    items: [
      {
        q: 'What is FinanceQuest?',
        a: 'A free stock market game in your browser. You start from a date in the past with virtual capital and manage a portfolio on real closing prices, one session at a time, never knowing what comes next.',
      },
      {
        q: 'Is it free? Do I need real money?',
        a: 'It is free and the money is virtual. No credit card is required, and no gain or loss has any real-world consequence. You only need an account to find your games again.',
      },
      {
        q: 'Where do the prices come from?',
        a: 'They are the real historical closing prices of each security, taken from public market data. They are adjusted for stock splits: when a company splits its stock ten for one, past prices are adjusted too, so that changes remain comparable.',
      },
      {
        q: 'Why replay the past rather than the live market?',
        a: 'Because you move at your own pace: one session per click, instead of waiting for the next day. You can also practise on very different periods. And since the game never shows the next day, you decide under the same conditions as an investor at the time.',
      },
      {
        q: 'How does a game work?',
        a: 'You pick a scenario, a starting date and a game currency, then receive your capital. You place buy, sell or short-sell orders, executed at the day’s closing price. When you are ready, you close the session: the prices of the next trading day come in and your portfolio is revalued. After 20 sessions, you can retire: your positions are closed and your result is locked in.',
      },
      {
        q: 'What can I trade?',
        a: 'Stocks from major exchanges (New York, Paris, London, Frankfurt, Tokyo, Shanghai…), stock indices, commodities, cryptocurrencies and currency pairs. The “The game” page lists the full catalogue.',
      },
      {
        q: 'What is short selling?',
        a: 'Selling a security you do not own, betting that its price will fall, then buying it back later. If the price falls, you gain the difference; if it rises, you lose, with no theoretical limit. In the game, the sale proceeds stay locked as collateral and your net value must cover half of your short positions.',
      },
      {
        q: 'Which game currency should I choose?',
        a: 'Whichever suits you: euro, US dollar, pound sterling, Swiss franc, yen, Canadian dollar or Australian dollar. Securities stay quoted in their own currency and are converted at the day’s exchange rate. The leaderboard compares percentage returns, so no currency has an edge.',
      },
      {
        q: 'How does the leaderboard work?',
        a: 'Each scenario has its own leaderboard. It lists each player’s best finished game, ranked by return: the percentage change in portfolio value between opening and retirement. Abandoned games and games under 20 sessions are not ranked.',
      },
      {
        q: 'Does the game really teach you how to invest?',
        a: 'It teaches the mechanics: placing an order, paying fees, diversifying, dealing with exchange rates, managing a short position, sticking to your decisions over time. It does not replace proper training, and past performance does not predict future results. It is a practice ground, without risk.',
      },
      {
        q: 'Can I play on mobile?',
        a: 'Yes. FinanceQuest runs in the browser, on computers, tablets and phones, with no app to install.',
      },
      {
        q: 'Can I play in French?',
        a: 'Yes. The FR · EN switch at the top of every page changes the language at any time, even in the middle of a game. Your game currency does not change.',
      },
    ],
    ctaTitle: 'One more question? The best answer is to try.',
    ctaButton: 'Open a game',
  },

  mag: {
    name: 'The Gazette',
    eyebrow: 'The FinanceQuest Gazette',
    title: 'Understand the market before you take the plunge',
    intro:
      'Articles for curious beginners: the concepts that matter, explained simply, then put to the test in the game.',
    readingTime: '{minutes} min read',
    publishedOn: 'Published on {date}',
    updatedOn: 'Updated on {date}',
    by: 'By the FinanceQuest editors',
    read: 'Read the article',
    readFiche: 'Read the explainer',
    summary: 'Key points',
    dossiersTitle: 'In depth',
    dossiersIntro: 'To understand in depth: the history, the mechanisms, the numbers.',
    fichesTitle: 'Explainers',
    fichesIntro: 'One concept, three minutes. The basics to know before placing your first order.',
    ficheLabel: 'Explainer',
    toc: 'Contents',
    related: 'Also worth reading',
    breadcrumbLabel: 'Breadcrumb',
    breadcrumbHome: 'Home',
    otherLanguage: 'Lire en français',
    disclaimer: 'Educational content, not investment advice.',
    ctaInlineLabel: 'Put it to the test',
    ctaInlineButton: 'Try it risk-free',
    ctaFinalTitle: 'From theory to the trading session',
    ctaFinalText:
      'Open a free game, pick a date in the past and test these ideas on real prices, with no money at stake.',
    ctaFinalButton: 'Open a game',
    ctaFinalNote: 'Free · Virtual money · Real historical prices',
  },

  notFoundTitle: 'Page not found',
};
