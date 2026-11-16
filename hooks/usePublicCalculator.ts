// Stan i przepływ publicznego kalkulatora (f4b). Ładuje pytania z API (data-driven),
// trzyma odpowiedzi/email/honeypot, waliduje klienckie, i submituje przez Turnstile
// (invisible-execute) do POST /public-quote. Logika czysta w formLogic; tu tylko orkiestracja.
import { useState, useEffect, useCallback, useRef, type RefObject } from 'react';
import {
  fetchPublicQuestions,
  submitPublicQuote,
  type PublicQuestion,
  type PublicQuoteResult,
} from '../services/calculatorService';
import {
  validate,
  visibleQuestions,
  pickAnswers,
  humanError,
} from '../components/features/calculator/formLogic';
import type { Answers } from '../lib/estimation/types';
import type { TurnstileWidgetHandle } from '../utils/turnstile';
import { trackEvent } from '../utils/analytics';
import { isLeadConfigEnabled } from '../components/features/calculator/livePrice';

export type CalcPhase = 'loading' | 'ready' | 'submitting' | 'done' | 'loadError';

/** Odmowa tokenu dla podglądu, gdy trwa wysyłka (MIX-1412: wysyłka ma pierwszeństwo). */
export const PREVIEW_BLOCKED_BY_SUBMIT = 'PREVIEW_BLOCKED_BY_SUBMIT';
/** Turnstile oddał pusty token: nie wysyłamy niczego (fail-closed). */
export const TURNSTILE_EMPTY_TOKEN = 'TURNSTILE_EMPTY_TOKEN';

export function usePublicCalculator(turnstileRef: RefObject<TurnstileWidgetHandle | null>) {
  const [phase, setPhase] = useState<CalcPhase>('loading');
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // MIX-1813, tylko przy VITE_MM_LEAD_CONFIG
  const [websiteVerify, setWebsiteVerify] = useState(''); // honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  // MIX-1867: rodzaj błędu wysyłki dla nowego wyglądu (`captcha` = brak tokenu Turnstile).
  const [submitErrorKind, setSubmitErrorKind] = useState<'captcha' | 'server' | null>(null);
  const [result, setResult] = useState<PublicQuoteResult | null>(null);
  // Wyścig Turnstile (MIX-1412): jeden widżet obsługuje wysyłkę i podgląd widełek, a każde
  // getToken() robi reset + execute. Pobrania tokenu idą więc po kolei (łańcuch obietnic),
  // a w trakcie wysyłki podgląd tokenu nie dostaje. `submittingRef` blokuje też drugą wysyłkę
  // (podwójne kliknięcie przed odświeżeniem przycisku).
  const submittingRef = useRef(false);
  const tokenChain = useRef<Promise<unknown>>(Promise.resolve());

  const nextToken = useCallback(
    (forPreview: boolean): Promise<string> => {
      const run = async () => {
        if (forPreview && submittingRef.current) throw new Error(PREVIEW_BLOCKED_BY_SUBMIT);
        const handle = turnstileRef.current;
        if (!handle) throw new Error('TURNSTILE_NOT_READY');
        const token = await handle.getToken();
        if (typeof token !== 'string' || token === '') throw new Error(TURNSTILE_EMPTY_TOKEN);
        return token;
      };
      const p = tokenChain.current.then(run, run);
      tokenChain.current = p.catch(() => undefined);
      return p;
    },
    [turnstileRef],
  );

  /** Token Turnstile dla podglądu widełek: po kolei z wysyłką, odmowa w trakcie wysyłki. */
  const getPreviewToken = useCallback((): Promise<string> => {
    if (submittingRef.current) return Promise.reject(new Error(PREVIEW_BLOCKED_BY_SUBMIT));
    return nextToken(true);
  }, [nextToken]);

  useEffect(() => {
    let cancelled = false;
    fetchPublicQuestions()
      .then((qs) => {
        if (cancelled) return;
        setQuestions([...qs].sort((a, b) => a.sort_order - b.sort_order));
        setPhase('ready');
      })
      .catch(() => {
        if (!cancelled) setPhase('loadError');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Zmiana pola gasi JEGO błąd — inaczej komunikat (i podsumowanie nad przyciskiem)
  // wisiałby do następnej próby wysłania, choć użytkownik już poprawił odpowiedź.
  const clearError = useCallback((code: string) => {
    setErrors((prev) => {
      if (!(code in prev)) return prev;
      const next = { ...prev };
      delete next[code];
      return next;
    });
  }, []);

  const setAnswer = useCallback(
    (code: string, value: unknown) => {
      setAnswers((prev) => ({ ...prev, [code]: value as Answers[string] }));
      clearError(code);
    },
    [clearError],
  );

  const setEmailAndClear = useCallback(
    (v: string) => {
      setEmail(v);
      clearError('email');
    },
    [clearError],
  );

  const visible = visibleQuestions(questions, answers);

  /**
   * Zwraca błędy walidacji (gdy formularz nie przeszedł), żeby UI mógł przejść do kroku
   * z pierwszym błędem i ustawić na nim fokus; `null`, gdy walidacja przeszła.
   */
  const submit = useCallback(async (): Promise<Record<string, string> | null> => {
    // Druga wysyłka w trakcie pierwszej: nic nie robimy (jedno POST na jedno kliknięcie).
    if (submittingRef.current) return null;
    setSubmitError(null);
    setSubmitErrorKind(null);
    const v = validate(questions, answers, email);
    setErrors(v.errors);
    if (!v.valid) return v.errors;

    submittingRef.current = true;
    try {
      setPhase('submitting');
      let token: string;
      try {
        token = await nextToken(false);
      } catch {
        setSubmitError(humanError(403));
        setSubmitErrorKind('captcha');
        setPhase('ready');
        return null;
      }

      // GA4 key event (MIX-1300): formularz przeszedł walidację i captchę, wycena idzie do API.
      // Bez e-maila i odpowiedzi; tylko ścieżka strony.
      trackEvent('calculator_submit', { source: window.location.pathname });
      const res = await submitPublicQuote({
        answers: pickAnswers(questions, answers),
        email: email.trim(),
        captcha_token: token,
        website_verify: websiteVerify,
        ...(isLeadConfigEnabled() && phone.trim() !== '' ? { phone: phone.trim() } : {}),
      });
      if (res.ok) {
        setResult(res.result);
        setPhase('done');
      } else {
        setSubmitError(humanError(res.status));
        setSubmitErrorKind('server');
        setPhase('ready');
        turnstileRef.current?.reset();
      }
      return null;
    } finally {
      submittingRef.current = false;
    }
  }, [questions, answers, email, phone, websiteVerify, turnstileRef, nextToken]);

  const reset = useCallback(() => {
    setResult(null);
    setSubmitError(null);
    setSubmitErrorKind(null);
    setErrors({});
    setPhase('ready');
  }, []);

  return {
    phase,
    questions,
    visible,
    answers,
    setAnswer,
    email,
    setEmail: setEmailAndClear,
    phone,
    setPhone,
    websiteVerify,
    setWebsiteVerify,
    errors,
    submitError,
    submitErrorKind,
    result,
    submit,
    reset,
    getPreviewToken,
  };
}
