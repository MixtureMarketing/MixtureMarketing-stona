import React from 'react';
import { Component, Layers, Box, Code2, Palette, Layout, Zap } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { UI_UX_DESIGN_CONTENT as CONTENT } from '../../../data/content/services/design/ui-ux';

const UiUxAtomicDesign: React.FC = () => {
  return (
    <SectionWrapper variant="dark" overflow={true}>
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2">
          <AnimateOnScroll>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <Component size={14} /> {CONTENT.atomic.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {CONTENT.atomic.title.line1} <br />
              <span className="text-primary">{CONTENT.atomic.title.line2}</span>
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              {CONTENT.atomic.description}
            </p>

            <div className="space-y-4">
              {CONTENT.atomic.features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-colors"
                >
                  <div className="p-2 bg-primary/20 rounded-lg text-primary">
                    {i === 0 ? (
                      <Layers size={20} aria-hidden="true" />
                    ) : (
                      <Box size={20} aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{feature.title}</h3>
                    <p className="text-xs text-gray-300">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>

        <div className="lg:w-1/2 w-full">
          <AnimateOnScroll delay={200}>
            <div className="relative rounded-3xl bg-[#0F172A] border border-[#1E293B] shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[120px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>

              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0F172A]/80 relative z-10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#334155]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#334155]"></div>
                </div>
                <div className="text-xxs font-mono text-white/50 uppercase tracking-widest flex items-center gap-2">
                  <Code2 size={12} aria-hidden="true" /> atomic-design
                </div>
              </div>

              <div className="p-8 relative z-10">
                <div className="flex flex-col gap-8 relative">
                  <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-primary to-secondary opacity-30"></div>

                  <div className="flex items-center gap-6 group/item">
                    <div className="w-16 h-16 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-primary shadow-lg relative z-10 group-hover/item:border-primary group-hover/item:scale-105 transition-all duration-300">
                      <Palette size={24} />
                      <div className="absolute -right-1 -top-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-[#1E293B]/50 border border-[#334155]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-white">Atomy</span>
                        <span className="text-xxs font-mono text-white/50">kolor · typografia</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded bg-primary shadow-sm"></div>
                        <div className="w-6 h-6 rounded bg-secondary shadow-sm"></div>
                        <div className="px-2 py-1 bg-black rounded text-xxs text-white font-serif flex items-center">
                          Aa
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 group/item">
                    <div className="w-16 h-16 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-white shadow-lg relative z-10 group-hover/item:border-primary group-hover/item:scale-105 transition-all duration-300">
                      <Component size={24} />
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-[#1E293B]/50 border border-[#334155] relative overflow-hidden">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-white">Molekuły</span>
                        <span className="text-xxs font-mono text-white/50">
                          {'<Button icon={Zap} />'}
                        </span>
                      </div>
                      {/* Wzornik, nie kontrolka — div, żeby AT nie łapał martwego przycisku */}
                      <div
                        aria-hidden="true"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-deep-dark rounded-lg text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 transform group-hover/item:translate-x-2 transition-transform"
                      >
                        <Zap size={14} fill="currentColor" /> Akcja
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 group/item">
                    <div className="w-16 h-16 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-white shadow-lg relative z-10 group-hover/item:border-primary group-hover/item:scale-105 transition-all duration-300">
                      <Layout size={24} />
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-[#1E293B]/50 border border-[#334155]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-white">Organizmy</span>
                        <span className="text-xxs font-mono text-white/50">
                          {'<ProductCard />'}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg w-full flex gap-3 items-center shadow-sm opacity-90 group-hover/item:opacity-100 transition-opacity">
                        <div className="w-10 h-10 bg-gray-100 rounded-md shrink-0"></div>
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2 w-2/3 bg-gray-200 rounded-full"></div>
                          <div className="flex items-center gap-2">
                            <div className="px-2 py-1 bg-primary text-deep-dark text-xxxs font-black rounded uppercase">
                              Akcja
                            </div>
                            <div className="h-1.5 w-1/3 bg-gray-100 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fejkowa telemetria („System Status: Stable v2.4.0") usunięta 2026-07-16
                  — zakaz atrap; stopka nazywa poziomy metodologii, nic nie udaje. */}
              <div className="px-6 py-3 bg-[#0F172A]/80 border-t border-[#1E293B] flex justify-between items-center text-xxs text-white/50 font-mono">
                <div>atomy → molekuły → organizmy</div>
                <div>Brad Frost, Atomic Design</div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default UiUxAtomicDesign;
