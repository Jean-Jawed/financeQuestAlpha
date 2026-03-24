/**
 * FINANCEQUEST - COMPONENT: Header
 * Header avec navigation et menu utilisateur
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';
import { MobileNav } from './mobile-nav';

// ==========================================
// COMPONENT
// ==========================================

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/about', label: 'Présentation' },
    { href: '/leaderboard', label: 'Classement' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image 
              src="/logo_small.png" 
              alt="FinanceQuest Logo" 
              width={32} 
              height={32} 
              className="rounded-lg object-contain"
            />
            <span className="text-xl font-bold text-white">FinanceQuest</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-cyan-400',
                  pathname === item.href ? 'text-cyan-400' : 'text-slate-300'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="hidden md:block text-sm text-slate-300">
                  {user.name}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Déconnexion
                </Button>
              </>
            )}
            
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      </header>

      {/* Mobile Navigation */}
      <MobileNav 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        navItems={navItems} 
      />
    </>
  );
}