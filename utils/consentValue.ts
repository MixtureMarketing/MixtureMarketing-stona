// Wartość zgody: typ, klucz zapisu i allowlista (fail-closed). MIX-1389.

export type ConsentState = {
  analytics: boolean;
  marketing: boolean;
};

/**
 * Klucz zapisu zgody w localStorage. „v2” to wersja zestawu celów: wpis pod starym kluczem
 * (`cookie-consent`) nie jest czytany, więc gość z dawną zgodą dostaje baner ponownie
 * (karta firmy ~/sesje/wspolne/wzorce/02-zgody-i-zdarzenia.md, pkt 3: zmiana celów = nowa wersja).
 */
export const CONSENT_STORAGE_KEY = 'cookie-consent-v2';

export type ConsentCheck = { ok: true; consent: ConsentState } | { ok: false; reason: string };

const CONSENT_FIELDS = ['analytics', 'marketing'] as const;

/**
 * Allowlista wartości zgody (fail-closed): przechodzi tylko zwykły obiekt z dokładnie dwoma
 * polami `analytics` i `marketing`, oba true/false. Cokolwiek innego = odmowa z powodem,
 * czyli traktujemy jak brak zgody (nic nie idzie do Zaraz, baner pyta ponownie).
 */
export const checkConsentValue = (value: unknown): ConsentCheck => {
  if (value === null || value === undefined) {
    return { ok: false, reason: 'odmowa: brak zapisanej zgody' };
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, reason: 'odmowa: zgoda nie jest obiektem' };
  }
  if (Object.getPrototypeOf(value) !== Object.prototype) {
    return { ok: false, reason: 'odmowa: zgoda nie jest zwykłym obiektem' };
  }
  const record = value as Record<string, unknown>;
  const unknownKeys = Object.keys(record).filter(
    (key) => !(CONSENT_FIELDS as readonly string[]).includes(key),
  );
  if (unknownKeys.length > 0) {
    return { ok: false, reason: `odmowa: nieznane pole ${unknownKeys.join(', ')}` };
  }
  for (const field of CONSENT_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(record, field)) {
      return { ok: false, reason: `odmowa: brak pola ${field}` };
    }
    if (typeof record[field] !== 'boolean') {
      return { ok: false, reason: `odmowa: pole ${field} nie jest true/false` };
    }
  }
  return {
    ok: true,
    consent: { analytics: record.analytics as boolean, marketing: record.marketing as boolean },
  };
};

/** Surowy wpis z localStorage → zgoda albo odmowa z powodem (null = brak wpisu). */
export const checkStoredConsent = (raw: string | null): ConsentCheck => {
  if (raw === null) return { ok: false, reason: 'odmowa: brak zapisanej zgody' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'odmowa: uszkodzony JSON' };
  }
  return checkConsentValue(parsed);
};
