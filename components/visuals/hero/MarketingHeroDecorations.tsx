import React from 'react';
import { TrendingUp, Target, MousePointerClick, DollarSign } from 'lucide-react';
import BaseCard from '../../common/BaseCard';

export const FloatingRoas: React.FC<{ delay?: string; className?: string }> = ({ delay = '0s', className = '' }) => (
  <div
    className={`absolute hidden xl:block animate-float shadow-2xl z-0 ${className}`}
    style={{ animationDelay: delay }}
  >
    <BaseCard variant="solid" padding="sm" rounded="xl" className="bg-white/80 backdrop-blur-md border-white/50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
          <TrendingUp size={16} />
        </div>
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">ROAS Avg</div>
          <div className="text-xs font-black text-dark">850%</div>
        </div>
      </div>
    </BaseCard>
  </div>
);

export const FloatingCpa: React.FC<{ delay?: string; className?: string }> = ({ delay = '1s', className = '' }) => (
  <div
    className={`absolute hidden xl:block animate-float shadow-2xl z-0 ${className}`}
    style={{ animationDelay: delay }}
  >
    <BaseCard variant="solid" padding="sm" rounded="xl" className="bg-white/90 border-white/50 backdrop-blur-lg">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <DollarSign size={16} />
        </div>
        <div>
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-0.5">CPA Optimized</div>
          <div className="text-xs font-black text-dark">-24% YoY</div>
        </div>
      </div>
    </BaseCard>
  </div>
);

export const MarketingDecorations: React.FC = () => (
  <>
    <FloatingRoas className="top-[15%] left-4 2xl:left-12 opacity-60 hover:opacity-100 transition-opacity" delay="0s" />
    <FloatingCpa className="bottom-[25%] left-8 2xl:left-24 opacity-60 hover:opacity-100 transition-opacity" delay="1.5s" />
    
    {/* Large background elements */}
    <div className="absolute top-[15%] right-[-2%] text-secondary/5 animate-pulse hidden xl:block pointer-events-none">
      <Target size={220} />
    </div>
    <div className="absolute bottom-[10%] right-[8%] text-primary/5 animate-float hidden xl:block pointer-events-none" style={{ animationDelay: '2s' }}>
      <MousePointerClick size={140} />
    </div>
  </>
);
