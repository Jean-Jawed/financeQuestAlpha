/**
 * FINANCEQUEST - PAGE: LOGIN
 * /login
 */

import { LoginForm } from '@/components/auth/login-form';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';

export default async function LoginPage() {
  // Si déjà connecté, rediriger vers dashboard
  const user = await getSessionUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <LoginForm />
    </div>
  );
}
