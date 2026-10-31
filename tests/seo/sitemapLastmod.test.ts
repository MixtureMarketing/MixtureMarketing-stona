import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { routes } from '../../routes.js';
import {
  assertLastmod,
  buildSitemapXml,
  formatLastmod,
  lastmodProblems,
  parseSitemap,
} from '../../scripts/lib/sitemap.js';
import { resolveLastmods, routeComponents, contentFiles } from '../../scripts/lib/lastmod.js';

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
