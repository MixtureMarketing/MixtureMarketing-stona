import React from 'react';
import { Image as ImageIcon, Play, ShoppingCart, Heart } from 'lucide-react';

interface FunnelVisualProps {
  funnelStep: number;
  particles: { left: number; top: number; delay: number; duration: number }[];
  funnelStages: {
    icon: React.ReactNode;
    color: string;
    step: string;
    label: string;
    desc: string;
  }[];
}

const FunnelVisual: React.FC<FunnelVisualProps> = ({ funnelStep, particles, funnelStages }) => {
  return (
    <div className="lg:col-span-7 relative">
      <div className="relative h-[700px] flex flex-col items-center justify-center perspective-[2500px]">
        <div className="absolute inset-0 z-0 pointer-events-none flex flex-col items-center justify-center">
          <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-primary/0 via-primary/20 to-[#00C853]/0 blur-sm"></div>
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((p, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white opacity-40 animate-funnel-particle"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="relative w-full space-y-[-20px]">
          {funnelStages.map((stage, i) => {
            const isActive = i === funnelStep;
            const scale = 1 - i * 0.15;
            const rotation = 30;
            return (
              <div
                key={i}
                className="relative transition-all duration-1000 ease-spring"
                style={{
                  transform: `scale(${isActive ? scale + 0.08 : scale}) rotateX(${rotation}deg) translateZ(${isActive ? '40px' : '0px'})`,
                  zIndex: 10 - i,
                  opacity: isActive ? 1 : 0.3 + i * 0.1,
                }}
              >
                {i > 0 && (
                  <div
                    className="absolute -top-24 left-1/2 -translate-x-1/2 w-full h-24 border-x border-current opacity-10 pointer-events-none"
                    style={{
                      color: stage.color,
                      clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)',
                      background: `linear-gradient(to bottom, transparent, ${stage.color}20)`,
                    }}
                  ></div>
                )}

                <div
                  className={`relative w-full h-36 rounded-[3rem] border-2 transition-all duration-700 overflow-hidden group
                                        ${isActive ? 'bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-current' : 'bg-white/5 border-white/10 backdrop-blur-sm'}
                                    `}
                  style={{ color: stage.color }}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-current opacity-[0.03] animate-pulse"></div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-between px-16 md:px-24">
                    <div className="flex items-center gap-8">
                      <div
                        className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all duration-700 ${isActive ? 'rotate-0 scale-110' : '-rotate-12 scale-90 opacity-50'}`}
                        style={{
                          backgroundColor: stage.color,
                          boxShadow: `0 20px 40px -10px ${stage.color}60`,
                        }}
                      >
                        {React.cloneElement(stage.icon as React.ReactElement<{ size: number }>, {
                          size: 32,
                        })}
                      </div>

                      <div className="transition-transform duration-700">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xxs font-black uppercase tracking-[0.5em] opacity-40">
                            {stage.step}
                          </span>
                          {isActive && (
                            <div className="w-2 h-2 rounded-full bg-current animate-ping"></div>
                          )}
                        </div>
                        <h3
                          className={`text-3xl font-black tracking-tighter ${isActive ? 'text-dark' : 'text-white/40'}`}
                        >
                          {stage.label}
                        </h3>
                      </div>
                    </div>

                    <div
                      className={`hidden lg:flex gap-4 transition-all duration-700 ${isActive ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
                    >
                      {i === 0 && (
                        <div className="flex flex-col items-center gap-1">
                          <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-500">
                            <ImageIcon size={20} />
                          </div>
                          <span className="text-xxxs font-bold">ADS</span>
                        </div>
                      )}
                      {i === 1 && (
                        <div className="flex flex-col items-center gap-1">
                          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                            <Play size={20} />
                          </div>
                          <span className="text-xxxs font-bold">REELS</span>
                        </div>
                      )}
                      {i === 2 && (
                        <div className="flex flex-col items-center gap-1">
                          <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                            <ShoppingCart size={20} />
                          </div>
                          <span className="text-xxxs font-bold">SHOP</span>
                        </div>
                      )}
                      {i === 3 && (
                        <div className="flex flex-col items-center gap-1">
                          <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                            <Heart size={20} />
                          </div>
                          <span className="text-xxxs font-bold">LTV</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FunnelVisual;
