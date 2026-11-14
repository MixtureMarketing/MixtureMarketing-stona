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
// Do tego skan stron ukrytych z prerenderOnlyRoutes po szkielecie (MIX-1665): w każdej linii (też po
// dekodowaniu %XX) i w liniach złączonych bez znaczników szukamy liter i cyfr ścieżki (cała ścieżka
// i nazwa z myślnikiem) po kolei, z dowolnymi znakami między nimi i z granicą wyrazu na końcach.

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

/**
 * Szkielet do skanu stron ukrytych (MIX-1665, idea UTS #39): każdy znak po NFKC → NFKD, małe
 * litery, bez znaków łączących (ogonek, kropka nad İ), sobowtóry z SKELETON_MAP → ASCII; litera
 * albo cyfra [a-z0-9] zostaje, odstęp i interpunkcja zdania → ' ' (separator miękki), każdy inny
 * znak (ukośnik, myślnik, `*`, `_`, `ノ`, `⟋`, litera spoza tablicy) → '/' (separator twardy).
 * Bez listy separatorów: liczą się tylko litery i cyfry.
 */
// Pary [sobowtór, szkielet ASCII], po małych literach: cyrylica, greka, łacina rozszerzona,
// kapitaliki; na końcu klasy mylone w ASCII (l i 1 → i, 0 → o), wspólne dla tekstu i ścieżki.
// Wartości są końcowe (bez drugiego przejścia), więc sobowtór l daje od razu i.
const SKELETON_PAIRS = [
  ['авгезикмнопрстухьѕіјԁԛԝүһӏꙇ', 'abre3ukmhonpctyxbsijdqwyhii'],
  ['αβγεηικνορστυχω', 'abyenikvopotuxw'],
  ['ıȷłđħŧøɑɡɩɪʟᴀʙᴄᴅᴇɢʜᴊᴋᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ', 'ijidhtoagiiiabcdeghjkmnoprstuvwyz'],
  ['l10', 'iio'],
];
const SKELETON_MAP = new Map([
  ...SKELETON_PAIRS.flatMap(([from, to]) => [...from].map((c, i) => [c, to[i]])),
  ['ß', 'ss'],
  ['æ', 'ae'],
  ['œ', 'oe'],
]);
const SOFT_SEP_RE = /[\s.,;:!?'"()„”«»…]/u;

/** Szkielet ze znacznikami separatorów: znaki tylko z [a-z0-9 /]. */
export function skeletonText(s) {
  let out = '';
  for (const ch of norm(s)) {
    const d = ch.normalize('NFKD').toLowerCase().replace(/\p{M}/gu, '');
    if (d === '') continue;
    for (const c of d) {
      const m = SKELETON_MAP.get(c) ?? c;
      if (/^[a-z0-9]+$/.test(m)) out += m;
      else out += SOFT_SEP_RE.test(c) ? ' ' : '/';
    }
  }
  return out;
}
const skeletonOf = (s) => skeletonText(s).replace(/[^a-z0-9]/g, '');

/**
 * Najkrótszy szkielet skanowany po samych literach i cyfrach. Krótszy szkielet (np. `/hidden/`)
 * daje odmowę tylko jako cały wyraz przy separatorze twardym (`hidden/`, `/hidden`), bo inaczej
 * zwykłe słowo w tekście dawałoby odmowę.
 */
export const MIN_SKELETON = 8;

/**
 * Igły skanu stron ukrytych: [ścieżka, szkielet, wyrażenie na skeletonText]. Długi szkielet (całej
 * ścieżki; nazwy z myślnikiem, gdy ma ≥ MIN_SKELETON): litery i cyfry po kolei, między nimi
 * dowolne separatory, z granicą wyrazu na obu końcach (`superabonament/dziekujemyteraz` przechodzi).
 */
function hiddenNeedles(hiddenPaths) {
  const out = [];
  for (const p of hiddenPaths) {
    const raw = norm(p)
      .split('/')
      .filter((s) => s !== '');
    const segs = raw.map(skeletonOf).filter((s) => s !== '');
    const full = segs.join('');
    if (full === '') continue;
    const shown = plain(raw.join(''));
    if (full.length >= MIN_SKELETON) {
      out.push([p, shown, longRe(full)]);
    } else {
      // Kilka członów: separator twardy między nimi wystarcza; jeden człon: `/nazwa` albo `nazwa/`.
      const body = segs.join('/+');
      const re =
        segs.length > 1
          ? `(?<![a-z0-9])${body}(?![a-z0-9])`
          : `/+${body}(?![a-z0-9])|(?<![a-z0-9])${body}/+(?![a-z0-9])`;
      out.push([p, shown, new RegExp(re)]);
    }
    const slugRaw = raw[raw.length - 1];
    const slug = skeletonOf(slugRaw);
    if (raw.length > 1 && /[^\p{L}\p{N}]/u.test(slugRaw) && slug.length >= MIN_SKELETON)
      out.push([p, plain(slugRaw), longRe(slug)]);
  }
  return out;
}
/** Szkielet w linii odmowy: litery i cyfry ścieżki bez klas l/1/0 (czytelny dla autora). */
const plain = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const longRe = (k) => new RegExp(`(?<![a-z0-9])${[...k].join('[^a-z0-9]*')}(?![a-z0-9])`);

/** Znaczniki na początku linii zdejmowane przed złączeniem (`> - `, `## `, `1. `, wcięcie). */
const LINE_MARK_RE = /^(?:\s*(?:#{1,6}|>|[-*+]|\d+[.)]))*\s*/u;

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
    hiddenPaths.every((p) => typeof p === 'string' && /^\/[^\s]+$/.test(p) && skeletonOf(p) !== '');
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
    const sk = [skeletonText(raw), skeletonText(decodePct(norm(raw).toLowerCase()))];
    for (const [p, k, re] of needles) {
      if (hitPaths.has(p)) continue;
      if (sk.some((s) => re.test(s))) {
        hitPaths.add(p);
        problems.push(`llms.txt linia ${n}: ścieżka strony ukrytej ${p} (szkielet ${k})`);
      }
    }
  });
  // Skan linii złączonych (cały plik) bez znaczników na początku linii: nazwa rozbita końcem linii
  // (`systemy-ai-` + `> - aplikacje`, `abonament/` + `1. dziekujemy`).
  const joined = skeletonText(lines.map((l) => norm(l).replace(LINE_MARK_RE, '')).join('\n'));
  for (const [p, k, re] of needles) {
    if (!hitPaths.has(p) && re.test(joined)) {
      hitPaths.add(p);
      problems.push(`llms.txt: ścieżka strony ukrytej ${p} (szkielet ${k}) po złączeniu linii`);
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
