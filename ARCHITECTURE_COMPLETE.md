# 🏗️ FINANCEQUEST - ARCHITECTURE COMPLÈTE

```
financequest/
│
├── 📁 app/                              # Next.js 14 App Router
│   ├── 📁 (auth)/                       # Route group (layout partagé)
│   │   ├── 📁 login/
│   │   │   └── page.tsx                 # Page login
│   │   ├── 📁 signup/
│   │   │   └── page.tsx                 # Page signup
│   │   └── layout.tsx                   # Layout auth (centré, fond)
│   │
│   ├── 📁 (app)/                        # Route group (layout app)
│   │   ├── 📁 dashboard/
│   │   │   └── page.tsx                 # Dashboard principal
│   │   ├── 📁 game/
│   │   │   └── [id]/
│   │   │       └── page.tsx             # Page de jeu
│   │   ├── 📁 leaderboard/
│   │   │   └── page.tsx                 # Classement global
│   │   ├── 📁 admin/
│   │   │   └── monitoring/
│   │   │       └── page.tsx             # Dashboard admin
│   │   └── layout.tsx                   # Layout app (header, nav)
│   │
│   ├── 📁 api/                          # API Routes (Server-side)
│   │   ├── 📁 auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts             # POST /api/auth/login
│   │   │   ├── signup/
│   │   │   │   └── route.ts             # POST /api/auth/signup
│   │   │   ├── logout/
│   │   │   │   └── route.ts             # POST /api/auth/logout
│   │   │   └── session/
│   │   │       └── route.ts             # GET /api/auth/session
│   │   │
│   │   ├── 📁 games/
│   │   │   ├── create/
│   │   │   │   └── route.ts             # POST /api/games/create
│   │   │   ├── list/
│   │   │   │   └── route.ts             # GET /api/games/list
│   │   │   ├── [id]/
│   │   │   │   └── route.ts             # GET /api/games/:id
│   │   │   └── next-day/
│   │   │       └── route.ts             # POST /api/games/next-day
│   │   │
│   │   ├── 📁 trades/
│   │   │   ├── buy/
│   │   │   │   └── route.ts             # POST /api/trades/buy
│   │   │   ├── sell/
│   │   │   │   └── route.ts             # POST /api/trades/sell
│   │   │   ├── short/
│   │   │   │   └── route.ts             # POST /api/trades/short
│   │   │   └── cover/
│   │   │       └── route.ts             # POST /api/trades/cover
│   │   │
│   │   ├── 📁 market/
│   │   │   ├── price/
│   │   │   │   └── route.ts             # GET /api/market/price?symbol=AAPL&date=2024-01-01
│   │   │   ├── history/
│   │   │   │   └── route.ts             # GET /api/market/history?symbol=AAPL&from=...&to=...
│   │   │   └── assets/
│   │   │       └── route.ts             # GET /api/market/assets (liste 105 assets)
│   │   │
│   │   ├── 📁 leaderboard/
│   │   │   └── route.ts                 # GET /api/leaderboard?period=all_time|monthly|weekly
│   │   │
│   │   ├── 📁 achievements/
│   │   │   ├── list/
│   │   │   │   └── route.ts             # GET /api/achievements/list
│   │   │   └── user/
│   │   │       └── route.ts             # GET /api/achievements/user?game_id=xxx
│   │   │
│   │   ├── 📁 admin/
│   │   │   └── monitoring/
│   │   │       └── route.ts             # GET /api/admin/monitoring (DB usage, etc.)
│   │   │
│   │   └── 📁 cron/
│   │       ├── cleanup-games/
│   │       │   └── route.ts             # GET /api/cron/cleanup-games (hebdo)
│   │       └── update-leaderboard/
│   │           └── route.ts             # GET /api/cron/update-leaderboard (quotidien)
│   │
│   ├── page.tsx                         # Homepage (/)
│   ├── layout.tsx                       # Root layout
│   ├── globals.css                      # Styles globaux Tailwind
│   └── favicon.ico
│
├── 📁 components/                       # Composants React (Client Components)
│   ├── 📁 ui/                           # Composants UI réutilisables
│   │   ├── button.tsx                   # Button avec variants
│   │   ├── card.tsx                     # Card avec glassmorphism
│   │   ├── input.tsx                    # Input avec validation
│   │   ├── modal.tsx                    # Modal avec backdrop
│   │   ├── calendar.tsx                 # Calendrier élégant
│   │   ├── chart.tsx                    # Chart wrapper (Recharts)
│   │   ├── loading-spinner.tsx          # Spinner animé
│   │   ├── toast.tsx                    # Toast notifications
│   │   ├── badge.tsx                    # Badge (status, performance)
│   │   ├── table.tsx                    # Table responsive
│   │   └── tabs.tsx                     # Tabs pour catégories
│   │
│   ├── 📁 auth/
│   │   ├── login-form.tsx               # Formulaire login
│   │   ├── signup-form.tsx              # Formulaire signup
│   │   └── auth-provider.tsx            # Context auth
│   │
│   ├── 📁 dashboard/
│   │   ├── welcome-card.tsx             # Card bienvenue
│   │   ├── create-game-card.tsx         # Card création game
│   │   ├── game-card.tsx                # Card game (preview)
│   │   └── stats-overview.tsx           # Stats globales user
│   │
│   ├── 📁 game/
│   │   ├── portfolio-summary.tsx        # Résumé finances
│   │   ├── holdings-table.tsx           # Table positions long
│   │   ├── short-positions-table.tsx    # Table positions short
│   │   ├── asset-list.tsx               # Liste assets tradables
│   │   ├── asset-chart-modal.tsx        # Modal graphique + trading
│   │   ├── transaction-history.tsx      # Historique transactions
│   │   ├── timeline.tsx                 # Timeline visuelle dates
│   │   └── next-day-button.tsx          # Bouton jour suivant
│   │
│   ├── 📁 leaderboard/
│   │   ├── leaderboard-table.tsx        # Table classement
│   │   └── period-selector.tsx          # Sélecteur période
│   │
│   └── 📁 layout/
│       ├── header.tsx                   # Header avec nav
│       ├── footer.tsx                   # Footer
│       └── sidebar.tsx                  # Sidebar (optionnel)
│
├── 📁 lib/                              # Logique métier (Server-side)
│   ├── 📁 db/
│   │   ├── schema.ts                    # Schéma Drizzle (8 tables)
│   │   ├── index.ts                     # Client Drizzle exporté
│   │   └── seed.ts                      # Script seed achievements
│   │
│   ├── 📁 supabase/
│   │   ├── client.ts                    # Client Supabase (browser)
│   │   ├── server.ts                    # Client Supabase (server)
│   │   └── middleware.ts                # Middleware auth Supabase
│   │
│   ├── 📁 market/
│   │   ├── marketstack.ts               # Wrapper MarketStack API
│   │   ├── cache.ts                     # Logique cache DB ultra-strict
│   │   ├── prefetch.ts                  # Pre-fetch batch création game
│   │   ├── assets.ts                    # Liste 105 assets + métadata
│   │   └── rate-limiter.ts              # Rate limiter MarketStack (optionnel)
│   │
│   ├── 📁 game/
│   │   ├── calculations.ts              # Calculs portfolio, P&L, score
│   │   ├── validations.ts               # Validations ordres (buy/sell/short/cover)
│   │   ├── next-day.ts                  # Logique avancement jour
│   │   └── achievements.ts              # Vérification achievements
│   │
│   ├── 📁 auth/
│   │   ├── session.ts                   # Gestion sessions JWT
│   │   └── middleware.ts                # Protection routes
│   │
│   └── 📁 utils/
│       ├── dates.ts                     # Helpers dates (skip weekends)
│       ├── formatting.ts                # Format prix, pourcentages
│       └── errors.ts                    # Gestion erreurs standardisée
│
├── 📁 hooks/                            # Custom React Hooks (Client)
│   ├── use-auth.ts                      # Hook auth (user, login, logout)
│   ├── use-game.ts                      # Hook game data
│   ├── use-market-data.ts               # Hook fetch market data
│   ├── use-toast.ts                     # Hook toast notifications
│   └── use-debounce.ts                  # Hook debounce inputs
│
├── 📁 store/                            # State management (Zustand - Client)
│   ├── auth-store.ts                    # Store auth global
│   ├── game-store.ts                    # Store game actuel
│   └── ui-store.ts                      # Store UI (modals, toasts)
│
├── 📁 types/                            # Types TypeScript
│   ├── database.ts                      # Types générés depuis schema
│   ├── api.ts                           # Types API requests/responses
│   ├── game.ts                          # Types game logic
│   └── market.ts                        # Types MarketStack
│
├── 📁 public/                           # Assets statiques
│   ├── logo.png
│   ├── hero-bg.jpg
│   ├── dashboard-bg.jpg
│   └── icons/
│       ├── achievement-*.svg
│       └── asset-type-*.svg
│
├── 📁 scripts/                          # Scripts maintenance
│   ├── seed-achievements.ts             # Peupler achievements
│   └── test-db-connection.ts            # Test connexion DB
│
├── .env.local                           # Variables d'environnement (JAMAIS commit)
├── .env.example                         # Template .env
├── .gitignore
├── drizzle.config.ts                    # Config Drizzle
├── middleware.ts                        # Middleware Next.js (rate limiting)
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json                          # Config Vercel (cron jobs)
```

---

## 📊 STATISTIQUES

```
Total fichiers : ~120
├── Pages (app/) : 10
├── API Routes : 25
├── Composants UI : 30
├── Lib/Services : 20
├── Hooks : 5
├── Store : 3
├── Types : 4
└── Config/Scripts : 10
```

---

## 🎨 CONVENTIONS DE NOMMAGE

### Fichiers
- **Pages** : `page.tsx` (Next.js convention)
- **Layouts** : `layout.tsx`
- **API Routes** : `route.ts`
- **Composants** : `kebab-case.tsx` (ex: `game-card.tsx`)
- **Services** : `kebab-case.ts` (ex: `market-cache.ts`)
- **Hooks** : `use-*.ts` (ex: `use-auth.ts`)
- **Types** : `*.ts` (ex: `database.ts`)

### Code
- **Composants** : `PascalCase` (ex: `GameCard`)
- **Fonctions** : `camelCase` (ex: `getUserSession`)
- **Constantes** : `SCREAMING_SNAKE_CASE` (ex: `MAX_GAMES_PER_USER`)
- **Types** : `PascalCase` (ex: `GameData`)
- **Interfaces** : `PascalCase` avec préfixe `I` si ambiguïté (ex: `IApiResponse`)

---

## 🔐 SÉPARATION CLIENT/SERVER

### Server Components (par défaut)
```
✅ app/*/page.tsx (sauf si 'use client')
✅ app/*/layout.tsx
✅ app/api/*/route.ts
✅ lib/**/*.ts (tous)
```

### Client Components (avec 'use client')
```
✅ components/**/*.tsx (tous)
✅ hooks/**/*.ts (tous)
✅ store/**/*.ts (tous)
```

---

## 📦 ORDRE DES IMPORTS (Standard)

```typescript
// 1. React/Next.js
import { useState } from 'react';
import { redirect } from 'next/navigation';

// 2. Packages externes
import { createClient } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';

// 3. Services/Lib internes
import { db } from '@/lib/db';
import { getPrice } from '@/lib/market/cache';

// 4. Composants internes
import { Button } from '@/components/ui/button';
import { GameCard } from '@/components/dashboard/game-card';

// 5. Types
import type { Game } from '@/types/game';

// 6. Assets
import logo from '@/public/logo.png';
```

---

## 🎯 PATTERNS CRITIQUES

### API Routes (Server)
```typescript
export async function POST(req: Request) {
  try {
    // 1. Auth
    const userId = await getUserId(req);
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    
    // 2. Validation
    const body = await req.json();
    // ... validate
    
    // 3. Business logic
    const result = await someService();
    
    // 4. Response
    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('[API Error]', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Client Components
```typescript
'use client';

import { useState } from 'react';

export function MyComponent() {
  const [loading, setLoading] = useState(false);
  
  async function handleAction() {
    setLoading(true);
    try {
      const res = await fetch('/api/endpoint', { method: 'POST', body: ... });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      // Success
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

## 🔥 POINTS D'ATTENTION

1. **JAMAIS** de `any` types
2. **TOUJOURS** try/catch dans API routes
3. **TOUJOURS** vérifier auth avant opérations sensibles
4. **TOUJOURS** check cache avant appel MarketStack
5. **TOUJOURS** loading states sur actions async
6. **TOUJOURS** validation côté serveur (ne jamais faire confiance au client)

---

