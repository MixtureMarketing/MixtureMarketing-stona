/**
 * Podpis zapytań Mixture CRM do strony (GET /api/crm/*): dociąganie leadów.
 *
 * Osobny sekret `CRM_STRONA_SECRET` (ten sam w Workerze crona CRM), nie sekret wysyłki leadów, więc wyciek
 * jednego nie otwiera drugiego kierunku. Podpisywany tekst ma prefiks kierunku i jednorazowy nonce:
 *   "crm-zapytanie:v1:<timestamp>.<nonce>.<METODA> <ścieżka z zapytaniem>"
 * Nagłówki: `X-Mixture-Timestamp` (sekundy), `X-Mixture-Nonce` (UUID), `X-Mixture-Signature: sha256=<64 hex>`.
 * Okno 300 s, porównanie w stałym czasie (crypto.subtle.verify), a powtórzony nonce w oknie: 409
 * (rejestr skrótów w crm_zapytania, migracja 0009; wpisy starsze niż 2 okna są czyszczone przy każdym zapytaniu).
 */

export const OKNO_SEKUND = 300;
const PREFIKS = 'crm-zapytanie:v1:';
const enc = new TextEncoder();

export interface CrmZapytanieEnv {
  CRM_STRONA_SECRET?: string;
  DB: D1Database;
}

const tekstDoPodpisu = (czas: string, nonce: string, metoda: string, sciezka: string) =>
  `${PREFIKS}${czas}.${nonce}.${metoda.toUpperCase()} ${sciezka}`;

async function klucz(sekret: string, uzycie: KeyUsage) {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(sekret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [uzycie],
  );
}

const hex = (b: ArrayBuffer) =>
  [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');

/** Czas w formacie D1 („YYYY-MM-DD HH:MM:SS”, UTC). */
const czasD1 = (ms: number) => new Date(ms).toISOString().replace('T', ' ').slice(0, 19);

/** Podpis zapytania (używa CRM; tu do testów). `sciezka` to pathname + search, np. `/api/crm/leady?od=…`. */
export async function podpiszZapytanie(
  sekret: string,
  czas: string,
  nonce: string,
  metoda: string,
  sciezka: string,
) {
  const p = await crypto.subtle.sign(
    'HMAC',
    await klucz(sekret, 'sign'),
    enc.encode(tekstDoPodpisu(czas, nonce, metoda, sciezka)),
  );
  return `sha256=${hex(p)}`;
}

/**
 * Sprawdza podpis zapytania z CRM. Zwraca odpowiedź błędu albo null, gdy wszystko się zgadza.
 * Brak sekretu: 503 (integracja wyłączona); zły podpis albo czas: 401; powtórzony nonce: 409.
 */
export async function bladPodpisu(
  request: Request,
  env: CrmZapytanieEnv,
  teraz: number = Date.now(),
): Promise<Response | null> {
  const sekret = env.CRM_STRONA_SECRET;
  if (!sekret || sekret.length < 32) return blad(503, 'Integracja z CRM jest wyłączona.');
  const czas = request.headers.get('X-Mixture-Timestamp') ?? '';
  const nonce = (request.headers.get('X-Mixture-Nonce') ?? '').toLowerCase();
  const podpis = request.headers.get('X-Mixture-Signature') ?? '';
  if (
    !/^\d{9,11}$/.test(czas) ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(nonce) ||
    !/^sha256=[0-9a-f]{64}$/.test(podpis)
  ) {
    return blad(401, 'Brak albo zły podpis.');
  }
  if (Math.abs(teraz / 1000 - Number(czas)) > OKNO_SEKUND) {
    return blad(401, 'Zapytanie jest za stare.');
  }
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
    enc.encode(tekstDoPodpisu(czas, nonce, request.method, adres.pathname + adres.search)),
  );
  if (!zgodny) return blad(401, 'Podpis się nie zgadza.');

  // Powtórzenie: ten sam podpisany zestaw (czas, nonce) drugi raz w oknie. Rejestr dopiero po sprawdzeniu
  // podpisu, więc obcy go nie zapełni. Skrót zamiast nonce: stała długość klucza.
  const skrot = hex(await crypto.subtle.digest('SHA-256', enc.encode(`${czas}.${nonce}`)));
  await env.DB.prepare('DELETE FROM crm_zapytania WHERE created_at < ?')
    .bind(czasD1(teraz - 2 * OKNO_SEKUND * 1000))
    .run();
  const nowy = await env.DB.prepare(
    'INSERT OR IGNORE INTO crm_zapytania (skrot, created_at) VALUES (?, ?)',
  )
    .bind(skrot, czasD1(teraz))
    .run();
  return nowy.meta.changes === 0
    ? blad(409, 'To zapytanie zostało już przyjęte (powtórzony nonce).')
    : null;
}

export function json(dane: unknown, status = 200): Response {
  return new Response(JSON.stringify(dane), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export const blad = (status: number, komunikat: string) => json({ blad: komunikat }, status);
