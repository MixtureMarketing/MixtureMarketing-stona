import React from 'react';
import { Sparkles } from 'lucide-react';
import { useParallax } from '../../../hooks/useParallax';
import { WindowControls } from './atoms/WindowControls';

export const UiUxHeroVisual: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mousePos = useParallax(containerRef, 1);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[500px] aspect-[4/5] md:aspect-square flex items-center justify-center perspective-[2000px] mx-auto"
      style={{ transform: 'scale(var(--hero-scale))' }}
    >
      <div
        className="absolute top-1/2 left-1/2 w-[90%] md:w-[400px] h-64 md:h-72 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white p-6 md:p-8 transition-transform duration-100 ease-out will-change-transform"
        style={{
          transform: `translate(-50%, -50%) translate(${mousePos.x * -25}px, ${mousePos.y * -25}px) rotateX(${mousePos.y * 8}deg) rotateY(${mousePos.x * 8}deg)`,
        }}
      >
        <div className="flex justify-between items-center mb-8">
          <WindowControls />
          <div className="w-24 h-2 bg-gray-100 rounded-full"></div>
        </div>
        <div className="flex gap-6">
          <div className="w-1/3 h-24 md:h-32 bg-gradient-to-br from-light-gray to-[#E0EFFF] rounded-2xl border border-gray-50 shadow-inner"></div>
          <div className="w-2/3 space-y-4 pt-2">
            <div className="w-full h-3 bg-gray-100 rounded-full"></div>
            <div className="w-full h-3 bg-gray-100 rounded-full"></div>
            <div className="w-2/3 h-3 bg-gray-100 rounded-full"></div>
          </div>
        </div>
      </div>

      <div
        className="absolute top-1/2 left-[60%] w-[50%] md:w-56 h-[320px] md:h-[420px] bg-deep-dark rounded-[2.5rem] md:rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[4px] md:border-[6px] border-slate-border p-4 md:p-6 transition-transform duration-100 ease-out flex flex-col justify-between overflow-hidden will-change-transform"
        style={{
          transform: `translate(-50%, -40%) translate(${mousePos.x * 50}px, ${mousePos.y * 50}px) rotateX(${mousePos.y * 12}deg) rotateY(${mousePos.x * 12}deg)`,
        }}
      >
        <div className="space-y-4 md:space-y-6 pt-4 md:pt-6 relative z-10">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-primary to-secondary rounded-[1.2rem] md:rounded-[1.5rem] mx-auto shadow-2xl shadow-primary/40 flex items-center justify-center text-white">
            <Sparkles size={24} className="md:w-8 md:h-8" />
          </div>
          <div className="space-y-2 text-center">
            <div className="w-20 md:w-28 h-2 md:h-2.5 bg-white/20 rounded-full mx-auto"></div>
            <div className="w-16 md:w-20 h-1.5 md:h-2 bg-white/10 rounded-full mx-auto"></div>
          </div>
          <div className="bg-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 backdrop-blur-md border border-white/10">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-full"></div>
              <div className="w-12 md:w-16 h-2 bg-white/20 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-8 md:h-12 bg-white/5 rounded-lg md:rounded-xl"></div>
              <div className="h-8 md:h-12 bg-primary/20 rounded-lg md:rounded-xl"></div>
            </div>
          </div>
        </div>
        <button className="w-full py-3 md:py-4 bg-white text-deep-dark font-black rounded-xl md:rounded-2xl text-[10px] md:text-xxs uppercase tracking-widest shadow-xl transform hover:scale-105 transition-all">
          Zacznij teraz
        </button>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-[60px]"></div>
      </div>
    </div>
  );
};
