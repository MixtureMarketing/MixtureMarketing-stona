import React from 'react';
import { Check, Plus } from 'lucide-react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { WEB_DEV_CONTENT } from '../../../data/content';

/**
 * Sekcja „co w cenie, a za co dopłacasz".
 *
 * Redesign: usunięto komplet fikcji — licznik `blockedCount` startujący z 1420
 * i rosnący z `Math.random()` (zmyślona telemetria udająca żywe dane), radar
 * skanujący co 100 ms, symulowany terminal „SECURITY_CENTER" z wpisami
 * „SQL Injection BLOCKED", oraz cztery staty, w tym „Uptime SLA 99.9%" sprzeczne
 * z „99.5%" na tej samej stronie. Przy okazji: `border-l-2` (side-stripe z listy
 * absolutnych zakazów), `backdrop-blur-sm` (The No-Glass Rule) i zduplikowany H2.
 *
 * Sekcja jest JASNA, choć poprzednia była ciemna — The Ciemnia Rule: granat jest
 * oprawą dowodu, a ta sekcja nie niesie dowodu, tylko ofertę. Bez dowodu nie ma
 * powodu być ciemna.
 *
 * Ruch (The Motion Has A Job Rule): pionowa krawędź między „w cenie" a „opcją"
 * rozrasta się z --p. Ta sekcja JEST granicą — więc rysuje ją ruch, a nie dekoracja.
 * Spoczynek = var(--p, 1) → krawędź w pełni widoczna (prerender/reduced-motion).
 */
const WebDevInfrastructure: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);
  const { included, optional } = WEB_DEV_CONTENT.infrastructure;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-light-gray pt-24 pb-16 md:pt-32 md:pb-20"
    >
      <Container className="relative z-10">
        <div
          className="mx-auto max-w-2xl text-center"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            {WEB_DEV_CONTENT.infrastructure.title}{' '}
            <span className="text-accent-dark">{WEB_DEV_CONTENT.infrastructure.titleAccent}</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-700">
            {WEB_DEV_CONTENT.infrastructure.description}
          </p>
        </div>

        <div className="relative mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-10 md:mt-16 md:grid-cols-2 md:gap-16">
          {/* Krawędź — sedno sekcji. Rośnie z --p, w spoczynku pełna. */}
          <div
            className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gray-200 md:block"
            style={{ transform: 'translateX(-50%) scaleY(var(--p, 1))' }}
            aria-hidden="true"
          />

          {[
            { data: included, icon: Check, accent: 'text-success', ring: 'bg-success/10' },
            { data: optional, icon: Plus, accent: 'text-secondary', ring: 'bg-secondary/10' },
          ].map(({ data, icon: Icon, accent, ring }) => (
            <div key={data.label}>
              <p className="mb-6 text-sm font-black tracking-wide text-dark">{data.label}</p>
              <ul className="space-y-6">
                {data.items.map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${ring} ${accent}`}
                      aria-hidden="true"
                    >
                      <Icon size={15} strokeWidth={3} />
                    </span>
                    <div>
                      <h3 className="font-bold text-dark">{item.title}</h3>
                      <p className="mt-1.5 leading-relaxed text-gray-700">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default WebDevInfrastructure;
