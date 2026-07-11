import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Zap, Server, Database, Search, CheckCircle2 } from 'lucide-react';

interface AuditProgressProps {
  targetUrl: string;
  onComplete: () => void;
  isDataReady: boolean;
}

const STEPS = [
  { icon: Smartphone, label: 'Wykonywanie zdjęcia wersji mobilnej...' },
  { icon: Search, label: 'Analiza słów kluczowych i widoczności...' },
  { icon: Zap, label: 'Testowanie Core Web Vitals (LCP, CLS)...' },
  { icon: Server, label: 'Skanowanie konfiguracji serwera...' },
  { icon: Database, label: 'Weryfikacja tagów analitycznych (GTM)...' },
  { icon: CheckCircle2, label: 'Generowanie raportu końcowego...' },
];

const TIPS = [
  'Czy wiesz, że 53% użytkowników mobilnych opuszcza stronę, która ładuje się dłużej niż 3 sekundy?',
  'Google używa „Mobile-First Indexing” — Twoja wersja mobilna decyduje o pozycji w wyszukiwarce.',
  'Brak certyfikatu SSL może obniżyć konwersję nawet o 40% z powodu ostrzeżeń przeglądarki.',
  'Poprawa wyniku LCP o 1 sekundę może zwiększyć przychody sklepu internetowego o 7%.',
  'Piksel Facebooka pozwala na remarketing — docieranie do osób, które już były na Twojej stronie.',
  'Dobre UX to nie wygląd, lecz łatwość realizacji celu przez klienta.',
];

const AuditProgress: React.FC<AuditProgressProps> = ({ targetUrl, onComplete, isDataReady }) => {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(tipInterval);
  }, []);

  useEffect(() => {
    const totalDuration = 12000; // 12 seconds minimum tension
    const intervalTime = 100;
    const increment = 100 / (totalDuration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90 && !isDataReady) return 90;
        if (isDataReady && prev >= 90) return Math.min(prev + 2, 100);
        return Math.min(prev + increment, 90);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isDataReady]);

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(onComplete, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  const stepDuration = 100 / STEPS.length;
  const currentStepIndex = Math.min(Math.floor(progress / stepDuration), STEPS.length - 1);
  const CurrentIcon = STEPS[currentStepIndex].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_60px_-30px_rgba(16,24,40,0.18)] p-8 md:p-14 max-w-4xl mx-auto text-center border border-gray-200 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
        <motion.div
          className="h-full bg-success"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="mb-10 relative w-44 h-44 mx-auto flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 192 192">
          <circle cx="96" cy="96" r="88" fill="none" stroke="#eef0f3" strokeWidth="10" />
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="10"
            strokeDasharray={553}
            strokeDashoffset={553 - (553 * progress) / 100}
            strokeLinecap="round"
            className="transition-all duration-300 ease-linear"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3F3D91" />
              <stop offset="100%" stopColor="#00C853" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
          <span className="text-dark font-extrabold text-5xl tracking-tight tabular-nums">
            {Math.round(progress)}
            <span className="text-2xl text-gray-300">%</span>
          </span>
          <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.1em] mt-1">
            Status analizy
          </span>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-bold text-dark mb-2 tracking-tight">Analiza w toku…</h2>
        <p className="text-gray-500">
          Skanujemy każdy element strony:{' '}
          <span className="text-secondary font-semibold">{targetUrl}</span>
        </p>
      </div>

      <div className="bg-[#f8f9fb] rounded-xl p-5 mb-10 border border-gray-100 min-h-[92px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-[14px] text-gray-600 leading-relaxed max-w-lg"
          >
            {TIPS[tipIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch text-left">
        <div className="bg-[#0f1622] rounded-xl p-5 font-mono text-[11px] h-48 overflow-hidden relative">
          <div className="flex gap-1.5 mb-3.5 border-b border-white/10 pb-2.5">
            <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
            <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
            <span className="ml-2 text-gray-500 text-[10px] uppercase font-semibold tracking-[0.1em]">
              Mixture Engine
            </span>
          </div>
          <div className="space-y-1.5 text-[#4ade80]/85">
            {STEPS.slice(0, currentStepIndex + 1).map((s, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-blue-400 shrink-0">$</span>
                <span className="flex items-center gap-1.5">
                  {s.label}
                  <CheckCircle2 size={10} className="text-[#27c93f]" />
                </span>
              </div>
            ))}
            <div className="flex gap-2">
              <span className="text-blue-400 shrink-0">$</span>
              <span className="w-1.5 h-3.5 bg-[#27c93f]/60 animate-pulse" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-[#0f1622] to-transparent" />
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.08em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success" /> Aktualnie przetwarzane
          </h4>
          <div className="bg-white rounded-xl p-5 border border-gray-200 flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-xl bg-[#eeeefb] grid place-items-center text-secondary shrink-0">
              <CurrentIcon size={26} />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-dark mb-0.5 leading-tight">
                {STEPS[currentStepIndex].label.split('...')[0]}
              </div>
              <div className="text-[12px] text-success font-semibold">Analiza w toku…</div>
            </div>
          </div>
          <p className="text-[11px] text-gray-400">
            Silnik oparty o Google Lighthouse i Puppeteer.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AuditProgress;
