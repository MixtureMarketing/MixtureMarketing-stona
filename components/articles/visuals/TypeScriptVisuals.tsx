/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  FileCode,
  Zap,
  DollarSign,
  TrendingUp,
  BarChart3,
  Terminal,
  MousePointer2,
} from 'lucide-react';

// --- HERO: CODE SCANNER ANIMATION ---
export const TypeScriptScanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'js' | 'ts'>('js');
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'done'>('idle');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScanStatus('scanning');
    const timer = setTimeout(() => setScanStatus('done'), 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [activeTab]);

  return (
    <div className="relative w-full bg-[#0F172A] rounded-[2.5rem] p-8 md:p-12 overflow-hidden border border-white/10 shadow-2xl min-h-[450px] flex flex-col">
      {/* Blueprint Background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#3F3D91 1px, transparent 1px), linear-gradient(90deg, #3F3D91 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      ></div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Tab Switcher */}
        <div className="flex bg-white/5 p-1 rounded-xl self-center mb-12 border border-white/5">
          <button
            onClick={() => setActiveTab('js')}
            className={`px-6 py-2 rounded-lg text-xxs font-black uppercase tracking-widest transition-all ${activeTab === 'js' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            JavaScript
          </button>
          <button
            onClick={() => setActiveTab('ts')}
            className={`px-6 py-2 rounded-lg text-xxs font-black uppercase tracking-widest transition-all ${activeTab === 'ts' ? 'bg-[#3178C6] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            TypeScript
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Code Block */}
          <div className="bg-black/40 p-6 rounded-2xl border border-white/5 font-mono text-xs text-gray-400 w-full max-w-sm mb-8 relative">
            <div className="space-y-2">
              <div className="flex gap-2 mb-4 opacity-30">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <div>
                <span className="text-purple-400">const</span> user ={' '}
                <span className="text-yellow-400">getUser</span>();
              </div>
              <div
                className={
                  activeTab === 'ts' && scanStatus === 'done'
                    ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50 rounded px-1'
                    : ''
                }
              >
                <span className="text-purple-400">return</span> user.name.
                <span className="text-yellow-400">toUpperCase</span>();
              </div>
            </div>

            {/* The Scanning Line */}
            {scanStatus === 'scanning' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-[#3178C6] shadow-[0_0_15px_#3178C6] animate-scan-y z-20"></div>
            )}
          </div>

          {/* Status Messages */}
          <div className="text-center min-h-[80px]">
            {scanStatus === 'scanning' ? (
              <div className="flex items-center gap-2 text-gray-500 animate-pulse uppercase text-xxs font-black tracking-widest">
                <Search size={14} /> Analiza statyczna...
              </div>
            ) : activeTab === 'js' ? (
              <div className="animate-fade-in space-y-4">
                <div className="text-emerald-500 uppercase text-xxs font-black tracking-widest flex items-center justify-center gap-2">
                  <CheckCircle2 size={14} /> Kod poprawny (Build Success)
                </div>
                <div className="mt-4 p-4 bg-red-500 text-white rounded-xl shadow-2xl border-2 border-red-400 animate-bounce">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} />
                    <div className="text-left">
                      <div className="text-xxs font-black uppercase mb-1 tracking-widest">
                        Runtime Error (U klienta!)
                      </div>
                      <div className="text-xxs font-mono leading-tight">
                        Uncaught TypeError: Cannot read property 'name' of undefined
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in space-y-4">
                <div className="text-red-500 uppercase text-xxs font-black tracking-widest flex items-center justify-center gap-2">
                  <XCircle size={14} /> Błąd wykryty podczas pisania
                </div>
                <div className="mt-4 p-4 bg-[#3178C6]/10 border border-[#3178C6]/30 rounded-xl text-[#3178C6] max-w-xs mx-auto">
                  <p className="text-xxs font-bold m-0 leading-relaxed italic">
                    "TypeScript wykrył, że 'user' może być pusty (undefined). Napraw to teraz, zanim
                    wyślesz kod na serwer."
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan-y {
            0% { transform: translateY(0); }
            100% { transform: translateY(120px); }
        }
        .animate-scan-y {
            animation: scan-y 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

// --- COST CHART: REPAIR COST ---
export const CostFixChart: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 my-16">
      <h3 className="text-xl font-bold text-dark mb-12 text-center">
        Koszt naprawy błędu (Wykładniczy)
      </h3>

      <div className="flex flex-col md:flex-row items-end justify-center gap-8 md:gap-12 h-auto md:h-80 w-full max-w-3xl mx-auto pb-8 border-b border-gray-100">
        {/* Dev Phase */}
        <div className="w-full md:w-1/3 flex flex-col items-center gap-3 group">
          <div className="relative w-full max-w-[100px]">
            <div className="w-full bg-[#3178C6] h-8 rounded-t-lg transition-all group-hover:h-10 opacity-80 group-hover:opacity-100 flex items-start justify-center pt-2">
              <span className="text-xxs font-black text-white">10 PLN</span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-b-lg"></div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-dark">Etap Pisania</div>
            <div className="text-xxs text-gray-400 uppercase tracking-widest mt-1">Najtaniej</div>
          </div>
        </div>

        {/* QA Phase */}
        <div className="w-full md:w-1/3 flex flex-col items-center gap-3 group">
          <div className="relative w-full max-w-[100px]">
            <div className="w-full bg-orange-400 h-24 rounded-t-lg transition-all group-hover:h-28 opacity-80 group-hover:opacity-100 flex items-start justify-center pt-2">
              <span className="text-xxs font-black text-white">100 PLN</span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-b-lg"></div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-dark">Etap Testów</div>
            <div className="text-xxs text-gray-400 uppercase tracking-widest mt-1">
              Koszt rośnie 10x
            </div>
          </div>
        </div>

        {/* Prod Phase */}
        <div className="w-full md:w-1/3 flex flex-col items-center gap-3 group">
          <div className="relative w-full max-w-[100px]">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-red-500 animate-bounce">
              <AlertTriangle size={24} />
            </div>
            <div className="w-full bg-red-500 h-48 md:h-64 rounded-t-lg transition-all group-hover:h-[17rem] opacity-90 group-hover:opacity-100 flex items-start justify-center pt-2 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <span className="text-sm font-black text-white">10 000+ PLN</span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-b-lg"></div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-dark">Produkcja</div>
            <div className="text-xxs text-red-500 font-bold uppercase tracking-widest mt-1">
              KATASTROFA
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 mt-8 italic max-w-lg mx-auto">
        "Błąd wykryty przez TypeScript w trakcie pisania kosztuje grosze. Błąd wykryty przez klienta
        kosztuje reputację i tysiące złotych."
      </p>
    </div>
  );
};

// --- CODE DUEL: JS VS TS ---
export const CodeDuel: React.FC = () => {
  const [view, setView] = useState<'js' | 'ts'>('js');

  return (
    <div className="my-16 bg-[#0B1120] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl flex flex-col">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
        </div>
        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
          <button
            onClick={() => setView('js')}
            className={`px-4 py-1.5 rounded-md text-xxs font-black uppercase transition-all ${view === 'js' ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}
          >
            JavaScript
          </button>
          <button
            onClick={() => setView('ts')}
            className={`px-4 py-1.5 rounded-md text-xxs font-black uppercase transition-all ${view === 'ts' ? 'bg-[#3178C6] text-white' : 'text-gray-600 hover:text-gray-400'}`}
          >
            TypeScript
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 font-mono text-xs md:text-sm overflow-x-auto">
        {view === 'js' ? (
          <div className="space-y-4 animate-fade-in">
            <pre className="text-gray-400">
              <code>{`function obliczSume(cena, podatek) {
  return cena + podatek;
}

// Błąd: przekazujemy tekst zamiast liczby
const wynik = obliczSume(100, "23");

console.log(wynik); // WYNIK: "10023"`}</code>
            </pre>
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
              <XCircle size={16} className="mb-2" />
              <strong>Problem:</strong> JavaScript "skleił" tekst z liczbą. Klient dostał fakturę na
              10 tysięcy zamiast 123 zł. Brak błędów w konsoli - błąd logiczny, najtrudniejszy do
              wykrycia.
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <pre className="text-gray-400">
              <code>
                {`function obliczSume(cena: number, podatek: number): number {
  return cena + podatek;
}

// Próba przekazania tekstu...
const wynik = obliczSume(100, `}
                <span className="underline decoration-wavy decoration-red-500 text-white">
                  "23"
                </span>
                {`);`}
              </code>
            </pre>
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 text-xs relative">
              <CheckCircle2 size={16} className="mb-2" />
              <strong>Rozwiązanie:</strong> Edytor natychmiast podkreśla "23" na czerwono. Aplikacja
              się nie zbuduje, dopóki błąd nie zostanie poprawiony. Biznes bezpieczny.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
