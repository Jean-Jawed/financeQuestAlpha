/**
 * FINANCEQUEST - PAGE: SIGNUP
 * /signup
 */

import { SignupForm } from '@/components/auth/signup-form';
import Image from 'next/image';

export default function SignupPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/backgrounds/background.png"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
      
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
        <SignupForm />
      </div>
    </div>
  );
}