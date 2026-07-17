import React from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import { useSectionProgress } from '../../hooks/useSectionProgress';
import SYGNET from '../../data/content/sygnet-dots.json';

/**
 * Bookend strony głównej (choreografia „żywej całości", 2026-07-16):
 * narracja kropek domyka się klamrą — sygnet, który w hero wyłania się
 * z prądów, tu ZBIEGA SIĘ z rozsypki wraz ze scrollem (dwukierunkowo,
 * czysty CSS na var(--p); kropki próbkowane build-time:
 * scripts/generate-sygnet-dots.mjs). Chaos → forma po raz drugi — teza
 * marki na pożegnanie, tuż przed decyzją o kontakcie.
 * Spoczynek/prerender/reduced-motion: konstelacja uformowana (var(--p,1)),
 * zero rAF, zero wiecznych animacji (WCAG 2.2.2 bez przycisku pauzy).
 */
interface FinalBandProps {
  onOpenModal: () => void;
}

const FinalBand: React.FC<FinalBandProps> = ({ onOpenModal }) => {
  const sectionRef = useSectionProgress<HTMLElement>(0.8);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-deep-dark py-20 md:py-28">
      <div className="relative z-10 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-12 md:flex-row md:items-center md:justify-between">
          <div
            className="max-w-2xl"
            style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 28px), 0)' }}
          >
            <h2 className="text-4xl font-extrabold tracking-tight text-balance text-white md:text-5xl">
              Wymieszajmy to.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/75">
              Opowiedz nam o swojej firmie. Pokażemy, co da się poprawić, jak chcemy to zrobić i ile
              to kosztuje — bez zobowiązań i bez żargonu.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="mt-8 justify-center"
              onClick={onOpenModal}
              icon={<ArrowRight size={18} />}
            >
              Umów bezpłatną rozmowę
            </Button>
          </div>

          {/* Konstelacja sygnetu — kropki zbiegają się z rozsypki na --p. */}
          <svg
            viewBox={`0 0 ${SYGNET.vb[0]} ${SYGNET.vb[1]}`}
            className="h-52 w-auto shrink-0 self-center md:h-64"
            aria-hidden="true"
          >
            {SYGNET.dots.map(([x, y, w, sx, sy], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={0.9 + w * 0.9}
                fill={`rgba(186,224,246,${(0.25 + 0.6 * w).toFixed(2)})`}
                style={{
                  transform: `translate(calc((1 - var(--p, 1)) * ${sx}px), calc((1 - var(--p, 1)) * ${sy}px))`,
                }}
              />
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
};

export default FinalBand;
