import React from 'react';
import { Zap, Target, BarChart3, ArrowRight, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSectionProgress } from '../../hooks/useSectionProgress';
import { WHY_US_CONTENT as CONTENT } from '../../data/content';

/**
 * Sekcja „Dlaczego My?" (id="about" — linki nav/footer scrollują tutaj).
 *
 * Redesign: świadomie NIE kolejna bliźniacza siatka 3 kart (po „Kompetencjach"
 * byłaby monotonia rytmu — audyt to flagował). Układ editorialny, asymetryczny:
 * lewa kolumna = pewny nagłówek (sticky), prawa = 3 różnice jako czyste wiersze
 * z hairline'ami. Bez GlassCard, bez glow-blur, bez ozdobnych kropek.
 *
 * Immersyjny scroll (--p): wiersze wpływają z PRAWEJ ku przyklejonemu
 * nagłówkowi (kierunek niesie sens: argumenty schodzą się do tezy), kolejne
 * coraz później. Scroll-linked, dwukierunkowy; spoczynek = var(--p, 1).
 */

const IconMap: Record<string, LucideIcon> = {
  zap: Zap,
  target: Target,
  chart: BarChart3,
};

// Akcent per wiersz — spójny z sekcją „Kompetencje" (paleta marki, bez nowych kolorów)
const ACCENTS = [
  'bg-primary/10 text-primary',
  'bg-secondary/10 text-secondary',
  'bg-brand-pink/10 text-brand-pink',
];

const WhyUs: React.FC = () => {
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-24 md:py-28"
    >
      {/* Siatka dryfuje z pulsem strony (--page-p) — tło żyje przy scrollu. */}
      <div
        className="bg-tech-grid pointer-events-none absolute -inset-y-6 inset-x-0 opacity-[0.025]"
        style={{ transform: 'translate3d(0, calc(var(--page-p, 0) * -18px), 0)' }}
      />

      <div className="relative z-10 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* LEWA: pewny nagłówek */}
          <div className="lg:col-span-5">
            <div
              className="lg:sticky lg:top-28"
              style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 32px), 0)' }}
            >
              <h2 className="text-3xl font-black tracking-tight text-balance text-dark md:text-4xl lg:text-5xl">
                {CONTENT.title}
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-gray-700">
                {CONTENT.description}
              </p>
              <Link
                to="/o-nas/"
                className="group mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-secondary underline-offset-4 hover:underline"
              >
                Poznaj nas bliżej
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>

          {/* PRAWA: 3 różnice jako wiersze z hairline'ami */}
          <div className="lg:col-span-7">
            <div className="border-t border-gray-100">
              {CONTENT.items.map((item, index) => {
                const Icon = IconMap[item.icon as keyof typeof IconMap] || Zap;
                const accent = ACCENTS[index % ACCENTS.length];
                return (
                  <div
                    key={index}
                    style={{
                      transform: `translate3d(calc((1 - var(--p, 1)) * ${48 + index * 36}px), 0, 0)`,
                    }}
                  >
                    <div className="group flex gap-5 border-b border-gray-100 py-8 md:gap-6 md:py-10">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 motion-safe:group-hover:scale-105 ${accent}`}
                      >
                        <Icon size={26} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold tracking-tight text-dark md:text-2xl">
                          {item.title}
                        </h3>
                        <p className="mt-2 leading-relaxed text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
