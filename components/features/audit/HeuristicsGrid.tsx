import React from 'react';
import SectionHeader from '../../common/SectionHeader';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { VISUAL_AUDIT_CONTENT as CONTENT } from '../../../data/content/services/design/visual-audit';

/**
 * Pełna, prawdziwa dziesiątka heurystyk Nielsena (2026-07-16): wcześniej
 * sekcja obiecywała „10 heurystyk", renderowała 5 kart bez nazw (czytała
 * item.title, dane miały label) i doklejała wymyślone procenty. Numeracja
 * jest tu treścią — heurystyki Nielsena SĄ ponumerowaną listą 1–10.
 */
const HeuristicsGrid: React.FC = () => {
  return (
    <SectionWrapper variant="white" containerClassName="max-w-screen-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHeader
              align="left"
              title={CONTENT.heuristics.title}
              description={CONTENT.heuristics.description}
            />
          </div>
        </div>

        <ol className="lg:col-span-7 divide-y divide-gray-100">
          {CONTENT.heuristics.items.map((item, i) => (
            // li bezpośrednio w ol (semantyka listy); AnimateOnScroll wewnątrz
            <li key={item.label}>
              <AnimateOnScroll delay={Math.min(i, 5) * 60}>
                <div className="group flex items-baseline gap-6 py-5">
                  <span
                    className="w-10 shrink-0 font-mono text-sm font-bold text-gray-500 group-hover:text-secondary transition-colors"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-bold text-dark text-lg leading-snug">{item.label}</h3>
                    <p className="text-gray-700 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            </li>
          ))}
        </ol>
      </div>
    </SectionWrapper>
  );
};

export default HeuristicsGrid;
