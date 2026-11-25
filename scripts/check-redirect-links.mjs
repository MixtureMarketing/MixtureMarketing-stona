/**
 * MIX-1825: żaden link wewnętrzny, wpis w sitemap.xml, canonical ani trasa z routes.js
 * nie może wskazywać adresu, który przekierowuje (GSC: „Strona zawiera przekierowanie”).
 *
 * Adres „przekierowuje”, gdy:
 *  - pierwsza pasująca reguła public/_redirects ma status 301/302/303/307/308, albo
 *  - ścieżka strony nie kończy się „/” (Cloudflare Pages odpowiada 308/301 na wersję ze slashem).
 *
 * Uruchomienie: `node scripts/check-redirect-links.mjs` → lista naruszeń, wynik 0 = rc 0.
 * Ten sam moduł importuje test tests/seo/redirectLinks.test.ts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SITE = 'https://mixturemarketing.pl';
const REDIRECT_STATUSES = new Set(['301', '302', '303', '307', '308']);

/** Ścieżki, które nie są stronami (API, panel, pliki statyczne). */
const NON_PAGE_PREFIXES = ['/api/', '/portal', '/assets/', '/images/', '/fonts/', '/cdn-cgi/'];
const SCAN_DIRS = ['components', 'data', 'config'];
/** Pliki, w których ścieżki NIE są linkami (jak w tests/seo/internalLinksTrailingSlash.test.ts). */
const IGNORED_FILES = new Set(['config/routes.tsx', 'config/breadcrumbs.ts']);
const IGNORED_DIRS = ['components/portal/'];
/**
 * Pliki z uzasadnionym wyjątkiem (nie są linkami dla robota):
 *  - PozycjonowanieRzeszow.tsx: martwa strona po scaleniu MIX-898 (brak trasy w config/routes.tsx,
 *    test mergeSeoRzeszow.test.ts pilnuje, że nikt jej nie importuje);
 *  - data/content/pages/cennik.ts: CENNIK_PATH ('/cennik/') renderują tylko Cennik.tsx i
 *    CennikLink.tsx, obie za przełącznikiem VITE_MM_CENNIK (MIX-1855). Wyłączony = brak w DOM;
 *    włączony = scripts/apply-cennik-build.mjs zdejmuje 301 /cennik/ z dist/_redirects
 *    (tests/seo/cennikBuild.test.ts), więc robot nie dostaje linku na przekierowanie.
 */
export const EXCEPTION_FILES = new Set([
  'components/pages/PozycjonowanieRzeszow.tsx',
  'data/content/pages/cennik.ts',
]);
/** Literał po porównaniu ścieżek / slugu przekazywanym dalej nie jest linkiem. */
const NON_LINK_CONTEXT =
  /(===|!==|startsWith\(|endsWith\(|includes\(|case\s|\bslug\s*=\s*\{?|\bSLUG\s*=)\s*$/;
const STRING_LITERAL = /(['"`])(\/[a-z0-9][^'"`\s<>]*?)\1/gi;
const ABSOLUTE_URL = /https:\/\/mixturemarketing\.pl(\/[^\s"'`<>)\]]*)?/g;

/** @param {string} text treść public/_redirects */
export function parseRedirects(text) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const [from, to, status = '302'] = l.split(/\s+/);
      return { from, to, status };
    });
}

const escapeRe = (s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

/** Wzorzec reguły Pages: `:nazwa` = jeden segment, `*` = reszta ścieżki (także pusta). */
export function ruleRegex(from) {
  const body = from
    .split(/(:[a-z_][a-z0-9_]*|\*)/i)
    .map((part) => {
      if (part === '*') return '(.*)';
      if (/^:[a-z_]/i.test(part)) return '([^/]+)';
      return escapeRe(part);
    })
    .join('');
  return new RegExp(`^${body}$`);
}

/** Cel reguły dla konkretnej ścieżki (podstawia :nazwa i :splat). */
export function ruleTarget(rule, pathname) {
  const names = [...rule.from.matchAll(/:([a-z_][a-z0-9_]*)|\*/gi)].map((m) => m[1] ?? 'splat');
  const captured = ruleRegex(rule.from).exec(pathname);
  if (!captured) return null;
  let to = rule.to;
  names.forEach((name, i) => {
    to = to.split(`:${name}`).join(captured[i + 1]);
  });
  return to;
}

/** Pierwsza pasująca reguła (Pages: pierwsza wygrywa) albo null. */
export function firstMatch(rules, pathname) {
  return rules.find((r) => ruleRegex(r.from).test(pathname)) ?? null;
}

const isFile = (pathname) =>
  /\.[a-z0-9]{2,5}$/i.test(pathname.slice(pathname.lastIndexOf('/') + 1));

/** Ścieżka strony (bez domeny, ?query i #hash); null dla nie-stron. */
export function pagePath(raw) {
  let p = raw.startsWith(SITE) ? raw.slice(SITE.length) || '/' : raw;
  p = p.split(/[?#]/)[0];
  if (!p.startsWith('/')) return null;
  // `${...}` w template stringach → zwykły segment (np. /portfolio/${slug}/).
  p = p.replace(/\$\{[^}]*\}/g, 'x');
  if (NON_PAGE_PREFIXES.some((pre) => p.startsWith(pre))) return null;
  if (isFile(p)) return null;
  return p;
}

/** Powód, dla którego adres przekierowuje, albo null. */
export function redirectReason(rules, raw) {
  const p = pagePath(raw);
  if (p === null) return null;
  const rule = firstMatch(rules, p);
  if (rule && REDIRECT_STATUSES.has(rule.status)) return `${rule.status} -> ${rule.to}`;
  if (p !== '/' && !p.endsWith('/')) return 'brak "/" (Pages przekierowuje na wersję ze slashem)';
  return null;
}

const listFiles = (root, dir) => {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) return listFiles(root, rel);
    return /\.(tsx?|jsx?)$/.test(e.name) && !/\.test\.(tsx?|jsx?)$/.test(e.name) ? [rel] : [];
  });
};

/**
 * Wszystkie adresy wskazywane przez stronę: sitemap, routes.js, linki/canonicale w kodzie,
 * linki w public/llms*.txt. @returns {{source: string, url: string}[]}
 */
export async function collectTargets(root) {
  const out = [];
  const sitemap = path.join(root, 'public/sitemap.xml');
  if (fs.existsSync(sitemap)) {
    for (const m of fs.readFileSync(sitemap, 'utf8').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
      out.push({ source: 'public/sitemap.xml', url: m[1] });
    }
  }
  const { routes, prerenderOnlyRoutes = [] } = await import(
    pathToFileURL(path.join(root, 'routes.js')).href
  );
  for (const r of [...routes, ...prerenderOnlyRoutes]) out.push({ source: 'routes.js', url: r });

  for (const file of SCAN_DIRS.flatMap((d) => listFiles(root, d))) {
    if (IGNORED_FILES.has(file) || EXCEPTION_FILES.has(file)) continue;
    if (IGNORED_DIRS.some((d) => file.startsWith(d))) continue;
    fs.readFileSync(path.join(root, file), 'utf8')
      .split('\n')
      .forEach((line, i) => {
        const t = line.trim();
        if (t.startsWith('//') || t.startsWith('*')) return;
        for (const m of line.matchAll(STRING_LITERAL)) {
          if (NON_LINK_CONTEXT.test(line.slice(0, m.index))) continue;
          out.push({ source: `${file}:${i + 1}`, url: m[2] });
        }
        for (const m of line.matchAll(ABSOLUTE_URL)) {
          out.push({ source: `${file}:${i + 1}`, url: m[0] });
        }
      });
  }
  for (const name of fs.existsSync(path.join(root, 'public'))
    ? fs.readdirSync(path.join(root, 'public'))
    : []) {
    if (!/^llms.*\.txt$/.test(name)) continue;
    fs.readFileSync(path.join(root, 'public', name), 'utf8')
      .split('\n')
      .forEach((line, i) => {
        for (const m of line.matchAll(ABSOLUTE_URL))
          out.push({ source: `public/${name}:${i + 1}`, url: m[0] });
      });
  }
  return out;
}

/** @returns {Promise<string[]>} naruszenia „źródło  adres  (powód)” */
export async function findRedirectingLinks(root) {
  const rules = parseRedirects(fs.readFileSync(path.join(root, 'public/_redirects'), 'utf8'));
  const offenders = [];
  for (const { source, url } of await collectTargets(root)) {
    const why = redirectReason(rules, url);
    if (why) offenders.push(`${source}  ${url}  (${why})`);
  }
  return offenders;
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const offenders = await findRedirectingLinks(root);
  for (const o of offenders) console.log(o);
  console.log(`adresy wskazujące przekierowanie: ${offenders.length}`);
  process.exit(offenders.length ? 1 : 0);
}
