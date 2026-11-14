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

/**
 * Sobowtóry, które NFKC zamienia na literę o innym wyglądzie (MIX-1684): `Ϲ` U+03F9 → `Σ`,
 * `ϲ` U+03F2 → `ς`. Zamieniane na łaciński odpowiednik PRZED NFKC, w każdym miejscu użycia norm().
 */
const PRE_NFKC = new Map([
  ['\u03F9', 'C'],
  ['\u03F2', 'c'],
]);

/** Jedno miejsce normalizacji Unicode (NFKC: pełna szerokość, ligatury, indeksy górne → ASCII). */
export const norm = (s) =>
  [...String(s)]
    .map((c) => PRE_NFKC.get(c) ?? c)
    .join('')
    .normalize('NFKC');

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
 * Szkielet do skanu stron ukrytych (MIX-1665, idea UTS #39; allowlista liter MIX-1684). Każdy znak
 * po norm() (sobowtóry przed NFKC, NFKC) → NFKD bez znaków łączących, potem:
 *  1. tablica SKELETON_MAP (allowlista, wszystkie pisma, wielkie i małe litery osobno, BEZ małych
 *     liter przed nią): wartość = litera [a-z], cyfra albo WILDCARD (znak o dwóch odczytach, `Σ`);
 *  2. tylko litera łacińska (\p{Script=Latin}) spoza tablicy: małe litery, bez znaków łączących,
 *     tablica jeszcze raz; wynik spoza [a-z0-9] (`ɛ`, `ƶ`, `ɨ`) → WILDCARD;
 *  3. cyfra ASCII zostaje; każda inna litera, cyfra albo symbol spoza ASCII (greckie `Δ`, `Ξ`,
 *     ormiańskie `օ`, gruzińskie, chińskie, `٥`, `∩`) → WILDCARD: dowolna jedna litera ścieżki albo
 *     separator (fail-closed, nieznany znak nigdy nie rozrywa nazwy i nigdy nie jest małą literą);
 *  4. odstęp i interpunkcja zdania → ' ' (separator miękki), reszta ASCII (`|`, `@`, `/`, `-`, `*`)
 *     i interpunkcja spoza ASCII (`⸺`) → '/' (separator twardy). ASCII `|`, `@` i cyfra `3` nie są
 *     sobowtórami liter (decyzja projektu MIX-1684: zwykłe znaki tekstu, nie fałszywe odmowy).
 */
// Pary [sobowtór, szkielet ASCII]: cyrylica małe i wielkie, greka małe i wielkie, łacina rozszerzona
// i kapitaliki; na końcu klasy mylone w ASCII (l i 1 → i, 0 → o). Wartości są końcowe.
const SKELETON_PAIRS = [
  ['авгезикмнопрстухьѕіјԁԛԝүһӏꙇ', 'abre3ukmhonpctyxbsijdqwyhii'],
  ['АВЕЅІЈКМНОРСТУХЬҮҺӀԚԜИ', 'abesijkmhopctyxbyhiqwn'],
  ['αβγεηικνορστυχωϳ', 'abyenikvopotuxwj'],
  ['ΑΒΕΖΗΙΚΜΝΟΡΤΥΧΩ', 'abezhikmnoptyxo'],
  ['ıȷłđħŧøɑɡɩɪʟᴀʙᴄᴅᴇɢʜᴊᴋᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ', 'ijidhtoagiiiabcdeghjkmnoprstuvwyz'],
  ['l10', 'iio'],
];

/** Znak szkieletu dla litery, cyfry albo symbolu spoza tablicy (dowolna litera albo separator). */
export const WILDCARD = '?';
const SKELETON_MAP = new Map([
  ...SKELETON_PAIRS.flatMap(([from, to]) => [...from].map((c, i) => [c, to[i]])),
  ['ß', 'ss'],
  ['æ', 'ae'],
  ['œ', 'oe'],
  // Σ: wygląda jak E, czyta się S (i jest NFKC-postacią Ϲ) = dowolna litera.
  ['Σ', WILDCARD],
]);
for (const [from, to] of SKELETON_PAIRS) {
  if ([...from].length !== to.length) throw new Error(`SKELETON_PAIRS: długość ${from}`);
}
const SOFT_SEP_RE = /[\s.,;:!?'"()„”«»…]/u;
const LATIN_RE = /^\p{Script=Latin}$/u;
const noMarks = (s) => s.normalize('NFKD').replace(/\p{M}/gu, '');
const fold = (s) => [...s].map((c) => SKELETON_MAP.get(c) ?? c).join('');
const isWild = (c) => /[\p{L}\p{N}]/u.test(c) || (c > '\x7f' && /\p{S}/u.test(c));

/** Szkielet jednego znaku (po NFKC i NFKD bez znaków łączących): kroki 1–4 z opisu wyżej. */
function skeletonChar(c) {
  const mapped = SKELETON_MAP.get(c);
  if (mapped !== undefined) return mapped;
  if (LATIN_RE.test(c)) {
    const m = fold(noMarks(c.toLowerCase()));
    return /^[a-z0-9]+$/.test(m) ? m : WILDCARD;
  }
  if (/^[0-9]$/.test(c)) return c;
  if (isWild(c)) return WILDCARD;
  return SOFT_SEP_RE.test(c) ? ' ' : '/';
}

/** Szkielet ze znacznikami: znaki tylko z [a-z0-9 /] i WILDCARD. */
export function skeletonText(s) {
  let out = '';
  for (const ch of norm(s)) {
    for (const c of noMarks(ch)) out += skeletonChar(c);
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
 * WILDCARD pasuje jako dowolna litera ścieżki albo separator (także na granicy); pary dwuliterowe
 * z LOOK_PAIRS w obu kierunkach (`rn` w tekście za `m` ścieżki i `m` w tekście za `rn` ścieżki).
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
      const body = segs.map(shortBody).join(`${HARD}+`);
      const re =
        segs.length > 1
          ? `(?<![a-z0-9])${body}(?![a-z0-9])`
          : `${HARD}+${body}(?![a-z0-9])|(?<![a-z0-9])${body}${HARD}+(?![a-z0-9])`;
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

/**
 * Sobowtóry dwuliterowe na szkielecie [litera ścieżki, dwie litery tekstu] (MIX-1670): `rn` → m,
 * `cl` → d (l w szkielecie to i, więc `ci`), `vv` → w. Działają w obu kierunkach.
 */
export const LOOK_PAIRS = [
  ['m', 'rn'],
  ['d', 'ci'],
  ['w', 'vv'],
];
const HARD = `[/${WILDCARD}]`;
const isAlnum = (c) => c !== undefined && /^[a-z0-9]$/.test(c);
const fits = (t, k) => t === k || t === WILDCARD;
const cls = (c) => `[${c}${WILDCARD}]`;

/** Człon krótkiego szkieletu jako wyrażenie: litery po kolei bez separatorów, pary w obu kierunkach. */
function shortBody(seg) {
  let re = '';
  for (let i = 0; i < seg.length;) {
    const rev = LOOK_PAIRS.find(([, two]) => seg.startsWith(two, i));
    const one = LOOK_PAIRS.find(([o]) => o === seg[i]);
    if (rev) {
      re += `(?:${cls(rev[1][0])}${cls(rev[1][1])}|${cls(rev[0])})`;
      i += 2;
    } else {
      re += one ? `(?:${cls(one[0])}|${cls(one[1][0])}${cls(one[1][1])})` : cls(seg[i]);
      i += 1;
    }
  }
  return re;
}

/**
 * Długi szkielet `k` jako automat po pozycjach (bez cofania, czas n × k): stan q = liczba liter
 * ścieżki już dopasowanych. Start tylko na granicy wyrazu, separator (też WILDCARD) tylko między
 * literami, koniec przy granicy wyrazu. Obiekt z `test(s)` jak wyrażenie regularne.
 */
function longRe(k) {
  const K = k.length;
  const test = (s) => {
    const n = s.length;
    const at = new Uint8Array((n + 3) * (K + 1));
    const put = (j, q) => {
      at[j * (K + 1) + q] = 1;
    };
    for (let j = 0; j <= n; j++) {
      if (!isAlnum(s[j - 1])) put(j, 0);
      for (let q = 0; q <= K; q++) {
        if (!at[j * (K + 1) + q]) continue;
        const t = s[j];
        if (q === K) {
          if (!isAlnum(t)) return true;
          continue;
        }
        if (t === undefined) continue;
        if (q > 0 && !isAlnum(t)) put(j + 1, q);
        if (fits(t, k[q])) put(j + 1, q + 1);
        for (const [one, two] of LOOK_PAIRS) {
          if (k[q] === one && fits(t, two[0]) && fits(s[j + 1], two[1])) put(j + 2, q + 1);
          if (k.startsWith(two, q) && fits(t, one)) put(j + 1, q + 2);
        }
      }
    }
    return false;
  };
  return { test };
}

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
    const sk = [skeletonText(raw), skeletonText(decodePct(norm(raw)))];
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
