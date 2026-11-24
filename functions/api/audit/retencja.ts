/**
 * POST /api/audit/retencja: codzienne kasowanie danych z audytu (MIX-1820, decyzja MIX-1371 A): PDF w R2 po 30 dniach,
 * lead z audytu po 12 miesiącach bez statusu klienta. Logika: `_retencja.ts`.
 *
 * Wywołuje go timer na serwerze firmy (ten sam mechanizm co `POST /api/leady/ponow`, poza repo), raz na dobę.
 * Cloudflare Pages Functions nie mają własnego crona, a osobny Worker to nowy element wdrożenia.
 *
 * Podpis jak w `crm/_podpis.ts`, OSOBNY sekret `AUDIT_RETENCJA_SECRET` (≥ 32 znaki) i prefiks kierunku:
 *   HMAC-SHA256(AUDIT_RETENCJA_SECRET, "audyt-retencja:v1:<czas>.<nonce>.POST /api/audit/retencja")
 * Nagłówki `X-Mixture-Timestamp`, `X-Mixture-Nonce`, `X-Mixture-Signature: sha256=<hex>`; okno 300 s; powtórzony
 * nonce 409. Podpisy CRM i `ponow` tu nie przechodzą.
 *
 * Tryb próbny jest domyślny. Kasowanie wymaga WSZYSTKICH warunków:
 *   1. zmienna `AUDIT_RETENCJA_KASUJ` = `tak` (ustawia człowiek w panelu po odbiorze),
 *   2. body bez `"proba": true`,
 *   3. poza Preview (`SRODOWISKO` ≠ `preview`) albo jawne `"proba": false` w body.
 * Body opcjonalne: `{"proba": true|false}`.
 *
 * Odpowiedź 200: `{tryb, czas, pdf:{prog, sprawdzone, do_usuniecia, usuniete, klucze[]}, leady:{prog, do_usuniecia,
 * usuniete, id[], klienci_chronieni}}`. Błędy: 405, 503 (brak sekretu), 401, 409, 400 (zły body), 500.
 * Odpowiedź i log: tylko liczby, id leadów i klucze plików.
 */
import { bladPodpisu, blad, json } from '../crm/_podpis';
import { wykonajRetencje, type RetencjaEnv } from './_retencja';

export interface RetencjaEndpointEnv extends RetencjaEnv {
  AUDIT_RETENCJA_SECRET?: string;
  AUDIT_RETENCJA_KASUJ?: string;
  SRODOWISKO?: string;
}

export const PREFIKS_RETENCJA = 'audyt-retencja:v1:';
const MAKS_BODY = 1024;
const MIN_SEKRET = 32;

function czytajBody(tekst: string): { proba?: boolean } | string {
  if (tekst.trim() === '') return {};
  let p: unknown;
  try {
    p = JSON.parse(tekst);
  } catch {
    return 'Body musi być obiektem JSON.';
  }
  if (!p || typeof p !== 'object' || Array.isArray(p)) return 'Body musi być obiektem JSON.';
  const { proba } = p as Record<string, unknown>;
  if (proba !== undefined && typeof proba !== 'boolean') return 'Pole proba: true albo false.';
  return { proba: proba as boolean | undefined };
}

/** true = tylko liczenie. Kasowanie wyłącznie przy fladze `tak` i bez trybu próbnego (Preview: tylko jawnie). */
export function czyProba(env: RetencjaEndpointEnv, body: { proba?: boolean }): boolean {
  if (env.AUDIT_RETENCJA_KASUJ !== 'tak') return true;
  if (body.proba === true) return true;
  // Wielkość liter i spacje bez znaczenia: `Preview` albo ` preview ` to dalej Preview (domyślnie bez kasowania).
  if ((env.SRODOWISKO ?? '').trim().toLowerCase() === 'preview') return body.proba !== false;
  return false;
}

export const onRequest: PagesFunction<RetencjaEndpointEnv> = async ({ request, env }) => {
  if (request.method !== 'POST') {
    const odp = blad(405, 'Dozwolona metoda: POST.');
    odp.headers.set('Allow', 'POST');
    return odp;
  }
  const sekret = env.AUDIT_RETENCJA_SECRET;
  if (!sekret || sekret.length < MIN_SEKRET) return blad(503, 'Retencja audytu jest wyłączona.');
  const zly = await bladPodpisu(request, env, Date.now(), { sekret, prefiks: PREFIKS_RETENCJA });
  if (zly) return zly;

  const tekst = await request.text();
  if (tekst.length > MAKS_BODY) return blad(400, 'Body jest za duże.');
  const body = czytajBody(tekst);
  if (typeof body === 'string') return blad(400, body);

  try {
    return json(await wykonajRetencje(env, { proba: czyProba(env, body) }));
  } catch (e) {
    console.error(`[audyt:retencja] błąd: ${(e as Error)?.name ?? 'Error'}`);
    return blad(500, 'Retencja nie powiodła się.');
  }
};
