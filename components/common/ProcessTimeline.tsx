import React from 'react';

/**
 * K1 „Oś procesu” (MIX-1317, prototyp ~/kod/karta-bieg-p7/proto1317/k1.html, wybór Jakuba 21.11).
 * Kroki procesu na osi, którą rysuje przewijanie. Sam CSS (`animation-timeline: view()`,
 * style `.mm-k1*` w index.css), JS 0. Telefon: oś pionowa jak w prototypie. Komputer
 * (≥ 1024 px, a przy 5+ krokach ≥ 1280 px): kroki w jednym rzędzie na całą szerokość
 * kontenera, oś pozioma nad nimi (bez pustej prawej strony).
 * Stan spoczynkowy = pełna widoczność: bez wsparcia `animation-timeline` (Firefox, starsze
 * Safari), przy „ogranicz ruch” i w prerenderze kroki są w pełni widoczne.
 * Za przełącznikiem VITE_MM_PROCESS_TIMELINE (config/flags.ts).
 */
export interface ProcessTimelineItem {
  kicker?: string;
  title: string;
  desc: string;
}

interface ProcessTimelineProps {
  items: ProcessTimelineItem[];
  className?: string;
}

/** Od tylu kroków rząd na komputerze dopiero od 1280 px (węższe kolumny poniżej są za ciasne). */
export const K1_LONG_FROM = 5;

const ProcessTimeline: React.FC<ProcessTimelineProps> = ({ items, className = '' }) => {
  const n = items.length;
  const style = { '--k1-n': n } as React.CSSProperties;
  return (
    <div
      className={`mm-k1${n >= K1_LONG_FROM ? ' mm-k1--dlugi' : ''} ${className}`.trim()}
      style={style}
      data-k1=""
    >
      <span className="mm-k1-linia" aria-hidden="true" />
      <ol className="mm-k1-kroki">
        {items.map((item, i) => (
          <li key={item.title} className="mm-k1-krok">
            <span className="mm-k1-nr" aria-hidden="true">
              {i + 1}
            </span>
            <div className="mm-k1-tresc">
              {item.kicker && (
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  {item.kicker}
                </p>
              )}
              <h3 className="mt-1 text-lg font-extrabold tracking-tight text-balance text-dark">
                {item.title}
              </h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-gray-700">{item.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ProcessTimeline;
