import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Rocket,
  Shield,
  Zap,
  Anchor,
  Search,
  Megaphone,
  TrendingUp,
  Globe,
  Activity,
  ArrowRight,
} from 'lucide-react';
import SectionHeader from '@/components/common/SectionHeader';
import LazyHydrate from '@/components/common/LazyHydrate';
import SectionWrapper from '@/components/common/SectionWrapper';
import { MARKETING_CONTENT } from '@/data/content';

const MarketingStrategy: React.FC = () => {
  const navigate = useNavigate();
  const [activeStrategy, setActiveStrategy] = useState<'quick' | 'stable'>('quick');

  return (
    <SectionWrapper variant="dark" overflow={true} containerClassName="max-w-screen-xl">
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

      <SectionHeader
        title={MARKETING_CONTENT.strategy.title}
        description={MARKETING_CONTENT.strategy.description}
        className="mb-12 md:mb-16"
        lightMode
      />

      <LazyHydrate>
        {/* Strategy Selector UI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-3xl mx-auto mb-10 md:mb-12">
          <button
            onClick={() => setActiveStrategy('quick')}
            aria-label={`Wybierz strategię: ${MARKETING_CONTENT.strategy.quick.title}`}
            aria-pressed={activeStrategy === 'quick'}
            className={`p-4 md:p-6 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 group ${activeStrategy === 'quick' ? 'bg-instagram/10 border-instagram shadow-[0_0_30px_rgba(225,48,108,0.2)]' : 'bg-[#1E293B] border-[#334155] opacity-60 hover:opacity-100'}`}
          >
            <div
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 ${activeStrategy === 'quick' ? 'bg-instagram text-white' : 'bg-[#334155] text-gray-300'}`}
            >
              <Rocket size={20} className="md:w-6 md:h-6" aria-hidden="true" />
            </div>

            <div className="text-left">
              <h3
                className={`font-bold text-base md:text-lg ${activeStrategy === 'quick' ? 'text-white' : 'text-gray-300'}`}
              >
                {MARKETING_CONTENT.strategy.quick.title}
              </h3>

              <p className="text-xxs text-gray-500 uppercase font-medium tracking-tight">
                {MARKETING_CONTENT.strategy.quick.subtitle}
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveStrategy('stable')}
            aria-label={`Wybierz strategię: ${MARKETING_CONTENT.strategy.stable.title}`}
            aria-pressed={activeStrategy === 'stable'}
            className={`p-4 md:p-6 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 group ${activeStrategy === 'stable' ? 'bg-primary/10 border-primary shadow-[0_0_30px_rgba(97,182,222,0.2)]' : 'bg-[#1E293B] border-[#334155] opacity-60 hover:opacity-100'}`}
          >
            <div
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 ${activeStrategy === 'stable' ? 'bg-primary text-white' : 'bg-[#334155] text-gray-300'}`}
            >
              <Shield size={20} className="md:w-6 md:h-6" aria-hidden="true" />
            </div>

            <div className="text-left">
              <h3
                className={`font-bold text-base md:text-lg ${activeStrategy === 'stable' ? 'text-white' : 'text-gray-300'}`}
              >
                {MARKETING_CONTENT.strategy.stable.title}
              </h3>

              <p className="text-xxs text-gray-500 uppercase font-medium tracking-tight">
                {MARKETING_CONTENT.strategy.stable.subtitle}
              </p>
            </div>
          </button>
        </div>

        {/* Dynamic Content Area */}

        <div className="bg-[#1E293B] rounded-[2rem] md:rounded-3xl border border-[#334155] p-6 md:p-12 shadow-2xl relative overflow-hidden">
          <div
            className={`absolute top-0 left-0 w-1 h-full transition-colors duration-500 ${activeStrategy === 'quick' ? 'bg-instagram' : 'bg-primary'}`}
          ></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">
            {/* Left: Metrics & Simulation */}

            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-6">
                {activeStrategy === 'quick'
                  ? MARKETING_CONTENT.strategy.quick.paramsTitle
                  : MARKETING_CONTENT.strategy.stable.paramsTitle}
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xxs text-gray-200 mb-2 font-mono uppercase tracking-widest">
                    <span>
                      {activeStrategy === 'quick'
                        ? MARKETING_CONTENT.strategy.quick.timeLabel
                        : MARKETING_CONTENT.strategy.stable.timeLabel}
                    </span>

                    <span
                      className={activeStrategy === 'quick' ? 'text-instagram' : 'text-primary'}
                    >
                      {activeStrategy === 'quick'
                        ? MARKETING_CONTENT.strategy.quick.timeVal
                        : MARKETING_CONTENT.strategy.stable.timeVal}
                    </span>
                  </div>

                  <div className="h-1.5 bg-[#0B1120] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${activeStrategy === 'quick' ? 'w-[95%] bg-instagram' : 'w-[30%] bg-primary'}`}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xxs text-gray-200 mb-2 font-mono uppercase tracking-widest">
                    <span>
                      {activeStrategy === 'quick'
                        ? MARKETING_CONTENT.strategy.quick.durabilityLabel
                        : MARKETING_CONTENT.strategy.stable.durabilityLabel}
                    </span>

                    <span
                      className={activeStrategy === 'quick' ? 'text-instagram' : 'text-primary'}
                    >
                      {activeStrategy === 'quick'
                        ? MARKETING_CONTENT.strategy.quick.durabilityVal
                        : MARKETING_CONTENT.strategy.stable.durabilityVal}
                    </span>
                  </div>

                  <div className="h-1.5 bg-[#0B1120] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${activeStrategy === 'quick' ? 'w-[40%] bg-instagram' : 'w-[90%] bg-primary'}`}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-[#334155] grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-[#0B1120] ${activeStrategy === 'quick' ? 'text-instagram' : 'text-gray-500'}`}
                  >
                    <Zap size={18} aria-hidden="true" />
                  </div>

                  <div>
                    <div className="text-xxs text-gray-300 uppercase font-bold">Priorytet</div>

                    <div className="text-white font-bold text-xs">Sprzedaż</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-[#0B1120] ${activeStrategy === 'stable' ? 'text-primary' : 'text-gray-500'}`}
                  >
                    <Anchor size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-xxs text-gray-300 uppercase font-bold">Priorytet</div>
                    <div className="text-white font-bold text-xs">Brand LTV</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Tactical Loadout */}
            <div className="relative">
              <div className="text-xxs font-bold text-gray-100 uppercase tracking-widest mb-4">
                Zalecane Narzędzia
              </div>
              <div className="space-y-2.5">
                {(activeStrategy === 'quick'
                  ? MARKETING_CONTENT.strategy.quickTools.map((tool, i) => ({
                      ...tool,
                      icon: [
                        <Search key="search" size={14} />,
                        <Megaphone key="megaphone" size={14} />,
                        <Zap key="zap" size={14} />,
                      ][i],
                    }))
                  : MARKETING_CONTENT.strategy.stableTools.map((tool, i) => ({
                      ...tool,
                      icon: [
                        <TrendingUp key="trending" size={14} />,
                        <Globe key="globe" size={14} />,
                        <Activity key="activity" size={14} />,
                      ][i],
                    }))
                ).map((tool, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3.5 bg-[#0B1120] rounded-xl border border-[#334155] hover:border-gray-500 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${activeStrategy === 'quick' ? 'bg-instagram/20 text-instagram' : 'bg-primary/20 text-primary'}`}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-xs truncate">{tool.name}</div>
                      <div className="text-gray-200 text-xxs truncate">{tool.desc}</div>
                    </div>
                    <button
                      className="!p-1.5 h-auto shrink-0 text-gray-500 hover:text-white transition-colors"
                      onClick={() => navigate('/marketing/')}
                      aria-label={`Dowiedz się więcej o ${tool.name}`}
                    >
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </LazyHydrate>
    </SectionWrapper>
  );
};

export default MarketingStrategy;
