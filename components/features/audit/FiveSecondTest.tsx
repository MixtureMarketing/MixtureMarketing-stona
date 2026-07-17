import React, { useState } from 'react';
import { Timer, RotateCcw } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionWrapper from '../../common/SectionWrapper';
import { useAnimationFrameInterval } from '../../../hooks/useAnimationFrameInterval';
import { VISUAL_AUDIT_CONTENT as CONTENT } from '../../../data/content/services/design/visual-audit';

/**
 * Uczciwy test 5 sekund (2026-07-16): symulator pokazuje abstrakcyjną makietę
 * przez 5 s, a potem zadaje trzy PYTANIA protokołu — użytkownik ocenia się sam.
 * Wcześniej sekcja pokazywała preparowany wynik (Logo ✓ / CTA ✗), czyli atrapę
 * badania, którego nikt nie przeprowadził.
 */
const FiveSecondTest: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');

  useAnimationFrameInterval(
    () => {
      if (timeLeft > 1) {
        setTimeLeft((prev) => prev - 1);
      } else {
        setPhase('done');
        setTimeLeft(5);
      }
    },
    1000,
    phase === 'running',
  );

  return (
    <SectionWrapper variant="white" containerClassName="max-w-screen-xl">
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2">
          <SectionHeader
            align="left"
            title={CONTENT.test5s.title}
            description={CONTENT.test5s.description}
          />

          <div className="space-y-6 mt-10">
            {CONTENT.test5s.stats?.map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="text-3xl font-black text-secondary w-16">{stat.val}</div>
                <div className="text-sm font-bold text-gray-600 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-1/2 w-full flex justify-center">
          <AnimateOnScroll delay={200} className="w-full max-w-md">
            <div
              className="relative w-full aspect-square bg-[#F8F9FA] rounded-[2.5rem] border-2 border-gray-100 shadow-2xl p-8 flex flex-col items-center justify-center overflow-hidden"
              aria-live="polite"
            >
              {/* Start */}
              <div
                className={`absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-8 transition-all duration-500 ${phase === 'idle' ? 'opacity-100' : 'opacity-0 pointer-events-none scale-110'}`}
              >
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-secondary mb-6 shadow-inner">
                  <Timer size={40} aria-hidden="true" />
                </div>
                <button
                  onClick={() => setPhase('running')}
                  disabled={phase !== 'idle'}
                  className="px-8 py-4 bg-dark text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-dark/20"
                >
                  {CONTENT.test5s.labels.start}
                </button>
              </div>

              {/* Pytania protokołu po upływie czasu — bez preparowanych wyników */}
              <div
                className={`absolute inset-0 bg-white z-20 flex flex-col justify-center p-8 md:p-10 overflow-y-auto transition-all duration-500 ${phase === 'done' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                <div className="text-xxs font-black uppercase tracking-[0.2em] text-secondary mb-4">
                  {CONTENT.test5s.labels.timeUp}
                </div>
                <ol className="space-y-3 mb-6">
                  {CONTENT.test5s.labels.questions.map((q, i) => (
                    <li key={i} className="flex items-baseline gap-3">
                      <span
                        className="font-mono text-sm font-bold text-gray-500"
                        aria-hidden="true"
                      >
                        {i + 1}.
                      </span>
                      <span className="text-dark font-bold leading-snug">{q}</span>
                    </li>
                  ))}
                </ol>
                <p className="text-sm text-gray-700 leading-relaxed mb-6">
                  {CONTENT.test5s.labels.summary}
                </p>
                <button
                  onClick={() => setPhase('running')}
                  className="self-start flex items-center gap-2 px-6 py-3 bg-dark text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  {CONTENT.test5s.labels.retry}
                </button>
              </div>

              {/* Mini-strona oglądana przez 5 s — realna oferta, żeby pytania
                  protokołu MIAŁY odpowiedzi (puste szkielety = nie ma czego
                  zapamiętać; zgłoszone przez właściciela 2026-07-16). */}
              <div className="w-full h-full flex flex-col" aria-hidden={phase !== 'running'}>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xxs font-black uppercase tracking-widest text-gray-600">
                    Symulacja
                  </span>
                  <div className="text-2xl font-mono font-black text-dark">00:0{timeLeft}</div>
                </div>

                <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-black text-dark">
                      {CONTENT.test5s.mockPage.brand}
                    </span>
                    <div className="flex gap-2" aria-hidden="true">
                      <div className="w-8 h-1.5 bg-gray-100 rounded-full"></div>
                      <div className="w-8 h-1.5 bg-gray-100 rounded-full"></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-dark leading-tight mb-2">
                    {CONTENT.test5s.mockPage.heading}
                  </h3>
                  <p className="text-sm text-gray-700 leading-snug mb-5">
                    {CONTENT.test5s.mockPage.sub}
                  </p>
                  <div className="self-start px-5 py-2.5 bg-dark text-white rounded-lg text-xs font-black uppercase tracking-widest">
                    {CONTENT.test5s.mockPage.cta}
                  </div>
                  <div className="mt-auto space-y-2 pt-5" aria-hidden="true">
                    <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                    <div className="h-2 w-3/4 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default FiveSecondTest;
