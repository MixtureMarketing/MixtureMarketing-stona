/**
 * Podpis zapytań Mixture CRM do strony (GET /api/crm/*): dociąganie leadów.
 *
 * Ten sam sekret co wysyłka leadów do CRM (CRM_INGEST_SECRET tutaj = INGEST_SECRET w CRM), ale inny
 * podpisywany tekst, z prefiksem kierunku, więc podpisu jednego kierunku nie da się użyć w drugim:
 *   "crm-zapytanie:v1:<timestamp>.<METODA> <ścieżka z zapytaniem>"
 * Nagłówki: `X-Mixture-Timestamp` (sekundy), `X-Mixture-Signature: sha256=<64 hex>`. Okno 300 s.
 * Zapytania tylko czytają, więc powtórzenie w oknie nie jest groźne (bez rejestru powtórzeń).
 */

export const OKNO_SEKUND = 300;
const PREFIKS = 'crm-zapytanie:v1:';
const enc = new TextEncoder();

export interface CrmZapytanieEnv {
  CRM_INGEST_SECRET?: string;
}

const tekstDoPodpisu = (czas: string, metoda: string, sciezka: string) =>
  `${PREFIKS}${czas}.${metoda.toUpperCase()} ${sciezka}`;

async function klucz(sekret: string, uzycie: KeyUsage) {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(sekret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [uzycie],
  );
}

/** Podpis zapytania (używa CRM; tu do testów). `sciezka` to pathname + search, np. `/api/crm/leady?od=…`. */
export async function podpiszZapytanie(
  sekret: string,
  czas: string,
  metoda: string,
  sciezka: string,
) {
  const p = await crypto.subtle.sign(
    'HMAC',
    await klucz(sekret, 'sign'),
    enc.encode(tekstDoPodpisu(czas, metoda, sciezka)),
  );
  return `sha256=${[...new Uint8Array(p)].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Sprawdza podpis zapytania z CRM. Zwraca odpowiedź błędu albo null, gdy wszystko się zgadza.
 * Brak sekretu: 503 (integracja wyłączona). Porównanie w stałym czasie (crypto.subtle.verify).
 */
export async function bladPodpisu(
  request: Request,
  env: CrmZapytanieEnv,
  teraz: number = Date.now(),
): Promise<Response | null> {
  const sekret = env.CRM_INGEST_SECRET;
  if (!sekret || sekret.length < 32) return blad(503, 'Integracja z CRM jest wyłączona.');
  const czas = request.headers.get('X-Mixture-Timestamp') ?? '';
  const podpis = request.headers.get('X-Mixture-Signature') ?? '';
  if (!/^\d{9,11}$/.test(czas) || !/^sha256=[0-9a-f]{64}$/.test(podpis)) {
    return blad(401, 'Brak albo zły podpis.');
  }
  if (Math.abs(teraz / 1000 - Number(czas)) > OKNO_SEKUND)
    return blad(401, 'Zapytanie jest za stare.');
  const adres = new URL(request.url);
  const bajty = Uint8Array.from(
    podpis
      .slice(7)
      .match(/../g)!
      .map((b) => parseInt(b, 16)),
  );
  const zgodny = await crypto.subtle.verify(
    'HMAC',
    await klucz(sekret, 'verify'),
    bajty,
    enc.encode(tekstDoPodpisu(czas, request.method, adres.pathname + adres.search)),
  );
  return zgodny ? null : blad(401, 'Podpis się nie zgadza.');
}

export function json(dane: unknown, status = 200): Response {
  return new Response(JSON.stringify(dane), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export const blad = (status: number, komunikat: string) => json({ blad: komunikat }, status);
