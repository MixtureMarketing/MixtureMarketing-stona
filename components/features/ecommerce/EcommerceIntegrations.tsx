import React from 'react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { ECOMMERCE_CONTENT as CONTENT } from '../../../data/content';

/**
 * Integracje jako tabliczka znamionowa (spec-sheet), nie orbita: cztery wiersze
 * grup z nazwami systemów — wyłącznie te z FAQ i potwierdzonego zakresu.
 * Zastępuje dawną sekcję „Centrum Dowodzenia" (wirujące etykiety bez pauzy)
 * oraz karty „boosters" (ich treść to lista „a w środku sklepu" na dole).
 */
const EcommerceIntegrations: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  return (
    <section ref={sectionRef} className="relative bg-white py-20 md:py-28">
      <Container>
        <div
          className="max-w-3xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            {CONTENT.integrations.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">
            {CONTENT.integrations.description}
          </p>
        </div>

        <div
          className="mt-12 rounded-3xl border border-gray-200 bg-white shadow-sm"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 48px), 0)' }}
        >
          <dl className="divide-y divide-gray-100 px-6 md:px-9">
            {CONTENT.integrations.groups.map((g) => (
              <div
                key={g.label}
                className="flex flex-col gap-2 py-5 md:flex-row md:items-baseline md:gap-8"
              >
                <dt className="w-28 shrink-0 text-sm font-bold text-gray-500">{g.label}</dt>
                <dd className="flex flex-wrap gap-x-3 gap-y-2">
                  {g.items.map((item, i) => (
                    <React.Fragment key={item}>
                      {i > 0 && (
                        <span className="text-gray-300" aria-hidden="true">
                          ·
                        </span>
                      )}
                      <span className="text-[15px] font-bold text-dark">{item}</span>
                    </React.Fragment>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
          <div className="rounded-b-3xl border-t border-gray-100 bg-light-gray px-6 py-5 md:px-9">
            <p className="text-sm font-bold text-gray-500">{CONTENT.integrations.insideLabel}</p>
            <ul className="mt-2 space-y-1.5">
              {CONTENT.integrations.inside.map((line) => (
                <li key={line} className="text-[15px] leading-relaxed text-gray-700">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default EcommerceIntegrations;
