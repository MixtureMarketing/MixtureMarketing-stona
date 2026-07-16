import React from 'react';
import { CalendarClock, Rocket, Warehouse, Workflow, LucideIcon } from 'lucide-react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { CUSTOM_WEB_APP_CONTENT as CONTENT } from '../../../data/content';

/**
 * Cztery typy systemów — wiersze z rozróżnialnymi ikonami zamiast czterech
 * identycznych glass-kart z border-t-4 i uppercase-chipami (przebudowa
 * 2026-07-16; treść merytoryczna bez zmian: Subiekt/Comarch, SMS, MVP).
 */
const ICONS: LucideIcon[] = [Warehouse, CalendarClock, Workflow, Rocket];

const WebAppUseCases: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  return (
    <section ref={sectionRef} className="relative bg-white py-20 md:py-28">
      <Container>
        <div
          className="max-w-3xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            {CONTENT.useCases.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">
            {CONTENT.useCases.description}
          </p>
        </div>

        <ul
          className="mt-12 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 48px), 0)' }}
        >
          {CONTENT.useCases.items.map((item, i) => {
            const Icon = ICONS[i] ?? Workflow;
            return (
              <li key={item.title} className="flex items-start gap-4">
                <Icon size={22} className="mt-1 shrink-0 text-secondary" aria-hidden="true" />
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight text-dark md:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-gray-700">{item.desc}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
};

export default WebAppUseCases;
