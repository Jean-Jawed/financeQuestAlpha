/**
 * FINANCEQUEST - COMPONENT: Footer
 * Footer avec copyright
 */

export function Footer() {
  return (
    <footer className="bg-slate-900/50 border-t border-slate-800 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-slate-400 text-sm">
          © 2025 FinanceQuest - Créé par{' '}
          <a
            href="https://javed.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Jawed TAHIR
          </a>
        </p>
      </div>
    </footer>
  );
}