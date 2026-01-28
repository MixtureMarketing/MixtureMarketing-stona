/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Zap,
  RotateCw,
  Search,
  Eye,
  Globe,
  Server,
  Smartphone,
  Anchor,
  Wind,
  CheckCircle2,
  XCircle,
  BarChart3,
} from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';

// --- HERO RACE ANIMATION ---
export const NextHeroRace: React.FC = () => {
  const [isRacing, setIsRacing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsRacing(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full bg-[#0B1120] rounded-[2rem] p-8 md:p-12 overflow-hidden border border-white/5 shadow-2xl group">
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

      <div className="relative z-10 space-y-12">
        {/* Track 1: SPA */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-xxs font-black uppercase tracking-[0.2em] text-gray-500">
              Track 01: Client-Side React (SPA)
            </span>
            <span className="text-xxs font-mono text-gray-600">Loading JS...</span>
          </div>
          <div className="h-16 bg-white/5 rounded-2xl relative border border-white/5 flex items-center px-6 overflow-hidden">
            <div
              className={`flex items-center gap-4 transition-all duration-[4000ms] ease-in-out ${isRacing ? 'translate-x-[200px] md:translate-x-[400px]' : 'translate-x-0'}`}
            >
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[#61DAFB] animate-spin-slow">
                <RotateCw size={24} />
              </div>
              <div className="flex flex-col">
                <div className="h-2 w-24 bg-white/10 rounded-full"></div>
                <div className="h-1.5 w-16 bg-white/5 rounded-full mt-2"></div>
              </div>
            </div>
            {/* Loading Spinner overlay when "stuck" */}
            {!isRacing && (
              <div className="absolute inset-0 bg-[#0B1120]/40 backdrop-blur-sm flex items-center justify-center">
                <RotateCw className="text-[#61DAFB] animate-spin" size={20} />
              </div>
            )}
          </div>
        </div>

        {/* Track 2: Next.js */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-xxs font-black uppercase tracking-[0.2em] text-primary">
              Track 02: Next.js (SSR/Static)
            </span>
            <span className="text-xxs font-mono text-success">Instant Delivery</span>
          </div>
          <div className="h-16 bg-primary/10 rounded-2xl relative border border-primary/20 flex items-center px-6 overflow-hidden">
            <div
              className={`flex items-center gap-4 transition-all duration-[800ms] cubic-bezier(0.34, 1.56, 0.64, 1) ${isRacing ? 'translate-x-[calc(100%_-_10px)] left-full' : 'translate-x-0'}`}
              style={{ transform: isRacing ? 'translateX(calc(100vw))' : 'translateX(0)' }}
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                <Zap size={24} fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <div className="h-2 w-24 bg-white/40 rounded-full"></div>
                <div className="h-1.5 w-16 bg-white/20 rounded-full mt-2"></div>
              </div>
            </div>
            {/* Speed lines */}
            {isRacing && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-px bg-gradient-to-r from-transparent via-primary to-transparent w-32 animate-speed-line"
                    style={{ top: `${20 * i + 10}%`, animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => {
            setIsRacing(false);
            setTimeout(() => setIsRacing(true), 100);
          }}
          className="text-xxs font-black uppercase tracking-widest text-primary hover:text-white transition-colors border border-primary/30 px-4 py-2 rounded-full"
        >
          Restart Race
        </button>
      </div>

      <style>{`
        @keyframes speed-line {
            0% { transform: translateX(-100%); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: translateX(400%); opacity: 0; }
        }
        .animate-speed-line {
            animation: speed-line 0.5s linear infinite;
        }
        .animate-spin-slow {
            animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

// --- GOOGLE VISION DIAGRAM ---
export const GoogleVisionDiagram: React.FC = () => {
  const [activeTab, setActiveCms] = useState<'csr' | 'ssr' | 'ssg'>('ssr');

  const data = {
    csr: {
      title: 'Client-Side Rendering',
      subtitle: 'Zwykły React',
      desc: "Przeglądarka dostaje 'pusty' plik HTML i ogromną paczkę JavaScript. Robot Google widzi tylko kontener <div>, dopóki JS się nie wyrenderuje.",
      seo: 2,
      speed: 'Wolno (TBT high)',
      icon: <RotateCw className="text-[#61DAFB]" />,
      color: '#61DAFB',
    },
    ssr: {
      title: 'Server-Side Rendering',
      subtitle: 'Next.js dynamic',
      desc: 'Serwer generuje HTML przy każdym zapytaniu. Użytkownik i Google dostają gotową treść w pierwszej milisekundzie. Idealne dla sklepów i newsów.',
      seo: 5,
      speed: 'Szybko (LCP low)',
      icon: <Server className="text-primary" />,
      color: '#61B6DE',
    },
    ssg: {
      title: 'Static Site Generation',
      subtitle: 'Next.js Pre-build',
      desc: 'Cała strona jest generowana podczas budowania. Serwowana bezpośrednio z CDN jak plik statyczny. Najszybsza możliwa opcja.',
      seo: 5,
      speed: 'Ekstremalnie (TTFB low)',
      icon: <Zap className="text-[#F4B400]" />,
      color: '#F4B400',
    },
  };

  const current = data[activeTab];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="flex bg-gray-50 p-2 border-b border-gray-100">
        {(['csr', 'ssr', 'ssg'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveCms(tab)}
            className={`flex-1 py-3 rounded-xl text-xxs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-dark shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {tab === 'csr' ? 'Standard React' : tab === 'ssr' ? 'Next.js SSR' : 'Next.js SSG'}
          </button>
        ))}
      </div>

      <div className="p-8 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual Side */}
          <div className="relative aspect-square max-w-[300px] mx-auto w-full">
            {/* Google Bot */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 bg-[#4285F4] p-4 rounded-2xl shadow-xl z-20 animate-bounce-subtle">
              <Search className="text-white" size={32} />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#4285F4] rotate-45"></div>
            </div>

            {/* The "Vision" Area */}
            <div
              className={`mt-16 w-full h-full rounded-2xl border-4 border-dashed transition-colors duration-500 flex flex-col items-center justify-center p-6 bg-gray-50 relative overflow-hidden`}
              style={{ borderColor: current.color }}
            >
              {activeTab === 'csr' ? (
                <div className="text-center space-y-4 w-full opacity-50">
                  <div className="absolute top-4 left-4 right-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="absolute top-12 left-4 w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
                  <div className="absolute top-12 right-4 left-20 h-12 bg-gray-200 rounded animate-pulse"></div>
                  <div className="absolute top-28 left-4 right-4 bottom-4 bg-gray-200 rounded animate-pulse flex items-center justify-center">
                    <div className="text-xxs font-mono text-gray-400">Loading JS bundle...</div>
                  </div>

                  <div className="relative z-10 bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-red-200 shadow-sm mt-12">
                    <p className="text-xxs font-mono text-red-500 font-bold flex items-center gap-1 justify-center">
                      <XCircle size={12} /> Empty HTML
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 w-full h-full flex flex-col pt-2">
                  {/* Mock Header */}
                  <div className="w-full h-4 bg-blue-100 rounded-md mb-4 flex items-center px-2 gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                    <div className="w-8 h-1 bg-blue-200 rounded-full"></div>
                  </div>
                  {/* Mock Content */}
                  <div className="flex gap-2 flex-1">
                    <div className="w-1/3 bg-gray-100 rounded-md flex items-center justify-center">
                      <Eye size={16} className="text-gray-300" />
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="w-full h-2 bg-gray-200 rounded-full"></div>
                      <div className="w-5/6 h-2 bg-gray-200 rounded-full"></div>
                      <div className="w-4/6 h-2 bg-gray-200 rounded-full"></div>
                      <div className="mt-auto w-24 h-6 bg-emerald-500 rounded-md flex items-center justify-center">
                        <span className="text-xxxs font-bold text-white uppercase">Kup teraz</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 bg-emerald-50 border border-emerald-100 p-2 rounded-lg">
                    <p className="text-xxs font-mono text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1 justify-center">
                      <CheckCircle2 size={12} /> Content Ready
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Side */}
          <div className="space-y-6 text-left">
            <div>
              <h3 className="text-2xl font-bold text-dark mb-1">{current.title}</h3>
              <p className="text-xs font-bold text-primary uppercase tracking-widest">
                {current.subtitle}
              </p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{current.desc}</p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <div className="text-xxs font-black text-gray-400 uppercase mb-1">Ocena SEO</div>
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < current.seo ? 'opacity-100' : 'opacity-20'}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xxs font-black text-gray-400 uppercase mb-1">Prędkość</div>
                <div className="text-xs font-bold text-dark">{current.speed}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- APP WEIGHT VISUAL ---
export const AppWeightVisual: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
          <Anchor size={120} />
        </div>
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-400">
          <Anchor size={32} />
        </div>
        <h3 className="text-xl font-bold text-dark mb-2">Old School SPA</h3>
        <p className="text-sm text-gray-600 mb-6">
          Cała logika aplikacji (megabajty kodu) trafia do telefonu użytkownika.
        </p>
        <div className="p-4 bg-red-50 rounded-xl border border-red-100 inline-flex flex-col gap-1">
          <span className="text-xxs font-black text-red-600 uppercase">Obciążenie CPU</span>
          <div className="h-1.5 w-32 bg-red-200 rounded-full overflow-hidden">
            <div className="h-full w-[90%] bg-red-600 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="bg-[#0B1120] p-8 rounded-3xl shadow-xl text-center relative overflow-hidden group border border-white/5">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:translate-y-[-10px] transition-transform">
          <Wind size={120} className="text-primary" />
        </div>
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-[0_0_20px_rgba(97,182,222,0.3)] border border-white/10">
          <Wind size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Next.js RSC</h3>
        <p className="text-sm text-gray-400 mb-6">
          Logika biznesowa zostaje na serwerze. Do telefonu trafia tylko lekki HTML.
        </p>
      </div>
    </div>
  );
};

// --- NEXTJS QUIZ ---
export const NextJsQuiz: React.FC = () => {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [result, setResult] = useState<string | null>(null);

  const questions = [
    { id: 1, text: 'Czy Twoja strona musi być widoczna w Google (SEO)?' },
    { id: 2, text: 'Czy budujesz sklep internetowy lub portal z treściami?' },
    { id: 3, text: 'Czy zależy Ci na ekstremalnie krótkim czasie ładowania?' },
    { id: 4, text: 'Czy planujesz skalowanie aplikacji dla tysięcy użytkowników?' },
  ];

  const handleAnswer = (id: number, val: boolean) => {
    const newAnswers = { ...answers, [id]: val };
    setAnswers(newAnswers);

    if (Object.keys(newAnswers).length === questions.length) {
      const yesCount = Object.values(newAnswers).filter(Boolean).length;
      if (yesCount >= 3) {
        setResult(
          'Zdecydowanie Next.js! Twoje wymagania dotyczące SEO i wydajności sprawiają, że Next.js jest najlepszym wyborem.',
        );
      } else if (yesCount >= 1) {
        setResult(
          'Warto rozważyć Next.js. Nawet przy mniejszych projektach, korzyści z SSR i optymalizacji obrazów dają przewagę na starcie.',
        );
      } else {
        setResult(
          'Standardowy React może wystarczyć, ale Next.js nadal byłby dobrą polisą na przyszłość.',
        );
      }
    }
  };

  return (
    <div className="bg-dark rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-10"></div>

      <div className="relative z-10 text-left">
        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <BarChart3 className="text-primary" />
          Szybki Test: Czy potrzebujesz Next.js?
        </h3>

        {!result ? (
          <div className="space-y-6">
            {questions.map((q) => (
              <div
                key={q.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/5 rounded-2xl border border-white/5"
              >
                <span className="text-sm font-medium">{q.text}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAnswer(q.id, true)}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${answers[q.id] === true ? 'bg-success text-white shadow-lg' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    TAK
                  </button>
                  <button
                    onClick={() => handleAnswer(q.id, false)}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${answers[q.id] === false ? 'bg-red-50 text-white shadow-lg' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    NIE
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-success/30">
              <CheckCircle2 size={40} className="text-success" />
            </div>
            <h4 className="text-xl font-bold mb-4">Wynik Analizy:</h4>
            <p className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">{result}</p>
            <button
              onClick={() => {
                setAnswers({});
                setResult(null);
              }}
              className="text-xs font-black uppercase tracking-widest text-primary hover:underline"
            >
              Zacznij od nowa
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
