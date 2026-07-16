import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Gauge, LifeBuoy, Unplug, LucideIcon } from 'lucide-react';
import Container from '../../common/Container';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import { ECOMMERCE_CONTENT as CONTENT } from '../../../data/content';

/**
 * „Masz już sklep?" — ścieżka dla klienta z istniejącym sklepem (decyzja
 * właściciela 2026-07-15: audyt / migracja z SaaS / przejęcie utrzymania).
 * Trzy WIERSZE z rozróżnialnymi ikonami i własnymi CTA — nie siatka
 * identycznych kart. Audyt prowadzi do /audyt-360/ (główny lead magnet).
 */
const PATH_META: { Icon: LucideIcon; ctaLabel: string }[] = [
  { Icon: Gauge, ctaLabel: 'Zamów darmowy audyt' },
  { Icon: Unplug, ctaLabel: 'Zapytaj o migrację' },
  { Icon: LifeBuoy, ctaLabel: 'Porozmawiaj o opiece' },
];

interface EcommerceExistingProps {
  onConsult: () => void;
}

const EcommerceExisting: React.FC<EcommerceExistingProps> = ({ onConsult }) => {
  const navigate = useNavigate();
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  return (
    <section ref={sectionRef} className="relative bg-light-gray py-20 md:py-28">
      <Container>
        <div
          className="max-w-3xl"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 24px), 0)' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-dark md:text-4xl">
            {CONTENT.existing.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-700">
            {CONTENT.existing.description}
          </p>
        </div>

        <ol
          className="mt-12 divide-y divide-gray-100 rounded-3xl border border-gray-200 bg-white shadow-sm"
          style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 48px), 0)' }}
        >
          {CONTENT.existing.paths.map((path, i) => {
            const { Icon, ctaLabel } = PATH_META[i];
            const onClick = path.cta === 'audit' ? () => navigate('/audyt-360/') : onConsult;
            return (
              <li
                key={path.title}
                className="flex flex-col gap-4 px-6 py-7 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-10 md:px-9"
              >
                <div className="flex items-start gap-4">
                  <Icon size={22} className="mt-1 shrink-0 text-secondary" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-extrabold tracking-tight text-dark">
                      {path.title}
                    </h3>
                    <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-gray-700">
                      {path.desc}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClick}
                  className="group inline-flex min-h-11 shrink-0 items-center gap-2 self-start font-bold text-secondary underline-offset-4 transition-colors hover:text-dark hover:underline md:self-center"
                >
                  {ctaLabel}
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
};

export default EcommerceExisting;
