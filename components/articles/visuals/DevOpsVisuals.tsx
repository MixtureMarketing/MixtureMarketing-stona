import React from 'react';
import { Cloud, Container, Anchor, Workflow, Cpu, ArrowRight, GitBranch } from 'lucide-react';

export const DevOpsMetropolisVisual = () => {
  return (
    <div className="relative w-full bg-[#0F172A] rounded-[3rem] p-8 md:p-16 overflow-hidden border border-white/10 shadow-2xl min-h-[550px] flex items-center justify-center group">
      {/* Tech Grid Floor - Perspective */}
      <div className="absolute inset-0 bg-tech-grid opacity-[0.07] transform perspective-[1000px] rotateX(60deg) scale(2) translate-y-24"></div>

      {/* Dynamic Light Rays */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent animate-pulse"></div>
      <div
        className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>

      {/* Central Infrastructure Hub */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl scale-90 md:scale-100 transition-transform duration-1000 group-hover:scale-105">
        {/* 1. Cloud Base (AWS) */}
        <div className="absolute bottom-0 w-full h-[300px] bg-gradient-to-t from-orange-500/10 via-transparent to-transparent opacity-40 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-12 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 text-orange-500/60 font-black uppercase tracking-[0.6em] text-xxs">
            <div className="w-12 h-px bg-orange-500/30"></div>
            <Cloud size={16} /> AWS Infrastructure Core
            <div className="w-12 h-px bg-orange-500/30"></div>
          </div>
        </div>

        {/* 2. Pipeline Factory (CI/CD) - Floating Left */}
        <div className="absolute -left-12 top-1/4 flex flex-col items-center gap-3 animate-float-slow hidden md:flex">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse"></div>
            <div className="w-20 h-20 bg-green-500/10 backdrop-blur-md rounded-[1.5rem] border border-green-500/30 flex items-center justify-center shadow-2xl relative z-10">
              <Workflow size={32} className="text-green-400" />
            </div>
          </div>
          <span className="text-green-400/80 text-xxs font-black uppercase bg-green-900/40 border border-green-500/20 px-3 py-1 rounded-full tracking-widest">
            Pipeline Active
          </span>
        </div>

        {/* 3. Traffic Controller (Kubernetes) - Floating Right */}
        <div
          className="absolute -right-12 top-1/3 flex flex-col items-center gap-3 animate-float-slow hidden md:flex"
          style={{ animationDelay: '1.5s' }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse"></div>
            <div className="w-20 h-20 bg-indigo-500/10 backdrop-blur-md rounded-[1.5rem] border border-indigo-500/30 flex items-center justify-center shadow-2xl relative z-10 text-indigo-400">
              <Anchor size={32} />
            </div>
          </div>
          <span className="text-indigo-400/80 text-xxs font-black uppercase bg-indigo-900/40 border border-indigo-500/20 px-3 py-1 rounded-full tracking-widest">
            K8s Cluster Health: 100%
          </span>
        </div>

        {/* 4. Moving Data Units (Docker) - Main Interactive Center */}
        <div className="relative w-full max-w-lg h-[240px] flex flex-col items-center justify-center">
          {/* Circular Orbit for Containers */}
          <div className="absolute w-[320px] h-[120px] border border-white/5 rounded-[100%] rotateX(60deg) animate-spin-slow opacity-20"></div>
          <div className="absolute w-[280px] h-[100px] border border-white/10 rounded-[100%] rotateX(60deg) animate-spin-slow opacity-10 reverse"></div>

          {/* The Stack */}
          <div className="relative z-20 flex flex-col items-center gap-1">
            <div className="w-24 h-12 bg-blue-500/80 rounded-t-lg border-t-2 border-x-2 border-white/30 shadow-[0_-10px_30px_rgba(59,130,246,0.3)] flex items-center justify-center animate-bounce-gentle">
              <Container size={20} className="text-white" />
            </div>
            <div className="w-28 h-12 bg-blue-600/90 border-x-2 border-white/20 shadow-xl flex items-center justify-center">
              <Container size={20} className="text-blue-200" />
            </div>
            <div className="w-32 h-12 bg-blue-700 rounded-b-lg border-b-2 border-x-2 border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-tech-grid opacity-20"></div>
              <Container size={20} className="text-blue-300" />
            </div>
          </div>

          {/* Particle Effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full animate-ping opacity-20"></div>
        </div>

        <div className="mt-8 text-center max-w-lg relative z-30">
          <h3 className="text-2xl font-bold text-white mb-2 italic drop-shadow-lg tracking-tight">
            "Stabilność to owoc automatyzacji."
          </h3>
          <p className="text-blue-200/70 text-sm leading-relaxed">
            Sama aplikacja to tylko silnik. DevOps to system smarowania i chłodzenia, który pozwala
            mu pracować na najwyższych obrotach 24/7.
          </p>
        </div>
      </div>

      <style>{`
                @keyframes bounce-gentle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-bounce-gentle {
                    animation: bounce-gentle 3s ease-in-out infinite;
                }
                .animate-spin-slow {
                    animation: spin 15s linear infinite;
                }
                .reverse { animation-direction: reverse; }
                .animate-float-slow {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-15px) translateX(5px); }
                }
             `}</style>
    </div>
  );
};

export const DevOpsProcessVisual = () => {
  return (
    <div className="bg-[#1E293B] rounded-[3rem] p-8 md:p-12 border border-gray-700 shadow-2xl relative overflow-hidden group">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-tech-grid opacity-[0.03]"></div>

      {/* Main Container - Flexible grid/flex for mobile */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-4 py-8">
        {/* Horizontal Connection Line - Hidden on Mobile, Fixed z-index */}
        <div className="absolute top-[40px] left-0 w-full h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 z-0 hidden md:block"></div>

        {/* Step 1: Dev */}
        <div className="relative z-10 flex flex-col items-center gap-4 group/step w-full md:w-auto">
          <div className="w-20 h-20 bg-white text-gray-900 rounded-[1.5rem] flex items-center justify-center shadow-2xl border-4 border-gray-600 transition-all duration-500 group-hover/step:scale-110 group-hover/step:border-primary group-hover/step:rotate-3">
            <Cpu size={32} />
          </div>
          <div className="text-center">
            <div className="bg-gray-800 text-white px-4 py-1 rounded-full text-xxs font-black uppercase tracking-widest border border-gray-600 mb-1">
              1. Dev (Kod)
            </div>
            <div className="text-xxs text-gray-500 font-bold uppercase tracking-tight">
              Stacja robocza
            </div>
          </div>
        </div>

        {/* Arrow 1 */}
        <div className="text-blue-500/40 md:mt-[-40px] animate-pulse rotate-90 md:rotate-0">
          <ArrowRight size={24} />
        </div>

        {/* Step 2: Git */}
        <div className="relative z-10 flex flex-col items-center gap-4 group/step w-full md:w-auto">
          <div className="w-16 h-16 bg-[#F05032] text-white rounded-xl flex items-center justify-center shadow-xl border-2 border-white/20 transition-all duration-500 group-hover/step:scale-110 group-hover/step:-rotate-3 group-hover/step:shadow-[#F05032]/20">
            <GitBranch size={28} />
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xxs font-black uppercase tracking-[0.2em]">
              Repozytorium
            </div>
            <div className="text-xxs text-gray-500 italic mt-1 leading-tight">
              Wersjonowanie & Review
            </div>
          </div>
        </div>

        {/* Arrow 2 */}
        <div className="text-blue-500/40 md:mt-[-40px] animate-pulse rotate-90 md:rotate-0">
          <ArrowRight size={24} />
        </div>

        {/* Step 3: CI/CD Pipeline */}
        <div className="relative z-10 p-6 bg-green-900/20 rounded-[2rem] border border-green-500/30 flex flex-col items-center gap-3 group/step w-full md:w-auto transition-all duration-500 group-hover/step:bg-green-900/30 group-hover/step:border-green-500/50">
          <div className="text-xxs font-black uppercase text-green-400 tracking-[0.3em] mb-1">
            Fabryka Jakości
          </div>
          <div className="flex gap-3">
            <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse">
              <Workflow size={24} />
            </div>
            <div className="flex items-center text-green-500/50">
              <ArrowRight size={16} />
            </div>
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg relative overflow-hidden">
              <Container size={24} />
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/step:translate-y-0 transition-transform duration-700"></div>
            </div>
          </div>
          <div className="bg-green-800/80 text-white px-4 py-1 rounded-full text-xxs font-black tracking-widest uppercase">
            2. Automat
          </div>
        </div>

        {/* Arrow 3 */}
        <div className="text-blue-500/40 md:mt-[-40px] animate-pulse rotate-90 md:rotate-0">
          <ArrowRight size={24} />
        </div>

        {/* Step 4: Cloud & Deployment */}
        <div className="relative z-10 flex flex-col items-center gap-4 group/step w-full md:w-auto">
          <div className="flex gap-[-10px]">
            <div className="w-16 h-16 bg-[#FF9900] text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 transition-all duration-500 group-hover/step:scale-110 z-20">
              <Cloud size={28} />
            </div>
            <div className="w-16 h-16 bg-[#326CE5] text-white rounded-[1rem] flex items-center justify-center shadow-2xl border-4 border-white/20 transition-all duration-500 group-hover/step:scale-110 z-10 -ml-4 mt-2">
              <Anchor size={28} />
            </div>
          </div>
          <div className="text-center">
            <div className="bg-orange-800/80 text-white px-4 py-1 rounded-full text-xxs font-black tracking-widest uppercase mb-1">
              3. Cloud Ready
            </div>
            <div className="text-xxs text-gray-500 font-bold uppercase tracking-tight">
              Skala & Monitoring
            </div>
          </div>
        </div>

        {/* Final Status Badge - Relative to container */}
        <div className="md:absolute md:right-0 md:top-0 bg-emerald-500 text-white text-xxs font-black px-4 py-2 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-bounce mt-4 md:mt-0 tracking-[0.2em] uppercase">
          System Live 24/7
        </div>
      </div>
    </div>
  );
};
