// Bramka limitów publicznej wyceny (MIX-1382, PROJEKT-MIX-1382 §3, tabela decyzji 1-16).
// Kolejność: tanie odmowy (URL, ciało, honeypot, e-mail, IP) → Turnstile → konfiguracja →
// liczniki D1 (IP, e-mail, dzień) → dopiero wtedy wołający czyta bibliotekę i zapisuje leada.
// Licznik rośnie dopiero po Turnstile, więc bot bez tokenu nie zablokuje cudzego e-maila.
// Fail-closed: każdy błąd, brak danych albo nieczytelna wartość = odmowa z linią powodu.
// Log: tylko stały kod powodu, n/l i cf-ray (bez IP, e-maila, skrótu i e.message).
// Bez handlerów → nie tworzy trasy.

import { verifyTurnstile } from '../_shared/security';
import {
  bumpCounter,
  CounterError,
  edgeIpKey,
  hmacHex,
  hmacSecret,
  HMAC_SECRET_NAME,
  normalizeEmail,
  parseLimitEnv,
  purgeCounters,
  type CounterDb,
} from '../_shared/gateCounter';

export interface QuoteGateEnv {
  DB?: unknown;
  TURNSTILE_SECRET?: string;
  QUOTE_KEY_HMAC_SECRET?: string;
  QUOTE_IP_PER_HOUR?: string;
  QUOTE_EMAIL_PER_DAY?: string;
  QUOTE_DAILY_BUDGET?: string;
}

export interface QuoteBody {
  answers?: Record<string, unknown>;
  email?: string;
  captcha_token?: string;
  website_verify?: unknown;
}

export type QuoteGateDenial = {
  ok: false;
  status: number;
  reason: string;
  message: string;
  retryAfter?: number;
};
export type QuoteGatePass = {
  ok: true;
  body: QuoteBody;
  /** E-mail po trim (do leada i maila klienta), nie klucz licznika. */
  email: string;
  /** Linia powiadomienia 80% budżetu (dokładnie raz na dobę) albo null. */
  budgetAlert: string | null;
};
export type QuoteGateResult = QuoteGatePass | QuoteGateDenial;

export const MAX_QUERY_LEN = 256;
const BUSY = 'Usługa chwilowo niedostępna. Spróbuj później.';
const TOO_MANY = 'Zbyt wiele zapytań. Spróbuj później.';

/** cf-ray tylko w znanym kształcie; reszta = '-' (do logu nie trafia nic od klienta). */
export function safeRay(request: Request): string {
  const r = request.headers.get('cf-ray') ?? '';
  return /^[0-9a-f]{8,20}(-[A-Z]{3})?$/.test(r) ? r : '-';
}

function deny(
  ray: string,
  status: number,
  reason: string,
  message: string,
  retryAfter?: number,
): QuoteGateDenial {
  console.error(`[quote] odmowa ${status}: ${reason} ray=${ray}`);
  return { ok: false, status, reason, message, retryAfter };
}

/** Przełącznik nowych limitów: brak/'0' = stara ścieżka, '1' = limity D1, inne = 503. */
export function limitsSwitch(v: unknown): 'off' | 'on' | 'bad' {
  if (v === undefined || v === '0') return 'off';
  if (v === '1') return 'on';
  return 'bad';
}

/**
 * Wiersze 1-15 tabeli decyzji. `waitUntil` (jeśli jest) dostaje retencję liczników;
 * bez niego retencja jest oczekiwana w miejscu (testy, lokalny dev).
 */
export async function quoteGate(
  request: Request,
  env: QuoteGateEnv,
  opts: { nowMs?: number; waitUntil?: (p: Promise<unknown>) => void; timeoutMs?: number } = {},
): Promise<QuoteGateResult> {
  const ray = safeRay(request);
  const nowMs = opts.nowMs ?? Date.now();

  // 1. URL
  let search: string;
  try {
    search = new URL(request.url).search.slice(1);
  } catch {
    return deny(ray, 400, 'url: za długi', 'Niepoprawne zapytanie.');
  }
  if (search.length > MAX_QUERY_LEN)
    return deny(ray, 400, 'url: za długi', 'Niepoprawne zapytanie.');

  // 2. Ciało: niepusty JSON będący obiektem.
  let parsed: unknown;
  try {
    const text = await request.text();
    parsed = text.trim() === '' ? null : JSON.parse(text);
  } catch {
    parsed = null;
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return deny(ray, 400, 'body: nieczytelny', 'Niepoprawny JSON.');
  }
  const body = parsed as QuoteBody;

  // 3. Honeypot
  const hp = body.website_verify;
  if (hp !== undefined && hp !== null && hp !== '')
    return deny(ray, 403, 'honeypot', 'Spam detected');

  // 4. E-mail (allowlista ASCII, pusta część lokalna po +tag = odmowa)
  const emailKey = normalizeEmail(body.email);
  if (emailKey === null) return deny(ray, 400, 'e-mail: format', 'Podaj poprawny adres e-mail.');
  const email = (body.email as string).trim();

  // 5-7. IP krawędzi Cloudflare (inne nagłówki ignorowane)
  const rawIp = request.headers.get('cf-connecting-ip');
  const ip = edgeIpKey(rawIp);
  if (!ip.ok) return deny(ray, 503, ip.reason, BUSY);

  // 8. Turnstile
  if (!(await verifyTurnstile(body.captcha_token, env.TURNSTILE_SECRET, rawIp ?? ''))) {
    return deny(ray, 403, 'captcha', 'Weryfikacja antybotowa nieudana.');
  }

  // 9. Konfiguracja (zła wartość = 503, brak = domyślna) i sekret HMAC (brak = 503)
  const ipLimit = parseLimitEnv(env.QUOTE_IP_PER_HOUR, 5);
  if (ipLimit === null) return deny(ray, 503, 'konfiguracja: QUOTE_IP_PER_HOUR', BUSY);
  const emailLimit = parseLimitEnv(env.QUOTE_EMAIL_PER_DAY, 3);
  if (emailLimit === null) return deny(ray, 503, 'konfiguracja: QUOTE_EMAIL_PER_DAY', BUSY);
  const budget = parseLimitEnv(env.QUOTE_DAILY_BUDGET, 200);
  if (budget === null) return deny(ray, 503, 'konfiguracja: QUOTE_DAILY_BUDGET', BUSY);
  const secret = hmacSecret(env.QUOTE_KEY_HMAC_SECRET);
  if (secret === null) return deny(ray, 503, `konfiguracja: ${HMAC_SECRET_NAME}`, BUSY);

  // 10. Wiązanie D1
  const db = env.DB as CounterDb | undefined;
  if (!db || typeof (db as { prepare?: unknown }).prepare !== 'function') {
    return deny(ray, 503, 'licznik: brak D1', BUSY);
  }

  // 11-15. Liczniki (każdy atomowy); retencja po liczeniu, także po odmowie 429.
  const lim = { ip: ipLimit, email: emailLimit, budget };
  const keys = { ip: ip.key, email: emailKey };
  let result: QuoteGateResult;
  try {
    result = await countAll(db, secret, keys, lim, ray, nowMs, opts.timeoutMs);
  } catch (e) {
    result = deny(ray, 503, `licznik: ${e instanceof CounterError ? e.code : 'błąd'}`, BUSY);
  }
  if (result.ok) result = { ...result, body, email };
  const purge = purgeCounters(db, nowMs).catch((e: unknown) => {
    console.error(`[quote] retencja: błąd ${e instanceof Error ? e.name : 'nieznany'} ray=${ray}`);
  });
  if (opts.waitUntil) opts.waitUntil(purge);
  else await purge;
  return result;
}

async function countAll(
  db: CounterDb,
  secret: string,
  keys: { ip: string; email: string },
  lim: { ip: number; email: number; budget: number },
  ray: string,
  nowMs: number,
  timeoutMs?: number,
): Promise<QuoteGateResult> {
  const ipKey = `q:ip:${await hmacHex(secret, 'ip', keys.ip)}`;
  const ipHit = await bumpCounter(db, ipKey, 3600, nowMs, timeoutMs);
  if (ipHit.n > lim.ip) {
    return deny(ray, 429, `limit IP n=${ipHit.n}/${lim.ip}`, TOO_MANY, ipHit.retryAfter);
  }
  const emKey = `q:em:${await hmacHex(secret, 'em', keys.email)}`;
  const emHit = await bumpCounter(db, emKey, 86400, nowMs, timeoutMs);
  if (emHit.n > lim.email) {
    return deny(ray, 429, `limit e-mail n=${emHit.n}/${lim.email}`, TOO_MANY, emHit.retryAfter);
  }
  const day = await bumpCounter(db, 'q:day', 86400, nowMs, timeoutMs);
  if (day.n > lim.budget) {
    const msg = 'Dzienny limit wyczerpany. Spróbuj jutro.';
    return deny(ray, 429, `budżet dzienny n=${day.n}/${lim.budget}`, msg);
  }
  let budgetAlert: string | null = null;
  if (day.n === Math.ceil(0.8 * lim.budget)) {
    budgetAlert = `budżet 80% n=${day.n}/${lim.budget}`;
    console.error(`[quote] ${budgetAlert} ray=${ray}`);
  }
  console.log(`[quote] przepuść ray=${ray}`);
  return { ok: true, body: {}, email: '', budgetAlert };
}
