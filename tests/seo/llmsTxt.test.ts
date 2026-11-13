import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prerenderOnlyRoutes } from '../../routes.js';
import {
  BASE_URL,
  KEY_PATHS,
  llmsReport,
  llmsUrls,
  sitemapUrls,
  unparsedUrlLike,
} from '../../scripts/lib/llms.js';

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

  it('parsery: adres nagi w tekście nie jest linkiem (ale raport go odrzuca), loc z odstępami tak', () => {
    expect(llmsUrls(`tekst ${BASE_URL}/a/ koniec`)).toEqual([]);
    expect(sitemapUrls(`<loc>\n ${BASE_URL}/a/ \n</loc>`)).toEqual([`${BASE_URL}/a/`]);
  });

  it('odmowa: tylko kluczowa poza sitemapą (/sitemap.xml z allowlisty), reszta czysta', () => {
    const k = { keyPaths: ['/a/', '/sitemap.xml'], hiddenPaths: [] };
    const r = llmsReport(md('/a/', '/sitemap.xml'), xml('/a/'), k);
    expect(r.notInSitemap).toEqual([]);
    expect(r.missingKey).toEqual([]);
    expect(r.hiddenListed).toEqual([]);
    expect(r.problems).toEqual([]);
    expect(r.keyNotInSitemap).toEqual([`${BASE_URL}/sitemap.xml`]);
    expect(r.ok).toBe(false);
    // bliźniak dozwolony: ta sama kluczowa także w sitemapie
    expect(llmsReport(md('/a/', '/sitemap.xml'), xml('/a/', '/sitemap.xml'), k).ok).toBe(true);
  });
});

describe('llmsReport: adres w formie, której parser nie sprawdza = odmowa z linią powodu', () => {
  const opts = { keyPaths: ['/a/'], hiddenPaths: [] };
  const base = md('/a/');
  const EVIL = 'https://evil.example/x';
  // [nazwa formy, linia dopisana do llms.txt, oczekiwany token w powodzie]
  const deny: [string, string, string][] = [
    ['adres nagi', `Zobacz ${EVIL}`, '://'],
    ['autolink <url>', `- <${EVIL}>`, '://'],
    ['spacja w celu linku', `- [x]( ${EVIL} )`, ']('],
    ['definicja referencyjna z adresem', `[x]: ${EVIL}`, '[x]:'],
    ['definicja referencyjna ze ścieżką', `[x]: /b/`, '[x]:'],
    ['cel w nawiasach <>', `- [x](<${EVIL}>)`, ']('],
    ['wielkie litery schematu', `- [x](HTTPS://evil.example/x)`, ']('],
    ['wielkie litery, adres nagi', `HTTPS://EVIL.EXAMPLE/x`, '://'],
    ['www bez schematu', `Zobacz www.evil.example/x`, 'www.'],
    ['WWW wielkimi literami', `Zobacz WWW.EVIL.EXAMPLE/x`, 'WWW.'],
    ['link względny', `- [x](/b/): opis`, ']('],
    ['link bez schematu //host', `- [x](//evil.example/x): opis`, ']('],
    ['tytuł w linku', `- [x](${BASE_URL}/a/ "t"): opis`, ']('],
    ['href w HTML', `<a href="/b/">b</a>`, 'href='],
    ['mailto', `Napisz: mailto:x@evil.example`, 'mailto:'],
    ['javascript', `javascript:alert(1)`, 'javascript:'],
    ['adres za poprawnym linkiem w tej samej linii', `- [x](${BASE_URL}/a/)${EVIL}`, '://'],
  ];
  for (const [name, line, token] of deny) {
    it(`odmowa: ${name}`, () => {
      const r = llmsReport(`${base}\n${line}`, xml('/a/'), opts);
      expect(r.ok).toBe(false);
      expect(r.problems).toEqual([
        `llms.txt linia 2: nierozpoznany adres (${token}): ${line.trim().slice(0, 80)}`,
      ]);
    });
  }

  // bliźniaki dozwolone: zwykły tekst z dwukropkiem, e-mail, nazwy z kropką, nawiasy bez linku
  const allow: [string, string][] = [
    ['poprawny link do strony z sitemapy', `- [y](${BASE_URL}/a/): opis`],
    ['e-mail bez mailto', 'Kontakt: info@mixturemarketing.pl'],
    ['nazwy techniczne z kropką', 'Next.js, Medusa.js, WordPress'],
    ['nawiasy kwadratowe bez linku', '- [uwaga] opis (w nawiasie): tekst'],
    ['słowo z „data” w środku', 'metadata: opis, update: 2025'],
    ['CRLF', `- [y](${BASE_URL}/a/): opis\r`],
  ];
  for (const [name, line] of allow) {
    it(`OK: ${name}`, () => {
      const r = llmsReport(`${base}\n${line}`, xml('/a/'), opts);
      expect(r.problems).toEqual([]);
      expect(r.ok).toBe(true);
    });
  }

  it('unparsedUrlLike: numer linii i kilka linii naraz', () => {
    expect(unparsedUrlLike(`a\nb\n${EVIL}\nc\n- <${EVIL}>`)).toEqual([
      `llms.txt linia 3: nierozpoznany adres (://): ${EVIL}`,
      `llms.txt linia 5: nierozpoznany adres (://): - <${EVIL}>`,
    ]);
    expect(unparsedUrlLike(llms)).toEqual([]);
  });
});

describe('scripts/check-llms.mjs: kod wyjścia i tekst odmowy', () => {
  let tmp = '';
  beforeAll(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'llms-'));
  });
  afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const run = (llmsText: string) => {
    const f = path.join(tmp, 'llms.txt');
    fs.writeFileSync(f, llmsText);
    return spawnSync('node', ['scripts/check-llms.mjs', `--llms=${f}`], {
      cwd: ROOT,
      encoding: 'utf8',
    });
  };

  it('OK: plik z repo przechodzi (rc 0)', () => {
    const r = run(llms);
    expect(r.stdout).toContain('llms-check: OK');
    expect(r.status).toBe(0);
  });

  it('odmowa: adres w formie referencyjnej dopisany na końcu (rc 1, linia PROBLEM)', () => {
    const lines = llms.replace(/\n$/, '').split('\n').length;
    const r = run(`${llms.replace(/\n$/, '')}\n[x]: https://evil.example/x\n`);
    expect(r.stdout).toContain(
      `PROBLEM: llms.txt linia ${lines + 1}: nierozpoznany adres ([x]:): [x]: https://evil.example/x`,
    );
    expect(r.stdout).toContain('llms-check: BŁĄD');
    expect(r.status).toBe(1);
  });
});
