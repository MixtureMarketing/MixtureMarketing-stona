// Wielokrokowy formularz kalkulatora — kroki wg GRUP pytań z API (data-driven), ostatni krok
// = kontakt (e-mail + honeypot + submit). Widoczność pytań (visible_if) liczy hook; tu render.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import QuestionField from './QuestionField';
import { CONTACT_STEP, firstErrorTarget } from './formLogic';
import type { PublicQuestion } from '../../../services/calculatorService';
import type { Answers } from '../../../lib/estimation/types';

// Etykiety grup (treść UI, Level 1) — fallback na „Szczegóły", gdy grupa spoza mapy.
const GROUP_LABEL: Record<string, string> = {
  projekt: 'Twój projekt',
  platforma: 'Charakter projektu',
  uzytkownicy: 'Użytkownicy',
  integracje: 'Integracje',
  marketing: 'Marketing',
  realizacja: 'Realizacja',
};

interface CalculatorFormProps {
  visible: PublicQuestion[];
  answers: Answers;
  setAnswer: (code: string, value: unknown) => void;
  errors: Record<string, string>;
  email: string;
  setEmail: (v: string) => void;
  websiteVerify: string;
  setWebsiteVerify: (v: string) => void;
  submitError: string | null;
  submitting: boolean;
  /** Zwraca błędy walidacji (gdy nie przeszła) — wtedy przechodzimy do kroku z pierwszym błędem. */
  onSubmit: () => Promise<Record<string, string> | null> | void;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({
  visible,
  answers,
  setAnswer,
  errors,
  email,
  setEmail,
  websiteVerify,
  setWebsiteVerify,
  submitError,
  submitting,
  onSubmit,
}) => {
  // Uporządkowane, unikalne grupy widocznych pytań + krok kontaktowy na końcu.
  const groups = useMemo(() => {
    const seen: string[] = [];
    for (const q of visible) {
      const g = q.group ?? 'projekt';
      if (!seen.includes(g)) seen.push(g);
    }
    return seen;
  }, [visible]);

  const steps = [...groups, CONTACT_STEP];
  const [stepIdx, setStepIdx] = useState(0);
  const idx = Math.min(stepIdx, steps.length - 1);
  const step = steps[idx];
  const isContact = step === CONTACT_STEP;

  const stepQuestions = isContact ? [] : visible.filter((q) => (q.group ?? 'projekt') === step);

  const next = () => setStepIdx((i) => Math.min(i + 1, steps.length - 1));
  const prev = () => setStepIdx((i) => Math.max(i - 1, 0));

  // Fokus na polu z błędem PO renderze kroku, na którym to pole istnieje.
  const pendingFocus = useRef<string | null>(null);
  const [focusRequest, setFocusRequest] = useState(0);
  useEffect(() => {
    const id = pendingFocus.current;
    if (!id) return;
    pendingFocus.current = null;
    const el = document.getElementById(id);
    if (!el) return;
    // Grupa opcji (radiogroup / group) → fokus na zaznaczonej albo pierwszej opcji.
    const target =
      el instanceof HTMLInputElement
        ? el
        : (el.querySelector<HTMLElement>('[aria-checked="true"], [aria-pressed="true"]') ??
          el.querySelector<HTMLElement>('button'));
    target?.focus();
  }, [focusRequest, idx]);

  const handleSubmit = async () => {
    const errs = await onSubmit();
    if (!errs) return;
    const t = firstErrorTarget(steps, visible, errs);
    if (!t) return;
    pendingFocus.current = t.fieldId;
    setStepIdx(t.stepIdx);
    setFocusRequest((n) => n + 1);
  };

  // Podsumowanie brakujących odpowiedzi — widoczne na każdym kroku, dopóki są błędy
  // (błąd pola gaśnie przy jego zmianie, więc lista jest aktualna).
  const errorLabels = visible.filter((q) => errors[q.code]).map((q) => q.text);
  if (errors.email) errorLabels.push('adres e-mail');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          Krok {idx + 1} z {steps.length}
        </span>
        <div className="flex gap-1.5">
          {steps.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 w-6 rounded-full ${i <= idx ? 'bg-primary' : 'bg-white/15'}`}
            />
          ))}
        </div>
      </div>

      {!isContact && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">{GROUP_LABEL[step] ?? 'Szczegóły'}</h2>
          {stepQuestions.map((q) => (
            <QuestionField
              key={q.code}
              question={q}
              value={answers[q.code]}
              onChange={setAnswer}
              error={errors[q.code]}
            />
          ))}
        </div>
      )}

      {isContact && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-white">Gdzie wysłać widełki</h2>
          <div className="space-y-2">
            <label htmlFor="calc-email" className="block text-base font-semibold text-white">
              Twój e-mail
            </label>
            <input
              id="calc-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'calc-email-err' : undefined}
              placeholder="np. jan@firma.pl"
              className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
            {errors.email && (
              <p id="calc-email-err" className="text-sm text-red-400">
                {errors.email}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Użyjemy go tylko do kontaktu w sprawie tej wyceny.
            </p>
          </div>

          {/* Honeypot — ukryte pole; wypełnia je tylko bot. */}
          <input
            type="text"
            name="website_verify"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={websiteVerify}
            onChange={(e) => setWebsiteVerify(e.target.value)}
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />

          {submitError && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {submitError}
            </p>
          )}
        </div>
      )}

      {errorLabels.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          Uzupełnij, żeby poznać widełki: {errorLabels.join('; ')}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={prev}
          disabled={idx === 0 || submitting}
          className="px-5 py-2.5 rounded-xl border border-white/15 text-gray-300 disabled:opacity-40 hover:border-white/30 transition"
        >
          Wstecz
        </button>

        {!isContact ? (
          <button
            type="button"
            onClick={next}
            className="px-6 py-2.5 rounded-xl bg-primary text-dark font-semibold hover:brightness-110 transition"
          >
            Dalej
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-primary text-dark font-semibold hover:brightness-110 disabled:opacity-60 transition"
          >
            {submitting ? 'Liczę…' : 'Poznaj widełki'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CalculatorForm;
