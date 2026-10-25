/**
 * Kopia leada do Mixture CRM (repo MixtureMarketing/mixture-crm, docs/INTEGRACJA-STRONY.md).
 *
 * Zasada: strona najpierw zapisuje lead w swojej D1, dopiero po udanym zapisie wysyła kopię
 * do CRM — w `waitUntil`, więc formularz nie czeka na CRM, a awaria CRM go nie blokuje.
 *
 * Podpis: `X-Mixture-Signature: sha256=<hex>` = HMAC-SHA256(CRM_INGEST_SECRET,
 * "<timestamp>.<surowa treść>"), `X-Mixture-Timestamp` w sekundach. CRM odrzuca powtórzony
 * podpis (409), więc każde ponowienie podpisujemy od nowa (nowy znacznik czasu).
 *
 * Env (CF Pages strony):
 *   - CRM_INGEST_SECRET — ten sam sekret co INGEST_SECRET w CRM (encrypted). Brak = wyłączone.
 *   - CRM_INGEST_URL    — opcjonalnie; domyślnie produkcja CRM.
 */

export interface CrmEnv {
  CRM_INGEST_URL?: string;
  CRM_INGEST_SECRET?: string;
}

/** Pola kontraktu `/api/ingest/lead`. Pola bez wartości są pomijane przy wysyłce. */
export interface LeadDoCrm {
  external_id: string;
  source: 'website' | 'calculator' | 'audit' | 'subscription';
  received_at?: string;
  source_url?: string | null;
  name?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  service?: string | null;
  budget_text?: string | null;
  message?: string | null;
  details?: Record<string, unknown> | null;
  quote_ref?: string | null;
  form_step?: number | null;
  form_steps?: number | null;
}

export const CRM_INGEST_URL_DOMYSLNY = 'https://mixture-crm.pages.dev/api/ingest/lead';

const PROB = 2;
const enc = new TextEncoder();

const naHex = (bajty: ArrayBuffer) =>
  [...new Uint8Array(bajty)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function podpis(sekret: string, czas: string, tresc: string): Promise<string> {
  const klucz = await crypto.subtle.importKey(
    'raw',
    enc.encode(sekret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return `sha256=${naHex(await crypto.subtle.sign('HMAC', klucz, enc.encode(`${czas}.${tresc}`)))}`;
}

function bezPustych(lead: LeadDoCrm): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(lead).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );
}

export type WynikCrm = 'wylaczone' | 'wyslany' | 'odrzucony' | 'niedostepny';

/**
 * Wysyła lead do CRM. Nigdy nie rzuca. 409 i 5xx/błąd sieci ponawia raz (nowy podpis),
 * pozostałe 4xx loguje bez ponawiania (złe dane albo zły sekret — ponowienie nic nie da).
 */
export async function wyslijDoCrm(
  env: CrmEnv,
  lead: LeadDoCrm,
  opcje: { przerwaMs?: number } = {},
): Promise<WynikCrm> {
  if (!env.CRM_INGEST_SECRET) return 'wylaczone';
  const url = env.CRM_INGEST_URL || CRM_INGEST_URL_DOMYSLNY;
  const tresc = JSON.stringify(bezPustych(lead));
  for (let proba = 1; proba <= PROB; proba++) {
    try {
      const czas = String(Math.floor(Date.now() / 1000));
      const odp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Mixture-Timestamp': czas,
          'X-Mixture-Signature': await podpis(env.CRM_INGEST_SECRET, czas, tresc),
        },
        body: tresc,
      });
      if (odp.ok) return 'wyslany';
      if (odp.status !== 409 && odp.status < 500) {
        console.error(`[crm] lead ${lead.external_id} odrzucony: HTTP ${odp.status}`);
        return 'odrzucony';
      }
      console.error(`[crm] lead ${lead.external_id}: HTTP ${odp.status} (próba ${proba})`);
    } catch (e) {
      console.error(`[crm] lead ${lead.external_id}: błąd sieci (próba ${proba})`, e);
    }
    if (proba < PROB) await new Promise((r) => setTimeout(r, opcje.przerwaMs ?? 2000));
  }
  return 'niedostepny';
}

type WaitUntil = ((p: Promise<unknown>) => void) | undefined;

/** Wysyłka w tle (waitUntil). Bez waitUntil (testy, lokalnie) — promise i tak się wykona. */
export function wyslijDoCrmWTle(waitUntil: WaitUntil, env: CrmEnv, lead: LeadDoCrm): void {
  const p = wyslijDoCrm(env, lead);
  if (waitUntil) waitUntil(p);
}
