// MIX-1855: kroki budowy dla /cennik/ (scripts/lib/cennikBuild.js, scripts/apply-cennik-build.mjs):
// z włączonym przełącznikiem dist/_redirects traci reguły /cennik, a dist/llms.txt dostaje linię;
// z wyłączonym dist zostaje bez zmian co do bajta. Funkcje czyste testowane na tekście i na plikach repo.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  CENNIK_LLMS_ANCHOR,
  CENNIK_LLMS_LINE,
  addCennikToLlms,
  stripCennikRedirects,
} from '../../scripts/lib/cennikBuild.js';
import { llmsReport } from '../../scripts/lib/llms.js';
import { prerenderOnlyRoutes } from '../../routes.js';

const root = path.resolve(__dirname, '../..');
const redirects = fs.readFileSync(path.join(root, 'public/_redirects'), 'utf8');
const llms = fs.readFileSync(path.join(root, 'public/llms.txt'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8');
const reguly = (t: string) =>
  t
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split(/\s+/));

describe('public/_redirects: reguły /cennik zostają w repo (wyłączony przełącznik = bez zmian)', () => {
  it.each(['/cennik', '/cennik/'])('%s → /offers/ 301', (from) => {
    expect(reguly(redirects)).toContainEqual([from, '/offers/', '301']);
  });
  it('komentarz wskazuje przełącznik i skrypt kroku budowy', () => {
    expect(redirects).toContain('VITE_MM_CENNIK');
    expect(redirects).toContain('scripts/apply-cennik-build.mjs');
  });
});

describe('stripCennikRedirects (czysta funkcja na tekście)', () => {
  it('zdejmuje dokładnie dwie reguły /cennik; reszta pliku bez zmiany, catch-all ostatni', () => {
    const po = stripCennikRedirects(redirects);
    const przed = reguly(redirects);
    const pozniej = reguly(po);
    expect(przed.filter((r) => r[0].startsWith('/cennik'))).toHaveLength(2);
    expect(pozniej.filter((r) => r[0].startsWith('/cennik'))).toHaveLength(0);
    expect(pozniej).toEqual(przed.filter((r) => !r[0].startsWith('/cennik')));
    expect(pozniej[pozniej.length - 1]).toEqual(['/*', '/404.html', '404']);
    // zostają sąsiednie aliasy (kolejna reguła po /cennik/ i wcześniejsza)
    expect(pozniej).toContainEqual(['/opinie', '/wycena/', '301']);
    expect(pozniej).toContainEqual(['/home/', '/', '301']);
    // komentarze i puste linie nietknięte
    const komentarze = (t: string) => t.split('\n').filter((l) => l.trim().startsWith('#'));
    expect(komentarze(po)).toEqual(komentarze(redirects));
  });

  it('nie rusza reguł o podobnym początku (/cennik-promocje, /cennikowy/)', () => {
    const t =
      '/cennik /offers/ 301\n/cennik/ /offers/ 301\n/cennik-promocje /x/ 301\n/cennikowy/ /y/ 301\n/* /404.html 404\n';
    expect(stripCennikRedirects(t)).toBe(
      '/cennik-promocje /x/ 301\n/cennikowy/ /y/ 301\n/* /404.html 404\n',
    );
  });

  it('zdejmuje regułę niezależnie od celu i wcięcia', () => {
    expect(
      stripCennikRedirects('  /cennik   /inne/   302\n/cennik/ /offers/ 301\n/a /b/ 301'),
    ).toBe('/a /b/ 301');
  });

  it('fail-closed: brak reguł, jedna reguła albo trzy reguły = błąd z liczbą', () => {
    expect(() => stripCennikRedirects('/a /b/ 301\n')).toThrow(
      /oczekiwano 2 regul \/cennik, zdjeto 0/,
    );
    expect(() => stripCennikRedirects('/cennik /offers/ 301\n')).toThrow(/zdjeto 1/);
    expect(() =>
      stripCennikRedirects('/cennik /a/ 301\n/cennik/ /a/ 301\n/cennik /b/ 301\n'),
    ).toThrow(/zdjeto 3/);
  });

  it('drugie uruchomienie na tym samym tekście = błąd (nie cichy sukces)', () => {
    const raz = stripCennikRedirects(redirects);
    expect(() => stripCennikRedirects(raz)).toThrow(/zdjeto 0/);
  });

  it('komentarz z „/cennik” nie jest regułą', () => {
    const t = '# /cennik /offers/ 301\n/cennik /offers/ 301\n/cennik/ /offers/ 301\n';
    expect(stripCennikRedirects(t)).toBe('# /cennik /offers/ 301\n');
  });
});

describe('addCennikToLlms (czysta funkcja na tekście)', () => {
  it('dopisuje jedną linię /cennik/ tuż po wpisie „Oferty i cennik orientacyjny”', () => {
    const po = addCennikToLlms(llms);
    const l: string[] = po.split('\n');
    const i = l.indexOf(CENNIK_LLMS_ANCHOR);
    expect(i).toBeGreaterThan(0);
    expect(l[i + 1]).toBe(CENNIK_LLMS_LINE);
    expect(l.filter((x: string) => x.includes('/cennik/'))).toHaveLength(1);
    expect(po.split('\n')).toHaveLength(llms.split('\n').length + 1);
    // oryginał poza tą jedną linią bez zmian
    expect(po.replace(`${CENNIK_LLMS_LINE}\n`, '')).toBe(llms);
  });

  it('idempotentna: druga próba nie dubluje linii', () => {
    const raz = addCennikToLlms(llms);
    expect(addCennikToLlms(raz)).toBe(raz);
  });

  it('fail-closed: brak kotwicy = błąd, nigdy cichy brak wpisu', () => {
    expect(() =>
      addCennikToLlms('# Mixture Marketing\n\n- [Kontakt](https://mixturemarketing.pl/contact/)\n'),
    ).toThrow(/brak wpisu/);
  });

  it('linia nie powtarza kwot (llms.txt celowo ich nie zawiera) ani słowa o abonamencie', () => {
    expect(CENNIK_LLMS_LINE).not.toMatch(/\d{3}|zł|abonament/i);
  });

  it('strażnik llms: z linią /cennik/ i adresem w sitemapie raport OK; bez adresu w sitemapie błąd', () => {
    const zCennikiem = sitemap.replace(
      '</urlset>',
      '<url><loc>https://mixturemarketing.pl/cennik/</loc><lastmod>2026-11-16</lastmod></url></urlset>',
    );
    const opts = { hiddenPaths: prerenderOnlyRoutes };
    const ok = llmsReport(addCennikToLlms(llms), zCennikiem, opts);
    expect(ok.problems).toEqual([]);
    expect(ok.ok).toBe(true);
    const bez = llmsReport(addCennikToLlms(llms), sitemap, opts);
    expect(bez.ok).toBe(false);
    expect(bez.notInSitemap.some((u: string) => u.includes('/cennik/'))).toBe(true);
  });
});

describe('scripts/apply-cennik-build.mjs na katalogu dist (osobny proces)', () => {
  let dist: string;
  beforeEach(() => {
    dist = fs.mkdtempSync(path.join(os.tmpdir(), 'cennik-dist-'));
    fs.writeFileSync(path.join(dist, '_redirects'), redirects);
    fs.writeFileSync(path.join(dist, 'llms.txt'), llms);
  });
  afterEach(() => fs.rmSync(dist, { recursive: true, force: true }));

  const run = (flag: string | undefined, d = dist) => {
    const env: Record<string, string | undefined> = { ...process.env };
    if (flag === undefined) delete env.VITE_MM_CENNIK;
    else env.VITE_MM_CENNIK = flag;
    return spawnSync(
      process.execPath,
      [path.join(root, 'scripts/apply-cennik-build.mjs'), `--dist=${d}`],
      { env, encoding: 'utf8' },
    );
  };

  it.each([[undefined], [''], ['0'], ['true'], ['yes'], [' 1']])(
    'przełącznik %p: rc 0, dist bez zmian co do bajta',
    (flag) => {
      const r = run(flag as string | undefined);
      expect(r.status).toBe(0);
      expect(r.stdout).toMatch(/przelacznik VITE_MM_CENNIK wylaczony/);
      expect(fs.readFileSync(path.join(dist, '_redirects'), 'utf8')).toBe(redirects);
      expect(fs.readFileSync(path.join(dist, 'llms.txt'), 'utf8')).toBe(llms);
    },
  );

  it('wyłączony przełącznik nie czyta plików: brak dist też daje rc 0', () => {
    const r = run('', path.join(dist, 'nie-ma'));
    expect(r.status).toBe(0);
  });

  it('przełącznik 1: dist/_redirects bez /cennik, dist/llms.txt z linią, rc 0', () => {
    const r = run('1');
    expect(r.status).toBe(0);
    const red = fs.readFileSync(path.join(dist, '_redirects'), 'utf8');
    expect(red).toBe(stripCennikRedirects(redirects));
    expect(reguly(red).some((x) => x[0].startsWith('/cennik'))).toBe(false);
    expect(fs.readFileSync(path.join(dist, 'llms.txt'), 'utf8')).toBe(addCennikToLlms(llms));
  });

  it('przełącznik 1 bez dist/_redirects albo z już zdjętymi regułami: rc 1 z powodem, pliki nietknięte', () => {
    expect(run('1').status).toBe(0);
    const red = fs.readFileSync(path.join(dist, '_redirects'), 'utf8');
    const ll = fs.readFileSync(path.join(dist, 'llms.txt'), 'utf8');
    const drugi = run('1');
    expect(drugi.status).toBe(1);
    expect(drugi.stderr).toMatch(/cennik: BLAD: _redirects: oczekiwano 2 regul/);
    expect(fs.readFileSync(path.join(dist, '_redirects'), 'utf8')).toBe(red);
    expect(fs.readFileSync(path.join(dist, 'llms.txt'), 'utf8')).toBe(ll);
    fs.rmSync(path.join(dist, '_redirects'));
    const bez = run('1');
    expect(bez.status).toBe(1);
    expect(bez.stderr).toMatch(/cennik: BLAD/);
  });

  it('uszkodzony llms.txt (brak kotwicy) przy przełączniku 1: rc 1 i _redirects nietknięty', () => {
    fs.writeFileSync(path.join(dist, 'llms.txt'), '# Mixture Marketing\n');
    const r = run('1');
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/brak wpisu/);
    expect(fs.readFileSync(path.join(dist, '_redirects'), 'utf8')).toBe(redirects);
  });
});

describe('package.json: krok budowy po vite build, przed sitemapą i prerenderem', () => {
  it('build = vite build && apply-cennik-build && sitemap && prerender', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    const b: string = pkg.scripts.build;
    const i = (s: string) => b.indexOf(s);
    expect(i('vite build')).toBe(0);
    expect(i('node scripts/apply-cennik-build.mjs')).toBeGreaterThan(i('vite build'));
    expect(i('npm run sitemap')).toBeGreaterThan(i('node scripts/apply-cennik-build.mjs'));
    expect(i('npm run prerender')).toBeGreaterThan(i('npm run sitemap'));
    expect(b).toMatch(/prerender && npm run audit:gate/);
  });
  it('public/sitemap.xml w repo nie zawiera /cennik/ (build go nadpisuje, nie commitujemy z /cennik/)', () => {
    expect(sitemap).not.toContain('/cennik');
    expect(llms).not.toContain('/cennik');
  });
});
