/**
 * FINANCEQUEST - PROXY (ex-middleware, renommé par Next 16)
 * Rate limiting, langue dans l'adresse (/fr, /en) et protection des pages authentifiées
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';
import { FALLBACK_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from '@/lib/i18n/config';
import { getPathLocale, localizePath, stripLocale } from '@/lib/i18n/paths';

// ==========================================
// CONFIGURATION
// ==========================================

// Routes protégées (nécessitent authentification), chemins sans langue
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
// LANGUE
// ==========================================

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 an

/**
 * Langue d'une adresse qui n'en a pas : dernier choix du joueur (cookie),
 * sinon la première langue connue de l'en-tête Accept-Language, sinon l'anglais
 */
function preferredLocale(req: NextRequest): Locale {
  const fromCookie = req.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const accepted = (req.headers.get('accept-language') ?? '')
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { language: tag.toLowerCase().split('-')[0], q: q ? parseFloat(q.trim().slice(2)) : 1 };
    })
    .filter((entry) => entry.language && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);

  const match = accepted.find((entry) => isLocale(entry.language));
  return match ? (match.language as Locale) : FALLBACK_LOCALE;
}

// ==========================================
// PROXY
// ==========================================

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith('/api/');
  const isStaticAsset = pathname.startsWith('/_next/') || pathname.includes('.');

  const pathLocale = getPathLocale(pathname);
  const pagePath = stripLocale(pathname);
  const isProtectedPage =
    !isApiRoute && PROTECTED_ROUTES.some((route) => pagePath === route || pagePath.startsWith(`${route}/`));

  // 1. Rate Limiting : API (routes coûteuses : trades, next-day, leaderboard…)
  //    et pages protégées. Les pages publiques et les assets statiques sont exclus.
  //    ⚠ Compteur en mémoire : propre à chaque instance serverless. C'est un
  //    garde-fou minimal ; pour une vraie protection, utiliser le rate limiting
  //    du Vercel Firewall (WAF) ou Upstash Ratelimit.
  if ((isApiRoute || isProtectedPage) && !isStaticAsset) {
    const ip = getClientIp(req);

    if (!checkRateLimit(ip)) {
      console.warn(`[Proxy] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // Les routes API vérifient elles-mêmes la session (withAuth) et lisent la
  // langue dans le cookie : rien d'autre à faire ici
  if (isApiRoute || isStaticAsset) {
    return NextResponse.next();
  }

  // 2. Adresse sans langue (/, /dashboard, anciens liens) : rediriger vers la
  //    même page dans la langue préférée
  if (!pathLocale) {
    const url = req.nextUrl.clone();
    url.pathname = localizePath(preferredLocale(req), pathname);
    return NextResponse.redirect(url);
  }

  // 3. L'auth n'est vérifiée ici que pour les pages qui en dépendent :
  //    pages protégées, et login/signup (redirection si déjà connecté)
  const isAuthPage = pagePath === '/login' || pagePath === '/signup';
  let response = NextResponse.next();

  if (isProtectedPage || isAuthPage) {
    // Client Supabase : crée la réponse et y pose les cookies de session rafraîchis
    const { supabase, response: authResponse } = await createMiddlewareClient(req);

    // getClaims vérifie le JWT et rafraîchit la session si nécessaire
    const { data, error } = await supabase.auth.getClaims();
    const isAuthenticated = !error && Boolean(data?.claims?.sub);

    if (isProtectedPage && !isAuthenticated) {
      const loginUrl = new URL(localizePath(pathLocale, '/login'), req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAuthPage && isAuthenticated) {
      return NextResponse.redirect(new URL(localizePath(pathLocale, '/dashboard'), req.url));
    }

    response = authResponse;
  }

  // 4. Mémoriser la langue : prochaines adresses sans langue et messages de l'API
  if (req.cookies.get(LOCALE_COOKIE)?.value !== pathLocale) {
    response.cookies.set(LOCALE_COOKIE, pathLocale, {
      path: '/',
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: 'lax',
    });
  }

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