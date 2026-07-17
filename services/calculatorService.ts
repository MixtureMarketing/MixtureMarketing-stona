// Klient publicznego kalkulatora wyceny (f4b). Konsumuje ŻYWE API modułu wycen:
//   GET  /api/estimation/public-questions  → pytania publiczne (data-driven render)
//   POST /api/estimation/public-quote       → widełki (priceRange) + lead/draft po stronie serwera
// Kontrakt: docs/estimation/kontrakt-kalkulator-publiczny.md. UI NIE liczy nic samodzielnie —
// silnik i polityka ujawniania żyją na serwerze (granica własności: functions/api/estimation/*).
import type { Condition } from '../lib/estimation/types';

export interface PublicQuestionOption {
  value: string;
  label: string;
}

/** Pytanie publiczne w kształcie zwracanym przez GET /public-questions (pola bezpieczne). */
export interface PublicQuestion {
  code: string;
  text: string;
  help_text: string | null;
  answer_type: 'bool' | 'select' | 'multiselect' | 'number' | 'text' | string;
  options: PublicQuestionOption[] | null;
  visible_if: Condition | null;
  group: string | null;
  sort_order: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface PublicQuoteResult {
  priceRange: PriceRange;
  currency: string;
  status: string;
}

export interface SubmitPayload {
  answers: Record<string, unknown>;
  email: string;
  captcha_token: string;
  website_verify?: string;
}

/** Wynik POST: sukces z widełkami albo błąd ze statusem HTTP (do komunikatu po ludzku). */
export type SubmitResult = { ok: true; result: PublicQuoteResult } | { ok: false; status: number };

const QUESTIONS_URL = '/api/estimation/public-questions';
const QUOTE_URL = '/api/estimation/public-quote';

export async function fetchPublicQuestions(): Promise<PublicQuestion[]> {
  const res = await fetch(QUESTIONS_URL);
  if (!res.ok) throw new Error(`QUESTIONS_FETCH_FAILED_${res.status}`);
  const data = (await res.json()) as { questions?: PublicQuestion[] };
  return data.questions ?? [];
}

export async function submitPublicQuote(payload: SubmitPayload): Promise<SubmitResult> {
  try {
    const res = await fetch(QUOTE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const result = (await res.json()) as PublicQuoteResult;
      return { ok: true, result };
    }
    return { ok: false, status: res.status };
  } catch {
    return { ok: false, status: 0 }; // 0 = błąd sieci (fetch rzucił)
  }
}
