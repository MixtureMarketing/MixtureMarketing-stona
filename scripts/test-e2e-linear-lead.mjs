#!/usr/bin/env node
// E2E leady → Linear na Preview (Node 22, bez przeglądarki).
//
// Wejścia: formularz kontaktowy (POST /api/contact-submit, action create), kalkulator
// (POST /api/estimation/public-quote), audyt (POST /api/audit/capture-lead, multipart z PDF).
// Odczyt i sprzątanie zadań w Linearze przez polecenie `lin` (zespół LEA).
//
// Przypadki: (a) formularz firmowy, (b) formularz gmail (tylko przy Preview bez Resend),
// (c) kalkulator, (d) audyt z PDF, (e) dwa leady z jednego adresu = 1 zadanie + 1 komentarz,
// (f) awaria Lineara i powrót (dwie fazy ręczne: --faza f1, --faza f2), (g) sprzątanie.
//
// Kolejność faz (f): najpierw `--faza f1` (klucz Lineara zepsuty), potem naprawa klucza i `--faza f2`,
// dopiero potem pełny przebieg bez `--faza`. Plik stanu `.bieg/e2e-leady/f-stan.json` jest związany z SHA
// (E2E_SHA albo --sha jest wtedy wymagane) i ważny 24 h od zapisu f1; brak pliku, nieczytelny JSON, inny SHA
// albo starszy stan = faza (f) kończy się porażką (kod 1) z linią powodu.
//
// Środowisko (sekrety wyłącznie z env, nigdy z plików; wrapper e2e-linear-lead.sh może je wyeksportować):
//   E2E_BASE_URL            domyślnie https://dev.mixturemarketing-stona.pages.dev (jedyny dozwolony alias)
//   E2E_HASH_URL            link Preview https://<8 znaków hex>.mixturemarketing-stona.pages.dev, albo --hash-url
//   CF_ACCESS_CLIENT_ID / CF_ACCESS_CLIENT_SECRET   nagłówki Cloudflare Access (service token)
//   E2E_PONOW_SECRET        sekret podpisu POST /api/leady/ponow (tylko fazy f1, f2)
//   E2E_BEZ_RESEND=1        Preview nie ma RESEND_API_KEY, więc (b) wolno uruchomić
//   E2E_SHA                 SHA wdrożenia (albo --sha), trafia do raportu
//
// Kody wyjścia: 0 = wszystkie 7 przypadków przeszły; 1 = jest porażka; 2 = ochrona Preview albo
// konfiguracja odmówiła (przed jakimkolwiek POST); 3 = przebieg niepełny (pominięte albo brakujące fazy).
// Raport: .bieg/e2e-leady/<znacznik>.md (ścieżka względna do katalogu repo, tylko id i liczby).
import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const DOMYSLNY_BASE_URL = 'https://dev.mixturemarketing-stona.pages.dev';
export const TOKEN_TURNSTILE = 'XXXX.DUMMY.TOKEN.XXXX';
export const HOSTY_PRODUKCJI = [
  'mixturemarketing-stona.pages.dev',
  'mixturemarketing.pl',
  'www.mixturemarketing.pl',
];
export const ALIAS_PREVIEW = 'dev.mixturemarketing-stona.pages.dev';
export const WZORZEC_HASHA = /^[0-9a-f]{8}\.mixturemarketing-stona\.pages\.dev$/;
export const WAZNOSC_STANU_F_MS = 24 * 60 * 60 * 1000;
export const PROBY_PONOW = 3;
export const PRZEDROSTEK_BLEDU = 'e2e: błąd nieobsłużony: ';
export const PRZYPADKI = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
export const PROWADZACY = 'jakub';
export const PRZEDROSTEK_TYTULU = '[Preview] Lead: ';
/** Dozwolony kształt id zadania zespołu LEA (allowlista dla id z pliku stanu f). */
export const ID_ZADANIA = /^LEA-[0-9]{1,7}$/;
export const TIMEOUT_PRZYPADKU_MS = 60_000;
export const KROK_ODPYTYWANIA_MS = 5_000;
export const KATALOG_WYNIKOW = path.join('.bieg', 'e2e-leady');
const TIMEOUT_ZAPYTANIA_MS = 20_000;
const LIMIT_LISTY = 500;
const PDF_1_STRONA = [
  '%PDF-1.4',
  '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
  '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
  '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj',
  'trailer<</Root 1 0 R>>',
  '%%EOF',
  '',
].join('\n');

// ---------------------------------------------------------------------------------------------
// Czyste funkcje
// ---------------------------------------------------------------------------------------------

/** Maskuje sekrety w tekście (znane wartości, ich wersje w URL, wartości nagłówków Access i podpisu). */
export function maskuj(tekst, sekrety = []) {
  let t = String(tekst ?? '');
  for (const s of sekrety) {
    if (typeof s !== 'string' || s === '') continue;
    for (const wariant of new Set([s, encodeURIComponent(s)])) t = t.split(wariant).join('***');
  }
  t = t.replace(/(cf-access-client-(?:id|secret)\s*[:=]\s*)\S+/gi, '$1***');
  t = t.replace(/(x-mixture-signature\s*[:=]\s*sha256=)[0-9a-f]+/gi, '$1***');
  return t;
}

const dwie = (n) => String(n).padStart(2, '0');

/** Znacznik minutowy UTC: RRRRMMDDGGMM. */
export function znacznikMinuty(teraz) {
  return `${teraz.getUTCFullYear()}${dwie(teraz.getUTCMonth() + 1)}${dwie(teraz.getUTCDate())}${dwie(teraz.getUTCHours())}${dwie(teraz.getUTCMinutes())}`;
}

/** Adres testowy `e2e+<RRRRMMDDGGMM><litera>@<domena>` (domyślnie example.com). */
export function adresE2E(teraz, litera, domena = 'example.com') {
  if (!(teraz instanceof Date) || Number.isNaN(teraz.getTime())) throw new Error('adresE2E: zła data');
  if (!/^[a-z]$/.test(String(litera))) throw new Error('adresE2E: litera a-z');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(String(domena))) throw new Error('adresE2E: zła domena');
  return `e2e+${znacznikMinuty(teraz)}${litera}@${domena}`;
}

/**
 * Adres Preview (allowlista, fail-closed). `rola`: 'alias' = dokładnie `dev.mixturemarketing-stona.pages.dev`,
 * 'hash' = `<8 znaków hex>.mixturemarketing-stona.pages.dev` (małe litery). Tylko https, bez danych logowania,
 * portu (także jawnego :443), kropki na końcu, kodowania procentowego, odwrotnych ukośników, białych i
 * niedrukowalnych znaków; adres musi być czystym originem (opcjonalnie z końcowym `/`). Reszta = odmowa.
 * Zwraca {ok, origin, host} albo {ok:false, powod}. Pusty, zły adres albo nieznana rola = odmowa.
 */
export function sprawdzAdresPreview(adres, nazwa = 'adres', rola = '') {
  if (rola !== 'alias' && rola !== 'hash') return { ok: false, powod: `${nazwa}: nieznana rola adresu` };
  if (typeof adres !== 'string' || adres.trim() === '') return { ok: false, powod: `${nazwa}: pusty adres` };
  if (/[\s\\%\u0000-\u001f\u007f-\uffff]/.test(adres))
    return { ok: false, powod: `${nazwa}: niedozwolone znaki w adresie` };
  let u;
  try {
    u = new URL(adres);
  } catch {
    return { ok: false, powod: `${nazwa}: niepoprawny adres` };
  }
  if (u.protocol !== 'https:') return { ok: false, powod: `${nazwa}: wymagany https` };
  if (u.username !== '' || u.password !== '') return { ok: false, powod: `${nazwa}: dane logowania w adresie` };
  if (u.port !== '') return { ok: false, powod: `${nazwa}: nietypowy port` };
  const host = u.hostname;
  if (HOSTY_PRODUKCJI.includes(host) || host.endsWith('.mixturemarketing.pl'))
    return { ok: false, powod: `${nazwa}: to host produkcji (${host})` };
  if (rola === 'alias' && host !== ALIAS_PREVIEW)
    return { ok: false, powod: `${nazwa}: host inny niż alias ${ALIAS_PREVIEW} (pages.dev)` };
  if (rola === 'hash' && !WZORZEC_HASHA.test(host))
    return { ok: false, powod: `${nazwa}: host inny niż <8 hex>.mixturemarketing-stona.pages.dev` };
  if (adres !== u.origin && adres !== `${u.origin}/`)
    return { ok: false, powod: `${nazwa}: adres nie jest czystym originem (ścieżka, zapytanie, port, wielkość liter)` };
  return { ok: true, origin: u.origin, host };
}

/**
 * Decyzja strażnika ochrony: żądanie BEZ nagłówków Access. Za chronione liczy się wyłącznie
 * 302/303 z Location absolutnym `https://<etykiety>.cloudflareaccess.com/…` (bez danych logowania,
 * bez portu) albo 403. Wszystko inne (200, inne 3xx, 401, 5xx, błąd sieci, brak Location) = niechronione.
 * @param {{status?: unknown, location?: unknown, blad?: unknown}} o
 */
export function decyzjaOchrony(o) {
  if (!o || typeof o !== 'object') return { chroniony: false, powod: 'brak odpowiedzi' };
  if (o.blad) return { chroniony: false, powod: `błąd żądania: ${String(o.blad).slice(0, 120)}` };
  const s = o.status;
  if (!Number.isInteger(s)) return { chroniony: false, powod: 'brak kodu odpowiedzi' };
  if (s === 403) return { chroniony: true, powod: '403' };
  if (s !== 302 && s !== 303) return { chroniony: false, powod: `kod ${s} nie jest odmową Access` };
  if (typeof o.location !== 'string' || o.location.trim() === '')
    return { chroniony: false, powod: `kod ${s} bez nagłówka Location` };
  let u;
  try {
    u = new URL(o.location.trim()); // względny Location rzuca (brak bazy)
  } catch {
    return { chroniony: false, powod: `kod ${s}: Location nie jest bezwzględnym adresem` };
  }
  if (u.protocol !== 'https:') return { chroniony: false, powod: `kod ${s}: Location bez https` };
  if (u.username !== '' || u.password !== '' || u.port !== '')
    return { chroniony: false, powod: `kod ${s}: Location z danymi logowania lub portem` };
  if (!/^([a-z0-9-]+\.)+cloudflareaccess\.com$/.test(u.hostname))
    return { chroniony: false, powod: `kod ${s}: Location na obcy host (${u.hostname})` };
  return { chroniony: true, powod: `${s} → ${u.hostname}` };
}

/**
 * Decyzja dostępu: żądanie Z nagłówkami Access ma dojść do aplikacji, nie do strony Access.
 * Przepuszcza tylko 200 z JSON-em kontraktu pytań kalkulatora (`contractVersion` liczbą).
 */
export function decyzjaDostepu(o) {
  if (!o || typeof o !== 'object') return { dostep: false, powod: 'brak odpowiedzi' };
  if (o.blad) return { dostep: false, powod: `błąd żądania: ${String(o.blad).slice(0, 120)}` };
  if (o.status !== 200) return { dostep: false, powod: `kod ${o.status} zamiast 200 (Access nie przepuścił tokenu?)` };
  const json = o.json;
  if (!json || typeof json !== 'object' || typeof json.contractVersion !== 'number')
    return { dostep: false, powod: 'odpowiedź 200 bez JSON-a aplikacji (strona Access?)' };
  return { dostep: true, powod: 'aplikacja odpowiada' };
}

/** Dopasowanie tytułu zadania do przypadku. `wynik` = wynik audytu wysłany w (d). */
export function tytulPasuje(przypadek, tytul, wynik) {
  if (typeof tytul !== 'string') return false;
  switch (przypadek) {
    case 'a':
    case 'e':
    case 'f':
      return tytul === '[Preview] Lead: example.com — kontakt';
    case 'b':
      return tytul === '[Preview] Lead: osoba prywatna — kontakt';
    case 'c':
      return /^\[Preview\] Lead: example\.com — kalkulator: \S.* zł$/.test(tytul);
    case 'd':
      return tytul === `[Preview] Lead: example.com — audyt strony, wynik ${wynik}/100`;
    default:
      return false;
  }
}

/** Etykiety wymagane i zakazane dla przypadku. */
export function etykietyPrzypadku(przypadek) {
  switch (przypadek) {
    case 'a':
    case 'e':
    case 'f':
      return { wymagane: ['formularz', 'test'], zakazane: ['bez-firmy'] };
    case 'b':
      return { wymagane: ['formularz', 'bez-firmy', 'test'], zakazane: [] };
    case 'c':
      return { wymagane: ['kalkulator', 'test'], zakazane: ['bez-firmy'] };
    case 'd':
      return { wymagane: ['audyt', 'test'], zakazane: ['bez-firmy'] };
    default:
      return { wymagane: [], zakazane: [] };
  }
}

/** (b) idzie tylko przy Preview bez Resend (flaga E2E_BEZ_RESEND=1); inaczej mail poszedłby naprawdę. */
export function czyUruchomicB(env) {
  return env?.E2E_BEZ_RESEND === '1';
}

/**
 * Kod wyjścia i podsumowanie. 0 tylko gdy wszystkie 7 przypadków mają status `pass`.
 * Status `fail` albo nieznany = 1; `skip`/`brak` (bez porażek) = 3 (przebieg niepełny).
 */
export function podsumuj(wyniki) {
  const stany = PRZYPADKI.map((p) => [p, wyniki?.[p]?.status ?? 'brak']);
  const ok = stany.filter(([, s]) => s === 'pass').length;
  const zle = stany.filter(([, s]) => s !== 'pass' && s !== 'skip' && s !== 'brak');
  const niepelne = stany.filter(([, s]) => s === 'skip' || s === 'brak');
  const opis = stany.map(([p, s]) => `${p}=${s}`).join(' ');
  if (zle.length > 0) return { kod: 1, ok, linia: `${ok}/7, PORAŻKA: ${zle.map(([p]) => p).join(',')} (${opis})` };
  if (niepelne.length > 0)
    return { kod: 3, ok, linia: `${ok}/7, niepełny: ${niepelne.map(([p]) => p).join(',')} (${opis})` };
  return { kod: 0, ok, linia: `${ok}/7 (${opis})` };
}

/** Podpis POST /api/leady/ponow (zgodny z functions/api/crm/_podpis.ts, prefiks `leady-ponow:v1:`). */
export function podpisPonow(sekret, czasSek, nonce) {
  const tekst = `leady-ponow:v1:${czasSek}.${nonce}.POST /api/leady/ponow`;
  return `sha256=${crypto.createHmac('sha256', sekret).update(tekst).digest('hex')}`;
}

/** Znacznik czasu do nazwy raportu: RRRRMMDDTGGMMSSZ (UTC). */
export function znacznikPliku(teraz) {
  return `${znacznikMinuty(teraz).slice(0, 8)}T${dwie(teraz.getUTCHours())}${dwie(teraz.getUTCMinutes())}${dwie(teraz.getUTCSeconds())}Z`;
}

/** Raport w Markdown: SHA, czasy (a)–(d), liczba zadań przed i po. Tylko id i liczby, bez danych osobowych. */
export function zbudujRaport({ sha, host, znacznik, wyniki, przed, po, podsumowanie }) {
  const w = (p) => wyniki?.[p] ?? { status: 'brak' };
  const linie = [
    `# Raport e2e leady → Linear (${znacznik})`,
    '',
    `- SHA wdrożenia: ${sha || 'nieznany'}`,
    `- Host Preview: ${host || 'nieznany'}`,
    `- Zadania w LEA przed: ${przed ?? 'n/d'}, po: ${po ?? 'n/d'}`,
    `- Wynik: ${podsumowanie.linia} (kod ${podsumowanie.kod})`,
    '',
    '| przypadek | status | sekundy od POST do zadania | zadanie | uwaga |',
    '|---|---|---|---|---|',
  ];
  for (const p of PRZYPADKI) {
    const x = w(p);
    linie.push(
      `| ${p} | ${x.status} | ${x.sekundy ?? ''} | ${x.zadanie ?? ''} | ${String(x.powod ?? '').replace(/\|/g, '/')} |`,
    );
  }
  linie.push(
    '',
    'Poza zakresem skryptu (sprawdza człowiek w Linearze): Customer Request do example.com w (a),',
    'brak Customer Request w (b), jeden klient example.com po (a) i (e).',
    '',
  );
  return linie.join('\n');
}

/** Odpytywanie z limitem czasu: `probuj` zwraca wynik albo null. Zwraca {wynik, sekundy} albo null po limicie. */
export async function czekaj({
  probuj,
  start,
  now,
  sleep,
  timeoutMs = TIMEOUT_PRZYPADKU_MS,
  krokMs = KROK_ODPYTYWANIA_MS,
}) {
  for (;;) {
    const wynik = await probuj();
    if (wynik) return { wynik, sekundy: Math.round((now() - start) / 100) / 10 };
    if (now() - start >= timeoutMs) return null;
    await sleep(krokMs);
  }
}

// ---------------------------------------------------------------------------------------------
// Linear przez `lin` (wstrzykiwalny runner: (args: string[]) => Promise<string>)
// ---------------------------------------------------------------------------------------------

export function uruchomLin(args) {
  return new Promise((resolve, reject) => {
    execFile('lin', args, { timeout: 60_000, maxBuffer: 8 * 1024 * 1024 }, (err, stdout) => {
      if (err) reject(new Error(`lin ${args[0]}: ${String(err.message).split('\n')[0]}`));
      else resolve(String(stdout));
    });
  });
}

/** Wszystkie zadania zespołu LEA (migawka). Niepełna albo nieczytelna lista = błąd (fail-closed). */
export async function pobierzZadania(lin) {
  const out = await lin(['lista', '--zespol', 'LEA', '--json', '--limit', String(LIMIT_LISTY)]);
  let obj;
  try {
    obj = JSON.parse(out);
  } catch {
    throw new Error('lin lista: odpowiedź nie jest JSON-em');
  }
  if (!obj || !Array.isArray(obj.zadania)) throw new Error('lin lista: brak pola zadania');
  if (obj.limit_osiagniety || obj.zadania.length >= LIMIT_LISTY)
    throw new Error(`lin lista: limit ${LIMIT_LISTY} osiągnięty, migawka niepełna`);
  for (const z of obj.zadania) {
    if (!z || typeof z.id !== 'string' || typeof z.tytul !== 'string')
      throw new Error('lin lista: zadanie bez id albo tytułu');
  }
  return obj.zadania.map((z) => ({ ...z, etykiety: Array.isArray(z.etykiety) ? z.etykiety : [] }));
}

async function komentarzeZadania(lin, id) {
  const out = await lin(['komentarze', id, '--json']);
  let arr;
  try {
    arr = JSON.parse(out);
  } catch {
    throw new Error('lin komentarze: odpowiedź nie jest JSON-em');
  }
  if (!Array.isArray(arr)) throw new Error('lin komentarze: oczekiwano tablicy');
  return arr;
}

// ---------------------------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------------------------

/** Pojedyncze żądanie: nigdy nie rzuca; błąd sieci i limit czasu trafiają do pola `blad`. */
export async function zapytaj(ctx, url, opcje = {}) {
  try {
    const odp = await ctx.fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(ctx.timeoutZapytaniaMs ?? TIMEOUT_ZAPYTANIA_MS),
      ...opcje,
    });
    let tekst = '';
    try {
      tekst = await odp.text();
    } catch {
      tekst = '';
    }
    let json = null;
    try {
      json = JSON.parse(tekst);
    } catch {
      json = null;
    }
    return {
      status: odp.status,
      location: odp.headers?.get?.('location') ?? null,
      json,
    };
  } catch (e) {
    return { blad: maskuj(e instanceof Error ? e.message : String(e), ctx.sekrety) };
  }
}

const naglowkiAccess = (ctx) => ({
  'CF-Access-Client-Id': ctx.accessId,
  'CF-Access-Client-Secret': ctx.accessSecret,
});

/**
 * Strażnik ochrony Preview (Z3, allowlista, fail-closed). Przed jakimkolwiek POST:
 *  1) adresy przypięte: alias dev.mixturemarketing-stona.pages.dev i <8 hex>.mixturemarketing-stona.pages.dev;
 *  2) są dane Access;
 *  3) żądanie BEZ nagłówków do aliasu i do linku z hashem = tylko 302/303 na cloudflareaccess.com albo 403;
 *  4) żądanie Z nagłówkami dochodzi do aplikacji.
 * Zwraca {ok, powody[]}; ok=false = „Preview bez ochrony” (albo brak konfiguracji).
 */
export async function sprawdzOchrone(ctx) {
  const powody = [];
  const baza = sprawdzAdresPreview(ctx.baseUrl, 'E2E_BASE_URL', 'alias');
  const hash = sprawdzAdresPreview(ctx.hashUrl, 'link z hashem (E2E_HASH_URL)', 'hash');
  if (!baza.ok) powody.push(baza.powod);
  if (!hash.ok) powody.push(hash.powod);
  if (!ctx.accessId || !ctx.accessSecret) powody.push('brak CF_ACCESS_CLIENT_ID / CF_ACCESS_CLIENT_SECRET w env');
  if (powody.length > 0) return { ok: false, powody };

  for (const [nazwa, adres] of [
    ['alias dev.', baza.origin],
    ['link z hashem', hash.origin],
  ]) {
    const d = decyzjaOchrony(await zapytaj(ctx, `${adres}/`));
    if (!d.chroniony) powody.push(`${nazwa} bez nagłówków Access: ${d.powod}`);
  }
  if (powody.length > 0) return { ok: false, powody };

  const z = await zapytaj(ctx, `${baza.origin}/api/estimation/public-questions`, {
    headers: naglowkiAccess(ctx),
  });
  const dostep = decyzjaDostepu(z);
  if (!dostep.dostep) return { ok: false, powody: [`z nagłówkami Access: ${dostep.powod}`] };
  return { ok: true, powody: [] };
}

async function postJson(ctx, sciezka, cialo, dodatkowe = {}) {
  return zapytaj(ctx, `${ctx.origin}${sciezka}`, {
    method: 'POST',
    headers: { ...naglowkiAccess(ctx), 'Content-Type': 'application/json', ...dodatkowe },
    body: typeof cialo === 'string' ? cialo : JSON.stringify(cialo),
  });
}

// ---------------------------------------------------------------------------------------------
// Wejścia (pola z kodu functions/api/…)
// ---------------------------------------------------------------------------------------------

/** contact-submit, action create: wymagane name, email, phone, service_interest, captcha_token + source_url. */
export function wyslijFormularz(ctx, adres) {
  return postJson(ctx, '/api/contact-submit', {
    action: 'create',
    lead: {
      name: 'E2E Test',
      email: adres,
      phone: '000000000',
      service_interest: 'general',
      captcha_token: TOKEN_TURNSTILE,
    },
    source_url: `${ctx.origin}/kontakt`,
  });
}

/** public-quote: wymagane email, captcha_token, answers.project_goal (wartość z public-questions, gdy dostępna). */
export async function wyslijKalkulator(ctx, adres) {
  let cel = 'website';
  const pytania = await zapytaj(ctx, `${ctx.origin}/api/estimation/public-questions`, {
    headers: naglowkiAccess(ctx),
  });
  const q = pytania.json?.questions?.find?.((x) => x?.code === 'project_goal');
  const pierwsza = q?.options?.[0]?.value;
  if (typeof pierwsza === 'string' && pierwsza !== '') cel = pierwsza;
  return postJson(ctx, '/api/estimation/public-quote', {
    answers: { project_goal: cel },
    email: adres,
    captcha_token: TOKEN_TURNSTILE,
  });
}

/** capture-lead: multipart email, url, companyName, score, captcha_token, pdf (1 strona). */
export function wyslijAudyt(ctx, adres, wynik) {
  const fd = new FormData();
  fd.set('email', adres);
  fd.set('url', 'https://example.com');
  fd.set('companyName', 'E2E Test');
  fd.set('score', String(wynik));
  fd.set('captcha_token', TOKEN_TURNSTILE);
  fd.set('pdf', new Blob([PDF_1_STRONA], { type: 'application/pdf' }), 'audyt.pdf');
  return zapytaj(ctx, `${ctx.origin}/api/audit/capture-lead`, {
    method: 'POST',
    headers: naglowkiAccess(ctx),
    body: fd,
  });
}

/** POST /api/leady/ponow (jeden raz), podpisany sekretem Preview. */
export async function ponow(ctx) {
  if (!ctx.ponowSekret) return { blad: 'brak E2E_PONOW_SECRET w env' };
  const czas = String(Math.floor(ctx.now() / 1000));
  const nonce = crypto.randomUUID();
  return postJson(ctx, '/api/leady/ponow', '{}', {
    'X-Mixture-Timestamp': czas,
    'X-Mixture-Nonce': nonce,
    'X-Mixture-Signature': podpisPonow(ctx.ponowSekret, czas, nonce),
  });
}

// ---------------------------------------------------------------------------------------------
// Przypadki
// ---------------------------------------------------------------------------------------------

const odpowiedzOk = (o) => o && !o.blad && o.status === 200;
const opisBledu = (ctx, o) => maskuj(o?.blad ?? `HTTP ${o?.status}`, ctx.sekrety);

function sprawdzZadanie(przypadek, z) {
  const { wymagane, zakazane } = etykietyPrzypadku(przypadek);
  if (z.kto !== PROWADZACY) return `zadanie ${z.id} nie jest przypisane do ${PROWADZACY} (kto=${z.kto})`;
  const brak = wymagane.filter((e) => !z.etykiety.includes(e));
  if (brak.length) return `zadanie ${z.id}: brak etykiet ${brak.join(',')}`;
  const nadmiar = zakazane.filter((e) => z.etykiety.includes(e));
  if (nadmiar.length) return `zadanie ${z.id}: niepożądane etykiety ${nadmiar.join(',')}`;
  return null;
}

/** Wspólny szkielet (a)–(d): migawka, POST, odpytywanie `lin`, kontrola tytułu, przypisania i etykiet. */
async function przypadekZZadaniem(ctx, id, wyslij, wynikAudytu) {
  const przed = new Set((await pobierzZadania(ctx.lin)).map((z) => z.id));
  const start = ctx.now();
  const odp = await wyslij();
  if (!odpowiedzOk(odp)) return { status: 'fail', powod: `POST: ${opisBledu(ctx, odp)}` };
  const znalezione = await czekaj({
    start,
    now: ctx.now,
    sleep: ctx.sleep,
    timeoutMs: ctx.timeoutPrzypadkuMs,
    krokMs: ctx.krokMs,
    probuj: async () => {
      const nowe = (await pobierzZadania(ctx.lin)).filter(
        (z) => !przed.has(z.id) && tytulPasuje(id, z.tytul, wynikAudytu),
      );
      return nowe.length > 0 ? nowe : null;
    },
  });
  if (!znalezione) return { status: 'fail', powod: 'brak zadania w limicie czasu' };
  const nowe = znalezione.wynik;
  for (const z of nowe) ctx.utworzone.add(z.id);
  if (nowe.length !== 1) return { status: 'fail', powod: `oczekiwano 1 zadania, jest ${nowe.length}`, sekundy: znalezione.sekundy };
  const uwaga = sprawdzZadanie(id, nowe[0]);
  if (uwaga) return { status: 'fail', powod: uwaga, sekundy: znalezione.sekundy, zadanie: nowe[0].id };
  return { status: 'pass', sekundy: znalezione.sekundy, zadanie: nowe[0].id, powod: '' };
}

export const przypadekA = (ctx) =>
  przypadekZZadaniem(ctx, 'a', () => wyslijFormularz(ctx, ctx.adres('a')));

export async function przypadekB(ctx) {
  if (!czyUruchomicB(ctx.env)) return { status: 'skip', powod: 'Preview ma Resend (brak E2E_BEZ_RESEND=1)' };
  return przypadekZZadaniem(ctx, 'b', () => wyslijFormularz(ctx, ctx.adres('b', 'gmail.com')));
}

export const przypadekC = (ctx) =>
  przypadekZZadaniem(ctx, 'c', () => wyslijKalkulator(ctx, ctx.adres('c')));

export const przypadekD = (ctx) =>
  przypadekZZadaniem(ctx, 'd', () => wyslijAudyt(ctx, ctx.adres('d'), ctx.wynikAudytu), ctx.wynikAudytu);

/** (e): dwa leady z jednego adresu = 1 zadanie i 1 komentarz „Kolejny lead…”, bez drugiego zadania. */
export async function przypadekE(ctx) {
  const adres = ctx.adres('e');
  const pierwszy = await przypadekZZadaniem(ctx, 'e', () => wyslijFormularz(ctx, adres));
  if (pierwszy.status !== 'pass') return pierwszy;
  const przedIds = new Set((await pobierzZadania(ctx.lin)).map((z) => z.id));
  const start = ctx.now();
  const odp = await wyslijFormularz(ctx, adres);
  if (!odpowiedzOk(odp)) return { ...pierwszy, status: 'fail', powod: `drugi POST: ${opisBledu(ctx, odp)}` };
  const komentarz = await czekaj({
    start,
    now: ctx.now,
    sleep: ctx.sleep,
    timeoutMs: ctx.timeoutPrzypadkuMs,
    krokMs: ctx.krokMs,
    probuj: async () => {
      const k = (await komentarzeZadania(ctx.lin, pierwszy.zadanie)).filter(
        (c) => typeof c?.tresc === 'string' && c.tresc.includes('Kolejny lead z tego adresu'),
      );
      return k.length > 0 ? k : null;
    },
  });
  if (!komentarz) return { ...pierwszy, status: 'fail', powod: 'brak komentarza o drugim leadzie w limicie czasu' };
  if (komentarz.wynik.length !== 1)
    return { ...pierwszy, status: 'fail', powod: `oczekiwano 1 komentarza, jest ${komentarz.wynik.length}` };
  // Liczą się tylko zadania z przedrostkiem Preview powstałe po drugim POST (lead z produkcji nie jest z tego biegu).
  const nowe = (await pobierzZadania(ctx.lin)).filter(
    (z) => !przedIds.has(z.id) && z.tytul.startsWith(PRZEDROSTEK_TYTULU),
  );
  for (const z of nowe) ctx.utworzone.add(z.id);
  if (nowe.length > 0)
    return { ...pierwszy, status: 'fail', powod: `drugi lead utworzył zadanie (nowych zadań Preview: ${nowe.length})` };
  return pierwszy;
}

/** Plik stanu faz (f): tylko id zadań, liczby i statusy. */
export function sciezkaStanuF(katalog = KATALOG_WYNIKOW) {
  return path.join(katalog, 'f-stan.json');
}

/** (f1): po zepsuciu klucza Lineara lead trafia do kolejki: `w_kolejce=1`, `ponowione=0`, zero nowych zadań. */
export async function fazaF1(ctx) {
  if (!ctx.sha) return { status: 'fail', powod: 'brak E2E_SHA (--sha): stan faz f jest związany z SHA wdrożenia' };
  const przed = (await pobierzZadania(ctx.lin)).map((z) => z.id);
  const odp = await wyslijFormularz(ctx, ctx.adres('f'));
  if (!odpowiedzOk(odp)) return { status: 'fail', powod: `POST: ${opisBledu(ctx, odp)}` };
  // Lead trafia do Lineara w waitUntil, więc kolejka może pojawić się chwilę po POST: do PROBY_PONOW prób co krokMs.
  let p;
  for (let proba = 1; proba <= PROBY_PONOW; proba++) {
    p = await ponow(ctx);
    if (!odpowiedzOk(p) || !p.json) return { status: 'fail', powod: `ponow: ${opisBledu(ctx, p)}` };
    if (p.json.w_kolejce !== 0 || p.json.ponowione !== 0) break;
    if (proba < PROBY_PONOW) await ctx.sleep(ctx.krokMs);
  }
  const po = (await pobierzZadania(ctx.lin)).filter(
    (z) => !przed.includes(z.id) && tytulPasuje('f', z.tytul),
  );
  for (const z of po) ctx.utworzone.add(z.id);
  const uwagi = [];
  if (p.json.w_kolejce !== 1) uwagi.push(`w_kolejce=${p.json.w_kolejce}, oczekiwano 1`);
  if (p.json.ponowione !== 0) uwagi.push(`ponowione=${p.json.ponowione}, oczekiwano 0`);
  if (po.length !== 0) uwagi.push(`powstało ${po.length} zadań mimo zepsutego klucza`);
  const stan = {
    f1: uwagi.length === 0 ? 'pass' : 'fail',
    f2: null,
    sha: ctx.sha,
    przed,
    zadania: po.map((z) => z.id),
    ts: ctx.now(),
  };
  ctx.zapiszStan(stan);
  return uwagi.length === 0
    ? { status: 'pass', powod: 'w_kolejce=1' }
    : { status: 'fail', powod: uwagi.join('; ') };
}

/** (f2): po naprawie klucza jedno POST ponow → `ponowione=1` i dokładnie 1 zadanie (nie 2). */
export async function fazaF2(ctx) {
  const stan = ctx.wczytajStan();
  const wiazanie = sprawdzWiazanieStanu(stan, ctx);
  if (wiazanie) return { status: 'fail', powod: wiazanie };
  if (stan.f1 !== 'pass' || !Array.isArray(stan.przed))
    return { status: 'fail', powod: 'brak zaliczonej fazy f1 (plik stanu)' };
  const przed = new Set(stan.przed);
  const start = ctx.now();
  const p = await ponow(ctx);
  if (!odpowiedzOk(p) || !p.json) return { status: 'fail', powod: `ponow: ${opisBledu(ctx, p)}` };
  if (p.json.ponowione !== 1)
    return {
      status: 'fail',
      powod: `ponowione=${p.json.ponowione}, oczekiwano 1 (jeśli 0 a w_kolejce=${p.json.w_kolejce}: odstęp ponowienia jeszcze nie minął)`,
    };
  const nowe = await czekaj({
    start,
    now: ctx.now,
    sleep: ctx.sleep,
    timeoutMs: ctx.timeoutPrzypadkuMs,
    krokMs: ctx.krokMs,
    probuj: async () => {
      const z = (await pobierzZadania(ctx.lin)).filter(
        (x) => !przed.has(x.id) && tytulPasuje('f', x.tytul),
      );
      return z.length > 0 ? z : null;
    },
  });
  if (!nowe) return { status: 'fail', powod: 'brak zadania po ponowieniu w limicie czasu' };
  await ctx.sleep(ctx.krokMs);
  const koniec = (await pobierzZadania(ctx.lin)).filter(
    (x) => !przed.has(x.id) && tytulPasuje('f', x.tytul),
  );
  for (const z of koniec) ctx.utworzone.add(z.id);
  if (koniec.length !== 1) return { status: 'fail', powod: `oczekiwano dokładnie 1 zadania, jest ${koniec.length}` };
  const uwaga = sprawdzZadanie('f', koniec[0]);
  if (uwaga) return { status: 'fail', powod: uwaga, zadanie: koniec[0].id };
  ctx.zapiszStan({
    ...stan,
    f2: 'pass',
    zadanie: koniec[0].id,
    zadania: [...new Set([...(stan.zadania ?? []), ...koniec.map((z) => z.id)])],
  });
  return { status: 'pass', sekundy: nowe.sekundy, zadanie: koniec[0].id, powod: 'ponowione=1, 1 zadanie' };
}

/**
 * Wiązanie stanu faz f z tym wdrożeniem (fail-closed): zwraca linię powodu albo null, gdy stan jest
 * obiektem, ma SHA równy ctx.sha (niepusty) i znacznik czasu młodszy niż 24 h (nie z przyszłości).
 */
export function sprawdzWiazanieStanu(stan, ctx) {
  if (stan === null || stan === undefined) return 'brak pliku stanu faz f1/f2 (najpierw --faza f1, potem f2)';
  if (typeof stan !== 'object' || Array.isArray(stan) || stan.nieczytelny)
    return 'plik stanu faz f jest nieczytelny (nie jest obiektem JSON)';
  if (!ctx?.sha) return 'brak E2E_SHA (--sha): nie da się związać stanu faz f z wdrożeniem';
  if (stan.sha !== ctx.sha) return 'stan faz f pochodzi z innego SHA niż E2E_SHA';
  if (typeof stan.ts !== 'number' || !Number.isFinite(stan.ts)) return 'stan faz f bez znacznika czasu';
  const wiek = ctx.now() - stan.ts;
  if (wiek < 0) return 'stan faz f ma znacznik czasu z przyszłości';
  if (wiek >= WAZNOSC_STANU_F_MS) return 'stan faz f starszy niż 24 h (powtórz f1 i f2)';
  return null;
}

/** Wynik (f) z pliku stanu: pass tylko gdy stan jest związany z SHA i świeży oraz zapisano f1 i f2 jako pass. */
export function wynikF(stan, ctx) {
  const powod = sprawdzWiazanieStanu(stan, ctx);
  if (powod) return { status: 'fail', powod };
  if (stan.f1 !== 'pass') return { status: stan.f1 ? 'fail' : 'brak', powod: 'faza f1 niezaliczona' };
  if (stan.f2 !== 'pass') return { status: 'brak', powod: 'faza f2 niewykonana' };
  return { status: 'pass', zadanie: stan.zadanie, powod: 'f1 i f2' };
}

/** (g): wszystkie zadania z biegu → Canceled z etykietą `test`; potem kontrola stanu. */
export async function sprzatanie(ctx, ids) {
  const lista = [...ids];
  if (lista.length === 0) return { status: 'pass', powod: 'brak zadań do sprzątnięcia' };
  const bledy = [];
  const teraz = await pobierzZadania(ctx.lin);
  for (const id of lista) {
    const z = teraz.find((x) => x.id === id);
    try {
      if (!z || !z.etykiety.includes('test')) await ctx.lin(['etykieta', id, '+test']);
      if (!z || z.stan !== 'Canceled') await ctx.lin(['stan', id, 'Canceled']);
    } catch (e) {
      bledy.push(`${id}: ${maskuj(e.message, ctx.sekrety)}`);
    }
  }
  const po = await pobierzZadania(ctx.lin);
  for (const id of lista) {
    const z = po.find((x) => x.id === id);
    if (!z) bledy.push(`${id}: zniknęło z listy`);
    else if (z.stan !== 'Canceled' || !z.etykiety.includes('test'))
      bledy.push(`${id}: stan=${z.stan}, etykiety bez test=${!z.etykiety.includes('test')}`);
  }
  return bledy.length === 0
    ? { status: 'pass', powod: `${lista.length} zadań Canceled z etykietą test` }
    : { status: 'fail', powod: bledy.join('; ') };
}

// ---------------------------------------------------------------------------------------------
// Przebieg
// ---------------------------------------------------------------------------------------------

/** Kontekst z env i wstrzykniętych zależności (fetch, lin, zegar, system plików). */
export function zbudujKontekst({ env = {}, argv = {}, deps = {} }) {
  const baseUrl = env.E2E_BASE_URL ?? DOMYSLNY_BASE_URL;
  const baza = sprawdzAdresPreview(baseUrl, 'E2E_BASE_URL', 'alias');
  const teraz = deps.teraz ?? (() => new Date());
  const start = teraz();
  const sekrety = [env.CF_ACCESS_CLIENT_ID, env.CF_ACCESS_CLIENT_SECRET, env.E2E_PONOW_SECRET].filter(Boolean);
  return {
    env,
    baseUrl,
    origin: baza.ok ? baza.origin : '',
    hashUrl: argv.hashUrl ?? env.E2E_HASH_URL ?? '',
    sha: argv.sha ?? env.E2E_SHA ?? '',
    accessId: env.CF_ACCESS_CLIENT_ID ?? '',
    accessSecret: env.CF_ACCESS_CLIENT_SECRET ?? '',
    ponowSekret: env.E2E_PONOW_SECRET ?? '',
    sekrety,
    fetch: deps.fetch ?? globalThis.fetch,
    lin: deps.lin ?? uruchomLin,
    now: deps.now ?? (() => Date.now()),
    sleep: deps.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms))),
    adres: (litera, domena) => adresE2E(start, litera, domena),
    wynikAudytu: 73,
    utworzone: new Set(),
    timeoutPrzypadkuMs: deps.timeoutPrzypadkuMs ?? TIMEOUT_PRZYPADKU_MS,
    krokMs: deps.krokMs ?? KROK_ODPYTYWANIA_MS,
    timeoutZapytaniaMs: deps.timeoutZapytaniaMs,
    wczytajStan: deps.wczytajStan ?? (() => null),
    zapiszStan: deps.zapiszStan ?? (() => {}),
    zapiszRaport: deps.zapiszRaport ?? (() => {}),
    log: deps.log ?? ((t) => console.log(t)),
    teraz,
  };
}

async function bezpiecznie(ctx, nazwa, fn) {
  try {
    return await fn();
  } catch (e) {
    return { status: 'fail', powod: `${nazwa}: ${maskuj(e instanceof Error ? e.message : String(e), ctx.sekrety)}` };
  }
}

/** Pełny przebieg. Zwraca {kod, wyniki, linia}. Przed jakimkolwiek POST działa strażnik ochrony. */
export async function przebieg(ctx, { faza = null } = {}) {
  const ochrona = await sprawdzOchrone(ctx);
  if (!ochrona.ok) {
    const linia = `Preview bez ochrony: ${ochrona.powody.map((p) => maskuj(p, ctx.sekrety)).join('; ')}`;
    ctx.log(linia);
    return { kod: 2, wyniki: {}, linia };
  }
  const wyniki = {};
  let przed = null;
  let po = null;
  if (faza === 'f1' || faza === 'f2') {
    wyniki.f = await bezpiecznie(ctx, faza, () => (faza === 'f1' ? fazaF1(ctx) : fazaF2(ctx)));
    ctx.log(`(${faza}) ${wyniki.f.status} ${wyniki.f.powod ?? ''}`);
    const kod = wyniki.f.status === 'pass' ? 0 : 1;
    return { kod, wyniki, linia: `faza ${faza}: ${wyniki.f.status}` };
  }
  // Migawka przed biegiem: liczba zadań i ich id (do sprzątania zadań, których przypadek nie zdążył zarejestrować).
  let migawka = null;
  try {
    migawka = new Set((await pobierzZadania(ctx.lin)).map((z) => z.id));
    przed = migawka.size;
  } catch (e) {
    ctx.log(`lista przed: ${maskuj(e.message, ctx.sekrety)}`);
  }
  const kroki = [
    ['a', przypadekA],
    ['b', przypadekB],
    ['c', przypadekC],
    ['d', przypadekD],
    ['e', przypadekE],
  ];
  for (const [p, fn] of kroki) {
    wyniki[p] = await bezpiecznie(ctx, p, () => fn(ctx));
    ctx.log(`(${p}) ${wyniki[p].status}${wyniki[p].sekundy !== undefined ? ` ${wyniki[p].sekundy} s` : ''} ${wyniki[p].powod ?? ''}`);
  }
  const stanF = ctx.wczytajStan();
  wyniki.f = wynikF(stanF, ctx);
  const doSprzatania = new Set(ctx.utworzone);
  // Id z pliku stanu f tylko gdy stan jest związany z tym SHA i świeży (fail-closed: inaczej ignorowane z linią powodu).
  const powodStanu = sprawdzWiazanieStanu(stanF, ctx);
  if (powodStanu) {
    ctx.log(`(g) id zadań z pliku stanu f pominięte: ${powodStanu}`);
  } else {
    const kandydaci = [
      ...(Array.isArray(stanF.zadania) ? stanF.zadania : []),
      ...(stanF.zadanie !== undefined && stanF.zadanie !== null ? [stanF.zadanie] : []),
    ];
    for (const id of kandydaci) {
      if (typeof id === 'string' && ID_ZADANIA.test(id)) doSprzatania.add(id);
      else ctx.log(`(g) niepoprawne id w pliku stanu f pominięte (typ ${typeof id})`);
    }
  }
  wyniki.g = await bezpiecznie(ctx, 'g', async () => {
    // Każde nowe zadanie z przedrostkiem [Preview] Lead: powstałe w trakcie biegu też jest z tego biegu.
    if (migawka) {
      for (const z of await pobierzZadania(ctx.lin))
        if (!migawka.has(z.id) && z.tytul.startsWith(PRZEDROSTEK_TYTULU)) doSprzatania.add(z.id);
    }
    return sprzatanie(ctx, doSprzatania);
  });
  po = await bezpiecznie(ctx, 'lista po', async () => (await pobierzZadania(ctx.lin)).length);
  const pod = podsumuj(wyniki);
  ctx.log(`Wynik: ${pod.linia}`);
  ctx.zapiszRaport(
    zbudujRaport({
      sha: ctx.sha,
      host: hostBazy(ctx),
      znacznik: znacznikPliku(ctx.teraz()),
      wyniki,
      przed: typeof przed === 'number' ? przed : null,
      po: typeof po === 'number' ? po : null,
      podsumowanie: pod,
    }),
  );
  return { kod: pod.kod, wyniki, linia: pod.linia };
}

function hostBazy(ctx) {
  const a = sprawdzAdresPreview(ctx.baseUrl, 'E2E_BASE_URL', 'alias');
  return a.ok ? a.host : '';
}

export function czytajArgumenty(argv) {
  const out = { faza: null, sha: undefined, hashUrl: undefined, blad: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--faza') out.faza = argv[++i] ?? '';
    else if (a === '--sha') out.sha = argv[++i];
    else if (a === '--hash-url') out.hashUrl = argv[++i];
    else out.blad = `nieznany argument: ${a}`;
  }
  if (out.faza !== null && !['f1', 'f2'].includes(out.faza)) out.blad = `--faza: dozwolone f1 albo f2`;
  return out;
}

/** Komunikat błędu bez wartości sekretów z env (pierwsza linia, zamaskowana). */
export function komunikatBledu(e, env = {}) {
  const sek = [env.CF_ACCESS_CLIENT_ID, env.CF_ACCESS_CLIENT_SECRET, env.E2E_PONOW_SECRET].filter(Boolean);
  return `${PRZEDROSTEK_BLEDU}${maskuj(String(e?.message ?? e).split('\n')[0], sek)}`;
}

/** Odczyt pliku stanu: brak pliku = null, nieczytelny albo nie-obiekt = {nieczytelny:true} (fail-closed w wynikF). */
export function wczytajPlikStanu(sciezka, czytaj = (p) => fs.readFileSync(p, 'utf8')) {
  let tekst;
  try {
    tekst = czytaj(sciezka);
  } catch (e) {
    return e?.code === 'ENOENT' ? null : { nieczytelny: true };
  }
  try {
    const obj = JSON.parse(tekst);
    return obj && typeof obj === 'object' && !Array.isArray(obj) ? obj : { nieczytelny: true };
  } catch {
    return { nieczytelny: true };
  }
}

async function main() {
  const args = czytajArgumenty(process.argv.slice(2));
  if (args.blad) {
    console.error(maskuj(args.blad, [process.env.CF_ACCESS_CLIENT_ID, process.env.CF_ACCESS_CLIENT_SECRET, process.env.E2E_PONOW_SECRET]));
    process.exit(2);
  }
  const katalog = KATALOG_WYNIKOW;
  const plikStanu = sciezkaStanuF(katalog);
  const deps = {
    wczytajStan: () => wczytajPlikStanu(plikStanu),
    zapiszStan: (s) => {
      fs.mkdirSync(katalog, { recursive: true });
      const stary = wczytajPlikStanu(plikStanu);
      const baza = stary && !stary.nieczytelny ? stary : {};
      fs.writeFileSync(plikStanu, JSON.stringify({ ...baza, ...s }, null, 2));
    },
    zapiszRaport: (tekst) => {
      fs.mkdirSync(katalog, { recursive: true });
      const plik = path.join(katalog, `${znacznikPliku(new Date())}.md`);
      fs.writeFileSync(plik, tekst);
      console.log(`Raport: ${plik}`);
    },
  };
  const ctx = zbudujKontekst({ env: process.env, argv: args, deps });
  const wynik = await przebieg(ctx, { faza: args.faza });
  process.exit(wynik.kod);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(komunikatBledu(e, process.env));
    process.exit(1);
  });
}
