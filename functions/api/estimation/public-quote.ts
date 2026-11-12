/**
 * Cloudflare Pages Function: publiczny kalkulator — wycena.
 * Path: POST /api/estimation/public-quote  (BEZ auth — poza /api/admin, /api/portal).
 * Kontrakt: docs/estimation/kontrakt-kalkulator-publiczny.md §3.
 * Przepływ: honeypot → email → Turnstile → rate-limit (KV) → walidacja → compute → lead + draft
 * (best-effort, retry) → e-mail (best-effort, degradacja łagodna). Zwraca WYŁĄCZNIE priceRange.
 * MIX-1382: przy QUOTE_LIMITS_D1='1' przepływ idzie przez quoteGate (_quoteGate.ts): honeypot →
 * e-mail → IP krawędzi → Turnstile → liczniki D1 (fail-closed) → dopiero biblioteka i zapis.
 */
import { loadRawLibrary, loadPublicQuestionDefs } from './_engineDb';
import { checkRateLimit } from './_rateLimit';
import { limitsSwitch, quoteGate, safeRay, QUOTE_TURNSTILE, type QuoteGateEnv } from './_quoteGate';
import { escapeHtml, verifyTurnstileStrict } from '../_shared/security';
import { wyslijDoCrmWTle, type CrmEnv } from '../_crm';
import {
  parsePublicConfig,
  computePublicQuote,
  sanitizePublicAnswers,
  type PublicQuoteResult,
} from '../../../lib/estimation/publicQuote';
import type { RawLibrary } from '../../../lib/estimation/toLibraryData';
import { withRetry } from '../../../lib/estimation/retry';
import { ENGINE_VERSION } from '../../../lib/estimation/engine';
import type { Answers } from '../../../lib/estimation/types';

interface Env extends CrmEnv, Omit<QuoteGateEnv, 'DB'> {
  DB: D1Database;
  CACHE: KVNamespace;
  TURNSTILE_SECRET: string;
  RESEND_API_KEY?: string;
  NOTIFY_EMAIL?: string;
  /** Przełącznik MIX-1382: '1' = limity D1; brak/'0' = dotychczasowy limiter KV. */
  QUOTE_LIMITS_D1?: string;
}

interface Body {
  answers?: Record<string, unknown>;
  email?: string;
  captcha_token?: string;
  website_verify?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_WINDOW_SEC = 3600;
/** Limit treści żądania (SPEC-MIX-1320 §6 A9): 16 kB; więcej = 413 przed jakąkolwiek pracą. */
export const MAX_BODY_BYTES = 16 * 1024;
const INTERNAL = 'Błąd serwera. Spróbuj później.';

const CORS = {
  'Access-Control-Allow-Origin': 'https://mixturemarketing.pl',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });

/** 400 walidacji odpowiedzi: komunikaty (kontrakt §3) + stały kod pierwszego powodu. */
const invalid = (v: { errors: string[]; reasons: string[] }) =>
  json({ errors: v.errors, reason: v.reasons[0] }, 400);

type BodyRead = { ok: true; text: string } | { ok: false; status: 400 | 413; reason: string };

/** Treść żądania z limitem bajtów: najpierw nagłówek (tania odmowa), potem faktyczna długość. */
async function readBodyLimited(request: Request): Promise<BodyRead> {
  const cl = request.headers.get('content-length');
  if (cl !== null) {
    if (!/^\d{1,15}$/.test(cl)) return { ok: false, status: 400, reason: 'body: content-length' };
    if (Number(cl) > MAX_BODY_BYTES) return { ok: false, status: 413, reason: 'body: za duży' };
  }
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES || new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES)
    return { ok: false, status: 413, reason: 'body: za duży' };
  return { ok: true, text };
}

/** Żądanie z już odczytaną treścią (bramka MIX-1382 czyta ją sama przez text()). */
function withReadBody(request: Request, text: string): Request {
  return {
    url: request.url,
    method: request.method,
    headers: request.headers,
    text: async () => text,
    json: async () => JSON.parse(text) as unknown,
  } as unknown as Request;
}

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { status: 204, headers: CORS });

/**
 * A8: każdy nieobsłużony błąd (D1, biblioteka, silnik) = 500 z ogólną treścią i stałym kodem;
 * do logu tylko nazwa błędu i cf-ray (bez e.message, stosu i danych klienta).
 * A16: nagłówek `Origin` nie jest czytany; żądanie bez niego przechodzi te same bramki.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  try {
    return await handlePost(request, env, waitUntil);
  } catch (e) {
    const name = e instanceof Error ? e.name : 'nieznany';
    console.error(`[quote] błąd wewnętrzny: ${name} ray=${safeRay(request)}`);
    return json({ error: INTERNAL, reason: 'wewnętrzny' }, 500);
  }
};

async function handlePost(
  request: Request,
  env: Env,
  waitUntil?: (p: Promise<unknown>) => void,
): Promise<Response> {
  // Przełącznik MIX-1382 (nowa funkcja wchodzi ukryta): brak/'0' = dotychczasowa ścieżka,
  // '1' = limity D1 fail-closed, inna wartość = 503 (bez cichego wyboru ścieżki).
  const mode = limitsSwitch(env.QUOTE_LIMITS_D1);
  if (mode === 'bad') {
    const reason = 'konfiguracja: QUOTE_LIMITS_D1';
    console.error(`[quote] odmowa 503: ${reason} ray=${safeRay(request)}`);
    return json({ error: 'Usługa chwilowo niedostępna. Spróbuj później.', reason }, 503);
  }

  // 0. Rozmiar treści (A9) przed parsowaniem, Turnstile i D1.
  const read = await readBodyLimited(request);
  if (!read.ok) {
    console.error(`[quote] odmowa ${read.status}: ${read.reason} ray=${safeRay(request)}`);
    const msg = read.status === 413 ? 'Zbyt duże zapytanie.' : 'Niepoprawne zapytanie.';
    return json({ error: msg, reason: read.reason }, read.status);
  }
  if (mode === 'on') return gatedPost(withReadBody(request, read.text), env, waitUntil);

  let body: Body;
  try {
    const parsed: unknown = JSON.parse(read.text);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    body = parsed as Body;
  } catch {
    return json({ error: 'Niepoprawny JSON.', reason: 'body: nieczytelny' }, 400);
  }

  // 1. Honeypot (darmowe, przed jakąkolwiek pracą).
  if (body.website_verify) return json({ error: 'Spam detected' }, 403);

  // 2. Email wymagany (kontrakt §3) — tania walidacja przed zewnętrznym fetchem.
  const email = (typeof body.email === 'string' ? body.email : '').trim();
  if (!EMAIL_RE.test(email)) return json({ error: 'Podaj poprawny adres e-mail.' }, 400);

  // 3. Turnstile: success + hostname z allowlisty + action (A12), fail-closed.
  const ip = request.headers.get('cf-connecting-ip') || '';
  const ts = await verifyTurnstileStrict(
    body.captcha_token,
    env.TURNSTILE_SECRET,
    ip,
    QUOTE_TURNSTILE,
  );
  if (!ts.ok) return json({ error: 'Weryfikacja antybotowa nieudana.', reason: ts.reason }, 403);

  // 4. Biblioteka + konfiguracja + rate-limit (limit z parametrów).
  const rawLib = await loadRawLibrary(env.DB);
  const config = parsePublicConfig(rawLib.params);
  const rl = await checkRateLimit(env.CACHE, ip, config.ratePerHour, RATE_WINDOW_SEC);
  if (!rl.allowed) return json({ error: 'Zbyt wiele zapytań. Spróbuj za chwilę.' }, 429);

  // 5. Walidacja odpowiedzi: allowlista kodów, opcji, zakresów i długości (A9, A10).
  const defs = await loadPublicQuestionDefs(env.DB);
  const checked = sanitizePublicAnswers(body.answers, defs);
  if (checked.errors.length > 0) return invalid(checked);
  const { answers } = checked;

  // 6. Compute + transform publiczny.
  const result = computePublicQuote(rawLib, answers, config);

  // 7. Zapis (best-effort, retry) — nie blokuje zwrotu ceny.
  await persist(env, rawLib, email, answers, result, waitUntil);

  // 8. E-mail (best-effort, degradacja łagodna).
  await sendEmails(env, email, result);

  return json({ priceRange: result.priceRange, currency: 'PLN', status: 'ok' });
}

/**
 * Ścieżka MIX-1382 (QUOTE_LIMITS_D1='1'): bramka (wiersze 1-15) PRZED jakimkolwiek odczytem
 * biblioteki i zapisem leada (A6). Limity z env (QUOTE_*), nie z D1: `public_rate_per_hour`
 * nie działa w tej ścieżce.
 */
async function gatedPost(
  request: Request,
  env: Env,
  waitUntil?: (p: Promise<unknown>) => void,
): Promise<Response> {
  const gate = await quoteGate(request, env, { waitUntil });
  if (!gate.ok) {
    const res = json({ error: gate.message, reason: gate.reason }, gate.status);
    if (gate.retryAfter !== undefined) res.headers.set('Retry-After', String(gate.retryAfter));
    return res;
  }
  const { body, email } = gate;
  if (gate.budgetAlert) {
    const alert = sendBudgetAlert(env, gate.budgetAlert);
    if (waitUntil) waitUntil(alert);
    else await alert;
  }

  const rawLib = await loadRawLibrary(env.DB);
  const config = parsePublicConfig(rawLib.params);
  const defs = await loadPublicQuestionDefs(env.DB);
  const checked = sanitizePublicAnswers(body.answers, defs);
  if (checked.errors.length > 0) return invalid(checked);
  const { answers } = checked;

  const result = computePublicQuote(rawLib, answers, config);
  await persist(env, rawLib, email, answers, result, waitUntil);
  await sendEmails(env, email, result);
  return json({ priceRange: result.priceRange, currency: 'PLN', status: 'ok' });
}

/** Jedno powiadomienie na dobę przy 80% budżetu: tylko liczby, bez e-maili klientów. */
async function sendBudgetAlert(env: Env, line: string): Promise<void> {
  if (!env.RESEND_API_KEY || !env.NOTIFY_EMAIL) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Mixture Marketing <info@mixturemarketing.pl>',
        to: [env.NOTIFY_EMAIL],
        subject: `Kalkulator: ${line}`,
        html: `<p>Kalkulator wyceny: ${escapeHtml(line)} (doba UTC).</p>`,
      }),
    });
  } catch (e) {
    console.error(`[quote] powiadomienie: błąd ${e instanceof Error ? e.name : 'nieznany'}`);
  }
}

/** Lead (source='calculator') + draft est_quote + odpowiedzi. Best-effort z retry; błąd nie 500-uje. */
async function persist(
  env: Env,
  rawLib: RawLibrary,
  email: string,
  answers: Answers,
  result: PublicQuoteResult,
  waitUntil?: (p: Promise<unknown>) => void,
): Promise<void> {
  try {
    const leadId = crypto.randomUUID();
    const budget = `${result.priceRange.min} - ${result.priceRange.max}`;
    const details = JSON.stringify({ answers, priceRange: result.priceRange });
    await withRetry(() =>
      env.DB.prepare(
        `INSERT INTO leads (id, email, name, service_type, budget, details, source, status)
         VALUES (?, ?, ?, ?, ?, ?, 'calculator', 'new')`,
      )
        .bind(leadId, email, 'Klient z kalkulatora', 'Kalkulator wyceny', budget, details)
        .run(),
    );

    const paramsObj: Record<string, string> = {};
    for (const p of rawLib.params) paramsObj[p.key] = p.value;
    const hourlyRate = Number(paramsObj.hourly_rate ?? 50);
    const name = `Kalkulator — ${email} — ${new Date().toISOString().slice(0, 10)}`;
    const inserted = await withRetry(() =>
      env.DB.prepare(
        `INSERT INTO est_quotes
           (name, lead_id, archetype_code, archetype_recommended, archetype_reason,
            status, hourly_rate, params_json, engine_version)
         VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?)`,
      )
        .bind(
          name,
          leadId,
          result.archetype.code,
          result.archetype.code,
          `Kalkulator publiczny — ${result.archetype.reason}`,
          hourlyRate,
          JSON.stringify(paramsObj),
          ENGINE_VERSION,
        )
        .run(),
    );
    const quoteId = inserted.meta.last_row_id as number;

    const stmts = Object.entries(answers).map(([code, value]) =>
      env.DB.prepare(
        `INSERT INTO est_quote_answers (quote_id, question_code, answer_json) VALUES (?, ?, ?)`,
      ).bind(quoteId, code, JSON.stringify(value)),
    );
    if (stmts.length > 0) await withRetry(() => env.DB.batch(stmts));

    // Kopia do CRM po pełnym zapisie (lead + wycena). Efekt uboczny — silnik bez zmian.
    wyslijDoCrmWTle(waitUntil, env, {
      external_id: leadId,
      source: 'calculator',
      received_at: new Date().toISOString(),
      email,
      name: 'Klient z kalkulatora',
      service: 'Kalkulator wyceny',
      budget_text: budget,
      quote_ref: String(quoteId),
      details: { answers, priceRange: result.priceRange },
    });
  } catch (e) {
    console.error(`[quote] zapis: błąd ${e instanceof Error ? e.name : 'nieznany'}`);
  }
}

/** E-mail do klienta + agencji. Brak RESEND_API_KEY = ciche pominięcie (degradacja łagodna, nigdy 500). */
async function sendEmails(env: Env, email: string, result: PublicQuoteResult): Promise<void> {
  if (!env.RESEND_API_KEY) return;
  const range = `${result.priceRange.min}–${result.priceRange.max} zł`;
  const send = (to: string, subject: string, html: string) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Mixture Marketing <info@mixturemarketing.pl>',
        to: [to],
        subject,
        html,
      }),
    }).catch(() => undefined);
  try {
    await send(
      email,
      'Twoja wstępna wycena — Mixture Marketing',
      `<h3>Dziękujemy!</h3><p>Wstępny orientacyjny koszt Twojego projektu: <strong>${range}</strong>.</p>
       <p>To zgrubne widełki z kalkulatora — skontaktujemy się, by doprecyzować zakres i podać dokładną ofertę.</p>`,
    );
    if (env.NOTIFY_EMAIL)
      await send(
        env.NOTIFY_EMAIL,
        `🧮 Nowa wycena z kalkulatora — ${email}`,
        `<p>Klient <strong>${escapeHtml(email)}</strong> policzył wycenę: ${escapeHtml(range)}. Draft czeka w panelu „Wyceny".</p>`,
      );
  } catch (e) {
    console.error(`[quote] e-mail: błąd ${e instanceof Error ? e.name : 'nieznany'}`);
  }
}
