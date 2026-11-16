// MIX-1849: usługa „Strona w abonamencie” nigdy nie wystartowała i znika ze strony.
// Strażnik: żadnej trasy, prerenderu, wpisu w sitemapie/llms.txt, odnośnika ani wzmianki
// o tej usłudze; każdy dawny adres ma 301 na /web-development/ przed catch-allem 404.
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { routes, prerenderOnlyRoutes } from '../../routes.js';
import { SERVICES_SECTION_DATA } from '../../data/content/services';

const ROOT = path.resolve(__dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const DAWNE = [
  '/abonament',
  '/abonament/professional',
  '/abonament/vs-wix',
  '/abonament/vs-orange-klikai',
  '/abonament/dziekujemy',
];
const CEL = '/web-development/';

const rules = read('public/_redirects')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [from, to, status] = l.split(/\s+/);
    return { from, to, status };
  });

const SRC_DIRS = ['components', 'config', 'data', 'utils', 'hooks', 'context', 'services', 'lib'];
const listFiles = (dir: string): string[] => {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => {
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) return listFiles(rel);
    return /\.(tsx?|jsx?|mjs|css|json)$/.test(e.name) ? [rel] : [];
  });
};
const SRC_FILES = [
  ...SRC_DIRS.flatMap(listFiles),
  ...listFiles('functions'),
  'App.tsx',
  'index.css',
  'index.html',
  'routes.js',
  'prerender.js',
];

/**
 * Słowo „abonament” w innym znaczeniu niż ta usługa (MIX-1849, kryterium 3): opłata za
 * platformę sklepu (Shopify/Shoper/Wix) i stała opieka techniczna agencji. Liczba wystąpień
 * na plik — nowa wzmianka gdziekolwiek indziej to błąd.
 */
const INNE_ZNACZENIE: Record<string, number> = {
  'components/pages/AgencjaInteraktywnaRzeszow.tsx': 1,
  'data/content/services/local-rzeszow.ts': 1,
  'data/content/services/web-development/ecommerce.ts': 5,
};
const SLOWO = /abonament|abonamenc/gi;

describe('MIX-1849: bez „Strony w abonamencie”', () => {
  it('routes.js: brak /abonament w trasach sitemapy i prerenderu', () => {
    for (const r of [...routes, ...prerenderOnlyRoutes]) expect(r).not.toMatch(/^\/abonament/);
  });

  it('config/routes.tsx: brak trasy /abonament i importu modułu', () => {
    const src = read('config/routes.tsx');
    expect(src).not.toMatch(/path: '\/abonament/);
    expect(src).not.toMatch(/pages\/abonament/);
    expect(fs.existsSync(path.join(ROOT, 'components/pages/abonament'))).toBe(false);
  });

  it.each(DAWNE)(
    '_redirects: %s (z i bez slasha) → 301 /web-development/ przed catch-allem',
    (p) => {
      const catchAll = rules.findIndex((r) => r.from === '/*');
      expect(catchAll).toBe(rules.length - 1);
      for (const from of [p, `${p}/`]) {
        const idx = rules.findIndex((r) => r.from === from);
        expect(idx, from).toBeGreaterThanOrEqual(0);
        expect(rules[idx]).toEqual({ from, to: CEL, status: '301' });
        expect(idx).toBeLessThan(catchAll);
      }
    },
  );

  it('_redirects: reszta /abonament/* też 301 na /web-development/, żadna reguła nie celuje w /abonament', () => {
    const splat = rules.findIndex((r) => r.from === '/abonament/*');
    expect(rules[splat]).toEqual({ from: '/abonament/*', to: CEL, status: '301' });
    for (const r of rules) expect(r.to, r.from).not.toMatch(/^\/abonament/);
    // Dawna kanonizacja slasha (/abonament/:slug → /abonament/:slug/) zniknęła.
    expect(rules.some((r) => r.from === '/abonament/:slug')).toBe(false);
  });

  it('sitemap.xml i llms.txt: 0 adresów /abonament i 0 wzmianek o usłudze', () => {
    for (const f of ['public/sitemap.xml', 'public/llms.txt']) {
      const s = read(f);
      expect(s, f).not.toMatch(/\/abonament/);
      expect(s.match(SLOWO), f).toBeNull();
    }
  });

  it('kod strony: 0 odnośników /abonament (menu, stopka, kafle, baner, dane strukturalne)', () => {
    const hits = SRC_FILES.filter((f) => read(f).includes('/abonament'));
    expect(hits).toEqual([]);
  });

  it('kod strony: słowo „abonament” tylko w znaczeniach niezwiązanych z usługą (lista z liczbami)', () => {
    const found: Record<string, number> = {};
    for (const f of SRC_FILES) {
      const n = (read(f).match(SLOWO) ?? []).length;
      if (n > 0) found[f] = n;
    }
    expect(found).toEqual(INNE_ZNACZENIE);
  });

  it('menu i strona główna: bez kafla usługi (desktop, telefon, sekcja usług)', () => {
    expect(read('components/layout/MegaMenu.tsx')).not.toMatch(/179 zł/);
    expect(read('components/layout/mobileMenuBData.ts')).not.toMatch(/promo/);
    expect(read('components/layout/MobileMenuB.tsx')).not.toMatch(/mmb-promo/);
    expect(read('data/content/pages/home.ts')).not.toMatch(/key: 'saas'/);
    expect(read('components/templates/pseo/PseoLocationContent.tsx')).not.toMatch(/179 zł/);
  });

  it('strona główna: sekcja usług ma dokładnie 3 kompetencje, każda z kluczem i ścieżką (bez pustego 4. wpisu)', () => {
    // Prerender / wywracał się na ErrorBoundary, gdy services.ts mapował usunięty 4. kafel.
    expect(SERVICES_SECTION_DATA.map((s) => s.key)).toEqual(['web', 'marketing', 'design']);
    for (const s of SERVICES_SECTION_DATA)
      expect(s.path).toMatch(/^\/(web-development|marketing|design)\/$/);
  });

  it('CSP: hub zapisu (api.mixturemarketing.pl) nie jest już źródłem connect-src', () => {
    expect(read('public/_headers')).not.toMatch(/api\.mixturemarketing\.pl/);
  });
});
