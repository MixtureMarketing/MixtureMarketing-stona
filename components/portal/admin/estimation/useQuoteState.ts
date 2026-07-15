import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { computeQuote } from '@/lib/estimation/quote';
import type { Answers, AnswerValue, ValidationOverrides } from '@/lib/estimation/types';
import type { EstimationLibrary } from './useEstimationLibrary';
import { toLibraryData } from './toLibraryData';

type AnswerInput = AnswerValue | { unknown: true } | { not_applicable: true }; // D26

const EMPTY_OVERRIDES: ValidationOverrides = {
  chosenLevels: {},
  overrideHours: {},
  levelReasons: {},
  disabledModules: [],
  disabledIntegrations: [],
  disabledMultipliers: [],
  extraCostItems: [],
  costAmounts: {},
};

interface Params {
  quoteId: number;
  archetype: string;
  library: EstimationLibrary;
  sessionToken: string | null;
  initialAnswers?: Answers;
}

/**
 * Jedno źródło prawdy wyceny: answers (autosave PUT) + overrides (stan klienta do finalize).
 * Całe liczenie w computeQuote (pure). Zabezpieczenia: debounce z FLUSH przy zmianie kroku/unmount,
 * beforeunload gdy są niezapisane overrides lub wisząca zmiana odpowiedzi.
 */
export function useQuoteState({
  quoteId,
  archetype,
  library,
  sessionToken,
  initialAnswers,
}: Params) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers ?? {});
  const [overrides, setOverridesState] = useState<ValidationOverrides>(EMPTY_OVERRIDES);

  // Cel projektu (project_goal) współfiltruje checklistę modułów (D24: archetyp ∩ cel).
  // Zmiana odpowiedzi na cel przelicza bibliotekę — dlatego jest w zależnościach memo.
  const goal = typeof answers.project_goal === 'string' ? answers.project_goal : undefined;
  const libData = useMemo(
    () => toLibraryData(library, archetype, goal),
    [library, archetype, goal],
  );
  // Archetyp to atrybut wyceny, nie zapisywana odpowiedź — wstrzykujemy go do answers TYLKO na
  // potrzeby silnika (reguły archetype_warning i Confidence czytają answers.archetype). Nie trafia
  // do autosave (pendingRef), bo persystuje osobno jako archetype_code.
  const computation = useMemo(
    () => computeQuote({ answers: { ...answers, archetype }, library: libData, overrides }),
    [answers, archetype, libData, overrides],
  );

  // ── Autosave odpowiedzi (debounce + flush) ──
  const pendingRef = useRef<Answers>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const pending = pendingRef.current;
    if (Object.keys(pending).length === 0 || !sessionToken) return;
    pendingRef.current = {};
    try {
      await fetch('/api/admin/estimation/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ id: quoteId, answers: pending }),
      });
    } catch {
      // nie gub zmian przy błędzie sieci — wróć do bufora
      pendingRef.current = { ...pending, ...pendingRef.current };
    }
  }, [quoteId, sessionToken]);

  const setAnswer = useCallback(
    (code: string, value: AnswerInput) => {
      setAnswers((prev) => ({ ...prev, [code]: value }));
      pendingRef.current = { ...pendingRef.current, [code]: value };
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void flush(), 800);
    },
    [flush],
  );

  // FLUSH przy unmount (szybki klik-dalej-zamknij nie gubi wiszącej zmiany).
  useEffect(() => () => void flush(), [flush]);

  // ── Overrides (walidacja techniczna — stan klienta do finalize) ──
  const setOverrides = useCallback(
    (fn: (prev: ValidationOverrides) => ValidationOverrides) => setOverridesState(fn),
    [],
  );

  const hasUnsavedOverrides = useMemo(
    () =>
      Object.keys(overrides.chosenLevels).length > 0 ||
      Object.keys(overrides.overrideHours).length > 0 ||
      overrides.disabledModules.length > 0 ||
      overrides.disabledIntegrations.length > 0 ||
      overrides.disabledMultipliers.length > 0 ||
      overrides.extraCostItems.length > 0,
    [overrides],
  );

  // beforeunload: ostrzeż, gdy są niezapisane overrides lub wisząca zmiana odpowiedzi.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedOverrides || Object.keys(pendingRef.current).length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedOverrides]);

  return {
    answers,
    setAnswer,
    overrides,
    setOverrides,
    computation,
    /** Biblioteka w kształcie silnika, PO filtrach (archetyp ∩ cel) — jedno źródło dla checklisty. */
    libData,
    flush,
    hasUnsavedOverrides,
  };
}

export type QuoteState = ReturnType<typeof useQuoteState>;
