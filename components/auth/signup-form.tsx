/**
 * FINANCEQUEST - COMPONENT: SignupForm
 * Formulaire d'inscription
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRefreshSession } from '@/hooks/use-auth';
import Link from 'next/link';

// ==========================================
// COMPONENT
// ==========================================

export function SignupForm() {
  const router = useRouter();
  const refreshSession = useRefreshSession();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validation temps réel du mot de passe
  function validatePassword(pwd: string): string[] {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push('Au moins 8 caractères');
    if (!/[A-Z]/.test(pwd)) errors.push('Au moins une majuscule');
    if (!/[a-z]/.test(pwd)) errors.push('Au moins une minuscule');
    if (!/[0-9]/.test(pwd)) errors.push('Au moins un chiffre');
    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setValidationErrors([]);
    setLoading(true);

    // Validation côté client
    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) {
      setValidationErrors(pwdErrors);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setValidationErrors(data.details);
        } else {
          setError(data.error || 'Erreur lors de l\'inscription');
        }
        setLoading(false);
        return;
      }

      // Rafraîchir la session
      await refreshSession();

      // Rediriger vers dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Inscription</h1>
          <p className="text-slate-400">Créez votre compte FinanceQuest</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
            <p className="text-yellow-400 text-sm font-medium mb-2">
              Veuillez corriger les erreurs suivantes :
            </p>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i} className="text-yellow-400 text-sm">
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Nom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Votre nom"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="votre@email.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setValidationErrors(validatePassword(e.target.value));
              }}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="••••••••"
            />
            {password && validationErrors.length === 0 && (
              <p className="mt-2 text-sm text-green-400">✓ Mot de passe valide</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="••••••••"
            />
            {confirmPassword && password === confirmPassword && (
              <p className="mt-2 text-sm text-green-400">✓ Les mots de passe correspondent</p>
            )}
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-2 text-sm text-red-400">✗ Les mots de passe ne correspondent pas</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || validationErrors.length > 0}
            className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Création du compte...' : "S'inscrire"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
