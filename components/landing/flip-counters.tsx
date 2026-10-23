/**
 * FINANCEQUEST - LANDING: FlipCounters
 * Les chiffres du jeu en volets de tableau d'affichage : à leur arrivée à l'écran,
 * chaque chiffre défile de 0 jusqu'à sa valeur, en décalé
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

const STEP_MS = 70;

interface Counter {
  value: string;
  label: string;
}

function Digit({ target, delay, running }: { target: string; delay: number; running: boolean }) {
  const isDigit = /\d/.test(target);
  const [shown, setShown] = useState(isDigit ? '0' : target);

  useEffect(() => {
    if (!running || !isDigit) {
      setShown(target);
      return;
    }
    const end = Number(target);
    let current = 0;
    let timer = window.setTimeout(function tick() {
      setShown(String(current));
      if (current < end) {
        current += 1;
        timer = window.setTimeout(tick, STEP_MS);
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [running, target, delay, isDigit]);

  if (!isDigit) return <span className="px-0.5">{target}</span>;

  return (
    <span
      key={shown}
      className="relative inline-flex w-[1.05ch] animate-flip-in justify-center rounded-sm bg-[#0A1512] [transform-origin:50%_0]"
    >
      {shown}
      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/70" />
    </span>
  );
}

export function FlipCounters({ counters }: { counters: Counter[] }) {
  const ref = useRef<HTMLDListElement>(null);
  const [running, setRunning] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true);
      return;
    }
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRunning(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <dl ref={ref} className="container mx-auto grid grid-cols-2 px-4 md:grid-cols-4">
      {counters.map((counter, index) => (
        <div
          key={counter.label}
          className={cn(
            'px-4 py-10 text-center',
            index > 0 && 'md:border-l md:border-line',
            index % 2 === 1 && 'border-l border-line'
          )}
        >
          <dd className="flex justify-center gap-0.5 font-display text-5xl font-semibold text-brass [perspective:400px]">
            {/* Valeur lisible par tous, volets décoratifs */}
            <span className="sr-only">{counter.value}</span>
            <span aria-hidden="true" className="flex gap-0.5">
              {reduced
                ? counter.value
                : counter.value
                    .split('')
                    .map((char, position) => (
                      <Digit key={position} target={char} delay={index * 180 + position * 120} running={running} />
                    ))}
            </span>
          </dd>
          <dt className="label mt-2">{counter.label}</dt>
        </div>
      ))}
    </dl>
  );
}
