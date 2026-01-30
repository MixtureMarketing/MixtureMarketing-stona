import React, { useState, useEffect } from 'react';
import { TrendingDown, ArrowDown, CheckCircle2, XCircle, FileCode, Server } from 'lucide-react';
import Button from '../../common/Button';
import GlassCard from '../../common/GlassCard';

// Refactored sub-visuals
import DdosSimulator from './cdn/DdosSimulator';
import ImageOptimizerComparison from './cdn/ImageOptimizerComparison';
import GlobalTrafficSimulation from './cdn/GlobalTrafficSimulation';

export { DdosSimulator, ImageOptimizerComparison, GlobalTrafficSimulation };

// 3. PING COUNTER
export const PingCounter = () => {
  const [ping, setPing] = useState(250);
  useEffect(() => {
    const interval = setInterval(() => {
      setPing((prev) => (prev <= 20 ? 20 : Math.max(20, prev - Math.floor(Math.random() * 5 + 2))));
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div
      className={`inline-flex items-center gap-3 px-6 py-2 rounded-xl border-2 transition-all duration-500 ${ping <= 50 ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}
    >
      <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">Latency</span>
      <div className="flex items-center gap-1">
        <span
          className={`text-2xl font-black font-mono ${ping <= 50 ? 'text-emerald-600' : 'text-rose-500'}`}
        >
          {ping}ms
        </span>
        {ping > 20 && <ArrowDown size={16} className="text-gray-600 animate-bounce" />}
      </div>
    </div>
  );
};

// 5. EDGE COMPUTING VISUAL
export const EdgeComputingVisual = () => {
  return (
    <div className="bg-[#0B1120] rounded-3xl p-8 border border-gray-800 relative overflow-hidden h-64 flex items-center justify-center shadow-xl">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#61B6DE 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      ></div>
      <div className="relative flex gap-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative flex flex-col items-center group">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative transition-all duration-500 group-hover:border-primary/50 group-hover:bg-primary/5">
              <Server size={24} className="text-gray-700" />
              <div
                className="absolute -top-4 bg-primary text-[#0B1120] p-2 rounded-lg shadow-[0_0_20px_rgba(97,182,222,0.4)] animate-bounce"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                <FileCode size={16} />
              </div>
              <div className="absolute inset-0 border border-primary rounded-2xl animate-ping opacity-20"></div>
            </div>
            <span className="text-xxs font-black text-gray-700 uppercase mt-4 tracking-widest">
              Edge Node 0{i}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-20"></div>
    </div>
  );
};

// 6. CDN QUIZ
interface QuizQuestion {
  q: string;
  weight: number;
}
interface CdnQuizProps {
  content: { title: string; questions: QuizQuestion[]; result: { high: string; low: string } };
}

export const CdnQuiz = ({ content }: CdnQuizProps) => {
  const [step, setStep] = useState(0);
  const [score, setSetScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (yes: boolean) => {
    if (yes) setSetScore((prev) => prev + content.questions[step].weight);
    if (step < content.questions.length - 1) setStep((prev) => prev + 1);
    else setFinished(true);
  };

  if (finished) {
    return (
      <GlassCard className="max-w-xl mx-auto p-10 text-center animate-fade-in border-emerald-100 bg-white">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <TrendingDown size={40} />
        </div>
        <h3 className="text-2xl font-bold text-dark mb-4">
          {content.title} Potrzeby: {score}%
        </h3>
        <p className="text-gray-700 mb-8 leading-relaxed">
          {score > 50 ? content.result.high : content.result.low}
        </p>
        <Button
          onClick={() => {
            setStep(0);
            setSetScore(0);
            setFinished(false);
          }}
          variant="outline"
        >
          Rozpocznij od nowa
        </Button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="max-w-xl mx-auto p-10 bg-white border-gray-100 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(step / content.questions.length) * 100}%` }}
        ></div>
      </div>
      <span className="text-xxs font-black text-primary uppercase tracking-[0.2em] mb-4 block">
        Krok {step + 1} z {content.questions.length}
      </span>
      <h3 className="text-xl md:text-2xl font-bold text-dark mb-10 leading-tight">
        {content.questions[step].q}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleAnswer(true)}
          className="group py-4 px-6 rounded-2xl border-2 border-gray-100 hover:border-[#10B981] hover:bg-emerald-50 transition-all text-gray-600 hover:text-emerald-700 font-bold flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={20} className="text-gray-300 group-hover:text-emerald-500" /> TAK
        </button>
        <button
          onClick={() => handleAnswer(false)}
          className="group py-4 px-6 rounded-2xl border-2 border-gray-100 hover:border-rose-400 hover:bg-rose-50 transition-all text-gray-600 hover:text-rose-700 font-bold flex items-center justify-center gap-2"
        >
          <XCircle size={20} className="text-gray-300 group-hover:text-rose-500" /> NIE
        </button>
      </div>
    </GlassCard>
  );
};
