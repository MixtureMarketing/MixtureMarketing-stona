import React from 'react';
import { Rocket, TreePine } from 'lucide-react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { MARKETING_CONTENT as CONTENT } from '../../../data/content';

/**
 * Dwa modele wzrostu — UCZCIWE lustro (przebudowa 2026-07-16). Poprzednik
 * miał przełącznik z fejkową symulacją („Czas do wyniku 95%", paski
 * z powietrza, font-mono, side-stripe). Teraz: dwie kolumny przy wspólnej
 * osi, każda mówi wprost mechanikę, koszt i trwałość — łącznie z tym, że
 * Sprint kosztuje dopóki płacisz, a Maraton każe czekać. Wjeżdżają
 * przeciwbieżnie na --p (±14 px), spoczynek = pozycja neutralna.
 */
const MarketingModels: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);
  const cols = [
    { icon: Rocket, data: CONTENT.models.sprint, dir: -1 },
    { icon: TreePine, data: CONTENT.models.marathon, dir: 1 },
  ];
  return (
    <section ref={sectionRef} className="relative bg-light-gray py-20 md:py-28">
      <Container>
        <div
          className="max-w-3xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            {CONTENT.models.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">{CONTENT.models.description}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-gray-200">
          {cols.map(({ icon: Icon, data, dir }, ci) => (
            <div
              key={data.title}
              className={ci === 0 ? 'lg:pr-12' : 'lg:pl-12'}
              style={{
                transform: `translate3d(calc((1 - var(--p, 1)) * ${dir * 14}px), 0, 0)`,
              }}
            >
              <h3 className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-dark">
                <Icon size={22} className="shrink-0 text-secondary" aria-hidden="true" />
                {data.title}
              </h3>
              <ul className="mt-5 space-y-4">
                {data.lines.map((line) => (
                  <li key={line} className="text-[15px] leading-relaxed text-gray-700">
                    {line}
                  </li>
                ))}
              </ul>
              <p className="mt-6 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-semibold leading-relaxed text-gray-700">
                {data.note}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default MarketingModels;
