// Jedna bramka dla publicznych endpointów audytu (MIX-1324).
// Kolejność: Turnstile → limit per IP (IPv6 liczone jako /64) → dzienny budżet globalny.
// W odróżnieniu od miękkiego limitera kalkulatora (estimation/_rateLimit, fail-open) tu
// błąd licznika = ODMOWA (fail-closed) z jedną linią powodu w logu: każde przepuszczone
// żądanie to płatne zapytania Google albo mail z domeny firmy.
// KV jest eventually consistent — równoległe żądania z różnych lokalizacji mogą minimalnie
// przekroczyć próg; twardą bramą botów jest Turnstile, liczniki ograniczają koszt.
// Bez handlerów → nie tworzy trasy.

import { clientIp, verifyTurnstile } from './security';
import { ipLimitKey } from './publicUrl';

export interface GateStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface GateLimits {
  /** Nazwa endpointu w kluczach KV i w linii powodu (np. 'audit-run'). */
  name: string;
  ipLimit: number;
  ipWindowSec: number;
  /** Ile przepuszczonych żądań na dobę (UTC) łącznie, ze wszystkich IP. */
  dailyBudget: number;
}

export type GateDenial = { ok: false; status: number; reason: string; message: string };
export type GateResult = { ok: true } | GateDenial;

function deny(name: string, status: number, reason: string, message: string): GateDenial {
  // Linia powodu: jedna, bez danych osobowych (bez IP, bez e-maila).
  console.error(`[gate:${name}] odmowa ${status}: ${reason}`);
  return { ok: false, status, reason, message };
}

/** Krok 1: Turnstile. Brak tokenu, brak sekretu albo awaria weryfikacji = odmowa. */
export async function gateCaptcha(
  name: string,
  request: Request,
  token: unknown,
  secret: string | undefined,
): Promise<GateResult> {
  const ok = await verifyTurnstile(
    typeof token === 'string' ? token : '',
    secret,
    clientIp(request),
  );
  return ok ? { ok: true } : deny(name, 403, 'captcha', 'Weryfikacja captcha nieudana');
}

// Wartość licznika, którą sami zapisujemy: liczba dziesiętna bez znaku i zer wiodących.
const COUNTER_VALUE = /^(?:0|[1-9][0-9]{0,14})$/;

/**
 * Licznik ścisły: rzuca przy błędzie KV (wołający odmawia). Brak klucza (null) = 0; każda
 * inna wartość spoza allowlisty COUNTER_VALUE („abc”, „-3”, „5abc”, „”, „1e3”) = uszkodzony
 * licznik (MIX-1395: parseInt przepuszczał „5abc” jako 5).
 */
export async function strictBump(
  kv: GateStore,
  key: string,
  limit: number,
  ttl: number,
): Promise<boolean> {
  const raw = await kv.get(key);
  if (raw !== null && !COUNTER_VALUE.test(raw)) throw new Error('uszkodzony licznik');
  const count = raw === null ? 0 : Number(raw);
  if (count >= limit) return false;
  await kv.put(key, String(count + 1), { expirationTtl: ttl });
  return true;
}

/** Krok 2: limit per IP (/64 dla IPv6) i dzienny budżet. Błąd licznika = 503. */
export async function gateLimits(
  kv: GateStore | undefined,
  request: Request,
  limits: GateLimits,
  now: Date = new Date(),
): Promise<GateResult> {
  const { name } = limits;
  const busy = 'Usługa chwilowo niedostępna. Spróbuj później.';
  if (!kv) return deny(name, 503, 'licznik: brak magazynu KV', busy);
  const ipKey = `gate:${name}:ip:${ipLimitKey(clientIp(request))}`;
  const dayKey = `gate:${name}:day:${now.toISOString().slice(0, 10)}`;
  try {
    if (!(await strictBump(kv, ipKey, limits.ipLimit, limits.ipWindowSec))) {
      return deny(name, 429, 'limit IP', 'Limit na godzinę wyczerpany. Spróbuj później.');
    }
    if (!(await strictBump(kv, dayKey, limits.dailyBudget, 2 * 86400))) {
      return deny(name, 429, 'budżet dzienny', 'Dzienny limit wyczerpany. Spróbuj jutro.');
    }
  } catch (e) {
    return deny(name, 503, `licznik: ${e instanceof Error ? e.message : String(e)}`, busy);
  }
  return { ok: true };
}

/** Odpowiedź JSON dla odmowy (wspólny kształt endpointów audytu). */
export function denialResponse(d: GateDenial): Response {
  return new Response(JSON.stringify({ status: 'error', reason: d.reason, message: d.message }), {
    status: d.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Dodatnia liczba całkowita z env (konfiguracja bez wdrażania kodu) albo domyślna. */
export function envInt(v: unknown, fallback: number): number {
  const n = typeof v === 'string' || typeof v === 'number' ? Number(v) : NaN;
  return Number.isInteger(n) && n > 0 ? n : fallback;
}
