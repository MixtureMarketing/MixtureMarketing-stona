/**
 * Cloudflare Pages Function: publiczny kalkulator — wycena.
 * Path: POST /api/estimation/public-quote  (BEZ auth — poza /api/admin, /api/portal).
 * Kontrakt: docs/estimation/kontrakt-kalkulator-publiczny.md §3.
 * Przepływ: honeypot → email → Turnstile → rate-limit (KV) → walidacja → compute → lead + draft
 * (best-effort, retry) → e-mail (best-effort, degradacja łagodna). Zwraca WYŁĄCZNIE priceRange.
 */
import { loadRawLibrary, loadPublicQuestionDefs } from './_engineDb';
import { checkRateLimit } from './_rateLimit';
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

interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  TURNSTILE_SECRET: string;
  RESEND_API_KEY?: string;
  NOTIFY_EMAIL?: string;
}

interface Body {
  answers?: Record<string, unknown>;
  email?: string;
  captcha_token?: string;
  website_verify?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_WINDOW_SEC = 3600;

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

/** Weryfikacja Turnstile (wzorzec contact-submit) — bez pseudo-tokenów obejścia. */
async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  if (!token || !secret) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { status: 204, headers: CORS });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json({ error: 'Niepoprawny JSON.' }, 400);
  }

  // 1. Honeypot (darmowe, przed jakąkolwiek pracą).
  if (body.website_verify) return json({ error: 'Spam detected' }, 403);

  // 2. Email wymagany (kontrakt §3) — tania walidacja przed zewnętrznym fetchem.
  const email = (body.email ?? '').trim();
  if (!EMAIL_RE.test(email)) return json({ error: 'Podaj poprawny adres e-mail.' }, 400);

  // 3. Turnstile.
  const ip = request.headers.get('cf-connecting-ip') || '';
  if (!(await verifyTurnstile(body.captcha_token ?? '', env.TURNSTILE_SECRET, ip)))
    return json({ error: 'Weryfikacja antybotowa nieudana.' }, 403);

  // 4. Biblioteka + konfiguracja + rate-limit (limit z parametrów).
  const rawLib = await loadRawLibrary(env.DB);
  const config = parsePublicConfig(rawLib.params);
  const rl = await checkRateLimit(env.CACHE, ip, config.ratePerHour, RATE_WINDOW_SEC);
  if (!rl.allowed) return json({ error: 'Zbyt wiele zapytań. Spróbuj za chwilę.' }, 429);

  // 5. Walidacja odpowiedzi (tylko kody publiczne + typy).
  const defs = await loadPublicQuestionDefs(env.DB);
  const { answers, errors } = sanitizePublicAnswers(body.answers, defs);
  if (errors.length > 0) return json({ errors }, 400);

  // 6. Compute + transform publiczny.
  const result = computePublicQuote(rawLib, answers, config);

  // 7. Zapis (best-effort, retry) — nie blokuje zwrotu ceny.
  await persist(env, rawLib, email, answers, result);

  // 8. E-mail (best-effort, degradacja łagodna).
  await sendEmails(env, email, result);

  return json({ priceRange: result.priceRange, currency: 'PLN', status: 'ok' });
};

/** Lead (source='calculator') + draft est_quote + odpowiedzi. Best-effort z retry; błąd nie 500-uje. */
async function persist(
  env: Env,
  rawLib: RawLibrary,
  email: string,
  answers: Answers,
  result: PublicQuoteResult,
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
  } catch (e) {
    console.error('public-quote persist failed:', e);
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
        `<p>Klient <strong>${email}</strong> policzył wycenę: ${range}. Draft czeka w panelu „Wyceny".</p>`,
      );
  } catch (e) {
    console.error('public-quote email failed:', e);
  }
}
