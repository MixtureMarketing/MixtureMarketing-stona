import React, { useState, useEffect } from 'react';
import {
  User,
  Bot,
  Search,
  CheckCircle2,
  ShieldAlert,
  Shield,
  Plane,
  FileCode,
  Terminal,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  AlertTriangle,
  Scale,
  Activity,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Button from '../../common/Button';
import SectionHeader from '../../common/SectionHeader';
import { useCounter } from '../../../hooks/useCounter';

// 0. HELPERS
export const AttackTypeCard = ({
  title,
  desc,
  impact,
}: {
  title: string;
  desc: string;
  impact: string;
}) => (
  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all border-l-4 border-l-rose-500">
    <h3 className="text-xl font-bold text-dark mb-2">{title}</h3>
    <p className="text-sm text-gray-700 leading-relaxed mb-4">{desc}</p>
    <div className="bg-rose-50 p-3 rounded-xl">
      <span className="text-xxs font-black uppercase text-rose-600 tracking-widest block mb-1">
        Skutek bez WAF:
      </span>
      <p className="text-xs text-rose-800 font-medium">{impact}</p>
    </div>
  </div>
);

export const ValueCard = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all">
    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-bold text-dark mb-2">{title}</h3>
    <p className="text-sm text-gray-700 leading-relaxed">{desc}</p>
  </div>
);

export const VirtualPatchingTimeline = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl not-prose overflow-hidden relative">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative">
        {/* Connecting Line */}
        <div className="absolute top-12 left-8 right-8 h-1 bg-gray-100 hidden md:block"></div>

        {[
          {
            time: 'Godzina 0',
            title: 'Odkrycie luki',
            desc: 'Publiczna informacja o błędzie w systemie.',
            icon: <Search size={20} />,
            color: 'bg-gray-500',
          },
          {
            time: 'Godzina 2',
            title: 'Ataki Botów',
            desc: 'Hakerzy skanują Internet w poszukiwaniu ofiar.',
            icon: <Bot size={20} />,
            color: 'bg-rose-500',
          },
          {
            time: 'Godzina 3',
            title: 'WAF Virtual Patch',
            desc: 'Tarcza blokuje lukę na brzegu sieci.',
            icon: <ShieldCheck size={20} />,
            color: 'bg-emerald-500',
            highlight: true,
          },
          {
            time: 'Dzień 5',
            title: 'Poprawka w Kodzie',
            desc: 'Deweloperzy wdrażają stałą aktualizację.',
            icon: <FileCode size={20} />,
            color: 'bg-blue-500',
          },
        ].map((step, i) => (
          <div key={i} className="relative z-10 flex-1">
            <div
              className={`w-16 h-16 ${step.color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg ${step.highlight ? 'ring-4 ring-emerald-100 animate-pulse' : ''}`}
            >
              {step.icon}
            </div>
            <div className="text-xxs font-black uppercase text-primary tracking-widest mb-1">
              {step.time}
            </div>
            <h3 className="font-bold text-dark mb-2">{step.title}</h3>
            <p className="text-xs text-gray-700 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const GdprPenaltyCalculator = () => {
  const [revenue, setRevenue] = useState(1000000);
  const maxPenalty = revenue * 0.04;

  return (
    <div className="max-w-2xl mx-auto bg-[#0F172A] rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-800 text-white not-prose relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Scale size={120} />
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-8 text-center">
          Ile może kosztować Cię wyciek danych?
        </h3>

        <div className="mb-12">
          <div className="flex justify-between mb-4">
            <label className="text-sm font-bold text-gray-600">Roczny obrót firmy (PLN/EUR):</label>
            <span className="text-primary font-mono font-bold">{revenue.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="100000"
            max="50000000"
            step="100000"
            value={revenue}
            onChange={(e) => setRevenue(parseInt(e.target.value))}
            aria-label="Wybierz roczny obrót firmy, aby obliczyć potencjalną karę RODO"
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#61B6DE]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="text-xxs font-black uppercase text-gray-700 tracking-widest mb-2">
              Max. kara (4% obrotu)
            </div>
            <div className="text-3xl font-black text-rose-500">{maxPenalty.toLocaleString()}</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="text-xxs font-black uppercase text-gray-700 tracking-widest mb-2">
              Alternatywny limit
            </div>
            <div className="text-3xl font-black text-white">20,000,000</div>
            <div className="text-xxs text-gray-700 mt-1">EURO (zależnie od wagi naruszenia)</div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-4">
          <AlertTriangle className="text-rose-500 shrink-0" size={20} />
          <p className="text-xs text-rose-200 leading-relaxed">
            WAF jest uznawany przez audytorów za jeden z "niezbędnych środków technicznych"
            wymaganych przez RODO. Jego brak w razie wycieku jest traktowany jako rażące
            zaniedbanie.
          </p>
        </div>
      </div>
    </div>
  );
};

// 1. ATTACK COUNTER
export const AttackCounter = () => {
  const count = useCounter(2451, {
    increment: 5,
    tickInterval: 1500,
  });

  return (
    <div className="bg-white px-6 py-3 rounded-2xl border-2 border-rose-100 shadow-lg inline-flex flex-col items-center">
      <span className="text-xxs font-black uppercase text-gray-600 tracking-widest mb-1">
        Live Attack Detection
      </span>
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
        <span className="text-2xl font-black text-rose-600 font-mono">
          {count.toLocaleString()}
        </span>
        <span className="text-sm font-bold text-gray-600">ataki / sek</span>
      </div>
    </div>
  );
};

// 2. AIRPORT SECURITY SIMULATOR
export const AirportSecuritySimulator = () => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'passed' | 'blocked'>('idle');
  const [isHacker, setIsHacker] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const runScan = (hacker: boolean) => {
    setIsHacker(hacker);
    setStatus('scanning');
    setAnimationKey((prev) => prev + 1); // Reset animation

    setTimeout(() => {
      setStatus(hacker ? 'blocked' : 'passed');
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl relative overflow-hidden not-prose">
      <div className="flex justify-center gap-4 mb-12">
        <button
          onClick={() => runScan(false)}
          disabled={status === 'scanning'}
          aria-label="Symuluj wysłanie bezpiecznego zapytania klienta"
          className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${status === 'passed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <User size={18} /> Wyślij Klienta
        </button>
        <button
          onClick={() => runScan(true)}
          disabled={status === 'scanning'}
          aria-label="Symuluj wysłanie złośliwego zapytania hakera"
          className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${status === 'blocked' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <Bot size={18} /> Wyślij Hakera
        </button>
      </div>

      <div className="relative h-48 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between px-12 overflow-hidden">
        {/* Visual Lane */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>

        {/* Entry */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm">
            <User
              size={32}
              className={isHacker && status !== 'idle' ? 'text-rose-500' : 'text-dark'}
            />
          </div>
          <span className="text-xxs font-black uppercase text-gray-600 tracking-widest">Start</span>
        </div>

        {/* Scanner (WAF) */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div
            className={`w-24 h-32 rounded-xl border-4 transition-all duration-300 flex flex-col items-center justify-center bg-white shadow-md ${status === 'scanning' ? 'border-primary animate-pulse' : status === 'passed' ? 'border-emerald-500 shadow-emerald-100' : status === 'blocked' ? 'border-rose-500 shadow-rose-100' : 'border-gray-200'}`}
          >
            {status === 'scanning' ? (
              <div className="relative">
                <Search className="text-primary animate-bounce" size={32} />
                <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse"></div>
              </div>
            ) : status === 'passed' ? (
              <CheckCircle2 className="text-emerald-500" size={32} />
            ) : status === 'blocked' ? (
              <ShieldAlert className="text-rose-500 animate-pulse" size={40} />
            ) : (
              <Shield className="text-gray-200" size={32} />
            )}
            <span className="text-xxxs font-black mt-3 text-gray-600 tracking-widest uppercase">
              SCANNER (WAF)
            </span>
          </div>
        </div>

        {/* Plane (App) */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div
            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500 shadow-sm ${status === 'passed' ? 'bg-emerald-50 border-emerald-500 text-emerald-600 scale-110 shadow-emerald-100' : 'bg-white border-gray-200 text-gray-300 opacity-50'}`}
          >
            <Plane size={32} />
          </div>
          <span className="text-xxs font-black uppercase text-gray-600 tracking-widest">
            Application
          </span>
        </div>

        {/* Animated Packet */}
        {status !== 'idle' && (
          <div
            key={animationKey}
            className={`absolute w-5 h-5 rounded-full shadow-lg z-20 ${isHacker ? 'bg-rose-500 shadow-rose-500/50' : 'bg-primary shadow-primary/50'} ${isHacker ? 'animate-scan-blocked' : 'animate-scan-passed'}`}
          >
            <div className="w-full h-full bg-white/20 rounded-full animate-ping"></div>
          </div>
        )}
      </div>

      <div className="mt-10 text-center min-h-[40px]">
        <p
          className={`text-sm font-bold transition-colors duration-300 ${status === 'passed' ? 'text-emerald-600' : status === 'blocked' ? 'text-rose-600' : 'text-dark'}`}
        >
          {status === 'idle' && 'Wybierz kogo wysłać do bramki...'}
          {status === 'scanning' && 'Analizuję zawartość pakietu (Headers, Cookies, Payload)...'}
          {status === 'passed' && '✅ Ruch bezpieczny. Zapytanie przekazane do aplikacji.'}
          {status === 'blocked' && '❌ WYKRYTO ZAGROŻENIE! Zapytanie zablokowane na brzegu sieci.'}
        </p>
      </div>

      <style>{`
                @keyframes scan-passed {
                    0% { left: 15%; top: 50%; transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    45% { left: 48%; top: 50%; transform: translate(-50%, -50%); }
                    55% { left: 48%; top: 50%; transform: translate(-50%, -50%); }
                    90% { opacity: 1; }
                    100% { left: 85%; top: 50%; transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                }
                @keyframes scan-blocked {
                    0% { left: 15%; top: 50%; transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    45% { left: 48%; top: 50%; transform: translate(-50%, -50%); }
                    100% { left: 48%; top: 50%; transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
                }
                .animate-scan-passed { animation: scan-passed 3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
                .animate-scan-blocked { animation: scan-blocked 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            `}</style>
    </div>
  );
};

// 3. SQLi DEMO
export const SqliDemo = () => {
  const [input, setInput] = useState('');
  const [protected_mode, setProtected] = useState(true);

  const getResponse = () => {
    if (!input) return 'Czekam na zapytanie...';
    if (input.includes("' OR '1'='1")) {
      return protected_mode
        ? 'WAF: ZABLOKOWANO! Wykryto próbę ataku SQL Injection (Pattern Match).'
        : 'BAZA: Zwrócono 14,502 rekordy (Wszystkich użytkowników).';
    }
    return 'BAZA: Nie znaleziono wyników dla Twojej frazy.';
  };

  return (
    <div className="bg-[#0F172A] rounded-3xl p-8 shadow-2xl text-white not-prose overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <FileCode size={120} />
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 relative z-10">
        <h3 className="text-xl font-bold">Symulator SQL Injection</h3>
        <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setProtected(true)}
            aria-label="Włącz ochronę WAF"
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${protected_mode ? 'bg-emerald-500 text-white' : 'text-gray-600'}`}
          >
            WAF ON
          </button>
          <button
            onClick={() => setProtected(false)}
            aria-label="Wyłącz ochronę WAF"
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!protected_mode ? 'bg-rose-500 text-white' : 'text-gray-600'}`}
          >
            WAF OFF
          </button>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 relative z-10">
        <div className="mb-6">
          <label
            htmlFor="sqli-input"
            className="text-xxs font-black uppercase text-gray-700 tracking-widest mb-2 block"
          >
            Szukaj użytkownika:
          </label>
          <div className="flex gap-2">
            <input
              id="sqli-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="np. Jan Kowalski"
              className="flex-grow bg-[#1E293B] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
              aria-label="Pole wyszukiwania użytkownika do testu SQL Injection"
            />
            <button
              onClick={() => setInput("' OR '1'='1' --")}
              aria-label="Wpisz przykładowy kod ataku SQL Injection"
              className="bg-secondary text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary transition-colors"
            >
              Wpisz kod hakera
            </button>
          </div>
        </div>

        <div className="bg-[#0B1120] rounded-xl p-4 font-mono text-xs border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-gray-700 border-b border-white/5 pb-2">
            <Terminal size={14} /> System Response
          </div>
          <div
            className={`${getResponse().includes('ZABLOKOWANO') ? 'text-rose-400' : getResponse().includes('Zwrócono') ? 'text-yellow-400' : 'text-emerald-400'}`}
          >
            {getResponse()}
          </div>
        </div>
      </div>
    </div>
  );
};
