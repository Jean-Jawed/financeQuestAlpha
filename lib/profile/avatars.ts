/**
 * PASTFOLIO - AVATARS PAR DÉFAUT
 * Liste des avatars déposés dans Supabase Storage (bucket « avatars », dossier
 * defaults/, WebP 256 px). Source : assets-src/avatars (planches Gemini,
 * decoupe.py, scripts/upload-avatars.mjs).
 *
 * Un fichier publié ne change jamais (cache d'un an) : pour corriger une image,
 * la déposer sous un nouvel identifiant. La base ne stocke que l'identifiant
 * (users.avatar_id) ; un identifiant inconnu s'affiche en initiales.
 */

import type { Locale } from '@/lib/i18n/config';

// ==========================================
// TYPES
// ==========================================

export const AVATAR_STYLES = [
  'gravure',
  'aquarelle',
  'art-nouveau',
  'vecteur',
  'argile',
  'pixel',
  'ukiyoe',
  'art-deco',
  'pop-art',
  'huile',
  'papier',
  'neon',
] as const;

export type AvatarStyle = (typeof AVATAR_STYLES)[number];

export const AVATAR_CATEGORIES = ['people', 'animals', 'objects', 'symbols'] as const;

export type AvatarCategory = (typeof AVATAR_CATEGORIES)[number];

export interface Avatar {
  id: string;
  style: AvatarStyle;
  category: AvatarCategory;
  /** Description courte (texte alternatif) */
  label: Record<Locale, string>;
}

// ==========================================
// LISTE
// ==========================================

type Row = [name: string, category: AvatarCategory, fr: string, en: string];

const SHEETS: Record<AvatarStyle, Row[]> = {
  gravure: [
    ['courtier-hilare', 'people', 'Courtier hilare', 'Grinning broker'],
    ['commis-anxieux', 'people', 'Commis anxieux', 'Anxious clerk'],
    ['banquiere-rieuse', 'people', 'Banquière rieuse', 'Laughing banker'],
    ['crieur-de-journaux', 'people', 'Crieur de journaux', 'Newspaper crier'],
    ['rentiere-souriante', 'people', 'Rentière souriante', 'Smiling annuitant'],
    ['telegraphiste-surpris', 'people', 'Télégraphiste surpris', 'Surprised telegraphist'],
    ['banquier-monocle', 'people', 'Banquier au monocle', 'Banker with a monocle'],
    ['negociante-pensive', 'people', 'Négociante pensive', 'Pensive trader'],
    ['agent-epuise', 'people', 'Agent épuisé', 'Exhausted broker'],
  ],
  aquarelle: [
    ['taureau', 'animals', 'Taureau', 'Bull'],
    ['ours', 'animals', 'Ours', 'Bear'],
    ['chouette', 'animals', 'Chouette', 'Owl'],
    ['renard', 'animals', 'Renard', 'Fox'],
    ['loup', 'animals', 'Loup', 'Wolf'],
    ['chat-noir', 'animals', 'Chat noir', 'Black cat'],
    ['corbeau', 'animals', 'Corbeau', 'Raven'],
    ['tortue', 'animals', 'Tortue', 'Tortoise'],
    ['lion', 'animals', 'Lion', 'Lion'],
  ],
  'art-nouveau': [
    ['joie', 'people', 'Éclat de joie', 'Beaming with joy'],
    ['sage', 'people', 'Sage serein', 'Serene sage'],
    ['ado-casque', 'people', 'Ado au casque', 'Teen with headphones'],
    ['determinee', 'people', 'Regard déterminé', 'Determined look'],
    ['nerveux', 'people', 'Nerveux', 'Nervous'],
    ['clin-d-oeil', 'people', 'Clin d’œil', 'Wink'],
    ['furieux', 'people', 'Furieux', 'Furious'],
    ['emerveillee', 'people', 'Émerveillée', 'Amazed'],
    ['reveur', 'people', 'Rêveur', 'Dreamer'],
  ],
  vecteur: [
    ['cloche', 'objects', 'Cloche de la corbeille', 'Trading bell'],
    ['haut-de-forme', 'objects', 'Haut-de-forme', 'Top hat'],
    ['piece-d-or', 'objects', 'Pièce d’or', 'Gold coin'],
    ['coffre-fort', 'objects', 'Coffre-fort', 'Safe'],
    ['sablier', 'objects', 'Sablier', 'Hourglass'],
    ['fusee', 'objects', 'Fusée', 'Rocket'],
    ['diamant', 'objects', 'Diamant', 'Diamond'],
    ['boule-de-cristal', 'objects', 'Boule de cristal', 'Crystal ball'],
    ['tirelire', 'objects', 'Tirelire', 'Piggy bank'],
  ],
  argile: [
    ['robot', 'people', 'Robot trader', 'Robot trader'],
    ['astronaute', 'people', 'Astronaute', 'Astronaut'],
    ['fantome', 'people', 'Fantôme', 'Ghost'],
    ['monstre', 'people', 'Monstre poilu', 'Furry monster'],
    ['extraterrestre', 'people', 'Extraterrestre', 'Alien'],
    ['dragon', 'animals', 'Dragon', 'Dragon'],
    ['chevalier', 'people', 'Chevalier', 'Knight'],
    ['magicien', 'people', 'Magicien', 'Wizard'],
    ['pirate', 'people', 'Pirate', 'Pirate'],
  ],
  pixel: [
    ['hausse', 'symbols', 'Hausse', 'Rally'],
    ['baisse', 'symbols', 'Baisse', 'Slump'],
    ['eclair', 'symbols', 'Éclair', 'Lightning'],
    ['lune', 'symbols', 'Lune', 'Moon'],
    ['soleil', 'symbols', 'Soleil', 'Sun'],
    ['flamme', 'symbols', 'Flamme', 'Flame'],
    ['cristal-de-glace', 'symbols', 'Cristal de glace', 'Ice crystal'],
    ['couronne', 'symbols', 'Couronne', 'Crown'],
    ['trefle', 'symbols', 'Trèfle à quatre feuilles', 'Four-leaf clover'],
  ],
  ukiyoe: [
    ['grue', 'animals', 'Grue', 'Crane'],
    ['carpe-koi', 'animals', 'Carpe koï', 'Koi'],
    ['samourai', 'people', 'Samouraï', 'Samurai'],
    ['geisha', 'people', 'Geisha', 'Geisha'],
    ['mont-fuji', 'symbols', 'Mont Fuji', 'Mount Fuji'],
    ['grande-vague', 'symbols', 'Grande vague', 'Great wave'],
    ['tigre', 'animals', 'Tigre', 'Tiger'],
    ['maneki-neko', 'objects', 'Chat porte-bonheur', 'Lucky cat'],
    ['sumo', 'people', 'Lutteur de sumo', 'Sumo wrestler'],
  ],
  'art-deco': [
    ['globe', 'symbols', 'Globe', 'Globe'],
    ['rose-des-vents', 'symbols', 'Rose des vents', 'Compass rose'],
    ['balance', 'symbols', 'Balance', 'Scales'],
    ['oeil', 'symbols', 'Œil', 'Eye'],
    ['ancre', 'symbols', 'Ancre', 'Anchor'],
    ['cle', 'symbols', 'Clé', 'Key'],
    ['phare', 'symbols', 'Phare', 'Lighthouse'],
    ['voilier', 'symbols', 'Voilier', 'Sailing ship'],
    ['caducee', 'symbols', 'Caducée de Mercure', 'Caduceus'],
  ],
  'pop-art': [
    ['choquee', 'people', 'Choquée', 'Shocked'],
    ['extatique', 'people', 'Extatique', 'Ecstatic'],
    ['larme', 'people', 'Une larme', 'A single tear'],
    ['lunettes-noires', 'people', 'Lunettes noires', 'Sunglasses'],
    ['furieuse', 'people', 'Furieuse', 'Furious'],
    ['zen', 'people', 'Zen', 'Zen'],
    ['baillement', 'people', 'Bâillement', 'Yawn'],
    ['reflexion', 'people', 'Réflexion', 'Thinking'],
    ['clin-d-oeil', 'people', 'Clin d’œil', 'Wink'],
  ],
  huile: [
    ['bouledogue', 'animals', 'Bouledogue au gilet', 'Bulldog in a waistcoat'],
    ['chat-haut-de-forme', 'animals', 'Chat en haut-de-forme', 'Cat in a top hat'],
    ['lapin-commis', 'animals', 'Lapin commis', 'Rabbit clerk'],
    ['elephant-banquier', 'animals', 'Éléphant banquier', 'Elephant banker'],
    ['herisson-inquiet', 'animals', 'Hérisson inquiet', 'Worried hedgehog'],
    ['girafe-hautaine', 'animals', 'Girafe hautaine', 'Haughty giraffe'],
    ['cochon-rieur', 'animals', 'Cochon rieur', 'Laughing pig'],
    ['chevre-lectrice', 'animals', 'Chèvre lectrice', 'Reading goat'],
    ['paon', 'animals', 'Paon', 'Peacock'],
  ],
  papier: [
    ['croissance', 'symbols', 'Croissance', 'Growth'],
    ['strategie', 'symbols', 'Stratégie', 'Strategy'],
    ['hasard', 'symbols', 'Hasard', 'Chance'],
    ['ambition', 'symbols', 'Ambition', 'Ambition'],
    ['tempete', 'symbols', 'Tempête', 'Storm'],
    ['idee', 'symbols', 'Idée', 'Idea'],
    ['patience', 'symbols', 'Patience', 'Patience'],
    ['risque', 'symbols', 'Risque', 'Risk'],
    ['intuition', 'symbols', 'Intuition', 'Intuition'],
  ],
  neon: [
    ['lunettes-ar', 'people', 'Lunettes connectées', 'AR glasses'],
    ['carre-neon', 'people', 'Carré néon', 'Neon bob'],
    ['rire-argent', 'people', 'Rire argenté', 'Silver laugh'],
    ['stupefait', 'people', 'Stupéfait', 'Astonished'],
    ['implants', 'people', 'Implants', 'Implants'],
    ['tresses', 'people', 'Tresses', 'Braids'],
    ['stress', 'people', 'Stress', 'Stressed'],
    ['sourire-en-coin', 'people', 'Sourire en coin', 'Smirk'],
    ['hacker', 'people', 'Hacker', 'Hacker'],
  ],
};

export const AVATARS: readonly Avatar[] = AVATAR_STYLES.flatMap((style) =>
  SHEETS[style].map(([name, category, fr, en]) => ({ id: `${style}-${name}`, style, category, label: { fr, en } }))
);

const BY_ID = new Map(AVATARS.map((avatar) => [avatar.id, avatar]));

// ==========================================
// ACCÈS
// ==========================================

export function getAvatar(id: string | null | undefined): Avatar | null {
  return id ? (BY_ID.get(id) ?? null) : null;
}

export function isAvatarId(value: unknown): value is string {
  return typeof value === 'string' && BY_ID.has(value);
}

/** Avatar au hasard (inscription, bouton « au hasard ») */
export function randomAvatarId(exclude?: string | null): string {
  const pool = exclude ? AVATARS.filter((avatar) => avatar.id !== exclude) : AVATARS;
  return pool[Math.floor(Math.random() * pool.length)].id;
}

/**
 * Adresse publique du fichier (bucket public, cache d'un an)
 * NEXT_PUBLIC_SUPABASE_URL est inliné à la compilation : utilisable côté client
 */
export function avatarUrl(id: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/defaults/${id}.webp`;
}
