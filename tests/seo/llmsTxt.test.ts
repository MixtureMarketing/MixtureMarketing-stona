import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { prerenderOnlyRoutes } from '../../routes.js';
import { BASE_URL, KEY_PATHS, llmsReport, llmsUrls, sitemapUrls } from '../../scripts/lib/llms.js';

// MIX-1273 (plan SEO A32): każdy adres z public/llms.txt musi być w mapie strony, strony kluczowe
// muszą być w llms.txt, a strony ukryte (noindex / za flagą) nie mogą być wymienione.
const ROOT = path.resolve(__dirname, '../..');
const llms = fs.readFileSync(path.join(ROOT, 'public/llms.txt'), 'utf8');
const sitemap = fs.readFileSync(path.join(ROOT, 'public/sitemap.xml'), 'utf8');

const xml = (...paths: string[]) =>
  `<urlset>${paths.map((p) => `<url><loc>${BASE_URL}${p}</loc></url>`).join('')}</urlset>`;
const md = (...paths: string[]) => paths.map((p) => `- [x](${BASE_URL}${p}): opis`).join('\n');

describe('public/llms.txt vs public/sitemap.xml', () => {
  const report = llmsReport(llms, sitemap, { hiddenPaths: prerenderOnlyRoutes });

  it('mapa strony i llms.txt nie są puste', () => {
    expect(report.problems).toEqual([]);
    expect(report.llmsCount).toBeGreaterThan(30);
    expect(report.sitemapCount).toBeGreaterThan(50);
  });

  it('każdy adres z llms.txt jest w sitemap.xml (poza /sitemap.xml)', () => {
    expect(report.notInSitemap).toEqual([]);
  });

  it('strony kluczowe (nowe od 489c6b1 i lokalne) są w llms.txt: 0 brakujących', () => {
    expect(report.missingKey).toEqual([]);
    expect(report.keyNotInSitemap).toEqual([]);
  });

  it('ukryta strona usługi AI (MIX-1272) i inne prerenderOnly nie są w llms.txt', () => {
    expect(prerenderOnlyRoutes).toContain('/web-development/systemy-ai-aplikacje/');
    expect(report.hiddenListed).toEqual([]);
    expect(llms).not.toContain('systemy-ai-aplikacje');
  });

  it('strony kluczowe mają w llms.txt wpis listy `- [nazwa](adres): opis`', () => {
    for (const p of KEY_PATHS) {
      const entry = new RegExp(`^\\s*- \\[[^\\]]+\\]\\(${BASE_URL}${p}\\): \\S`, 'm');
      expect(llms, p).toMatch(entry);
    }
  });
});

describe('llmsReport: formy odmowy (fail-closed) i bliźniaki dozwolone', () => {
  const key = ['/a/'];
  const opts = { keyPaths: key, hiddenPaths: ['/hidden/'] };

  it('OK: adres w sitemapie, kluczowa obecna, /sitemap.xml dozwolony', () => {
    const r = llmsReport(md('/a/', '/sitemap.xml'), xml('/a/'), opts);
    expect(r.ok).toBe(true);
  });

  it('odmowa: adres w llms.txt, którego nie ma w sitemapie', () => {
    const r = llmsReport(md('/a/', '/b/'), xml('/a/'), opts);
    expect(r.ok).toBe(false);
    expect(r.notInSitemap).toEqual([`${BASE_URL}/b/`]);
  });

  it('odmowa: brak slasha na końcu to inny adres niż w sitemapie', () => {
    const r = llmsReport(md('/a/', '/b'), xml('/a/', '/b/'), opts);
    expect(r.notInSitemap).toEqual([`${BASE_URL}/b`]);
  });

  it('odmowa: strona kluczowa nieobecna w llms.txt', () => {
    const r = llmsReport(md('/c/'), xml('/a/', '/c/'), opts);
    expect(r.missingKey).toEqual([`${BASE_URL}/a/`]);
    expect(r.ok).toBe(false);
  });

  it('odmowa: strona kluczowa poza sitemapą', () => {
    const r = llmsReport(md('/a/'), xml('/z/'), opts);
    expect(r.keyNotInSitemap).toEqual([`${BASE_URL}/a/`]);
    expect(r.ok).toBe(false);
  });

  it('odmowa: ukryta strona wymieniona w llms.txt (także gdy trafiła do sitemapy)', () => {
    const r = llmsReport(md('/a/', '/hidden/'), xml('/a/', '/hidden/'), opts);
    expect(r.hiddenListed).toEqual([`${BASE_URL}/hidden/`]);
    expect(r.ok).toBe(false);
  });

  it('odmowa: pusty llms.txt albo pusta sitemapa to błąd, nie „0 brakujących”', () => {
    const a = llmsReport('', xml('/a/'), opts);
    expect(a.problems).toContain('llms.txt: brak adresów');
    expect(a.ok).toBe(false);
    const b = llmsReport(md('/a/'), '', opts);
    expect(b.problems).toContain('sitemap.xml: brak adresów');
    expect(b.ok).toBe(false);
    const c = llmsReport(undefined as unknown as string, undefined as unknown as string, opts);
    expect(c.ok).toBe(false);
  });

  it('odmowa: inny host niż mixturemarketing.pl nie jest w sitemapie', () => {
    const r = llmsReport('- [x](https://example.com/a/)', xml('/a/'), opts);
    expect(r.notInSitemap).toEqual(['https://example.com/a/']);
  });

  it('odmowa: /sitemap.xml na innym hoście nie korzysta z allowlisty', () => {
    const r = llmsReport('- [x](https://example.com/sitemap.xml)', xml('/a/'), opts);
    expect(r.notInSitemap).toEqual(['https://example.com/sitemap.xml']);
  });

  it('parsery: adres nagi w tekście (bez linku markdown) nie liczy się, loc z odstępami tak', () => {
    expect(llmsUrls(`tekst ${BASE_URL}/a/ koniec`)).toEqual([]);
    expect(sitemapUrls(`<loc>\n ${BASE_URL}/a/ \n</loc>`)).toEqual([`${BASE_URL}/a/`]);
  });
});
