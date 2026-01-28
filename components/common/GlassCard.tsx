/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = memo(
  ({ children, className = '', hoverEffect = true, ...props }) => {
    return (
      <div
        className={`
        relative overflow-hidden
        bg-white/70 backdrop-blur-md 
        border border-white/50 
        shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] 
        rounded-2xl 
        transition-all duration-300 
        ${hoverEffect ? 'motion-safe:hover:scale-[1.02] motion-safe:hover:border-primary motion-safe:hover:shadow-[0_20px_40px_-15px_rgba(97,182,222,0.2)]' : ''} 
        ${className}
      `}
        {...props}
      >
        <div className="relative z-10 h-full flex flex-col">{children}</div>
      </div>
    );
  },
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;
