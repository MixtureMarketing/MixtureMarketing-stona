/**
 * Token aplikacji OAuth „Leady” dla Lineara (MIX-2078, MIX-851 L2): grant `client_credentials`.
 *
 * Linear (linear.app/developers/oauth-2-0-authentication, „Client credentials tokens”):
 *   POST https://api.linear.app/oauth/token, application/x-www-form-urlencoded,
 *   grant_type=client_credentials, client_id, client_secret, scope (po przecinku).
 *   Odpowiedź: access_token, token_type=Bearer, expires_in (ok. 30 dni), scope; bez refresh_token.
 *   Pobranie z INNYMI scope'ami zastępuje dotychczasowe dane aplikacji; rotacja client_secret
 *   unieważnia tokeny od razu; token może przestać działać przed czasem (wtedy 401 → nowy token).
 *
 * Zasady modułu:
 *   - tryb: `oauth` (LINEAR_CLIENT_ID i LINEAR_CLIENT_SECRET), `klucz` (tylko LINEAR_API_KEY,
 *     nagłówek bez „Bearer ”, jak przed MIX-2078), albo brak (moduł Leady wyłączony).
 *     Połowa danych aplikacji (jedno z dwóch) = nie wysyłamy pół-danych: tryb `klucz`, gdy jest
 *     klucz, inaczej wyłączenie; log `linear:oauth-niepelne`.
 *   - token w pamięci izolatu i w KV (`linear:oauth:token:<sha256(client_id)[0:16]>`); klucz zależy
 *     od aplikacji, więc Preview i Production z OSOBNYMI aplikacjami nigdy nie dzielą ani nie
 *     nadpisują sobie tokenu, a jedna aplikacja przy wspólnym KV dzieli jeden token.
 *   - odnowienie przed wygaśnięciem (10% czasu życia, najwyżej 24 h zapasu); expires_in ≤ 0, brak
 *     albo nie-liczba = token wygasły (odrzucony, nie „wieczny”).
 *   - blokada odnowienia: w izolacie jedna obietnica na aplikację, między izolatami klucz KV
 *     `…:blokada` (60 s); kto nie ma blokady, czeka krótko na nowy token z KV albo używa starego,
 *     jeszcze ważnego; w żadnym wypadku nie pobiera drugi raz.
 *   - nigdy nie loguje tokenu, sekretu ani treści odpowiedzi /oauth/token; tylko kody błędów.
 */
import { kvDelete, kvGetJson, kvPut } from './_shared/kv';

export const OAUTH_TOKEN_URL = 'https://api.linear.app/oauth/token';
/**
 * Scope tokenu aplikacji (MIX-2078 r2, decyzja A w MIX-851): read, write i customer:write.
 * customer:write (app actor only) jest potrzebny do customerUpsert i customerNeedCreate w _linear.ts.
 * Źródło nazw i separatora (przecinek): linear.app/developers/oauth-2-0-authentication.
 */
export const OAUTH_SCOPE = 'read,write,customer:write';
const TIMEOUT_MS = 8_000;
const ZAPAS_MAX_MS = 24 * 3600 * 1000;
const BLOKADA_TTL_S = 60;
const BLOKADA_MS = 30_000;
/** Czekanie na token odnawiany przez inny izolat: CZEKAJ_PROBY × CZEKAJ_MS. */
export const CZEKAJ_PROBY = 5;
export const CZEKAJ_MS = 200;

export interface TokenEnv {
  CACHE?: KVNamespace;
  LINEAR_API_KEY?: string;
  LINEAR_CLIENT_ID?: string;
  LINEAR_CLIENT_SECRET?: string;
}

export type Tryb = 'oauth' | 'klucz' | null;

/** Tryb autoryzacji. `loguj`: wypisz `linear:klucz-osobisty` / `linear:oauth-niepelne`. */
export function trybAutoryzacji(env: TokenEnv, loguj = false): Tryb {
  const id = env.LINEAR_CLIENT_ID;
  const sekret = env.LINEAR_CLIENT_SECRET;
  if (id && sekret) return 'oauth';
  if (id || sekret) {
    if (loguj) console.error('linear:oauth-niepelne');
  }
  if (env.LINEAR_API_KEY) {
    if (loguj) console.warn('linear:klucz-osobisty');
    return 'klucz';
  }
  return null;
}

interface Token {
  t: string;
  /** ms epoki: koniec ważności. */
  wygasa: number;
  /** ms epoki: od tej chwili odnawiamy. */
  odnowPo: number;
}

export type WynikTokenu =
  { ok: true; token: string } | { ok: false; blad: string; bezKary?: boolean };

const pamiec = new Map<string, Token>();
const wTrakcie = new Map<string, Promise<WynikTokenu>>();

/** Tylko testy: symuluje nowy izolat. */
export function _resetPamieciTokenu(): void {
  pamiec.clear();
  wTrakcie.clear();
}

function poprawny(v: unknown): v is Token {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.t === 'string' &&
    o.t !== '' &&
    typeof o.wygasa === 'number' &&
    Number.isFinite(o.wygasa) &&
    typeof o.odnowPo === 'number' &&
    Number.isFinite(o.odnowPo) &&
    o.odnowPo <= o.wygasa
  );
}

/** Jedyna walidacja tokenu (pamięć i KV): poprawny kształt i przed końcem ważności. */
const wazny = (x: unknown, teraz: number): x is Token => poprawny(x) && teraz < x.wygasa;
const swiezy = (x: unknown, teraz: number): x is Token => wazny(x, teraz) && teraz < x.odnowPo;

async function kluczKv(env: TokenEnv): Promise<string> {
  const b = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(env.LINEAR_CLIENT_ID ?? ''),
  );
  const h = [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `linear:oauth:token:${h.slice(0, 16)}`;
}

/** Surowa wartość z KV (może być uszkodzona); każde użycie przechodzi przez `wazny`/`swiezy`. */
const zKv = (env: TokenEnv, klucz: string): Promise<unknown> =>
  kvGetJson<unknown>(env.CACHE, klucz);

const spij = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Jedno żądanie POST /oauth/token. Nigdy nie rzuca, nie loguje treści. */
async function pobierzZLineara(env: TokenEnv, zostaloMs: number): Promise<Token | string> {
  let odp: Response;
  try {
    odp = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: env.LINEAR_CLIENT_ID ?? '',
        client_secret: env.LINEAR_CLIENT_SECRET ?? '',
        scope: OAUTH_SCOPE,
      }).toString(),
      signal: AbortSignal.timeout(Math.max(1, Math.min(TIMEOUT_MS, zostaloMs))),
    });
  } catch (e) {
    const n =
      e instanceof Error || (typeof e === 'object' && e !== null)
        ? String((e as { name?: unknown }).name)
        : '';
    return n === 'TimeoutError' || n === 'AbortError' ? 'oauth:timeout' : 'oauth:siec';
  }
  if (!odp.ok) return `oauth:HTTP ${odp.status}`;
  let body: unknown;
  try {
    body = await odp.json();
  } catch {
    return 'oauth:zly-json';
  }
  const o = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  if (typeof o.access_token !== 'string' || o.access_token.trim() === '')
    return 'oauth:brak-tokenu';
  if (o.token_type !== undefined && String(o.token_type).toLowerCase() !== 'bearer')
    return 'oauth:typ-tokenu';
  const sek = o.expires_in;
  if (typeof sek !== 'number' || !Number.isFinite(sek) || sek <= 0) return 'oauth:expires_in';
  const teraz = Date.now();
  const zycieMs = sek * 1000;
  return {
    t: o.access_token,
    wygasa: teraz + zycieMs,
    odnowPo: teraz + zycieMs - Math.min(ZAPAS_MAX_MS, zycieMs * 0.1),
  };
}

/**
 * Odnowienie z blokadą. `stary`: token, który właśnie zawiódł (401) albo dojrzał do odnowienia;
 * nowy token z KV musi być INNY niż `stary`.
 */
async function odnow(
  env: TokenEnv,
  klucz: string,
  stary: string | null,
  koniec: number,
): Promise<WynikTokenu> {
  const kBlokady = `${klucz}:blokada`;
  const teraz = Date.now();
  const blokada = await kvGetJson<unknown>(env.CACHE, kBlokady);
  const cudza =
    typeof blokada === 'object' &&
    blokada !== null &&
    typeof (blokada as Record<string, unknown>).do === 'number' &&
    ((blokada as Record<string, unknown>).do as number) > teraz;

  const czekaj = async (): Promise<WynikTokenu> => {
    for (let i = 0; i < CZEKAJ_PROBY && Date.now() + CZEKAJ_MS < koniec; i++) {
      await spij(CZEKAJ_MS);
      const z = await zKv(env, klucz);
      if (wazny(z, Date.now()) && z.t !== stary) {
        pamiec.set(klucz, z);
        return { ok: true, token: z.t };
      }
    }
    return { ok: false, blad: 'oauth:blokada', bezKary: true };
  };

  if (cudza) return czekaj();

  const ja = crypto.randomUUID();
  await kvPut(env.CACHE, kBlokady, JSON.stringify({ kto: ja, do: teraz + BLOKADA_MS }), {
    expirationTtl: BLOKADA_TTL_S,
  });
  if (env.CACHE) {
    const potw = await kvGetJson<unknown>(env.CACHE, kBlokady);
    if (typeof potw === 'object' && potw !== null && (potw as Record<string, unknown>).kto !== ja)
      return czekaj();
  }

  const w = await pobierzZLineara(env, koniec - Date.now());
  if (typeof w === 'string') {
    await kvDelete(env.CACHE, kBlokady);
    return { ok: false, blad: w };
  }
  pamiec.set(klucz, w);
  const ttl = Math.max(60, Math.floor((w.wygasa - Date.now()) / 1000));
  await kvPut(env.CACHE, klucz, JSON.stringify(w), { expirationTtl: ttl });
  await kvDelete(env.CACHE, kBlokady);
  return { ok: true, token: w.t };
}

/**
 * Token aplikacji. `odrzucony`: token, który dostał 401 (zapomnij go i weź inny).
 * Nigdy nie rzuca. `koniec`: ms epoki, budżet czasu wywołującego.
 */
export async function tokenAplikacji(
  env: TokenEnv,
  koniec: number,
  odrzucony: string | null = null,
): Promise<WynikTokenu> {
  try {
    const klucz = await kluczKv(env);
    const teraz = Date.now();
    let m = pamiec.get(klucz);
    if (m && odrzucony !== null && m.t === odrzucony) {
      pamiec.delete(klucz);
      m = undefined;
    }
    const zapasowyM: Token | null = wazny(m, teraz) ? m : null;
    if (swiezy(m, teraz)) return { ok: true, token: m.t };

    const k = await zKv(env, klucz);
    if (swiezy(k, teraz) && k.t !== odrzucony) {
      pamiec.set(klucz, k);
      return { ok: true, token: k.t };
    }

    // Dojrzały, ale jeszcze ważny token: przy cudzej blokadzie używamy go dalej.
    const zapasowy: Token | null = zapasowyM ?? (wazny(k, teraz) && k.t !== odrzucony ? k : null);
    const stary = odrzucony ?? zapasowy?.t ?? null;

    let p = wTrakcie.get(klucz);
    if (!p) {
      p = odnow(env, klucz, stary, koniec).finally(() => wTrakcie.delete(klucz));
      wTrakcie.set(klucz, p);
    }
    const w = await p;
    if (!w.ok && zapasowy) return { ok: true, token: zapasowy.t };
    return w;
  } catch (e) {
    console.error(`linear:oauth-wyjatek ${e instanceof Error ? e.name : 'nieznany'}`);
    return { ok: false, blad: 'oauth:wyjatek' };
  }
}
