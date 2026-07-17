import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { CUSTOM_WEB_APP_CONTENT as CONTENT } from '../../../data/content';

/**
 * Stack jako tabliczka (gramatyka huba i /ecommerce/) zamiast czterech kart
 * z eyebrow „Technology Stack v2.5", uppercase-displayem i dublem „UFAMY.".
 * Wyłącznie zakres potwierdzony przez właściciela (bez Go i AWS); linki do
 * przewodników w bazie wiedzy zostają per wiersz.
 */
const WebAppTechStack: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  return (
    <section ref={sectionRef} className="relative bg-white py-20 md:py-28">
      <Container>
        <div
          className="max-w-3xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            {CONTENT.techStack.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">
            {CONTENT.techStack.description}
          </p>
        </div>

        <div
          className="mt-12 rounded-3xl border border-gray-200 bg-white shadow-sm"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 48px), 0)' }}
        >
          <dl className="divide-y divide-gray-100 px-6 md:px-9">
            {CONTENT.techStack.groups.map((g) => (
              <div
                key={g.label}
                className="flex flex-col gap-2 py-5 md:grid md:grid-cols-[7rem_minmax(0,1fr)_auto] md:items-baseline md:gap-8"
              >
                <dt className="shrink-0 text-sm font-bold text-gray-500">{g.label}</dt>
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
                <dd>
                  <Link
                    to={g.link}
                    className="group inline-flex items-center gap-1.5 text-sm font-bold text-accent-dark underline-offset-4 hover:underline"
                  >
                    Przewodnik
                    <ArrowRight
                      size={14}
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
};

export default WebAppTechStack;
