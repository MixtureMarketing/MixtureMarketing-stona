/**
 * Retencja danych z audytu 360 (decyzja Jakuba MIX-1371 A, 16.11.2026; zastępuje MIX-627 A „PDF 90 dni”):
 * - raport PDF w R2 (`FILES`, klucze `audit/…`) jest usuwany, gdy jest starszy niż 30 dni (czas `uploaded` z R2);
 * - lead z audytu (`leads.source = 'audit'`) jest usuwany, gdy od momentu audytu (`created_at`, czyli zapisu leada
 *   przez `capture-lead`; gdy go brak, `updated_at`) minęło ponad 12 miesięcy kalendarzowych i lead nie został
 *   klientem. Późniejsza zmiana leada nie przedłuża terminu (poprawka Jakuba z 16.11, MIX-1842).
 *
 * Klient (nigdy nie kasowany): `status = 'converted'` ALBO `user_id` ustawiony ALBO w `users` jest konto z tym
 * samym adresem (bez względu na wielkość liter). Leady z innych źródeł (formularz, kalkulator) nie są ruszane.
 *
 * Granice: „starszy niż” = ściśle mniej niż próg. PDF z wiekiem dokładnie 30 dni zostaje, 30 dni i 1 s idzie.
 * Lead z audytu sprzed dokładnie 12 miesięcy zostaje. 12 miesięcy = ta sama data rok wcześniej (UTC); gdy takiego
 * dnia nie ma (29 lutego), próg to ostatni dzień tego miesiąca (28 lutego), nigdy wcześniej.
 *
 * Oba DELETE (kolejka Lineara i lead) idą w jednym `DB.batch` (jedna transakcja D1) z tym samym warunkiem co SELECT.
 *
 * Tryb próbny (`proba: true`) tylko liczy i wypisuje identyfikatory, niczego nie usuwa. Wynik i log zawierają
 * wyłącznie liczby, identyfikatory leadów (UUID) i klucze plików R2 (`audit/<ms>_<uuid>.pdf`), bez adresów e-mail.
 */

export interface RetencjaEnv {
  DB: D1Database;
  FILES?: R2Bucket;
}

export const DNI_PDF = 30;
export const MIESIACE_LEAD = 12;
export const PREFIKS_PDF = 'audit/';
/** Najwięcej plików i leadów na jedno wywołanie (timer woła codziennie, reszta przejdzie następnym razem). */
export const MAKS_PDF = 1000;
export const MAKS_LEADOW = 200;
/** D1 przyjmuje najwyżej 100 parametrów w zapytaniu; paczka id do `IN (…)`. */
const PACZKA_ID = 50;
const MAKS_STRON_R2 = 10;

/** Czas w formacie D1 („YYYY-MM-DD HH:MM:SS”, UTC). */
export const czasD1 = (ms: number) => new Date(ms).toISOString().replace('T', ' ').slice(0, 19);

export function progPdf(teraz: number): number {
  return teraz - DNI_PDF * 24 * 60 * 60 * 1000;
}

export function progLeada(teraz: number): number {
  const d = new Date(teraz);
  // Najpierw 1. dzień miesiąca docelowego, potem dzień przycięty do jego długości (29.02 → 28.02).
  const cel = new Date(teraz);
  cel.setUTCDate(1);
  cel.setUTCMonth(d.getUTCMonth() - MIESIACE_LEAD);
  const ostatni = new Date(Date.UTC(cel.getUTCFullYear(), cel.getUTCMonth() + 1, 0)).getUTCDate();
  cel.setUTCDate(Math.min(d.getUTCDate(), ostatni));
  return cel.getTime();
}

// Warunek leada do usunięcia; jeden tekst dla SELECT i DELETE, więc lead skonwertowany w międzyczasie zostaje.
const WARUNEK_LEADA = `l.source = 'audit'
  AND coalesce(l.created_at, l.updated_at) < ?
  AND coalesce(l.status, '') <> 'converted'
  AND l.user_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM users u WHERE lower(u.email) = lower(l.email))`;

export interface WynikRetencji {
  tryb: 'proba' | 'kasowanie';
  czas: string;
  pdf: {
    prog: string;
    sprawdzone: number;
    do_usuniecia: number;
    usuniete: number;
    klucze: string[];
    pominiete?: string;
  };
  leady: {
    prog: string;
    do_usuniecia: number;
    usuniete: number;
    id: string[];
    klienci_chronieni: number;
  };
}

async function retencjaPdf(env: RetencjaEnv, teraz: number, proba: boolean) {
  const prog = progPdf(teraz);
  const wynik: WynikRetencji['pdf'] = {
    prog: new Date(prog).toISOString(),
    sprawdzone: 0,
    do_usuniecia: 0,
    usuniete: 0,
    klucze: [],
  };
  if (!env.FILES) {
    wynik.pominiete = 'brak FILES';
    return wynik;
  }
  let cursor: string | undefined;
  for (let strona = 0; strona < MAKS_STRON_R2 && wynik.klucze.length < MAKS_PDF; strona++) {
    const lista = await env.FILES.list({ prefix: PREFIKS_PDF, cursor, limit: 1000 });
    for (const o of lista.objects) {
      wynik.sprawdzone += 1;
      if (!o.key.startsWith(PREFIKS_PDF)) continue;
      if (new Date(o.uploaded).getTime() < prog && wynik.klucze.length < MAKS_PDF) {
        wynik.klucze.push(o.key);
      }
    }
    if (!lista.truncated) break;
    cursor = lista.cursor;
  }
  wynik.do_usuniecia = wynik.klucze.length;
  if (!proba && wynik.klucze.length > 0) {
    await env.FILES.delete(wynik.klucze);
    wynik.usuniete = wynik.klucze.length;
  }
  return wynik;
}

async function retencjaLeadow(env: RetencjaEnv, teraz: number, proba: boolean) {
  const prog = czasD1(progLeada(teraz));
  const kandydaci = await env.DB.prepare(
    `SELECT l.id AS id FROM leads l WHERE ${WARUNEK_LEADA} ORDER BY l.id LIMIT ?`,
  )
    .bind(prog, MAKS_LEADOW)
    .all<{ id: string }>();
  const id = (kandydaci.results ?? []).map((w) => String(w.id));
  const chronieni = await env.DB.prepare(
    `SELECT count(*) AS n FROM leads l
     WHERE l.source = 'audit' AND coalesce(l.created_at, l.updated_at) < ?
       AND NOT (coalesce(l.status, '') <> 'converted' AND l.user_id IS NULL
                AND NOT EXISTS (SELECT 1 FROM users u WHERE lower(u.email) = lower(l.email)))`,
  )
    .bind(prog)
    .first<{ n: number }>();
  const wynik: WynikRetencji['leady'] = {
    prog,
    do_usuniecia: id.length,
    usuniete: 0,
    id,
    klienci_chronieni: Number(chronieni?.n ?? 0),
  };
  if (proba) return wynik;
  for (let i = 0; i < id.length; i += PACZKA_ID) {
    const paczka = id.slice(i, i + PACZKA_ID);
    const miejsca = paczka.map(() => '?').join(', ');
    // Najpierw kolejka Lineara (klucz obcy do leads), potem sam lead; oba z tym samym warunkiem co SELECT
    // i w jednej transakcji (`batch`): błąd drugiego DELETE nie zostawia leada bez wiersza kolejki.
    const wyniki = await env.DB.batch([
      env.DB.prepare(
        `DELETE FROM linear_leady WHERE lead_id IN (${miejsca})
           AND lead_id IN (SELECT l.id FROM leads l WHERE ${WARUNEK_LEADA})`,
      ).bind(...paczka, prog),
      env.DB.prepare(
        `DELETE FROM leads WHERE id IN (${miejsca})
           AND id IN (SELECT l.id FROM leads l WHERE ${WARUNEK_LEADA})`,
      ).bind(...paczka, prog),
    ]);
    wynik.usuniete += Number(wyniki[1]?.meta?.changes ?? 0);
  }
  return wynik;
}

/** Jedno przejście retencji. Błąd R2 albo D1 leci dalej (endpoint oddaje 500 bez szczegółów). */
export async function wykonajRetencje(
  env: RetencjaEnv,
  opcje: { proba: boolean; teraz?: number },
): Promise<WynikRetencji> {
  const teraz = opcje.teraz ?? Date.now();
  const pdf = await retencjaPdf(env, teraz, opcje.proba);
  const leady = await retencjaLeadow(env, teraz, opcje.proba);
  const wynik: WynikRetencji = {
    tryb: opcje.proba ? 'proba' : 'kasowanie',
    czas: new Date(teraz).toISOString(),
    pdf,
    leady,
  };
  console.log(`[audyt:retencja] ${JSON.stringify(wynik)}`);
  return wynik;
}
