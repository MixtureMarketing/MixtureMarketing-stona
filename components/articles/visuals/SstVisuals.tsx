import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Layout, Server, Zap, CheckCircle2, Share2 } from 'lucide-react';

export const SstHeroVisual = () => {
  return (
    <div className="relative w-full bg-[#0F172A] rounded-[3rem] p-8 md:p-16 overflow-hidden border border-white/10 shadow-2xl min-h-[500px] flex items-center justify-center group">
      <div className="absolute inset-0 bg-tech-grid opacity-[0.05]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-500/10 via-transparent to-transparent"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-40 h-40 md:w-56 md:h-56 flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full border border-blue-400/20 animate-ping-slow"></div>
          <div className="absolute inset-4 rounded-full border border-blue-400/40 animate-spin-slow border-dashed"></div>

          <div className="w-24 h-24 md:w-32 md:h-32 bg-primary rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(97,182,222,0.3)] relative z-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <Server size={64} className="text-white" />
          </div>

          <div className="absolute w-full h-full animate-spin-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark p-3 rounded-xl shadow-lg border border-blue-400/30">
              <Database size={20} className="text-blue-400" />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-dark p-3 rounded-xl shadow-lg border border-emerald-400/30">
              <ShieldCheck size={20} className="text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            Server-Side <span className="text-primary">Tracking</span>
          </h2>
          <p className="text-primary/70 font-mono text-sm uppercase tracking-[0.3em]">
            Precision • Privacy • Profit
          </p>
        </div>
      </div>

      <style>{`
                .animate-ping-slow { animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
                .animate-spin-slow { animation: spin 15s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
    </div>
  );
};

export const TrackingComparisonVisual = () => {
  const [mode, setMode] = useState<'client' | 'server'>('client');
  const [packets, setPackets] = useState<
    { id: number; top: number; type: 'success' | 'blocked' }[]
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const isBlocked = mode === 'client' && Math.random() > 0.6;
      setPackets((prev) => [
        ...prev.slice(-10),
        { id: Date.now(), top: Math.random() * 80 + 10, type: isBlocked ? 'blocked' : 'success' },
      ]);
    }, 600);
    return () => clearInterval(interval);
  }, [mode]);

  return (
    <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-xl overflow-hidden relative group not-prose">
      <div className="flex justify-center gap-4 mb-12 relative z-20">
        <button
          onClick={() => setMode('client')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'client' ? 'bg-rose-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'}`}
        >
          Model Klasyczny (Client)
        </button>
        <button
          onClick={() => setMode('server')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'server' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'}`}
        >
          Model Nowoczesny (SST)
        </button>
      </div>

      <div className="relative h-64 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between px-12 overflow-hidden">
        <div className="flex flex-col items-center gap-2 z-10">
          <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm">
            <Layout size={32} className="text-dark" />
          </div>
          <span className="text-xxs font-black uppercase text-gray-600 tracking-widest">User</span>
        </div>

        {mode === 'client' && (
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-rose-200 z-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-500 text-white px-3 py-1 rounded text-[10px] font-black whitespace-nowrap">
              ADBLOCK / IOS BLOKADA
            </div>
          </div>
        )}

        {mode === 'server' && (
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl animate-pulse">
              <Server size={40} />
            </div>
            <span className="text-xxs font-black uppercase text-primary tracking-widest">
              Twoja Chmura (GCP)
            </span>
          </div>
        )}

        <div className="flex flex-col items-center gap-2 z-10">
          <div className="w-16 h-16 bg-blue-50 rounded-full border-2 border-blue-100 flex items-center justify-center text-secondary">
            <Share2 size={32} />
          </div>
          <span className="text-xxs font-black uppercase text-gray-600 tracking-widest">Ads</span>
        </div>

        {packets.map((p) => (
          <div
            key={p.id}
            className={`absolute w-3 h-3 rounded-full shadow-lg z-30 ${p.type === 'blocked' ? 'bg-rose-500' : 'bg-emerald-500'} animate-packet-flow`}
            style={{ top: `${p.top}%`, left: '15%' }}
          >
            {p.type === 'blocked' && (
              <div className="absolute -top-4 -left-1 text-[10px] font-bold text-rose-600">X</div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm font-medium text-gray-600">
          {mode === 'client'
            ? '🔴 W modelu klasycznym tracisz od 30% do 50% danych o konwersji.'
            : '🟢 W modelu SST dane płyną bezpiecznie bezpośrednio z Twojego serwera.'}
        </p>
      </div>

      <style>{`
                @keyframes packet-flow {
                    from { left: 15%; opacity: 1; }
                    to { left: 85%; opacity: 0; }
                }
                .animate-packet-flow { animation: packet-flow 1.5s linear forwards; }
            `}</style>
    </div>
  );
};

export const CapiVisual = () => {
  return (
    <div className="bg-dark rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl group border border-white/5">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E1306C] rounded-full blur-[150px] opacity-10 group-hover:opacity-20 transition-opacity"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E1306C] text-xs font-bold uppercase tracking-wider mb-6">
            <Zap size={14} fill="currentColor" /> Meta Conversions API (CAPI)
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-6 mt-0">
            Domykanie sprzedaży na Facebooku.
          </h3>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Pixel FB już nie wystarcza. CAPI to bezpośrednie połączenie serwer-serwer, które
            informuje Facebooka o zakupie, nawet gdy użytkownik ma włączone wszystkie możliwe
            blokady.
          </p>
          <ul className="space-y-4">
            {[
              'Wyższa dokładność atrybucji',
              'Lepsza optymalizacja pod ROAS',
              'Omijanie blokad Safari i iOS',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300">
                <CheckCircle2 size={20} className="text-emerald-500" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:w-1/2 flex justify-center">
          <div className="relative w-full max-w-sm aspect-square bg-white/5 rounded-3xl border border-white/10 p-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-grid-white/[0.02]"></div>
            <div className="relative z-10 flex flex-col items-center gap-8">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-xl border border-white/20">
                <Server size={40} />
              </div>
              <div className="h-24 w-px bg-gradient-to-b from-primary to-[#E1306C] relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-ping"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#E1306C] rounded-full animate-pulse shadow-[0_0_15px_#E1306C]"></div>
              </div>
              <div className="w-20 h-20 bg-gradient-to-tr from-[#E1306C] to-[#833AB4] rounded-full flex items-center justify-center shadow-2xl">
                <Share2 size={40} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
