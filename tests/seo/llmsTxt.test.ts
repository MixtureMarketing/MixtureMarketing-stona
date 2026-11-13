import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { parse } from 'yaml';
import { prerenderOnlyRoutes } from '../../routes.js';
import {
  BASE_URL,
  KEY_PATHS,
  MAX_LINE,
  llmsReport,
  llmsUrls,
  sitemapUrls,
  decodePct,
} from '../../scripts/lib/llms.js';

// MIX-1657 (przeprojektowanie MIX-1273 po regule 73): public/llms.txt przechodzi tylko wtedy, gdy KAŻDA
// linia pasuje do jednej dozwolonej formy (nagłówek, pusta, opis `> `, odnośnik `- [t](https://
// mixturemarketing.pl/ścieżka): opis`, punkt listy, akapit) i tekst nie ma tokenu adresu; do tego skan
// całego pliku na ścieżki z prerenderOnlyRoutes. Każda odmowa ma dozwolonego bliźniaka.
const ROOT = path.resolve(__dirname, '../..');
const llms = fs.readFileSync(path.join(ROOT, 'public/llms.txt'), 'utf8');
const sitemap = fs.readFileSync(path.join(ROOT, 'public/sitemap.xml'), 'utf8');

const xml = (...paths: string[]) =>
  `<urlset>${paths.map((p) => `<url><loc>${BASE_URL}${p}</loc></url>`).join('')}</urlset>`;
const cut = (s: string) => s.normalize('NFKC').trim().slice(0, 80);

describe('public/llms.txt (plik z repo) vs public/sitemap.xml i prerenderOnlyRoutes', () => {
  const report = llmsReport(llms, sitemap, { hiddenPaths: prerenderOnlyRoutes });

  it('każda linia pasuje do gramatyki, 0 problemów, ok', () => {
    expect(report.problems).toEqual([]);
    expect(report.ok).toBe(true);
    expect(report.llmsCount).toBeGreaterThan(30);
    expect(report.sitemapCount).toBeGreaterThan(50);
  });

  it('każdy adres z llms.txt jest w sitemap.xml (poza /sitemap.xml), 0 ukrytych', () => {
    expect(report.notInSitemap).toEqual([]);
    expect(report.hiddenListed).toEqual([]);
  });

  it('strony kluczowe są w llms.txt i w sitemapie: 0 brakujących', () => {
    expect(report.missingKey).toEqual([]);
    expect(report.keyNotInSitemap).toEqual([]);
  });

  it('ukryta strona usługi AI (MIX-1272) jest na liście ukrytych i nie ma jej w llms.txt', () => {
    expect(prerenderOnlyRoutes).toContain('/web-development/systemy-ai-aplikacje/');
    expect(llms).not.toContain('systemy-ai-aplikacje');
  });

  it('strony kluczowe mają w llms.txt wpis listy `- [nazwa](adres): opis`', () => {
    for (const p of KEY_PATHS) {
      const entry = new RegExp(`^\\s*- \\[[^\\]]+\\]\\(${BASE_URL}${p}\\): \\S`, 'm');
      expect(llms, p).toMatch(entry);
    }
  });

  it('ukryta strona dopisana do pliku z repo w prozie = odmowa (prawdziwa lista ukrytych)', () => {
    const line = 'Zobacz mixturemarketing.pl/web-development/systemy-ai-aplikacje/';
    const n = llms.replace(/\n$/, '').split('\n').length + 1;
    const r = llmsReport(`${llms}${line}\n`, sitemap, { hiddenPaths: prerenderOnlyRoutes });
    expect(r.ok).toBe(false);
    expect(r.problems).toEqual([
      `llms.txt linia ${n}: ścieżka adresu (/segment): /web-development/: ${line}`,
      `llms.txt linia ${n}: ścieżka strony ukrytej /web-development/systemy-ai-aplikacje/ (/web-development/systemy-ai-aplikacje/)`,
    ]);
  });
});

describe('llmsReport: gramatyka linii, formy ataku i bliźniaki dozwolone', () => {
  const opts = { keyPaths: ['/a/'], hiddenPaths: ['/hidden/', '/x/ukryta-strona/'] };
  // /hidden/ jest też w sitemapie: odmowa ma wynikać z listy ukrytych, nie z braku w sitemapie.
  const sm = xml('/a/', '/b/', '/hidden/');
  const base = `# T\n\n- [a](${BASE_URL}/a/): opis\n`;
  const L = 'llms.txt linia 4: ';
  const B = BASE_URL;
  // [nazwa, linia 4, powody (`=…` bez wycinka linii, `!…` cały wiersz), bliźniak dozwolony]
  const forms: [string, string, string[], string][] = [
    // 8 form, które przeszły w MIX-1273 r2
    [
      'r2: host i ukryta ścieżka w prozie',
      'Strona mixturemarketing.pl/hidden/ w tekście',
      ['ścieżka adresu (/segment): /hidden/', '=ścieżka strony ukrytej /hidden/ (/hidden/)'],
      'Strona mixturemarketing w tekście',
    ],
    [
      'r2: goła ścieżka /a/b/ w prozie',
      'Zobacz /web-development/systemy-ai/',
      ['ścieżka adresu (/segment): /w'],
      'Zobacz web development i systemy AI',
    ],
    [
      'r2: host bez schematu evil.example/x',
      'Zobacz evil.example/x',
      ['słowo z kropką (host?): evil.example'],
      'Zobacz evil example x',
    ],
    [
      'r2: //evil.example/x',
      'Zobacz //evil.example/x',
      ['podwójny ukośnik (//): //'],
      'Zobacz / evil example',
    ],
    [
      'r2: dwukropek pełnej szerokości ：//',
      'https：//evil.example/x',
      ['podwójny ukośnik (//): //'],
      'Uwaga： tekst',
    ],
    ['r2: ZWSP', 'Zo​bacz', ['znak niewidoczny albo sterujący U+200B'], 'Zobacz'],
    ['r2: encja &#58;', 'Zobacz &#58; tu', ['encja HTML (&…): &#'], 'Zobacz & tu'],
    [
      'r2: srcset w prozie',
      'Obraz srcset="/b/x 1x"',
      ['ścieżka adresu (/segment): "/b'],
      'Obraz srcset w tekście',
    ],
    [
      'srcset w znaczniku HTML',
      '<img srcset="/b/x 1x">',
      ['linia nie pasuje do żadnej dozwolonej formy'],
      'img srcset',
    ],
    // reguły odnośnika (forma 4)
    [
      'www.',
      `- [x](https://www.mixturemarketing.pl/b/): o`,
      ['host inny niż mixturemarketing.pl (www.mixturemarketing.pl)'],
      `- [x](${B}/b/): o`,
    ],
    [
      'subdomena',
      `- [x](https://sub.mixturemarketing.pl/b/): o`,
      ['host inny niż mixturemarketing.pl (sub.mixturemarketing.pl)'],
      `- [x](${B}/b/): o`,
    ],
    [
      'obcy host z tą samą ścieżką',
      `- [x](https://evil.example/b/): o`,
      ['host inny niż mixturemarketing.pl (evil.example)'],
      `- [x](${B}/b/): o`,
    ],
    [
      'userinfo a@',
      `- [x](https://a@mixturemarketing.pl/b/): o`,
      ['dane logowania w adresie (user@)'],
      `- [x](${B}/b/): o`,
    ],
    [
      'port',
      `- [x](https://mixturemarketing.pl:443/b/): o`,
      ['port w adresie'],
      `- [x](${B}/b/): o`,
    ],
    ['query', `- [x](${B}/b/?q=1): o`, ['zapytanie (?query) w adresie'], `- [x](${B}/b/): o`],
    ['fragment', `- [x](${B}/b/#f): o`, ['fragment (#) w adresie'], `- [x](${B}/b/): o`],
    ['// w ścieżce', `- [x](${B}//b/): o`, ['podwójny ukośnik w ścieżce'], `- [x](${B}/b/): o`],
    [
      '.. w ścieżce',
      `- [x](${B}/a/../b/): o`,
      ['segment kropkowy (. albo ..) w ścieżce'],
      `- [x](${B}/b/): o`,
    ],
    [
      '%2e%2e w ścieżce',
      `- [x](${B}/a/%2e%2e/b/): o`,
      ['kodowanie procentowe (%XX) w ścieżce'],
      `- [x](${B}/b/): o`,
    ],
    [
      'http zamiast https',
      `- [x](http://mixturemarketing.pl/b/): o`,
      ['schemat inny niż https (http)'],
      `- [x](${B}/b/): o`,
    ],
    [
      'HTTPS wielkimi',
      `- [x](HTTPS://mixturemarketing.pl/b/): o`,
      ['schemat inny niż https (HTTPS)'],
      `- [x](${B}/b/): o`,
    ],
    [
      'wielka litera w ścieżce',
      `- [x](${B}/B/): o`,
      ['znak spoza listy w ścieżce'],
      `- [x](${B}/b/): o`,
    ],
    [
      'adres pełnej szerokości w odnośniku (NFKC zmienia adres)',
      `- [x](${B}/ｂ/): o`,
      ['adres odnośnika zmienia się po normalizacji NFKC'],
      `- [x](${B}/b/): o`,
    ],
    ['adres spoza sitemapy', `- [x](${B}/c/): o`, ['=adres spoza sitemapy: /c/'], `- [x](${B}/b/)`],
    [
      'odnośnik do strony ukrytej (choć jest w sitemapie)',
      `- [x](${B}/hidden/): o`,
      ['=odnośnik do strony ukrytej: /hidden/', '=ścieżka strony ukrytej /hidden/ (/hidden/)'],
      `  - [x](${B}/b/): o`,
    ],
    [
      'odnośnik do strony ukrytej bez / na końcu',
      `- [x](${B}/hidden): o`,
      ['=odnośnik do strony ukrytej: /hidden', '=ścieżka strony ukrytej /hidden/ (/hidden)'],
      `- [x](${B}/b/): o`,
    ],
    [
      'tekst za odnośnikiem bez `: `',
      `- [x](${B}/b/) https://evil.example`,
      ['odnośnik w formie innej niż `- [tekst](https://…/ścieżka/): opis`'],
      `- [x](${B}/b/): https w opisie`,
    ],
    [
      'host w tekście odnośnika',
      `- [evil.example](${B}/b/): o`,
      ['słowo z kropką (host?): evil.example'],
      `- [Next.js](${B}/b/): o`,
    ],
    [
      'ścieżka ukryta w opisie odnośnika',
      `- [x](${B}/b/): zobacz /hidden/`,
      ['ścieżka adresu (/segment): /h', '=ścieżka strony ukrytej /hidden/ (/hidden/)'],
      `- [x](${B}/b/): zobacz ukryte`,
    ],
    [
      'autolink <url>',
      '- <https://evil.example/x>',
      ['podwójny ukośnik (//): //'],
      '- adres na stronie',
    ],
    [
      'definicja referencyjna [x]: url',
      '[x]: https://evil.example/x',
      ['linia nie pasuje do żadnej dozwolonej formy'],
      'x: tekst',
    ],
    // tekst i znaki (NFKC, niewidoczne, encje, kodowanie)
    [
      '%2F-zakodowana ukryta ścieżka',
      'Zobacz %2Fhidden%2F',
      ['kodowanie procentowe (%XX): %2f', '=ścieżka strony ukrytej /hidden/ (/hidden/)'],
      'Zobacz 100% hidden',
    ],
    [
      'formy-ataku AA2: podwójne kodowanie %252F',
      'Zobacz %252Fhidden%252F',
      ['kodowanie procentowe (%XX): %25', '=ścieżka strony ukrytej /hidden/ (/hidden/)'],
      'Zobacz 25% hidden',
    ],
    ['encja nazwana &colon;', 'Zobacz &colon; tu', ['encja HTML (&…): &c'], 'Zobacz : tu'],
    [
      'dwukropek pełnej szerokości (schemat)',
      'javascript：alert(1)',
      ['dwukropek bez odstępu po nim (schemat adresu): :a'],
      'javascript： alert',
    ],
    [
      'mailto:',
      'mailto:x@evil.example',
      ['dwukropek bez odstępu po nim (schemat adresu): :x'],
      'Kontakt: info@mixturemarketing.pl',
    ],
    [
      'e-mail w obcej domenie',
      'Napisz na x@evil.example',
      ['słowo z kropką (host?): x@evil.example'],
      'Napisz na info@mixturemarketing.pl',
    ],
    [
      'goła ścieżka /b w prozie',
      'Zobacz /b tu',
      ['ścieżka adresu (/segment): /b'],
      'ROI/ROAS i UI/UX',
    ],
    [
      'formy-ataku U2: host literami matematycznymi',
      '𝐞𝐯𝐢𝐥.𝐞𝐱𝐚𝐦𝐩𝐥𝐞',
      ['słowo z kropką (host?): evil.example'],
      '𝐞𝐯𝐢𝐥 tekst',
    ],
    [
      'host pełnej szerokości',
      'ｅｖｉｌ．ｅｘａｍｐｌｅ',
      ['słowo z kropką (host?): evil.example'],
      'ｅｖｉｌ ｅｘａｍｐｌｅ',
    ],
    [
      'kropka ideograficzna 。',
      'Zobacz evil。example',
      ['słowo z kropką (host?): evil。example'],
      'Zobacz evil. Example',
    ],
    ['adres IP', 'Serwer 1.2.3.4', ['słowo z kropką (host?): 1.2.3.4'], 'Serwer 1, 2, 3'],
    [
      'ukośnik wsteczny',
      'Zobacz a\\b',
      ['znak niedozwolony w tekście (\\ < > [ ]): \\'],
      'Zobacz a b',
    ],
    [
      'host w nagłówku',
      '## evil.example',
      ['słowo z kropką (host?): evil.example'],
      '## evil example',
    ],
    [
      'adres w opisie >',
      '> https://evil.example',
      ['podwójny ukośnik (//): //'],
      '> https w opisie',
    ],
    ['pusty nagłówek', '# ', ['pusty tekst'], '# Nagłówek'],
    ['nagłówek ###', '### h3', ['linia nie pasuje do żadnej dozwolonej formy'], '## h2'],
    ['nagłówek bez spacji', '#h', ['linia nie pasuje do żadnej dozwolonej formy'], '# h'],
    ['wcięcie 3 spacje', '   - x', ['linia nie pasuje do żadnej dozwolonej formy'], '  - x'],
    ['odstęp na końcu', 'tekst ', ['odstęp na końcu linii'], 'tekst'],
    // wejście: odstępy, końce linii, znaki sterujące (formy-ataku B7, B9, U5)
    ['linia z samymi spacjami', '   ', ['linia z samymi odstępami'], ''],
    ['formy-ataku B7/B9: linia z samym NBSP', ' ', ['linia z samymi odstępami'], ''],
    [
      'CRLF',
      `- [x](${B}/b/): o\r`,
      ['znak CR (końce linii CRLF są odrzucane)'],
      `- [x](${B}/b/): o`,
    ],
    ['tabulator', '\tx', ['znak niewidoczny albo sterujący U+0009'], 'x'],
    ['U+2060 word joiner', 'x⁠y', ['znak niewidoczny albo sterujący U+2060'], 'xy'],
    ['U+FEFF w środku tekstu', 'x﻿y', ['znak niewidoczny albo sterujący U+FEFF'], 'xy'],
    ['formy-ataku U5: RLO U+202E', 'x‮y', ['znak niewidoczny albo sterujący U+202E'], 'xy'],
    ['formy-ataku B9: kod ANSI', '\u001b[31mx', ['znak niewidoczny albo sterujący U+001B'], 'x'],
    ['formy-ataku B9: NUL', 'x\u0000', ['znak niewidoczny albo sterujący U+0000'], 'x'],
    ['miękki dywiz U+00AD', 'x­y', ['znak niewidoczny albo sterujący U+00AD'], 'xy'],
    [
      'linia za długa',
      'a'.repeat(MAX_LINE + 1),
      [`linia dłuższa niż ${MAX_LINE} znaków`],
      'a'.repeat(MAX_LINE),
    ],
  ];

  const expected = (line: string, whys: string[]) =>
    whys.map((w) =>
      w.startsWith('=')
        ? `${L}${w.slice(1)}`
        : w.startsWith('!')
          ? w.slice(1)
          : `${L}${w}: ${cut(line)}`,
    );

  it(`co najmniej 25 form odmowy (jest ${forms.length})`, () => {
    expect(forms.length).toBeGreaterThanOrEqual(25);
  });

  for (const [name, line, whys, twin] of forms) {
    it(`odmowa: ${name}`, () => {
      const r = llmsReport(`${base}${line}\n`, sm, opts);
      expect(r.problems).toEqual(expected(line, whys));
      expect(r.ok).toBe(false);
    });
    it(`OK (bliźniak): ${name}`, () => {
      const r = llmsReport(`${base}${twin}\n`, sm, opts);
      expect(r.problems).toEqual([]);
      expect(r.ok).toBe(true);
    });
  }

  it('ścieżka ukryta rozbita spacją: skan całego pliku bez odstępów', () => {
    const r = llmsReport(`${base}Zobacz x/ukryta- strona/ tu\n`, sm, opts);
    expect(r.problems).toEqual([
      'llms.txt: ścieżka strony ukrytej /x/ukryta-strona/ (ukryta-strona) po usunięciu odstępów',
    ]);
    expect(llmsReport(`${base}Zobacz x ukryta strona tu\n`, sm, opts).ok).toBe(true);
  });

  it('nazwa strony ukrytej z myślnikiem (ostatni człon) w prozie', () => {
    const r = llmsReport(`${base}O ukryta-strona tu\n`, sm, opts);
    expect(r.problems).toEqual([`${L}ścieżka strony ukrytej /x/ukryta-strona/ (ukryta-strona)`]);
    expect(llmsReport(`${base}O ukryta strona tu\n`, sm, opts).ok).toBe(true);
  });

  it('BOM na początku pliku = odmowa; ten sam plik bez BOM przechodzi', () => {
    const r = llmsReport(`﻿${base}`, sm, opts);
    expect(r.problems).toEqual(['llms.txt linia 1: BOM na początku pliku: # T']);
    expect(llmsReport(base, sm, opts).ok).toBe(true);
  });

  it('wszystkie formy dozwolone naraz (nagłówki, pusta, opis, odnośniki, podpunkt, lista, akapit)', () => {
    const ok = [
      '# Firma',
      '## Sekcja (opis)',
      '',
      '> Opis firmy, Sp. z o.o., Next.js i Medusa.js.',
      `- [a](${B}/a/): opis — z myślnikiem; i średnikiem`,
      `- [b](${B}/b/)`,
      `  - [Mapa](${B}/sitemap.xml)`,
      '- **NIP**: PL123, tel. +48 1, 17/4',
      '  - Kluczowe artykuły:',
      'Akapit: info@mixturemarketing.pl, Google Meet / Zoom, WebP/AVIF.',
      '**Pogrubienie** na początku',
    ].join('\n');
    const r = llmsReport(`${ok}\n`, sm, opts);
    expect(r.problems).toEqual([]);
    expect(r.ok).toBe(true);
    expect(r.llmsCount).toBe(3);
  });
});

describe('llmsReport: wejście puste albo nieczytelne = odmowa (fail-closed)', () => {
  const opts = { keyPaths: ['/a/'], hiddenPaths: ['/hidden/'] };
  const ok = `- [a](${BASE_URL}/a/): opis\n`;

  it('pusta lista stron ukrytych = odmowa; lista z jednym wpisem przechodzi', () => {
    const msg = 'lista stron ukrytych (prerenderOnlyRoutes) pusta albo nieczytelna';
    for (const hiddenPaths of [[], undefined, [''], ['bez-ukosnika'], [42]]) {
      const r = llmsReport(ok, xml('/a/'), {
        keyPaths: ['/a/'],
        hiddenPaths: hiddenPaths as unknown as string[],
      });
      expect(r.problems).toEqual([msg]);
      expect(r.ok).toBe(false);
    }
    expect(llmsReport(ok, xml('/a/'), opts).ok).toBe(true);
  });

  it('pusta sitemapa albo sitemapa z innym hostem = odmowa', () => {
    expect(llmsReport(ok, '', opts).problems).toEqual([
      'sitemap.xml: brak adresów',
      'llms.txt linia 1: adres spoza sitemapy: /a/',
    ]);
    const other = '<urlset><url><loc>https://evil.example/a/</loc></url></urlset>';
    expect(llmsReport(ok, other, opts).ok).toBe(false);
  });

  it('pusty albo nieczytelny llms.txt, plik bez odnośników = odmowa', () => {
    expect(llmsReport('', xml('/a/'), opts).problems).toEqual(['llms.txt: pusty albo nieczytelny']);
    const u = llmsReport(undefined as unknown as string, xml('/a/'), opts);
    expect(u.problems).toEqual(['llms.txt: pusty albo nieczytelny']);
    expect(u.ok).toBe(false);
    expect(llmsReport('# T\n', xml('/a/'), opts).problems).toEqual(['llms.txt: brak adresów']);
    expect(llmsReport('\n', xml('/a/'), opts).ok).toBe(false);
  });

  it('strona kluczowa nieobecna w llms.txt albo poza sitemapą = odmowa', () => {
    const r = llmsReport(`- [b](${BASE_URL}/b/)\n`, xml('/a/', '/b/'), opts);
    expect(r.missingKey).toEqual([`${BASE_URL}/a/`]);
    expect(r.ok).toBe(false);
    const k = llmsReport(`- [m](${BASE_URL}/sitemap.xml)\n`, xml('/a/'), {
      keyPaths: ['/sitemap.xml'],
      hiddenPaths: ['/hidden/'],
    });
    expect(k.problems).toEqual([]);
    expect(k.keyNotInSitemap).toEqual([`${BASE_URL}/sitemap.xml`]);
    expect(k.ok).toBe(false);
  });

  it('numery linii przy kilku odmowach naraz', () => {
    const r = llmsReport(`${ok}a\nevil.example\nb\na //x\n`, xml('/a/'), opts);
    expect(r.problems).toEqual([
      'llms.txt linia 3: słowo z kropką (host?): evil.example: evil.example',
      'llms.txt linia 5: podwójny ukośnik (//): //: a //x',
    ]);
  });

  it('parsery pomocnicze: sitemapUrls, llmsUrls, decodePct', () => {
    expect(sitemapUrls(`<loc>\n ${BASE_URL}/a/ \n</loc>`)).toEqual([`${BASE_URL}/a/`]);
    expect(llmsUrls(`- [x](${BASE_URL}/a/): o\ntekst ${BASE_URL}/b/`)).toEqual([`${BASE_URL}/a/`]);
    expect(decodePct('%252Fa%2F')).toBe('/a/');
  });
});

describe('scripts/check-llms.mjs: kod wyjścia i tekst odmowy', () => {
  let tmp = '';
  beforeAll(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'llms-'));
  });
  afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const run = (llmsText: string, extra: string[] = []) => {
    const f = path.join(tmp, 'llms.txt');
    fs.writeFileSync(f, llmsText);
    return spawnSync('node', ['scripts/check-llms.mjs', `--llms=${f}`, ...extra], {
      cwd: ROOT,
      encoding: 'utf8',
    });
  };
  const lines = llms.replace(/\n$/, '').split('\n').length;

  it('OK: plik z repo przechodzi (rc 0)', () => {
    const r = run(llms);
    expect(r.stdout).toContain('llms-check: OK');
    expect(r.status).toBe(0);
  });

  it('odmowa: ukryta strona (prerenderOnlyRoutes) w prozie, rc 1 i linia PROBLEM', () => {
    const line = 'Strona mixturemarketing.pl/abonament/dziekujemy/ po płatności';
    const r = run(`${llms}${line}\n`);
    expect(r.stdout).toContain(
      `PROBLEM: llms.txt linia ${lines + 1}: ścieżka strony ukrytej /abonament/dziekujemy/ (/abonament/dziekujemy/)`,
    );
    expect(r.stdout).toContain('llms-check: BŁĄD');
    expect(r.status).toBe(1);
  });

  it('odmowa: ukryta strona zakodowana %2F, rc 1', () => {
    const r = run(`${llms}Zobacz %2Fabonament%2Fdziekujemy\n`);
    expect(r.stdout).toContain(
      `PROBLEM: llms.txt linia ${lines + 1}: ścieżka strony ukrytej /abonament/dziekujemy/ (/abonament/dziekujemy)`,
    );
    expect(r.status).toBe(1);
  });

  it('odmowa: brak pliku albo pusty argument, rc 1 i BŁĄD odczytu', () => {
    const r = run(llms, [`--sitemap=${path.join(tmp, 'brak.xml')}`]);
    expect(r.stderr).toContain('check-llms: BŁĄD odczytu');
    expect(r.stdout).toContain('llms-check: BŁĄD');
    expect(r.status).toBe(1);
    const e = spawnSync('node', ['scripts/check-llms.mjs', '--llms='], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    expect(e.stderr).toContain('check-llms: BŁĄD odczytu');
    expect(e.status).toBe(1);
  });
});

describe('CI: strażnik llms.txt jest wołany w workflow po buildzie i blokuje', () => {
  type Krok = { name?: string; run?: string; if?: string; 'continue-on-error'?: boolean };
  const w = parse(fs.readFileSync(path.join(ROOT, '.github/workflows/ci.yml'), 'utf8')) as {
    jobs: { ci: { steps: Krok[] } };
  };
  const kroki = w.jobs.ci.steps;
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {
    scripts: Record<string, string>;
  };

  it('krok `npm run audit:llms` po `npm run build`, bez warunku i bez continue-on-error', () => {
    expect(pkg.scripts['audit:llms']).toBe('node scripts/check-llms.mjs');
    const iLlms = kroki.findIndex((k) => k.run === 'npm run audit:llms');
    const iBuild = kroki.findIndex((k) => k.run === 'npm run build');
    expect(iBuild).toBeGreaterThanOrEqual(0);
    expect(iLlms).toBeGreaterThan(iBuild);
    expect(kroki[iLlms].if).toBeUndefined();
    expect(kroki[iLlms]['continue-on-error']).toBeUndefined();
    const iDeploy = kroki.findIndex((k) => /Deploy/.test(k.name ?? ''));
    expect(iDeploy).toBeGreaterThan(iLlms);
  });
});
