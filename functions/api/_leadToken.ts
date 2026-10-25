/**
 * Token edycji leada — podpis HMAC-SHA256 identyfikatora leada.
 *
 * Wcześniej `update` / `get_lead` / `send_notification` w contact-submit wymagały samego
 * id: kto znał id, ten czytał i nadpisywał dane osobowe. Teraz `create` zwraca
 * `edit_token`, a pozostałe akcje go wymagają.
 *
 * Dlaczego podpis, a nie losowy sekret w D1: jest bezstanowy (zero migracji, zero
 * dodatkowego odczytu) i działa nawet wtedy, gdy zapis leada do D1 się nie udał —
 * a contact-submit celowo nie blokuje formularza na błędzie D1.
 *
 * Podpis ma sens tylko wtedy, gdy id generuje serwer. Gdyby klient mógł podać id,
 * „utworzyłby" lead o cudzym id i dostał ważny token do cudzych danych.
 *
 * Klucz: LEAD_TOKEN_SECRET (zalecany, osobny sekret w CF Pages). Awaryjnie
 * TURNSTILE_SECRET — żeby wdrożenie nie zepsuło formularza, zanim sekret zostanie
 * ustawiony. Bez żadnego z nich tokenów nie da się wydać ani sprawdzić (fail-closed).
 */

export interface LeadTokenEnv {
  LEAD_TOKEN_SECRET?: string;
  TURNSTILE_SECRET?: string;
}

// Separacja domen: ten sam klucz nie może podpisać niczego innego niż token leada.
const PREFIKS = 'lead-edit:v1:';

const enc = new TextEncoder();

function kluczSurowy(env: LeadTokenEnv): string | null {
  return env.LEAD_TOKEN_SECRET || env.TURNSTILE_SECRET || null;
}

async function kluczHmac(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function doBase64Url(bajty: ArrayBuffer): string {
  let s = '';
  for (const b of new Uint8Array(bajty)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function zBase64Url(tekst: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]+$/.test(tekst)) return null;
  try {
    const s = atob(tekst.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(s, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

/** Wydaje token dla leada. `null`, gdy brak klucza — wtedy formularz nie przejdzie dalej. */
export async function podpiszLead(env: LeadTokenEnv, leadId: string): Promise<string | null> {
  const secret = kluczSurowy(env);
  if (!secret) return null;
  const podpis = await crypto.subtle.sign(
    'HMAC',
    await kluczHmac(secret),
    enc.encode(PREFIKS + leadId),
  );
  return doBase64Url(podpis);
}

/** Sprawdza token w stałym czasie (crypto.subtle.verify). Każdy brak danych = odmowa. */
export async function sprawdzLead(
  env: LeadTokenEnv,
  leadId: string | undefined | null,
  token: string | undefined | null,
): Promise<boolean> {
  const secret = kluczSurowy(env);
  if (!secret || !leadId || !token || typeof token !== 'string') return false;
  const podpis = zBase64Url(token);
  if (!podpis) return false;
  return crypto.subtle.verify(
    'HMAC',
    await kluczHmac(secret),
    podpis,
    enc.encode(PREFIKS + leadId),
  );
}
