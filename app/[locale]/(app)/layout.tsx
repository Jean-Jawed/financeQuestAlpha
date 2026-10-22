/**
 * FINANCEQUEST - LAYOUT: App
 * En-tête, pied de page et notifications : pages du jeu, « Le jeu », FAQ et magazine
 */

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ToastContainer } from '@/components/ui/toast';
import { AuthProvider } from '@/components/auth/auth-provider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastContainer />
      </div>
    </AuthProvider>
  );
}