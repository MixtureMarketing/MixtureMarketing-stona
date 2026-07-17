// Stan i przepływ publicznego kalkulatora (f4b). Ładuje pytania z API (data-driven),
// trzyma odpowiedzi/email/honeypot, waliduje klienckie, i submituje przez Turnstile
// (invisible-execute) do POST /public-quote. Logika czysta w formLogic; tu tylko orkiestracja.
import { useState, useEffect, useCallback, type RefObject } from 'react';
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

export type CalcPhase = 'loading' | 'ready' | 'submitting' | 'done' | 'loadError';

export function usePublicCalculator(turnstileRef: RefObject<TurnstileWidgetHandle | null>) {
  const [phase, setPhase] = useState<CalcPhase>('loading');
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [email, setEmail] = useState('');
  const [websiteVerify, setWebsiteVerify] = useState(''); // honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicQuoteResult | null>(null);

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

  const setAnswer = useCallback((code: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [code]: value as Answers[string] }));
  }, []);

  const visible = visibleQuestions(questions, answers);

  const submit = useCallback(async () => {
    setSubmitError(null);
    const v = validate(questions, answers, email);
    setErrors(v.errors);
    if (!v.valid) return;

    setPhase('submitting');
    let token: string;
    try {
      const handle = turnstileRef.current;
      if (!handle) throw new Error('TURNSTILE_NOT_READY');
      token = await handle.getToken();
    } catch {
      setSubmitError(humanError(403));
      setPhase('ready');
      return;
    }

    const res = await submitPublicQuote({
      answers: pickAnswers(questions, answers),
      email: email.trim(),
      captcha_token: token,
      website_verify: websiteVerify,
    });
    if (res.ok) {
      setResult(res.result);
      setPhase('done');
    } else {
      setSubmitError(humanError(res.status));
      setPhase('ready');
      turnstileRef.current?.reset();
    }
  }, [questions, answers, email, websiteVerify, turnstileRef]);

  const reset = useCallback(() => {
    setResult(null);
    setSubmitError(null);
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
    setEmail,
    websiteVerify,
    setWebsiteVerify,
    errors,
    submitError,
    result,
    submit,
    reset,
  };
}
