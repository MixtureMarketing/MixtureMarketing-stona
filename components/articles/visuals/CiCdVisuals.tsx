import React from 'react';
import { Server, Rocket, Settings, ShieldCheck, ArrowRight, Code2 } from 'lucide-react';

export const CiCdHeroVisual = () => {
  return (
    <div className="relative w-full bg-[#0F172A] rounded-[3rem] p-8 md:p-16 overflow-hidden border border-white/10 shadow-2xl min-h-[450px] flex items-center justify-center group">
      <div className="absolute inset-0 bg-tech-grid opacity-[0.08] transform scale-150 rotate-12"></div>

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent animate-scan-line"></div>
        <div
          className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-scan-line"
          style={{ animationDelay: '1.5s' }}
        ></div>
        <div
          className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent animate-scan-line"
          style={{ animationDelay: '3s' }}
        ></div>
      </div>

      <div className="relative z-20 flex flex-col items-center">
        <div className="relative w-56 h-56 md:w-64 md:h-56 flex items-center justify-center">
          <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping opacity-20"></div>
          <div
            className="absolute inset-4 bg-blue-500/5 rounded-full animate-ping opacity-10"
            style={{ animationDelay: '0.5s' }}
          ></div>

          <div className="relative w-48 h-48 bg-gray-800 rounded-[2.5rem] border-8 border-gray-700 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex items-center justify-center group/panel cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/panel:opacity-100 transition-opacity duration-500"></div>

            <div className="w-32 h-32 bg-green-500 rounded-full shadow-[0_0_40px_rgba(34,197,94,0.4),inset_0_4px_10px_rgba(255,255,255,0.4)] flex flex-col items-center justify-center relative active:scale-90 transition-transform duration-100 group-hover/panel:bg-green-400 group-hover/panel:shadow-[0_0_60px_rgba(34,197,94,0.6)]">
              <Rocket size={40} className="text-white mb-1 drop-shadow-lg animate-bounce-gentle" />
              <span className="text-white font-black text-xl uppercase tracking-widest">
                Deploy
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-3 items-center">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500/40 rounded-full"></div>
            <div className="w-2 h-2 bg-green-500/20 rounded-full"></div>
          </div>
          <span className="text-green-400 font-mono text-xxs uppercase tracking-[0.3em] font-bold">
            Pipeline Ready
          </span>
        </div>
      </div>

      <style>{`
                 @keyframes scan-line {
                     0% { transform: translateX(-100%) skewX(-45deg); opacity: 0; }
                     50% { opacity: 1; }
                     100% { transform: translateX(100%) skewX(-45deg); opacity: 0; }
                 }
                 .animate-scan-line {
                     animation: scan-line 6s linear infinite;
                 }
                 @keyframes bounce-gentle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                 }
                 .animate-bounce-gentle {
                    animation: bounce-gentle 3s ease-in-out infinite;
                 }
             `}</style>
    </div>
  );
};

export const PipelineVisual = () => {
  return (
    <div className="bg-[#1E293B] rounded-[3rem] p-8 md:p-12 border border-gray-700 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-tech-grid opacity-[0.03]"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-4 py-8">
        <div className="absolute top-[40px] left-0 w-full h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 hidden md:block"></div>

        <div className="flex flex-col items-center gap-4 group/item w-full md:w-auto">
          <div className="w-20 h-20 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-3 relative z-10">
            <Code2 size={32} />
          </div>
          <div className="text-center">
            <div className="font-black text-white uppercase text-xxs tracking-widest mb-1">
              1. Code
            </div>
            <div className="text-xxs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10 uppercase font-bold">
              Git Push
            </div>
          </div>
        </div>

        <div className="text-blue-500/30 md:mt-[-40px] animate-pulse rotate-90 md:rotate-0">
          <ArrowRight size={24} />
        </div>

        <div className="flex flex-col items-center gap-4 group/item w-full md:w-auto">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white transition-all duration-500 group-hover/item:scale-110 group-hover/item:-rotate-3 relative z-10 animate-pulse">
            <Settings size={32} className="animate-spin-slow" />
          </div>
          <div className="text-center">
            <div className="font-black text-white uppercase text-xxs tracking-widest mb-1">
              2. Build (CI)
            </div>
            <div className="text-xxs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10 uppercase font-bold">
              Compilation
            </div>
          </div>
        </div>

        <div className="text-blue-500/30 md:mt-[-40px] animate-pulse rotate-90 md:rotate-0">
          <ArrowRight size={24} />
        </div>

        <div className="flex flex-col items-center gap-4 group/item w-full md:w-auto">
          <div className="w-20 h-20 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white transition-all duration-500 group-hover/item:scale-110 relative z-10">
            <ShieldCheck size={32} />
          </div>
          <div className="text-center">
            <div className="font-black text-white uppercase text-xxs tracking-widest mb-1">
              3. Test (CI)
            </div>
            <div className="text-xxs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10 uppercase font-bold">
              Unit & Integration
            </div>
          </div>
        </div>

        <div className="text-blue-500/30 md:mt-[-40px] animate-pulse rotate-90 md:rotate-0">
          <ArrowRight size={24} />
        </div>

        <div className="flex flex-col items-center gap-4 group/item w-full md:w-auto">
          <div className="w-20 h-20 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl border-4 border-white transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-6 relative z-10">
            <Server size={32} />
          </div>
          <div className="text-center">
            <div className="font-black text-white uppercase text-xxs tracking-widest mb-1">
              4. Prod (CD)
            </div>
            <div className="text-xxs text-white bg-emerald-600 px-3 py-1 rounded-full font-black uppercase tracking-tighter animate-pulse shadow-lg">
              System Live
            </div>
          </div>
        </div>
      </div>

      <style>{`
                .animate-spin-slow {
                    animation: spin 4s linear infinite;
                }
            `}</style>
    </div>
  );
};
