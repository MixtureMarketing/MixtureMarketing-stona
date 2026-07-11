import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

/**
 * Wspolny fundament designu dashboardu audytu (kierunek "dopracowany jasny").
 * Custom ease-out (mocna krzywa Emila Kowalskiego), stagger reveal, count-up
 * liczb, jedna karta-prymityw na hairline'ie. prefers-reduced-motion respektowane.
 */

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const revealParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export const revealChild: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

/** Wspolna klasa karty: bialy plaszczyzna, hairline 1px, ciasne radii, subtelny lift. */
export const cardCls =
  'bg-white border border-gray-200 rounded-2xl transition-[border-color,box-shadow,transform] duration-200 ' +
  'hover:border-gray-300 hover:shadow-[0_10px_30px_-12px_rgba(16,24,40,0.14)] hover:-translate-y-0.5';

/** Reveal-parent, ktory wylacza animacje wejscia przy prefers-reduced-motion. */
export const RevealGroup: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className,
  children,
}) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={revealParent}
      initial={reduce ? false : 'hidden'}
      animate="show"
    >
      {children}
    </motion.div>
  );
};

/** Licznik rosnacy (score, metryki). Instant przy reduced-motion. */
export function useCountUp(target: number, duration = 900): number {
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (reduce) return; // brak animacji — zwracamy target ponizej
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(target * eased)); // setState tylko w callbacku rAF (async)
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduce]);
  return reduce ? target : val;
}

/** Kwadratowy kafel ikony z semantycznym tłem. */
export const IconTile: React.FC<{
  tone: 'green' | 'blue' | 'amber' | 'indigo' | 'rose';
  children: React.ReactNode;
}> = ({ tone, children }) => {
  const tones: Record<string, string> = {
    green: 'bg-[#e7f8ee] text-[#027a34]',
    blue: 'bg-[#eaf4fb] text-dark',
    amber: 'bg-[#fff3e2] text-[#b45309]',
    indigo: 'bg-[#eeeefb] text-secondary',
    rose: 'bg-[#fff1f2] text-[#be123c]',
  };
  return (
    <div className={`w-10 h-10 rounded-[10px] grid place-items-center ${tones[tone]}`}>
      {children}
    </div>
  );
};

/** Sekcyjny marker z hairline'em (zastepuje eyebrow-trope). */
export const SectionHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="text-xs font-bold uppercase tracking-[0.04em] text-gray-400 whitespace-nowrap">
      {children}
    </span>
    <span className="flex-1 h-px bg-gray-100" />
  </div>
);
