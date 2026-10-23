/**
 * FINANCEQUEST - LANDING: ScrollScene
 * Scène « épinglée » : une section haute de plusieurs écrans dont le contenu reste à
 * l'écran pendant que l'on fait défiler. L'avancement (0 → 1) est exposé :
 * - en variable CSS --p sur la section, pour les effets purement visuels ;
 * - par useSceneValue, pour les composants qui en tirent un état (sans rendu à chaque image).
 * Mouvement réduit : la scène s'affiche directement dans son état final, sans épinglage.
 */

'use client';

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils/cn';

interface ProgressStore {
  get: () => number;
  subscribe: (listener: () => void) => () => void;
}

const SceneContext = createContext<ProgressStore | null>(null);

function createStore(): ProgressStore & { set: (value: number) => void } {
  let value = 0;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next) => {
      if (next === value) return;
      value = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

interface ScrollSceneProps {
  /** Hauteur de la scène, en hauteurs d'écran (durée du défilement) */
  screens: number;
  className?: string;
  /** Classes de la partie épinglée */
  stageClassName?: string;
  children: React.ReactNode;
  'aria-labelledby'?: string;
}

export function ScrollScene({ screens, className, stageClassName, children, ...rest }: ScrollSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [store] = useState(createStore);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true);
      section.style.setProperty('--p', '1');
      store.set(1);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      const progress = distance > 0 ? Math.min(Math.max(-rect.top / distance, 0), 1) : 1;
      section.style.setProperty('--p', progress.toFixed(4));
      store.set(progress);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // N'écoute le défilement que lorsque la scène est proche de l'écran
    let listening = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !listening) {
          window.addEventListener('scroll', schedule, { passive: true });
          window.addEventListener('resize', schedule);
          listening = true;
          schedule();
        } else if (!entry.isIntersecting && listening) {
          window.removeEventListener('scroll', schedule);
          window.removeEventListener('resize', schedule);
          listening = false;
          update();
        }
      },
      { rootMargin: '50% 0px' }
    );
    observer.observe(section);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [store]);

  return (
    <SceneContext.Provider value={store}>
      <section
        ref={sectionRef}
        {...rest}
        className={cn('relative', className)}
        style={{ height: reduced ? 'auto' : `${screens * 100}svh`, ['--p' as string]: 0 }}
      >
        <div className={cn('top-0 h-[100svh] overflow-hidden', !reduced && 'sticky', stageClassName)}>{children}</div>
      </section>
    </SceneContext.Provider>
  );
}

/**
 * Valeur tirée de l'avancement de la scène ; le composant ne se rend que lorsqu'elle change.
 * `select` doit renvoyer une valeur simple (nombre, chaîne, booléen).
 */
export function useSceneValue<T extends string | number | boolean>(select: (progress: number) => T, initial: T): T {
  const store = useContext(SceneContext);
  return useSyncExternalStore(
    store?.subscribe ?? (() => () => {}),
    () => (store ? select(store.get()) : initial),
    () => initial
  );
}
