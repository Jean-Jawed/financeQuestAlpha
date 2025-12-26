/**
 * FINANCEQUEST - LAYOUT: App
 * Layout pour les pages authentifiées (dashboard, game, etc.)
 */

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ToastContainer } from '@/components/ui/toast';
import { AuthProvider } from '@/components/auth/auth-provider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastContainer />
      </div>
    </AuthProvider>
  );
}