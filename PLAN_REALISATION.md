# 🚀 FINANCEQUEST - PLAN DE RÉALISATION COMPLET

Plan de développement progressif en **8 parties testables** et indépendantes.

---

## 📦 PARTIE 1 : Configuration & Foundation (DÉJÀ FAIT ✅)

**Durée estimée** : 1-2h  
**Status** : ✅ TERMINÉ

### Fichiers créés
- [x] Projet Next.js 14 initialisé
- [x] Base de données Supabase (8 tables)
- [x] 50 achievements pré-remplis
- [x] `.env.local` configuré
- [x] `drizzle.config.ts`
- [x] Dependencies installées

---

## 📦 PARTIE 2 : Database Schema + Core Services

**Durée estimée** : 2-3h  
**Objectif** : Créer la fondation type-safe (Drizzle) et les services de base.

### Fichiers à créer (10 fichiers)

#### 1. Schema Drizzle
```
/lib/db/schema.ts          # Définitions 8 tables Drizzle
/lib/db/index.ts           # Export client Drizzle
/types/database.ts         # Types générés depuis schema
```

#### 2. Clients Supabase
```
/lib/supabase/client.ts    # Client browser (auth UI)
/lib/supabase/server.ts    # Client server (API routes)
```

#### 3. Services Market
```
/lib/market/assets.ts      # Liste 105 assets + métadata
/lib/market/marketstack.ts # Wrapper MarketStack API
/lib/market/cache.ts       # Cache ultra-strict ⚠️ CRITIQUE
/lib/market/prefetch.ts    # Pre-fetch batch ⚠️ CRITIQUE
```

#### 4. Utilities
```
/lib/utils/dates.ts        # Helpers dates (skip weekends)
```

### Tests à faire
```bash
# Test connexion Drizzle
npm run db:test

# Test cache MarketStack
npm run test:market-cache

# Test pre-fetch
npm run test:prefetch
```

### Critères de validation
- ✅ Toutes les tables sont définies avec types corrects
- ✅ Cache vérifie DB AVANT d'appeler MarketStack
- ✅ Pre-fetch fonctionne avec 105 symboles
- ✅ Pas d'erreur TypeScript

---

## 📦 PARTIE 3 : Authentification

**Durée estimée** : 3-4h  
**Objectif** : Auth complète (signup, login, session, middleware).

### Fichiers à créer (10 fichiers)

#### 1. Services Auth
```
/lib/auth/session.ts       # Gestion sessions JWT
/lib/auth/middleware.ts    # Helpers vérification auth
```

#### 2. API Routes Auth
```
/app/api/auth/signup/route.ts    # POST /api/auth/signup
/app/api/auth/login/route.ts     # POST /api/auth/login
/app/api/auth/logout/route.ts    # POST /api/auth/logout
/app/api/auth/session/route.ts   # GET /api/auth/session
```

#### 3. Composants Auth (Client)
```
/components/auth/login-form.tsx   # Formulaire login
/components/auth/signup-form.tsx  # Formulaire signup
/components/auth/auth-provider.tsx # Context React auth
```

#### 4. Pages Auth
```
/app/(auth)/login/page.tsx        # Page login
/app/(auth)/signup/page.tsx       # Page signup
/app/(auth)/layout.tsx            # Layout centré
```

#### 5. Middleware Next.js
```
/middleware.ts                    # Rate limiting + auth check
```

#### 6. Hooks
```
/hooks/use-auth.ts                # Hook useAuth()
```

#### 7. Store
```
/store/auth-store.ts              # Zustand auth store
```

### Tests à faire
```bash
# Manuel (browser)
1. Créer compte → Vérifier users table
2. Login → Vérifier JWT dans cookie
3. Logout → Vérifier cookie supprimé
4. Accéder /dashboard sans auth → Redirect /login
```

### Critères de validation
- ✅ Signup crée un user dans Supabase
- ✅ Login retourne JWT valide
- ✅ Middleware redirige si non-auth
- ✅ useAuth() retourne user courant
- ✅ Rate limiting bloque après 30 req/min

---

## 📦 PARTIE 4 : Game Logic Core

**Durée estimée** : 4-5h  
**Objectif** : Créer/lister games + calculs métier.

### Fichiers à créer (12 fichiers)

#### 1. Services Game
```
/lib/game/calculations.ts         # Calculs portfolio, P&L, score
/lib/game/validations.ts          # Validations ordres
/lib/game/next-day.ts             # Logique avancement jour
/lib/game/achievements.ts         # Vérification achievements
```

#### 2. Types
```
/types/game.ts                    # Types Game, Holding, Transaction
/types/api.ts                     # Types API requests/responses
```

#### 3. API Routes Games
```
/app/api/games/create/route.ts    # POST /api/games/create ⚠️ + prefetch
/app/api/games/list/route.ts      # GET /api/games/list
/app/api/games/[id]/route.ts      # GET /api/games/:id
/app/api/games/next-day/route.ts  # POST /api/games/next-day
```

#### 4. API Routes Market
```
/app/api/market/price/route.ts    # GET /api/market/price
/app/api/market/history/route.ts  # GET /api/market/history
/app/api/market/assets/route.ts   # GET /api/market/assets
```

#### 5. Utilities
```
/lib/utils/formatting.ts          # Format prix, %
/lib/utils/errors.ts              # Gestion erreurs
```

### Tests à faire
```bash
# Via Postman/Insomnia
POST /api/games/create
  Body: { start_date: "2023-01-01" }
  
  ✅ Devrait créer game
  ✅ Devrait pre-fetch 105 assets
  ✅ Devrait limiter à 5 games actives
  
GET /api/games/list
  ✅ Devrait retourner games du user
  
POST /api/games/next-day
  Body: { game_id: "xxx" }
  
  ✅ Devrait avancer d'1 jour
  ✅ Devrait skip week-end
```

### Critères de validation
- ✅ Création game pre-fetch les données
- ✅ Limite 5 games actives fonctionne
- ✅ Next-day skip les week-ends
- ✅ Calculs P&L corrects

---

## 📦 PARTIE 5 : Trading System

**Durée estimée** : 4-5h  
**Objectif** : Implémenter buy/sell/short/cover.

### Fichiers à créer (6 fichiers)

#### 1. API Routes Trades
```
/app/api/trades/buy/route.ts      # POST /api/trades/buy
/app/api/trades/sell/route.ts     # POST /api/trades/sell
/app/api/trades/short/route.ts    # POST /api/trades/short
/app/api/trades/cover/route.ts    # POST /api/trades/cover
```

#### 2. Types
```
/types/market.ts                  # Types MarketStack, Asset
```

#### 3. Validation Schema
```
/lib/game/trade-schemas.ts        # Schemas Zod validation
```

### Tests à faire
```bash
# Scénario complet
1. Créer game start_date=2023-01-01
2. BUY 10 AAPL à current_date
   ✅ Balance diminue
   ✅ Holding créé
   ✅ Transaction enregistrée
   
3. SELL 5 AAPL
   ✅ Balance augmente
   ✅ Holding quantity = 5
   
4. SHORT 10 TSLA
   ✅ Balance augmente temporairement
   ✅ Holding is_short=true
   
5. COVER 10 TSLA
   ✅ Balance diminue
   ✅ Holding supprimé
   ✅ P&L calculé
```

### Critères de validation
- ✅ Validations bloquent ordres invalides
- ✅ Frais de transaction appliqués
- ✅ Impossible d'avoir long + short même symbole
- ✅ Balance jamais négative
- ✅ Short P&L correct (inverse)

---

## 📦 PARTIE 6 : Dashboard UI

**Durée estimée** : 5-6h  
**Objectif** : Interface dashboard + création games.

### Fichiers à créer (15 fichiers)

#### 1. Composants UI Base
```
/components/ui/button.tsx         # Button variants
/components/ui/card.tsx           # Card glassmorphism
/components/ui/input.tsx          # Input validation
/components/ui/modal.tsx          # Modal backdrop
/components/ui/calendar.tsx       # Calendrier élégant
/components/ui/loading-spinner.tsx
/components/ui/toast.tsx
/components/ui/badge.tsx
```

#### 2. Composants Dashboard
```
/components/dashboard/welcome-card.tsx
/components/dashboard/create-game-card.tsx
/components/dashboard/game-card.tsx
/components/dashboard/stats-overview.tsx
```

#### 3. Layout
```
/components/layout/header.tsx
/components/layout/footer.tsx
```

#### 4. Pages
```
/app/(app)/dashboard/page.tsx     # Dashboard principal
/app/(app)/layout.tsx             # Layout app
```

#### 5. Hooks
```
/hooks/use-toast.ts
/hooks/use-debounce.ts
```

#### 6. Store
```
/store/ui-store.ts                # Modals, toasts
```

### Tests à faire
```bash
# Manuel (browser)
1. Login → Accéder /dashboard
2. Voir liste games actives
3. Cliquer "Nouvelle Partie"
   ✅ Modal s'ouvre
   ✅ Calendrier fonctionne
   ✅ Date < aujourd'hui seulement
4. Créer game
   ✅ Loading state
   ✅ Toast success
   ✅ GameCard apparaît
```

### Critères de validation
- ✅ Design audacieux + glassmorphism
- ✅ Responsive mobile
- ✅ Animations fluides
- ✅ Loading states partout

---

## 📦 PARTIE 7 : Game Page (Trading Interface)

**Durée estimée** : 6-8h  
**Objectif** : Interface de jeu complète.

### Fichiers à créer (12 fichiers)

#### 1. Composants Game
```
/components/game/portfolio-summary.tsx
/components/game/holdings-table.tsx
/components/game/short-positions-table.tsx
/components/game/asset-list.tsx
/components/game/asset-chart-modal.tsx
/components/game/transaction-history.tsx
/components/game/timeline.tsx
/components/game/next-day-button.tsx
```

#### 2. Composants UI
```
/components/ui/chart.tsx          # Wrapper Recharts
/components/ui/table.tsx
/components/ui/tabs.tsx
```

#### 3. Page
```
/app/(app)/game/[id]/page.tsx
```

#### 4. Hooks
```
/hooks/use-game.ts                # Hook game data
/hooks/use-market-data.ts         # Hook market data
```

#### 5. Store
```
/store/game-store.ts              # Zustand game store
```

### Tests à faire
```bash
# Scénario trading complet
1. Ouvrir game existant
2. Voir portfolio (balance, holdings)
3. Cliquer sur AAPL
   ✅ Modal + graphique s'affiche
   ✅ Données historiques correctes
4. Acheter 10 AAPL
   ✅ Loading
   ✅ Portfolio mis à jour
   ✅ Transaction apparaît
5. Cliquer "Jour Suivant"
   ✅ Date avance
   ✅ Valeurs mises à jour
   ✅ Week-ends sautés
```

### Critères de validation
- ✅ Graphiques Recharts fonctionnels
- ✅ Tous les calculs corrects (P&L, total value)
- ✅ Short positions séparées visuellement
- ✅ Timeline visuelle claire
- ✅ Responsive 3 colonnes → stack mobile

---

## 📦 PARTIE 8 : Leaderboard + Achievements + Cron

**Durée estimée** : 4-5h  
**Objectif** : Classements, achievements, cron jobs.

### Fichiers à créer (12 fichiers)

#### 1. API Routes
```
/app/api/leaderboard/route.ts     # GET /api/leaderboard
/app/api/achievements/list/route.ts
/app/api/achievements/user/route.ts
/app/api/admin/monitoring/route.ts
```

#### 2. Cron Jobs
```
/app/api/cron/cleanup-games/route.ts
/app/api/cron/update-leaderboard/route.ts
```

#### 3. Composants Leaderboard
```
/components/leaderboard/leaderboard-table.tsx
/components/leaderboard/period-selector.tsx
```

#### 4. Pages
```
/app/(app)/leaderboard/page.tsx
/app/(app)/admin/monitoring/page.tsx
```

#### 5. Config
```
/vercel.json                      # Cron schedules
```

#### 6. Scripts
```
/scripts/seed-achievements.ts     # Peupler achievements
/scripts/test-db-connection.ts    # Test DB
```

### Tests à faire
```bash
# Leaderboard
GET /api/leaderboard?period=all_time
  ✅ Top 100 games triés par score
  
# Achievements
POST /api/games/next-day (trigger check)
  ✅ Si criteria remplis → unlock
  ✅ Toast notification

# Cron (local test)
GET /api/cron/cleanup-games
  Header: Authorization: Bearer CRON_SECRET
  ✅ Supprime games > 90 jours
  
GET /api/cron/update-leaderboard
  ✅ Calcule scores + ranks
  ✅ INSERT snapshots
```

### Critères de validation
- ✅ Leaderboard 3 périodes fonctionne
- ✅ Achievements se débloquent auto
- ✅ Cron cleanup fonctionne
- ✅ Cron leaderboard fonctionne
- ✅ Dashboard admin affiche stats

---

## 📦 BONUS : Polish & Optimizations

**Durée estimée** : 2-3h (optionnel)

### Améliorations
1. **Homepage** (`/app/page.tsx`)
   - Hero section
   - Features
   - Footer

2. **Loading states avancés**
   - Skeleton components
   - Progressive loading

3. **Error boundaries**
   - Error pages custom
   - 404, 500

4. **SEO**
   - Metadata Next.js
   - OG images

5. **Analytics** (optionnel)
   - Vercel Analytics
   - Tracking events

---

## 📊 RÉCAPITULATIF

| Partie | Durée | Fichiers | Complexité | Testable |
|--------|-------|----------|------------|----------|
| 1. Foundation | 2h | 5 | ⭐ | ✅ |
| 2. Schema + Services | 3h | 10 | ⭐⭐ | ✅ |
| 3. Auth | 4h | 10 | ⭐⭐⭐ | ✅ |
| 4. Game Logic | 5h | 12 | ⭐⭐⭐⭐ | ✅ |
| 5. Trading | 5h | 6 | ⭐⭐⭐⭐ | ✅ |
| 6. Dashboard UI | 6h | 15 | ⭐⭐⭐ | ✅ |
| 7. Game Page | 8h | 12 | ⭐⭐⭐⭐⭐ | ✅ |
| 8. Leaderboard + Cron | 5h | 12 | ⭐⭐⭐ | ✅ |
| **TOTAL** | **38h** | **82** | - | - |

---

## 🎯 STRATÉGIE DE DÉVELOPPEMENT

### Option A : Linéaire (recommandée pour solo)
```
Partie 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
```
Chaque partie complète avant de passer à la suivante.

### Option B : Verticale (si équipe)
```
Partie 2-3-4 (Backend complet)
↓
Partie 6-7 (Frontend complet)
↓
Partie 5-8 (Trading + Features)
```

### Option C : MVP Rapide
```
Partie 1-2-3 (Auth + DB)
↓
Partie 4 + API trades simplifiées
↓
Partie 6 (Dashboard minimaliste)
↓
DÉPLOIEMENT ALPHA
↓
Parties 5-7-8 (Features complètes)
```

---

## ✅ CHECKLIST AVANT CHAQUE PARTIE

Avant de coder :
- [ ] Lire les specs de la partie
- [ ] Vérifier que la partie précédente fonctionne
- [ ] Préparer les fichiers de test

Pendant le dev :
- [ ] Commit réguliers (1 commit par fichier majeur)
- [ ] Pas de `any` types
- [ ] Tests manuels au fur et à mesure

Après chaque partie :
- [ ] Tests complets de la partie
- [ ] Fix tous les bugs
- [ ] Commit final "feat: partie X complete"
- [ ] Push sur Git

---

## 🚀 PRÊT À COMMENCER ?

**Prochaine étape recommandée** : PARTIE 2 (Schema + Services)

Tu veux que je génère les fichiers de la Partie 2 maintenant ?

