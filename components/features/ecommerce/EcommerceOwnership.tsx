import React from 'react';
import { ShieldCheck, TriangleAlert } from 'lucide-react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { ECOMMERCE_CONTENT as CONTENT } from '../../../data/content';

/**
 * Centralny argument strony: „dwa sklepy po roku" — wynajem (SaaS) kontra
 * własność (open source). Rysunek lustrzany wokół wspólnej osi etykiet:
 * ta sama pozycja rachunku po obu stronach, więc różnicę widać BEZ czytania
 * pełnych zdań (wizual jest argumentem, wzorzec sekcji AIDA). Strona wynajmu
 * celowo przygaszona — to, co tracisz, nie świeci.
 */
const EcommerceOwnership: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  return (
    <section ref={sectionRef} className="relative bg-white py-20 md:py-28">
      <Container>
        <div
          className="max-w-3xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            {CONTENT.ownership.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">
            {CONTENT.ownership.description}
          </p>
        </div>

        <div
          className="mt-12 overflow-hidden rounded-3xl border border-gray-200"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 48px), 0)' }}
        >
          {/* Nagłówki stron lustra */}
          <div className="grid grid-cols-2 border-b border-gray-200 lg:grid-cols-[1fr_16rem_1fr]">
            <p className="bg-gray-50 px-5 py-4 text-sm font-bold text-gray-600 md:px-8 lg:text-right">
              {CONTENT.ownership.saasLabel}
            </p>
            <p className="hidden lg:block" aria-hidden="true" />
            <p className="px-5 py-4 text-right text-sm font-bold text-dark md:px-8 lg:text-left">
              {CONTENT.ownership.ownLabel}
            </p>
          </div>

          {/* Wiersze lustra: etykieta na osi (lg) albo nad parą (mobile) */}
          <dl>
            {CONTENT.ownership.rows.map((row) => (
              <div
                key={row.label}
                className="border-b border-gray-100 lg:grid lg:grid-cols-[1fr_16rem_1fr] lg:items-center"
              >
                <dt className="px-5 pt-4 text-sm font-bold text-gray-500 md:px-8 lg:order-2 lg:py-5 lg:text-center">
                  {row.label}
                </dt>
                <dd className="grid grid-cols-2 lg:contents">
                  <span className="bg-gray-50 px-5 py-4 text-[15px] leading-snug text-gray-600 md:px-8 lg:order-1 lg:py-5 lg:text-right">
                    {row.saas}
                  </span>
                  <span className="px-5 py-4 text-right text-[15px] leading-snug font-bold text-dark md:px-8 lg:order-3 lg:text-left">
                    {row.own}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          {/* Pointy: ryzyko wynajmu vs bezpieczeństwo własności */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_16rem_1fr]">
            <p className="flex items-start gap-3 bg-gray-50 px-5 py-5 text-sm leading-relaxed font-bold text-gray-600 md:px-8 lg:order-1 lg:justify-end lg:text-right">
              <TriangleAlert
                size={18}
                className="mt-0.5 shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {CONTENT.ownership.saasRisk}
            </p>
            <span className="hidden lg:block lg:order-2" aria-hidden="true" />
            <p className="flex items-start gap-3 px-5 py-5 text-sm leading-relaxed font-bold text-accent-dark md:px-8 lg:order-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-secondary"
                aria-hidden="true"
              />
              {CONTENT.ownership.ownSafety}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default EcommerceOwnership;
