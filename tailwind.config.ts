// tailwind.config.ts
// Jetons de la direction artistique « La Corbeille »
// (docs/reviewOct2026/10_direction_artistique.md). Ne pas utiliser les
// couleurs Tailwind par défaut (slate, cyan…) dans les composants.
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0F1D19', // fond : encre vert-noir des billets
          2: '#162A24', // panneaux
          3: '#1E3730', // surélevé, survol
          4: '#28463D', // contrôles
        },
        line: {
          DEFAULT: 'rgb(239 230 210 / 0.12)',
          strong: 'rgb(239 230 210 / 0.24)',
        },
        paper: {
          DEFAULT: '#EFE6D2', // ivoire papier-titre
          dim: '#A9A08C', // texte secondaire
          faint: '#7D7665', // texte tertiaire (décoratif)
          ink: '#1B2420', // texte sur carte ivoire
        },
        brass: {
          DEFAULT: '#C9A45C', // laiton
          bright: '#E3C47E',
          deep: '#8E7034',
          shine: '#F4D891', // arête éclairée des moulures
          shadow: '#5A3F12', // gorge des moulures
        },
        gain: {
          DEFAULT: '#5DAE80', // vert billet
          deep: '#2E6B4C',
        },
        loss: {
          DEFAULT: '#D9603F', // vermillon de tampon
          deep: '#A8381F',
        },
        // Salle des machines (docs/reviewOct2026/phase3/03_refonte_da.md)
        wood: {
          dark: '#1E110A', // noyer : veines sombres
          DEFAULT: '#3E2314',
          light: '#603821',
          edge: '#24150B', // bord des panneaux
        },
        ivory: {
          DEFAULT: '#F2E8D2', // cartes nacrées
          deep: '#E3D6B8',
          line: '#A8956A',
          ink: '#2A2014', // texte sur ivoire
          dim: '#6B5B3E',
        },
        glass: '#0E1714', // écran d'instrument encastré
        enamel: {
          green: '#2B7350',
          'green-light': '#3F9468',
          red: '#963722',
          'red-light': '#B9503A',
        },
        // Expérience (niveaux, barre d'XP) : améthyste
        xp: {
          DEFAULT: '#A47CFF',
          bright: '#C9B3FF',
          deep: '#7C5CFF',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        label: ['var(--font-label)', 'Arial Narrow', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        label: '0.14em',
      },
      borderRadius: {
        DEFAULT: '3px',
        sm: '2px',
        md: '4px',
        lg: '6px',
      },
      boxShadow: {
        plate: '0 1px 0 rgb(239 230 210 / 0.06) inset, 0 12px 32px -12px rgb(0 0 0 / 0.6)',
        lift: '0 18px 40px -18px rgb(0 0 0 / 0.75)',
      },
      keyframes: {
        // Bilan de séance : la ligne s'allume en vert ou en rouge puis s'éteint
        'flash-gain': {
          '0%, 30%': { backgroundColor: 'rgb(74 160 110 / 0.32)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'flash-loss': {
          '0%, 30%': { backgroundColor: 'rgb(200 80 70 / 0.32)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'ticker-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        stamp: {
          '0%': { opacity: '0', transform: 'scale(1.8) rotate(-14deg)' },
          '60%': { opacity: '1', transform: 'scale(0.94) rotate(-8deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(-8deg)' },
        },
        'flip-in': {
          '0%': { opacity: '0', transform: 'rotateX(90deg)' },
          '100%': { opacity: '1', transform: 'rotateX(0)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fade: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        // Page d'accueil : la cloche d'ouverture
        'bell-swing': {
          '0%': { transform: 'rotate(0)' },
          '12%': { transform: 'rotate(16deg)' },
          '30%': { transform: 'rotate(-12deg)' },
          '48%': { transform: 'rotate(8deg)' },
          '66%': { transform: 'rotate(-4deg)' },
          '84%': { transform: 'rotate(2deg)' },
          '100%': { transform: 'rotate(0)' },
        },
        'ring-wave': {
          '0%': { opacity: '0.7', transform: 'scale(0.6)' },
          '100%': { opacity: '0', transform: 'scale(2.6)' },
        },
        curtain: {
          '0%': { clipPath: 'inset(0 0 0 0)' },
          '100%': { clipPath: 'inset(0 0 100% 0)' },
        },
        'rise-slow': {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        odometer: {
          from: { opacity: '0.2', transform: 'translateY(-35%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'xp-float': {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.9)' },
          '15%': { opacity: '1', transform: 'translateY(0) scale(1.05)' },
          '25%': { transform: 'scale(1)' },
          '80%': { opacity: '1', transform: 'translateY(-6px)' },
          '100%': { opacity: '0', transform: 'translateY(-22px)' },
        },
      },
      animation: {
        ticker: 'ticker-scroll 60s linear infinite',
        stamp: 'stamp 260ms cubic-bezier(.2,.9,.3,1.2) both',
        'flip-in': 'flip-in 320ms ease-out both',
        rise: 'rise 280ms ease-out both',
        fade: 'fade 200ms ease-out both',
        'bell-swing': 'bell-swing 1.6s cubic-bezier(.36,.07,.19,.97) both',
        'ring-wave': 'ring-wave 1.4s ease-out both',
        curtain: 'curtain 1.1s cubic-bezier(.7,0,.2,1) both',
        'rise-slow': 'rise-slow 700ms cubic-bezier(.2,.7,.2,1) both',
        'spin-slow': 'spin 160s linear infinite',
        'xp-float': 'xp-float 2.4s ease-out both',
        odometer: 'odometer 0.55s cubic-bezier(.2,.9,.3,1.1) both',
        'flash-gain': 'flash-gain 1.8s ease-out both',
        'flash-loss': 'flash-loss 1.8s ease-out both',
      },
    },
  },
  plugins: [],
};
export default config;
