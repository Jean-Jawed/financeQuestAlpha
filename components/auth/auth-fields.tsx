/**
 * FINANCEQUEST - COMPONENT: champs des formulaires de connexion et d'inscription
 */

'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/client';

const FIELD_CLASS =
  'h-11 w-full rounded border border-line-strong bg-ink px-3 text-paper placeholder:text-paper-faint focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass disabled:cursor-not-allowed disabled:opacity-50';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
}

export function AuthField({ id, label, hint, ...props }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="label mb-2 block">
        {label}
      </label>
      <input id={id} className={FIELD_CLASS} {...props} />
      {hint && <p className="mt-1 text-xs text-paper-dim">{hint}</p>}
    </div>
  );
}

export function PasswordField({ id, label, hint, disabled, ...props }: TextFieldProps) {
  const { m } = useI18n();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="label mb-2 block">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          disabled={disabled}
          className={`${FIELD_CLASS} pr-12`}
          placeholder="••••••••"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-paper-dim transition-colors hover:text-paper disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={visible ? m.auth.hidePassword : m.auth.showPassword}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5" aria-hidden="true">
            {visible ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
            ) : (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </>
            )}
          </svg>
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-paper-dim">{hint}</p>}
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <div className="mb-6 rounded border border-loss/50 border-l-4 border-l-loss bg-loss/10 p-4" role="alert">
      <p className="text-sm text-paper">{message}</p>
    </div>
  );
}

export const SUBMIT_CLASS =
  'h-12 w-full rounded border border-brass-bright/60 bg-brass font-label text-base font-semibold uppercase tracking-[0.14em] text-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_2px_0_#8E7034] transition-colors hover:bg-brass-bright active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50';
