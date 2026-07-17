import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isQuestionVisible, resolveVisibleAnswers } from '@/lib/estimation/engine';
import type { Answers } from '@/lib/estimation/types';
import { useQuote } from '../QuoteContext';
import type { LibQuestion } from '../useEstimationLibrary';
import { toEngineRules, platformQuestionCodes } from '../engineAdapter';
import QuestionField from './QuestionField';

// Krok „platforma" wypełniony wcześniej — nie powtarzamy go w wizardzie.
const WIZARD_GROUPS_ORDER = ['projekt', 'uzytkownicy', 'funkcje', 'marketing', 'realizacja'];

/** D27: widoczność liczona na odpowiedziach JUŻ przefiltrowanych (punkt stały) — dokładnie ta sama
 *  funkcja co w silniku, żeby wizard nie pokazał pytania, którego wycena nie liczy (i odwrotnie). */
const isVisible = (q: LibQuestion, visibleAnswers: Answers): boolean =>
  isQuestionVisible(q.visible_if_json, visibleAnswers);
const isUnknownVal = (v: unknown) =>
  typeof v === 'object' && v !== null && 'unknown' in (v as object);

/** Checklista modułów = PRZECIĘCIE archetyp ∩ cel (D24): opcje bierzemy z PRZEFILTROWANEJ
 *  biblioteki silnika (libData.modules), a nie ze statycznego options_json seeda. Dzięki temu
 *  moduł spoza zakresu nie da się zaznaczyć (i nie trafi do wyceny). */
function withLibraryModuleOptions(
  q: LibQuestion,
  modules: { code: string; name: string }[],
): LibQuestion {
  return {
    ...q,
    options_json: JSON.stringify(modules.map((m) => ({ value: m.code, label: m.name }))),
  };
}

const WizardSteps: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const { state, library } = useQuote();
  const { answers, setAnswer, flush } = state;
  const [step, setStep] = useState(0);

  // Dedup (fix 1): pytania zadane już w kroku „Platforma" (data-driven z reguł recommend_archetype)
  // NIE powtarzają się w wizardzie — niezależnie od tego, w jakiej grupie siedzą.
  const platformCodes = useMemo(
    () => platformQuestionCodes(toEngineRules(library.rules)),
    [library.rules],
  );
  const wizardQuestions = useMemo(
    () => library.questions.filter((q) => !platformCodes.has(q.code)),
    [library.questions, platformCodes],
  );

  // Grupy obecne w bibliotece, w ustalonej kolejności.
  const groups = useMemo(() => {
    const present = new Set(wizardQuestions.map((q) => q.question_group).filter(Boolean));
    return WIZARD_GROUPS_ORDER.filter((g) => present.has(g));
  }, [wizardQuestions]);

  // D27: odpowiedzi z porzuconych ścieżek (pytanie już niewidoczne) nie mogą wpływać na widoczność
  // kolejnych pytań — ten sam punkt stały, którego używa silnik.
  const visibleAnswers = useMemo(
    () =>
      resolveVisibleAnswers(
        answers,
        library.questions.map((q) => ({ code: q.code, visibleIf: q.visible_if_json })),
      ),
    [answers, library.questions],
  );

  const currentGroup = groups[step];
  const stepQuestions = useMemo(
    () =>
      wizardQuestions
        .filter((q) => q.question_group === currentGroup && isVisible(q, visibleAnswers))
        .sort((a, b) => a.sort_order - b.sort_order),
    [wizardQuestions, currentGroup, visibleAnswers],
  );

  // Licznik „nie wiem" liczy tylko WIDOCZNE pytania — ukryte nie obciążają wyceny (D27).
  const unknownCount = useMemo(
    () => Object.values(visibleAnswers).filter(isUnknownVal).length,
    [visibleAnswers],
  );

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
              q={q.code === 'modules' ? withLibraryModuleOptions(q, state.libData.modules) : q}
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
