import React from 'react';
import { Figma, Sparkles, Layers } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import BaseCard from '../../common/BaseCard';
import WindowControls from '../../common/WindowControls';

export const DesignHeroVisual: React.FC = () => {
  return (
    <AnimateOnScroll className="relative z-10 flex justify-center lg:justify-end pr-4 md:pr-12">
      <div className="relative group">
        {/* Main Canvas Card */}
        <BaseCard
          variant="solid"
          padding="lg"
          rounded="3xl"
          className="w-full max-w-[320px] md:w-[420px] relative overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_80px_-20px_rgba(225,48,108,0.15)] transition-all duration-500 border-white/50 bg-white"
        >
          {/* Design Grid Background */}
          <div className="absolute inset-0 bg-grid-slate-100 opacity-[0.05] pointer-events-none"></div>

          <div className="flex justify-between items-center mb-8 relative z-10">
            <WindowControls />
            <div className="px-2.5 py-1 bg-pink-50/80 backdrop-blur-sm rounded-full text-[9px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-1.5 border border-pink-100/50">
              <Layers size={10} /> Canvas v2.0
            </div>
          </div>

          {/* Color Palette Display - Compact & Smarter */}
          <div className="space-y-5 relative z-10">
            <div className="flex gap-1.5 h-16">
              <div className="flex-1 bg-primary rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>
              <div
                className="flex-1 bg-secondary rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="flex-1 bg-dark rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>

            <div className="space-y-2">
              <div className="h-3 w-2/3 bg-gray-50 rounded animate-pulse"></div>
              <div
                className="h-3 w-full bg-gray-50 rounded"
                style={{ animationDelay: '0.1s' }}
              ></div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
              <div className="flex -space-x-1.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full border-2 border-white bg-gray-${i * 100 + 100}`}
                  ></div>
                ))}
              </div>
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                System Active
              </div>
            </div>
          </div>

          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-pink-500/40 to-transparent animate-scan"></div>
        </BaseCard>

        {/* Floating Figma Tool Badge */}
        <div className="absolute -top-6 -left-6 md:-top-10 md:-left-10 z-20 animate-float">
          <BaseCard
            variant="glass"
            padding="none"
            rounded="2xl"
            className="w-fit shadow-2xl border border-white/50 bg-white/95 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-dark flex items-center justify-center text-white shrink-0">
                <Figma size={20} />
              </div>
              <div className="pr-2">
                <div className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1 tracking-widest">
                  Prototyping
                </div>
                <div className="text-base font-black text-dark leading-none">Pixel Perfect</div>
              </div>
            </div>
          </BaseCard>
        </div>

        {/* Floating Aesthetics Badge */}
        <div
          className="absolute -bottom-6 -right-2 md:-right-6 z-20 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <BaseCard
            variant="glass"
            padding="none"
            rounded="2xl"
            className="w-fit shadow-2xl border border-white/50 bg-white/95 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <Sparkles size={18} />
              </div>
              <div className="pr-1">
                <div className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1 tracking-widest">
                  Visual Impact
                </div>
                <div className="text-sm font-black text-dark leading-none uppercase tracking-tighter">
                  Premium Aesthetics
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </AnimateOnScroll>
  );
};
