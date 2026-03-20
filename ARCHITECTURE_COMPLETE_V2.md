# 🏗️ FINANCEQUEST ALPHA - ARCHITECTURE COMPLÈTE V2

> **Dernière mise à jour** : 10 février 2026  
> **Version** : 2.0  
> **Framework** : Next.js 14 (App Router)

---

## 📂 ARBORESCENCE COMPLÈTE

```
financequestalpha/
│
├── 📁 app/                                    # Next.js App Router
│   ├── 📁 (auth)/                             # Groupe routes authentification
│   │   ├── 📁 login/
│   │   │   └── page.tsx                       # Page connexion
│   │   ├── 📁 signup/
│   │   │   └── page.tsx                       # Page inscription
│   │   └── layout.tsx                         # Layout auth centré
│   │
│   ├── 📁 (app)/                              # Groupe routes application
│   │   ├── 📁 about/
│   │   │   └── page.tsx                       # Page à propos
│   │   ├── 📁 admin/
│   │   │   └── 📁 monitoring/
│   │   │       └── page.tsx                   # Dashboard monitoring admin
│   │   ├── 📁 dashboard/
│   │   │   └── page.tsx                       # Dashboard principal utilisateur
│   │   ├── 📁 game/
│   │   │   └── 📁 [id]/
│   │   │       └── page.tsx                   # Page jeu dynamique
│   │   ├── 📁 leaderboard/
│   │   │   └── page.tsx                       # Classement global joueurs
│   │   └── layout.tsx                         # Layout app principal
│   │
│   ├── 📁 api/                                # API Routes serveur
│   │   ├── 📁 admin/
│   │   │   └── 📁 monitoring/
│   │   │       └── route.ts                   # GET monitoring stats
│   │   │
│   │   ├── 📁 auth/
│   │   │   ├── 📁 login/
│   │   │   │   └── route.ts                   # POST connexion utilisateur
│   │   │   ├── 📁 logout/
│   │   │   │   └── route.ts                   # POST déconnexion utilisateur
│   │   │   ├── 📁 session/
│   │   │   │   └── route.ts                   # GET session courante
│   │   │   └── 📁 signup/
│   │   │       └── route.ts                   # POST inscription utilisateur
│   │   │
│   │   ├── 📁 cron/
│   │   │   ├── 📁 cleanup-games/
│   │   │   │   └── route.ts                   # GET nettoyage parties
│   │   │   └── 📁 update-cache/               # Mise à jour cache
│   │   │
│   │   ├── 📁 games/
│   │   │   ├── 📁 [id]/
│   │   │   │   └── route.ts                   # GET partie spécifique
│   │   │   ├── 📁 create/
│   │   │   │   └── route.ts                   # POST création partie
│   │   │   ├── 📁 list/
│   │   │   │   └── route.ts                   # GET liste parties
│   │   │   └── 📁 next-day/
│   │   │       └── route.ts                   # POST jour suivant
│   │   │
│   │   ├── 📁 leaderboard/
│   │   │   └── route.ts                       # GET classement global
│   │   │
│   │   ├── 📁 market/
│   │   │   ├── 📁 assets/
│   │   │   │   └── route.ts                   # GET liste assets
│   │   │   ├── 📁 filters/
│   │   │   │   └── route.ts                   # GET filtres disponibles
│   │   │   ├── 📁 history/
│   │   │   │   └── route.ts                   # GET historique prix
│   │   │   └── 📁 price/
│   │   │       └── route.ts                   # GET prix actuel
│   │   │
│   │   ├── 📁 trades/
│   │   │   ├── 📁 buy/
│   │   │   │   └── route.ts                   # POST achat action
│   │   │   ├── 📁 cover/
│   │   │   │   └── route.ts                   # POST couverture short
│   │   │   ├── 📁 sell/
│   │   │   │   └── route.ts                   # POST vente action
│   │   │   └── 📁 short/
│   │   │       └── route.ts                   # POST vente découvert
│   │   │
│   │   └── 📁 users/
│   │       └── 📁 create/
│   │           └── route.ts                   # POST création utilisateur
│   │
│   ├── favicon.ico                            # Icône site
│   ├── globals.css                            # Styles globaux Tailwind
│   ├── layout.tsx                             # Layout racine application
│   └── page.tsx                               # Page d'accueil
│
├── 📁 components/                             # Composants React réutilisables
│   ├── 📁 auth/
│   │   ├── auth-provider.tsx                  # Provider contexte auth
│   │   ├── login-form.tsx                     # Formulaire connexion
│   │   └── signup-form.tsx                    # Formulaire inscription
│   │
│   ├── 📁 dashboard/
│   │   ├── create-game-card.tsx               # Card création partie
│   │   ├── game-card.tsx                      # Card aperçu partie
│   │   └── welcome-card.tsx                   # Card bienvenue
│   │
│   ├── 📁 game/
│   │   ├── asset-list.tsx                     # Liste assets tradables
│   │   ├── holdings-table.tsx                 # Table positions longues
│   │   ├── next-day-button.tsx                # Bouton jour suivant
│   │   ├── portfolio-summary.tsx              # Résumé portefeuille
│   │   ├── short-positions-table.tsx          # Table positions courtes
│   │   └── transaction-history.tsx            # Historique transactions
│   │
│   ├── 📁 layout/
│   │   ├── footer.tsx                         # Pied de page
│   │   └── header.tsx                         # En-tête navigation
│   │
│   ├── 📁 leaderboard/
│   │   └── leaderboard-table.tsx              # Table classement
│   │
│   └── 📁 ui/
│       ├── badge.tsx                          # Badge statut
│       ├── button.tsx                         # Bouton variants
│       ├── card.tsx                           # Card glassmorphism
│       ├── input.tsx                          # Input validation
│       ├── loading-spinner.tsx                # Spinner chargement
│       ├── modal.tsx                          # Modal backdrop
│       └── toast.tsx                          # Notifications toast
│
├── 📁 docs/                                   # Documentation technique
│   ├── Migration Supabase.txt                 # Guide migration Supabase
│   ├── Structure_Postgresql_supabase.txt      # Schéma PostgreSQL
│   └── assets_listing.txt                     # Liste complète assets
│
├── 📁 hooks/                                  # Custom React Hooks
│   ├── use-auth.ts                            # Hook authentification
│   ├── use-debounce.ts                        # Hook debounce inputs
│   └── use-toast.ts                           # Hook notifications toast
│
├── 📁 lib/                                    # Logique métier serveur
│   ├── 📁 auth/
│   │   ├── middleware.ts                      # Middleware protection routes
│   │   └── session.ts                         # Gestion sessions JWT
│   │
│   ├── 📁 db/
│   │   ├── index.ts                           # Client Drizzle exporté
│   │   └── schema.ts                          # Schéma base données
│   │
│   ├── 📁 game/
│   │   ├── achievements.ts                    # Vérification succès
│   │   ├── calculations.ts                    # Calculs P&L score
│   │   ├── next-day.ts                        # Logique jour suivant
│   │   ├── trade-schemas.ts                   # Schémas validation trades
│   │   └── validations.ts                     # Validations ordres trading
│   │
│   ├── 📁 market/
│   │   ├── assets.ts                          # Liste 105 assets
│   │   ├── db.ts                              # Cache base données
│   │   └── prices.ts                          # Récupération prix MarketStack
│   │
│   ├── 📁 supabase/
│   │   ├── client.ts                          # Client Supabase browser
│   │   ├── middleware.ts                      # Middleware auth Supabase
│   │   └── server.ts                          # Client Supabase serveur
│   │
│   └── 📁 utils/
│       ├── cn.ts                              # Utilitaire classes CSS
│       ├── dates.ts                           # Helpers dates trading
│       ├── errors.ts                          # Gestion erreurs standardisée
│       └── formatting.ts                      # Format prix pourcentages
│
├── 📁 public/                                 # Assets statiques publics
│   ├── courbe_fond_vert.png                   # Image fond courbe
│   ├── file.svg                               # Icône fichier
│   ├── globe.svg                              # Icône globe
│   ├── logo_complet_gris.jpg                  # Logo complet gris
│   ├── next.svg                               # Logo Next.js
│   ├── vercel.svg                             # Logo Vercel
│   └── window.svg                             # Icône fenêtre
│
├── 📁 scripts/                                # Scripts maintenance développement
│   ├── test-db-connection.ts                  # Test connexion DB
│   └── test-trading.ts                        # Test logique trading
│
├── 📁 store/                                  # State management Zustand
│   └── (vide actuellement)                    # Store global futur
│
├── 📁 types/                                  # Types TypeScript
│   ├── api.ts                                 # Types API requêtes
│   ├── database.ts                            # Types base données
│   ├── game.ts                                # Types logique jeu
│   └── market.ts                              # Types MarketStack API
│
├── .env.local                                 # Variables environnement locales
├── .gitignore                                 # Fichiers ignorés Git
├── ARCHITECTURE_COMPLETE.md                   # Architecture V1 outdated
├── ARCHITECTURE_COMPLETE_V2.md                # Architecture V2 actuelle
├── PLAN_REALISATION.md                        # Plan réalisation projet
├── README.md                                  # Documentation principale
├── drizzle.config.ts                          # Configuration Drizzle ORM
├── eslint.config.mjs                          # Configuration ESLint
├── favicon.ico                                # Favicon racine
├── middleware.ts                              # Middleware Next.js global
├── next-env.d.ts                              # Types Next.js auto
├── next.config.ts                             # Configuration Next.js
├── package-lock.json                          # Lock dépendances NPM
├── package.json                               # Dépendances projet
├── postcss.config.mjs                         # Configuration PostCSS
├── tailwind.config.ts                         # Configuration Tailwind CSS
├── test-db.js                                 # Test connexion DB
├── tsconfig.json                              # Configuration TypeScript
└── vercel.json                                # Configuration déploiement Vercel

```

---

## 📊 STATISTIQUES DU PROJET

```
Total fichiers sources : ~110
├── Pages (app/) : 8
├── API Routes : 20
├── Composants React : 22
├── Services (lib/) : 19
├── Hooks : 3
├── Types : 4
├── Scripts : 2
├── Assets publics : 7
└── Config : 12
```

---

## 🎨 CONVENTIONS DE NOMMAGE

### Fichiers et Dossiers
- **Pages** : `page.tsx` (convention Next.js)
- **Layouts** : `layout.tsx` (convention Next.js)
- **API Routes** : `route.ts` (convention Next.js)
- **Composants** : `kebab-case.tsx` (ex: `game-card.tsx`)
- **Services** : `kebab-case.ts` (ex: `market-cache.ts`)
- **Hooks** : `use-*.ts` (ex: `use-auth.ts`)
- **Types** : `*.ts` (ex: `database.ts`)
- **Dossiers** : `kebab-case` ou `(group)` pour route groups

### Code
- **Composants** : `PascalCase` (ex: `GameCard`)
- **Fonctions** : `camelCase` (ex: `getUserSession`)
- **Constantes** : `SCREAMING_SNAKE_CASE` (ex: `MAX_GAMES_PER_USER`)
- **Types/Interfaces** : `PascalCase` (ex: `GameData`, `ApiResponse`)
- **Variables** : `camelCase` (ex: `currentUser`, `gameId`)

---

## 🔐 SÉPARATION CLIENT/SERVER

### Server Components (par défaut)
```
✅ app/*/page.tsx (sauf directive 'use client')
✅ app/*/layout.tsx (sauf directive 'use client')
✅ app/api/*/route.ts (toujours serveur)
✅ lib/**/*.ts (tous serveur)
✅ types/**/*.ts (partagés)
```

### Client Components (avec 'use client')
```
✅ components/**/*.tsx (tous client)
✅ hooks/**/*.ts (tous client)
✅ store/**/*.ts (tous client)
```

---

## 📦 STACK TECHNIQUE

### Frontend
- **Framework** : Next.js 14 (App Router)
- **UI** : React 18
- **Styling** : Tailwind CSS
- **State** : Zustand (prévu)
- **Forms** : React Hook Form (prévu)
- **Charts** : Recharts (prévu)

### Backend
- **Runtime** : Node.js
- **API** : Next.js API Routes
- **Database** : PostgreSQL (Supabase)
- **ORM** : Drizzle
- **Auth** : Supabase Auth
- **External API** : MarketStack

### DevOps
- **Hosting** : Vercel
- **Database** : Supabase
- **CI/CD** : Vercel Git Integration
- **Monitoring** : Vercel Analytics

---

## 🗄️ SCHÉMA BASE DE DONNÉES

### Tables Principales
1. **users** - Utilisateurs application
2. **games** - Parties de jeu
3. **holdings** - Positions longues
4. **short_positions** - Positions courtes
5. **transactions** - Historique transactions
6. **market_data_cache** - Cache prix MarketStack
7. **leaderboard** - Classement global
8. **achievements** - Succès déblocables

---

## 🔄 FLUX DE DONNÉES

### Authentification
```
Client → /api/auth/login → Supabase Auth → Session JWT → Cookie
```

### Trading
```
Client → /api/trades/buy → Validations → DB Update → Response
```

### Market Data
```
Client → /api/market/price → Cache Check → MarketStack API → Cache Store → Response
```

### Game Progression
```
Client → /api/games/next-day → Calculations → DB Update → Achievements Check → Response
```

---

## 🎯 PATTERNS CRITIQUES

### API Route Pattern
```typescript
export async function POST(req: Request) {
  try {
    // 1. Authentification
    const userId = await getUserId(req);
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    
    // 2. Validation
    const body = await req.json();
    // ... validate input
    
    // 3. Business Logic
    const result = await someService();
    
    // 4. Response
    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('[API Error]', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Client Component Pattern
```typescript
'use client';

import { useState } from 'react';

export function MyComponent() {
  const [loading, setLoading] = useState(false);
  
  async function handleAction() {
    setLoading(true);
    try {
      const res = await fetch('/api/endpoint', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error);
      
      // Success handling
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  }
  
  return <button onClick={handleAction} disabled={loading}>Action</button>;
}
```

---

## 🔥 RÈGLES DE DÉVELOPPEMENT

### Obligatoire
1. ✅ **JAMAIS** de type `any` en TypeScript
2. ✅ **TOUJOURS** try/catch dans les API routes
3. ✅ **TOUJOURS** vérifier l'authentification avant opérations sensibles
4. ✅ **TOUJOURS** vérifier le cache avant appel MarketStack
5. ✅ **TOUJOURS** afficher loading states sur actions async
6. ✅ **TOUJOURS** valider côté serveur (ne jamais faire confiance au client)
7. ✅ **TOUJOURS** gérer les erreurs avec messages utilisateur clairs

### Recommandé
- 📝 Commenter la logique complexe
- 🧪 Tester les calculs critiques (P&L, scores)
- 📊 Logger les erreurs importantes
- 🎨 Suivre les conventions de nommage
- 🔒 Utiliser HTTPS en production
- 🚀 Optimiser les requêtes DB (indexes, batch)

---

## 📝 NOTES IMPORTANTES

### Cache MarketStack
- **Limite** : 100 requêtes/mois (plan gratuit)
- **Stratégie** : Cache agressif en DB
- **Durée** : Données historiques = permanent, données récentes = 24h

### Dates de Trading
- **Jours ouvrés** : Lundi-Vendredi uniquement
- **Exclusions** : Week-ends et jours fériés US
- **Timezone** : UTC pour cohérence

### Calculs Financiers
- **Précision** : 2 décimales pour prix, 4 pour pourcentages
- **Devise** : USD uniquement
- **Arrondi** : Toujours arrondir vers le bas pour achats

---

**Fin du document** - Version 2.0 - Février 2026
