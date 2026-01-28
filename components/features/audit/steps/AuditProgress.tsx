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

const AuditProgress: React.FC<AuditProgressProps> = ({ targetUrl, onComplete, isDataReady }) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const TIPS = [
    "Czy wiesz, że 53% użytkowników mobilnych opuszcza stronę, która ładuje się dłużej niż 3 sekundy?",
    "Google używa 'Mobile-First Indexing' – Twoja wersja mobilna decyduje o pozycji w wyszukiwarce.",
    "Brak certyfikatu SSL może obniżyć Twoją konwersję o nawet 40% z powodu ostrzeżeń przeglądarki.",
    "Poprawa wyniku LCP o 1 sekundę może zwiększyć przychody sklepu internetowego o 7%.",
    "Piksel Facebooka pozwala na remarketing, czyli docieranie do osób, które już były na Twojej stronie.",
    "Dobre UX to nie tylko wygląd, to przede wszystkim łatwość realizacji celu przez klienta."
  ];

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
        // Jeśli dane nie są gotowe, zatrzymaj się na 90%
        if (prev >= 90 && !isDataReady) {
          return 90;
        }
        // Jeśli dane są gotowe i jesteśmy blisko końca, przyspiesz
        if (isDataReady && prev >= 90) {
          return Math.min(prev + 2, 100);
        }
        return Math.min(prev + increment, 90);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isDataReady]);

  // Update text steps based on progress
  useEffect(() => {
    const stepDuration = 100 / STEPS.length;
    const newIndex = Math.min(Math.floor(progress / stepDuration), STEPS.length - 1);
    setCurrentStepIndex(newIndex);

    if (progress >= 100) {
      setTimeout(onComplete, 500);
    }
  }, [progress, onComplete]);

  const CurrentIcon = STEPS[currentStepIndex].icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-16 max-w-4xl mx-auto text-center border border-gray-100 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-gray-50">
        <motion.div 
          className="h-full bg-gradient-to-r from-secondary to-[#00C853]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="mb-12 relative w-48 h-48 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 bg-success/5 rounded-full animate-ping"></div>
        <svg className="w-full h-full transform -rotate-90 relative z-10">
          <circle cx="96" cy="96" r="90" fill="none" stroke="#F3F4F6" strokeWidth="10" />
          <circle
            cx="96"
            cy="96"
            r="90"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="10"
            strokeDasharray={565}
            strokeDashoffset={565 - (565 * progress) / 100}
            strokeLinecap="round"
            className="transition-all duration-300 ease-linear shadow-lg"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3F3D91" />
              <stop offset="100%" stopColor="#00C853" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
          <span className="text-dark font-black text-5xl tracking-tighter">
            {Math.round(progress)}<span className="text-2xl text-gray-300">%</span>
          </span>
          <span className="text-xxs font-bold text-gray-400 uppercase tracking-widest mt-1">Status Analizy</span>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-black text-dark mb-3">
          Magia dzieje się <span className="text-secondary">teraz...</span>
        </h2>
        <p className="text-gray-500 font-medium">Analizujemy każdy bajt na: <span className="text-success underline decoration-dotted underline-offset-4">{targetUrl}</span></p>
      </div>

      {/* Dynamic Tip Section */}
      <div className="bg-blue-50/50 rounded-2xl p-6 mb-12 border border-blue-100/50 min-h-[100px] flex flex-col justify-center transition-all">
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm md:text-base text-dark font-bold leading-relaxed italic"
          >
            " {TIPS[tipIndex]} "
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Terminal logs effect */}
        <div className="bg-gray-900 rounded-2xl p-6 text-left font-mono text-xxs h-48 overflow-hidden relative shadow-inner">
          <div className="flex gap-2 mb-4 border-b border-white/10 pb-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="ml-2 text-gray-500 text-xxxs uppercase font-bold tracking-widest">Live Engine Console</span>
          </div>
          <div className="space-y-1.5 text-green-400/80">
            {STEPS.slice(0, currentStepIndex + 1).map((s, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-gray-600 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-blue-400">root@mixture:~$</span>
                  {s.label}
                  <CheckCircle2 size={10} className="text-green-500" />
                </span>
              </div>
            ))}
            <div className="flex gap-3 animate-pulse">
              <span className="text-gray-600 shrink-0">[{new Date().toLocaleTimeString()}]</span>
              <span className="flex items-center gap-1.5">
                <span className="text-blue-400">root@mixture:~$</span>
                <span className="w-2 h-4 bg-green-500/50"></span>
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-900 to-transparent"></div>
        </div>

        <div className="space-y-4 text-left">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div> 
            Aktualnie przetwarzane:
          </h4>
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-center gap-6 group">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-secondary shadow-sm group-hover:scale-110 transition-transform duration-500">
              <CurrentIcon size={32} className="animate-bounce" />
            </div>
            <div>
              <div className="text-lg font-black text-dark mb-1 leading-tight">
                {STEPS[currentStepIndex].label.split('...')[0]}
              </div>
              <div className="text-xs text-success font-bold uppercase tracking-wider">
                Analiza w toku...
              </div>
            </div>
          </div>
          <p className="text-xxs text-gray-400 italic">
            * Używamy zaawansowanego silnika Mixture Engine™ opartego o Google Lighthouse 11.0 i Puppeteer.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AuditProgress;
