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
const PUBLIC_ROUTES = ['/login', '/signup', '/'];

// ==========================================
// RATE LIMITING (Simple in-memory)
// ==========================================

// Map IP -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 30; // Requêtes max par fenêtre
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

  // 1. Rate Limiting (sur toutes les routes)
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  
  if (!checkRateLimit(ip)) {
    console.warn(`[Middleware] Rate limit exceeded for IP: ${ip}`);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
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
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    // Si non authentifié, rediriger vers login
    if (error || !user) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

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