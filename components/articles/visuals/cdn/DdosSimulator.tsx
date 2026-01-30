import React, { useState, useEffect } from 'react';
import { Zap, ShieldCheck, ZapOff, ShieldAlert, Bot, Server } from 'lucide-react';

const DdosSimulator = () => {
  const [isAttacking, setIsAttacking] = useState(false);
  const [wafEnabled, setWafEnabled] = useState(true);
  const [bots, setBots] = useState<{ id: number; top: number; startTime: number }[]>([]);

  useEffect(() => {
    if (!isAttacking) {
      const timer = setTimeout(() => setBots([]), 0);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setBots((prev) => {
        const now = Date.now();
        const keep = prev.filter((b) => now - b.startTime < 1000);
        return [...keep, { id: now, top: Math.random() * 80 + 10, startTime: now }];
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isAttacking]);

  return (
    <div className="bg-[#0F172A] rounded-3xl p-8 shadow-2xl border border-gray-800 relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 relative z-20">
        <div className="flex gap-4">
          <button
            onClick={() => setIsAttacking(!isAttacking)}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${isAttacking ? 'bg-rose-500 text-white shadow-lg' : 'bg-white/10 text-gray-600 hover:bg-white/20'}`}
          >
            {isAttacking ? <ZapOff size={18} /> : <Zap size={18} />}
            {isAttacking ? 'Zatrzymaj Atak' : 'Symuluj Atak DDoS'}
          </button>
          <button
            onClick={() => setWafEnabled(!wafEnabled)}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${wafEnabled ? 'bg-emerald-500 text-white shadow-lg' : 'bg-rose-500 text-white shadow-lg'}`}
          >
            {wafEnabled ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
            WAF: {wafEnabled ? 'WŁĄCZONY' : 'WYŁĄCZONY'}
          </button>
        </div>
        <div className="text-white font-mono text-sm">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isAttacking ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}
            ></div>
            STATUS: {isAttacking ? 'UNDER ATTACK' : 'NORMAL TRAFFIC'}
          </div>
        </div>
      </div>

      <div className="relative h-64 bg-gray-900/50 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-between px-12">
        <div className="flex flex-col items-center gap-2 z-10">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-700">
            <Bot size={32} />
          </div>
          <span className="text-xxs font-bold text-gray-700 uppercase tracking-widest">Botnet</span>
        </div>

        <div
          className={`absolute left-1/2 top-0 bottom-0 w-1 transition-all duration-500 z-20 ${wafEnabled ? 'bg-emerald-500/50 shadow-[0_0_20px_#10B981]' : 'bg-rose-500/20'}`}
        >
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center ${wafEnabled ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-800 text-gray-700 opacity-50'}`}
          >
            {wafEnabled ? <ShieldCheck size={24} /> : <ZapOff size={24} />}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 z-10">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${!wafEnabled && isAttacking ? 'bg-rose-500 scale-110 animate-shake' : 'bg-primary text-white'}`}
          >
            <Server size={40} />
          </div>
          <span className="text-xxs font-bold text-gray-600 uppercase tracking-widest">
            Origin Server
          </span>
        </div>

        {bots.map((bot) => (
          <div
            key={bot.id}
            className={`absolute w-2 h-2 rounded-full shadow-lg bg-rose-500 ${wafEnabled ? 'animate-packet-blocked' : 'animate-packet-success'}`}
            style={{ top: `${bot.top}%`, left: '10%' }}
          ></div>
        ))}
      </div>

      <style>{`
        @keyframes packet-success { from { left: 15%; opacity: 1; } to { left: 85%; opacity: 0; } }
        @keyframes packet-blocked { 0% { left: 15%; opacity: 1; } 50% { left: 50%; opacity: 1; } 100% { left: 50%; opacity: 0; transform: translateY(-20px); } }
        .animate-packet-success { animation: packet-success 0.8s linear forwards; }
        .animate-packet-blocked { animation: packet-blocked 0.8s linear forwards; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.1s linear infinite; }
      `}</style>
    </div>
  );
};

export default DdosSimulator;
