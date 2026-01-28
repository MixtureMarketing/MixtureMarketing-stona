import React, { useState, useEffect } from 'react';
import {
  Database,
  Table,
  FileJson,
  Server,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Zap,
  Maximize,
  Layers,
  Box,
  Truck,
  Wind,
  Infinity as InfinityIcon,
} from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';

// --- HERO: FLEXIBILITY ANIMATION ---
export const MongoHeroVisual: React.FC = () => {
  const [active, setActive] = useState<'sql' | 'mongo'>('sql');

  return (
    <div className="relative w-full bg-[#0B1120] rounded-[3rem] p-12 overflow-hidden border border-white/5 shadow-2xl min-h-[500px] flex items-center justify-center group">
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

      {/* Cosmic glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
        {/* Toggle */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-16">
          <button
            onClick={() => setActive('sql')}
            className={`px-8 py-3 rounded-xl text-xxs font-black uppercase tracking-widest transition-all ${active === 'sql' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Tradycyjny SQL
          </button>
          <button
            onClick={() => setActive('mongo')}
            className={`px-8 py-3 rounded-xl text-xxs font-black uppercase tracking-widest transition-all ${active === 'mongo' ? 'bg-[#00ED64] text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            MongoDB (NoSQL)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
          {/* Animation Container */}
          <div className="h-64 flex items-center justify-center relative">
            {active === 'sql' ? (
              <div className="flex flex-col items-center gap-8 animate-fade-in">
                {/* The Table */}
                <div className="grid grid-cols-3 gap-1 p-2 bg-white/5 border border-white/10 rounded-lg">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 md:w-12 md:h-12 border border-white/10 flex items-center justify-center"
                    >
                      <div className="w-4 h-4 bg-gray-700 rounded-sm"></div>
                    </div>
                  ))}
                </div>
                {/* The Peg */}
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-dashed border-red-500 rounded-full animate-bounce flex items-center justify-center">
                    <Maximize className="text-red-500 rotate-45" size={32} />
                  </div>
                  <div className="absolute top-full mt-4 text-red-500 text-xxs font-bold uppercase tracking-widest text-center w-full">
                    Nie pasuje!
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-8 animate-fade-in">
                {/* The Flexible Container */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-[#00ED64]/30 rounded-[2.5rem] animate-pulse"></div>
                  <div className="absolute inset-4 border-2 border-[#00ED64]/50 rounded-[2rem] border-dashed"></div>

                  {/* The Liquid Shape */}
                  <div className="w-24 h-24 bg-gradient-to-br from-[#00ED64] to-[#00684A] rounded-full animate-morph shadow-[0_0_40px_rgba(0,237,100,0.3)] flex items-center justify-center">
                    <FileJson size={40} className="text-black" />
                  </div>
                </div>
                <div className="text-[#00ED64] text-xxs font-bold uppercase tracking-widest">
                  Elastyczna struktura
                </div>
              </div>
            )}
          </div>

          {/* Text Side */}
          <div className="text-left space-y-6">
            {active === 'sql' ? (
              <div className="animate-fade-in">
                <h4 className="text-xl font-bold text-white mb-4">Sztywne tabele</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Każdy rekord musi mieć ten sam zestaw kolumn. Próba zapisania nietypowych danych
                  kończy się iskrzeniem i błędami.
                </p>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center gap-2 text-red-400 text-xs font-medium">
                    <XCircle size={14} /> Trudne zmiany schematu
                  </li>
                  <li className="flex items-center gap-2 text-red-400 text-xs font-medium">
                    <XCircle size={14} /> Wymuszone puste pola (NULL)
                  </li>
                </ul>
              </div>
            ) : (
              <div className="animate-fade-in">
                <h4 className="text-xl font-bold text-[#00ED64] mb-4">Swoboda dokumentu</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Zapisujesz dane tak, jak przychodzą. MongoDB dopasowuje się do Twojego obiektu jak
                  woda do naczynia.
                </p>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center gap-2 text-[#00ED64] text-xs font-medium">
                    <CheckCircle2 size={14} /> Brak sztywnego schematu
                  </li>
                  <li className="flex items-center gap-2 text-[#00ED64] text-xs font-medium">
                    <CheckCircle2 size={14} /> Szybki Time-to-Market
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes morph {
            0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
            50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
            100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }
        .animate-morph {
            animation: morph 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// --- ANALOGY: CAR IN GARAGE ---
export const CarGarageAnalogy: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
      {/* SQL Garage */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
          <Truck size={120} />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xxs font-black uppercase tracking-wider mb-8">
          Podejście SQL (Relacyjne)
        </div>

        <div className="space-y-6 relative z-10">
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xxxs font-bold text-gray-400">
                KOŁA
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xxxs font-bold text-gray-400">
                DRZWI
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xxxs font-bold text-gray-400">
                SILNIK
              </div>
            </div>
            <h4 className="text-lg font-bold text-dark">Rozbieranie na części</h4>
            <p className="text-xs text-gray-600 text-center mt-2 leading-relaxed">
              Aby zapisać dane, musisz je rozbić na wiele tabel. Aby je odczytać, musisz je
              "poskładać" (JOINy), co przy dużej skali jest powolne.
            </p>
          </div>
        </div>
      </div>

      {/* MongoDB Garage */}
      <div className="bg-[#00ED64]/5 p-8 rounded-3xl border-2 border-[#00ED64]/20 shadow-md relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:translate-x-4 transition-transform text-[#00ED64]">
          <Truck size={120} />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ED64]/10 text-[#00ED64] text-xxs font-black uppercase tracking-wider mb-8 border border-[#00ED64]/20">
          Podejście MongoDB (Dokumentowe)
        </div>

        <div className="space-y-6 relative z-10 flex flex-col items-center text-center">
          <div className="w-32 h-20 bg-[#00ED64]/20 rounded-2xl flex items-center justify-center border-2 border-[#00ED64] shadow-[0_0_20px_rgba(0,237,100,0.2)] mb-4">
            <Truck size={40} className="text-black" />
          </div>
          <h4 className="text-lg font-bold text-dark">Wjazd całego obiektu</h4>
          <p className="text-xs text-gray-600 leading-relaxed mt-2">
            Zapisujesz cały samochód jako jeden dokument JSON. Odczyt jest błyskawiczny, bo dane nie
            są rozproszone.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- SHARDING SIMULATOR ---
export const ShardingSimulator: React.FC = () => {
  const [nodes, setNodes] = useState(1);

  return (
    <div className="my-16 bg-[#0B1120] rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden border border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h3 className="text-xl font-bold mb-2">Skalowanie Poziome (Sharding)</h3>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-black">
            Horizontal Growth Engine
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setNodes(1)}
            className={`px-4 py-2 rounded-lg text-xxs font-bold border transition-all ${nodes === 1 ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500 hover:text-white'}`}
          >
            SINGLE NODE
          </button>
          <button
            onClick={() => setNodes(3)}
            className={`px-4 py-2 rounded-lg text-xxs font-bold border transition-all ${nodes === 3 ? 'bg-[#00ED64] text-black border-[#00ED64]' : 'border-white/10 text-gray-500 hover:text-white'}`}
          >
            SHARDED CLUSTER
          </button>
        </div>
      </div>

      <div className="flex justify-center items-center h-64 gap-8">
        {nodes === 1 ? (
          <div className="relative group animate-fade-in">
            <div className="w-32 h-40 bg-[#1E293B] rounded-2xl border-2 border-red-500/50 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.2)]">
              <Database size={48} className="text-red-500 mb-4 animate-pulse" />
              <div className="h-2 w-20 bg-red-500/20 rounded-full overflow-hidden">
                <div className="h-full w-full bg-red-500 animate-pulse"></div>
              </div>
              <span className="text-xxxs font-black mt-2 text-red-500 uppercase">OVERLOADED</span>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 md:gap-8 animate-fade-in">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-24 h-32 bg-[#1E293B] rounded-xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-[#00ED64]/20"></div>
                <Server
                  size={32}
                  className="text-[#00ED64] mb-3 group-hover:scale-110 transition-transform"
                />
                <div className="h-1.5 w-12 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[33%] bg-[#00ED64]"></div>
                </div>
                <span className="text-xxxs font-black mt-2 text-gray-500 uppercase tracking-widest">
                  SHARD {i}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
        <div className="space-y-2">
          <div className="text-xxs font-black text-gray-600 uppercase tracking-widest">
            SQL (Vertical)
          </div>
          <p className="text-xs text-gray-400">
            Musisz kupić gigantyczny, drogi serwer. Jest granica, której nie przeskoczysz.
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-xxs font-black text-[#00ED64] uppercase tracking-widest">
            MongoDB (Horizontal)
          </div>
          <p className="text-xs text-gray-400">
            Dokupujesz setki tanich serwerów. Twoja baza rośnie w bok, w nieskończoność.
          </p>
        </div>
      </div>
    </div>
  );
};
