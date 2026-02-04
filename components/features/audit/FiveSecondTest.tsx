import React, { useState } from 'react';
import { Timer, MousePointer2, CheckCircle2, AlertTriangle } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { useAnimationFrameInterval } from '../../../hooks/useAnimationFrameInterval';
import { VISUAL_AUDIT_CONTENT as CONTENT } from '../../../data/content/services/design/visual-audit';

const FiveSecondTest: React.FC = () => {
  const [timeLeft, setTimeStep] = useState(5);
  const [isActive, setIsActive] = useState(false);

  useAnimationFrameInterval(
    () => {
      if (timeLeft > 0) {
        setTimeStep((prev) => prev - 1);
      } else {
        setIsActive(false);
        setTimeout(() => setTimeStep(5), 3000);
      }
    },
    1000,
    isActive,
  );

  return (
    <SectionWrapper variant="white" containerClassName="max-w-screen-xl">
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2">
          <SectionHeader
            align="left"
            title={CONTENT.test5s.title}
            description={CONTENT.test5s.description}
          />

          <div className="space-y-6 mt-10">
            {CONTENT.test5s.stats?.map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="text-3xl font-black text-secondary w-16">{stat.val}</div>
                <div className="text-sm font-bold text-gray-600 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-1/2 w-full flex justify-center">
          <AnimateOnScroll delay={200}>
            <div className="relative w-full max-w-md aspect-square bg-[#F8F9FA] rounded-[2.5rem] border-2 border-gray-100 shadow-2xl p-8 flex flex-col items-center justify-center overflow-hidden">
              <div
                className={`absolute inset-0 bg-white z-20 flex flex-col items-center justify-center transition-all duration-500 ${isActive ? 'opacity-0 pointer-events-none scale-110' : 'opacity-100'}`}
              >
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-secondary mb-6 shadow-inner">
                  <Timer size={40} className={isActive ? 'animate-spin' : ''} />
                </div>
                <button
                  onClick={() => setIsActive(true)}
                  className="px-8 py-4 bg-dark text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-dark/20"
                >
                  START SIMULATION
                </button>
              </div>

              <div className="w-full h-full flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-xxs font-black uppercase tracking-widest text-gray-400">
                      Live Testing
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-black text-dark">00:0{timeLeft}</div>
                </div>

                <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-4 relative overflow-hidden">
                  <div className="w-full h-8 bg-gray-50 rounded-lg mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-blue-50 rounded-xl"></div>
                    <div className="h-24 bg-gray-50 rounded-xl"></div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                    <div className="h-2 w-2/3 bg-gray-100 rounded-full"></div>
                  </div>

                  <div className="absolute inset-0 bg-secondary/5 pointer-events-none"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary opacity-20">
                    <MousePointer2 size={120} />
                  </div>
                </div>

                <div className="mt-6 flex justify-around">
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="text-success mb-1" size={20} />
                    <span className="text-[10px] font-bold text-gray-500">Logo</span>
                  </div>
                  <div className="flex flex-col items-center opacity-30">
                    <AlertTriangle className="text-gray-400 mb-1" size={20} />
                    <span className="text-[10px] font-bold text-gray-500">CTA</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="text-success mb-1" size={20} />
                    <span className="text-[10px] font-bold text-gray-500">Heading</span>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default FiveSecondTest;
