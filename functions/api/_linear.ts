/**
 * Leady → Linear (zespół LEA): zadanie z Customer Request, kolejka ponowień, komentarze kroków.
 *
 * Zasada jak w `_crm.ts`: strona najpierw zapisuje lead w D1, dopiero potem woła ten moduł w `waitUntil`.
 * Moduł nigdy nie rzuca i nigdy nie opóźnia odpowiedzi HTTP. Lead nie ginie przy awarii Lineara:
 * stan synchronizacji to jeden wiersz `linear_leady` (migracja 0010), a identyfikator zadania w Linearze
 * jest identyfikatorem leada, więc powtórzona próba nie tworzy duplikatu (`IssueCreateInput.id`).
 *
 * Env (CF Pages strony), brak LINEAR_API_KEY albo LINEAR_TEAM_LEADY_ID = moduł wyłączony (log):
 *   - LINEAR_API_KEY (secret), LINEAR_TEAM_LEADY_ID, LINEAR_PROWADZACY_ID (zadanie przypisane do prowadzącego),
 *   - LINEAR_STAN_TRIAGE_ID (opcjonalnie: stan Triage, gdy zadania z API nie trafiają tam same),
 *   - SRODOWISKO=preview → etykieta `test` i przedrostek tytułu `[Preview] `.
 *
 * Logi: wyłącznie id leada i kod błędu. Nigdy e-mail, telefon, treść ani klucz.
 */
import { kvGetJson, kvPut } from './_shared/kv';

export interface LinearEnv {
  DB: D1Database;
  CACHE?: KVNamespace;
  LINEAR_API_KEY?: string;
  LINEAR_TEAM_LEADY_ID?: string;
  LINEAR_PROWADZACY_ID?: string;
  LINEAR_STAN_TRIAGE_ID?: string;
  SRODOWISKO?: string;
}

/** Wiersz `leads` (kolumny używane przez moduł). */
export interface LeadRow {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  website?: string | null;
  budget?: string | null;
  message?: string | null;
  service_type?: string | null;
  package_name?: string | null;
  details?: string | null;
  source?: string | null;
  source_url?: string | null;
  current_step?: number | null;
}

type WaitUntil = ((p: Promise<unknown>) => void) | undefined;

// ---------------------------------------------------------------------------------------------
// Stałe
// ---------------------------------------------------------------------------------------------

export const LINEAR_URL = 'https://api.linear.app/graphql';
/** Odstęp przed ponowieniem po próbie 1..7 (minuty). Ósma porażka blokuje wiersz. */
export const ODSTEPY_MIN = [1, 5, 15, 60, 180, 360, 720] as const;
export const MAX_PROB = 8;
const BUDZET_MS = 25_000;
const TIMEOUT_MS = 8_000;
const W_TOKU_MAX_S = 120;
const RETRY_DOMYSLNY_S = 300;
const RETRY_MAX_S = 6 * 3600;
const DEDUP_TTL = 3600;
const ETYKIETY_TTL = 3600;
const KROK_TTL = 86_400;
const MAX_WIADOMOSC = 4000;
const MAX_OPIS = 10_000;

/** Domeny poczty prywatnej (porównanie po `lower`). `example.com` liczy się jak firmowa. */
export const DOMENY_PRYWATNE: readonly string[] = [
  'gmail.com',
  'googlemail.com',
  'wp.pl',
  'o2.pl',
  'interia.pl',
  'interia.eu',
  'onet.pl',
  'onet.eu',
  'op.pl',
  'vp.pl',
  'poczta.onet.pl',
  'tlen.pl',
  'gazeta.pl',
  'poczta.fm',
  'int.pl',
  'autograf.pl',
  'go2.pl',
  'spoko.pl',
  'buziaczek.pl',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'yahoo.com',
  'yahoo.pl',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'pm.me',
  'aol.com',
  'mail.com',
  'yandex.com',
  'yandex.ru',
  'zoho.com',
];
const PRYWATNE = new Set(DOMENY_PRYWATNE);

const TEMATY: Record<string, string> = {
  general: 'kontakt',
  web: 'strona www',
  marketing: 'marketing',
  design: 'design',
  audit: 'audyt',
  consultation: 'konsultacja',
};

const BUDZETY: Record<string, string> = {
  low: 'do 5 000 PLN',
  mid: '5 000–15 000 PLN',
  high: '15 000–50 000 PLN',
  enterprise: 'powyżej 50 000 PLN',
};

const ETYKIETA_ZRODLA: Record<string, string> = {
  website: 'formularz',
  audit: 'audyt',
  calculator: 'kalkulator',
};

const ZRODLO_OPIS: Record<string, string> = {
  website: 'formularz kontaktowy',
  audit: 'audyt strony',
  calculator: 'kalkulator wyceny',
};

// ---------------------------------------------------------------------------------------------
// Czyste funkcje
// ---------------------------------------------------------------------------------------------

const RE_DOMENA =
  /^(?=.{3,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

/**
 * Domena firmowa z adresu e-mail (małe litery) albo `null`: poczta prywatna, zły adres, domena
 * z ciągiem ≥ 7 cyfr (wygląda jak numer telefonu, nie trafia do tytułu ani do Customera).
 */
export function domenaFirmowa(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const e = email.trim().toLowerCase();
  const at = e.indexOf('@');
  if (at < 1 || at !== e.lastIndexOf('@') || /\s/.test(e)) return null;
  const d = e.slice(at + 1);
  if (!RE_DOMENA.test(d) || PRYWATNE.has(d) || /\d{7,}/.test(d)) return null;
  return d;
}

type Json = Record<string, unknown>;

const jestObj = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v);

function parsujDetails(raw: string | null | undefined): Json {
  if (!raw) return {};
  try {
    const v: unknown = JSON.parse(raw);
    return jestObj(v) ? v : {};
  } catch {
    return {};
  }
}

/** Tekst bez znaków sterujących, w jednej linii, bez HTML (nawiasy ostre → encje) i z ucieczką `|`. */
function czysc(s: unknown, max: number): string {
  let t = typeof s === 'string' ? s : s === null || s === undefined ? '' : String(s);
  // eslint-disable-next-line no-control-regex
  t = t.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim();
  if (t.length > max) t = t.slice(0, max);
  return t.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\|/g, '\\|');
}

/** Wiele linii (cytat wiadomości): zachowuje podział linii, resztę czyści jak `czysc`. */
function czyscWiele(s: unknown, max: number): string[] {
  const t = typeof s === 'string' ? s.slice(0, max) : '';
  return t
    .split(/\r?\n/)
    .map((l) => czysc(l, max))
    .filter((l, i, a) => l !== '' || (i > 0 && a[i - 1] !== ''));
}

const liczba = (v: unknown): number | null => (typeof v === 'number' && isFinite(v) ? v : null);

const formatPln = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function widelki(lead: LeadRow, d: Json): string | null {
  const pr = d.priceRange;
  if (jestObj(pr)) {
    const a = liczba(pr.min);
    const b = liczba(pr.max);
    if (a !== null && b !== null) return `${formatPln(a)}–${formatPln(b)} zł`;
  }
  const m = /^\s*(\d{1,9})\s*[-–]\s*(\d{1,9})\s*$/.exec(lead.budget ?? '');
  return m ? `${formatPln(Number(m[1]))}–${formatPln(Number(m[2]))} zł` : null;
}

function wynikAudytu(d: Json): number | null {
  const s = liczba(d.score);
  return s === null ? null : Math.max(0, Math.min(100, Math.round(s)));
}

/** Temat swobodny (service_type, package_name spoza słownika): litery, cyfry, spacje, myślnik, ≤ 40 zn., bez PII. */
function temat40(wartosc: string, lead: LeadRow): string {
  let t = wartosc.normalize('NFKC').replace(/[^\p{L}\p{N} -]+/gu, ' ');
  if ((t.match(/\d/g) ?? []).length >= 7) t = t.replace(/\d+/g, ' ');
  const czlony = `${lead.name ?? ''} ${(lead.email ?? '').split('@')[0]}`
    .toLowerCase()
    .split(/[^\p{L}]+/u)
    .filter((x) => x.length >= 2);
  // Imię (albo część adresu) usuwamy z tematu wszędzie: krótkie tylko jako całe słowo, od 3 liter także w środku słowa.
  const dlugie = czlony
    .filter((x) => x.length >= 3)
    .map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (dlugie.length) t = t.replace(new RegExp(dlugie.join('|'), 'giu'), ' ');
  const krotkie = new Set(czlony.filter((x) => x.length === 2));
  t = t
    .split(/\s+/)
    .filter((slowo) => slowo !== '' && !krotkie.has(slowo.toLowerCase()))
    .join(' ');
  return t.slice(0, 40).trim();
}

/** Temat leada (bez domeny): do tytułu i do treści Customer Request. */
export function tematLeada(lead: LeadRow): string {
  const d = parsujDetails(lead.details);
  if (lead.source === 'audit') {
    const w = wynikAudytu(d);
    return w === null ? 'audyt strony' : `audyt strony, wynik ${w}/100`;
  }
  if (lead.source === 'calculator') {
    const w = widelki(lead, d);
    return w === null ? 'kalkulator' : `kalkulator: ${w}`;
  }
  const pakiet = temat40(lead.package_name ?? '', lead);
  if (pakiet) return `abonament: ${pakiet}`;
  const usluga = (lead.service_type ?? '').trim();
  if (Object.prototype.hasOwnProperty.call(TEMATY, usluga)) return TEMATY[usluga];
  return temat40(usluga, lead) || 'kontakt';
}

/** Tytuł zadania (≤ 120 zn.): domena firmy albo „osoba prywatna” i temat. Nigdy e-mail, imię ani telefon. */
export function tytulZadania(lead: LeadRow, opcje: { preview?: boolean } = {}): string {
  const przedrostek = opcje.preview ? '[Preview] ' : '';
  const domena = domenaFirmowa(lead.email) ?? 'osoba prywatna';
  return `${przedrostek}Lead: ${domena} — ${tematLeada(lead)}`.slice(0, 120);
}

const KLUCZE_POMIJANE = /token|secret|captcha|passw|haslo|hasło|^ip$|agent/i;
const KLUCZE_OBSLUZONE = new Set([
  'score',
  'pdf_key',
  'priceRange',
  'answers',
  'quote_ref',
  'projectType',
  'company',
  'budget',
  'website',
]);

const wartoscTekst = (v: unknown): string =>
  typeof v === 'string'
    ? v
    : typeof v === 'number' || typeof v === 'boolean'
      ? String(v)
      : JSON.stringify(v);

function listaPol(src: Json, pomin: (k: string) => boolean, max: number): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(src)) {
    if (out.length >= max) break;
    if (pomin(k) || v === null || v === undefined || v === '') continue;
    const klucz = k.replace(/[^\p{L}\p{N}_ -]+/gu, '').slice(0, 40);
    if (!klucz) continue;
    out.push(`- ${klucz}: ${czysc(wartoscTekst(v), 300)}`);
  }
  return out;
}

/** Opis zadania (Markdown, ≤ 10 000 zn.): nagłówek, tabela pól, cytat wiadomości, reszta szczegółów. */
export function opisZadania(lead: LeadRow): string {
  const d = parsujDetails(lead.details);
  const zrodlo = ZRODLO_OPIS[lead.source ?? ''] ?? ZRODLO_OPIS.website;
  const linie: string[] = [
    `**Źródło:** ${zrodlo}`,
    `**Krok formularza:** ${czysc(lead.current_step ?? '', 10) || '—'}`,
    `**Strona:** ${czysc(lead.source_url ?? '', 300) || '—'}`,
    `**ID leada:** ${czysc(lead.id, 64)}`,
    '',
    '| Pole | Wartość |',
    '|---|---|',
  ];
  const budzet = lead.budget ?? (typeof d.budget === 'string' ? d.budget : '');
  const wiersze: [string, string][] = [
    ['Imię', czysc(lead.name, 200)],
    ['E-mail', czysc(lead.email, 200)],
    ['Telefon', czysc(lead.phone, 60)],
    ['Firma', czysc(lead.company ?? d.company, 200)],
    ['WWW', czysc(lead.website, 300)],
    ['Rodzaj projektu', czysc(d.projectType, 200)],
    ['Budżet', lead.source === 'calculator' ? '' : czysc(BUDZETY[budzet] ?? budzet, 100)],
    ['Pakiet', czysc(lead.package_name, 200)],
  ];
  for (const [k, v] of wiersze) if (v) linie.push(`| ${k} | ${v} |`);

  if (lead.source === 'audit') {
    const w = wynikAudytu(d);
    linie.push('', `**Wynik audytu:** ${w === null ? '—' : `${w}/100`}`);
    if (lead.website) linie.push(`**Adres strony:** ${czysc(lead.website, 300)}`);
    if (typeof d.pdf_key === 'string')
      linie.push(`**Raport (klucz R2):** ${czysc(d.pdf_key, 200)}`);
  }
  if (lead.source === 'calculator') {
    linie.push('', `**Widełki:** ${widelki(lead, d) ?? '—'}`);
    if (typeof d.quote_ref === 'string' || typeof d.quote_ref === 'number')
      linie.push(`**Wycena:** ${czysc(d.quote_ref, 40)}`);
    if (jestObj(d.answers)) {
      linie.push('', '**Odpowiedzi kalkulatora:**', ...listaPol(d.answers, () => false, 60));
    }
  }
  if (lead.message) {
    linie.push('', '**Wiadomość:**');
    for (const l of czyscWiele(lead.message, MAX_WIADOMOSC)) linie.push(`> ${l}`);
  }
  const reszta = listaPol(d, (k) => KLUCZE_OBSLUZONE.has(k) || KLUCZE_POMIJANE.test(k), 40);
  if (reszta.length) linie.push('', '**Pozostałe pola:**', ...reszta);

  const opis = linie.join('\n');
  return opis.length > MAX_OPIS ? `${opis.slice(0, MAX_OPIS - 1)}…` : opis;
}

/** Treść Customer Request: temat, budżet (formularz), do 200 zn. wiadomości. */
export function trescProsby(lead: LeadRow): string {
  const d = parsujDetails(lead.details);
  const czesci = [`Temat: ${tematLeada(lead)}`];
  if (lead.source !== 'audit' && lead.source !== 'calculator') {
    const b = lead.budget ?? (typeof d.budget === 'string' ? d.budget : '');
    if (b) czesci.push(`Budżet: ${czysc(BUDZETY[b] ?? b, 100)}`);
    if (lead.message) czesci.push(`Wiadomość: ${czysc(lead.message, 200)}`);
  }
  return czesci.join('\n');
}

/** Treść komentarza dla kroku formularza. */
function trescKroku(krok: string, pola: Json): string {
  const linie = [`**Krok formularza: ${czysc(krok, 40)}**`, ''];
  for (const [k, v] of Object.entries(pola)) {
    if (KLUCZE_POMIJANE.test(k) || v === null || v === undefined || v === '') continue;
    const klucz = k.replace(/[^\p{L}\p{N}_ -]+/gu, '').slice(0, 40);
    if (!klucz) continue;
    if (klucz === 'message') {
      linie.push(
        '**Wiadomość:**',
        ...czyscWiele(wartoscTekst(v), MAX_WIADOMOSC).map((l) => `> ${l}`),
      );
    } else {
      linie.push(`- ${klucz}: ${czysc(wartoscTekst(v), 300)}`);
    }
  }
  const t = linie.join('\n');
  return t.length > MAX_OPIS ? `${t.slice(0, MAX_OPIS - 1)}…` : t;
}

// ---------------------------------------------------------------------------------------------
// Klient GraphQL
// ---------------------------------------------------------------------------------------------

const Q = {
  Etykiety: `query Etykiety($teamId: String!) { team(id: $teamId) { id key labels(first: 50) { nodes { id name } } } }`,
  KlientUpsert: `mutation KlientUpsert($input: CustomerUpsertInput!) { customerUpsert(input: $input) { success customer { id name } } }`,
  ZadanieUtworz: `mutation ZadanieUtworz($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { id identifier url } } }`,
  ProsbaKlienta: `mutation ProsbaKlienta($input: CustomerNeedCreateInput!) { customerNeedCreate(input: $input) { success need { id } } }`,
  Komentarz: `mutation Komentarz($input: CommentCreateInput!) { commentCreate(input: $input) { success comment { id } } }`,
  ZadaniePoId: `query ZadaniePoId($id: String!) { issue(id: $id) { id identifier url } }`,
} as const;

type Operacja = keyof typeof Q;

interface Porazka {
  ok: false;
  blad: string;
  /** Sekundy z `Retry-After` (tylko 429). */
  ponowSek?: number;
  /** Brak budżetu czasu: wiersz wraca do kolejki bez doliczania próby. */
  bezKary?: boolean;
}
type Odp = { ok: true; data: Json } | Porazka;

interface Budzet {
  koniec: number;
}
const nowyBudzet = (): Budzet => ({ koniec: Date.now() + BUDZET_MS });

function kodBledu(body: unknown): string | null {
  if (!jestObj(body) || !Array.isArray(body.errors) || body.errors.length === 0) return null;
  const e: unknown = body.errors[0];
  const kod = jestObj(e) && jestObj(e.extensions) ? e.extensions.code : undefined;
  const t = typeof kod === 'string' ? kod.replace(/[^A-Za-z0-9_]/g, '').slice(0, 40) : '';
  return t || 'UNKNOWN';
}

function retryAfter(h: string | null): number | undefined {
  if (!h || !/^\d{1,6}$/.test(h.trim())) return undefined;
  return Math.min(Number(h.trim()), RETRY_MAX_S);
}

async function gql(env: LinearEnv, budzet: Budzet, op: Operacja, variables: Json): Promise<Odp> {
  const zostalo = budzet.koniec - Date.now();
  if (zostalo < 500) return { ok: false, blad: 'budzet', bezKary: true };
  let odp: Response;
  try {
    odp = await fetch(LINEAR_URL, {
      method: 'POST',
      headers: { Authorization: env.LINEAR_API_KEY ?? '', 'Content-Type': 'application/json' },
      body: JSON.stringify({ operationName: op, query: Q[op], variables }),
      signal: AbortSignal.timeout(Math.min(TIMEOUT_MS, zostalo)),
    });
  } catch (e) {
    const n = jestObj(e) || e instanceof Error ? String((e as { name?: unknown }).name) : '';
    return { ok: false, blad: n === 'TimeoutError' || n === 'AbortError' ? 'timeout' : 'siec' };
  }
  let body: unknown = null;
  try {
    body = await odp.json();
  } catch {
    /* brak JSON-a: liczy się status */
  }
  const kod = kodBledu(body);
  if (odp.status === 429 || kod === 'RATELIMITED') {
    return { ok: false, blad: 'HTTP 429', ponowSek: retryAfter(odp.headers.get('Retry-After')) };
  }
  if (!odp.ok) return { ok: false, blad: `HTTP ${odp.status}` };
  if (kod !== null) return { ok: false, blad: `errors:${kod}` };
  if (!jestObj(body) || !jestObj(body.data)) return { ok: false, blad: 'errors:BRAK_DANYCH' };
  return { ok: true, data: body.data };
}

const pole = (o: unknown, klucz: string): unknown => (jestObj(o) ? o[klucz] : undefined);
const tekst = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null);

interface Zadanie {
  id: string;
  identifier: string | null;
  url: string | null;
}

function zadanieZ(v: unknown): Zadanie | null {
  const id = tekst(pole(v, 'id'));
  return id ? { id, identifier: tekst(pole(v, 'identifier')), url: tekst(pole(v, 'url')) } : null;
}

// ---------------------------------------------------------------------------------------------
// Stan w D1
// ---------------------------------------------------------------------------------------------

interface WierszLinear {
  lead_id: string;
  stan: string;
  issue_id: string | null;
  identifier: string | null;
  url: string | null;
  customer_request: number;
  duplikat_of: string | null;
  proby: number;
}

/** Czas w formacie D1 („YYYY-MM-DD HH:MM:SS”, UTC), liczony w JS, żeby porównania tekstowe były spójne. */
const czasD1 = (ms: number) => new Date(ms).toISOString().replace('T', ' ').slice(0, 19);

const KOLUMNY = new Set([
  'stan',
  'issue_id',
  'identifier',
  'url',
  'customer_request',
  'duplikat_of',
  'proby',
  'ostatni_blad',
  'nastepna_proba',
]);

async function zapisz(
  env: LinearEnv,
  leadId: string,
  pola: Record<string, string | number | null>,
) {
  const klucze = Object.keys(pola).filter((k) => KOLUMNY.has(k));
  const set = [...klucze.map((k) => `${k} = ?`), 'updated_at = ?'].join(', ');
  await env.DB.prepare(`UPDATE linear_leady SET ${set} WHERE lead_id = ?`)
    .bind(...klucze.map((k) => pola[k]), czasD1(Date.now()), leadId)
    .run();
}

async function zablokuj(env: LinearEnv, leadId: string): Promise<boolean> {
  const t = czasD1(Date.now());
  const r = await env.DB.prepare(
    `UPDATE linear_leady SET stan = 'w_toku', updated_at = ?
     WHERE lead_id = ?
       AND ((stan = 'kolejka' AND nastepna_proba <= ?)
         OR (stan = 'wyslany' AND customer_request = 0 AND nastepna_proba <= ?))`,
  )
    .bind(t, leadId, t, t)
    .run();
  return r.meta.changes === 1;
}

async function porazka(env: LinearEnv, w: WierszLinear, p: Porazka, maZadanie: boolean) {
  const proby = p.bezKary ? w.proby : w.proby + 1;
  let stan = maZadanie ? 'wyslany' : 'kolejka';
  let sek: number;
  if (p.bezKary) sek = 60;
  else if (proby >= MAX_PROB) {
    stan = 'zablokowany';
    sek = 0;
  } else {
    sek = p.ponowSek ?? (p.blad === 'HTTP 429' ? RETRY_DOMYSLNY_S : ODSTEPY_MIN[proby - 1] * 60);
  }
  console.error(`[linear] lead ${w.lead_id}: ${p.blad} (próba ${proby}, ${stan})`);
  await zapisz(env, w.lead_id, {
    stan,
    proby,
    ostatni_blad: p.blad,
    nastepna_proba: czasD1(Date.now() + sek * 1000),
  });
}

// ---------------------------------------------------------------------------------------------
// Wysyłka jednego leada
// ---------------------------------------------------------------------------------------------

const wlaczony = (env: LinearEnv) => Boolean(env.LINEAR_API_KEY && env.LINEAR_TEAM_LEADY_ID);

async function sha256Hex(s: string): Promise<string> {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

async function etykiety(
  env: LinearEnv,
  budzet: Budzet,
): Promise<Odp & { mapa?: Record<string, string> }> {
  const teamId = env.LINEAR_TEAM_LEADY_ID ?? '';
  const klucz = `linear:etykiety:${teamId}`;
  const zKv = await kvGetJson<Record<string, string>>(env.CACHE, klucz);
  if (zKv && jestObj(zKv)) return { ok: true, data: {}, mapa: zKv };
  const o = await gql(env, budzet, 'Etykiety', { teamId });
  if (!o.ok) return o;
  const wezly = pole(pole(o.data.team, 'labels'), 'nodes');
  const mapa: Record<string, string> = {};
  if (Array.isArray(wezly)) {
    for (const n of wezly) {
      const nazwa = tekst(pole(n, 'name'));
      const id = tekst(pole(n, 'id'));
      if (nazwa && id) mapa[nazwa] = id;
    }
  }
  if (Object.keys(mapa).length > 0) {
    await kvPut(env.CACHE, klucz, JSON.stringify(mapa), { expirationTtl: ETYKIETY_TTL });
  }
  return { ok: true, data: {}, mapa };
}

async function klientUpsert(
  env: LinearEnv,
  budzet: Budzet,
  domena: string,
): Promise<{ ok: true; id: string } | Porazka> {
  const o = await gql(env, budzet, 'KlientUpsert', {
    input: { externalId: domena, name: domena, domains: [domena] },
  });
  if (!o.ok) return o;
  const id = tekst(pole(pole(o.data.customerUpsert, 'customer'), 'id'));
  return id ? { ok: true, id } : { ok: false, blad: 'errors:BRAK_KLIENTA' };
}

async function prosbaKlienta(
  env: LinearEnv,
  budzet: Budzet,
  lead: LeadRow,
  customerId: string,
  issueId: string,
): Promise<Porazka | null> {
  const o = await gql(env, budzet, 'ProsbaKlienta', {
    input: { customerId, issueId, body: trescProsby(lead) },
  });
  if (!o.ok) return o;
  return pole(o.data.customerNeedCreate, 'success') === false
    ? { ok: false, blad: 'errors:PROSBA_NIEUDANA' }
    : null;
}

/** Zadanie już istnieje (poprzednia próba przeszła): brakuje tylko Customer Request. */
async function tylkoProsba(
  env: LinearEnv,
  budzet: Budzet,
  lead: LeadRow,
  w: WierszLinear,
  domena: string | null,
): Promise<Porazka | null> {
  if (!domena || !w.issue_id) {
    await zapisz(env, w.lead_id, {
      stan: 'wyslany',
      customer_request: 2,
      proby: 0,
      ostatni_blad: null,
    });
    return null;
  }
  const k = await klientUpsert(env, budzet, domena);
  if (!k.ok) return k;
  const blad = await prosbaKlienta(env, budzet, lead, k.id, w.issue_id);
  if (blad) return blad;
  await zapisz(env, w.lead_id, {
    stan: 'wyslany',
    customer_request: 1,
    proby: 0,
    ostatni_blad: null,
  });
  return null;
}

async function pelnaWysylka(
  env: LinearEnv,
  budzet: Budzet,
  lead: LeadRow,
  w: WierszLinear,
  domena: string | null,
): Promise<{ blad: Porazka; maZadanie: boolean } | null> {
  const preview = env.SRODOWISKO === 'preview';
  const emailKlucz = `linear:dedup:${await sha256Hex(lead.email.trim().toLowerCase())}`;

  // 1) Dedup: drugi lead z tego adresu w ciągu godziny = komentarz w istniejącym zadaniu.
  const wczesniej = await kvGetJson<{ issue_id?: string; identifier?: string }>(
    env.CACHE,
    emailKlucz,
  );
  if (wczesniej && tekst(wczesniej.issue_id) && wczesniej.issue_id !== lead.id) {
    const o = await gql(env, budzet, 'Komentarz', {
      input: {
        issueId: wczesniej.issue_id,
        body: `**Kolejny lead z tego adresu e-mail (w ciągu godziny)**\n\n${opisZadania(lead)}`,
      },
    });
    if (o.ok) {
      await zapisz(env, lead.id, {
        stan: 'wyslany',
        issue_id: wczesniej.issue_id ?? null,
        identifier: tekst(wczesniej.identifier),
        duplikat_of: wczesniej.issue_id ?? null,
        customer_request: 2,
        proby: 0,
        ostatni_blad: null,
      });
      return null;
    }
    // Zadanie z cache'u nie istnieje (errors): tworzymy normalnie; inne błędy → kolejka.
    if (!o.blad.startsWith('errors:')) return { blad: o, maZadanie: false };
  }

  // 2) Etykiety (cache KV 1 h).
  const et = await etykiety(env, budzet);
  if (!et.ok) return { blad: et, maZadanie: false };
  const nazwy = [ETYKIETA_ZRODLA[lead.source ?? ''] ?? 'formularz'];
  if (!domena) nazwy.push('bez-firmy');
  if (preview) nazwy.push('test');
  const labelIds: string[] = [];
  for (const n of nazwy) {
    const id = et.mapa?.[n];
    if (id) labelIds.push(id);
    else console.error(`[linear] lead ${lead.id}: brak etykiety ${n} w zespole`);
  }

  // 3) Customer (tylko poczta firmowa).
  let customerId: string | null = null;
  if (domena) {
    const k = await klientUpsert(env, budzet, domena);
    if (!k.ok) return { blad: k, maZadanie: false };
    customerId = k.id;
  }

  // 4) Zadanie: id = id leada (idempotencja).
  const input: Json = {
    id: lead.id,
    teamId: env.LINEAR_TEAM_LEADY_ID,
    title: tytulZadania(lead, { preview }),
    description: opisZadania(lead),
    labelIds,
  };
  if (env.LINEAR_PROWADZACY_ID) input.assigneeId = env.LINEAR_PROWADZACY_ID;
  if (env.LINEAR_STAN_TRIAGE_ID) input.stateId = env.LINEAR_STAN_TRIAGE_ID;
  const o = await gql(env, budzet, 'ZadanieUtworz', { input });
  let zadanie = o.ok ? zadanieZ(pole(o.data.issueCreate, 'issue')) : null;
  if (!zadanie) {
    const blad: Porazka = o.ok ? { ok: false, blad: 'errors:BRAK_ZADANIA' } : o;
    // Wynik niepewny (timeout, 5xx, zajęty id): sprawdź, czy poprzednia próba nie utworzyła zadania.
    if (!['HTTP 401', 'HTTP 403', 'HTTP 429', 'budzet'].includes(blad.blad)) {
      const p = await gql(env, budzet, 'ZadaniePoId', { id: lead.id });
      if (p.ok) zadanie = zadanieZ(p.data.issue);
    }
    if (!zadanie) return { blad, maZadanie: false };
  }
  // Numer zadania zapisujemy od razu: przy padzie procesu ponowienie zrobi już tylko Customer Request.
  await zapisz(env, lead.id, {
    issue_id: zadanie.id,
    identifier: zadanie.identifier,
    url: zadanie.url,
    proby: 0,
  });
  await kvPut(
    env.CACHE,
    emailKlucz,
    JSON.stringify({ issue_id: zadanie.id, identifier: zadanie.identifier }),
    {
      expirationTtl: DEDUP_TTL,
    },
  );

  // 5) Customer Request: jego awaria nie cofa zadania.
  if (!customerId) {
    await zapisz(env, lead.id, { stan: 'wyslany', customer_request: 2, ostatni_blad: null });
    return null;
  }
  const blad = await prosbaKlienta(env, budzet, lead, customerId, zadanie.id);
  if (blad) return { blad, maZadanie: true };
  await zapisz(env, lead.id, { stan: 'wyslany', customer_request: 1, ostatni_blad: null });
  return null;
}

/** Przetwarza wiersz już zablokowany (`w_toku`). Zwraca true, gdy skończył się sukcesem. */
async function przetworz(env: LinearEnv, leadId: string, budzet: Budzet): Promise<boolean> {
  const w = await env.DB.prepare('SELECT * FROM linear_leady WHERE lead_id = ?')
    .bind(leadId)
    .first<WierszLinear>();
  if (!w) return false;
  const lead = await env.DB.prepare('SELECT * FROM leads WHERE id = ?')
    .bind(leadId)
    .first<LeadRow>();
  if (!lead) {
    console.error(`[linear] lead ${leadId}: brak wiersza leads`);
    await zapisz(env, leadId, { stan: 'zablokowany', ostatni_blad: 'brak-leada' });
    return false;
  }
  const domena = domenaFirmowa(lead.email);
  const maZadanie = Boolean(w.issue_id) && !w.duplikat_of;
  if (maZadanie) {
    const blad = await tylkoProsba(env, budzet, lead, w, domena);
    if (blad) await porazka(env, w, blad, true);
    return !blad;
  }
  const wynik = await pelnaWysylka(env, budzet, lead, w, domena);
  if (wynik) {
    await porazka(env, wynik.maZadanie ? { ...w, proby: 0 } : w, wynik.blad, wynik.maZadanie);
    return false;
  }
  return true;
}

function logBledu(e: unknown): void {
  const msg = e instanceof Error ? e.message : '';
  if (/no such table/i.test(msg)) console.error('linear:brak-tabeli');
  else console.error(`linear:blad-wewnetrzny ${e instanceof Error ? e.name : 'nieznany'}`);
}

/** Drenaż z gotowym budżetem: tylko wiersze `nastepna_proba <= teraz`. */
async function drenuj(env: LinearEnv, budzet: Budzet, limit: number): Promise<number> {
  const t = czasD1(Date.now());
  // Wiersze zawieszone w `w_toku` (padł proces) wracają do kolejki.
  await env.DB.prepare(
    `UPDATE linear_leady SET stan = 'kolejka', updated_at = ? WHERE stan = 'w_toku' AND updated_at <= ?`,
  )
    .bind(t, czasD1(Date.now() - W_TOKU_MAX_S * 1000))
    .run();
  const kand = await env.DB.prepare(
    `SELECT lead_id FROM linear_leady
     WHERE nastepna_proba <= ? AND (stan = 'kolejka' OR (stan = 'wyslany' AND customer_request = 0))
     ORDER BY nastepna_proba ASC LIMIT ?`,
  )
    .bind(t, limit)
    .all<{ lead_id: string }>();
  let ok = 0;
  for (const { lead_id } of kand.results ?? []) {
    if (!(await zablokuj(env, lead_id))) continue;
    if (await przetworz(env, lead_id, budzet)) ok += 1;
  }
  return ok;
}

// ---------------------------------------------------------------------------------------------
// Eksporty
// ---------------------------------------------------------------------------------------------

/** Zgłasza lead do Lineara (po udanym zapisie w D1). Nigdy nie rzuca. */
export async function zglosLead(env: LinearEnv, leadId: string): Promise<void> {
  if (!wlaczony(env)) {
    console.warn('linear:wylaczone');
    return;
  }
  try {
    const budzet = nowyBudzet();
    const t = czasD1(Date.now());
    const lead = await env.DB.prepare('SELECT id FROM leads WHERE id = ?').bind(leadId).first();
    if (!lead) {
      console.error(`[linear] lead ${leadId}: brak w leads`);
      return;
    }
    await env.DB.prepare(
      `INSERT OR IGNORE INTO linear_leady (lead_id, stan, nastepna_proba, created_at, updated_at)
       VALUES (?, 'kolejka', ?, ?, ?)`,
    )
      .bind(leadId, t, t, t)
      .run();
    if (await zablokuj(env, leadId)) await przetworz(env, leadId, budzet);
    await drenuj(env, budzet, 5);
  } catch (e) {
    logBledu(e);
  }
}

/** Zgłoszenie w tle (waitUntil). Bez waitUntil (testy, lokalnie) obietnica i tak się wykona. */
export function zglosLeadWTle(waitUntil: WaitUntil, env: LinearEnv, leadId: string): void {
  const p = zglosLead(env, leadId);
  if (waitUntil) waitUntil(p);
}

/** Komentarz dla kroku formularza (`krok` np. `krok2`, `krok3`, `porzucenie2`). Raz na krok (KV 24 h). */
export async function komentarzKroku(
  env: LinearEnv,
  leadId: string,
  krok: string,
  pola: Record<string, unknown>,
): Promise<void> {
  if (!wlaczony(env)) {
    console.warn('linear:wylaczone');
    return;
  }
  try {
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(krok)) return;
    const klucz = `linear:krok:${leadId}:${krok}`;
    if (await kvGetJson(env.CACHE, klucz)) return;
    const w = await env.DB.prepare('SELECT * FROM linear_leady WHERE lead_id = ?')
      .bind(leadId)
      .first<WierszLinear>();
    if (!w || w.stan !== 'wyslany' || !w.issue_id) return;
    const o = await gql(env, nowyBudzet(), 'Komentarz', {
      input: { issueId: w.issue_id, body: trescKroku(krok, pola) },
    });
    if (!o.ok) {
      console.error(`[linear] lead ${leadId}: komentarz kroku ${krok}: ${o.blad}`);
      return;
    }
    await kvPut(env.CACHE, klucz, '1', { expirationTtl: KROK_TTL });
  } catch (e) {
    logBledu(e);
  }
}

export function komentarzKrokuWTle(
  waitUntil: WaitUntil,
  env: LinearEnv,
  leadId: string,
  krok: string,
  pola: Record<string, unknown>,
): void {
  const p = komentarzKroku(env, leadId, krok, pola);
  if (waitUntil) waitUntil(p);
}

export interface WynikDrenazu {
  ponowione: number;
  w_kolejce: number;
  zablokowane: number;
  bez_customer_request: number;
  czas: string;
}

/** Drenaż kolejki (timer przez `POST /api/leady/ponow`). `odblokuj`: zablokowane → kolejka, proby=0. */
export async function drenujKolejke(
  env: LinearEnv,
  opcje: { limit?: number; odblokuj?: boolean } = {},
): Promise<WynikDrenazu> {
  const wynik: WynikDrenazu = {
    ponowione: 0,
    w_kolejce: 0,
    zablokowane: 0,
    bez_customer_request: 0,
    czas: new Date().toISOString(),
  };
  if (!wlaczony(env)) {
    console.warn('linear:wylaczone');
    return wynik;
  }
  try {
    const limit = Math.max(1, Math.min(50, Math.floor(opcje.limit ?? 20) || 20));
    if (opcje.odblokuj) {
      await env.DB.prepare(
        `UPDATE linear_leady SET stan = 'kolejka', proby = 0, nastepna_proba = ?, updated_at = ?
         WHERE stan = 'zablokowany'`,
      )
        .bind(czasD1(Date.now()), czasD1(Date.now()))
        .run();
    }
    wynik.ponowione = await drenuj(env, nowyBudzet(), limit);
    const licz = async (warunek: string) =>
      Number(
        (
          await env.DB.prepare(`SELECT COUNT(*) AS n FROM linear_leady WHERE ${warunek}`).first<{
            n: number;
          }>()
        )?.n ?? 0,
      );
    wynik.w_kolejce = await licz(`stan = 'kolejka'`);
    wynik.zablokowane = await licz(`stan = 'zablokowany'`);
    wynik.bez_customer_request = await licz(`stan = 'wyslany' AND customer_request = 0`);
  } catch (e) {
    logBledu(e);
  }
  return wynik;
}
