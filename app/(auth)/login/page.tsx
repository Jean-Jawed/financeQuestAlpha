/**
 * FINANCEQUEST - PAGE: LOGIN
 * /login
 */

import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <LoginForm />
    </div>
  );
}