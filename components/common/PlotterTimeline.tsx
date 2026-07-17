import React from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Oś czasu „plotera" — segmenty linii rysują się kolejno między krążkami
 * wraz z przewijaniem (var(--p) sekcji-rodzica; dwukierunkowo). Wersja 2
 * (2026-07-16, zgłoszenie właściciela): poprzednia jedna linia SVG na
 * wysokość całego kontenera wystawała kikutem nad pierwszym i pod ostatnim
 * krążkiem, a jej czubek wisiał w pustce między wierszami. Tu segment jest
 * CZĘŚCIĄ wiersza (rail w kolumnie krążka), więc z konstrukcji zaczyna się
 * i kończy na krążkach. Overflow-hidden na szynie przycina scaleY poza
 * [0,1] — spoczynek/prerender/reduced-motion = linia w całości (var(--p,1)).
 */
export interface PlotterTimelineItem {
  kicker?: string;
  title: string;
  desc: string;
}

interface PlotterTimelineProps {
  items: PlotterTimelineItem[];
  /** Ikony per krok; brak = numeracja 1..n. */
  icons?: LucideIcon[];
  className?: string;
}

const PlotterTimeline: React.FC<PlotterTimelineProps> = ({ items, icons, className = '' }) => {
  const n = items.length;
  return (
    <ol className={className}>
      {items.map((item, i) => {
        const Icon = icons?.[i];
        const isLast = i === n - 1;
        // Okna na wspólnym --p: wiersz i wjeżdża, potem segment do i+1.
        const itemStart = (i / n).toFixed(2);
        const segStart = ((i + 0.45) / n).toFixed(2);
        const segSpan = (0.55 / n).toFixed(3);
        return (
          <li key={item.title} className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-6">
            <div className="flex flex-col items-center">
              <div
                className="z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-secondary bg-white text-secondary"
                style={{ opacity: `calc((var(--p, 1) - ${itemStart}) / 0.18)` }}
              >
                {Icon ? (
                  <Icon size={19} aria-hidden="true" />
                ) : (
                  <span className="text-xs font-black tabular-nums">{i + 1}</span>
                )}
              </div>
              {!isLast && (
                <div
                  className="relative w-[2px] flex-1 overflow-hidden bg-gray-200"
                  aria-hidden="true"
                >
                  <div
                    className="absolute inset-0 origin-top bg-secondary"
                    style={{
                      transform: `scaleY(calc((var(--p, 1) - ${segStart}) / ${segSpan}))`,
                    }}
                  />
                </div>
              )}
            </div>
            <div
              className={isLast ? '' : 'pb-10'}
              style={{ opacity: `calc((var(--p, 1) - ${itemStart}) / 0.18)` }}
            >
              {item.kicker && (
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  {item.kicker}
                </p>
              )}
              <h3 className="mt-1 text-lg font-extrabold tracking-tight text-dark">{item.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-gray-700">{item.desc}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default PlotterTimeline;
