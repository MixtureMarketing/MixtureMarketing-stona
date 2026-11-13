/**
 * POST /api/leady/ponow: ponowienie kolejki leadów → Linear, wywoływane przez timer na serwerze firmy co 15 min
 * (`leady-ponow.timer`), także gdy nie ma nowych leadów. Drenaż przy każdym leadzie (`waitUntil`) jest tylko zapasem.
 *
 * Podpis jak w `crm/_podpis.ts`, ale OSOBNY sekret `LINEAR_PONOW_SECRET` (≥ 32 znaki) i prefiks kierunku:
 *   HMAC-SHA256(LINEAR_PONOW_SECRET, "leady-ponow:v1:<czas>.<nonce>.POST /api/leady/ponow")
 * Nagłówki `X-Mixture-Timestamp`, `X-Mixture-Nonce`, `X-Mixture-Signature: sha256=<hex>`; okno 300 s; powtórzony
 * nonce 409. Podpis CRM (inny sekret i prefiks) tu nie przechodzi, a podpis `ponow` nie otwiera API CRM.
 * POST, bo wywołanie zmienia stan (drenaż, odblokowanie).
 *
 * Body opcjonalne: `{"limit": 1..50, "odblokuj": true}` (`odblokuj`: `zablokowany` → `kolejka`, `proby=0`).
 * Odpowiedź 200: `{ponowione, w_kolejce, zablokowane, bez_customer_request, czas}`.
 * Błędy: 405 (inna metoda niż POST), 503 (brak `LINEAR_PONOW_SECRET`, `LINEAR_API_KEY` albo
 * `LINEAR_TEAM_LEADY_ID`), 401 (zły podpis albo czas), 409 (nonce), 400 (zły body).
 * Odpowiedź i logi nie zawierają kluczy ani danych leadów.
 */
import { drenujKolejke, type LinearEnv } from '../_linear';
import { bladPodpisu, blad, json } from '../crm/_podpis';

export interface PonowEnv extends LinearEnv {
  LINEAR_PONOW_SECRET?: string;
}

export const PREFIKS_PONOW = 'leady-ponow:v1:';
const MAKS_BODY = 1024;
const MIN_SEKRET = 32;

type Body = { limit?: number; odblokuj?: boolean };

/** Body: pusty = domyślne wartości; inaczej obiekt JSON z `limit` (liczba całkowita 1–50) i `odblokuj` (boolean). */
function czytajBody(tekst: string): Body | string {
  if (tekst.trim() === '') return {};
  let p: unknown;
  try {
    p = JSON.parse(tekst);
  } catch {
    return 'Body musi być obiektem JSON.';
  }
  if (!p || typeof p !== 'object' || Array.isArray(p)) return 'Body musi być obiektem JSON.';
  const { limit, odblokuj } = p as Record<string, unknown>;
  if (
    limit !== undefined &&
    !(Number.isInteger(limit) && (limit as number) >= 1 && (limit as number) <= 50)
  )
    return 'Pole limit: liczba całkowita 1–50.';
  if (odblokuj !== undefined && typeof odblokuj !== 'boolean')
    return 'Pole odblokuj: true albo false.';
  return { limit: limit as number | undefined, odblokuj: odblokuj as boolean | undefined };
}

export const onRequest: PagesFunction<PonowEnv> = async ({ request, env }) => {
  if (request.method !== 'POST') {
    const odp = blad(405, 'Dozwolona metoda: POST.');
    odp.headers.set('Allow', 'POST');
    return odp;
  }
  const sekret = env.LINEAR_PONOW_SECRET;
  if (!sekret || sekret.length < MIN_SEKRET || !env.LINEAR_API_KEY || !env.LINEAR_TEAM_LEADY_ID) {
    return blad(503, 'Ponawianie leadów jest wyłączone.');
  }
  const zly = await bladPodpisu(request, env, Date.now(), { sekret, prefiks: PREFIKS_PONOW });
  if (zly) return zly;

  const tekst = await request.text();
  if (tekst.length > MAKS_BODY) return blad(400, 'Body jest za duże.');
  const body = czytajBody(tekst);
  if (typeof body === 'string') return blad(400, body);

  return json(await drenujKolejke(env, body));
};
