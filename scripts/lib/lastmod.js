// Realne daty zmian stron statycznych dla <lastmod> w sitemap.xml (MIX-781, M11).
//
// Skąd data: `git log -1 --format=%cs` po plikach, które tworzą treść strony — komponent
// strony z routes.tsx plus jego zależności z katalogów TREŚCI (data/content, components/pages,
// components/articles, components/features, components/sections). Pliki wspólne (layout,
// common, ui, utils, services) są pomijane: zmiana nagłówka serwisu nie zmienia treści
// każdej podstrony i nie może „odświeżać” całej mapy (Google przestaje wtedy ufać lastmod).
//
// Wynik trafia do data/seo/lastmod.json (commitowany): build na Cloudflare Pages nie musi
// mieć pełnej historii gita. Odświeżanie: `npm run lastmod` (przed wydaniem).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const CONTENT_DIRS = [
  'data/content/',
  'components/pages/',
  'components/articles/',
  'components/features/',
  'components/sections/',
];

const EXTS = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts'];

/** Mapa: trasa (ze slashem na końcu) → ścieżka pliku komponentu strony (względem roota). */
export function routeComponents(root) {
  const src = fs.readFileSync(path.join(root, 'config/routes.tsx'), 'utf8');
  const imports = new Map();
  for (const m of src.matchAll(
    /const\s+(\w+)\s*=\s*lazy\(\s*\(\)\s*=>\s*import\(\s*'@\/([^']+)'\s*\)\s*,?\s*\)/g,
  )) {
    imports.set(m[1], m[2]);
  }
  const map = {};
  for (const m of src.matchAll(/path:\s*'([^']+)'\s*,\s*element:\s*<(\w+)\s*\/>/g)) {
    const file = imports.get(m[2]);
    if (!file) continue;
    const route = m[1] === '/' ? '/' : `${m[1].replace(/\/+$/, '')}/`;
    map[route] = file;
  }
  return map;
}

function resolveFile(root, rel) {
  for (const ext of ['', ...EXTS]) {
    const p = path.join(root, rel + ext);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return path.relative(root, p);
  }
  return null;
}

/** Plik komponentu + jego importy względne/`@/` z katalogów treści (domknięcie przechodnie). */
export function contentFiles(root, componentRel) {
  const start = resolveFile(root, componentRel);
  if (!start) return [];
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const cur = queue.pop();
    const code = fs.readFileSync(path.join(root, cur), 'utf8');
    for (const m of code.matchAll(/(?:from|import)\s*\(?\s*'((?:\.{1,2}\/|@\/)[^']+)'/g)) {
      const spec = m[1];
      const rel = spec.startsWith('@/')
        ? spec.slice(2)
        : path.relative(root, path.resolve(path.dirname(path.join(root, cur)), spec));
      const file = resolveFile(root, rel);
      if (!file || seen.has(file)) continue;
      const posix = file.split(path.sep).join('/');
      if (!CONTENT_DIRS.some((d) => posix.startsWith(d))) continue;
      seen.add(file);
      queue.push(file);
    }
  }
  return [...seen].map((f) => f.split(path.sep).join('/'));
}

/** Najnowsza data commita (YYYY-MM-DD) dla zestawu plików; null, gdy git nie zna żadnego. */
export function gitLastDate(root, files) {
  if (files.length === 0) return null;
  const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...files], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
}

/**
 * Daty zmian dla listy tras statycznych. Trasa bez komponentu w routes.tsx albo bez
 * historii w gicie → `null` (wywołujący ma to zgłosić, nie wstawiać dzisiejszej daty).
 */
export function computeLastmods(root, routes) {
  const comps = routeComponents(root);
  const result = {};
  for (const route of routes) {
    const comp = comps[route];
    result[route] = comp ? gitLastDate(root, contentFiles(root, comp)) : null;
  }
  return result;
}

/** Czy repo ma pełną historię (inaczej `git log` po plikach dałby daty płytkiego klona). */
export function hasFullGitHistory(root) {
  try {
    const out = (args) =>
      execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return out(['rev-parse', '--is-shallow-repository']) === 'false';
  } catch {
    return false;
  }
}

/**
 * Daty dla tras statycznych: na żywo z gita, gdy jest pełna historia (CI: fetch-depth 0),
 * inaczej z commitowanego manifestu data/seo/lastmod.json. Trasa bez daty na żywo
 * (np. nowa, jeszcze nie scommitowana) dostaje datę z manifestu; brak w obu = null.
 */
export function resolveLastmods(root, routes, manifest) {
  if (!hasFullGitHistory(root)) return { ...manifest };
  const live = computeLastmods(root, routes);
  const merged = {};
  for (const r of routes) merged[r] = live[r] ?? manifest[r] ?? null;
  return merged;
}
