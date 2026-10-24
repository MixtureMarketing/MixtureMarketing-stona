/**
 * Strażnik: wewnętrzne linki w kodzie muszą kończyć się "/" (przed ?query / #hash).
 *
 * Każdy route jest prerenderowany do dist/<route>/index.html, więc Cloudflare Pages
 * odpowiada 308 na wersję bez slasha — każdy taki link to zbędne przekierowanie
 * (crawl budget, LCP przy nawigacji pełnostronicowej, rozjazd z canonicalami).
 * Audyt produkcji 2026-10: 46 unikalnych URL-i / 357 wystąpień bez slasha.
 *
 * Test skanuje literały stringów (', ", `) zaczynające się od "/" w components/,
 * data/ i config/. Dynamiczne slugi spoza tych katalogów (services/cms) normalizuj
 * przez `withTrailingSlash()` z `@/utils/url`.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCAN_DIRS = ['components', 'data', 'config'];

/** Pliki, w których ścieżki NIE są linkami. */
const IGNORED_FILES = new Set([
  'config/routes.tsx', // definicje tras React Router (dopasowanie działa z i bez slasha)
  'config/breadcrumbs.ts', // klucze mapy nazw (Breadcrumbs.tsx sam buduje href ze slashem)
]);

/** Katalogi poza zakresem: panel /portal/* (SPA za auth, noindex, rewrite 200). */
const IGNORED_DIRS = ['components/portal/'];

/**
 * Znane naruszenia w plikach, których ta zmiana nie mogła dotknąć (równoległa praca).
 * Usuń wpis po poprawce — test wtedy zacznie pilnować także tego pliku.
 */
const KNOWN_PENDING = new Set<string>([
  // success/cancel path dla zewnętrznego huba płatności — kształt bez slasha celowo
  // zachowany (walidacja po stronie huba nieznana); patrz komentarz w pliku.
  'components/pages/abonament/PreonboardModal.tsx',
]);

/** Ścieżki, które nie są stronami (API, panel, pliki statyczne). */
const NON_PAGE_PREFIXES = ['/api/', '/portal', '/assets/', '/images/', '/fonts/'];

/**
 * Konteksty, w których literał nie jest linkiem: porównania ścieżek (active state),
 * slug przekazywany do ArticleShell (normalizowany tam przez withTrailingSlash).
 */
const NON_LINK_CONTEXT =
  /(===|!==|startsWith\(|endsWith\(|includes\(|case\s|\bslug\s*=\s*\{?|\bSLUG\s*=)\s*$/;

const STRING_LITERAL = /(['"`])(\/[a-z0-9][^'"`\s<>]*?)\1/gi;

const listFiles = (dir: string): string[] => {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((entry) => {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return listFiles(rel);
    return /\.(tsx?|jsx?)$/.test(entry.name) && !/\.test\.(tsx?|jsx?)$/.test(entry.name)
      ? [rel]
      : [];
  });
};

const isOffender = (value: string): boolean => {
  if (NON_PAGE_PREFIXES.some((p) => value.startsWith(p))) return false;
  const pathname = value.split(/[?#]/)[0];
  if (pathname.endsWith('/')) return false;
  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1);
  if (/\.[a-z0-9]{2,5}$/i.test(lastSegment)) return false; // plik (.pdf, .png …)
  return true;
};

const findOffenders = (): string[] => {
  const offenders: string[] = [];
  for (const file of SCAN_DIRS.flatMap(listFiles)) {
    if (IGNORED_FILES.has(file) || KNOWN_PENDING.has(file)) continue;
    if (IGNORED_DIRS.some((d) => file.startsWith(d))) continue;
    const lines = fs.readFileSync(path.join(ROOT, file), 'utf8').split('\n');
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
      for (const match of line.matchAll(STRING_LITERAL)) {
        const before = line.slice(0, match.index);
        if (NON_LINK_CONTEXT.test(before)) continue;
        if (isOffender(match[2])) offenders.push(`${file}:${i + 1}  ${match[2]}`);
      }
    });
  }
  return offenders;
};

describe('wewnętrzne linki mają trailing slash', () => {
  it('żaden link w components/, data/, config/ nie kończy się bez "/"', () => {
    const offenders = findOffenders();
    expect(
      offenders,
      `Dopisz "/" na końcu ścieżki (przed ?/#) albo użyj withTrailingSlash():\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('stary kalkulator /offers#calculator nie jest już linkowany (żyje na /wycena/)', () => {
    const hits = SCAN_DIRS.flatMap(listFiles)
      .filter((f) => !KNOWN_PENDING.has(f))
      .filter((f) =>
        /['"`]\/offers\/?#calculator/.test(fs.readFileSync(path.join(ROOT, f), 'utf8')),
      );
    expect(hits).toEqual([]);
  });

  it('skaner wykrywa typowe naruszenia (samotest)', () => {
    expect(isOffender('/baza-wiedzy')).toBe(true);
    expect(isOffender('/offers#calculator')).toBe(true);
    expect(isOffender('/portfolio/${item.slug}')).toBe(true);
    expect(isOffender('/audyt-360?url=x')).toBe(true);
    expect(isOffender('/baza-wiedzy/')).toBe(false);
    expect(isOffender('/baza-wiedzy/?kategoria=tech')).toBe(false);
    expect(isOffender('/assets/images/sygnet.png')).toBe(false);
    expect(isOffender('/cennik.pdf')).toBe(false);
    expect(isOffender('/api/contact-submit')).toBe(false);
  });
});
