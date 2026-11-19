// MIX-1815 (Z11 z MIX-1377, SPEC-MIX-1320 U3 i P4): ekran wyniku -> „Umów rozmowę” -> /contact/.
// Konfiguracja jedzie w stanie historii przeglądarki (React Router `state`), nie w adresie: e-mail
// i odpowiedzi nie trafiają do adresu, logów serwera ani GA4. Formularz kontaktu dostaje gotowy
// tekst (etykiety odpowiedzi słowami, widełki netto i link ?k=, gdy link jest włączony) do pola
// wiadomości. Odczyt stanu jest allowlistą: zły kształt = brak konfiguracji (formularz jak dziś).
import type { Answers } from '../../../lib/estimation/types';
import type { PriceRange, PublicQuestion } from '../../../services/calculatorService';

/** Klucz w `location.state` (React Router). */
export const HANDOFF_KEY = 'calculatorConfig';

/** Wersja kształtu stanu; inna wersja = brak konfiguracji. */
export const HANDOFF_VERSION = 1;

/**
 * Najdłuższy tekst konfiguracji (znaki). Pole wiadomości przyjmuje 2000 znaków
 * (types/validation.ts), więc klient ma jeszcze miejsce na własne zdanie.
 */
export const HANDOFF_TEXT_MAX = 1500;

/** Najdłuższy e-mail przenoszony do formularza (RFC 5321). */
export const HANDOFF_EMAIL_MAX = 254;

/**
 * P4 = A (decyzje Jakuba 12.11): prostszy język dwóch pytań. Nadpisanie po stronie klienta i tylko
 * za przełącznikiem, więc treść w D1 (seed) i produkcja bez przełącznika zostają bez zmian.
 */
export const P4_TEXTS: Readonly<Record<string, string>> = {
  views_count: 'Ile mniej więcej podstron? (Start, O nas, Oferta, Kontakt = 4)',
  sensitive_data:
    'Czy strona przyjmie płatności albo dane medyczne/finansowe inaczej niż przez operatora płatności?',
};

/** Pytania z tekstami P4 (nowe obiekty tylko dla zmienionych pytań). */
export function withP4Texts(questions: PublicQuestion[]): PublicQuestion[] {
  return questions.map((q) =>
    Object.prototype.hasOwnProperty.call(P4_TEXTS, q.code) ? { ...q, text: P4_TEXTS[q.code] } : q,
  );
}

export interface CalculatorHandoff {
  v: typeof HANDOFF_VERSION;
  /** Gotowy tekst do pola wiadomości. */
  text: string;
  /** E-mail z kalkulatora (do pola e-mail w kroku 1); pusty = brak. */
  email: string;
}

const pln = (n: number) => new Intl.NumberFormat('pl-PL').format(Math.round(n));

/** Odpowiedź słowami: etykieta opcji zamiast kodu; `null` = brak odpowiedzi albo nieznana opcja. */
export function answerLabel(q: PublicQuestion, val: unknown): string | null {
  const label = (v: unknown) => q.options?.find((o) => o.value === v)?.label ?? null;
  switch (q.answer_type) {
    case 'bool':
      return val === true ? 'Tak' : val === false ? 'Nie' : null;
    case 'select':
      return typeof val === 'string' ? label(val) : null;
    case 'multiselect': {
      if (!Array.isArray(val) || val.length === 0) return null;
      const labels = val.map(label);
      return labels.every((l) => l !== null) ? labels.join(', ') : null;
    }
    case 'number':
      return typeof val === 'number' && Number.isFinite(val) ? String(val) : null;
    case 'text':
      return typeof val === 'string' && val.trim() !== '' ? val.trim() : null;
    default:
      return null;
  }
}

/**
 * Tekst konfiguracji: nagłówek, widełki netto, odpowiedzi (kolejność pytań), link.
 * Za długi tekst: najpierw wypada link, potem ostatnie odpowiedzi (nagłówek i widełki zostają).
 */
export function buildHandoffText(
  questions: PublicQuestion[],
  answers: Answers,
  priceRange: PriceRange,
  link: string | null,
): string {
  const head = [
    'Konfiguracja z kalkulatora wyceny (/wycena/):',
    `Widełki: ${pln(priceRange.min)} – ${pln(priceRange.max)} zł netto`,
  ];
  const lines: string[] = [];
  for (const q of questions) {
    if (!Object.prototype.hasOwnProperty.call(answers, q.code)) continue;
    const a = answerLabel(q, answers[q.code]);
    if (a !== null) lines.push(`- ${q.text} ${a}`);
  }
  const join = (body: string[], withLink: boolean) =>
    [...head, ...body, ...(withLink && link ? [`Link do konfiguracji: ${link}`] : [])].join('\n');
  let text = join(lines, true);
  if (text.length <= HANDOFF_TEXT_MAX) return text;
  text = join(lines, false);
  while (text.length > HANDOFF_TEXT_MAX && lines.length > 0) {
    lines.pop();
    text = join(lines, false);
  }
  return text;
}

export function buildHandoff(
  questions: PublicQuestion[],
  answers: Answers,
  priceRange: PriceRange,
  email: string,
  link: string | null,
): CalculatorHandoff {
  const e = email.trim();
  return {
    v: HANDOFF_VERSION,
    text: buildHandoffText(questions, answers, priceRange, link),
    email: e.length <= HANDOFF_EMAIL_MAX ? e : '',
  };
}

/** Stan nawigacji do /contact/ (React Router `state`). */
export function handoffState(h: CalculatorHandoff): Record<string, CalculatorHandoff> {
  return { [HANDOFF_KEY]: h };
}

/**
 * Odczyt z `location.state` jako allowlista: tylko obiekt z kluczem HANDOFF_KEY, wersja 1, `text`
 * niepusty i ≤ HANDOFF_TEXT_MAX, `email` tekst ≤ HANDOFF_EMAIL_MAX. Wszystko inne = `null`.
 */
export function readHandoff(state: unknown): CalculatorHandoff | null {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return null;
  if (!Object.prototype.hasOwnProperty.call(state, HANDOFF_KEY)) return null;
  const h = (state as Record<string, unknown>)[HANDOFF_KEY];
  if (!h || typeof h !== 'object' || Array.isArray(h)) return null;
  const { v, text, email } = h as Record<string, unknown>;
  if (v !== HANDOFF_VERSION) return null;
  if (typeof text !== 'string' || text.trim() === '' || text.length > HANDOFF_TEXT_MAX) return null;
  if (typeof email !== 'string' || email.length > HANDOFF_EMAIL_MAX) return null;
  return { v: HANDOFF_VERSION, text, email };
}
