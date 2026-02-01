import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useParallax } from '../../../hooks/useParallax';
import BaseCard from '../../common/BaseCard';

export const PrintHeroVisual: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mousePos = useParallax(containerRef, 1);
  const [activeLayer, setActiveLayer] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => setActiveLayer((prev) => (prev === 4 ? 0 : prev + 1)), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[320px] h-[350px] md:h-[400px] perspective-1000 group mx-auto"
      style={{ transform: 'scale(var(--hero-scale))' }}
    >
      {['cyan', 'magenta', 'yellow', 'black'].map((color, i) => (
        <BaseCard
          key={i}
          variant="solid"
          padding="none"
          rounded="xl"
          className="absolute inset-0 shadow-lg border-white/10 transition-all duration-1000 ease-in-out flex items-center justify-center overflow-hidden will-change-transform"
          style={{
            transform:
              activeLayer >= i
                ? `translateZ(${-i * 20}px) translateY(${i * 10}px) rotateY(-15deg) translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`
                : `translateZ(${-i * 100}px) translateY(${i * 100}px) rotateY(-15deg) opacity(0)`,
            opacity: activeLayer >= i ? 1 : 0,
            zIndex: 10 - i,
          }}
        >
          <div className="absolute top-4 left-4 text-xxs font-bold font-mono opacity-50 uppercase">
            {color[0]} Channel
          </div>
          <div
            className="w-32 h-32 md:w-48 md:h-48 rounded-full border-[15px] md:border-[20px]"
            style={{
              borderColor:
                color === 'black'
                  ? '#000'
                  : color === 'yellow'
                    ? '#FF0'
                    : color === 'magenta'
                      ? '#F0F'
                      : '#0FF',
              opacity: 0.5,
            }}
          ></div>
        </BaseCard>
      ))}
      <BaseCard
        variant="solid"
        padding="none"
        rounded="xl"
        className="absolute inset-0 bg-brand-yellow shadow-[0_0_50px_rgba(244,180,0,0.3)] flex items-center justify-center overflow-hidden transition-all duration-1000 will-change-transform"
        style={{
          transform: `translateZ(30px) translateX(40px) rotateY(-15deg) translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`,
          opacity: activeLayer === 4 ? 1 : 0,
          zIndex: 20,
        }}
      >
        <div className="text-deep-dark text-center">
          <ShoppingCart size={40} className="mx-auto mb-4 md:w-12 md:h-12" />
          <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest">Premium</h3>
        </div>
      </BaseCard>
    </div>
  );
};
