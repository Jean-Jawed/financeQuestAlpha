'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  href: string;
  label: string;
}

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export function MobileNav({ isOpen, onClose, navItems }: MobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-lg md:hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl shadow-black/50 border-b border-slate-800 pb-4">
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Image 
            src="/logo_small.png" 
            alt="FinanceQuest Logo" 
            width={32} 
            height={32} 
            className="rounded-lg object-contain"
          />
          <span className="text-xl font-bold text-white">FinanceQuest</span>
        </div>
        <button
          className="p-2 text-slate-300 hover:text-white"
          onClick={onClose}
          aria-label="Fermer le menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col flex-1 px-4 py-8 space-y-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              'px-4 py-3 text-lg font-medium rounded-lg transition-colors',
              pathname === item.href 
                ? 'bg-slate-800 text-cyan-400' 
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-cyan-400'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
