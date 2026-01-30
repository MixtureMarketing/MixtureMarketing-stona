import React from 'react';
import { Warehouse, CheckCircle2, XCircle, Layers, Zap, Database, Lock } from 'lucide-react';

const ArchitectureComparisonVisual = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-lg relative overflow-hidden group hover:border-blue-200 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[40px] opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Warehouse size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-dark m-0">Monolit</h4>
              <span className="text-xxs font-black uppercase text-blue-500 tracking-[0.2em]">
                Jedna Twierdza
              </span>
            </div>
          </div>
          <div className="w-full h-36 bg-gray-50 rounded-3xl mb-8 flex items-center justify-center p-4 border border-gray-100 group-hover:bg-white transition-colors">
            <div className="w-full h-full bg-blue-600 rounded-2xl border-4 border-white flex items-center justify-center shadow-xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 flex flex-wrap gap-1 p-2 opacity-20">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-white rounded-sm"></div>
                ))}
              </div>
              <span className="relative z-10 text-white font-black uppercase tracking-[0.3em] text-xs drop-shadow-md">
                Core System
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-emerald-100 rounded-full p-0.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                <strong>Zalety:</strong> Niższy koszt początkowy, szybkość budowy MVP, proste
                testowanie i wdrożenie.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-red-100 rounded-full p-0.5">
                <XCircle size={14} className="text-red-600" />
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                <strong>Wady:</strong> Trudniejsze skalowanie wybranych modułów, większe ryzyko przy
                zmianach w kodzie.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-lg relative overflow-hidden group hover:border-cyan-200 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full blur-[40px] opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Layers size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-dark m-0">Mikroserwisy</h4>
              <span className="text-xxs font-black uppercase text-cyan-500 tracking-[0.2em]">
                Sieć Miast
              </span>
            </div>
          </div>
          <div className="w-full h-36 bg-gray-50 rounded-3xl mb-8 flex items-center justify-center gap-4 px-4 border border-gray-100 group-hover:bg-white transition-colors">
            <div className="w-12 h-12 bg-cyan-500 rounded-xl border-2 border-white shadow-lg animate-bounce-slow flex items-center justify-center">
              <Zap size={16} className="text-white opacity-50" />
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl border-2 border-white shadow-lg animate-bounce-slow delay-150 flex items-center justify-center">
              <Database size={16} className="text-white opacity-50" />
            </div>
            <div className="w-12 h-12 bg-indigo-500 rounded-xl border-2 border-white shadow-lg animate-bounce-slow delay-300 flex items-center justify-center">
              <Lock size={16} className="text-white opacity-50" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-emerald-100 rounded-full p-0.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                <strong>Zalety:</strong> Niezależne skalowanie modułów, wysoka odporność na błędy
                całego systemu.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-red-100 rounded-full p-0.5">
                <XCircle size={14} className="text-red-600" />
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                <strong>Wady:</strong> Wysoki koszt utrzymania, ogromna złożoność operacyjna i
                wymagania DevOps.
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .animate-bounce-slow { animation: bounce-slow 3s infinite; }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .delay-150 { animation-delay: 0.15s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
};

export default ArchitectureComparisonVisual;
