import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Megaphone, TrendingUp, BarChart3, ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/common/SectionHeader';
import LazyHydrate from '@/components/common/LazyHydrate';
import AnimateOnScroll from '@/components/common/AnimateOnScroll';
import { MARKETING_CONTENT } from '@/data/content';

const MarketingArsenal: React.FC = () => {
  const navigate = useNavigate();

  const arsenalIcons = [
    <Search key="google" size={24} />,
    <Megaphone key="meta" size={24} />,
    <TrendingUp key="seo" size={24} />,
    <BarChart3 key="analytics" size={24} />,
  ];

  const serviceBlocks = MARKETING_CONTENT.arsenal.items.map((item, index) => ({
    ...item,
    icon: arsenalIcons[index],
    action: () => navigate(item.path),
  }));

  return (
    <section
      id="services-grid"
      className="py-20 md:py-24 bg-[#0B1120] text-white relative z-10 overflow-hidden"
    >
      {/* Background Tech Grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-dark rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          title={MARKETING_CONTENT.arsenal.title}
          subtitle={MARKETING_CONTENT.arsenal.subtitle}
          description={MARKETING_CONTENT.arsenal.description}
          lightMode
          className="mb-12 md:mb-16"
        />

        <LazyHydrate>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceBlocks.map((block, index) => (
              <AnimateOnScroll key={index} delay={index * 100} className="h-full">
                <button
                  className="group h-full w-full text-left bg-[#111827] border border-[#1F2937] hover:border-opacity-50 rounded-2xl p-1 flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                  onClick={block.action}
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                  aria-label={`Zobacz ofertę: ${block.title}`}
                >
                  {/* Inner Card Content */}
                  <div className="bg-[#1E293B]/40 h-full w-full rounded-xl p-5 md:p-6 flex flex-col relative z-10 backdrop-blur-sm transition-colors duration-300 group-hover:bg-[#1E293B]/60">
                    {/* Hover Ambient Light */}
                    <div
                      className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                      style={{ backgroundColor: block.color }}
                    ></div>

                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm transition-transform group-hover:scale-110 duration-500"
                        style={{
                          backgroundColor: `${block.color}15`,
                          color: block.color,
                          border: `1px solid ${block.color}30`,
                        }}
                      >
                        {React.cloneElement(block.icon as React.ReactElement<{ size?: number }>, {
                          size: 20,
                        })}
                      </div>
                      <div
                        className="px-2 py-1 rounded text-xxs md:text-xxs font-mono uppercase tracking-widest border transition-colors"
                        style={{
                          borderColor: `${block.color}20`,
                          color: block.color,
                          backgroundColor: `${block.color}05`,
                        }}
                      >
                        {block.role}
                      </div>
                    </div>

                    {/* Title & Desc */}
                    <div className="mb-6">
                      <h3
                        className={`text-lg md:text-xl font-bold text-white mb-2 transition-colors duration-300 group-hover:text-white`}
                      >
                        {block.title}
                      </h3>

                      <p className="text-sm text-gray-200 leading-relaxed font-medium">
                        {block.desc}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-2.5 mb-8 flex-grow border-t border-gray-700/30 pt-4">
                      {block.features.map((feat, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 text-xs font-mono text-gray-200"
                        >
                          <div
                            className="w-1 h-1 rounded-full shrink-0"
                            style={{ backgroundColor: block.color }}
                          ></div>
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* KPI Footer */}
                    <div className="mt-auto pt-4 border-t border-gray-700/30 flex justify-between items-center">
                      <div className="min-w-0">
                        <div className="text-xxxs md:text-xxs text-gray-300 uppercase font-bold tracking-wider mb-0.5">
                          KPI Target
                        </div>
                        <div
                          className="text-xs md:text-sm font-bold truncate"
                          style={{ color: block.color }}
                        >
                          {block.kpi}
                        </div>
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-gray-500 group-hover:text-white transition-colors transform group-hover:translate-x-1 shrink-0"
                      />
                    </div>
                  </div>
                </button>
              </AnimateOnScroll>
            ))}
          </div>
        </LazyHydrate>
      </div>
    </section>
  );
};

export default MarketingArsenal;
