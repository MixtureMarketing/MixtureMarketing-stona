import React from 'react';
import { BarChart3, Repeat2, Split, LucideIcon } from 'lucide-react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { MARKETING_CONTENT as CONTENT } from '../../../data/content';

/**
 * Synergia kanałów jako LINIA PLOTERA (kierunek warsztat+wyspy): jedna
 * ciągła kreska rysuje się wzdłuż wierszy wraz ze scrollem (--p,
 * dwukierunkowo) i „zapala" kolejne połączenia — scroll pokazuje, że kanały
 * są jednym obwodem. Zastępuje wieczną orbitę „DATA HUB" (spin 20 s bez
 * pauzy — WCAG 2.2.2, ruch bez zadania; krytyka 2026-07-16).
 * Spoczynek/prerender/reduced: var(--p,1) → linia narysowana w całości.
 */
const SYNERGY_ICONS: LucideIcon[] = [Repeat2, Split, BarChart3];

const MarketingSynergy: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.8);
  const n = CONTENT.synergy.items.length;
  return (
    <section ref={sectionRef} className="relative bg-white py-20 md:py-28">
      <Container>
        <div
          className="max-w-3xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            {CONTENT.synergy.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">
            {CONTENT.synergy.description}
          </p>
        </div>

        <div className="relative mt-12 max-w-3xl">
          {/* Linia plotera: pionowa kreska rysowana z --p wzdłuż wierszy. */}
          <svg
            className="absolute top-2 bottom-2 left-[21px] w-[2px]"
            aria-hidden="true"
            preserveAspectRatio="none"
            viewBox="0 0 2 100"
          >
            <path
              d="M1 0 L1 100"
              pathLength={1}
              stroke="var(--color-secondary)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="1"
              style={{ strokeDashoffset: 'calc(1 - var(--p, 1))' }}
            />
          </svg>

          <ol className="space-y-10">
            {CONTENT.synergy.items.map((item, i) => {
              const Icon = SYNERGY_ICONS[i] ?? Repeat2;
              // Wiersz „zapala się", gdy linia do niego dojedzie: okno --p
              // dzielone po równo między wiersze; CSS przycina opacity do [0,1].
              const start = i / n;
              return (
                <li
                  key={item.title}
                  className="relative flex items-start gap-6"
                  style={{ opacity: `calc((var(--p, 1) - ${start.toFixed(2)}) / 0.2)` }}
                >
                  <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-secondary bg-white text-secondary">
                    <Icon size={19} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold tracking-tight text-dark">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-gray-700">{item.desc}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
};

export default MarketingSynergy;
