/**
 * FINANCEQUEST - MIDDLEWARE
 * Rate limiting + Protection des routes authentifiées
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

// ==========================================
// CONFIGURATION
// ==========================================

// Routes protégées (nécessitent authentification)
const PROTECTED_ROUTES = ['/dashboard', '/game', '/admin'];

// ==========================================
// RATE LIMITING (Simple in-memory)
// ==========================================

// Map IP -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 100; // Requêtes max par fenêtre (augmenté de 30 à 100)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_ENTRIES = 10_000; // Au-delà, purge des fenêtres expirées

/**
 * IP du client : x-real-ip (posé par Vercel), sinon la première IP
 * de x-forwarded-for (les suivantes sont celles des proxies)
 */
function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  return '127.0.0.1';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Éviter que la Map grossisse indéfiniment
  if (rateLimitMap.size > RATE_LIMIT_MAX_ENTRIES) {
    for (const [key, value] of rateLimitMap) {
      if (now > value.resetTime) rateLimitMap.delete(key);
    }
  }

  const record = rateLimitMap.get(ip);

  // Si pas d'entrée ou fenêtre expirée, reset
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  // Si limite atteinte
  if (record.count >= RATE_LIMIT) {
    return false;
  }

  // Incrémenter
  record.count++;
  return true;
}

// ==========================================
// MIDDLEWARE
// ==========================================

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Rate Limiting : API (routes coûteuses : trades, next-day, leaderboard…)
  //    et pages protégées. Les pages publiques et les assets statiques sont exclus.
  //    ⚠ Compteur en mémoire : propre à chaque instance serverless. C'est un
  //    garde-fou minimal ; pour une vraie protection, utiliser le rate limiting
  //    du Vercel Firewall (WAF) ou Upstash Ratelimit.
  const isApiRoute = pathname.startsWith('/api/');
  const isProtectedPage = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isStaticAsset = pathname.startsWith('/_next/') || pathname.includes('.');

  if ((isApiRoute || isProtectedPage) && !isStaticAsset) {
    const ip = getClientIp(req);

    if (!checkRateLimit(ip)) {
      console.warn(`[Middleware] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // 2. Initialiser le client Supabase middleware
  // Cela crée une réponse initiale et configure les cookies dessus
  const { supabase, response } = await createMiddlewareClient(req);

  // 3. Vérifier authentification
  // Note: getUser rafraîchit la session si nécessaire et met à jour les cookies sur 'response'
  const { data: { user }, error } = await supabase.auth.getUser();

  // 4. Gestion des routes protégées
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Si non authentifié, rediriger vers login
    if (error || !user) {
      console.log('[Middleware] Not authenticated, redirecting to login');
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      // IMPORTANT: On ne peut pas retourner 'response' ici car c'est une 200/Next, on doit retourner une Redirect
      // Mais on perdrait les cookies de rafraîchissement potentiels (rare cas edge).
      // Dans le cas d'une redirection login, c'est acceptable.
      return NextResponse.redirect(loginUrl);
    }
    console.log('[Middleware] Authenticated, allowing access');
  }

  // 5. Redirection Login -> Dashboard si déjà connecté
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Retourner la réponse modifiée (avec les cookies mis à jour)
  return response;
}

// ==========================================
// CONFIG
// ==========================================

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf:
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation images)
     * - favicon.ico
     * - fichiers publics (*.png, *.jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};