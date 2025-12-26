/**
 * FINANCEQUEST - COMPONENT: Header
 * Header avec navigation et menu utilisateur
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

// ==========================================
// COMPONENT
// ==========================================

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/about', label: 'Présentation' },
    { href: '/leaderboard', label: 'Classement' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg" />
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
          </div>
        </div>
      </div>
    </header>
  );
}