/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  Cloud,
  Server,
  Box,
  Zap,
  Truck,
  Cpu,
  Code2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
} from 'lucide-react';

// --- HERO: GOPHER VS ELEPHANT ---
export const GoHeroVisual: React.FC = () => {
  return (
    <div className="relative w-full bg-[#00ADD8] rounded-[3rem] p-12 overflow-hidden border border-white/10 shadow-2xl min-h-[500px] flex flex-col md:flex-row items-center justify-around group">
      {/* Cloud Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E0F7FA] to-[#00ADD8]"></div>
      <div className="absolute top-10 right-10 opacity-30 animate-pulse delay-700">
        <Cloud size={100} color="white" />
      </div>
      <div className="absolute top-20 left-20 opacity-20 animate-pulse">
        <Cloud size={80} color="white" />
      </div>

      {/* Traditional Tech (Elephant) */}
      <div className="relative z-10 flex flex-col items-center gap-4 opacity-60 scale-90 grayscale group-hover:grayscale-0 transition-all duration-500">
        <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center relative border-4 border-gray-300 shadow-xl">
          <Database size={80} className="text-gray-500" />
          <div className="absolute -bottom-4 bg-gray-600 text-white text-xxs px-3 py-1 rounded-full font-bold uppercase tracking-widest">
            Heavy Monolith
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-white/80 font-bold text-lg">Tradycyjne Tech</h3>
          <p className="text-white/60 text-xs uppercase tracking-widest">Wysokie zużycie RAM</p>
        </div>
      </div>

      {/* VS Badge */}
      <div className="relative z-20 bg-white text-[#00ADD8] font-black text-xl w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform -rotate-6">
        VS
      </div>

      {/* Go Gopher */}
      <div className="relative z-10 flex flex-col items-center gap-6 scale-110 transform md:translate-y-[-20px]">
        <div className="w-56 h-56 bg-white rounded-full flex items-center justify-center relative border-4 border-[#CE3262] shadow-[0_0_50px_rgba(255,255,255,0.4)] overflow-hidden">
          <div className="absolute inset-0 bg-[#00ADD8]/10"></div>
          {/* Abstract Gopher Representation */}
          <div className="relative">
            <Box size={80} className="text-[#00ADD8] animate-bounce" />
            <div className="absolute -right-6 -top-2 bg-[#CE3262] text-white text-xxs px-2 py-0.5 rounded-full font-bold rotate-12">
              Fast!
            </div>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-white font-black text-3xl drop-shadow-md">Go (Golang)</h3>
          <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-white text-xxs font-black uppercase tracking-widest mt-2 border border-white/20">
            Cloud Native
          </div>
        </div>
      </div>
    </div>
  );
};

// --- RESOURCE EFFICIENCY: TRUCK VS DRONES ---
export const ResourceEfficiencyVisual: React.FC = () => {
  return (
    <div className="my-16 bg-slate-50 rounded-[2rem] p-8 md:p-12 border border-slate-200 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Java Threads */}
        <div className="relative group">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-700">Java Threads</h4>
              <p className="text-xs text-slate-500">Ciężkie procesy (Ciężarówka)</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-48 flex flex-col justify-center items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
            <Truck
              size={64}
              className="text-slate-300 group-hover:text-orange-500 transition-colors duration-500"
            />
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-orange-500 h-full w-[80%]"></div>
            </div>
            <span className="text-xs font-mono text-orange-600 font-bold">
              RAM Usage: ~8GB / 1k Users
            </span>
          </div>
        </div>

        {/* Go Goroutines */}
        <div className="relative group">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#00ADD8]/10 rounded-lg flex items-center justify-center text-[#00ADD8]">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-700">Go Goroutines</h4>
              <p className="text-xs text-slate-500">Lekkie Drony</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-48 flex flex-col justify-center items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#00ADD8]"></div>
            <div className="flex gap-2">
              <Zap size={24} className="text-[#00ADD8] animate-pulse" />
              <Zap size={24} className="text-[#00ADD8] animate-pulse delay-75" />
              <Zap size={24} className="text-[#00ADD8] animate-pulse delay-150" />
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-[#00ADD8] h-full w-[5%]"></div>
            </div>
            <span className="text-xs font-mono text-[#00ADD8] font-bold">
              RAM Usage: ~200MB / 1k Users
            </span>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold border border-green-100 inline-block w-full">
        Mniejsze zużycie RAM = Mniejszy rachunek za AWS
      </div>
    </div>
  );
};

// --- CODE BLOCK ---
export const GoCodeBlock: React.FC = () => {
  return (
    <div className="my-16 bg-[#1E1E1E] rounded-2xl p-6 shadow-2xl border border-gray-800 font-mono text-sm relative group overflow-hidden">
      <div className="absolute top-4 right-4 flex gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
      </div>
      <div className="mb-4 text-gray-500 text-xs font-bold uppercase tracking-widest">main.go</div>
      <pre className="text-gray-300 leading-relaxed overflow-x-auto">
        <code>
          <span className="text-gray-500">
            {'//'} Uruchomienie 100 000 współbieżnych zadań w Go
          </span>
          {'\n'}
          <span className="text-purple-400">func</span> <span className="text-blue-400">main</span>
          () {'{'}
          {'\n'}
          {'  '}
          <span className="text-purple-400">for</span> i :={' '}
          <span className="text-green-400">0</span>; i &lt;{' '}
          <span className="text-green-400">100000</span>; i++ {'{'}
          {'\n'}
          {'    '}
          <span className="text-purple-400">go</span> <span className="text-blue-400">doWork</span>
          (i) <span className="text-gray-500">{'//'} "go" uruchamia Goroutine</span>
          {'\n'}
          {'  '}
          {'}'}
          {'\n'}
          {'  '}time.<span className="text-blue-400">Sleep</span>(time.Second){'\n'}
          {'}'}
        </code>
      </pre>
      <div className="mt-4 pt-4 border-t border-gray-800 text-green-400 text-xs flex items-center gap-2">
        <CheckCircle2 size={14} /> Ten kod nie "zabije" Twojego laptopa. W Javie by to zrobił.
      </div>
    </div>
  );
};

// --- PERFORMANCE COMPARISON TABLE ---
export const GoPerformanceComparison: React.FC = () => {
  return (
    <div className="my-16 overflow-x-auto rounded-2xl border border-gray-200 shadow-lg">
      <table className="w-full text-left bg-white">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 text-xs font-black uppercase text-gray-500">Cecha</th>
            <th className="p-4 text-xs font-black uppercase text-[#68A063]">Node.js</th>
            <th className="p-4 text-xs font-black uppercase text-[#EA2D2E]">Java</th>
            <th className="p-4 text-xs font-black uppercase text-[#00ADD8]">Go (Golang)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          <tr>
            <td className="p-4 font-bold text-slate-700">Wydajność CPU</td>
            <td className="p-4 text-gray-600">Średnia (jeden wątek)</td>
            <td className="p-4 text-gray-600">Wysoka (ale "ciężka")</td>
            <td className="p-4 text-[#00ADD8] font-bold">Bardzo Wysoka</td>
          </tr>
          <tr>
            <td className="p-4 font-bold text-slate-700">Zużycie Pamięci</td>
            <td className="p-4 text-gray-600">Średnie</td>
            <td className="p-4 text-red-500">Wysokie</td>
            <td className="p-4 text-[#00ADD8] font-bold">Bardzo Niskie</td>
          </tr>
          <tr>
            <td className="p-4 font-bold text-slate-700">Start Aplikacji</td>
            <td className="p-4 text-[#00ADD8] font-bold">Szybki</td>
            <td className="p-4 text-red-500">Wolny (JVM warmup)</td>
            <td className="p-4 text-[#00ADD8] font-bold">Błyskawiczny</td>
          </tr>
          <tr>
            <td className="p-4 font-bold text-slate-700">Współbieżność</td>
            <td className="p-4 text-gray-600">Event Loop (I/O)</td>
            <td className="p-4 text-gray-600">Threads (skomplikowane)</td>
            <td className="p-4 text-[#00ADD8] font-bold">Goroutines (Rewolucyjne)</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
