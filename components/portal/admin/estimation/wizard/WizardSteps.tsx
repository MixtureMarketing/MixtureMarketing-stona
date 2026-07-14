import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { matchCondition } from '@/lib/estimation/engine';
import type { Answers, Condition } from '@/lib/estimation/types';
import { useQuote } from '../QuoteContext';
import type { LibQuestion } from '../useEstimationLibrary';
import QuestionField from './QuestionField';

// Krok „platforma" wypełniony wcześniej — nie powtarzamy go w wizardzie.
const WIZARD_GROUPS_ORDER = ['projekt', 'uzytkownicy', 'funkcje', 'marketing', 'realizacja'];

const isVisible = (q: LibQuestion, answers: Answers): boolean => {
  if (!q.visible_if_json) return true;
  try {
    return matchCondition(JSON.parse(q.visible_if_json) as Condition, answers);
  } catch {
    return true;
  }
};
const isUnknownVal = (v: unknown) =>
  typeof v === 'object' && v !== null && 'unknown' in (v as object);

const WizardSteps: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const { state, library } = useQuote();
  const { answers, setAnswer, flush } = state;
  const [step, setStep] = useState(0);

  // Grupy obecne w bibliotece, w ustalonej kolejności.
  const groups = useMemo(() => {
    const present = new Set(library.questions.map((q) => q.question_group).filter(Boolean));
    return WIZARD_GROUPS_ORDER.filter((g) => present.has(g));
  }, [library.questions]);

  const currentGroup = groups[step];
  const stepQuestions = useMemo(
    () =>
      library.questions
        .filter((q) => q.question_group === currentGroup && isVisible(q, answers))
        .sort((a, b) => a.sort_order - b.sort_order),
    [library.questions, currentGroup, answers],
  );

  const unknownCount = useMemo(() => Object.values(answers).filter(isUnknownVal).length, [answers]);

  const goto = async (next: number) => {
    await flush(); // FLUSH przy zmianie kroku (zabezpieczenie b)
    setStep(next);
  };
  const isLast = step === groups.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span className="font-bold uppercase">
              Krok {step + 1}/{groups.length}: {currentGroup}
            </span>
            <span>{unknownCount > 0 && `„nie wiem": ${unknownCount}`}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded">
            <div
              className="h-2 bg-dark rounded transition-all"
              style={{ width: `${((step + 1) / groups.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {stepQuestions.length === 0 ? (
          <p className="text-sm text-gray-400">Brak pytań w tym kroku dla wybranych odpowiedzi.</p>
        ) : (
          stepQuestions.map((q) => (
            <QuestionField
              key={q.code}
              q={q}
              value={answers[q.code]}
              onChange={(v) => setAnswer(q.code, v)}
            />
          ))
        )}
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => goto(step - 1)}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1 ${step === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-dark'}`}
        >
          <ChevronLeft size={18} /> Wstecz
        </button>
        <button
          type="button"
          onClick={() => (isLast ? (void flush(), onDone()) : goto(step + 1))}
          className="px-5 py-2 rounded-lg font-bold bg-dark text-white flex items-center gap-1"
        >
          {isLast ? 'Przejdź do walidacji' : 'Dalej'} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default WizardSteps;
