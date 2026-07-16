import React from 'react';
import { EyeOff, Filter, Gauge, LucideIcon } from 'lucide-react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { MARKETING_CONTENT as CONTENT } from '../../../data/content';

/**
 * „Dlaczego Twoje reklamy nie działają?" — wskrzeszona sekcja ekspercka
 * (istniała w treści od początku, nigdy nie była renderowana — krytyka
 * 2026-07-16, P1/10). Dowód kompetencji bez ani jednej liczby: nazywamy
 * błędy, które widzimy na przejmowanych kontach. Jasny arkusz najeżdża
 * sygnaturowym grzbietem na ciemnię dowodową (jak Kompetencje na home).
 * Wiersze z rozróżnialnymi ikonami — nie trzy karty-bliźniaki.
 */
const PAIN_ICONS: LucideIcon[] = [Filter, EyeOff, Gauge];

const MarketingPains: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);
  return (
    <section
      ref={sectionRef}
      className="relative z-10 -mt-10 rounded-t-[2rem] bg-white pt-20 pb-24 md:-mt-16 md:rounded-t-[3rem] md:pt-24"
    >
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:gap-16">
          <div
            className="lg:col-span-5 lg:self-start lg:sticky lg:top-28"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
              {CONTENT.painPoints.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              {CONTENT.painPoints.description}
            </p>
          </div>

          <div className="mt-12 divide-y divide-gray-100 lg:col-span-7 lg:mt-0">
            {CONTENT.painPoints.items.map((item, i) => {
              const Icon = PAIN_ICONS[i] ?? Filter;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-5 py-7 first:pt-0"
                  style={{
                    transform: `translate3d(0, calc((1 - var(--p, 1)) * ${28 + i * 16}px), 0)`,
                  }}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-secondary">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold tracking-tight text-dark">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-gray-700">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default MarketingPains;
