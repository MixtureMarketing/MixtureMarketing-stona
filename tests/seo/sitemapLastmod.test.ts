import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { routes } from '../../routes.js';
import { execFileSync } from 'node:child_process';
import {
  assertLastmod,
  buildSitemapXml,
  formatLastmod,
  lastmodProblems,
  parseSitemap,
  retiredImageFieldCount,
  sitemapStats,
} from '../../scripts/lib/sitemap.js';
import {
  resolveLastmods,
  routeComponents,
  contentFiles,
  gitLastDate,
} from '../../scripts/lib/lastmod.js';

// MIX-781 (M11): <lastmod> dla wszystkich adresów mapy strony, z prawdziwych dat zmian
// (nie z daty builda). Trasy statyczne: data/seo/lastmod.json (git log po plikach treści);
// trasy z Sanity: _updatedAt dokumentu.
const ROOT = path.resolve(__dirname, '../..');
const manifest: Record<string, string> = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data/seo/lastmod.json'), 'utf8'),
);
const TODAY = new Date().toISOString().split('T')[0];

describe('data/seo/lastmod.json — daty tras statycznych', () => {
  it('ma wpis dla każdej trasy z routes.js (i żadnego ponad nie)', () => {
    expect(Object.keys(manifest).sort()).toEqual([...routes].sort());
  });

  it.each(routes)('%s ma poprawną datę YYYY-MM-DD, nie z przyszłości', (route) => {
    expect(manifest[route]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(manifest[route] <= TODAY).toBe(true);
  });

  it('daty nie są jedną wspólną datą dla wszystkich stron (to byłaby data builda)', () => {
    expect(new Set(Object.values(manifest)).size).toBeGreaterThan(1);
  });

  it('każda trasa statyczna ma komponent w config/routes.tsx i pliki treści do datowania', () => {
    const comps = routeComponents(ROOT);
    for (const route of routes) {
      expect(comps[route], `${route}: brak komponentu w routes.tsx`).toBeTruthy();
      expect(contentFiles(ROOT, comps[route]).length, route).toBeGreaterThan(0);
    }
  });

  it('wspólna powłoka artykułów (ArticleShell) nie jest źródłem dat artykułów', () => {
    const comps = routeComponents(ROOT);
    const files = contentFiles(ROOT, comps['/baza-wiedzy/redis-optymalizacja/']);
    expect(files).toContain('components/articles/RedisArticle.tsx');
    expect(files).not.toContain('components/articles/ArticleShell.tsx');
  });

  it('pliki wspólne (layout/common/utils) nie są źródłem dat stron', () => {
    const comps = routeComponents(ROOT);
    const files = contentFiles(ROOT, comps['/offers/']);
    expect(files.some((f) => /^(components\/(layout|common|ui)|utils|services)\//.test(f))).toBe(
      false,
    );
  });
});

describe('sitemap: lastmod — nogi ujemne', () => {
  const ok = { url: 'https://x/a/', lastmod: '2026-10-01' };

  it('pada na adresie bez lastmod i podaje URL', () => {
    const problems = lastmodProblems([ok, { url: 'https://x/b/', lastmod: null }]);
    expect(problems).toEqual(['https://x/b/: brak lastmod']);
    expect(() => assertLastmod([{ url: 'https://x/b/' }])).toThrow(
      /1 adresów bez poprawnego lastmod:\n {2}https:\/\/x\/b\/: brak lastmod/,
    );
  });

  it('pada na złym formacie i dacie z przyszłości', () => {
    const now = new Date('2026-10-31T10:00:00Z');
    expect(lastmodProblems([{ url: 'u1', lastmod: '31.10.2026' }], now)).toEqual([
      'u1: zły format lastmod "31.10.2026"',
    ]);
    expect(lastmodProblems([{ url: 'u2', lastmod: '2026-11-02' }], now)).toEqual([
      'u2: lastmod z przyszłości (2026-11-02)',
    ]);
  });

  it('przepuszcza komplet poprawnych dat (także dzisiejszą)', () => {
    const now = new Date('2026-10-31T10:00:00Z');
    expect(lastmodProblems([ok, { url: 'u', lastmod: '2026-10-31' }], now)).toEqual([]);
    expect(() => assertLastmod([ok], now)).not.toThrow();
  });

  it('formatLastmod: brak/niepoprawna data → null, nigdy „dzisiaj”', () => {
    expect(formatLastmod(undefined)).toBeNull();
    expect(formatLastmod('nie-data')).toBeNull();
    expect(formatLastmod('2026-10-12T08:30:00Z')).toBe('2026-10-12');
  });

  it('XML: <lastmod> trafia do mapy, parseSitemap wykrywa adres bez lastmod', () => {
    const xml = buildSitemapXml([ok, { url: 'https://x/b/', lastmod: null }]);
    expect(xml).toContain('<lastmod>2026-10-01</lastmod>');
    expect(parseSitemap(xml)).toEqual([
      { url: 'https://x/a/', lastmod: '2026-10-01' },
      { url: 'https://x/b/', lastmod: null },
    ]);
    expect(lastmodProblems(parseSitemap(xml))).toEqual(['https://x/b/: brak lastmod']);
  });

  it('resolveLastmods: bez historii gita (płytki klon) używa manifestu 1:1', () => {
    // katalog bez .git → hasFullGitHistory = false → manifest bez zmian
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lastmod-nogit-'));
    try {
      const out = resolveLastmods(dir, ['/a/'], { '/a/': '2026-01-02' });
      expect(out).toEqual({ '/a/': '2026-01-02' });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('generator mapy nie wstawia lastmod: null dla tras statycznych ani daty builda', () => {
    const src = fs.readFileSync(path.join(ROOT, 'scripts/generate-sitemap.js'), 'utf8');
    expect(src).not.toMatch(/lastmod:\s*null/);
    expect(src).not.toMatch(/lastmod:\s*(new Date\(\)|today|formatLastmod\(new Date\(\)\))/);
    expect(src).toContain('assertLastmod(allEntries)');
  });

  it('npm run build uruchamia bramkę SEO po prerenderze', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.scripts.build).toMatch(/prerender && npm run audit:gate/);
    expect(pkg.scripts['audit:gate']).toBe('node scripts/seo-gate.js');
  });
});

// MIX-1266 (audyt P10): wycofane pola image (caption, title, geo_location) znikają z mapy.
describe('sitemap: wycofane pola rozszerzenia obrazkowego', () => {
  const withImage = {
    url: 'https://x/a/',
    lastmod: '2026-10-01',
    image: {
      loc: 'https://x/i.png',
      title: 'T',
      caption: 'C',
      geo: 'Rzeszów',
    },
  };

  it('image:loc zostaje, caption/title/geo_location nie trafiają do XML (nawet gdy wpis je niesie)', () => {
    const xml = buildSitemapXml([withImage]);
    expect(xml).toContain('<image:loc>https://x/i.png</image:loc>');
    expect(xml).not.toContain('image:caption');
    expect(xml).not.toContain('image:title');
    expect(xml).not.toContain('image:geo_location');
    expect(retiredImageFieldCount(xml)).toBe(0);
  });

  it('retiredImageFieldCount liczy każde z trzech pól (kontrola ujemna miernika)', () => {
    const dirty =
      '<url><image:image><image:caption>a</image:caption><image:title>b</image:title>' +
      '<image:geo_location>c</image:geo_location></image:image></url>';
    expect(retiredImageFieldCount(dirty)).toBe(3);
    expect(retiredImageFieldCount('<url><loc>x</loc></url>')).toBe(0);
  });

  it('sitemapStats: adresy, lastmod, wycofane pola, image:loc', () => {
    const xml = buildSitemapXml([withImage, { url: 'https://x/b/', lastmod: null }]);
    expect(sitemapStats(xml)).toEqual({
      urls: 2,
      withLastmod: 1,
      retiredImageFields: 0,
      imageLocs: 1,
    });
  });

  it('generator mapy nie ma już pól title/caption/geo we wpisach obrazów', () => {
    const src = fs.readFileSync(path.join(ROOT, 'scripts/generate-sitemap.js'), 'utf8');
    expect(src).not.toMatch(/^\s*(title|caption|geo):/m);
    expect(src).not.toMatch(/Piłsudskiego/);
  });

  it('zakomitowany public/sitemap.xml: lastmod na każdym adresie, 0 wycofanych pól, poprawne slugi branż', () => {
    const xml = fs.readFileSync(path.join(ROOT, 'public/sitemap.xml'), 'utf8');
    const stats = sitemapStats(xml);
    expect(stats.urls).toBeGreaterThan(60);
    expect(stats.withLastmod).toBe(stats.urls);
    expect(lastmodProblems(parseSitemap(xml))).toEqual([]);
    expect(stats.retiredImageFields).toBe(0);
    expect(xml).not.toContain('/branza/usugi-b2b/');
    expect(xml).not.toContain('/branza/saas--startups/');
  });
});

describe('lastmod: data autora, nie commitu (cherry-pick nie udaje świeżej zmiany)', () => {
  it('gitLastDate zwraca datę AUTORA commita, gdy data commitu jest późniejsza', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lastmod-git-'));
    const git = (...args: string[]) =>
      execFileSync('git', args, {
        cwd: dir,
        encoding: 'utf8',
        env: {
          ...process.env,
          GIT_AUTHOR_DATE: '2026-01-02T10:00:00Z',
          GIT_COMMITTER_DATE: '2026-03-04T10:00:00Z',
        },
      });
    try {
      git('init', '-q');
      fs.writeFileSync(path.join(dir, 'a.txt'), 'x');
      git('add', 'a.txt');
      git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'm');
      expect(gitLastDate(dir, ['a.txt'])).toBe('2026-01-02');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('gitLastDate: pusta lista plików albo plik nieznany gitowi → null (nigdy „dzisiaj”)', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lastmod-git-'));
    try {
      const git = (...args: string[]) => execFileSync('git', args, { cwd: dir });
      git('init', '-q');
      fs.writeFileSync(path.join(dir, 'a.txt'), 'x');
      git('add', 'a.txt');
      git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'm');
      expect(gitLastDate(dir, [])).toBeNull();
      expect(gitLastDate(dir, ['nie-ma.txt'])).toBeNull();
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

// MIX-1349 (uwaga z MIX-1266): trasa bez daty treści (ani z gita, ani z manifestu) ma dostać
// null, nigdy daty dzisiejszej. Tymczasowe repo z pełną historią (nie płytkie), więc idzie
// ścieżka „na żywo z gita + manifest”.
describe('resolveLastmods: brak daty treści → null, nie „dzisiaj”', () => {
  const COMMIT_DATE = '2026-01-02';
  const makeRepo = () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lastmod-resolve-'));
    const git = (...args: string[]) =>
      execFileSync('git', args, {
        cwd: dir,
        encoding: 'utf8',
        env: {
          ...process.env,
          GIT_AUTHOR_DATE: `${COMMIT_DATE}T10:00:00Z`,
          GIT_COMMITTER_DATE: `${COMMIT_DATE}T10:00:00Z`,
        },
      });
    git('init', '-q');
    fs.mkdirSync(path.join(dir, 'config'));
    fs.mkdirSync(path.join(dir, 'components/pages'), { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'config/routes.tsx'),
      [
        "const A = lazy(() => import('@/components/pages/A'));",
        "const B = lazy(() => import('@/components/pages/B'));",
        "export const r = [{ path: '/a', element: <A /> }, { path: '/b', element: <B /> }];",
      ].join('\n'),
    );
    fs.writeFileSync(path.join(dir, 'components/pages/A.tsx'), 'export default 1;');
    // B ma plik na dysku, ale git go nie zna (nowa, niescommitowana strona)
    fs.writeFileSync(path.join(dir, 'components/pages/B.tsx'), 'export default 2;');
    git('add', 'config/routes.tsx', 'components/pages/A.tsx');
    git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'm');
    return dir;
  };

  it('nogi ujemne: trasa bez daty z gita i bez wpisu w manifeście → null (nie dzisiejsza data)', () => {
    const dir = makeRepo();
    try {
      const out = resolveLastmods(dir, ['/b/', '/brak-komponentu/'], {});
      expect(out).toEqual({ '/b/': null, '/brak-komponentu/': null });
      for (const v of Object.values(out)) expect(v).not.toBe(TODAY);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('nogi dodatnie: data z gita, a gdy jej brak — z manifestu; git ma pierwszeństwo', () => {
    const dir = makeRepo();
    try {
      const out = resolveLastmods(dir, ['/a/', '/b/', '/c/'], {
        '/a/': '2025-05-05',
        '/b/': '2025-06-06',
      });
      expect(out['/a/']).toBe(COMMIT_DATE);
      expect(out['/b/']).toBe('2025-06-06');
      expect(out['/c/']).toBeNull();
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
