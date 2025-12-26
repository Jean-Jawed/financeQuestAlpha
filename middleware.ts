/**
 * FINANCEQUEST - MIDDLEWARE
 * Rate limiting + Protection des routes authentifiées
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// ==========================================
// CONFIGURATION
// ==========================================

// Routes protégées (nécessitent authentification)
const PROTECTED_ROUTES = ['/dashboard', '/game', '/admin'];

// Routes publiques (accessibles sans auth)
const PUBLIC_ROUTES = ['/login', '/signup', '/', '/about'];

// ==========================================
// RATE LIMITING (Simple in-memory)
// ==========================================

// Map IP -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 100; // Requêtes max par fenêtre (augmenté de 30 à 100)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
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

  // 1. Rate Limiting (SAUF sur routes publiques et API)
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route));
  const isApiRoute = pathname.startsWith('/api/');
  const isStaticAsset = pathname.startsWith('/_next/') || pathname.includes('.');
  
  // Appliquer rate limit UNIQUEMENT sur routes protégées
  if (!isPublicRoute && !isApiRoute && !isStaticAsset) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    
    if (!checkRateLimit(ip)) {
      console.warn(`[Middleware] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // 2. Vérifier si route protégée
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // 3. Vérifier authentification pour routes protégées
  try {
    console.log('[Middleware] Checking auth for:', pathname);
    
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    console.log('[Middleware] Auth result:', { 
      user: user ? user.email : null, 
      error: error ? error.message : null 
    });

    // Si non authentifié, rediriger vers login
    if (error || !user) {
      console.log('[Middleware] Not authenticated, redirecting to login');
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    console.log('[Middleware] Authenticated, allowing access');
    // Authentifié, continuer
    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] Auth check error:', error);
    
    // En cas d'erreur, rediriger vers login par sécurité
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }
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