// Liczniki ścisłe w D1 dla publicznych endpointów (MIX-1382, projekt PROJEKT-MIX-1382 §1-§2).
// Każdy licznik = JEDNA atomowa instrukcja INSERT … ON CONFLICT DO UPDATE … RETURNING na
// tabeli rate_counters (migracja 0010). D1 wykonuje zapytania po kolei, więc limit jest ścisły.
// Fail-closed: wyjątek, timeout i wynik spoza kształtu rzucają CounterError (wołający = 503).
// Klucze IP i e-mail zapisujemy WYŁĄCZNIE jako HMAC-SHA256 z sekretem QUOTE_KEY_HMAC_SECRET
// (warunek 2 recenzji L-SYS): tabela liczników nie dubluje danych osobowych z tabeli leadów.
// Retencja 48 h (warunek 1): purgeCounters usuwa wiersze z exp < teraz (exp = start okna + 48 h).
// Bez handlerów → nie tworzy trasy.

import { parseIPv6 } from './publicUrl';

export const RETENTION_SEC = 48 * 3600;
export const COUNTER_TIMEOUT_MS = 1_500;
/** Nazwa sekretu HMAC kluczy liczników (wpisuje Jakub w panelu Cloudflare Pages). */
export const HMAC_SECRET_NAME = 'QUOTE_KEY_HMAC_SECRET';
/** Najkrótszy akceptowany sekret (32 znaki, np. `openssl rand -hex 32` daje 64). */
export const HMAC_SECRET_MIN_LEN = 32;

/** Minimalny podzbiór D1Database używany przez licznik (łatwy do podstawienia w testach). */
export interface CounterDb {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T = Record<string, unknown>>(): Promise<T | null>;
      run(): Promise<unknown>;
    };
  };
}

export class CounterError extends Error {
  constructor(public code: 'błąd' | 'timeout' | 'uszkodzony') {
    super(code);
    this.name = 'CounterError';
  }
}

// Parametry: k, win, exp, skok (dopuszczalne wyprzedzenie zapisanego okna = 1 okno).
// SQLite w SET czyta stare wartości wiersza, więc trzy CASE widzą ten sam stan.
// - nowe okno (excluded.win > win) → n = 1;
// - zapisane okno wyprzedza nasze o ≤ 1 okno (izolat z cofniętym zegarem) → liczymy dalej
//   w zapisanym oknie, nie zerujemy (forma W1);
// - zapisane okno wyprzedza o > 1 okno (wiersz z przyszłości) → wiersz uszkodzony, zerujemy
//   do naszego okna (bez trwałej blokady klucza i bez wiersza poza retencją).
export const COUNTER_SQL = `INSERT INTO rate_counters (k, n, win, exp) VALUES (?, 1, ?, ?)
ON CONFLICT(k) DO UPDATE SET
  n = CASE WHEN excluded.win > rate_counters.win OR rate_counters.win > excluded.win + ? THEN 1 ELSE rate_counters.n + 1 END,
  win = CASE WHEN rate_counters.win > excluded.win + ? THEN excluded.win ELSE MAX(rate_counters.win, excluded.win) END,
  exp = CASE WHEN rate_counters.win > excluded.win + ? THEN excluded.exp ELSE MAX(rate_counters.exp, excluded.exp) END
RETURNING n, win`;

/** Retencja: wiersze po exp (start okna + 48 h) i wiersze z oknem z przyszłości (> 2 doby). */
export const PURGE_SQL = `DELETE FROM rate_counters WHERE exp < ? OR win > ?`;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const t = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new CounterError('timeout')), ms);
  });
  return Promise.race([p, t]).finally(() => clearTimeout(timer));
}

export interface CounterHit {
  n: number;
  /** Początek okna (sekundy epoki), w którym policzono żądanie. */
  win: number;
  /** Sekundy do końca okna (nagłówek Retry-After). */
  retryAfter: number;
}

/**
 * Podbija licznik `key` w oknie `windowSec` (okna wyrównane do epoki, czyli godziny i doby UTC).
 * Rzuca CounterError('błąd' | 'timeout' | 'uszkodzony'); nigdy nie zwraca „przepuść” po błędzie.
 */
export async function bumpCounter(
  db: CounterDb,
  key: string,
  windowSec: number,
  nowMs: number,
  timeoutMs: number = COUNTER_TIMEOUT_MS,
): Promise<CounterHit> {
  const nowSec = Math.floor(nowMs / 1000);
  const win = nowSec - (nowSec % windowSec);
  let row: Record<string, unknown> | null;
  try {
    row = await withTimeout(
      db
        .prepare(COUNTER_SQL)
        .bind(key, win, win + RETENTION_SEC, windowSec, windowSec, windowSec)
        .first<Record<string, unknown>>(),
      timeoutMs,
    );
  } catch (e) {
    throw e instanceof CounterError ? e : new CounterError('błąd');
  }
  const n = row?.n;
  const gotWin = row?.win;
  if (
    typeof n !== 'number' ||
    !Number.isInteger(n) ||
    n < 1 ||
    typeof gotWin !== 'number' ||
    !Number.isInteger(gotWin) ||
    gotWin < win ||
    gotWin > win + windowSec
  ) {
    throw new CounterError('uszkodzony');
  }
  return { n, win: gotWin, retryAfter: Math.max(1, gotWin + windowSec - nowSec) };
}

/** Retencja 48 h: usuwa wiersze po terminie i wiersze z oknem z przyszłości. */
export async function purgeCounters(db: CounterDb, nowMs: number): Promise<void> {
  const nowSec = Math.floor(nowMs / 1000);
  await db
    .prepare(PURGE_SQL)
    .bind(nowSec, nowSec + 2 * 86400)
    .run();
}

// ---------- klucze ----------

/** HMAC-SHA256(secret, v1|<zakres>|<wartość>) jako hex. Wartość jawna nie trafia do D1. */
export async function hmacHex(secret: string, scope: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`v1|${scope}|${value}`),
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Sekret HMAC: brak, pusty albo krótszy niż 32 znaki = null (wołający odmawia 503). */
export function hmacSecret(v: unknown): string | null {
  return typeof v === 'string' && v.length >= HMAC_SECRET_MIN_LEN ? v : null;
}

const IPV4_OCTET = '(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])';
const IPV4_RE = new RegExp(`^${IPV4_OCTET}(\\.${IPV4_OCTET}){3}$`);
const IPV6_CHARS_RE = /^[0-9A-Fa-f:.]{2,45}$/;

export type EdgeIp =
  | { ok: true; key: string }
  | { ok: false; reason: 'ip: brak' | 'ip: nieczytelny' | 'ip: pseudo-ipv4' };

function v4Key(s: string): EdgeIp {
  if (Number(s.split('.')[0]) >= 240) return { ok: false, reason: 'ip: pseudo-ipv4' };
  return { ok: true, key: `v4:${s}` };
}

/**
 * Klucz limitu z nagłówka `cf-connecting-ip` (jedyne zaufane źródło, ustawia je krawędź
 * Cloudflare). Allowlista: dokładnie jeden IPv4 (bez zer wiodących, bez spacji) albo jeden
 * IPv6 (klucz = prefiks /64). `::ffff:a.b.c.d` = ten sam klucz co `a.b.c.d`.
 * 240.0.0.0/4 (Pseudo IPv4 Cloudflare) = odmowa. Wszystko inne = nieczytelny.
 */
export function edgeIpKey(raw: string | null | undefined): EdgeIp {
  if (raw === null || raw === undefined || raw === '') return { ok: false, reason: 'ip: brak' };
  if (IPV4_RE.test(raw)) return v4Key(raw);
  if (!IPV6_CHARS_RE.test(raw) || !raw.includes(':'))
    return { ok: false, reason: 'ip: nieczytelny' };
  // Końcówka IPv4 w IPv6 musi sama przejść allowlistę IPv4 (parseIPv6 dopuszcza zera wiodące).
  const tail = raw.slice(raw.lastIndexOf(':') + 1);
  if (tail.includes('.') && !IPV4_RE.test(tail)) return { ok: false, reason: 'ip: nieczytelny' };
  const h = parseIPv6(raw);
  if (!h) return { ok: false, reason: 'ip: nieczytelny' };
  if (h.slice(0, 5).every((x) => x === 0) && h[5] === 0xffff) {
    return v4Key([h[6] >> 8, h[6] & 255, h[7] >> 8, h[7] & 255].join('.'));
  }
  return {
    ok: true,
    key: `v6:${h
      .slice(0, 4)
      .map((x) => x.toString(16))
      .join(':')}::/64`,
  };
}

const EMAIL_RE = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,63}$/;
const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com']);

/**
 * Klucz e-maila do licznika: trim, allowlista ASCII (≤ 254 znaki), małe litery, obcięcie od
 * pierwszego `+`. Kropki usuwamy TYLKO dla gmail.com i googlemail.com (domena → gmail.com),
 * bo tylko tam Gmail je ignoruje (warunek 3). Null = odmowa 400 `e-mail: format`.
 */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (s.length > 254 || !EMAIL_RE.test(s)) return null;
  const lower = s.toLowerCase();
  const at = lower.lastIndexOf('@');
  let local = lower.slice(0, at);
  let domain = lower.slice(at + 1);
  const plus = local.indexOf('+');
  if (plus >= 0) local = local.slice(0, plus);
  if (GMAIL_DOMAINS.has(domain)) {
    local = local.replace(/\./g, '');
    domain = 'gmail.com';
  }
  if (local === '') return null;
  return `${local}@${domain}`;
}

// ---------- konfiguracja ----------

const LIMIT_RE = /^[1-9][0-9]{0,3}$/;

/** Limit z env: brak zmiennej = domyślna; obecna i spoza ^[1-9][0-9]{0,3}$ = null (503). */
export function parseLimitEnv(v: unknown, fallback: number): number | null {
  if (v === undefined) return fallback;
  if (typeof v !== 'string' || !LIMIT_RE.test(v)) return null;
  return Number(v);
}

// ---------- podgląd (Z4): token przypięty do klucza IP ----------

/** Znacznik tokenu podglądu przypięty do klucza IP (/64 dla IPv6). */
export async function tokenIpTag(secret: string, ipKey: string): Promise<string> {
  return (await hmacHex(secret, 'tok', ipKey)).slice(0, 32);
}

/** true tylko gdy znacznik tokenu pasuje do klucza IP żądania (porównanie stałoczasowe). */
export async function tokenMatchesIp(
  tag: unknown,
  secret: string,
  ipKey: string,
): Promise<boolean> {
  if (typeof tag !== 'string' || tag.length !== 32) return false;
  const want = await tokenIpTag(secret, ipKey);
  let diff = 0;
  for (let i = 0; i < 32; i++) diff |= want.charCodeAt(i) ^ tag.charCodeAt(i);
  return diff === 0;
}

export type TokenIssue =
  { ok: true; tag: string } | { ok: false; status: 403 | 429 | 503; reason: string };

/**
 * Wydanie tokenu podglądu (Z4): tylko po Turnstile, najwyżej `perHour` na klucz IP na godzinę.
 * Błąd licznika = 503 (fail-closed).
 */
export async function issuePreviewToken(opts: {
  captchaOk: boolean;
  db: CounterDb;
  secret: string;
  ipKey: string;
  nowMs: number;
  perHour?: number;
}): Promise<TokenIssue> {
  if (!opts.captchaOk) return { ok: false, status: 403, reason: 'captcha' };
  const limit = opts.perHour ?? 10;
  try {
    const hit = await bumpCounter(
      opts.db,
      `q:tok:${await hmacHex(opts.secret, 'ip', opts.ipKey)}`,
      3600,
      opts.nowMs,
    );
    if (hit.n > limit)
      return { ok: false, status: 429, reason: `limit tokenów n=${hit.n}/${limit}` };
  } catch (e) {
    return {
      ok: false,
      status: 503,
      reason: `licznik: ${e instanceof CounterError ? e.code : 'błąd'}`,
    };
  }
  return { ok: true, tag: await tokenIpTag(opts.secret, opts.ipKey) };
}
