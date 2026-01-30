import React from 'react';
import { Database, Target, Users, Cpu, ShoppingCart, Store, BarChart3 } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import { ANALYTICS_CONTENT as CONTENT } from '../../../data/content';

const AnalyticsWarehouse: React.FC = () => {
  return (
    <section className="py-24 bg-deep-dark relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <AnimateOnScroll>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider mb-6">
                <Database size={14} /> {CONTENT.warehouse.badge}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {CONTENT.warehouse.title.line1} <br />
                <span className="text-primary">{CONTENT.warehouse.title.line2}</span>
              </h2>
              <p className="text-gray-200 text-lg mb-8 leading-relaxed">
                {CONTENT.warehouse.description}
              </p>

              <div className="space-y-6">
                {CONTENT.warehouse.features.map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 p-2 bg-primary/10 rounded-lg text-primary h-fit border border-primary/20">
                      {i === 0 ? (
                        <Target size={20} />
                      ) : i === 1 ? (
                        <Users size={20} />
                      ) : (
                        <Cpu size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{feature.title}</h3>
                      <p className="text-sm text-gray-300 mt-1">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
          </div>

          <div className="lg:w-1/2 w-full flex justify-center items-center min-h-[450px]">
            <div className="relative w-full max-w-xl aspect-[16/10] bg-[#0F172A] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-primary/10 via-transparent to-[#E1306C]/10 pointer-events-none"></div>

              <svg
                className="absolute inset-0 w-full h-full z-0"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <filter id="packetGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="1" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <path
                  d="M 28 20 C 38 20, 42 50, 50 50"
                  stroke="#61B6DE"
                  strokeWidth="0.5"
                  fill="none"
                  strokeOpacity="0.6"
                />
                <path
                  d="M 28 50 L 50 50"
                  stroke="#E1306C"
                  strokeWidth="0.5"
                  fill="none"
                  strokeOpacity="0.8"
                />
                <path
                  d="M 28 80 C 38 80, 42 50, 50 50"
                  stroke="#00C853"
                  strokeWidth="0.5"
                  fill="none"
                  strokeOpacity="0.6"
                />

                <path
                  d="M 50 50 L 72 50"
                  stroke="white"
                  strokeWidth="0.3"
                  fill="none"
                  strokeOpacity="0.3"
                  strokeDasharray="2 1"
                />

                <circle r="1.2" fill="#61B6DE" filter="url(#packetGlow)">
                  <animateMotion
                    dur="2.5s"
                    repeatCount="indefinite"
                    path="M 28 20 C 38 20, 42 50, 50 50"
                  />
                </circle>
                <circle r="1.2" fill="#E1306C" filter="url(#packetGlow)">
                  <animateMotion dur="2s" repeatCount="indefinite" path="M 28 50 L 50 50" />
                </circle>
                <circle r="1.2" fill="#00C853" filter="url(#packetGlow)">
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    path="M 28 80 C 38 80, 42 50, 50 50"
                  />
                </circle>
                <circle r="1.5" fill="white" filter="url(#packetGlow)">
                  <animateMotion dur="1.5s" repeatCount="indefinite" path="M 50 50 L 72 50" />
                </circle>
              </svg>

              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute left-[6%] top-[20%] -translate-y-1/2 w-[22%] pointer-events-auto">
                  <button
                    className="w-full bg-[#1E293B]/90 backdrop-blur-sm border border-white/10 p-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 shadow-2xl hover:border-primary/50 transition-colors group"
                    aria-label="Źródło danych: Sklep (Store)"
                  >
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <ShoppingCart size={14} aria-hidden="true" />
                    </div>
                    <span className="text-xxxs md:text-xxs font-black text-gray-200 tracking-wider uppercase">
                      Store
                    </span>
                  </button>
                </div>

                <div className="absolute left-[6%] top-[50%] -translate-y-1/2 w-[22%] pointer-events-auto">
                  <button
                    className="w-full bg-[#1E293B]/90 backdrop-blur-sm border border-white/10 p-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 shadow-2xl hover:border-instagram/50 transition-colors group"
                    aria-label="Źródło danych: CRM"
                  >
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-instagram/20 flex items-center justify-center text-instagram group-hover:bg-instagram group-hover:text-white transition-all">
                      <Users size={14} aria-hidden="true" />
                    </div>
                    <span className="text-xxxs md:text-xxs font-black text-gray-200 tracking-wider uppercase">
                      CRM
                    </span>
                  </button>
                </div>

                <div className="absolute left-[6%] top-[80%] -translate-y-1/2 w-[22%] pointer-events-auto">
                  <button
                    className="w-full bg-[#1E293B]/90 backdrop-blur-sm border border-white/10 p-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 shadow-2xl hover:border-success/50 transition-colors group"
                    aria-label="Źródło danych: POS"
                  >
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-success/20 flex items-center justify-center text-success group-hover:bg-success group-hover:text-white transition-all">
                      <Store size={14} aria-hidden="true" />
                    </div>
                    <span className="text-xxxs md:text-xxs font-black text-gray-200 tracking-wider uppercase">
                      POS
                    </span>
                  </button>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#4285F4]/20 rounded-full blur-[40px] animate-pulse"></div>
                    <div className="absolute -inset-2 border-2 border-[#4285F4]/30 rounded-full animate-spin-slow border-dashed"></div>
                    <div className="relative z-20 w-16 h-16 md:w-24 md:h-24 bg-[#0F172A] rounded-3xl border-2 border-[#4285F4] flex flex-col items-center justify-center shadow-[0_0_40px_rgba(66,133,244,0.3)]">
                      <Database size={28} className="text-white mb-1" />
                      <div className="text-[7px] md:text-xxxs font-black text-[#4285F4] uppercase tracking-tighter text-center leading-none">
                        Engine
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute left-[72%] top-1/2 -translate-y-1/2 w-[24%] pointer-events-auto">
                  <div className="bg-gradient-to-br from-secondary to-dark border border-white/20 p-2 md:p-4 rounded-2xl flex items-center gap-2 md:gap-3 shadow-2xl shadow-black/50 hover:-translate-y-1 transition-transform group">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                      <BarChart3 size={18} />
                    </div>
                    <div>
                      <div className="text-[7px] md:text-xxxs text-blue-300 uppercase font-black mb-0.5 tracking-widest leading-none">
                        Dashboard
                      </div>
                      <span className="text-xxs md:text-sm font-black text-white uppercase tracking-tighter">
                        Looker
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
          @keyframes flow-dash {
              to { stroke-dashoffset: -20; }
          }
          .animate-flow-dash {
              animation: flow-dash 1s linear infinite;
          }
          .animate-spin-slow {
              animation: spin 10s linear infinite;
          }
        `}</style>
    </section>
  );
};

export default AnalyticsWarehouse;
