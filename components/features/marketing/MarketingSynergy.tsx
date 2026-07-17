import React from 'react';
import { BarChart3, Repeat2, Split, LucideIcon } from 'lucide-react';
import Container from '../../common/Container';
import PlotterTimeline from '../../common/PlotterTimeline';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { MARKETING_CONTENT as CONTENT } from '../../../data/content';

/**
 * Synergia kanałów jako linia plotera (PlotterTimeline — segmenty rysują
 * się między krążkami wraz ze scrollem, dwukierunkowo; wersja 2 po
 * zgłoszeniu właściciela: poprzednia linia SVG wystawała poza krążki).
 * Asymetryczna siatka: nagłówek z lewej (sticky), oś z prawej — cała
 * szerokość sekcji pracuje. Spoczynek = wszystko widoczne (var(--p,1)).
 */
const SYNERGY_ICONS: LucideIcon[] = [Repeat2, Split, BarChart3];

const MarketingSynergy: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.8);
  return (
    <section ref={sectionRef} className="relative bg-white py-20 md:py-28">
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:gap-16">
          <div
            className="lg:col-span-5 lg:self-start lg:sticky lg:top-28"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
              {CONTENT.synergy.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              {CONTENT.synergy.description}
            </p>
          </div>

          <PlotterTimeline
            className="mt-12 lg:col-span-7 lg:mt-0"
            items={CONTENT.synergy.items}
            icons={SYNERGY_ICONS}
          />
        </div>
      </Container>
    </section>
  );
};

export default MarketingSynergy;
