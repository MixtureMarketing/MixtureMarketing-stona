import React, { useState } from 'react';
import { Split } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { LANDING_PAGE_CONTENT as CONTENT } from '../../../data/content';

/**
 * Anatomia AIDA (poprawki 2026-07-16): kroki po lewej to teraz <button>
 * z aria-pressed (wcześniej klikalne divy bez klawiatury), wireframe po
 * prawej jest aria-hidden (szkielet to ilustracja, nie treść), paleta bez
 * instagramowego różu (#C2185B — wariant AA jak w playgroundzie ui-ux).
 */
/** ink = kolor tekstu na plakietce strefy (dobrany z luminancji — AA). */
const ZONE_COLORS = [
  { border: 'border-[#C2185B]', bg: 'bg-[#C2185B]/5', hex: '#C2185B', ink: '#FFFFFF' },
  { border: 'border-primary', bg: 'bg-primary/5', hex: '#61B6DE', ink: '#0F172A' },
  { border: 'border-[#8B8AE8]', bg: 'bg-[#8B8AE8]/5', hex: '#8B8AE8', ink: '#0F172A' },
  { border: 'border-success', bg: 'bg-success/5', hex: '#00C853', ink: '#0F172A' },
];

const LandingPagePsychology: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <SectionWrapper id="anatomy" variant="dark">
      <div className="bg-tech-grid absolute inset-0 opacity-20 pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row gap-16 items-start relative z-10">
        {/* Wireframe — ilustracja sterowana krokami obok, niedostępna dla AT */}
        <div
          className="lg:w-3/5 w-full flex justify-center lg:justify-start order-2 lg:order-1"
          aria-hidden="true"
        >
          <AnimateOnScroll delay={200} className="w-full">
            <div className="relative w-full max-w-xl mx-auto bg-[#0F172A] rounded-md border-2 border-[#1E293B] p-2 shadow-2xl">
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
              <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-primary"></div>

              <div className="bg-deep-dark p-6 space-y-6 relative overflow-hidden">
                <div className="bg-grid-pattern absolute inset-0 opacity-10 pointer-events-none"></div>

                {CONTENT.psychology.steps.map((step, i) => {
                  const c = ZONE_COLORS[i];
                  return (
                    <div
                      key={i}
                      className={`relative border border-dashed p-6 rounded transition-all duration-300 ${c.border} ${c.bg} ${
                        activeStep === i
                          ? 'ring-2 scale-[1.02] shadow-xl z-10'
                          : activeStep !== null
                            ? 'opacity-30 blur-[1px]'
                            : ''
                      }`}
                      style={activeStep === i ? ({ '--tw-ring-color': c.hex } as never) : {}}
                    >
                      <div
                        className="absolute top-0 right-0 text-[10px] font-bold px-2 py-0.5"
                        style={{ backgroundColor: c.hex, color: c.ink }}
                      >
                        {step.step} · {step.name.toUpperCase()}
                      </div>
                      {i === 0 && (
                        <div className="flex gap-4">
                          <div className="w-2/3 space-y-2">
                            <div className="h-6 w-full bg-[#C2185B]/40 rounded-sm"></div>
                            <div className="h-6 w-3/4 bg-[#C2185B]/40 rounded-sm"></div>
                            <div className="h-3 w-full bg-[#C2185B]/20 mt-4 rounded-sm"></div>
                            <div className="h-8 w-32 bg-[#C2185B] mt-4 rounded flex items-center justify-center text-xxs font-bold text-white">
                              CTA
                            </div>
                          </div>
                          <div className="w-1/3 bg-[#C2185B]/10 border border-[#C2185B]/30 flex items-center justify-center text-[#eb5c96] text-xs">
                            Hero
                          </div>
                        </div>
                      )}
                      {i === 1 && (
                        <div className="grid grid-cols-3 gap-4">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="flex flex-col gap-2">
                              <div className="h-12 bg-primary/20 rounded w-full"></div>
                              <div className="h-2 w-full bg-primary/20 rounded-sm"></div>
                            </div>
                          ))}
                        </div>
                      )}
                      {i === 2 && (
                        <div className="flex gap-4 items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#8B8AE8]/40 border-2 border-[#8B8AE8] shrink-0"></div>
                          <div className="space-y-2 w-full max-w-sm">
                            <div className="h-2 w-full bg-[#8B8AE8]/20 rounded-sm"></div>
                            <div className="flex gap-1 mt-2">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <div key={s} className="w-2 h-2 bg-[#8B8AE8] rounded-full"></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {i === 3 && (
                        <div className="flex flex-col items-center">
                          <div className="h-12 w-full max-w-xs bg-success rounded shadow-lg flex items-center justify-center text-deep-dark font-black text-sm uppercase tracking-widest">
                            Konwertuj
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </AnimateOnScroll>
        </div>

        {/* Kroki AIDA — prawdziwe kontrolki */}
        <div className="lg:w-2/5 order-1 lg:order-2">
          <AnimateOnScroll>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <Split size={14} aria-hidden="true" /> {CONTENT.psychology.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              {CONTENT.psychology.title.line1}
              <br />
              <span className="text-primary">{CONTENT.psychology.title.line2}</span>
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              {CONTENT.psychology.description}
            </p>

            <div className="space-y-4">
              {CONTENT.psychology.steps.map((step, i) => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={activeStep === i}
                  onMouseEnter={() => setActiveStep(i)}
                  onMouseLeave={() => setActiveStep(null)}
                  onClick={() => setActiveStep(activeStep === i ? null : i)}
                  className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 group cursor-pointer ${
                    activeStep === i
                      ? 'bg-white/10 border-white/30 translate-x-2'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div
                    className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 shadow-lg font-mono border transition-all ${
                      activeStep === i
                        ? 'bg-white text-black border-transparent scale-110'
                        : 'bg-transparent text-white border-white/10'
                    }`}
                    style={
                      activeStep === i
                        ? {}
                        : { color: ZONE_COLORS[i].hex, borderColor: ZONE_COLORS[i].hex }
                    }
                  >
                    {step.step}
                  </div>
                  <div>
                    <h3
                      className={`font-bold text-sm mb-1 flex items-center gap-2 transition-colors ${
                        activeStep === i ? 'text-white' : 'text-gray-100'
                      }`}
                    >
                      {step.name}
                      <span
                        className={`text-xxs px-2 py-0.5 rounded font-mono transition-colors ${
                          activeStep === i ? 'bg-white text-black' : 'bg-white/10 text-gray-300'
                        }`}
                      >
                        {step.tech}
                      </span>
                    </h3>
                    <p
                      className={`text-xs leading-relaxed transition-colors ${
                        activeStep === i ? 'text-white' : 'text-gray-300'
                      }`}
                    >
                      {step.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default LandingPagePsychology;
