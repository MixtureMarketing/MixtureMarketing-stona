import React, { useState } from 'react';
import {
  Database,
  Search,
  CreditCard,
  LogIn,
  Layout,
  Zap,
  Clock,
  ArrowRight,
  Code2,
  Terminal,
  ShieldCheck,
  Server,
} from 'lucide-react';

// --- HERO: TIME TO MARKET CLOCK ---
export const LaravelHeroVisual: React.FC = () => {
  return (
    <div className="relative w-full bg-[#FF2D20] rounded-[3rem] p-12 overflow-hidden border border-white/10 shadow-2xl min-h-[500px] flex flex-col md:flex-row items-center justify-around group">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

      {/* Clock A: Others */}
      <div className="relative z-10 flex flex-col items-center gap-6 opacity-70 scale-90 blur-[1px] group-hover:blur-0 group-hover:opacity-100 transition-all duration-500">
        <div className="w-48 h-48 rounded-full border-4 border-white/30 flex items-center justify-center relative bg-white/5 backdrop-blur-sm">
          <div className="absolute inset-0 rounded-full border-t-4 border-white/60 rotate-45"></div>
          <div className="text-center">
            <span className="text-4xl font-black text-white block">6</span>
            <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
              Miesięcy
            </span>
          </div>
          {/* Clock Hands */}
          <div className="absolute top-1/2 left-1/2 w-1 h-16 bg-white/50 origin-bottom -translate-x-1/2 -translate-y-full rotate-[30deg]"></div>
          <div className="absolute top-1/2 left-1/2 w-1 h-12 bg-white/50 origin-bottom -translate-x-1/2 -translate-y-full rotate-[180deg]"></div>
        </div>
        <div className="text-center">
          <h3 className="text-white font-bold text-lg">Inne Technologie</h3>
          <p className="text-white/60 text-xs uppercase tracking-widest">
            Konfiguracja, Boilerplate...
          </p>
        </div>
      </div>

      {/* VS Badge */}
      <div className="relative z-20 bg-white text-[#FF2D20] font-black text-xl w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
        VS
      </div>

      {/* Clock B: Laravel */}
      <div className="relative z-10 flex flex-col items-center gap-6 scale-110 transform md:translate-y-[-20px]">
        <div className="w-56 h-56 rounded-full border-4 border-white flex items-center justify-center relative bg-white/10 backdrop-blur-md shadow-[0_0_50px_rgba(255,255,255,0.3)]">
          <div className="absolute inset-0 rounded-full border-t-4 border-white animate-spin-slow"></div>
          <div className="text-center">
            <span className="text-6xl font-black text-white block">2</span>
            <span className="text-sm font-bold text-white uppercase tracking-widest">Miesiące</span>
          </div>
          {/* Clock Hands Fast */}
          <div className="absolute top-1/2 left-1/2 w-1.5 h-20 bg-white origin-bottom -translate-x-1/2 -translate-y-full animate-[spin_2s_linear_infinite]"></div>
        </div>
        <div className="text-center">
          <h3 className="text-white font-bold text-2xl">Laravel</h3>
          <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-white text-xxs font-black uppercase tracking-widest mt-2 border border-white/20">
            MVP Ready
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ECOSYSTEM MAP ---
export const LaravelEcosystemMap: React.FC = () => {
  const features = [
    {
      id: 'nova',
      name: 'Nova / Filament',
      desc: 'Panel Administratora w 1 dzień. Zarządzanie użytkownikami, zasobami i raporty bez pisania frontend-u.',
      icon: <Layout size={24} className="text-purple-500" />,
      color: 'bg-purple-50 border-purple-100 hover:border-purple-300',
    },
    {
      id: 'cashier',
      name: 'Laravel Cashier',
      desc: 'Kompletna obsługa płatności Stripe/Paddle. Subskrypcje, faktury, okresy próbne prosto z pudełka.',
      icon: <CreditCard size={24} className="text-emerald-500" />,
      color: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300',
    },
    {
      id: 'socialite',
      name: 'Socialite',
      desc: 'Logowanie przez Facebook, Google, LinkedIn, GitHub. Jedna linijka konfiguracji zamiast tygodnia walki z OAuth.',
      icon: <LogIn size={24} className="text-blue-500" />,
      color: 'bg-blue-50 border-blue-100 hover:border-blue-300',
    },
    {
      id: 'scout',
      name: 'Laravel Scout',
      desc: 'Błyskawiczne wyszukiwanie pełnotekstowe (Full-Text Search). Algolia lub Meilisearch zintegrowane natywnie.',
      icon: <Search size={24} className="text-amber-500" />,
      color: 'bg-amber-50 border-amber-100 hover:border-amber-300',
    },
  ];

  return (
    <div className="my-16 grid grid-cols-1 md:grid-cols-2 gap-6">
      {features.map((feat) => (
        <div
          key={feat.id}
          className={`p-6 rounded-2xl border transition-all duration-300 cursor-default group ${feat.color}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">{feat.icon}</div>
            <ArrowRight
              size={16}
              className="opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-50 transition-all"
            />
          </div>
          <h3 className="text-lg font-bold text-dark mb-2">{feat.name}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{feat.desc}</p>
        </div>
      ))}
    </div>
  );
};

// --- ELOQUENT COMPARISON ---
export const EloquentComparison: React.FC = () => {
  return (
    <div className="my-16 bg-[#1E293B] rounded-[2rem] p-8 md:p-10 shadow-2xl font-mono text-sm overflow-hidden relative border border-white/10">
      {/* Header Dots */}
      <div className="flex gap-2 mb-8 opacity-50">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
        {/* SQL Side */}
        <div className="opacity-50 blur-[0.5px] hover:opacity-100 hover:blur-0 transition-all duration-500">
          <div className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-4 flex items-center gap-2">
            <Database size={12} /> Raw SQL (The Hard Way)
          </div>
          <div className="text-gray-300 leading-relaxed">
            <span className="text-purple-400">SELECT</span> *{' '}
            <span className="text-purple-400">FROM</span> users <br />
            <span className="text-purple-400">WHERE</span> active = 1 <br />
            <span className="text-purple-400">AND</span> age &gt; 25 <br />
            <span className="text-purple-400">ORDER BY</span> created_at{' '}
            <span className="text-purple-400">DESC</span> <br />
            <span className="text-purple-400">LIMIT</span> 5;
          </div>
        </div>

        {/* Eloquent Side */}
        <div className="relative">
          <div className="absolute -inset-4 bg-[#FF2D20]/10 rounded-xl blur-lg"></div>
          <div className="relative z-10">
            <div className="text-xs text-[#FF2D20] uppercase font-bold tracking-widest mb-4 flex items-center gap-2">
              <Code2 size={12} /> Eloquent ORM (The Laravel Way)
            </div>
            <div className="text-white leading-loose font-bold">
              <span className="text-[#FF2D20]">$users</span> = User::
              <span className="text-yellow-400">where</span>(
              <span className="text-green-400">'active'</span>,{' '}
              <span className="text-blue-400">true</span>)<br />
              &nbsp;&nbsp;-&gt;<span className="text-yellow-400">where</span>(
              <span className="text-green-400">'age'</span>,{' '}
              <span className="text-green-400">'&gt;'</span>,{' '}
              <span className="text-blue-400">25</span>)<br />
              &nbsp;&nbsp;-&gt;<span className="text-yellow-400">latest</span>()
              <br />
              &nbsp;&nbsp;-&gt;<span className="text-yellow-400">take</span>(
              <span className="text-blue-400">5</span>)<br />
              &nbsp;&nbsp;-&gt;<span className="text-yellow-400">get</span>();
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-500 text-xs italic">
        "Kod, który czyta się jak zdanie w języku angielskim."
      </div>
    </div>
  );
};

// --- OCTANE PERFORMANCE ---
export const LaravelPerformanceChart: React.FC = () => {
  return (
    <div className="my-16 p-8 bg-white rounded-[2rem] border border-gray-200 shadow-xl overflow-hidden relative">
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        <div className="flex-1">
          <h4 className="text-2xl font-black text-dark mb-2">Laravel Octane</h4>
          <p className="text-sm text-gray-600 mb-6">
            Dzięki Octane i serwerowi Swoole/RoadRunner, aplikacja jest ładowana do pamięci RAM
            tylko raz.
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1">
                <span>Standard PHP (FPM)</span>
                <span>~200 req/sec</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-400 w-[10%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1 text-[#FF2D20]">
                <span>Laravel Octane</span>
                <span>~4000+ req/sec</span>
              </div>
              <div className="h-2 bg-[#FF2D20]/10 rounded-full overflow-hidden relative">
                <div className="absolute top-0 bottom-0 left-0 bg-[#FF2D20] w-[95%] shadow-[0_0_10px_#FF2D20] animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#FF2D20] blur-[40px] opacity-20 animate-pulse"></div>
            <Zap size={100} className="text-[#FF2D20] relative z-10" fill="currentColor" />
          </div>
        </div>
      </div>
    </div>
  );
};
