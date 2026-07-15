import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';
import HeroBadge from '../common/HeroBadge';
import { useSectionProgress } from '../../hooks/useSectionProgress';
import { LEAD_MAGNET_CONTENT as CONTENT } from '../../data/content';
import { AuditVisual } from '../visuals/LeadMagnetVisuals';

/**
 * Immersyjny scroll (--p): ciemna karta oferty „dojeżdża" ze skalą 0.96→1,
 * a wnętrze ma głębię — tekst schodzi z dołu, wizual audytu z góry (paralaksa
 * przeciwbieżna). Scroll-linked, dwukierunkowy; spoczynek = var(--p, 1).
 */
const LeadMagnet: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useSectionProgress<HTMLElement>(0.85);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-dark py-24">
      {/* Tło premium — tanie radialne gradienty (bez blur-filtra) + subtelna siatka */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(40% 50% at 100% 0%, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 60%),' +
            'radial-gradient(40% 50% at 0% 100%, color-mix(in srgb, var(--color-secondary) 22%, transparent), transparent 65%)',
        }}
        aria-hidden="true"
      />
      <div className="bg-tech-grid absolute inset-0 opacity-10"></div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Solidna tinta zamiast backdrop-blur: pod kartą nic nie przepływa,
            więc blur był czystą dekoracją (i kosztem kompozycji) */}
        <div
          className="bg-white/[0.06] border border-white/10 rounded-[3rem] p-8 md:p-16 overflow-hidden relative group"
          style={{ transform: 'scale(calc(0.96 + 0.04 * var(--p, 1)))' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * 36px), 0)' }}>
              <HeroBadge accent="primary" className="mb-6">
                {CONTENT.badge}
              </HeroBadge>

              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                {CONTENT.title.line1} <br className="hidden md:block" />
                <span className="text-primary">{CONTENT.title.line2}</span>
              </h2>

              <p className="text-gray-300 text-base md:text-lg mb-8 md:mb-10 leading-relaxed max-w-xl">
                {CONTENT.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-10">
                {CONTENT.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-200">
                    <CheckCircle2 size={16} className="text-success shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto justify-center shadow-xl shadow-primary/20 text-sm sm:text-lg px-4 sm:px-8 h-12 sm:h-16"
                onClick={() => navigate('/audyt-360/')}
                icon={<ArrowRight size={18} className="sm:w-5 sm:h-5" />}
              >
                {CONTENT.button}
              </Button>
            </div>

            <div
              className="relative hidden lg:block"
              style={{ transform: 'translate3d(0, calc((1 - var(--p, 1)) * -32px), 0)' }}
            >
              <AuditVisual />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadMagnet;
