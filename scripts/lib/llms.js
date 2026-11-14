// Strażnik public/llms.txt (MIX-1657, przeprojektowanie MIX-1273 po regule 73): gramatyka linii jako
// allowlista. Każda linia musi pasować do jednej dozwolonej formy, inaczej odmowa z numerem linii
// i powodem (fail-closed). Czyste funkcje; CLI: scripts/check-llms.mjs, test: tests/seo/llmsTxt.test.ts.
//
// Dozwolone formy (po kontroli znaków; tekst = NFKC, małe litery, bez tokenu adresu):
//   1. nagłówek `# tekst` albo `## tekst`
//   2. linia pusta (dokładnie pusta; same odstępy = odmowa)
//   3. opis `> tekst`
//   4. odnośnik `- [tekst](https://mixturemarketing.pl/<ścieżka>)` z opcjonalnym `: opis`,
//      także jako podpunkt z wcięciem 2 spacji
//   5. punkt listy bez odnośnika `- tekst` (wcięcie 0 albo 2 spacje)
//   6. akapit zaczynający się literą, cyfrą albo `*`
// Do tego skan całego pliku (NFKC, małe litery, też po dekodowaniu %XX i bez odstępów) na każdą
// ścieżkę z prerenderOnlyRoutes, ze slashem na końcu i bez.

export const BASE_URL = 'https://mixturemarketing.pl';
export const HOST = 'mixturemarketing.pl';

/** Adresy spoza sitemapy, które llms.txt wolno wskazywać (allowlista, dokładna ścieżka). */
export const MACHINE_ALLOW = ['/sitemap.xml'];

/** Najdłuższa dozwolona linia (punkty kodowe); najdłuższa w pliku 13.11: 570 (English summary). */
export const MAX_LINE = 600;

/**
 * Słowa z kropką dozwolone w tekście (dokładnie, po NFKC i małych literach). Każde inne słowo
 * z kropką między literami/cyframi (`evil.example`, `www.x`, `1.2.3.4`) to token hosta = odmowa.
 */
export const DOTTED_ALLOW = [
  'info@mixturemarketing.pl',
  'medusa.js',
  'next.js',
  'o.o',
  'sitemap.xml',
];

/**
 * Strony kluczowe, które muszą być w llms.txt: dodane do sitemapy po 489c6b1 (hub branż,
 * dwie branże, kalkulator wyceny) oraz strony, które asystenci AI mają polecać (o nas,
 * lokalne SEO i agencja interaktywna, abonament). Ukryta strona usługi AI (MIX-1272)
 * NIE jest kluczowa: jest noindex i poza sitemapą.
 */
export const KEY_PATHS = [
  '/wycena/',
  '/branza/',
  '/branza/saas-startups/',
  '/branza/uslugi-b2b/',
  '/o-nas/',
  '/abonament/',
  '/agencja-seo-rzeszow/',
  '/agencja-interaktywna-rzeszow/',
];

/** Jedno miejsce normalizacji Unicode (NFKC: pełna szerokość, ligatury, indeksy górne → ASCII). */
export const norm = (s) => String(s).normalize('NFKC');

/** Znaki odrzucane wszędzie: sterujące (też CR i tab), formatujące (ZWSP, ZWJ, BOM, RLO, miękki
 * dywiz), prywatne, nieprzypisane, surogaty, separatory linii/akapitu, domyślnie ignorowane. */
const BAD_CHAR_RE = /[\p{Cc}\p{Cf}\p{Co}\p{Cn}\p{Cs}\p{Zl}\p{Zp}\p{Default_Ignorable_Code_Point}]/u;

/** Reguły tekstu (na NFKC, małe litery): pierwsza pasująca daje powód odmowy. */
const TEXT_RULES = [
  [/\/\//, 'podwójny ukośnik (//)'],
  [/:\S/, 'dwukropek bez odstępu po nim (schemat adresu)'],
  [/[\\<>[\]]/, 'znak niedozwolony w tekście (\\ < > [ ])'],
  [/&[#\p{L}\p{N}]/u, 'encja HTML (&…)'],
  [/%[0-9a-f]{2}/, 'kodowanie procentowe (%XX)'],
  [/\/[^\s/]+\/|(?:^|[^\p{L}\p{N}])\/[^\s/]/u, 'ścieżka adresu (/segment)'],
];
const DOTTED_RE = /[\p{L}\p{N}_@+-]+(?:[.\u3002\uff61][\p{L}\p{N}_@+-]+)+/gu;

const LINK_LINE_RE = /^(?: {2})?- \[([^[\]]+)\]\(([^()\s]*)\)(?:: (.+))?$/u;
const LIST_RE = /^(?: {2})?- (.+)$/u;
const PROSE_RE = /^[\p{L}\p{N}*]/u;

/** Powód odmowy dla tekstu (nagłówek, opis, punkt, akapit, tekst i opis odnośnika) albo null. */
export function textProblem(text) {
  const t = norm(text).toLowerCase();
  if (t.trim() === '') return 'pusty tekst';
  if (/\s$/.test(t)) return 'odstęp na końcu linii';
  for (const [re, why] of TEXT_RULES) {
    const m = t.match(re);
    if (m) return `${why}: ${m[0].trim()}`;
  }
  for (const m of t.matchAll(DOTTED_RE)) {
    if (!DOTTED_ALLOW.includes(m[0])) return `słowo z kropką (host?): ${m[0]}`;
  }
  return null;
}

/** Powód odmowy dla celu odnośnika albo null; `path` w wyniku tylko przy null. */
export function linkProblem(url) {
  const m = /^([^:/?#]*):\/\/([^/?#]*)(.*)$/.exec(url);
  if (!m) return { why: 'odnośnik bez schematu https://' };
  const [, scheme, auth, rest] = m;
  if (scheme !== 'https') return { why: `schemat inny niż https (${scheme})` };
  if (auth.includes('@')) return { why: 'dane logowania w adresie (user@)' };
  if (auth.includes(':')) return { why: 'port w adresie' };
  if (auth !== HOST) return { why: `host inny niż ${HOST} (${auth})` };
  if (rest.includes('?')) return { why: 'zapytanie (?query) w adresie' };
  if (rest.includes('#')) return { why: 'fragment (#) w adresie' };
  if (rest.includes('%')) return { why: 'kodowanie procentowe (%XX) w ścieżce' };
  if (!rest.startsWith('/')) return { why: 'brak ścieżki po hoście' };
  if (rest.includes('//')) return { why: 'podwójny ukośnik w ścieżce' };
  if (rest.includes('..') || rest.split('/').includes('.'))
    return { why: 'segment kropkowy (. albo ..) w ścieżce' };
  if (!/^\/[a-z0-9\-._~/]*$/.test(rest)) return { why: 'znak spoza listy w ścieżce' };
  return { why: null, path: rest };
}

/** Warianty ścieżki ukrytej do skanu: z `/` na końcu, bez, i nazwa z myślnikiem (ostatni człon). */
function hiddenNeedles(hiddenPaths) {
  const out = [];
  for (const p of hiddenPaths) {
    const t = norm(p).toLowerCase().replace(/\/+$/, '');
    out.push([p, `${t}/`], [p, t]);
    const slug = t.split('/').pop() ?? '';
    if (slug.includes('-')) out.push([p, slug]);
  }
  return out;
}

/** %XX dekodowane do skutku (podwójne kodowanie), najwyżej 5 przejść; bajt = znak latin1. */
export function decodePct(s) {
  let cur = s;
  for (let i = 0; i < 5; i++) {
    const next = cur.replace(/%([0-9a-f]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
    if (next === cur) break;
    cur = next;
  }
  return cur;
}

/** Ścieżka ukryta pasuje do ścieżki odnośnika (z `/` na końcu albo bez). */
const sameRoute = (a, b) => a.replace(/\/+$/, '') === b.replace(/\/+$/, '');

/** Adresy `<loc>` z sitemap.xml. */
export function sitemapUrls(xml) {
  return [...String(xml ?? '').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

/** Adresy odnośników formy 4 (unikalne, kolejność pojawienia; bez oceny poprawności). */
export function llmsUrls(text) {
  const out = [];
  for (const line of norm(text ?? '').split('\n')) {
    const m = LINK_LINE_RE.exec(line);
    if (m && !out.includes(m[2])) out.push(m[2]);
  }
  return out;
}

/** Powód odmowy dla znaku w surowej linii albo null. */
function charProblem(raw, lineNo) {
  const m = raw.match(BAD_CHAR_RE);
  if (!m) return null;
  if (m[0] === '\r') return 'znak CR (końce linii CRLF są odrzucane)';
  if (m[0] === '\uFEFF' && lineNo === 1 && m.index === 0) return 'BOM na początku pliku';
  const cp = m[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
  return `znak niewidoczny albo sterujący U+${cp}`;
}

/**
 * Ocena jednej linii. @returns {{ why: string|null, path?: string }}
 * `path` = ścieżka poprawnego odnośnika (forma 4), do kontroli sitemapy i stron ukrytych.
 */
function lineVerdict(raw, lineNo) {
  const bad = charProblem(raw, lineNo);
  if (bad) return { why: bad };
  if ([...raw].length > MAX_LINE) return { why: `linia dłuższa niż ${MAX_LINE} znaków` };
  const line = norm(raw);
  if (line === '') return { why: null };
  if (line.trim() === '') return { why: 'linia z samymi odstępami' };
  const heading = /^#{1,2} (.*)$/.exec(line);
  if (heading) return { why: textProblem(heading[1]) };
  if (line.startsWith('> ')) return { why: textProblem(line.slice(2)) };
  if (/^(?: {2})?- \[/.test(line)) {
    const m = LINK_LINE_RE.exec(line);
    if (!m) return { why: 'odnośnik w formie innej niż `- [tekst](https://…/ścieżka/): opis`' };
    if (!raw.includes(m[2])) return { why: 'adres odnośnika zmienia się po normalizacji NFKC' };
    const link = linkProblem(m[2]);
    if (link.why) return { why: link.why };
    const why = textProblem(m[1]) ?? (m[3] === undefined ? null : textProblem(m[3]));
    return why ? { why } : { why: null, path: link.path };
  }
  const item = LIST_RE.exec(line);
  if (item) return { why: textProblem(item[1]) };
  if (PROSE_RE.test(line)) return { why: textProblem(line) };
  return { why: 'linia nie pasuje do żadnej dozwolonej formy' };
}

const cut = (s) => norm(s).trim().slice(0, 80);

/**
 * @param {string} llmsText
 * @param {string} sitemapXml
 * @param {{ keyPaths?: string[], hiddenPaths?: string[], machineAllow?: string[] }} [opts]
 *  hiddenPaths = ścieżki noindex/za flagą (prerenderOnlyRoutes): wymagane, niepuste.
 * Fail-closed: pusty llms.txt, pusta sitemapa, pusta lista ukrytych, linia spoza gramatyki,
 * odnośnik spoza sitemapy albo do strony ukrytej = błąd w `problems`.
 */
export function llmsReport(llmsText, sitemapXml, opts = {}) {
  const keyPaths = opts.keyPaths ?? KEY_PATHS;
  const machine = opts.machineAllow ?? MACHINE_ALLOW;
  const hiddenPaths = opts.hiddenPaths;
  const problems = [];
  const text = typeof llmsText === 'string' ? llmsText : '';
  if (text === '') problems.push('llms.txt: pusty albo nieczytelny');

  const hiddenOk =
    Array.isArray(hiddenPaths) &&
    hiddenPaths.length > 0 &&
    hiddenPaths.every((p) => typeof p === 'string' && /^\/[^\s]+$/.test(p));
  if (!hiddenOk) problems.push('lista stron ukrytych (prerenderOnlyRoutes) pusta albo nieczytelna');
  const hidden = hiddenOk ? hiddenPaths : [];

  const sitemap = sitemapUrls(sitemapXml);
  const sitemapPaths = new Set(
    sitemap.filter((u) => u.startsWith(`${BASE_URL}/`)).map((u) => u.slice(BASE_URL.length)),
  );
  if (sitemapPaths.size === 0) problems.push('sitemap.xml: brak adresów');

  const lines = text.split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  const links = [];
  const notInSitemap = [];
  const hiddenListed = [];
  const needles = hiddenNeedles(hidden);
  const hitPaths = new Set();
  lines.forEach((raw, i) => {
    const n = i + 1;
    const v = lineVerdict(raw, n);
    if (v.why) problems.push(`llms.txt linia ${n}: ${v.why}: ${cut(raw)}`);
    if (v.path !== undefined) {
      const url = BASE_URL + v.path;
      if (!links.includes(url)) links.push(url);
      if (hidden.some((h) => sameRoute(norm(h).toLowerCase(), v.path))) {
        hiddenListed.push(url);
        problems.push(`llms.txt linia ${n}: odnośnik do strony ukrytej: ${v.path}`);
      } else if (!sitemapPaths.has(v.path) && !machine.includes(v.path)) {
        notInSitemap.push(url);
        problems.push(`llms.txt linia ${n}: adres spoza sitemapy: ${v.path}`);
      }
    }
    const low = norm(raw).toLowerCase();
    const variants = [low, decodePct(low), low.replace(/\\/g, '/')];
    for (const [p, needle] of needles) {
      if (hitPaths.has(p)) continue;
      if (variants.some((s) => s.includes(needle))) {
        hitPaths.add(p);
        problems.push(`llms.txt linia ${n}: ścieżka strony ukrytej ${p} (${needle})`);
      }
    }
  });
  // Skan całego pliku bez odstępów: ścieżka rozbita spacją albo końcem linii.
  const flat = decodePct(norm(text).toLowerCase()).replace(/\s+/g, '');
  for (const [p, needle] of needles) {
    if (!hitPaths.has(p) && flat.includes(needle)) {
      hitPaths.add(p);
      problems.push(`llms.txt: ścieżka strony ukrytej ${p} (${needle}) po usunięciu odstępów`);
    }
  }

  if (text !== '' && links.length === 0) problems.push('llms.txt: brak adresów');
  const linkSet = new Set(links);
  const missingKey = keyPaths.map((p) => BASE_URL + p).filter((u) => !linkSet.has(u));
  const keyNotInSitemap = keyPaths.filter((p) => !sitemapPaths.has(p)).map((p) => BASE_URL + p);
  return {
    llmsCount: links.length,
    sitemapCount: sitemap.length,
    notInSitemap,
    missingKey,
    keyNotInSitemap,
    hiddenListed,
    problems,
    ok: problems.length === 0 && missingKey.length === 0 && keyNotInSitemap.length === 0,
  };
}
