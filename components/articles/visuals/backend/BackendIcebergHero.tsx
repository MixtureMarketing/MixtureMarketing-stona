import React, { useState, useEffect } from 'react';
import { Globe, Server, Database, Lock, Workflow, Cpu, Zap } from 'lucide-react';

const BackendIcebergHero = () => {
  const [bubbles, setBubbles] = useState<{ left: number; delay: number; duration: number }[]>([]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setBubbles(
        [...Array(15)].map(() => ({
          left: Math.random() * 100,
          delay: Math.random() * 10,
          duration: 10 + Math.random() * 10,
        })),
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full bg-[#020617] rounded-[3rem] p-8 md:p-16 overflow-hidden border border-white/10 shadow-2xl min-h-[600px] md:min-h-[850px] flex flex-col items-center group font-sans">
      <div className="absolute inset-0 bg-[#020617] opacity-80 z-0">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#61B6DE 1px, transparent 1px), linear-gradient(90deg, #61B6DE 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]"></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-blue-900/20 blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[35%] w-full h-[2px] bg-blue-400/20 z-30 flex items-center shadow-[0_0_20px_rgba(97,182,222,0.3)]">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
        <div className="absolute right-8 md:right-16 -top-8 bg-[#020617]/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-blue-400/30 text-xxs font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span> Powierzchnia
          UI
        </div>
      </div>
      <div className="relative z-20 w-full max-w-2xl h-full flex flex-col items-center mt-12 md:mt-0">
        <div className="relative z-40 animate-float-peak">
          <div className="w-64 h-48 md:w-80 md:h-64 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-blue-100 clip-iceberg-peak shadow-[0_0_50px_rgba(255,255,255,0.2)] border-t border-white/60"></div>
            <div className="relative z-10 flex flex-col items-center gap-2 mt-8 md:mt-12">
              <div className="w-12 h-12 bg-white/90 rounded-2xl flex items-center justify-center shadow-lg text-blue-600 mb-1">
                <Globe size={24} />
              </div>
              <div className="text-center">
                <div className="text-dark font-black uppercase tracking-[0.2em] text-sm m-0">
                  Frontend
                </div>
                <p className="text-blue-500 font-bold uppercase text-xxs tracking-widest mt-0.5 opacity-70">
                  To co widać
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full -mt-2 animate-float-base">
          <div className="relative bg-gradient-to-b from-blue-500/10 via-blue-900/60 to-[#020617] backdrop-blur-sm clip-iceberg-base border border-blue-400/10 shadow-[0_0_100px_rgba(59,130,246,0.15)] p-8 md:p-16 pt-24 pb-32">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center gap-3 bg-blue-950/50 px-5 py-2 rounded-full border border-blue-400/20 mb-10 backdrop-blur-md">
                <div className="text-blue-200 font-bold uppercase tracking-[0.2em] text-xxs m-0">
                  Fundament Backend
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10 w-full max-w-lg">
                {[
                  { icon: <Server size={20} />, label: 'Logika Biznesowa' },
                  { icon: <Database size={20} />, label: 'Bazy Danych' },
                  { icon: <Lock size={20} />, label: 'Bezpieczeństwo' },
                  { icon: <Workflow size={20} />, label: 'Integracje API' },
                  { icon: <Cpu size={20} />, label: 'Skalowanie' },
                  { icon: <Zap size={20} />, label: 'Wydajność' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-3 group/item transition-transform hover:-translate-y-1 duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-900/30 border border-blue-500/20 flex items-center justify-center text-blue-300 group-hover/item:bg-blue-500/20 group-hover/item:text-white group-hover/item:border-blue-400/50 transition-all shadow-lg shadow-blue-900/20">
                      {item.icon}
                    </div>
                    <span className="text-xxs font-bold text-blue-300/60 uppercase tracking-widest text-center group-hover/item:text-blue-200 transition-colors">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {bubbles.map((b, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-rise"
            style={{
              left: `${b.left}%`,
              bottom: '-10%',
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`,
            }}
          ></div>
        ))}
      </div>
      <style>{`
        .clip-iceberg-peak { clip-path: polygon(50% 0%, 85% 100%, 15% 100%); }
        .clip-iceberg-base { clip-path: polygon(15% 0%, 85% 0%, 100% 25%, 85% 90%, 50% 100%, 15% 90%, 0% 25%); }
        @keyframes float-peak { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-8px) rotate(0.5deg); } }
        @keyframes float-base { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(-0.5deg); } }
        .animate-float-peak { animation: float-peak 6s ease-in-out infinite; }
        .animate-float-base { animation: float-base 7s ease-in-out infinite; animation-delay: 0.5s; }
        @keyframes rise { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: translateY(-800px); opacity: 0; } }
        .animate-rise { animation: rise linear infinite; }
      `}</style>
    </div>
  );
};

export default BackendIcebergHero;
