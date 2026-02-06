import React from 'react';
import { Code2, Database, ShieldCheck } from 'lucide-react';
import BaseCard from '../../common/BaseCard';

export const FloatingTerminal: React.FC<{ delay?: string; className?: string }> = ({
  delay = '0s',
  className = '',
}) => (
  <div
    className={`absolute hidden xl:block animate-float shadow-2xl z-0 ${className}`}
    style={{ animationDelay: delay }}
  >
    <BaseCard
      variant="solid"
      padding="sm"
      rounded="xl"
      className="bg-dark/90 border-white/10 backdrop-blur-md"
    >
      <div className="flex gap-1 mb-2 opacity-50">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
      </div>
      <div className="font-mono text-[10px] text-emerald-400/80">
        <div className="flex items-center gap-1.5">
          <span className="text-secondary">$</span> npm run build
        </div>
        <div className="text-white/40 mt-1">✓ optimized chunks</div>
        <div className="text-white/40 italic">deploying to cloud...</div>
      </div>
    </BaseCard>
  </div>
);

export const FloatingDatabase: React.FC<{ delay?: string; className?: string }> = ({
  delay = '1s',
  className = '',
}) => (
  <div
    className={`absolute hidden xl:block animate-float shadow-2xl z-0 ${className}`}
    style={{ animationDelay: delay }}
  >
    <BaseCard
      variant="solid"
      padding="sm"
      rounded="xl"
      className="bg-white/60 backdrop-blur-md border-white/50"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Database size={16} />
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-none mb-0.5">
            Uptime
          </div>
          <div className="text-xs font-black text-dark">99.99%</div>
        </div>
      </div>
    </BaseCard>
  </div>
);

export const TechDecorations: React.FC = () => (
  <>
    {/* Positioned at the very edges of the screen to stay clear of text and main visual */}
    <FloatingTerminal
      className="top-[15%] left-4 2xl:left-12 opacity-40 hover:opacity-100 transition-opacity"
      delay="0s"
    />
    <FloatingDatabase
      className="bottom-[25%] left-8 2xl:left-24 opacity-40 hover:opacity-100 transition-opacity"
      delay="1.5s"
    />

    {/* Large background elements moved to the far right, deep in the background */}
    <div className="absolute top-[10%] right-[-5%] text-primary/5 animate-pulse hidden xl:block pointer-events-none">
      <Code2 size={240} />
    </div>
    <div
      className="absolute bottom-[10%] right-[5%] text-secondary/5 animate-float hidden xl:block pointer-events-none"
      style={{ animationDelay: '2s' }}
    >
      <ShieldCheck size={160} />
    </div>
  </>
);
