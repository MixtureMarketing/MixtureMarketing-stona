/**
 * Cloudflare Pages Function: publiczny kalkulator — pytania.
 * Path: GET /api/estimation/public-questions  (BEZ auth — poza /api/admin, /api/portal).
 * Zwraca pytania visibility='public' do zbudowania formularza (kontrakt §2). Bez efektów
 * ubocznych, bez Turnstile. WYŁĄCZNIE pola bezpieczne — zero unknown_weight/visibility/reguł.
 */
interface Env {
  DB: D1Database;
}

const CONTRACT_VERSION = 1;

const CORS = {
  'Access-Control-Allow-Origin': 'https://mixturemarketing.pl',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });

/** Bezpieczne parsowanie JSON kolumny → wartość albo null (błąd = null, nie wyciek surowca). */
function parseJson<T>(raw: unknown): T | null {
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

interface Row {
  code: string;
  text: string;
  help_text: string | null;
  answer_type: string;
  options_json: string | null;
  visible_if_json: string | null;
  question_group: string | null;
  sort_order: number;
}

/** Wiersz est_questions → pytanie publiczne (tylko pola z kontraktu §2). */
function toPublicQuestion(row: Row) {
  return {
    code: row.code,
    text: row.text,
    help_text: row.help_text ?? null,
    answer_type: row.answer_type,
    options: parseJson<{ value: unknown; label: unknown }[]>(row.options_json),
    visible_if: parseJson<unknown>(row.visible_if_json),
    group: row.question_group ?? null,
    sort_order: row.sort_order,
  };
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const res = await env.DB.prepare(
      `SELECT code, text, help_text, answer_type, options_json, visible_if_json, question_group, sort_order
       FROM est_questions
       WHERE visibility = 'public' AND is_active = 1
       ORDER BY sort_order`,
    ).all();
    const questions = ((res.results ?? []) as Row[]).map(toPublicQuestion);
    return json({ contractVersion: CONTRACT_VERSION, questions });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { status: 204, headers: CORS });
