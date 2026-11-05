import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { routes } from '../../routes.js';
import { SEO_CONTENT } from '../../data/content/services/marketing/seo';

/**
 * MIX-898 (decyzja MIX-977): kanibalizacja fraz „pozycjonowanie / SEO Rzeszów”.
 * /pozycjonowanie-rzeszow/ → 301 → /agencja-seo-rzeszow/ (cennik + przewodnik na celu),
 * /marketing/seo/ bez „Rzeszów” w title (celuje w frazy ogólnopolskie).
 */
const root = path.resolve(__dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

const OLD = '/pozycjonowanie-rzeszow';
const TARGET = '/agencja-seo-rzeszow/';

const rules = read('public/_redirects')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [from, to, status] = l.split(/\s+/);
    return { from, to, status };
  });
const idxOf = (from: string) => rules.findIndex((r) => r.from === from);

describe('MIX-898: 301 /pozycjonowanie-rzeszow/ → /agencja-seo-rzeszow/', () => {
  it.each([OLD, `${OLD}/`])('%s → 301 na cel, przed catch-allem', (from) => {
    const idx = idxOf(from);
    expect(idx, from).toBeGreaterThanOrEqual(0);
    expect(rules[idx]).toEqual({ from, to: TARGET, status: '301' });
    expect(idx).toBeLessThan(idxOf('/*'));
  });

  it.each([
    '/pozycjonowanie-stron-rzeszow',
    '/pozycjonowanie-stron-www-rzeszow',
    '/pozycjonowanie-stron-internetowych-rzeszow',
  ])('wariant %s (z i bez slasha) idzie wprost na cel', (alias) => {
    for (const from of [alias, `${alias}/`]) {
      expect(rules[idxOf(from)], from).toEqual({ from, to: TARGET, status: '301' });
    }
  });

  it('żadne 301 nie prowadzi na adres, który sam jest przekierowany (bez łańcuchów)', () => {
    const sources = new Set(rules.filter((r) => r.status === '301').map((r) => r.from));
    const chains = rules.filter((r) => r.status === '301' && sources.has(r.to));
    expect(chains).toEqual([]);
  });

  it('cel jest prerenderowany i w sitemapie, stary adres nie', () => {
    expect(routes).toContain(TARGET);
    // Plik w dist/ wygrywa z _redirects — prerender starego adresu zjadłby 301.
    expect(routes).not.toContain(`${OLD}/`);
    expect(routes).not.toContain(OLD);
    const sitemap = read('public/sitemap.xml');
    expect(sitemap).toContain(`https://mixturemarketing.pl${TARGET}`);
    expect(sitemap).not.toContain(`https://mixturemarketing.pl${OLD}/`);
    expect(read('scripts/generate-sitemap.js')).not.toContain(`'${OLD}/'`);
  });

  it('trasa SPA starego adresu tylko przekierowuje (Navigate replace na cel)', () => {
    const src = read('config/routes.tsx');
    const line = src.split('\n').find((l) => l.includes(`path: '${OLD}'`));
    expect(line).toBeDefined();
    expect(line).toContain(`<Navigate to="${TARGET}" replace />`);
    expect(src).not.toMatch(/import\('@\/components\/pages\/PozycjonowanieRzeszow'\)/);
  });
});

describe('MIX-898: brak linków wewnętrznych na stary adres', () => {
  const listFiles = (dir: string): string[] => {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) return [];
    return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) return listFiles(rel);
      return /\.(tsx?|m?js)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [rel] : [];
    });
  };
  // Nieużywany plik dawnej strony (zostaje do decyzji o usunięciu) i tablica tras
  // (sprawdzana wyżej) — poza skanem.
  const SKIP = new Set(['components/pages/PozycjonowanieRzeszow.tsx', 'config/routes.tsx']);
  const files = [
    ...listFiles('components'),
    ...listFiles('data'),
    ...listFiles('services'),
    ...listFiles('config'),
    ...listFiles('scripts'),
    'routes.js',
  ].filter((f) => !SKIP.has(f));
  // Literał ścieżki w cudzysłowie (link, href, to=) — komentarze go nie zawierają.
  const LINK = /['"`]\/pozycjonowanie-rzeszow\/?['"`]/;

  it('skan obejmuje pliki stron i sekcji', () => {
    expect(files).toContain('components/sections/Services.tsx');
    expect(files).toContain('components/pages/SeoRzeszow.tsx');
  });

  it('żaden plik źródłowy nie linkuje do /pozycjonowanie-rzeszow/', () => {
    const hits = files.filter((f) => LINK.test(read(f)));
    expect(hits).toEqual([]);
  });

  it('llms.txt nie wskazuje starego adresu', () => {
    expect(read('public/llms.txt')).not.toContain(`${OLD}/`);
  });
});

describe('MIX-898: /agencja-seo-rzeszow/ przejmuje treść przewodnika', () => {
  const src = read('components/pages/SeoRzeszow.tsx');

  it('kanoniczny adres i cennik na stronie docelowej', () => {
    expect(src).toContain(`canonical="${TARGET}"`);
    expect(src).toContain('id="cennik"');
    for (const price of [
      'od 1 200 zł/mies',
      'od 2 500 zł/mies',
      'od 3 500 zł/mies',
      'od 1 900 zł',
    ]) {
      expect(src).toContain(price);
    }
  });

  it.each([
    'Co to jest pozycjonowanie stron internetowych i jak działa?',
    'Proces pozycjonowania krok po kroku',
    'Czy warto pozycjonować stronę firmową w Rzeszowie?',
    'Czy gwarantujecie pozycje TOP 10 w Google?',
    'Najlepsze dla:',
    'to="/audyt-360/"',
  ])('zawiera fragment przewodnika: %s', (fragment) => {
    expect(src).toContain(fragment);
  });

  it('meta description strony docelowej ≤ 160 znaków', () => {
    const m = src.match(/description="([^"]+)"/);
    expect(m).not.toBeNull();
    expect(m![1].length).toBeLessThanOrEqual(160);
  });
});

describe('MIX-898: /marketing/seo/ celuje w frazy ogólnopolskie', () => {
  it('title bez „Rzeszów”', () => {
    expect(SEO_CONTENT.seo.title).not.toMatch(/rzesz/i);
    expect(SEO_CONTENT.seo.title).toMatch(/Pozycjonowanie/);
  });
});
