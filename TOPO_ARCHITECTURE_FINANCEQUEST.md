# 🏗️ FINANCEQUEST - TOPO ARCHITECTURE COMPLET

> **Document de référence** pour comprendre la structure et le fonctionnement de l'application  
> **Date** : Février 2025  
> **Version** : 1.0

---

## 📂 STRUCTURE APP/ - LE CŒUR DE L'APPLICATION

### **1. Parenthèses = Route Groups Next.js**

```
app/(auth)/     → Groupe "auth" (layout centré, pas de header/footer)
app/(app)/      → Groupe "app" (layout complet avec navigation)
```

**Fonction des Route Groups :**
- Permettent d'organiser les fichiers sans impacter les URLs
- Chaque groupe peut avoir son propre layout
- Exemple : `/login` reste `/login`, pas `/(auth)/login` dans l'URL

**Avantages :**
- Meilleure organisation du code
- Layouts différents selon le contexte
- URLs propres et SEO-friendly

---

### **2. Rôles des sous-dossiers**

#### **`app/(auth)/` - Pages d'authentification**

**Pages incluses :**
- `/login` → Formulaire de connexion utilisateur
- `/signup` → Formulaire d'inscription nouveau compte

**Layout spécifique :**
- Fond dégradé centré
- Pas de header ni footer
- Design minimaliste pour focus sur l'authentification

**Caractéristiques :**
- Pages publiques (accessibles sans connexion)
- Redirection automatique vers `/dashboard` si déjà connecté

---

#### **`app/(app)/` - Pages application protégées**

**Pages principales :**
- `/dashboard` → Vue d'ensemble des parties en cours, création nouvelle partie
- `/game/[id]` → Interface complète de trading (portfolio, ordres, graphiques)
- `/leaderboard` → Classement global des joueurs avec scores
- `/admin/monitoring` → Dashboard administrateur (stats système, cache, quotas API)
- `/about` → Présentation du projet et fonctionnalités

**Layout complet :**
- Header avec navigation (Dashboard, Leaderboard, About, Logout)
- Footer avec copyright et lien admin
- Protection middleware (redirection `/login` si non authentifié)

**Caractéristiques :**
- Toutes les pages nécessitent authentification
- Middleware vérifie la session avant chaque accès
- Layout unifié pour cohérence UX

---

#### **`app/api/` - Backend REST API**

**Organisation :** 20 endpoints organisés par domaine fonctionnel

**Domaines principaux :**

1. **Auth** (`/api/auth/*`)
   - `login` → POST connexion utilisateur
   - `logout` → POST déconnexion
   - `session` → GET session courante
   - `signup` → POST inscription

2. **Games** (`/api/games/*`)
   - `create` → POST création partie
   - `list` → GET liste parties utilisateur
   - `[id]` → GET détails partie spécifique
   - `next-day` → POST avancer au jour suivant

3. **Trades** (`/api/trades/*`)
   - `buy` → POST achat action
   - `sell` → POST vente action
   - `short` → POST vente à découvert
   - `cover` → POST couverture position short

4. **Market** (`/api/market/*`)
   - `price` → GET prix actuel d'un symbole
   - `history` → GET historique prix
   - `assets` → GET liste assets disponibles
   - `filters` → GET filtres disponibles

5. **Admin** (`/api/admin/*`)
   - `monitoring` → GET statistiques système

6. **Users** (`/api/users/*`)
   - `create` → POST création entrée DB après signup Supabase

**Caractéristiques :**
- Toutes les routes sont exécutées côté serveur
- Accès direct à la base de données via Drizzle ORM
- Gestion d'erreurs standardisée avec try/catch
- Validation des inputs via Zod schemas
- Authentification vérifiée pour routes sensibles

---

### **3. `page.tsx` - Pages Next.js**

**Définition :**
```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  return <div>Mon dashboard</div>;
}
```

**Fonctionnement automatique :**
- Next.js mappe automatiquement les URLs vers les fichiers `page.tsx`
- URL `/dashboard` → Charge `app/dashboard/page.tsx`
- URL `/game/abc123` → Charge `app/game/[id]/page.tsx` avec `params.id = 'abc123'`

**Pas d'import manuel nécessaire :**
- Le framework gère tout le routing
- Les pages sont découvertes automatiquement au build
- System-based routing (convention > configuration)

**Types de pages :**
- **Server Components** (par défaut) : Rendues côté serveur, accès DB direct
- **Client Components** (avec `'use client'`) : Interactivité React, hooks, events

---

### **4. Admin Monitoring**

**Fichier source :** `app/(app)/admin/monitoring/page.tsx`

**URL d'accès :** `https://ton-site.com/admin/monitoring`

**Contenu du dashboard :**

**Section Users :**
- Total utilisateurs inscrits
- Utilisateurs actifs derniers 30 jours

**Section Games :**
- Total parties créées
- Parties actives en cours

**Section Cache :**
- Nombre de records en cache
- Nombre de symboles uniques
- Dates min/max disponibles
- Taille base de données

**Section API MarketStack :**
- Requêtes restantes / limite mensuelle
- Alertes si quota > 80%
- Date de reset quota

**Protection d'accès :**
- Variable d'environnement `ADMIN_PASSWORD` requise
- Formulaire de saisie mot de passe avant affichage
- API route vérifie header `Authorization: Bearer PASSWORD`
- Retour 401 Unauthorized si mot de passe incorrect

**Utilité :**
- Surveillance santé application
- Monitoring quotas API externes
- Détection problèmes cache
- Statistiques utilisation

---

### **5. `route.ts` - API Routes Next.js**

**Concept :** Fichiers backend qui exposent des endpoints HTTP REST

**Exemple concret :** `app/api/trades/buy/route.ts`

```typescript
export async function POST(req: Request) {
  try {
    // 1. Authentification utilisateur
    const userId = await requireAuth();
    
    // 2. Parsing et validation du body
    const { gameId, symbol, quantity } = await req.json();
    
    // 3. Logique métier
    const price = await getPrice(symbol, date);
    const cost = price * quantity;
    
    // 4. Mise à jour base de données
    await db.insert(holdings).values({ userId, symbol, quantity, price });
    await db.update(games).set({ currentBalance: balance - cost });
    
    // 5. Réponse JSON
    return Response.json({ success: true, trade: {...} });
  } catch (error) {
    console.error('[API Error]', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**Comment ça marche :**

1. **Client fait une requête :**
   ```typescript
   fetch('/api/trades/buy', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ gameId, symbol, quantity })
   })
   ```

2. **Next.js route la requête vers le bon `route.ts`**
   - URL `/api/trades/buy` → Fichier `app/api/trades/buy/route.ts`

3. **La fonction `POST` s'exécute côté serveur**
   - Accès complet à la base de données
   - Variables d'environnement accessibles
   - Pas de limites CORS (même origine)

4. **Réponse renvoyée au client**
   - Format JSON standardisé
   - Status codes HTTP appropriés (200, 400, 401, 500)

**Méthodes HTTP supportées :**
- `GET` → Lecture de données
- `POST` → Création de ressources
- `PUT` → Mise à jour complète
- `PATCH` → Mise à jour partielle
- `DELETE` → Suppression

**Rôle :**
- Validation des inputs (Zod schemas)
- Exécution requêtes base de données
- Business logic (calculs, vérifications)
- Gestion erreurs et réponses standardisées

---

### **6. `layout.tsx` - Layouts hiérarchiques**

**Concept :** Wrappers réutilisables qui entourent les pages

**3 layouts dans le projet :**

#### **1. `app/layout.tsx` - Layout ROOT**

```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Providers>  {/* Zustand, Toast, etc. */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**Rôle :**
- Wrapper HTML global obligatoire
- Providers de contexte globaux
- Styles CSS globaux (Tailwind)
- Appliqué à TOUTES les pages sans exception

---

#### **2. `app/(auth)/layout.tsx` - Layout authentification**

```typescript
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-...">
      {children}
    </div>
  );
}
```

**Rôle :**
- Fond centré avec dégradé
- Pas de header ni footer
- Design minimaliste pour focus sur formulaires
- Appliqué uniquement à `/login` et `/signup`

---

#### **3. `app/(app)/layout.tsx` - Layout application**

```typescript
export default function AppLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

**Rôle :**
- Header avec navigation complète
- Footer avec copyright et liens
- Protection middleware (auth check)
- Appliqué à toutes les pages protégées

---

**Hiérarchie de rendu :**
```
RootLayout
  └─> AuthLayout (si route dans (auth)/)
      └─> Page (login ou signup)
  └─> AppLayout (si route dans (app)/)
      └─> Page (dashboard, game, etc.)
```

**Avantages :**
- Réutilisation code (DRY principle)
- Cohérence UI automatique
- Layouts différents par contexte
- Performance (layouts ne re-render pas)

---

## 🎨 COMPONENTS/ - BRIQUES UI RÉUTILISABLES

### **7. Intégration dans les pages**

**Principe :** Les composants sont des briques UI importées et composées dans les pages

**Exemple concret :**

```typescript
// app/dashboard/page.tsx
import { WelcomeCard } from '@/components/dashboard/welcome-card';
import { GameCard } from '@/components/dashboard/game-card';
import { CreateGameCard } from '@/components/dashboard/create-game-card';

export default function DashboardPage() {
  const games = await fetchUserGames();
  
  return (
    <div className="container">
      <WelcomeCard gamesPlayed={games.length} />
      <CreateGameCard />
      {games.map(game => <GameCard key={game.id} game={game} />)}
    </div>
  );
}
```

**Organisation par domaine fonctionnel :**

#### **`components/auth/`** - Authentification
- `login-form.tsx` → Formulaire connexion (email, password, bouton submit)
- `signup-form.tsx` → Formulaire inscription (nom, email, password)
- `auth-provider.tsx` → Context provider session (prévu)

#### **`components/dashboard/`** - Dashboard
- `welcome-card.tsx` → Card bienvenue avec stats utilisateur
- `game-card.tsx` → Card aperçu partie (date, balance, performance)
- `create-game-card.tsx` → Formulaire création nouvelle partie

#### **`components/game/`** - Interface trading
- `asset-list.tsx` → Liste assets avec recherche et filtres
- `portfolio-summary.tsx` → Résumé portefeuille (valeur, P&L, score)
- `holdings-table.tsx` → Table positions longues avec prix actuel
- `short-positions-table.tsx` → Table positions courtes
- `transaction-history.tsx` → Historique transactions avec filtres
- `next-day-button.tsx` → Bouton avancer jour suivant

#### **`components/ui/`** - Primitives réutilisables
- `button.tsx` → Bouton avec variants (primary, ghost, danger)
- `card.tsx` → Card avec effet glassmorphism
- `modal.tsx` → Modal avec backdrop et animations
- `input.tsx` → Input avec label et validation
- `badge.tsx` → Badge statut (active, completed, paused)
- `loading-spinner.tsx` → Spinner chargement
- `toast.tsx` → Notifications toast

#### **`components/layout/`** - Layout
- `header.tsx` → En-tête navigation avec logo et liens
- `footer.tsx` → Pied de page copyright et lien admin

**Tous les composants sont Client Components (`'use client'`) :**
- Permettent interactivité (onClick, onChange, useState)
- Utilisent hooks React
- Gèrent events utilisateur
- Peuvent faire des fetch API

---

## 📦 DOSSIERS HORS APP/ - SERVICES ET UTILITAIRES

### **8. Rôles des dossiers principaux**

#### **`hooks/` - Custom React Hooks**

**Tous côté client (`'use client'`)**

**`use-auth.ts`** - Hook authentification
- Zustand store pour session utilisateur
- `useAuth()` → Retourne `{ user, authenticated, loading, logout }`
- `useRefreshSession()` → Force refresh session après login
- Utilisé dans tous les composants nécessitant auth

**`use-debounce.ts`** - Hook debounce
- Délai avant exécution fonction
- Utile pour inputs de recherche
- Évite trop de requêtes API

**`use-toast.ts`** - Hook notifications
- `toast.success(message)` → Notification verte
- `toast.error(message)` → Notification rouge
- `toast.info(message)` → Notification bleue
- Gestion file d'attente et auto-dismiss

---

#### **`lib/` - Logique métier serveur**

**Tous côté serveur (jamais importés côté client)**

**Sous-domaines :**
- `auth/` → Gestion sessions et authentification
- `db/` → ORM Drizzle et schémas
- `game/` → Logique jeu (calculs, validations)
- `market/` → Données financières
- `supabase/` → Clients Supabase
- `utils/` → Utilitaires génériques

**Caractéristiques :**
- Accès direct base de données
- Secrets et variables d'environnement
- Business logic complexe
- Calculs financiers

---

#### **`public/` - Assets statiques**

**Fichiers accessibles publiquement :**
- `logo_complet_gris.jpg` → Logo application
- `courbe_fond_vert.png` → Image fond page accueil
- `*.svg` → Icônes diverses

**Accès :**
- Depuis HTML : `<img src="/logo.png" />`
- Depuis CSS : `url('/logo.png')`
- URL directe : `https://ton-site.com/logo.png`

**Pas de processing :**
- Servis tels quels par Next.js
- Optimisation images possible avec next/image

---

#### **`scripts/` - Scripts dev/maintenance**

**Exécutés manuellement en ligne de commande**

**`test-db-connection.ts`**
- Teste connexion PostgreSQL Supabase
- Vérifie credentials et réseau
- Affiche tables disponibles

**`test-trading.ts`**
- Teste logique trading
- Vérifie calculs P&L
- Simule transactions

**Utilisation :**
```bash
npx tsx scripts/test-db-connection.ts
```

---

#### **`store/` - State management Zustand**

**Actuellement vide, prévu pour :**
- Store global application
- État partagé entre composants
- Alternative à React Context

**Exemple futur :**
```typescript
// store/game-store.ts
export const useGameStore = create((set) => ({
  currentGame: null,
  setCurrentGame: (game) => set({ currentGame: game })
}));
```

---

#### **`types/` - Types TypeScript partagés**

**Définitions de types utilisées partout**

**`api.ts`** - Types API
- `CreateGameRequest` → Body POST /api/games/create
- `TradeRequest` → Body POST /api/trades/buy
- `ApiResponse<T>` → Format réponse standard

**`database.ts`** - Types base de données
- `User`, `Game`, `Holding`, `Transaction`
- Générés depuis schéma Drizzle
- Types étendus avec relations

**`game.ts`** - Types logique jeu
- `GameWithStats` → Game + calculs portfolio
- `HoldingWithMetadata` → Holding + prix actuel
- `PortfolioSummary` → Résumé complet

**`market.ts`** - Types données marché
- `Asset` → Définition asset (symbol, name, type)
- `PriceData` → Prix OHLCV
- `AssetType` → 'stock' | 'bond' | 'index'

---

## 🔧 LIB/ - LE CERVEAU DE L'APPLICATION

### **9. Sous-dossiers cruciaux en détail**

#### **`lib/market/` - Données financières**

**`assets.ts`** - Catalogue assets
- Liste complète des 240 assets tradables
- Actions US (90), françaises (50), européennes (50)
- Indices (30), obligations (10)
- Métadonnées : symbol, name, type, category, exchange

**`db.ts`** - Cache base de données (OBSOLÈTE - À nettoyer)
- Anciennement : cache MarketStack en table `market_data_cache`
- Maintenant : toutes les données dans Supabase privée

**`prices.ts`** - Récupération prix
- `getPrice(symbol, date)` → Query Supabase privée table `market_prices`
- `batchGetPrices(symbols[], date)` → Query batch optimisée
- Gestion erreurs si données manquantes
- Retour objets `{ symbol, date, open, high, low, close, volume }`

**Architecture :**
```
Client demande prix
  ↓
lib/market/prices.ts
  ↓
Query Supabase DB privée (market_prices)
  ↓
Return prix ou throw error si manquant
```

---

#### **`lib/supabase/` - Clients Supabase**

**3 clients différents selon contexte d'exécution**

**`client.ts`** - Client browser
```typescript
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
```
- **Utilisé dans :** Client Components
- **Gestion cookies :** Automatique par le navigateur
- **Auth :** `supabase.auth.signInWithPassword()`

**`server.ts`** - Client Server Components
```typescript
export async function createServerClient() {
  const cookieStore = await cookies();
  return createServerClient(URL, KEY, {
    cookies: { getAll, setAll }
  });
}
```
- **Utilisé dans :** Server Components, middleware
- **Gestion cookies :** Via Next.js cookies() API
- **Auth :** `supabase.auth.getUser()` lit cookies serveur

**`middleware.ts`** - Client middleware
- Similaire à `server.ts` mais optimisé pour middleware
- Gestion spéciale cookies en Edge Runtime
- Performance critique (s'exécute à chaque requête)

**Pourquoi 3 clients ?**
- Environnements d'exécution différents
- Gestion cookies différente (browser vs server vs edge)
- Optimisations spécifiques à chaque contexte

---

#### **`lib/db/` - ORM Drizzle**

**`index.ts`** - Instance Drizzle
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const client = postgres(DATABASE_URL);
export const db = drizzle(client, { schema });
```
- Instance unique exportée
- Configuration connection pool
- Importée partout : `import { db } from '@/lib/db'`

**`schema.ts`** - Définition tables
```typescript
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const games = pgTable('games', { ... });
export const holdings = pgTable('holdings', { ... });
// ... 8 tables total
```

**Tables définies :**
1. `users` → Utilisateurs
2. `games` → Parties de jeu
3. `holdings` → Positions longues
4. `short_positions` → Positions courtes
5. `transactions` → Historique trades
6. `market_data_cache` → Cache prix (obsolète)
7. `leaderboard_snapshots` → Classements quotidiens
8. `achievements` → Succès déblocables
9. `user_achievements` → Succès user
10. `api_stats` → Stats quotas API

**Avantages Drizzle :**
- Type-safety complète
- Autocomplétion IDE
- Migrations SQL générées
- Performance native SQL

---

#### **`lib/game/` - Game logic**

**`calculations.ts`** - Calculs financiers
```typescript
export async function calculatePortfolio(gameId, date) {
  // 1. Récupère holdings et short positions
  // 2. Fetch prix actuels pour chaque position
  // 3. Calcule valeur portfolio long
  // 4. Calcule P&L short positions
  // 5. Calcule total value = balance + portfolio - shorts
  // 6. Calcule return % = (total - initial) / initial * 100
  // 7. Calcule score = return % * multiplicateur temps
  
  return {
    portfolioValueLong,
    shortPositionsPnl,
    totalValue,
    returnPercentage,
    score
  };
}
```

**`next-day.ts`** - Avancement jour
```typescript
export async function advanceToNextDay(gameId) {
  const game = await getGame(gameId);
  const nextDate = nextBusinessDay(game.currentDate);
  
  // Vérifie données disponibles pour nextDate
  await prefetchSingleDay(nextDate);
  
  // Update game.currentDate
  await db.update(games).set({ currentDate: nextDate });
  
  // Recalcule portfolio avec nouveaux prix
  const portfolio = await calculatePortfolio(gameId, nextDate);
  
  // Check achievements
  await checkAchievements(gameId);
  
  return { newDate: nextDate, portfolio };
}
```

**`validations.ts`** - Validations trading
- `canBuy(gameId, symbol, quantity, price)` → Vérifie solde suffisant
- `canSell(gameId, symbol, quantity)` → Vérifie position existante
- `canShort(gameId, symbol, quantity, price)` → Vérifie marge
- `canCover(gameId, symbol, quantity)` → Vérifie short position

**`achievements.ts`** - Système succès
- `checkAchievements(gameId)` → Vérifie tous les critères
- Liste achievements : First Trade, Millionaire, Day Trader, etc.
- Unlock automatique si critères remplis

**`trade-schemas.ts`** - Schémas Zod
- Validation formats inputs trades
- `buySchema`, `sellSchema`, `shortSchema`, `coverSchema`

---

#### **`lib/auth/` - Authentification**

**`session.ts`** - Gestion sessions
```typescript
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Récupère infos DB
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  });
  
  return dbUser;
}

export async function signIn(email, password) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  });
  // ...
}
```

**Fonctions principales :**
- `getSessionUser()` → User actuel ou null
- `requireUser()` → User ou throw error
- `signIn(email, password)` → Connexion
- `signUp(email, password, name)` → Inscription
- `signOut()` → Déconnexion

**`middleware.ts`** - Helper API routes
```typescript
export function withAuth(handler) {
  return async (req) => {
    const userId = await getUserId(req);
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return handler(req, userId);
  };
}
```

---

#### **`lib/utils/` - Utilitaires**

**`dates.ts`** - Gestion dates trading
- `isBusinessDay(date)` → Exclut week-ends + fériés US
- `nextBusinessDay(date)` → Prochain jour ouvré
- `previousBusinessDay(date)` → Jour ouvré précédent
- `ensureBusinessDay(date)` → Ajuste au prochain si week-end/férié
- `getBusinessDaysBetween(start, end)` → Nombre jours ouvrés
- Liste jours fériés US 2024-2026

**`formatting.ts`** - Formatage affichage
- `formatCurrency(value)` → "$1,234.56"
- `formatPercent(value)` → "+12.34%"
- `formatDate(date)` → "15 juin 2025"
- `formatNumber(value)` → "1,234,567"

**`cn.ts`** - Merge classes Tailwind
```typescript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```
- Évite conflits classes CSS
- Utilisé partout : `className={cn('base', condition && 'extra')}`

**`errors.ts`** - Gestion erreurs
- Classes d'erreurs custom
- Messages standardisés
- Logging centralisé

---

## 🗄️ REQUÊTES BASE DE DONNÉES

### **10. Accès aux 2 DB Supabase**

**Architecture 2 bases de données :**

#### **DB 1 : Base principale (Supabase projet principal)**

**Tables :**
- users, games, holdings, short_positions, transactions
- leaderboard_snapshots, achievements, user_achievements
- api_stats

**Connexion :**
```typescript
import { db } from '@/lib/db';
import { games, holdings } from '@/lib/db/schema';

const userGames = await db.query.games.findMany({
  where: eq(games.userId, userId)
});
```

**Configuration :**
- `DATABASE_URL` en variable d'environnement
- Connection pooling Supabase (10-100 connexions)
- Drizzle ORM pour queries type-safe

**Utilisée dans :**
- API Routes (`/api/games/`, `/api/trades/`, `/api/auth/`)
- Server Components (`dashboard/page.tsx`, `game/[id]/page.tsx`)
- Services (`lib/game/calculations.ts`, `lib/auth/session.ts`)
- Middleware (`middleware.ts` pour auth check)

---

#### **DB 2 : Market data (Supabase privée)**

**Table unique :**
- `market_prices` → Historique complet prix tous assets

**Structure :**
```sql
CREATE TABLE market_prices (
  id UUID PRIMARY KEY,
  symbol TEXT NOT NULL,
  date DATE NOT NULL,
  open NUMERIC,
  high NUMERIC,
  low NUMERIC,
  close NUMERIC,
  volume BIGINT,
  UNIQUE(symbol, date)
);
```

**Connexion :**
```typescript
// lib/market/prices.ts
import { createClient } from '@supabase/supabase-js';

const marketDB = createClient(
  MARKET_SUPABASE_URL,
  MARKET_SUPABASE_KEY
);

export async function getPrice(symbol: string, date: string) {
  const { data } = await marketDB
    .from('market_prices')
    .select('*')
    .eq('symbol', symbol)
    .eq('date', date)
    .single();
  
  return data;
}
```

**Utilisée dans :**
- `lib/market/prices.ts` → Fonctions `getPrice()`, `batchGetPrices()`
- API Routes (`/api/market/price`, `/api/market/history`)
- Game logic (`lib/game/calculations.ts` pour valoriser portfolio)
- Trading (`/api/trades/buy` pour obtenir prix exécution)

---

### **Emplacements requêtes DB multiples**

**1. API Routes (`app/api/`) - Majorité des queries**

Exemples :
- `/api/games/create` → Insert game, prefetch market data
- `/api/trades/buy` → Insert holding, update game balance, insert transaction
- `/api/games/list` → Select games with portfolio calculations

**2. Server Components (`app/(app)/*/page.tsx`)**

Exemples :
- `dashboard/page.tsx` → Fetch user games avec stats
- `game/[id]/page.tsx` → Fetch game, holdings, transactions

**3. Services (`lib/game/`, `lib/market/`)**

Exemples :
- `lib/game/calculations.ts` → Query holdings + prices
- `lib/market/prices.ts` → Query market_prices table
- `lib/auth/session.ts` → Query users table

**4. Middleware (`middleware.ts`)**

Exemple :
- Vérifie session Supabase Auth (via cookies)
- Pas de query SQL directe
- Utilise Supabase client `getUser()`

---

## 🔄 FLUX TYPIQUE - EXEMPLE COMPLET

### **Scénario : User achète 10 actions Apple**

**1. Interface utilisateur (Client Component)**
```typescript
// components/game/asset-list.tsx
<Button onClick={() => handleBuy('AAPL', 10)}>
  Acheter
</Button>
```

**2. Fonction handler**
```typescript
async function handleBuy(symbol, quantity) {
  const res = await fetch('/api/trades/buy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, symbol, quantity })
  });
  
  const data = await res.json();
  if (res.ok) {
    toast.success('Achat réussi !');
    refreshPortfolio();
  }
}
```

**3. API Route (`app/api/trades/buy/route.ts`)**
```typescript
export async function POST(req: Request) {
  // 3.1 Auth check
  const userId = await requireAuth();
  
  // 3.2 Parse body
  const { gameId, symbol, quantity } = await req.json();
  
  // 3.3 Validate ownership
  const game = await db.query.games.findFirst({
    where: and(eq(games.id, gameId), eq(games.userId, userId))
  });
  
  // 3.4 Get current price (DB 2 - market data)
  const price = await getPrice(symbol, game.currentDate);
  
  // 3.5 Validate balance
  const cost = price * quantity;
  if (parseFloat(game.currentBalance) < cost) {
    return Response.json({ error: 'Insufficient funds' }, { status: 400 });
  }
  
  // 3.6 Execute trade (DB 1 - main)
  await db.insert(holdings).values({
    gameId,
    symbol,
    quantity,
    purchasePrice: price,
    purchaseDate: game.currentDate
  });
  
  // 3.7 Update balance
  await db.update(games)
    .set({ currentBalance: (parseFloat(game.currentBalance) - cost).toString() })
    .where(eq(games.id, gameId));
  
  // 3.8 Log transaction
  await db.insert(transactions).values({
    gameId,
    type: 'buy',
    symbol,
    quantity,
    price,
    date: game.currentDate
  });
  
  // 3.9 Response
  return Response.json({ 
    success: true, 
    trade: { symbol, quantity, price, cost }
  });
}
```

**4. Réponse au client**
```typescript
// Toast notification s'affiche
// Portfolio se recharge
// Balance mise à jour
```

**Résumé du flux :**
```
Client Component
  ↓ fetch()
API Route (/api/trades/buy)
  ↓ requireAuth()
Supabase Auth (vérifie cookies)
  ↓ db.query.games
DB 1 (vérifie ownership)
  ↓ getPrice()
DB 2 (récupère prix AAPL)
  ↓ db.insert(holdings)
DB 1 (crée position)
  ↓ db.update(games)
DB 1 (update balance)
  ↓ db.insert(transactions)
DB 1 (log transaction)
  ↓ Response.json()
Client Component (toast + refresh)
```

---

## 🎯 POINTS CLÉS ARCHITECTURE

### **Séparation client/serveur stricte**

**Côté client (`'use client'`) :**
- Tous les composants dans `components/`
- Tous les hooks dans `hooks/`
- Store Zustand dans `store/`
- Interactivité, events, useState, useEffect
- Pas d'accès direct DB
- Pas d'accès secrets/env vars

**Côté serveur (pas de directive) :**
- Tout `lib/` (sauf exports types)
- API Routes dans `app/api/`
- Server Components par défaut
- Accès DB direct via Drizzle
- Variables d'environnement accessibles
- Business logic complexe

**Pont entre les deux : API Routes**
- Client fait `fetch('/api/endpoint')`
- API Route s'exécute côté serveur
- Retourne JSON au client

---

### **Données financières**

**Ancien système (MarketStack API) :**
- ❌ Limite 10,000 requêtes/mois
- ❌ Pas de cryptos
- ❌ Cache manuel nécessaire

**Nouveau système (Supabase privée) :**
- ✅ Données complètes pré-chargées
- ✅ Requêtes illimitées
- ✅ Latence faible
- ✅ Pas de quota à gérer

**Migration en cours :**
- Fichiers obsolètes à nettoyer (`lib/market/db.ts`, table `market_data_cache`)
- Nouveau fichier `lib/market/prices.ts` opérationnel

---

### **Authentification**

**Système : Supabase Auth**
- JWT tokens stockés en cookies httpOnly
- Sessions gérées automatiquement
- SSR-friendly (cookies lus côté serveur)

**Flow connexion :**
```
1. User remplit formulaire login
2. Client Component appelle supabase.auth.signInWithPassword()
3. Supabase crée session JWT
4. Cookie `sb-xxx-auth-token` créé dans browser
5. Redirect vers /dashboard
6. Middleware lit cookie et valide session
7. Dashboard s'affiche
```

**Protection routes :**
- Middleware global (`middleware.ts`)
- Vérifie routes `/dashboard`, `/game/*`, `/admin/*`
- Redirect `/login` si pas de session valide
- Cookies propagés automatiquement avec chaque requête

---

### **Game logic**

**Calculs temps réel :**
- Portfolio value = Σ(holdings × current_price)
- Short P&L = Σ((short_price - current_price) × quantity)
- Total value = balance + portfolio_value - short_pnl
- Return % = ((total - initial) / initial) × 100
- Score = return % × time_multiplier

**Avancement jour par jour :**
- Bouton "Jour suivant"
- Skip week-ends et jours fériés US automatiquement
- Prefetch prix du nouveau jour avant avancement
- Recalcul complet portfolio avec nouveaux prix
- Check achievements débloqués

**Achievements :**
- Vérifiés automatiquement après chaque action
- Critères : First Trade, Millionaire, Diversification, etc.
- Unlock persisté en DB (`user_achievements`)

---

### **Base de données queries**

**2 patterns principaux :**

**1. Drizzle ORM (DB principale)**
```typescript
// Select
const games = await db.query.games.findMany({
  where: eq(games.userId, userId),
  orderBy: desc(games.createdAt)
});

// Insert
await db.insert(holdings).values({
  gameId, symbol, quantity, price
});

// Update
await db.update(games)
  .set({ currentBalance: newBalance })
  .where(eq(games.id, gameId));

// Delete
await db.delete(holdings)
  .where(eq(holdings.id, holdingId));
```

**2. Supabase client (Market data)**
```typescript
const { data } = await marketDB
  .from('market_prices')
  .select('*')
  .eq('symbol', 'AAPL')
  .eq('date', '2025-01-15')
  .single();
```

**Connection pooling :**
- Supabase gère pool automatiquement
- 10-100 connexions simultanées selon plan
- Connexions réutilisées (pas 1 nouvelle par requête)
- Scalable jusqu'à 5000-10000 users simultanés

---

## 📚 GLOSSAIRE - TERMES TECHNIQUES

### **A**

**API Route (Next.js)**
Fichier `route.ts` dans `app/api/` qui expose un endpoint HTTP REST. S'exécute côté serveur et permet d'accéder à la base de données, secrets, etc. Remplace les anciens `/pages/api/` de Next.js 12.

**App Router (Next.js 14+)**
Nouveau système de routing de Next.js basé sur le dossier `app/`. Remplace le Pages Router. Supporte Server Components nativement et organise les routes via l'arborescence de fichiers.

**Asset**
Actif financier tradable dans l'application (action, indice, obligation). Exemple : Apple (AAPL), S&P 500, US Treasury Bond.

---

### **B**

**Batch Query**
Requête qui récupère plusieurs enregistrements en une seule requête DB au lieu de faire des requêtes individuelles. Optimisation performance cruciale.

**Business Day**
Jour ouvré (lundi-vendredi) excluant week-ends et jours fériés. Les marchés financiers sont fermés les jours non-ouvrés.

---

### **C**

**Cache**
Stockage temporaire de données pour éviter requêtes répétées. Dans FinanceQuest : prix historiques stockés en DB pour éviter appels API externes.

**Client Component**
Composant React avec directive `'use client'` qui s'exécute dans le navigateur. Permet interactivité (onClick, useState) mais pas d'accès direct DB.

**Connection Pool**
Pool de connexions DB réutilisables. Au lieu de créer/fermer une connexion par requête (lent), on réutilise un pool de connexions ouvertes (rapide).

**Cookie httpOnly**
Cookie non accessible via JavaScript côté client. Utilisé pour stocker JWT auth de manière sécurisée (protection XSS).

---

### **D**

**Debounce**
Technique qui retarde l'exécution d'une fonction jusqu'à ce que l'utilisateur arrête d'agir. Exemple : attendre 300ms après dernière frappe clavier avant de lancer recherche.

**Drizzle ORM**
Object-Relational Mapping pour TypeScript. Permet d'écrire des requêtes DB type-safe au lieu de SQL brut. Alternative moderne à Prisma.

**Dynamic Rendering**
Mode de rendu où Next.js génère la page à chaque requête (pas de cache). Nécessaire pour pages utilisant cookies, headers, ou données temps réel.

---

### **E**

**Edge Runtime**
Environnement d'exécution léger de Vercel qui tourne au plus près de l'utilisateur géographiquement. Utilisé pour middleware. Limitations : pas de Node.js complet.

**Endpoint**
URL accessible par HTTP (GET, POST, etc.) qui expose une fonctionnalité. Exemple : `POST /api/trades/buy` est un endpoint.

---

### **H**

**Hook (React)**
Fonction React qui permet d'utiliser state et lifecycle dans des fonctions. Préfixe `use`. Exemples : `useState`, `useEffect`, `useAuth` (custom).

**Holding**
Position longue dans un asset (action possédée). Opposé de short position (action empruntée et vendue).

---

### **J**

**JWT (JSON Web Token)**
Token d'authentification encodé contenant les infos user. Stocké en cookie httpOnly. Signé cryptographiquement pour éviter falsification.

---

### **L**

**Layout centré**
Layout minimaliste avec contenu centré verticalement et horizontalement. Utilisé pour pages auth (login/signup). Pas de navigation.

**Layout complet**
Layout avec header (navigation), footer, et contenu principal. Utilisé pour pages application (dashboard, game). Structure complète.

---

### **M**

**Middleware (Next.js)**
Fonction qui s'exécute AVANT chaque requête. Permet d'intercepter, modifier, ou bloquer requêtes. Utilisé pour vérifier auth avant accès pages protégées.

---

### **O**

**ORM (Object-Relational Mapping)**
Couche d'abstraction entre code et DB. Permet d'écrire requêtes en TypeScript au lieu de SQL. Exemple : Drizzle, Prisma.

---

### **P**

**P&L (Profit & Loss)**
Profit et perte. Différence entre valeur actuelle position et prix d'achat/vente. Peut être positif (gain) ou négatif (perte).

**Prefetch**
Charger des données en avance avant qu'elles soient nécessaires. Exemple : charger prix 30 jours passés lors création partie pour éviter latence ultérieure.

**Props**
Propriétés passées à un composant React. Exemple : `<GameCard game={myGame} />` passe `myGame` en prop.

---

### **R**

**Route Group (Next.js)**
Dossier entre parenthèses `(auth)` qui organise fichiers sans affecter l'URL. Permet différents layouts pour différentes sections.

**RSC (React Server Component)**
Composant qui s'exécute uniquement côté serveur. Peut accéder DB directement. Pas de `'use client'`. Default dans Next.js App Router.

---

### **S**

**Schema (DB)**
Définition structure base de données. Tables, colonnes, types, contraintes, relations. Dans Drizzle : fichier `schema.ts`.

**Server Component**
Voir RSC. Composant par défaut dans Next.js 14+ App Router.

**Short Position**
Vente à découvert. Emprunter action, la vendre immédiatement, puis la racheter plus tard (espérant baisse prix pour profit).

**SSR (Server-Side Rendering)**
Rendu côté serveur. HTML généré sur le serveur avant envoi au client. Opposé de CSR (Client-Side Rendering).

---

### **T**

**Toast**
Notification légère qui apparaît temporairement (3-5s) en coin d'écran. Types : success (vert), error (rouge), info (bleu).

**Type-safe**
Code TypeScript où types sont vérifiés au compile-time. Évite erreurs runtime. Exemple : Drizzle queries sont type-safe.

---

### **Z**

**Zod**
Bibliothèque validation TypeScript. Permet définir schémas et valider inputs. Utilisé pour valider bodies API routes.

**Zustand**
Bibliothèque state management React légère. Alternative à Redux. Utilise hooks. Exemple : `useAuthStore()`.

---

**Fin du document** - TOPO Architecture FinanceQuest v1.0
