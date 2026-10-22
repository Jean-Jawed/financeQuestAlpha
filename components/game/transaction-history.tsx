/**
 * FINANCEQUEST - COMPONENT: TransactionHistory
 * Le livre d'ordres : dernières opérations, présentées comme un registre
 */

'use client';

import { useI18n } from '@/lib/i18n/client';
import { cn } from '@/lib/utils/cn';
import type { Transaction } from '@/types/database';

// ==========================================
// TYPES
// ==========================================

interface TransactionHistoryProps {
  transactions: Transaction[];
  /** Devise de la partie */
  currency: string;
}

/** Libellés dans le dictionnaire (ui.game.history) ; couleur par sens */
const TYPE_TONES = {
  buy: 'text-gain border-gain/40',
  sell: 'text-brass border-brass/40',
  short: 'text-loss border-loss/40',
  cover: 'text-brass border-brass/40',
} as const;

// ==========================================
// COMPONENT
// ==========================================

export function TransactionHistory({ transactions, currency }: TransactionHistoryProps) {
  const { m, f, fmt } = useI18n();
  const t = m.game.history;

  return (
    <section className="panel" aria-labelledby="history-title">
      <header className="flex items-end justify-between border-b border-line px-5 py-4">
        <div>
          <p className="label text-brass">{t.label}</p>
          <h2 id="history-title" className="font-display text-2xl font-semibold text-paper">
            {t.title}
          </h2>
        </div>
        {transactions.length > 0 && <p className="label">{fmt(t.latest, { count: transactions.length })}</p>}
      </header>

      {transactions.length === 0 ? (
        <p className="px-5 py-10 text-center text-paper-dim">{t.empty}</p>
      ) : (
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-ink-2">
              <tr className="label text-left text-[10px]">
                <th scope="col" className="px-5 py-2 font-semibold">{t.date}</th>
                <th scope="col" className="px-2 py-2 font-semibold">{t.side}</th>
                <th scope="col" className="px-2 py-2 font-semibold">{t.symbol}</th>
                <th scope="col" className="hidden px-2 py-2 text-right font-semibold sm:table-cell">{t.qtyPrice}</th>
                <th scope="col" className="px-5 py-2 text-right font-semibold">{t.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {transactions.map((transaction) => {
                const tone = TYPE_TONES[transaction.type];
                const showNative =
                  transaction.assetCurrency && transaction.assetPrice && transaction.assetCurrency !== currency;
                return (
                  <tr key={transaction.id} className="hover:bg-ink-3">
                    <td className="num whitespace-nowrap px-5 py-2.5 text-paper-dim">
                      {f.dateShort(transaction.transactionDate)}
                    </td>
                    <td className="px-2 py-2.5">
                      <span
                        className={cn(
                          'inline-block rounded-sm border px-1.5 font-label text-[11px] font-semibold uppercase tracking-[0.1em]',
                          tone
                        )}
                      >
                        {t[transaction.type]}
                      </span>
                    </td>
                    <td className="num px-2 py-2.5 font-semibold text-paper">{transaction.symbol}</td>
                    <td className="num hidden px-2 py-2.5 text-right text-paper-dim sm:table-cell">
                      {f.quantity(parseFloat(transaction.quantity))} × {f.currency(parseFloat(transaction.price), currency)}
                      {showNative && (
                        <span className="block text-[11px] text-paper-faint">
                          {fmt(t.quoted, { price: f.currency(parseFloat(transaction.assetPrice!), transaction.assetCurrency!) })}
                        </span>
                      )}
                    </td>
                    <td className="num whitespace-nowrap px-5 py-2.5 text-right text-paper">
                      {f.currency(parseFloat(transaction.total), currency)}
                      {parseFloat(transaction.fee) > 0 && (
                        <span className="block text-[11px] text-paper-faint">
                          {fmt(t.feesIncluded, { fee: f.currency(parseFloat(transaction.fee), currency) })}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
