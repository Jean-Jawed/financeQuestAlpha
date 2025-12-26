/**
 * FINANCEQUEST - PAGE: SIGNUP
 * /signup
 */

import { SignupForm } from '@/components/auth/signup-form';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <SignupForm />
    </div>
  );
}