import React from 'react';
import { Server, ShieldCheck } from 'lucide-react';
import { useParallax } from '../../../hooks/useParallax';

export const CorporateHeroVisual: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mousePos = useParallax(containerRef, 1);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg aspect-square flex items-center justify-center transition-transform duration-200 ease-out will-change-transform"
      style={{
        transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 20}px, 0) rotateX(${mousePos.y * -5}deg) rotateY(${mousePos.x * 5}deg)`,
      }}
    >
      <div className="absolute inset-0 rounded-full border border-dashed border-gray-200 animate-spin-slow opacity-40"></div>
      <svg
        className="w-full h-full relative z-10 drop-shadow-[0_0_30px_rgba(63,61,145,0.15)]"
        viewBox="0 0 400 400"
      >
        <g opacity="0.4">
          <path
            d="M 200 200 L 80 80 M 200 200 L 320 80 M 200 200 L 80 320 M 200 200 L 320 320"
            stroke="#61B6DE"
            strokeWidth="1"
            fill="none"
          />
        </g>
        {[
          { x: 200, y: 60 },
          { x: 60, y: 200 },
          { x: 340, y: 200 },
          { x: 200, y: 340 },
        ].map((node, i) => (
          <g key={i}>
            <circle cx={node.x} cy={node.y} r="5" fill="white" stroke="#3F3D91" strokeWidth="2" />
            <circle
              cx={node.x}
              cy={node.y}
              r="10"
              fill="#3F3D91"
              opacity="0.05"
              className="animate-ping"
            />
          </g>
        ))}
        <rect
          x="175"
          y="175"
          width="50"
          height="50"
          rx="12"
          fill="#3F3D91"
          className="animate-pulse"
        />
        <Server x="188" y="188" size={24} className="text-primary" />
      </svg>
      <div className="absolute top-0 right-0 p-4 bg-white/80 backdrop-blur shadow-xl rounded-2xl border border-gray-100 animate-float">
        <ShieldCheck size={16} className="text-emerald-500" />
      </div>
    </div>
  );
};
