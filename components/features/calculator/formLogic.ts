// Czysta logika publicznego kalkulatora (f4b) — bez React/DOM/fetch, w pełni testowalna.
// Widoczność pytań reużywa `matchCondition` z silnika (parytet z wizardem admina — ta sama
// logika `visible_if`, zero duplikacji). Walidacja jest KLIENCKA (UX przed submitem); serwer
// i tak waliduje autorytatywnie (sanitizePublicAnswers).
import { matchCondition } from '../../../lib/estimation/engine';
import type { Answers } from '../../../lib/estimation/types';
import type { PublicQuestion } from '../../../services/calculatorService';

/** Pytania widoczne przy danych odpowiedziach: brak `visible_if` = zawsze; inaczej matchCondition. */
export function visibleQuestions(questions: PublicQuestion[], answers: Answers): PublicQuestion[] {
  return questions.filter((q) => q.visible_if == null || matchCondition(q.visible_if, answers));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>; // kod pola (lub 'email') → komunikat
}

/**
 * Walidacja kliencka: `project_goal` wymagane, pola `number` liczbowe, `email` poprawny.
 * Sprawdza WYŁĄCZNIE pytania widoczne (ukryte przez `visible_if` nie blokują submitu).
 */
export function validate(
  questions: PublicQuestion[],
  answers: Answers,
  email: string,
): ValidationResult {
  const errors: Record<string, string> = {};
  const visible = visibleQuestions(questions, answers);

  for (const q of visible) {
    const v = answers[q.code];
    if (q.code === 'project_goal' && (v === undefined || v === '')) {
      errors[q.code] = 'To pole jest wymagane.';
      continue;
    }
    if (q.answer_type === 'number' && v !== undefined && v !== '') {
      if (!Number.isFinite(Number(v))) errors[q.code] = 'Podaj liczbę.';
    }
  }

  if (!EMAIL_RE.test(email.trim())) errors.email = 'Podaj poprawny adres e-mail.';

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Mapuje status HTTP (0 = sieć) na komunikat po ludzku (kontrakt §3: 400/403/429). */
export function humanError(status: number): string {
  switch (status) {
    case 429:
      return 'Zbyt wiele zapytań z tego miejsca. Odczekaj chwilę i spróbuj ponownie.';
    case 403:
      return 'Weryfikacja antybotowa nie przeszła. Odśwież stronę i spróbuj ponownie.';
    case 400:
      return 'Sprawdź odpowiedzi i adres e-mail — coś jest niekompletne.';
    case 0:
      return 'Brak połączenia. Sprawdź internet i spróbuj ponownie.';
    default:
      return 'Coś poszło nie tak po naszej stronie. Spróbuj ponownie za chwilę.';
  }
}

/** Odpowiedzi ograniczone do kodów pytań PUBLICZNYCH (ochrona: nie wysyłamy nic spoza zestawu). */
export function pickAnswers(
  questions: PublicQuestion[],
  answers: Answers,
): Record<string, unknown> {
  const codes = new Set(questions.map((q) => q.code));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(answers)) {
    if (codes.has(k) && v !== undefined && v !== '') out[k] = v;
  }
  return out;
}
