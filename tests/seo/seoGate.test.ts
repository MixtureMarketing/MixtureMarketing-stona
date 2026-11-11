import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, it, expect } from 'vitest';
import { auditDist, headTitle, imgsWithoutAlt } from '../../scripts/lib/seo-checks.js';

// MIX-781 (runda 2): bramka `npm run audit:gate` (scripts/seo-gate.js) — odmowa przy 0 stron,
// odmowa przy braku sitemap.xml, szybkość (bez CSSOM), te same kryteria co wcześniej.
const ROOT = path.resolve(__dirname, '../..');
const GATE = path.join(ROOT, 'scripts/seo-gate.js');
const NOW = new Date('2026-10-31');
const SITEMAP = '<urlset><url><loc>https://x/</loc><lastmod>2026-10-01</lastmod></url></urlset>';
const PAGE =
  '<html><head><title>Dobry tytuł</title></head><body><img src="/a.png" alt=""></body></html>';

const dirs: string[] = [];
function makeDist(opts: { pages?: Record<string, string>; sitemap?: string | null }): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-gate-'));
  dirs.push(dir);
  for (const [route, html] of Object.entries(opts.pages ?? {})) {
    fs.mkdirSync(path.join(dir, route), { recursive: true });
    fs.writeFileSync(path.join(dir, route, 'index.html'), html);
  }
  if (opts.sitemap != null) fs.writeFileSync(path.join(dir, 'sitemap.xml'), opts.sitemap);
  return dir;
}
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

function runGate(dir: string) {
  const r = spawnSync(process.execPath, [GATE, dir], { cwd: ROOT, encoding: 'utf8' });
  return { rc: r.status, out: r.stdout, err: r.stderr };
}

describe('bramka odmawia, gdy nie ma czego sprawdzać (0 stron)', () => {
  it('auditDist: dist bez stron + poprawna mapa → problem „0 stron”', () => {
    const dir = makeDist({ sitemap: SITEMAP });
    const { pages, problems } = auditDist(dir, NOW);
    expect(pages).toBe(0);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('0 stron index.html');
  });

  it('bliźniak: dist z jedną poprawną stroną → brak problemów', () => {
    const dir = makeDist({ pages: { dobra: PAGE }, sitemap: SITEMAP });
    expect(auditDist(dir, NOW)).toEqual({ pages: 1, problems: [] });
  });

  it('seo-gate.js: 0 stron → rc 1 i komunikat z powodem', () => {
    const r = runGate(makeDist({ sitemap: SITEMAP }));
    expect(r.rc).toBe(1);
    expect(r.err).toContain('seo-gate: 1 problemów na 0 stronach');
    expect(r.err).toContain('0 stron index.html');
  });

  it('bliźniak: seo-gate.js na poprawnym dist → rc 0', () => {
    const r = runGate(makeDist({ pages: { dobra: PAGE }, sitemap: SITEMAP }));
    expect(r.rc).toBe(0);
    expect(r.out).toContain('seo-gate: 1 stron');
  });

  it('pusty dist (bez stron i bez mapy) → dwa problemy, rc 1', () => {
    const dir = makeDist({});
    expect(auditDist(dir, NOW).problems).toHaveLength(2);
    expect(runGate(dir).rc).toBe(1);
  });

  it('brak katalogu dist → rc 1 i komunikat', () => {
    const r = runGate(path.join(os.tmpdir(), 'seo-gate-nie-ma-takiego-katalogu'));
    expect(r.rc).toBe(1);
    expect(r.err).toContain('brak katalogu');
  });
});

describe('bramka odmawia, gdy brak sitemap.xml albo jest pusta', () => {
  it('auditDist: brak sitemap.xml → problem „brak pliku” (strony poprawne)', () => {
    const dir = makeDist({ pages: { dobra: PAGE }, sitemap: null });
    const { problems } = auditDist(dir, NOW);
    expect(problems).toEqual(['dist/sitemap.xml: brak pliku']);
  });

  it('bliźniak: ten sam dist z sitemap.xml → brak problemów', () => {
    const dir = makeDist({ pages: { dobra: PAGE }, sitemap: SITEMAP });
    expect(auditDist(dir, NOW).problems).toEqual([]);
  });

  it('seo-gate.js: brak sitemap.xml → rc 1 i komunikat z powodem', () => {
    const r = runGate(makeDist({ pages: { dobra: PAGE }, sitemap: null }));
    expect(r.rc).toBe(1);
    expect(r.err).toContain('dist/sitemap.xml: brak pliku');
  });

  it('sitemap.xml bez żadnego <url> → problem „0 adresów”', () => {
    const dir = makeDist({ pages: { dobra: PAGE }, sitemap: '<urlset></urlset>' });
    const { problems } = auditDist(dir, NOW);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('0 adresów');
    expect(runGate(dir).rc).toBe(1);
  });

  it('adres bez lastmod w mapie nadal pada (kryterium bez zmian)', () => {
    const dir = makeDist({
      pages: { dobra: PAGE },
      sitemap: '<urlset><url><loc>https://x/a/</loc></url></urlset>',
    });
    expect(auditDist(dir, NOW).problems).toEqual(['https://x/a/: brak lastmod']);
  });
});

describe('parser bez CSSOM: szybkość i te same wyniki', () => {
  // Wzorzec z prerenderu: Tailwind 4 → @media w @layer. JSDOM parsuje taki CSS kwadratowo
  // (300 reguł ≈ 2 s, 1500 reguł ≈ minuty); parse5 nie buduje CSSOM, więc to milisekundy.
  const hostileCss = `@layer utilities{${Array.from(
    { length: 1500 },
    (_, i) => `@media (hover:hover){.h${i}:hover{color:blue}}`,
  ).join('')}}`;

  it('strona z ogromnym blokiem <style> jest sprawdzana w < 3 s i bez fałszywych problemów', () => {
    const page = `<html><head><title>Dobry tytuł</title><style>${hostileCss}</style></head><body><img src="/a.png" alt=""></body></html>`;
    const dir = makeDist({ pages: { a: page, b: page }, sitemap: SITEMAP });
    const t0 = performance.now();
    const { pages, problems } = auditDist(dir, NOW);
    const ms = performance.now() - t0;
    expect(problems).toEqual([]);
    expect(pages).toBe(2);
    expect(ms).toBeLessThan(3000);
  }, 20000);

  it('tytuł i obrazy są wykrywane mimo bloku <style> (nie „gubi” strony)', () => {
    const page = `<html><head><style>${hostileCss}</style><title>Za długi ${'x'.repeat(70)}</title></head><body><img src="/bez-alt.png"></body></html>`;
    const dir = makeDist({ pages: { zla: page }, sitemap: SITEMAP });
    const { problems } = auditDist(dir, NOW);
    expect(problems).toHaveLength(2);
    expect(problems[0]).toMatch(/^\/zla\/: <title> ma \d+ znaków \(> 60\)/);
    expect(problems[1]).toBe('/zla/: <img> bez atrybutu alt (src="/bez-alt.png")');
  }, 20000);

  it('headTitle: pierwszy <title> z <head>, SVG <title> w body pomijany', () => {
    const html =
      '<html><head><title>Głowa</title></head><body><svg><title></title></svg><title>Inny</title></body></html>';
    expect(headTitle(html)).toBe('Głowa');
    expect(
      headTitle('<html><head></head><body><svg><title>W SVG</title></svg></body></html>'),
    ).toBe('');
  });

  it('kolejność dokumentu: pierwszy <title> w <head> wygrywa, obrazy w kolejności z pliku', () => {
    expect(headTitle('<html><head><title>Pierwszy</title><title>Drugi</title></head></html>')).toBe(
      'Pierwszy',
    );
    const problems = imgsWithoutAlt(
      '<img src="/1.png"><div><img src="/2.png"></div><img src="/3.png">',
    );
    expect(problems.map((p) => p.match(/src="(.*)"/)?.[1])).toEqual(['/1.png', '/2.png', '/3.png']);
  });

  it('imgsWithoutAlt: alt="" przechodzi, brak atrybutu pada, <noscript> i <template> też sprawdzane', () => {
    expect(imgsWithoutAlt('<img src="/a.png" alt="">', '/r/')).toEqual([]);
    expect(imgsWithoutAlt('<img src="/a.png" alt="opis">', '/r/')).toEqual([]);
    expect(imgsWithoutAlt('<img src="/a.png">', '/r/')).toEqual([
      '/r/: <img> bez atrybutu alt (src="/a.png")',
    ]);
    expect(
      imgsWithoutAlt(
        '<html><body><p>x</p><noscript><img src="/n.png"></noscript></body></html>',
        '/r/',
      ),
    ).toHaveLength(1);
    expect(imgsWithoutAlt('<template><img src="/t.png"></template>', '/r/')).toHaveLength(1);
  });
});
