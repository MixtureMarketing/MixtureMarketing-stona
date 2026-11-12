/**
 * Cloudflare Pages Function: publiczny kalkulator — pytania.
 * Path: GET /api/estimation/public-questions  (BEZ auth — poza /api/admin, /api/portal).
 * Zwraca pytania visibility='public' do zbudowania formularza (kontrakt §2). Bez efektów
 * ubocznych, bez Turnstile. WYŁĄCZNIE pola bezpieczne — zero unknown_weight/visibility/reguł.
 * MIX-1383 (SPEC-MIX-1320 §6): A7 cache w kodzie (nagłówek + Cache API z kluczem bez parametrów
 * zapytania, więc `?x=<losowe>` nie dochodzi do D1), A8 błąd = 500 bez szczegółów.
 */
interface Env {
  DB: D1Database;
}

const CONTRACT_VERSION = 1;
/** Nagłówek cache odpowiedzi 200 (A7); błędy mają `no-store`. */
export const QUESTIONS_CACHE_CONTROL = 'public, max-age=300';

const CORS = {
  'Access-Control-Allow-Origin': 'https://mixturemarketing.pl',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': status === 200 ? QUESTIONS_CACHE_CONTROL : 'no-store',
      ...CORS,
    },
  });

/** Klucz cache: ten sam adres bez parametrów i fragmentu (zawsze GET, bez nagłówków klienta). */
export function questionsCacheKey(url: string): Request | null {
  try {
    const u = new URL(url);
    return new Request(`${u.origin}${u.pathname}`, { method: 'GET' });
  } catch {
    return null;
  }
}

/** `caches.default` Workers; poza Workers (testy bez atrapy, dev) brak cache = prosto do D1. */
function edgeCache(): Cache | null {
  const c = (globalThis as unknown as { caches?: { default?: Cache } }).caches;
  return c?.default ?? null;
}

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

export const onRequestGet: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  const cache = edgeCache();
  const key = cache ? questionsCacheKey(request.url) : null;
  if (cache && key) {
    try {
      const hit = await cache.match(key);
      if (hit) return hit;
    } catch {
      // cache niedostępny: odpowiedź z D1 (dostępność ważniejsza niż oszczędność)
    }
  }
  try {
    const res = await env.DB.prepare(
      `SELECT code, text, help_text, answer_type, options_json, visible_if_json, question_group, sort_order
       FROM est_questions
       WHERE visibility = 'public' AND is_active = 1
       ORDER BY sort_order`,
    ).all();
    const questions = ((res.results ?? []) as unknown as Row[]).map(toPublicQuestion);
    const out = json({ contractVersion: CONTRACT_VERSION, questions });
    if (cache && key) {
      const put = cache.put(key, out.clone()).catch(() => undefined);
      if (waitUntil) waitUntil(put);
      else await put;
    }
    return out;
  } catch (err) {
    // A8: bez err.message i stosu w odpowiedzi; w logu tylko nazwa błędu.
    console.error(`[questions] błąd wewnętrzny: ${err instanceof Error ? err.name : 'nieznany'}`);
    return json({ error: 'Błąd serwera. Spróbuj później.', reason: 'wewnętrzny' }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { status: 204, headers: CORS });
