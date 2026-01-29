/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  Bot,
  CheckCircle2,
  XCircle,
  ArrowDownRight,
  ArrowDownLeft,
  Calculator,
  Layers,
  Search,
  Target,
} from 'lucide-react';
import Button from '../../common/Button';
import SectionHeader from '../../common/SectionHeader';
import { useCounter } from '../../../hooks/useCounter';

// 1. ROAS VS PROFIT CALCULATOR
export const RoasProfitCalculator = () => {
  const [spend, setSpend] = useState(10000);

  // Simulate diminishing returns
  const baseRoas = 10; // 1000%
  const decayFactor = (spend - 10000) / 40000; // 0 to 1
  const currentRoas = baseRoas - decayFactor * 4; // 10 to 6

  const revenue = spend * currentRoas;
  const margin = 0.3; // 30% margin
  const grossProfit = revenue * margin;
  const netProfit = grossProfit - spend;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 not-prose relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

      <div className="relative z-10">
        <div className="mb-12">
          <div className="flex justify-between mb-4">
            <label className="text-sm font-bold text-dark">Miesięczne wydatki na reklamę:</label>
            <span className="text-primary font-mono font-bold text-lg">
              {spend.toLocaleString()} PLN
            </span>
          </div>
          <input
            type="range"
            min="10000"
            max="50000"
            step="1000"
            value={spend}
            onChange={(e) => setSpend(parseInt(e.target.value))}
            aria-label="Miesięczne wydatki na reklamę (symulacja skalowania)"
            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#61B6DE]"
          />
          <div className="flex justify-between mt-2 text-xxs font-bold text-gray-600 uppercase tracking-widest">
            <span>Mała Skala</span>
            <span>Duża Skala</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl transition-all">
            <div className="text-xxs font-black uppercase text-gray-600 tracking-widest mb-2">
              ROAS (Zwrot)
            </div>
            <div
              className={`text-3xl font-black ${currentRoas > 8 ? 'text-emerald-500' : 'text-amber-500'}`}
            >
              {Math.round(currentRoas * 100)}%
            </div>
            <p className="text-xxs text-gray-600 mt-2">Mniej efektywnie, ale większy wolumen.</p>
          </div>
          <div className="bg-dark p-6 rounded-2xl shadow-xl transform scale-105">
            <div className="text-xxs font-black uppercase text-primary tracking-widest mb-2">
              Zysk Netto
            </div>
            <div className="text-3xl font-black text-white">
              {Math.round(netProfit).toLocaleString()} PLN
            </div>
            <p className="text-xxs text-gray-600 mt-2">
              To co faktycznie zostaje w Twojej kieszeni.
            </p>
          </div>
        </div>

        <div className="mt-10 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-4">
          <Calculator className="text-primary shrink-0" size={20} />
          <p className="text-xs text-blue-800 leading-relaxed m-0">
            Widzisz? Mimo że <strong>ROAS spadł</strong>, Twój{' '}
            <strong>zysk kwotowy wzrósł dwukrotnie</strong>. To jest prawdziwy cel skalowania
            biznesu.
          </p>
        </div>
      </div>
    </div>
  );
};

// 2. AI FUNNEL DIAGRAM
export const AiFunnelDiagram = () => {
  return (
    <div className="bg-[#0F172A] rounded-[2.5rem] p-8 md:p-12 border border-gray-800 shadow-2xl relative overflow-hidden not-prose font-sans">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(#61B6DE 1px, transparent 1px), linear-gradient(90deg, #61B6DE 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      ></div>

      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-secondary rounded-full blur-[100px] opacity-30"></div>

      <div className="relative flex flex-col items-center gap-8">
        {/* STEP 1: INPUT */}
        <div className="w-full max-w-lg text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <Search size={14} className="text-primary" />
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
              Krok 1: Szerokie Zapytanie
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="text-2xl md:text-3xl font-bold text-white mb-2">"buty sportowe"</div>
            <p className="text-gray-400 text-sm">Użytkownik wpisuje ogólną frazę</p>
          </div>
        </div>

        {/* CONNECTION 1 */}
        <div className="h-12 w-[1px] bg-gradient-to-b from-gray-700 via-primary to-gray-700 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full blur-[4px] animate-ping"></div>
        </div>

        {/* STEP 2: AI PROCESSING (THE BRAIN) */}
        <div className="w-full max-w-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl border border-secondary/50 p-1 relative shadow-[0_0_50px_rgba(63,61,145,0.15)]">
          <div className="absolute -top-6 -right-6 z-20">
            <Bot
              className="text-primary animate-bounce-slow drop-shadow-[0_0_15px_rgba(97,182,222,0.5)]"
              size={56}
            />
          </div>

          <div className="bg-[#0F172A] rounded-[1.3rem] p-6 md:p-8 relative">
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              {/* Left: Signals */}
              <div className="flex-1 w-full">
                <div className="text-xxs font-black text-primary uppercase tracking-widest mb-4">
                  Analiza Sygnałów (Real-Time)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <SignalPill
                    icon={<Target size={14} />}
                    text="Intencja Zakupowa"
                    color="emerald"
                  />
                  <SignalPill
                    icon={<Layers size={14} />}
                    text="Historia Przeglądania"
                    color="blue"
                  />
                  <SignalPill
                    icon={<Calculator size={14} />}
                    text="Urządzenie & Czas"
                    color="purple"
                  />
                  <SignalPill icon={<Search size={14} />} text="Kontekst Zapytania" color="amber" />
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-[1px] h-32 bg-gray-800/50"></div>

              {/* Right: Scoring */}
              <div className="flex-1 w-full text-center relative">
                <div className="text-gray-400 text-xs font-bold uppercase mb-2">
                  Prawdopodobieństwo Konwersji
                </div>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-white mb-2 relative z-10">
                  High
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-secondary to-primary w-[85%] animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONNECTION 2 */}
        <ArrowDownLeft className="text-primary h-12 w-12 animate-bounce" />

        {/* STEP 3: DECISION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl flex items-center gap-4 group hover:bg-emerald-500/20 transition-colors">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="text-emerald-400" size={24} />
            </div>
            <div className="text-left">
              <div className="text-emerald-400 font-bold text-lg">Licytuj Agresywnie</div>
              <div className="text-emerald-400/60 text-xs uppercase font-bold tracking-wider">
                Użytkownik chce kupić
              </div>
            </div>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-2xl flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
              <XCircle className="text-rose-400" size={24} />
            </div>
            <div className="text-left">
              <div className="text-rose-400 font-bold text-lg">Pomiń Aukcję</div>
              <div className="text-rose-400/60 text-xs uppercase font-bold tracking-wider">
                Słabe dopasowanie
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SignalPillProps {
  icon: React.ReactNode;
  text: string;
  color: 'emerald' | 'blue' | 'purple' | 'amber';
}

const SignalPill = ({ icon, text, color }: SignalPillProps) => {
  const colors = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  };

  return (
    <div
      className={`${colors[color]} border px-3 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 cursor-default`}
    >
      {icon}
      <span className="text-xxs font-bold uppercase tracking-wide">{text}</span>
    </div>
  );
};

// 3. SCALING CHECKLIST
export const ScalingChecklist = () => {
  const [checked, setChecked] = useState<number[]>([]);
  const items = [
    {
      id: 1,
      title: 'Impression Share < 90%',
      desc: 'Jeśli masz >90%, nie masz już miejsca na wzrost w tej kampanii.',
    },
    {
      id: 2,
      title: 'Model Atrybucji DDA',
      desc: 'Używasz Data-Driven Attribution zamiast Last Click?',
    },
    {
      id: 3,
      title: 'Poprawna Analityka',
      desc: 'Czy mierzysz mikro-konwersje (np. Dodanie do koszyka)?',
    },
    { id: 4, title: 'Stabilny ROAS', desc: 'Czy wyniki są przewidywalne od co najmniej 14 dni?' },
  ];
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden not-prose">
      <div className="bg-dark p-8 text-white text-center">
        <h3 className="text-xl font-bold">Scaling Readiness Score</h3>
        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(checked.length / items.length) * 100}%` }}
          ></div>
        </div>
      </div>
      <div className="p-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() =>
              setChecked((prev) =>
                prev.includes(item.id) ? prev.filter((i) => i !== item.id) : [...prev, item.id],
              )
            }
            role="checkbox"
            aria-checked={checked.includes(item.id)}
            tabIndex={0}
            aria-label={item.title}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ')
                setChecked((prev) =>
                  prev.includes(item.id) ? prev.filter((i) => i !== item.id) : [...prev, item.id],
                );
            }}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${checked.includes(item.id) ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
          >
            <div
              className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${checked.includes(item.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300'}`}
            >
              {checked.includes(item.id) && <CheckCircle2 size={14} />}
            </div>
            <div>
              <h5
                className={`font-bold text-sm ${checked.includes(item.id) ? 'text-emerald-900' : 'text-dark'}`}
              >
                {item.title}
              </h5>
              <p className="text-xs text-gray-700 mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
