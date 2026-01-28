/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  Server,
  Cpu,
  Database,
  Layers,
  Zap,
  ShieldCheck,
  Rocket,
  Box,
  Workflow,
  ChefHat,
  UtensilsCrossed,
  Pizza,
  Warehouse,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Code2,
  Lock,
  Globe,
} from 'lucide-react';

// 1. BACKEND ICEBERG HERO
export const BackendIcebergHero = () => {
  const [bubbles, setBubbles] = React.useState<{ left: number; delay: number; duration: number }[]>(
    [],
  );

  React.useEffect(() => {
    setBubbles(
      [...Array(15)].map(() => ({
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 10 + Math.random() * 10,
      })),
    );
  }, []);

  return (
    <div className="relative w-full bg-[#020617] rounded-[3rem] p-8 md:p-16 overflow-hidden border border-white/10 shadow-2xl min-h-[600px] md:min-h-[850px] flex flex-col items-center group font-sans">
      <div className="absolute inset-0 bg-[#020617] opacity-80 z-0">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#61B6DE 1px, transparent 1px), linear-gradient(90deg, #61B6DE 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]"></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-blue-900/20 blur-[100px] pointer-events-none"></div>

      <div className="absolute top-[35%] w-full h-[2px] bg-blue-400/20 z-30 flex items-center shadow-[0_0_20px_rgba(97,182,222,0.3)]">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
        <div className="absolute right-8 md:right-16 -top-8 bg-[#020617]/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-blue-400/30 text-xxs font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
          Powierzchnia UI
        </div>
      </div>

      <div className="relative z-20 w-full max-w-2xl h-full flex flex-col items-center mt-12 md:mt-0">
        <div className="relative z-40 animate-float-peak">
          <div className="w-64 h-48 md:w-80 md:h-64 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-blue-100 clip-iceberg-peak shadow-[0_0_50px_rgba(255,255,255,0.2)] border-t border-white/60"></div>

            <div className="relative z-10 flex flex-col items-center gap-2 mt-8 md:mt-12">
              <div className="w-12 h-12 bg-white/90 rounded-2xl flex items-center justify-center shadow-lg text-blue-600 mb-1">
                <Globe size={24} />
              </div>
              <div className="text-center">
                <div className="text-dark font-black uppercase tracking-[0.2em] text-sm m-0">
                  Frontend
                </div>
                <p className="text-blue-500 font-bold uppercase text-xxs tracking-widest mt-0.5 opacity-70">
                  To co widać
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full -mt-2 animate-float-base">
          <div className="relative bg-gradient-to-b from-blue-500/10 via-blue-900/60 to-[#020617] backdrop-blur-sm clip-iceberg-base border border-blue-400/10 shadow-[0_0_100px_rgba(59,130,246,0.15)] p-8 md:p-16 pt-24 pb-32">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>

            <div className="flex flex-col items-center">
              <div className="inline-flex items-center gap-3 bg-blue-950/50 px-5 py-2 rounded-full border border-blue-400/20 mb-10 backdrop-blur-md">
                <div className="text-blue-200 font-bold uppercase tracking-[0.2em] text-xxs m-0">
                  Fundament Backend
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10 w-full max-w-lg">
                {[
                  { icon: <Server size={20} />, label: 'Logika Biznesowa' },
                  { icon: <Database size={20} />, label: 'Bazy Danych' },
                  { icon: <Lock size={20} />, label: 'Bezpieczeństwo' },
                  { icon: <Workflow size={20} />, label: 'Integracje API' },
                  { icon: <Cpu size={20} />, label: 'Skalowanie' },
                  { icon: <Zap size={20} />, label: 'Wydajność' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-3 group/item transition-transform hover:-translate-y-1 duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-900/30 border border-blue-500/20 flex items-center justify-center text-blue-300 group-hover/item:bg-blue-500/20 group-hover/item:text-white group-hover/item:border-blue-400/50 transition-all shadow-lg shadow-blue-900/20">
                      {item.icon}
                    </div>
                    <span className="text-xxs font-bold text-blue-300/60 uppercase tracking-widest text-center group-hover/item:text-blue-200 transition-colors">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {bubbles.map((b, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-rise"
            style={{
              left: `${b.left}%`,
              bottom: '-10%',
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`,
            }}
          ></div>
        ))}
      </div>

      <style>{`
                .clip-iceberg-peak {
                    clip-path: polygon(50% 0%, 85% 100%, 15% 100%);
                }
                .clip-iceberg-base {
                    clip-path: polygon(15% 0%, 85% 0%, 100% 25%, 85% 90%, 50% 100%, 15% 90%, 0% 25%);
                }
                @keyframes float-peak {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-8px) rotate(0.5deg); }
                }
                @keyframes float-base {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-12px) rotate(-0.5deg); }
                }
                .animate-float-peak {
                    animation: float-peak 6s ease-in-out infinite;
                }
                .animate-float-base {
                    animation: float-base 7s ease-in-out infinite;
                    animation-delay: 0.5s;
                }
                @keyframes rise {
                    0% { transform: translateY(0); opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { transform: translateY(-800px); opacity: 0; }
                }
                .animate-rise {
                    animation: rise linear infinite;
                }
             `}</style>
    </div>
  );
};

// 2. RESTAURANT ANALOGY
export const RestaurantAnalogyVisual = () => {
  return (
    <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-slate-50 opacity-50"></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-gray-100 hover:shadow-xl transition-all group/item">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover/item:scale-110 group-hover/item:rotate-3 transition-all">
            <Pizza size={32} />
          </div>
          <div className="text-xxs font-black uppercase text-blue-600 tracking-widest mb-1">
            1. Klient
          </div>
          <h4 className="font-bold text-dark mb-2">Frontend (UI)</h4>
          <p className="text-xxs text-gray-500 leading-relaxed">
            Przegląda menu, wybiera produkty i klika "Zamów". Widzi tylko końcowy efekt.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-gray-100 hover:shadow-xl transition-all group/item">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover/item:scale-110 group-hover/item:-rotate-3 transition-all">
            <UtensilsCrossed size={32} />
          </div>
          <div className="text-xxs font-black uppercase text-amber-600 tracking-widest mb-1">
            2. Kelner
          </div>
          <h4 className="font-bold text-dark mb-2">API</h4>
          <p className="text-xxs text-gray-500 leading-relaxed">
            Przekazuje informacje między klientem a kuchnią. Dba o to, by zamówienie dotarło
            bezpiecznie.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-8 bg-dark text-white rounded-3xl shadow-2xl scale-105 relative z-20 group/item border border-white/10">
          <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-4 animate-pulse shadow-[0_0_20px_rgba(97,182,222,0.4)]">
            <ChefHat size={32} />
          </div>
          <div className="text-xxs font-black uppercase text-primary tracking-widest mb-1">
            3. Kuchnia
          </div>
          <h4 className="font-bold mb-2 text-white text-lg">Backend</h4>
          <p className="text-xxs text-gray-300 leading-relaxed font-medium">
            Tu dzieje się magia. Kucharze (Języki Programowania) przygotowują dane, sprawdzają
            reguły i logikę.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-gray-100 hover:shadow-xl transition-all group/item">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover/item:scale-110 transition-all">
            <Warehouse size={32} />
          </div>
          <div className="text-xxs font-black uppercase text-emerald-600 tracking-widest mb-1">
            4. Spiżarnia
          </div>
          <h4 className="font-bold text-dark mb-2">Baza Danych</h4>
          <p className="text-xxs text-gray-500 leading-relaxed">
            Bezpieczny magazyn składników. Przechowuje profile użytkowników, ceny i historię
            zamówień.
          </p>
        </div>
      </div>
    </div>
  );
};

// 3. TECHNOLOGY STARS TABLE
interface Technology {
  name: string;
  power: string;
  ttm: number;
  perf: number;
  label: string;
  dev: number;
}

interface TechnologyStarsTableProps {
  content: {
    technologies: Technology[];
  };
}

export const TechnologyStarsTable = ({ content }: TechnologyStarsTableProps) => {
  const technologies = content.technologies;

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-0.5 justify-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={12}
            className={i < count ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-2xl bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-dark text-white">
            <th className="p-6 text-left font-bold uppercase tracking-wider text-xxs">
              Technologia
            </th>
            <th className="p-6 text-center font-bold uppercase tracking-wider text-xxs hidden md:table-cell">
              Główna Supermoc
            </th>
            <th className="p-6 text-center font-bold uppercase tracking-wider text-xxs">
              Time-to-Market
            </th>
            <th className="p-6 text-center font-bold uppercase tracking-wider text-xxs">
              Wydajność
            </th>
            <th className="p-6 text-center font-bold uppercase tracking-wider text-xxs hidden sm:table-cell">
              Rynek Pracy
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {technologies.map((tech) => (
            <tr key={tech.name} className="hover:bg-blue-50/30 transition-colors">
              <td className="p-6">
                <div className="font-bold text-dark">{tech.name}</div>
              </td>
              <td className="p-6 text-center hidden md:table-cell">
                <span className="text-xxs font-bold text-secondary px-3 py-1 bg-blue-50 rounded-full border border-blue-100 uppercase tracking-widest">
                  {tech.power}
                </span>
              </td>
              <td className="p-6 text-center">
                {renderStars(tech.ttm)}
                <div className="text-xxxs mt-1 text-gray-400 font-bold uppercase">
                  {tech.ttm === 5 ? 'Najszybciej' : ''}
                </div>
              </td>
              <td className="p-6 text-center">
                {renderStars(tech.perf)}
                <div className="text-xxxs mt-1 text-gray-400 font-bold uppercase">
                  {tech.perf === 5 ? 'Demon Prędkości' : ''}
                </div>
              </td>
              <td className="p-6 text-center hidden sm:table-cell">
                <div className="text-xxs font-bold text-gray-700 mb-1 uppercase tracking-tighter">
                  {tech.label}
                </div>
                {renderStars(tech.dev)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 4. ARCHITECTURE COMPARISON VISUAL
export const ArchitectureComparisonVisual = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-lg relative overflow-hidden group hover:border-blue-200 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[40px] opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Warehouse size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-dark m-0">Monolit</h4>
              <span className="text-xxs font-black uppercase text-blue-500 tracking-[0.2em]">
                Jedna Twierdza
              </span>
            </div>
          </div>

          <div className="w-full h-36 bg-gray-50 rounded-3xl mb-8 flex items-center justify-center p-4 border border-gray-100 group-hover:bg-white transition-colors">
            <div className="w-full h-full bg-blue-600 rounded-2xl border-4 border-white flex items-center justify-center shadow-xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 flex flex-wrap gap-1 p-2 opacity-20">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-white rounded-sm"></div>
                ))}
              </div>
              <span className="relative z-10 text-white font-black uppercase tracking-[0.3em] text-xs drop-shadow-md">
                Core System
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-emerald-100 rounded-full p-0.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                <strong>Zalety:</strong> Niższy koszt początkowy, szybkość budowy MVP, proste
                testowanie i wdrożenie.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-red-100 rounded-full p-0.5">
                <XCircle size={14} className="text-red-600" />
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                <strong>Wady:</strong> Trudniejsze skalowanie wybranych modułów, większe ryzyko przy
                zmianach w kodzie.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-lg relative overflow-hidden group hover:border-cyan-200 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full blur-[40px] opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Layers size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-dark m-0">Mikroserwisy</h4>
              <span className="text-xxs font-black uppercase text-cyan-500 tracking-[0.2em]">
                Sieć Miast
              </span>
            </div>
          </div>

          <div className="w-full h-36 bg-gray-50 rounded-3xl mb-8 flex items-center justify-center gap-4 px-4 border border-gray-100 group-hover:bg-white transition-colors">
            <div className="w-12 h-12 bg-cyan-500 rounded-xl border-2 border-white shadow-lg animate-bounce-slow flex items-center justify-center">
              <Zap size={16} className="text-white opacity-50" />
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl border-2 border-white shadow-lg animate-bounce-slow delay-150 flex items-center justify-center">
              <Database size={16} className="text-white opacity-50" />
            </div>
            <div className="w-12 h-12 bg-indigo-500 rounded-xl border-2 border-white shadow-lg animate-bounce-slow delay-300 flex items-center justify-center">
              <Lock size={16} className="text-white opacity-50" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-emerald-100 rounded-full p-0.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                <strong>Zalety:</strong> Niezależne skalowanie modułów, wysoka odporność na błędy
                całego systemu.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-red-100 rounded-full p-0.5">
                <XCircle size={14} className="text-red-600" />
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                <strong>Wady:</strong> Wysoki koszt utrzymania, ogromna złożoność operacyjna i
                wymagania DevOps.
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .delay-150 { animation-delay: 0.15s; }
                .delay-300 { animation-delay: 0.3s; }
            `}</style>
    </div>
  );
};

// 5. BACKEND DECISION TREE
interface DecisionStep {
  step: string;
  q: string;
  ans: string;
}

interface BackendDecisionTreeProps {
  content: {
    steps: DecisionStep[];
  };
}

export const BackendDecisionTree = ({ content }: BackendDecisionTreeProps) => {
  return (
    <div className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-[3rem] p-8 md:p-12 border border-blue-100 shadow-inner relative overflow-hidden not-prose">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(#61B6DE 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      ></div>

      <div className="relative z-10 space-y-10">
        {content.steps.map((step, i) => (
          <div key={i} className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/2 bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center justify-between group hover:border-blue-400 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-blue-600/20">
                  {step.step}
                </div>
                <span className="font-bold text-dark">{step.q}</span>
              </div>
              <ArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="flex-1 w-full">
              <div
                className={`p-5 rounded-2xl text-center shadow-xl transform hover:-translate-y-1 transition-transform border ${i === 0 ? 'bg-emerald-500 border-emerald-400' : i === 1 ? 'bg-blue-600 border-blue-500' : i === 2 ? 'bg-dark border-white/10' : 'bg-cyan-600 border-cyan-500'} text-white`}
              >
                <div className="text-xxxs font-black uppercase mb-1 tracking-widest opacity-80">
                  Wybierz:
                </div>
                <div className="font-black text-lg">{step.ans}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
