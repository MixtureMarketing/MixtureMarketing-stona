import React from 'react';
import {
  ShieldCheck,
  Database,
  Code2,
  Zap,
  Settings,
  Layers,
  Cpu,
  Server,
  TrendingDown,
  Clock,
  Box,
  RefreshCw,
  Feather,
  Anchor,
} from 'lucide-react';

export const DockerHeroVisual = () => {
  return (
    <div className="relative w-full bg-[#0F172A] rounded-[3rem] p-6 md:p-12 overflow-hidden shadow-2xl min-h-[600px] flex flex-col items-center border border-white/10 group">
      <div className="absolute inset-0 bg-tech-grid opacity-[0.03]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-500/10 via-transparent to-transparent"></div>

      <div className="relative z-30 text-center mb-16 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xxs font-black uppercase tracking-[0.2em] mb-4">
          <ShieldCheck size={12} /> Standard Izolacji 2025
        </div>
        <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
          Architektura <span className="text-blue-400">Niezawodności</span>
        </h3>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
          Docker to nie tylko kontenery. To kompletny system, który izoluje Twoją aplikację od
          problemów serwerowych, gwarantując jej działanie w każdych warunkach.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
        <div className="grid grid-cols-3 gap-4 md:gap-8 mb-12 w-full max-w-xl relative z-20">
          <div
            className="flex flex-col items-center gap-3 animate-float-slow"
            style={{ animationDelay: '0s' }}
          >
            <div className="w-full aspect-square bg-indigo-600/20 rounded-2xl border-2 border-indigo-500/40 flex items-center justify-center shadow-lg group-hover:bg-indigo-600/30 transition-colors">
              <Database size={28} className="text-indigo-400" />
            </div>
            <span className="text-xxs font-black text-indigo-300 uppercase tracking-widest">
              Database
            </span>
          </div>

          <div
            className="flex flex-col items-center gap-3 animate-float-slow"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="w-full aspect-square bg-blue-500 rounded-2xl border-4 border-white shadow-[0_0_40px_rgba(59,130,246,0.5)] flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-white/30"></div>
              <Code2 size={36} className="text-white drop-shadow-md" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
            </div>
            <span className="text-xxs font-black text-white uppercase tracking-widest bg-blue-600 px-3 py-1 rounded-full shadow-lg">
              App Core
            </span>
          </div>

          <div
            className="flex flex-col items-center gap-3 animate-float-slow"
            style={{ animationDelay: '1s' }}
          >
            <div className="w-full aspect-square bg-cyan-600/20 rounded-2xl border-2 border-cyan-500/40 flex items-center justify-center shadow-lg group-hover:bg-cyan-600/30 transition-colors">
              <Zap size={28} className="text-cyan-400" />
            </div>
            <span className="text-xxs font-black text-cyan-300 uppercase tracking-widest">
              API Layer
            </span>
          </div>
        </div>

        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 mb-8 relative group-hover:border-blue-500/30 transition-colors duration-700">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F172A] px-4 py-1 rounded-full border border-white/10 text-xxs font-black text-blue-400 uppercase tracking-[0.3em]">
            Docker Runtime Engine
          </div>
          <div className="flex items-center justify-around opacity-40">
            <Settings size={20} className="text-gray-400 animate-spin-slow" />
            <Layers size={20} className="text-gray-400" />
            <Cpu size={20} className="text-gray-400" />
            <ShieldCheck size={20} className="text-gray-400" />
          </div>
        </div>

        <div className="w-full max-w-3xl h-16 bg-dark rounded-2xl border-b-4 border-blue-900 flex items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-tech-grid opacity-20"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
            <span className="text-xxs font-black text-white/40 uppercase tracking-[0.5em]">
              Physical Infrastructure / Cloud Host
            </span>
          </div>
        </div>
      </div>

      <style>{`
                @keyframes float-docker {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                .animate-float-slow {
                    animation: float-docker 5s ease-in-out infinite;
                }
                .animate-spin-slow {
                    animation: spin 10s linear infinite;
                }
             `}</style>
    </div>
  );
};

export const DockerVsVmVisual = () => {
  return (
    <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-tech-grid opacity-[0.02]"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:divide-x divide-gray-100 relative z-10">
        <div className="flex flex-col items-center text-center p-4 group/vm">
          <div className="mb-8 relative">
            <div className="w-36 h-36 bg-gray-100 rounded-3xl flex items-center justify-center border-4 border-gray-200 shadow-inner group-hover/vm:bg-gray-200 transition-colors">
              <Server size={56} className="text-gray-400" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-xxs font-black uppercase border border-red-200 shadow-sm flex items-center gap-2">
              <TrendingDown size={14} /> Heavy (GB)
            </div>
          </div>
          <h3 className="text-xl font-bold text-dark mb-2">Maszyna Wirtualna</h3>
          <p className="text-xxs text-gray-400 font-black uppercase tracking-[0.2em] mb-8">
            Model Tradycyjny
          </p>

          <ul className="space-y-4 text-sm text-gray-600 text-left w-full max-w-xs mx-auto">
            <li className="flex items-center gap-3">
              <Clock size={18} className="text-red-400" /> Start: Kilka minut
            </li>
            <li className="flex items-center gap-3">
              <Settings size={18} className="text-red-400" /> Pełny system operacyjny w środku
            </li>
            <li className="flex items-center gap-3">
              <TrendingDown size={18} className="text-red-400" /> Wysokie zużycie zasobów (RAM/CPU)
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-center text-center p-4 group/docker">
          <div className="mb-8 relative">
            <div className="w-36 h-36 bg-[#2496ED] rounded-3xl flex items-center justify-center border-4 border-white shadow-2xl group-hover/docker:scale-105 transition-all relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 bg-grid-white/[0.2]"></div>
              <Box size={56} className="text-white drop-shadow-md" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-100 text-emerald-600 px-4 py-1.5 rounded-full text-xxs font-black uppercase border border-emerald-200 shadow-sm flex items-center gap-2">
              <Feather size={14} /> Light (MB)
            </div>
          </div>
          <h3 className="text-xl font-bold text-dark mb-2">Kontener Docker</h3>
          <p className="text-xxs text-[#2496ED] font-black uppercase tracking-[0.2em] mb-8">
            Model Nowoczesny
          </p>

          <ul className="space-y-4 text-sm text-gray-600 text-left w-full max-w-xs mx-auto">
            <li className="flex items-center gap-3">
              <Zap size={18} className="text-emerald-500" /> Start: Milisekundy
            </li>
            <li className="flex items-center gap-3">
              <RefreshCw size={18} className="text-emerald-500" /> Współdzielone jądro systemu
            </li>
            <li className="flex items-center gap-3">
              <TrendingDown size={18} className="text-emerald-500 rotate-180" /> Ekstremalna
              wydajność
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export const KubernetesVisual = () => {
  return (
    <div className="bg-[#0F172A] rounded-[3rem] p-8 md:p-16 overflow-hidden relative shadow-2xl flex flex-col items-center group border border-white/5">
      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-blue-900/20 to-transparent opacity-50 blur-3xl"></div>

      <div className="relative z-20 mb-16 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-[#326CE5]/20 blur-[40px] rounded-full animate-pulse"></div>
          <div className="w-28 h-28 bg-[#326CE5] rounded-[2rem] border-4 border-white/20 shadow-[0_0_50px_rgba(50,108,229,0.4)] flex items-center justify-center relative overflow-hidden group-hover:rotate-45 transition-transform duration-700">
            <Anchor size={48} className="text-white" />
            <div className="absolute inset-0 bg-tech-grid opacity-20"></div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-1 rounded-full text-blue-400 text-xxs font-black uppercase tracking-widest mb-2">
            Control Plane
          </div>
          <h4 className="text-white font-bold text-lg m-0 tracking-tight">K8s Cluster Master</h4>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-wrap justify-center gap-8 md:gap-12">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-4 animate-float-k8s"
            style={{ animationDelay: `${i * 0.5}s` }}
          >
            <div className="relative group/node">
              <div className="absolute -inset-2 bg-emerald-500/0 border border-emerald-500/0 rounded-xl group-hover/node:bg-emerald-500/10 group-hover/node:border-emerald-500/30 transition-all"></div>
              <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center shadow-xl group-hover/node:scale-110 transition-transform">
                <Box size={24} className="text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0F172A] animate-pulse shadow-[0_0_10px_#10b981]"></div>
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-blue-500/50 to-transparent"></div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center relative z-20">
        <p className="text-white text-xl font-medium italic tracking-tight">
          "Gdy Docker dostarcza pudełka, Kubernetes buduje z nich imperium."
        </p>
        <p className="text-blue-300/50 text-xs mt-2 font-bold uppercase tracking-[0.2em]">
          Automatyczna skala, monitoring i samonaprawa systemu.
        </p>
      </div>

      <style>{`
                .animate-float-k8s {
                    animation: float-k8s 6s ease-in-out infinite;
                }
                @keyframes float-k8s {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
             `}</style>
    </div>
  );
};
