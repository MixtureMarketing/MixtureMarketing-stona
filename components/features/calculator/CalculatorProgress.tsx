// MIX-1867: pasek postępu kroków kalkulatora (nowy wygląd). Tekst „Krok N z M” + nazwa kroku,
// pasek z rolą progressbar (czytnik ekranu dostaje numer i nazwę kroku) i — od 640 px — lista
// nazw kroków z zaznaczonym bieżącym (aria-current="step"). Szerokość paska w CSS, bez JS po
// renderze; przejście szerokości tylko przy braku prefers-reduced-motion.
import React from 'react';

interface CalculatorProgressProps {
  /** Indeks bieżącego kroku (od 0). */
  current: number;
  /** Nazwy kroków w kolejności. */
  labels: string[];
}

const CalculatorProgress: React.FC<CalculatorProgressProps> = ({ current, labels }) => {
  const total = labels.length;
  const n = current + 1;
  const pct = total > 0 ? Math.round((n / total) * 100) : 0;
  return (
    <div data-testid="calc-progress" className="space-y-3">
      <p className="text-sm text-white/75">
        <span className="font-extrabold text-white">
          Krok {n} z {total}
        </span>
        <span aria-hidden="true"> · </span>
        <span className="sr-only">: </span>
        {labels[current]}
      </p>
      <div
        role="progressbar"
        aria-label="Postęp wyceny"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={n}
        aria-valuetext={`Krok ${n} z ${total}: ${labels[current]}`}
        className="h-2 overflow-hidden rounded-full bg-white/10"
      >
        <div
          data-testid="calc-progress-fill"
          className="h-full rounded-full bg-primary motion-safe:transition-[width] motion-safe:duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ol className="hidden gap-2 sm:grid" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
        {labels.map((l, i) => (
          <li
            key={`${i}-${l}`}
            aria-current={i === current ? 'step' : undefined}
            className={`truncate text-xs ${
              i === current ? 'font-extrabold text-white' : 'text-white/75'
            }`}
          >
            {l}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default CalculatorProgress;
