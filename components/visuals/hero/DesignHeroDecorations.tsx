import React from 'react';
import { Palette, Figma, PenTool, Sparkles } from 'lucide-react';
import BaseCard from '../../common/BaseCard';

export const FloatingPalette: React.FC<{ delay?: string; className?: string }> = ({ delay = '0s', className = '' }) => (
  <div
    className={`absolute hidden xl:block animate-float shadow-2xl z-0 ${className}`}
    style={{ animationDelay: delay }}
  >
    <BaseCard variant="glass" padding="none" rounded="xl" className="bg-white/95 border-pink-100 px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
          <Palette size={16} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-400 uppercase leading-none tracking-widest mb-0.5">Identity</span>
          <span className="text-xs font-black text-dark whitespace-nowrap">Unique & Bold</span>
        </div>
      </div>
    </BaseCard>
  </div>
);

export const FloatingUxBadge: React.FC<{ delay?: string; className?: string }> = ({ delay = '1s', className = '' }) => (
  <div
    className={`absolute hidden xl:block animate-float shadow-2xl z-0 ${className}`}
    style={{ animationDelay: delay }}
  >
    <BaseCard variant="glass" padding="none" rounded="xl" className="bg-white/95 border-secondary/20 px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
          <Sparkles size={16} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-400 uppercase leading-none tracking-widest mb-0.5">Research</span>
          <span className="text-xs font-black text-dark whitespace-nowrap">Data Driven</span>
        </div>
      </div>
    </BaseCard>
  </div>
);

export const DesignDecorations: React.FC = () => (
  <>
    <FloatingPalette className="top-[15%] left-4 2xl:left-12 opacity-60 hover:opacity-100 transition-opacity" delay="0s" />
    <FloatingUxBadge className="bottom-[25%] left-8 2xl:left-24 opacity-60 hover:opacity-100 transition-opacity" delay="1.5s" />
    
    {/* Large background elements */}
    <div className="absolute top-[10%] right-[-5%] text-primary/5 animate-pulse hidden xl:block pointer-events-none">
      <Figma size={240} />
    </div>
    <div className="absolute bottom-[10%] right-[10%] text-secondary/5 animate-float hidden xl:block pointer-events-none" style={{ animationDelay: '2s' }}>
      <PenTool size={160} />
    </div>
  </>
);
