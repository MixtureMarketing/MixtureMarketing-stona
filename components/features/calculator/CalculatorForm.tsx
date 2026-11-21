// Wielokrokowy formularz kalkulatora — kroki wg GRUP pytań z API (data-driven), ostatni krok
// = kontakt (e-mail + honeypot + submit). Widoczność pytań (visible_if) liczy hook; tu render.
// MIX-1867: `newUi` = pasek postępu z nazwami kroków, karty pytań, przyciski-pigułki, fokus na
// nagłówku kroku po Dalej/Wstecz, osobny komunikat o niedziałającym zabezpieczeniu. Bez `newUi`
// wygląd jak przed MIX-1867. Kroki, walidacja, zdarzenia GA4 i wysyłka bez zmian.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import QuestionField from './QuestionField';
import RodoKlauzulaKrotka from '../../common/RodoKlauzulaKrotka';
import { CONTACT_STEP, firstErrorTarget } from './formLogic';
import { CAPTCHA_START_ERROR, calcUi } from './calcUi';
import CalculatorProgress from './CalculatorProgress';
import type { PublicQuestion } from '../../../services/calculatorService';
import type { Answers } from '../../../lib/estimation/types';
import { trackCalculatorStep } from '../../../utils/calculatorTracking';

// Etykiety grup (treść UI, Level 1) — fallback na „Szczegóły", gdy grupa spoza mapy.
const GROUP_LABEL: Record<string, string> = {
  projekt: 'Twój projekt',
  platforma: 'Charakter projektu',
  uzytkownicy: 'Użytkownicy',
  integracje: 'Integracje',
  marketing: 'Marketing',
  realizacja: 'Realizacja',
};
const CONTACT_LABEL = 'Gdzie wysłać widełki';

/** Nazwa kroku (nagłówek i pasek postępu). */
export const stepLabel = (step: string): string =>
  step === CONTACT_STEP ? CONTACT_LABEL : (GROUP_LABEL[step] ?? 'Szczegóły');

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
  /** MIX-1867: `captcha` = Turnstile nie oddał tokenu (nowy wygląd pokazuje osobny komunikat). */
  submitErrorKind?: 'captcha' | 'server' | null;
  submitting: boolean;
  /** Zwraca błędy walidacji (gdy nie przeszła) — wtedy przechodzimy do kroku z pierwszym błędem. */
  onSubmit: () => Promise<Record<string, string> | null> | void;
  /** Pasek widełek na żywo (MIX-1412): stoi TUŻ PRZED przyciskami Wstecz/Dalej, bo na telefonie
   *  jest `sticky` i nie może ich zasłonić (sticky przesuwa się tylko w górę). */
  liveBar?: React.ReactNode;
  /** Podgląd konfiguracji (MIX-1790): POD przyciskami, więc pasek sticky go nie zasłania. */
  configPreview?: React.ReactNode;
  /** Link do konfiguracji (MIX-1791): pod przyciskami Wstecz/Dalej, nad podglądem. */
  configLink?: React.ReactNode;
  /** MIX-1813 (VITE_MM_LEAD_CONFIG): opcjonalny telefon i przycisk „Wyślij i umów rozmowę”. */
  leadConfig?: boolean;
  phone?: string;
  setPhone?: (v: string) => void;
  /** MIX-1867: nowy wygląd; domyślnie stary. */
  newUi?: boolean;
  /** MIX-1867: odświeżenie strony po błędzie zabezpieczenia (w testach atrapa). */
  onReload?: () => void;
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
  submitErrorKind = null,
  submitting,
  onSubmit,
  liveBar,
  configPreview,
  configLink,
  leadConfig = false,
  phone = '',
  setPhone,
  newUi = false,
  onReload = () => window.location.reload(),
}) => {
  const ui = calcUi(newUi);
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

  // Nowy wygląd: po Dalej/Wstecz fokus idzie na nagłówek nowego kroku (klawiatura i czytnik
  // ekranu zaczynają od góry kroku, a nie od przycisku, który właśnie zniknął).
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusHeading = useRef(false);

  // GA4 (MIX-1384): jedno zdarzenie calculator_step na faktyczną zmianę kroku, z handlera
  // (nie z efektu), więc pierwszy render i ponowne renderowanie niczego nie wysyłają.
  const goTo = (target: number, direction: 'next' | 'back' | 'error') => {
    const clamped = Math.max(0, Math.min(target, steps.length - 1));
    if (clamped === idx) return;
    setStepIdx(clamped);
    focusHeading.current = newUi && direction !== 'error';
    trackCalculatorStep({
      stepNumber: clamped + 1,
      stepCount: steps.length,
      group: steps[clamped] === CONTACT_STEP ? 'contact' : steps[clamped],
      direction,
    });
  };
  const next = () => goTo(idx + 1, 'next');
  const prev = () => goTo(idx - 1, 'back');

  // Fokus na polu z błędem PO renderze kroku, na którym to pole istnieje.
  const pendingFocus = useRef<string | null>(null);
  const [focusRequest, setFocusRequest] = useState(0);
  useEffect(() => {
    const id = pendingFocus.current;
    if (!id) {
      if (focusHeading.current) {
        focusHeading.current = false;
        headingRef.current?.focus();
      }
      return;
    }
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
    goTo(t.stepIdx, 'error');
    setFocusRequest((n) => n + 1);
  };

  // Podsumowanie brakujących odpowiedzi — widoczne na każdym kroku, dopóki są błędy
  // (błąd pola gaśnie przy jego zmianie, więc lista jest aktualna).
  const errorLabels = visible.filter((q) => errors[q.code]).map((q) => q.text);
  if (errors.email) errorLabels.push('adres e-mail');

  const captchaFailed = newUi && submitError !== null && submitErrorKind === 'captcha';
  const headingCls = newUi
    ? 'text-2xl md:text-[1.75rem] font-extrabold tracking-tight text-white focus:outline-none'
    : 'text-xl font-bold text-white';

  return (
    <div className={newUi ? 'space-y-6 md:space-y-8' : 'space-y-8'}>
      {newUi ? (
        <CalculatorProgress current={idx} labels={steps.map(stepLabel)} />
      ) : (
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
      )}

      {!isContact && (
        <div className={newUi ? 'space-y-8' : 'space-y-6'}>
          <h2 ref={headingRef} tabIndex={newUi ? -1 : undefined} className={headingCls}>
            {stepLabel(step)}
          </h2>
          {stepQuestions.map((q) => (
            <QuestionField
              key={q.code}
              question={q}
              value={answers[q.code]}
              onChange={setAnswer}
              error={errors[q.code]}
              newUi={newUi}
            />
          ))}
        </div>
      )}

      {isContact && (
        <div className={newUi ? 'space-y-4' : 'space-y-5'}>
          <h2 ref={headingRef} tabIndex={newUi ? -1 : undefined} className={headingCls}>
            {CONTACT_LABEL}
          </h2>
          <div className={newUi ? 'space-y-3' : 'space-y-2'}>
            <label htmlFor="calc-email" className={ui.label}>
              Twój e-mail
            </label>
            <input
              id="calc-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={
                newUi
                  ? errors.email
                    ? 'calc-email-err calc-email-help'
                    : 'calc-email-help'
                  : errors.email
                    ? 'calc-email-err'
                    : undefined
              }
              placeholder="np. jan@firma.pl"
              className={
                newUi
                  ? ui.input
                  : 'w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/60'
              }
            />
            {errors.email && (
              <p id="calc-email-err" className={ui.error}>
                {errors.email}
              </p>
            )}
            <p
              id={newUi ? 'calc-email-help' : undefined}
              className={newUi ? ui.help : 'text-xs text-gray-500'}
            >
              Użyjemy go tylko do kontaktu w sprawie tej wyceny.
            </p>
          </div>

          {leadConfig && setPhone && (
            <div className="space-y-2">
              <label
                htmlFor="calc-phone"
                className={newUi ? ui.label : 'block text-base font-semibold text-white'}
              >
                Telefon (opcjonalnie)
              </label>
              <input
                id="calc-phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                maxLength={32}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="np. +48 600 700 800"
                className={
                  newUi
                    ? ui.input
                    : 'w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/60'
                }
              />
            </div>
          )}

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

          {submitError && !captchaFailed && (
            <p role={newUi ? 'alert' : undefined} className={ui.alert}>
              {submitError}
            </p>
          )}
          {captchaFailed && (
            <div
              role="alert"
              data-testid="calc-captcha-error"
              className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${ui.alert}`}
            >
              <span>{CAPTCHA_START_ERROR}</span>
              <button
                type="button"
                onClick={onReload}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-red-200/40 px-5 font-extrabold text-white hover:border-white"
              >
                Odśwież stronę
              </button>
            </div>
          )}
        </div>
      )}

      {errorLabels.length > 0 && (
        <div role="alert" className={ui.alert}>
          Uzupełnij, żeby poznać widełki: {errorLabels.join('; ')}
        </div>
      )}

      {liveBar}

      <div
        className={
          newUi
            ? 'flex items-center justify-between gap-3 border-t border-white/10 pt-6'
            : 'flex items-center justify-between pt-2'
        }
      >
        <button
          type="button"
          onClick={prev}
          disabled={idx === 0 || submitting}
          className={ui.btnBack}
        >
          {newUi && <ArrowLeft size={18} aria-hidden="true" />}
          Wstecz
        </button>

        {!isContact ? (
          <button
            type="button"
            onClick={next}
            className={
              newUi
                ? ui.btnPrimary
                : 'px-6 py-2.5 rounded-xl bg-primary text-dark font-semibold hover:brightness-110 transition'
            }
          >
            Dalej
            {newUi && <ArrowRight size={18} aria-hidden="true" />}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            aria-busy={newUi && submitting ? true : undefined}
            className={ui.btnPrimary}
          >
            {newUi && submitting && (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
            )}
            {submitting ? 'Liczę…' : leadConfig ? 'Wyślij i umów rozmowę' : 'Poznaj widełki'}
          </button>
        )}
      </div>

      {configLink}

      {isContact && <RodoKlauzulaKrotka variant="calculator" tone={newUi ? 'navy' : 'dark'} />}

      {configPreview}
    </div>
  );
};

export default CalculatorForm;
