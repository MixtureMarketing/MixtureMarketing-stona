import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { EASE, useCountUp } from './ui';

interface AuditScoreSidebarProps {
  score: number;
  screenshot?: string | null;
}

const tone = (s: number) =>
  s >= 85
    ? {
        stroke: '#00c853',
        ink: 'text-success',
        tag: 'bg-[#e7f8ee] text-[#027a34] border-[#bfead0]',
      }
    : s >= 60
      ? {
          stroke: '#f4b400',
          ink: 'text-[#b45309]',
          tag: 'bg-[#fff5e6] text-[#b45309] border-[#fde4c4]',
        }
      : {
          stroke: '#e11d48',
          ink: 'text-[#be123c]',
          tag: 'bg-[#fff1f2] text-[#be123c] border-[#fecdd3]',
        };

// Progi: min. możliwy wynik to 55 (suma kar −45), więc „krytyczny" < 50 był
// nieosiągalny — skala kłamała optymizmem. Teraz: <60 krytyczny, <85 ostrzegawczy.
const label = (s: number) =>
  s >= 85
    ? { tag: 'Stan wzorowy', desc: 'Świetna robota — Twoja strona pracuje na wynik.' }
    : s >= 60
      ? {
          tag: 'Stan ostrzegawczy',
          desc: 'Solidna baza, ale tracisz potencjał. Kilka poprawek dzieli Cię od czołówki.',
        }
      : {
          tag: 'Stan krytyczny',
          desc: 'Wymaga natychmiastowej naprawy — tracisz klientów każdego dnia.',
        };

const R = 86;
const CIRC = 2 * Math.PI * R;

const AuditScoreSidebar: React.FC<AuditScoreSidebarProps> = ({ score, screenshot }) => {
  const reduce = useReducedMotion();
  const value = useCountUp(score);
  const t = tone(score);
  const l = label(score);
  const offset = CIRC * (1 - score / 100);

  return (
    <div className="lg:col-span-3 bg-[#fbfcfd] p-8 border-r border-gray-200 flex flex-col items-center text-center lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto custom-scrollbar">
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-xs font-bold uppercase tracking-[0.04em] text-gray-400 mb-6">
          Indeks zdrowia witryny
        </h3>

        <div className="relative w-[196px] h-[196px] mb-2">
          <svg width="196" height="196" viewBox="0 0 196 196" className="-rotate-90">
            <circle cx="98" cy="98" r={R} fill="none" stroke="#eef0f3" strokeWidth="12" />
            <motion.circle
              cx="98"
              cy="98"
              r={R}
              fill="none"
              stroke={t.stroke}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              initial={reduce ? false : { strokeDashoffset: CIRC }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[62px] font-extrabold text-dark leading-none tabular-nums tracking-tight">
              {value}
              <span className="text-[22px] text-gray-300 font-bold">/100</span>
            </span>
            <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-400 mt-1">
              punktów
            </span>
          </div>
        </div>

        <div className="w-full max-w-[250px] mt-3">
          <span
            className={`inline-flex items-center gap-2 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg border ${t.tag}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${t.ink} bg-current`} /> {l.tag}
          </span>
          <p className="text-[13px] text-gray-500 mt-3 leading-relaxed">{l.desc}</p>
        </div>

        {screenshot ? (
          <div className="mt-8 w-[178px] h-[356px] rounded-[22px] bg-[#0f1622] p-[7px] shadow-[0_10px_30px_-12px_rgba(16,24,40,0.35)] relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-[5px] rounded-[3px] bg-[#2a3444] z-10" />
            <img
              src={screenshot}
              alt="Podgląd mobilny audytowanej strony"
              className="w-full h-full rounded-[16px] object-cover object-top bg-white"
            />
          </div>
        ) : (
          <div className="mt-8 w-[178px] h-[356px] rounded-[22px] bg-gray-100 border border-gray-200 grid place-items-center">
            <div className="text-center p-6">
              <RefreshCw className="animate-spin mx-auto text-gray-400 mb-3" size={28} />
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-[0.1em]">
                Renderowanie…
              </span>
            </div>
          </div>
        )}
        <p className="mt-4 text-[11px] text-gray-400 font-semibold uppercase tracking-[0.08em] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success" /> Podgląd mobilny na żywo
        </p>
      </div>
    </div>
  );
};

export default AuditScoreSidebar;
