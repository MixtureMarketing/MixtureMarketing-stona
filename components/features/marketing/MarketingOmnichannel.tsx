import React from 'react';
import { GitMerge, TrendingUp, Database, Search, Megaphone, Activity } from 'lucide-react';
import SectionHeader from '@/components/common/SectionHeader';
import LazyHydrate from '@/components/common/LazyHydrate';
import AnimateOnScroll from '@/components/common/AnimateOnScroll';
import { MARKETING_CONTENT } from '@/data/content';

const MarketingOmnichannel: React.FC = () => {
  return (
    <section className="py-20 md:py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <SectionHeader
              align="left"
              title={MARKETING_CONTENT.synergy.title}
              description={MARKETING_CONTENT.synergy.description}
            />
            <ul className="space-y-6 mt-8">
              {MARKETING_CONTENT.synergy.items.map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="mt-1 p-2 bg-blue-50 rounded-lg text-secondary h-fit shrink-0">
                    {i === 0 ? <GitMerge size={20} /> : <TrendingUp size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-dark">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual: Flywheel / Loop */}
          <div className="lg:w-1/2 flex justify-center scale-75 md:scale-100">
            <LazyHydrate>
              <AnimateOnScroll delay={200}>
                <div className="relative w-72 h-72 md:w-80 md:h-80">
                  {/* Central Hub */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-dark text-white w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-white">
                    <Database size={20} className="mb-1 md:w-6 md:h-6" />
                    <span className="text-xxxs md:text-xxs font-bold uppercase tracking-tight">
                      DATA HUB
                    </span>
                  </div>

                  {/* Orbiting Channels */}
                  <div className="absolute inset-0 animate-spin-slow">
                    {/* Wrapper to maintain position, inner div to counter-rotate */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6">
                      <div className="animate-counter-spin bg-white p-2.5 md:p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2">
                        <Search size={14} className="text-[#4285F4] md:w-4 md:h-4" />{' '}
                        <span className="text-xxs md:text-xs font-bold text-gray-700">Google</span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6">
                      <div className="animate-counter-spin bg-white p-2.5 md:p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2">
                        <Megaphone size={14} className="text-instagram md:w-4 md:h-4" />{' '}
                        <span className="text-xxs md:text-xs font-bold text-gray-700">Meta</span>
                      </div>
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-x-6 -translate-y-1/2">
                      <div className="animate-counter-spin bg-white p-2.5 md:p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2">
                        <TrendingUp size={14} className="text-success md:w-4 md:h-4" />{' '}
                        <span className="text-xxs md:text-xs font-bold text-gray-700">SEO</span>
                      </div>
                    </div>
                    <div className="absolute right-0 top-1/2 translate-x-6 -translate-y-1/2">
                      <div className="animate-counter-spin bg-white p-2.5 md:p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2">
                        <Activity size={14} className="text-[#F4B400] md:w-4 md:h-4" />{' '}
                        <span className="text-xxs md:text-xs font-bold text-gray-700">
                          Analytics
                        </span>
                      </div>
                    </div>

                    {/* Connecting Ring */}
                    <div className="absolute inset-4 border-2 border-dashed border-primary/20 rounded-full"></div>
                  </div>
                </div>
              </AnimateOnScroll>
            </LazyHydrate>
          </div>
        </div>
      </div>
      <style>{`
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        .animate-counter-spin {
          animation: counter-spin 20s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes counter-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }
      `}</style>
    </section>
  );
};

export default MarketingOmnichannel;
