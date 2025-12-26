/**
 * FINANCEQUEST - HOOK: useDebounce
 * Hook pour debouncer les valeurs (optimisation inputs)
 */

'use client';

import { useEffect, useState } from 'react';

/**
 * Debounce une valeur
 * 
 * @param value - Valeur à debouncer
 * @param delay - Délai en ms (default: 500)
 * @returns Valeur debouncée
 * 
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 500);
 *   
 *   useEffect(() => {
 *     // Fetch seulement quand debouncedSearch change
 *     fetchResults(debouncedSearch);
 *   }, [debouncedSearch]);
 *   
 *   return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
