/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  MousePointer2,
  Clock,
  AlertTriangle,
  XCircle,
  Activity,
  RefreshCw,
  Cpu,
  Zap,
  Gauge,
} from 'lucide-react';
import Button from '../../common/Button';
import SectionHeader from '../../common/SectionHeader';
import { useCounter } from '../../../hooks/useCounter';

// 0. HELPERS
interface MetricIntroCardProps {
  title: string;
  subtitle: string;
  desc: string;
  target: string;
  color: string;
}

export const MetricIntroCard = ({ title, subtitle, desc, target, color }: MetricIntroCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
    <h3 className={`text-2xl font-black mb-1 ${color}`}>{title}</h3>
    <div className="text-xxs font-black text-gray-600 uppercase tracking-widest mb-4">
      {subtitle}
    </div>
    <p className="text-xs text-gray-700 leading-relaxed mb-4">{desc}</p>
    <div className="bg-gray-50 rounded-xl py-2 border border-gray-100">
      <span className="text-xxs font-black text-gray-600 uppercase block mb-1">Target</span>
      <span className="text-sm font-bold text-dark">{target}</span>
    </div>
  </div>
);

interface CaseStudyCardProps {
  brand: string;
  metric: string;
  result: string;
}

export const CaseStudyCard = ({ brand, metric, result }: CaseStudyCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center group hover:border-primary transition-all">
    <div className="text-xxs font-black text-primary uppercase tracking-widest mb-2">{brand}</div>
    <div className="text-xl font-bold text-dark mb-1">{metric}</div>
    <div className="text-sm font-bold text-emerald-500">{result}</div>
  </div>
);

// 1. LIGHTHOUSE GAUGE
export const LighthouseGauge = ({ score }: { score: number }) => {
  const current = useCounter(score, { duration: 1000, delay: 500 });

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (current / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="64" cy="64" r="45" stroke="#f3f4f6" strokeWidth="8" fill="none" />
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="#10B981"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-black text-dark">{current}</span>
        </div>
      </div>
      <span className="text-xxs font-black text-emerald-500 uppercase mt-2 tracking-widest">
        Performance
      </span>
    </div>
  );
};

export const ConversionBoost = ({ start, end }: { start: number; end: number }) => {
  // Note: useCounter handles floor, for float we use a simple local logic or extend hook
  // keeping local logic for precision floats if needed, but here simple counter is fine
  const val = useCounter(end * 10, { duration: 1000, delay: 1000 }) / 10;

  return (
    <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
      <span className="text-xxs font-black text-gray-600 uppercase mb-1">Conversion Rate</span>
      <div className="flex items-center gap-2">
        <TrendingUp className="text-emerald-500" size={16} />
        <span className="text-2xl font-black text-dark font-mono transition-all duration-1000">
          {val.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

// 2. INP SIMULATOR
export const InpSimulator = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [mode, setMode] = useState<'good' | 'bad'>('bad');

  const handleInteraction = () => {
    setStatus('loading');
    const delay = mode === 'bad' ? 800 : 50;
    setTimeout(() => {
      setStatus('done');
      setTimeout(() => setStatus('idle'), 1500);
    }, delay);
  };

  return (
    <div className="bg-[#0F172A] rounded-3xl p-8 shadow-2xl border border-gray-800 text-white overflow-hidden relative">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setMode('bad')}
            aria-label="Tryb symulacji: Wysokie opóźnienie INP (Zły wynik)"
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'bad' ? 'bg-rose-500' : 'text-gray-600'}`}
          >
            Wysokie INP (Złe)
          </button>
          <button
            onClick={() => setMode('good')}
            aria-label="Tryb symulacji: Niskie opóźnienie INP (Dobry wynik)"
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'good' ? 'bg-emerald-500' : 'text-gray-600'}`}
          >
            Niskie INP (Dobre)
          </button>
        </div>
        <div className="text-xxs font-black text-gray-700 uppercase">Interaction Simulator</div>
      </div>

      <div className="flex flex-col items-center justify-center py-12 bg-gray-900 rounded-2xl border border-white/5">
        <button
          onClick={handleInteraction}
          disabled={status !== 'idle'}
          aria-label="Kliknij, aby przetestować interaktywność i zmierzyć INP"
          className={`px-10 py-5 rounded-2xl font-black text-lg transition-all transform active:scale-95 flex items-center gap-3 ${status === 'loading' ? 'bg-gray-700 text-gray-700' : status === 'done' ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:bg-secondary shadow-xl shadow-primary/20'}`}
        >
          {status === 'loading' ? (
            <RefreshCw className="animate-spin" />
          ) : status === 'done' ? (
            <CheckCircle2 />
          ) : (
            <MousePointer2 />
          )}
          {status === 'loading'
            ? 'Przetwarzanie...'
            : status === 'done'
              ? 'Sukces!'
              : 'Kliknij mnie'}
        </button>

        <div className="mt-8 text-center min-h-[40px]">
          {status === 'loading' && (
            <p className="text-xs text-rose-400 animate-pulse font-mono">
              Główny wątek zablokowany przez 2MB JavaScript...
            </p>
          )}
          {status === 'done' && (
            <p
              className={`text-xs font-bold uppercase tracking-widest ${mode === 'bad' ? 'text-rose-500' : 'text-emerald-400'}`}
            >
              Reakcja po: {mode === 'bad' ? '800ms' : '50ms'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. CLS SIMULATOR
export const ClsSimulator = () => {
  const [shifted, setShifted] = useState(false);
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl overflow-hidden relative min-h-[300px] flex flex-col justify-center not-prose">
      <div className="text-center mb-8">
        <Button
          onClick={() => setShifted(!shifted)}
          variant="outline"
          aria-label={
            shifted
              ? 'Resetuj symulację CLS'
              : 'Symuluj opóźnione wczytanie reklamy, aby zobaczyć przesunięcie układu (CLS)'
          }
          className="border-gray-200"
        >
          {shifted ? 'Zresetuj' : 'Kliknij, aby wczytać reklamę'}
        </Button>
      </div>

      <div className="max-w-sm mx-auto w-full bg-gray-50 p-6 rounded-2xl border border-gray-100 relative transition-all duration-300">
        {shifted && (
          <div className="bg-rose-100 border-2 border-rose-200 text-rose-600 p-4 rounded-xl mb-4 animate-fade-in-down flex items-center gap-3">
            <AlertTriangle className="shrink-0" />
            <span className="text-xs font-bold uppercase tracking-tight">
              Twoja reklama załadowała się za późno!
            </span>
          </div>
        )}
        <div className="space-y-2">
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-10 w-full bg-dark rounded-xl flex items-center justify-center text-white text-xs font-bold">
            PRZYCISK KUP TERAZ
          </div>
        </div>
        {shifted && (
          <div className="absolute -top-4 -right-4 bg-rose-500 text-white p-2 rounded-full shadow-xl animate-bounce">
            <XCircle />
          </div>
        )}
      </div>
      <p className="text-center text-xxs text-gray-600 mt-6 font-bold uppercase tracking-widest">
        Wizualizacja przesunięcia układu (Layout Shift)
      </p>
    </div>
  );
};

// 4. MAIN THREAD VISUALIZER
export const MainThreadVisualizer = () => {
  const [isBusy, setIsBusy] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);

  const runHeavyScript = () => {
    setIsBusy(true);
    setQueue(['Parsing JS...', 'Executing Tracker...', 'Rendering Chatbot...']);
    setTimeout(() => {
      setIsBusy(false);
      setQueue([]);
    }, 3000);
  };

  return (
    <div className="bg-[#0F172A] rounded-3xl p-8 shadow-2xl border border-gray-800 text-white not-prose">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="font-bold text-lg">Symulator Głównego Wątku</h3>
          <p className="text-gray-600 text-xs uppercase tracking-widest">Main Thread Status</p>
        </div>
        <Button
          onClick={runHeavyScript}
          disabled={isBusy}
          variant="primary"
          aria-label="Symuluj wstrzyknięcie ciężkiego skryptu blokującego główny wątek przeglądarki"
          className="bg-rose-500 hover:bg-rose-600 border-none shadow-lg shadow-rose-500/20"
        >
          Wstrzyknij ciężki skrypt
        </Button>
      </div>

      <div className="relative bg-gray-900 rounded-2xl p-6 border border-white/5 min-h-[200px] flex flex-col justify-center">
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isBusy ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}
          >
            <Cpu size={24} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm">
              Przeglądarka: {isBusy ? 'PRZECIĄŻONA' : 'GOTOWA'}
            </div>
            <div className="text-xxs text-gray-700 uppercase font-black">
              {isBusy ? 'Mielenie JavaScriptu...' : 'Oczekiwanie na akcję'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {isBusy ? (
            queue.map((item, i) => (
              <div
                key={i}
                className="h-8 bg-rose-500/20 border border-rose-500/30 rounded-lg flex items-center px-4 animate-fade-in-right"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <span className="text-xxs font-mono text-rose-400">{item}</span>
              </div>
            ))
          ) : (
            <div className="h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center px-4 text-xxs font-mono text-emerald-400 italic">
              Wątek wolny. Reakcja na kliknięcie &lt; 50ms.
            </div>
          )}
        </div>

        {isBusy && (
          <div className="absolute top-1/2 right-12 -translate-y-1/2 flex flex-col items-center animate-bounce">
            <MousePointer2 className="text-white" />
            <span className="text-xxxs font-bold uppercase mt-1 text-rose-500">
              Kliknięcie zablokowane
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// 5. REVENUE LOSS CALCULATOR
export const RevenueLossCalculator = () => {
  const [traffic, setTraffic] = useState(10000);
  const [convRate, setConvRate] = useState(2);
  const [orderVal, setOrderVal] = useState(250);
  const [loadTime, setLoadTime] = useState(4);

  // Industry standard: 7% drop in conversion for every second over 2s
  const secondsOver = Math.max(0, loadTime - 2);
  const potentialRevenue = traffic * (convRate / 100) * orderVal;
  const lossPercentage = secondsOver * 0.07;
  const monthlyLoss = potentialRevenue * lossPercentage;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 not-prose relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

      <div className="relative z-10">
        <div className="space-y-8 mb-12">
          <CalculatorSlider
            label="Miesięczny ruch (Unikalni użytkownicy)"
            val={traffic}
            setVal={setTraffic}
            min={1000}
            max={100000}
            step={1000}
            unit=""
          />
          <CalculatorSlider
            label="Obecny czas ładowania strony (sekundy)"
            val={loadTime}
            setVal={setLoadTime}
            min={1}
            max={10}
            step={0.5}
            unit="s"
          />
        </div>

        <div className="bg-dark rounded-[2rem] p-8 text-white text-center shadow-xl">
          <div className="text-xxs font-black uppercase text-primary tracking-widest mb-2">
            Szacowane utracone przychody miesięcznie
          </div>
          <div className="text-4xl md:text-5xl font-black text-white mb-4">
            ~{Math.round(monthlyLoss).toLocaleString()} PLN
          </div>
          <p className="text-xs text-gray-600 max-w-xs mx-auto leading-relaxed">
            Wyliczone na podstawie spadku konwersji o 7% na każdą sekundę opóźnienia powyżej 2s.
          </p>
        </div>

        <div className="mt-8 flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <CheckCircle2 className="text-primary shrink-0" size={20} />
          <p className="text-xs text-blue-800 leading-relaxed m-0">
            Optymalizacja Core Web Vitals do "zielonych" wyników może odzyskać te środki bez
            zwiększania wydatków na reklamy. To najczystszy zysk.
          </p>
        </div>
      </div>
    </div>
  );
};

interface CalculatorSliderProps {
  label: string;
  val: number;
  setVal: (val: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const CalculatorSlider = ({ label, val, setVal, min, max, step, unit }: CalculatorSliderProps) => (
  <div>
    <div className="flex justify-between mb-3">
      <label className="text-sm font-bold text-dark">{label}</label>
      <span className="text-primary font-mono font-bold">
        {val}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={val}
      onChange={(e) => setVal(parseFloat(e.target.value))}
      aria-label={`Ustaw wartość dla: ${label}`}
      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#61B6DE]"
    />
  </div>
);

// 6. ICEBERG DIAGRAM
export const IcebergDiagram = () => {
  return (
    <div className="bg-gradient-to-b from-[#E0EFFF] to-secondary rounded-3xl p-12 overflow-hidden shadow-2xl relative min-h-[400px] flex flex-col items-center justify-center text-white not-prose">
      {/* Water Line */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-white opacity-20 border-t border-dashed border-white/50"></div>

      {/* Iceberg Top */}
      <div className="relative z-10 flex flex-col items-center mb-24">
        <div className="bg-white/90 backdrop-blur-md text-dark px-6 py-2 rounded-full font-black text-sm shadow-xl flex items-center gap-2">
          <Zap size={16} className="text-emerald-500" /> Lab Data: 100/100
        </div>
        <div className="mt-4 text-xxs uppercase font-black tracking-[0.2em] opacity-60 text-center">
          To co widzisz na swoim <br />
          mocnym komputerze
        </div>
      </div>

      {/* Iceberg Bottom */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-rose-500 text-white px-6 py-2 rounded-full font-black text-sm shadow-xl flex items-center gap-2">
          <AlertTriangle size={16} /> Field Data: 45/100
        </div>
        <div className="mt-4 text-xxs uppercase font-black tracking-[0.2em] text-blue-100 text-center">
          Rzeczywistość Twoich klientów <br />
          (Słabe WiFi, stare telefony)
        </div>
      </div>

      {/* Floating Labels */}
      <div className="absolute top-4 left-4 text-xxs font-black uppercase text-blue-800 opacity-40">
        Surface Level
      </div>
      <div className="absolute bottom-4 left-4 text-xxs font-black uppercase text-white opacity-40">
        Bottom Truth
      </div>
    </div>
  );
};

// 7. CWV CHECKLIST
export const CwvChecklist = () => {
  const [checked, setChecked] = useState<number[]>([]);
  const items = [
    { id: 1, title: 'LCP: Optymalizacja mediów', desc: 'Zastosuj WebP/AVIF oraz CDN.' },
    { id: 2, title: 'LCP: Szybki czas odpowiedzi', desc: 'Włącz Redis i cachowanie na serwerze.' },
    {
      id: 3,
      title: 'CLS: Zarezerwuj miejsce',
      desc: 'Podawaj Width i Height dla grafik i reklam.',
    },
    { id: 4, title: 'INP: Usuń blokujący JS', desc: 'Skróć czas parsowania skryptów third-party.' },
    { id: 5, title: 'INP: Web Workers', desc: 'Przenieś ciężką logikę poza główny wątek.' },
  ];
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden not-prose">
      <div className="bg-dark p-8 text-white text-center">
        <h3 className="text-xl font-bold">SEO Readiness 2025</h3>
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
