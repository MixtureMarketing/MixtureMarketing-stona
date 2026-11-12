/**
 * Cloudflare Pages Function: publiczny kalkulator — podgląd widełek na żywo (MIX-1476, Z4).
 * Path: POST /api/estimation/public-preview  (BEZ auth, BEZ zapisu leada, BEZ e-maila).
 * Kontrakt z klientem: services/pricePreviewService.ts.
 *   - bez `preview_token`: Turnstile (hostname + action, błąd siteverify = 503) → limit wydawania
 *     5 tokenów / 15 min na klucz IP → widełki + nowy `preview_token` (ważny 15 min);
 *   - z `preview_token`: podpis (stały czas), exp, skrót IP → limit 60 podglądów na jti → widełki.
 * Klucz IP wyłącznie z `cf-connecting-ip` (IPv4 pełny, IPv6 /64); brak = 400, innych nagłówków
 * nie czytamy. Limiter: `_rateLimit` (KV) w trybie fail-closed (błąd = 503).
 * Log: stały kod powodu i cf-ray; bez IP, tokenu i odpowiedzi.
 */
import { loadRawLibrary, loadPublicQuestionDefs } from './_engineDb';
import { checkRateLimit, RateLimitError, type RateLimitStore } from './_rateLimit';
import { quoteTurnstileExpect, safeRay } from './_quoteGate';
import { readBodyLimited } from './public-quote';
import { activeKey, issueToken, verifyToken, PREVIEW_TOKEN_TTL_SEC } from './_previewToken';
import { verifyTurnstileStrict } from '../_shared/security';
import { edgeIpKey, hmacHex } from '../_shared/gateCounter';
import {
  parsePublicConfig,
  computePublicQuote,
  sanitizePublicAnswers,
} from '../../../lib/estimation/publicQuote';

interface Env {
  DB: D1Database;
  CACHE?: RateLimitStore;
  TURNSTILE_SECRET?: string;
  QUOTE_TURNSTILE_EXTRA_HOSTS?: string;
  PREVIEW_TOKEN_SECRET?: string;
  PREVIEW_TOKEN_KID?: string;
}

export const PREVIEW_MAX_BODY_BYTES = 8 * 1024;
export const PREVIEWS_PER_TOKEN = 60;
export const TOKENS_PER_IP = 5;
export const TOKEN_ISSUE_WINDOW_SEC = 15 * 60;
const BODY_KEYS = new Set(['answers', 'captcha_token', 'preview_token']);

const BUSY = 'Usługa chwilowo niedostępna. Spróbuj później.';
const BAD = 'Niepoprawne zapytanie.';
const INTERNAL = 'Błąd serwera. Spróbuj później.';

const CORS = {
  'Access-Control-Allow-Origin': 'https://mixturemarketing.pl',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...CORS,
      ...extra,
    },
  });

function deny(
  ray: string,
  status: number,
  reason: string,
  message: string,
  extra?: Record<string, string>,
) {
  console.error(`[preview] odmowa ${status}: ${reason} ray=${ray}`);
  return json({ error: message, reason }, status, extra);
}

/** Powody Turnstile, które znaczą „nie umiemy sprawdzić” (503), a nie „bot” (403). */
function turnstileUnavailable(reason: string): boolean {
  return (
    reason.startsWith('captcha: siteverify') ||
    reason === 'captcha: brak sekretu' ||
    reason === 'captcha: brak oczekiwań'
  );
}

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { status: 204, headers: CORS });

/** A8: nieobsłużony błąd (D1, silnik) = 500 z ogólną treścią; do logu tylko nazwa błędu. */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    return await handlePreview(request, env, Date.now());
  } catch (e) {
    const name = e instanceof Error ? e.name : 'nieznany';
    console.error(`[preview] błąd wewnętrzny: ${name} ray=${safeRay(request)}`);
    return json({ error: INTERNAL, reason: 'wewnętrzny' }, 500);
  }
};

/** Cały przepływ z jawnym `nowMs` (exp i okna liczników testowane bez zegara). */
export async function handlePreview(request: Request, env: Env, nowMs: number): Promise<Response> {
  const ray = safeRay(request);

  // 1. Treść ≤ 8 kB, obiekt JSON, tylko pola z allowlisty, najwyżej jeden token.
  const read = await readBodyLimited(request, PREVIEW_MAX_BODY_BYTES);
  if (!read.ok)
    return deny(ray, read.status, read.reason, read.status === 413 ? 'Zbyt duże zapytanie.' : BAD);
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(read.text);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return deny(ray, 400, 'body: nieczytelny', BAD);
  }
  if (!Object.keys(body).every((k) => BODY_KEYS.has(k)))
    return deny(ray, 400, 'body: nieznane pole', BAD);
  const hasToken = body.preview_token !== undefined;
  if (hasToken && body.captcha_token !== undefined) return deny(ray, 400, 'body: dwa tokeny', BAD);

  // 2. Klucz IP tylko z cf-connecting-ip (X-Forwarded-For i inne nagłówki ignorowane).
  const rawIp = request.headers.get('cf-connecting-ip');
  const ip = edgeIpKey(rawIp);
  if (!ip.ok) return deny(ray, 400, ip.reason, BAD);

  // 3. Sekret tokenu (brak = 503, także na ścieżce z tokenem).
  const key = activeKey(env as unknown as Record<string, unknown>);
  if (!key.ok) return deny(ray, 503, key.reason, BUSY);
  if (!env.CACHE) return deny(ray, 503, 'limiter: brak wiązania', BUSY);
  const kv = env.CACHE;

  let issue = false;
  try {
    if (hasToken) {
      // 4a. Token: podpis, exp, IP; potem limit podglądów na jti.
      const t = await verifyToken(
        env as unknown as Record<string, unknown>,
        body.preview_token,
        ip.key,
        nowMs,
      );
      if (!t.ok) return deny(ray, 401, t.reason, 'Odśwież weryfikację.');
      const rl = await checkRateLimit(
        kv,
        t.jti,
        PREVIEWS_PER_TOKEN,
        PREVIEW_TOKEN_TTL_SEC,
        'pv:jti:',
        { failClosed: true },
      );
      if (!rl.allowed)
        return deny(
          ray,
          401,
          `token: wyczerpany n=${rl.count}/${PREVIEWS_PER_TOKEN}`,
          'Odśwież weryfikację.',
        );
    } else {
      // 4b. Bez tokenu: Turnstile (fail-closed), potem limit wydawania tokenów na klucz IP.
      const ts = await verifyTurnstileStrict(
        body.captcha_token,
        env.TURNSTILE_SECRET,
        rawIp ?? '',
        quoteTurnstileExpect(env),
      );
      if (!ts.ok) {
        if (turnstileUnavailable(ts.reason)) return deny(ray, 503, ts.reason, BUSY);
        return deny(ray, 403, ts.reason, 'Weryfikacja antybotowa nieudana.');
      }
      const ipHash = (await hmacHex(key.secret, 'pvip', ip.key)).slice(0, 32);
      const rl = await checkRateLimit(
        kv,
        ipHash,
        TOKENS_PER_IP,
        TOKEN_ISSUE_WINDOW_SEC,
        'pv:iss:',
        {
          failClosed: true,
        },
      );
      if (!rl.allowed)
        return deny(
          ray,
          429,
          `limit tokenów n=${rl.count}/${TOKENS_PER_IP}`,
          'Zbyt wiele zapytań. Spróbuj później.',
          { 'Retry-After': String(TOKEN_ISSUE_WINDOW_SEC) },
        );
      issue = true;
    }
  } catch (e) {
    if (e instanceof RateLimitError) return deny(ray, 503, 'limiter: błąd', BUSY);
    throw e;
  }

  // 5. Odpowiedzi: allowlista pytań i opcji z public-questions (ta sama walidacja co wycena).
  const defs = await loadPublicQuestionDefs(env.DB);
  const checked = sanitizePublicAnswers(body.answers, defs);
  if (checked.errors.length > 0) return deny(ray, 400, checked.reasons[0], BAD);

  // 6. Widełki (bez zapisu, bez e-maila); wynik tylko {min, max, currency} (+ token).
  const rawLib = await loadRawLibrary(env.DB);
  const result = computePublicQuote(rawLib, checked.answers, parsePublicConfig(rawLib.params));
  const priceRange = { min: result.priceRange.min, max: result.priceRange.max, currency: 'PLN' };
  if (!issue) return json({ priceRange });
  const { token } = await issueToken(key, ip.key, nowMs);
  return json({ priceRange, preview_token: token });
}
