import React from 'react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { CUSTOM_WEB_APP_CONTENT as CONTENT } from '../../../data/content';

/**
 * Jakość w procesie — cztery realne kroki drogi każdej zmiany (przegląd kodu →
 * testy → środowisko testowe → wdrożenie). Sekwencja jest prawdziwa, więc
 * indeksy są zasłużone. Bez fejkowego terminala z zapętlonymi logami i emoji
 * (przebudowa 2026-07-16) — proces opowiada treść, nie teatrzyk.
 */
const WebAppQaPipeline: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  return (
    <section ref={sectionRef} className="relative bg-white py-20 md:py-28">
      <Container>
        <div
          className="max-w-3xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            {CONTENT.qa.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">{CONTENT.qa.description}</p>
        </div>

        <ol
          className="mt-12 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 xl:grid-cols-4"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 48px), 0)' }}
        >
          {CONTENT.qa.steps.map((step, i) => (
            <li key={step.step} className="border-t-2 border-gray-100 pt-5">
              <p className="text-sm font-bold text-gray-500 tabular-nums">{i + 1} / 4</p>
              <h3 className="mt-2 text-lg font-extrabold tracking-tight text-dark">{step.step}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-700">{step.desc}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
};

export default WebAppQaPipeline;
