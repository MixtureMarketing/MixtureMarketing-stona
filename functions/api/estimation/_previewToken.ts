// Token podglądu ceny (MIX-1476). Bezstanowy: `<payload>.<podpis>`, oba w base64url.
// payload = JSON {v, kid, jti, exp, iph}: jti losowe 128 bit (klucz licznika podglądów),
// exp w sekundach epoki, iph = skrót klucza IP (tokenIpTag, /64 dla IPv6).
// podpis = HMAC-SHA256(sekret[kid], "pv1." + payload). Sekret wybiera kid: `main` =
// PREVIEW_TOKEN_SECRET, inny kid = PREVIEW_TOKEN_SECRET_<KID> (rotacja bez zmiany kodu;
// aktywny kid wydawania z PREVIEW_TOKEN_KID, domyślnie `main`).
// Allowlista kształtu i fail-closed: każde odchylenie = odmowa ze stałym kodem powodu.
// Czas `nowMs` zawsze z wywołującego (testy exp bez zegara). Bez handlerów → nie tworzy trasy.

import { tokenIpTag } from '../_shared/gateCounter';

export const PREVIEW_TOKEN_VERSION = 1;
export const PREVIEW_TOKEN_TTL_SEC = 15 * 60;
export const PREVIEW_SECRET_NAME = 'PREVIEW_TOKEN_SECRET';
export const PREVIEW_KID_NAME = 'PREVIEW_TOKEN_KID';
export const PREVIEW_SECRET_MIN_LEN = 32;
export const DEFAULT_KID = 'main';

const KID_RE = /^[a-z0-9]{1,16}$/;
const B64URL_RE = /^[A-Za-z0-9_-]+$/;
const JTI_RE = /^[A-Za-z0-9_-]{22}$/;
const IPH_RE = /^[0-9a-f]{32}$/;
const SIG_LEN = 43; // 32 bajty HMAC w base64url bez dopełnienia
const PAYLOAD_MAX = 256;
const TOKEN_MAX = PAYLOAD_MAX + 1 + SIG_LEN;
const PAYLOAD_KEYS = 'exp,iph,jti,kid,v';

export type TokenEnv = Record<string, unknown>;

/** Porównanie w stałym czasie: zawsze przechodzi całą dłuższą długość, bez wczesnego wyjścia. */
export function timingSafeEqual(a: string, b: string): boolean {
  const n = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < n; i++) diff |= (a.charCodeAt(i) | 0) ^ (b.charCodeAt(i) | 0);
  return diff === 0;
}

/** Punkt podmiany w testach (spy): weryfikacja woła porównanie wyłącznie przez ten obiekt. */
export const tokenCrypto = { equal: timingSafeEqual };

function secretName(kid: string): string {
  return kid === DEFAULT_KID ? PREVIEW_SECRET_NAME : `${PREVIEW_SECRET_NAME}_${kid.toUpperCase()}`;
}

/** Sekret dla kid: zły kid, brak, nie-tekst albo krócej niż 32 znaki = null. */
export function secretForKid(env: TokenEnv, kid: unknown): string | null {
  if (typeof kid !== 'string' || !KID_RE.test(kid)) return null;
  const v = env[secretName(kid)];
  return typeof v === 'string' && v.length >= PREVIEW_SECRET_MIN_LEN ? v : null;
}

export type ActiveKey = { ok: true; kid: string; secret: string } | { ok: false; reason: string };

/** Aktywny klucz wydawania: PREVIEW_TOKEN_KID (domyślnie `main`) i jego sekret; brak = odmowa. */
export function activeKey(env: TokenEnv): ActiveKey {
  const rawKid = env[PREVIEW_KID_NAME];
  const kid = rawKid === undefined ? DEFAULT_KID : rawKid;
  if (typeof kid !== 'string' || !KID_RE.test(kid))
    return { ok: false, reason: `konfiguracja: ${PREVIEW_KID_NAME}` };
  const secret = secretForKid(env, kid);
  if (secret === null) return { ok: false, reason: `konfiguracja: ${secretName(kid)}` };
  return { ok: true, kid, secret };
}

function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlText(text: string): string {
  return b64url(new TextEncoder().encode(text));
}

function fromB64urlText(s: string): string | null {
  try {
    const b = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(b, (c) => c.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

async function signPayload(secret: string, payloadB64: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`pv1.${payloadB64}`));
  return b64url(new Uint8Array(sig));
}

/** Nowy token dla klucza IP; jti losowe 128 bit, exp = teraz + 15 min. */
export async function issueToken(
  key: { kid: string; secret: string },
  ipKey: string,
  nowMs: number,
): Promise<{ token: string; jti: string; exp: number }> {
  const jti = b64url(crypto.getRandomValues(new Uint8Array(16)));
  const exp = Math.floor(nowMs / 1000) + PREVIEW_TOKEN_TTL_SEC;
  const iph = await tokenIpTag(key.secret, ipKey);
  const payload = b64urlText(
    JSON.stringify({ v: PREVIEW_TOKEN_VERSION, kid: key.kid, jti, exp, iph }),
  );
  return { token: `${payload}.${await signPayload(key.secret, payload)}`, jti, exp };
}

export type TokenCheck = { ok: true; jti: string } | { ok: false; reason: string };

interface Payload {
  v: unknown;
  kid: unknown;
  jti: unknown;
  exp: unknown;
  iph: unknown;
}

/**
 * Weryfikacja: kształt (dokładnie 2 segmenty base64url, payload z dokładnie 5 polami) →
 * kid znany → podpis (stały czas, kanoniczny base64url) → exp → iph = klucz IP żądania.
 */
export async function verifyToken(
  env: TokenEnv,
  token: unknown,
  ipKey: string,
  nowMs: number,
): Promise<TokenCheck> {
  const bad = (reason: string): TokenCheck => ({ ok: false, reason });
  if (typeof token !== 'string' || token.length === 0 || token.length > TOKEN_MAX)
    return bad('token: format');
  const parts = token.split('.');
  if (parts.length !== 2) return bad('token: format');
  const [payloadB64, sig] = parts;
  if (
    payloadB64.length === 0 ||
    payloadB64.length > PAYLOAD_MAX ||
    !B64URL_RE.test(payloadB64) ||
    sig.length !== SIG_LEN ||
    !B64URL_RE.test(sig)
  )
    return bad('token: format');
  const text = fromB64urlText(payloadB64);
  if (text === null) return bad('token: format');
  let p: Payload;
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    if (Object.keys(parsed).sort().join(',') !== PAYLOAD_KEYS) throw new Error();
    p = parsed as Payload;
  } catch {
    return bad('token: format');
  }
  if (
    p.v !== PREVIEW_TOKEN_VERSION ||
    typeof p.jti !== 'string' ||
    !JTI_RE.test(p.jti) ||
    typeof p.exp !== 'number' ||
    !Number.isSafeInteger(p.exp) ||
    typeof p.iph !== 'string' ||
    !IPH_RE.test(p.iph)
  )
    return bad('token: format');
  const secret = secretForKid(env, p.kid);
  if (secret === null) return bad('token: kid');
  const want = await signPayload(secret, payloadB64);
  if (!tokenCrypto.equal(want, sig)) return bad('token: podpis');
  const nowSec = Math.floor(nowMs / 1000);
  if (nowSec >= p.exp) return bad('token: wygasł');
  if (p.exp > nowSec + PREVIEW_TOKEN_TTL_SEC) return bad('token: exp z przyszłości');
  if (!tokenCrypto.equal(await tokenIpTag(secret, ipKey), p.iph)) return bad('token: ip');
  return { ok: true, jti: p.jti };
}
