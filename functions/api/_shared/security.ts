// Wspólne helpery bezpieczeństwa dla Pages Functions (bez handlerów → nie tworzy trasy).
// Jedno źródło dla escapowania HTML w mailach, walidacji URL i weryfikacji Turnstile,
// żeby każdy endpoint nie miał własnej, rozjeżdżającej się kopii.

/** Escapuje tekst do wstawienia w HTML maila (treść i wartości atrybutów). */
export function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Jak escapeHtml, ale zachowuje podział linii jako <br>. */
export function escapeHtmlMultiline(s: unknown): string {
  return escapeHtml(s).replace(/\r?\n/g, '<br>');
}

/**
 * Zwraca znormalizowany URL tylko dla schematów http/https (inaczej null).
 * Dopuszcza adres bez schematu (np. "firma.pl") — wtedy zakłada https.
 */
export function safeHttpUrl(raw: unknown): string | null {
  const input = String(raw ?? '').trim();
  if (!input || input.length > 2048) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(input) ? input : `https://${input}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (!u.hostname || u.username || u.password) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** IP klienta wg Cloudflare (pusty string poza CF, np. w testach). */
export function clientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') || '';
}

/**
 * Weryfikacja tokenu Turnstile po stronie serwera. Brak tokenu/sekretu = odrzucenie
 * (bez pseudo-tokenów obejścia).
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  secret: string | undefined,
  ip: string,
): Promise<boolean> {
  if (!token || !secret) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/** Czego oczekujemy od `siteverify` poza `success` (SPEC-MIX-1320 §6 A12). */
export interface TurnstileExpect {
  /** Dokładne nazwy hostów (allowlista, bez dopasowania sufiksu). */
  hostnames: readonly string[];
  /** Akcja nadana widgetowi przy renderze (`action`). */
  action: string;
}
export type TurnstileVerdict = { ok: true } | { ok: false; reason: string };

/** Najdłuższy token Turnstile według dokumentacji Cloudflare. */
const TURNSTILE_TOKEN_MAX = 2048;

/**
 * Ścisła weryfikacja Turnstile: `success === true` ORAZ `hostname` z allowlisty ORAZ `action`
 * równa oczekiwanej. Fail-closed: brak tokenu/sekretu/oczekiwań, błąd sieci, HTTP ≠ 2xx,
 * odpowiedź nie-JSON albo brak pola = odmowa ze stałym kodem powodu (bez treści od klienta).
 */
export async function verifyTurnstileStrict(
  token: unknown,
  secret: string | undefined,
  ip: string,
  expect: TurnstileExpect,
): Promise<TurnstileVerdict> {
  if (typeof token !== 'string' || token === '' || token.length > TURNSTILE_TOKEN_MAX)
    return { ok: false, reason: 'captcha: token' };
  if (!secret) return { ok: false, reason: 'captcha: brak sekretu' };
  if (expect.hostnames.length === 0 || expect.action === '')
    return { ok: false, reason: 'captcha: brak oczekiwań' };
  let data: unknown;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    if (!res.ok) return { ok: false, reason: 'captcha: siteverify http' };
    data = await res.json();
  } catch {
    return { ok: false, reason: 'captcha: siteverify niedostępny' };
  }
  if (data === null || typeof data !== 'object')
    return { ok: false, reason: 'captcha: siteverify odpowiedź' };
  const d = data as { success?: unknown; hostname?: unknown; action?: unknown };
  if (d.success !== true) return { ok: false, reason: 'captcha: odrzucony' };
  if (typeof d.hostname !== 'string' || !expect.hostnames.includes(d.hostname))
    return { ok: false, reason: 'captcha: hostname' };
  if (typeof d.action !== 'string' || d.action !== expect.action)
    return { ok: false, reason: 'captcha: action' };
  return { ok: true };
}

/** SHA-256 jako hex — do kluczy KV (np. limit per adres e-mail bez trzymania adresu). */
export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
