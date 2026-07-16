import React from 'react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { CUSTOM_WEB_APP_CONTENT as CONTENT } from '../../../data/content';

/**
 * „Jak zaczynamy" — proces przedsprzedażowy ze słów właściciela: darmowa
 * rozmowa → (przy złożonych projektach) płatny warsztat wymagań u klienta →
 * wycena właściwa i płatność etapami. To REALNA sekwencja, więc numery są
 * zasłużone (nie scaffolding) — niosą kolejność, w jakiej klient wydaje
 * (albo nie wydaje) pieniądze.
 */
const CustomAppStart: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  return (
    <section ref={sectionRef} className="relative bg-light-gray py-20 md:py-28">
      <Container>
        <div
          className="max-w-3xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            {CONTENT.start.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">{CONTENT.start.description}</p>
        </div>

        <ol
          className="mt-12 divide-y divide-gray-100 rounded-3xl border border-gray-200 bg-white shadow-sm"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 48px), 0)' }}
        >
          {CONTENT.start.steps.map((step, i) => (
            <li key={step.title} className="flex gap-6 px-6 py-8 md:gap-10 md:px-10">
              <span
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-3xl leading-none font-extrabold tracking-tight text-primary/80 tabular-nums md:text-4xl"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight text-balance text-dark md:text-xl">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-gray-700">
                  {step.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
};

export default CustomAppStart;
