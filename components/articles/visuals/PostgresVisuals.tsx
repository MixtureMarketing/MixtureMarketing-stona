import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  Lock,
  Coins,
  Undo2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  BarChart3,
  Zap,
  Globe,
  MapPin,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

// --- HERO: DATA VAULT ANIMATION ---
export const PostgresHeroVisual: React.FC = () => {
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSavings((prev) => (prev < 500000 ? prev + 5432 : 500000));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full bg-[#0F172A] rounded-[3rem] p-12 overflow-hidden border border-white/10 shadow-2xl min-h-[500px] flex items-center justify-center group">
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

      {/* Data Streams (Binary Rain inspired) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute text-xxxs font-mono text-blue-400 whitespace-nowrap animate-data-stream"
            style={{
              left: `${i * 10}%`,
              animationDuration: `${2 + (i % 3)}s`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            01011010101101010101010101010101
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* The Vault / Safe */}
        <div className="w-48 h-48 bg-gradient-to-br from-[#336791] to-dark rounded-[2rem] border-4 border-primary/30 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(97,182,222,0.3)] relative group-hover:scale-105 transition-transform duration-500">
          <Database size={80} className="text-white drop-shadow-[0_0_15px_#61B6DE]" />
          <div className="mt-2 text-xxs font-black uppercase tracking-widest text-primary">
            PostgreSQL
          </div>

          {/* Dial */}
          <div className="absolute top-2 right-2 w-12 h-12 border-2 border-white/10 rounded-full flex items-center justify-center">
            <div className="w-1 h-4 bg-white/20 rounded-full transform rotate-45"></div>
          </div>
        </div>

        {/* Licznik Oszczędności */}
        <div className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl text-center shadow-2xl">
          <div className="text-gray-400 text-xxs font-black uppercase tracking-widest mb-2">
            Oszczędność na licencjach
          </div>
          <div className="text-3xl md:text-4xl font-black text-success tabular-nums tracking-tighter">
            {savings.toLocaleString()} <span className="text-sm font-bold">PLN</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2 text-primary text-xxs font-bold">
            <TrendingUp size={12} /> Zysk naszych klientów po migracji
          </div>
        </div>
      </div>

      <style>{`
        @keyframes data-stream {
            0% { transform: translateY(-100%); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(1000%); opacity: 0; }
        }
        .animate-data-stream {
            animation: data-stream linear infinite;
        }
      `}</style>
    </div>
  );
};

// --- ACID TRANSACTION SIMULATOR ---
export const AcidSimulator: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'failure' | 'rollback'>('idle');

  const startTransaction = () => {
    setStatus('processing');
    setTimeout(() => setStatus('failure'), 1500);
    setTimeout(() => setStatus('rollback'), 3000);
  };

  return (
    <div className="my-16 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Undo2 size={18} className="text-[#336791]" />
          <span className="text-sm font-bold text-dark uppercase tracking-wider">
            Symulator Transakcji (ACID)
          </span>
        </div>
        <button
          onClick={startTransaction}
          disabled={status === 'processing' || status === 'failure'}
          className="bg-[#336791] text-white text-xxs font-black px-4 py-2 rounded-lg hover:bg-dark transition-all disabled:opacity-50"
        >
          START PRZELEWU
        </button>
      </div>

      <div className="p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative">
          {/* Account A */}
          <div className="w-full md:w-1/3 p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center">
            <div className="text-xxs font-bold text-gray-500 uppercase mb-2">Twoje Konto</div>
            <div
              className={`text-2xl font-black transition-colors ${status === 'processing' ? 'text-red-500' : 'text-dark'}`}
            >
              {status === 'idle' || status === 'rollback' ? '1000.00' : '900.00'}{' '}
              <span className="text-xs">PLN</span>
            </div>
          </div>

          {/* Connection / Progress */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full h-1 bg-gray-100 rounded-full relative overflow-hidden">
              {status === 'processing' && (
                <div className="absolute inset-0 bg-[#336791] animate-shimmer"></div>
              )}
              {status === 'failure' && <div className="absolute inset-0 bg-red-500"></div>}
            </div>
            <div className="mt-4 text-center min-h-[40px]">
              {status === 'processing' && (
                <span className="text-xxs font-bold text-gray-500 animate-pulse">
                  PRZETWARZANIE...
                </span>
              )}
              {status === 'failure' && (
                <div className="flex items-center gap-2 text-red-600 animate-bounce">
                  <AlertTriangle size={14} />
                  <span className="text-xxs font-black uppercase">AWARIA ZASILANIA!</span>
                </div>
              )}
              {status === 'rollback' && (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 size={14} />
                  <span className="text-xxs font-black uppercase tracking-widest">
                    ROLLBACK: COFNIĘTO ZMIANY
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Account B */}
          <div className="w-full md:w-1/3 p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center">
            <div className="text-xxs font-bold text-gray-500 uppercase mb-2">Odbiorca</div>
            <div className="text-2xl font-black text-dark">
              0.00 <span className="text-xs">PLN</span>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-[#F0F7FF] rounded-2xl border border-primary/20">
          <p className="text-sm m-0 leading-relaxed text-dark">
            <strong>Dlaczego to ważne?</strong> Słaba baza danych mogłaby "zgubić" Twoje 100 zł –
            zniknęłyby z Twojego konta, ale nie trafiły do odbiorcy. PostgreSQL dzięki{' '}
            <strong>ACID</strong> gwarantuje, że Twoje dane są zawsze spójne.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- TCO CHART ---
export const TcoCostChart: React.FC = () => {
  return (
    <div className="my-16 bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
      <h3 className="text-xl font-bold text-dark mb-12 text-center">
        Koszt TCO po 3 latach (Oracle vs Postgres)
      </h3>

      <div className="flex flex-col md:flex-row items-end justify-center gap-12 md:gap-32 h-96 px-4 pb-8 border-b border-gray-100">
        {/* Oracle Column */}
        <div className="w-full max-w-[140px] flex flex-col items-center group h-full justify-end">
          {/* Stack Container */}
          <div className="w-full flex flex-col justify-end gap-1 h-[80%] relative">
            {/* Top Block: Licenses */}
            <div className="h-[60%] bg-red-500 rounded-lg group-hover:bg-red-600 transition-all relative flex items-center justify-center shadow-sm">
              <div className="text-white font-black text-xs text-center leading-none">
                Licencje
                <br />
                (60%)
              </div>
            </div>
            {/* Mid Block: Support */}
            <div className="h-[25%] bg-red-400 rounded-lg group-hover:bg-red-500 transition-all flex items-center justify-center">
              <span className="text-xxs font-bold text-white/80">Support</span>
            </div>
            {/* Bot Block: Hardware */}
            <div className="h-[15%] bg-red-300 rounded-lg group-hover:bg-red-400 transition-all flex items-center justify-center">
              <span className="text-xxs font-bold text-white/80">Infra</span>
            </div>

            {/* Total Label */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-red-600 font-black text-lg animate-bounce">
              $$$
            </div>
          </div>
          <div className="mt-4 text-xxs font-black uppercase text-gray-500 text-center tracking-widest">
            Komercyjna Baza
          </div>
        </div>

        {/* PostgreSQL Column */}
        <div className="w-full max-w-[140px] flex flex-col items-center group h-full justify-end">
          {/* Stack Container - Lower total height */}
          <div className="w-full flex flex-col justify-end gap-1 h-[30%] relative">
            {/* Top Block: Setup */}
            <div className="h-[60%] bg-[#336791] rounded-lg group-hover:bg-dark transition-all relative flex items-center justify-center shadow-[0_0_20px_rgba(51,103,145,0.3)]">
              <div className="text-white font-black text-xs text-center leading-none">
                Wdrożenie
              </div>
            </div>
            {/* Bot Block: Maintenance */}
            <div className="h-[40%] bg-primary rounded-lg group-hover:bg-[#336791] transition-all flex items-center justify-center">
              <span className="text-xxs font-bold text-white">Utrzymanie</span>
            </div>

            {/* Savings Label */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-success text-white text-xxs font-black px-2 py-1 rounded shadow-lg whitespace-nowrap">
              -70% Kosztów
            </div>
          </div>
          <div className="mt-4 text-xxs font-black uppercase text-[#336791] text-center tracking-widest">
            PostgreSQL
          </div>
        </div>
      </div>

      <div className="mt-8 text-center max-w-xl mx-auto">
        <p className="text-xs text-gray-500 italic">
          *Wykres uwzględnia koszty licencji (Core-based), wsparcia technicznego oraz infrastruktury
          w perspektywie 36 miesięcy.
        </p>
      </div>
    </div>
  );
};
