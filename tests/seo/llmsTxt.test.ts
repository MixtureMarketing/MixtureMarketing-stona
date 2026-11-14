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
  skeletonText,
  MIN_SKELETON,
  WILDCARD,
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

  it('artykuł o aplikacjach z AI (MIX-1680) jest opublikowany: strona kluczowa, nie na liście ukrytych; brak wpisu = odmowa', () => {
    const ART = '/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto/';
    expect(KEY_PATHS).toContain(ART);
    expect(prerenderOnlyRoutes).not.toContain(ART);
    const bez = llms
      .split('\n')
      .filter((l) => !l.includes(ART))
      .join('\n');
    expect(bez).not.toBe(llms);
    const r = llmsReport(bez, sitemap, { hiddenPaths: prerenderOnlyRoutes });
    expect(r.ok).toBe(false);
    expect(r.missingKey).toEqual([`${BASE_URL}${ART}`]);
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
      `llms.txt linia ${n}: ścieżka strony ukrytej /web-development/systemy-ai-aplikacje/ (szkielet webdevelopmentsystemyaiaplikacje)`,
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
      ['ścieżka adresu (/segment): /hidden/', '=ścieżka strony ukrytej /hidden/ (szkielet hidden)'],
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
    ['r2: ZWSP', 'Zo\u200bbacz', ['znak niewidoczny albo sterujący U+200B'], 'Zobacz'],
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
      [
        '=odnośnik do strony ukrytej: /hidden/',
        '=ścieżka strony ukrytej /hidden/ (szkielet hidden)',
      ],
      `  - [x](${B}/b/): o`,
    ],
    [
      'odnośnik do strony ukrytej bez / na końcu',
      `- [x](${B}/hidden): o`,
      [
        '=odnośnik do strony ukrytej: /hidden',
        '=ścieżka strony ukrytej /hidden/ (szkielet hidden)',
      ],
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
      ['ścieżka adresu (/segment): /h', '=ścieżka strony ukrytej /hidden/ (szkielet hidden)'],
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
      ['kodowanie procentowe (%XX): %2f', '=ścieżka strony ukrytej /hidden/ (szkielet hidden)'],
      'Zobacz 100% hidden',
    ],
    [
      'formy-ataku AA2: podwójne kodowanie %252F',
      'Zobacz %252Fhidden%252F',
      ['kodowanie procentowe (%XX): %25', '=ścieżka strony ukrytej /hidden/ (szkielet hidden)'],
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
    ['formy-ataku B7/B9: linia z samym NBSP', '\u00a0', ['linia z samymi odstępami'], ''],
    [
      'CRLF',
      `- [x](${B}/b/): o\r`,
      ['znak CR (końce linii CRLF są odrzucane)'],
      `- [x](${B}/b/): o`,
    ],
    ['tabulator', '\tx', ['znak niewidoczny albo sterujący U+0009'], 'x'],
    ['U+2060 word joiner', 'x\u2060y', ['znak niewidoczny albo sterujący U+2060'], 'xy'],
    ['U+FEFF w środku tekstu', 'x\ufeffy', ['znak niewidoczny albo sterujący U+FEFF'], 'xy'],
    ['formy-ataku U5: RLO U+202E', 'x\u202ey', ['znak niewidoczny albo sterujący U+202E'], 'xy'],
    ['formy-ataku B9: kod ANSI', '\u001b[31mx', ['znak niewidoczny albo sterujący U+001B'], 'x'],
    ['formy-ataku B9: NUL', 'x\u0000', ['znak niewidoczny albo sterujący U+0000'], 'x'],
    ['miękki dywiz U+00AD', 'x\u00ady', ['znak niewidoczny albo sterujący U+00AD'], 'xy'],
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

  // MIX-1665: szkielet = same litery i cyfry, więc odstęp między członami nie ratuje ścieżki; bliźniak
  // musi różnić się literami (dodatkowe słowo), nie samym separatorem.
  it('ścieżka ukryta rozbita spacją: szkielet bez odstępów w tej samej linii', () => {
    const r = llmsReport(`${base}Zobacz x/ukryta- strona/ tu\n`, sm, opts);
    expect(r.problems).toEqual([
      `${L}ścieżka strony ukrytej /x/ukryta-strona/ (szkielet xukrytastrona)`,
    ]);
    expect(llmsReport(`${base}Zobacz x, ukryta i strona tu\n`, sm, opts).ok).toBe(true);
  });

  it('nazwa strony ukrytej z myślnikiem (ostatni człon) w prozie', () => {
    const r = llmsReport(`${base}O ukryta-strona tu\n`, sm, opts);
    expect(r.problems).toEqual([
      `${L}ścieżka strony ukrytej /x/ukryta-strona/ (szkielet ukrytastrona)`,
    ]);
    expect(llmsReport(`${base}O ukryta nowa strona tu\n`, sm, opts).ok).toBe(true);
  });

  it('BOM na początku pliku = odmowa; ten sam plik bez BOM przechodzi', () => {
    const r = llmsReport(`\ufeff${base}`, sm, opts);
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

describe('MIX-1662: ścieżka ukryta bez slasha na początku, sobowtóry `/` i `-`, złączenie linii', () => {
  // Prawdziwa lista ukrytych (prerenderOnlyRoutes). Formy A01–A55 z WERDYKT-MIX-1657 (przeszły w r1).
  const opts = { keyPaths: ['/a/'], hiddenPaths: prerenderOnlyRoutes };
  const sm = xml('/a/');
  const base = `# T\n\n- [a](${BASE_URL}/a/): opis\n`;
  const L = 'llms.txt linia 4: ';
  const AB = '/abonament/dziekujemy/';
  const AI = '/web-development/systemy-ai-aplikacje/';
  // [nazwa, treść od linii 4, oczekiwane problemy, bliźniak dozwolony]
  const forms: [string, string, string[], string][] = [
    [
      'A01 bez slasha na początku, punkt listy',
      '- Po płatności: abonament/dziekujemy',
      [`${L}ścieżka strony ukrytej ${AB} (szkielet abonamentdziekujemy)`],
      '- Po płatności: abonament i podziękowanie',
    ],
    [
      'A55 bez slasha na początku, akapit od gwiazdki',
      '**Ukryte**: abonament/dziekujemy',
      [`${L}ścieżka strony ukrytej ${AB} (szkielet abonamentdziekujemy)`],
      '**Ukryte**: abonament, podziękowanie',
    ],
    [
      'A03 ukośnik dzielenia U+2215',
      '- Strona: ∕abonament∕dziekujemy∕',
      [`${L}ścieżka strony ukrytej ${AB} (szkielet abonamentdziekujemy)`],
      '- Strona: abonament ∕ cennik',
    ],
    [
      'A04 ukośnik ułamkowy U+2044',
      '- Strona: ⁄abonament⁄dziekujemy⁄',
      [`${L}ścieżka strony ukrytej ${AB} (szkielet abonamentdziekujemy)`],
      '- Ułamek 1⁄2 ceny',
    ],
    [
      'A06 dywiz U+2010 w nazwie',
      '- Nowość: web‐development systemy‐ai‐aplikacje',
      [`${L}ścieżka strony ukrytej ${AI} (szkielet webdevelopmentsystemyaiaplikacje)`],
      '- Nowość: web‐development i systemy AI',
    ],
    [
      'A48 półpauza U+2013 w nazwie',
      '- Nowość: systemy–ai–aplikacje',
      [`${L}ścieżka strony ukrytej ${AI} (szkielet systemyaiaplikacje)`],
      '- Nowość: systemy AI – nowe aplikacje',
    ],
    [
      'A08 nazwa rozbita końcem linii i znacznikiem `- `',
      '- Nowość: systemy-ai-\n- aplikacje',
      [`llms.txt: ścieżka strony ukrytej ${AI} (szkielet systemyaiaplikacje) po złączeniu linii`],
      '- Nowość: systemy AI\n- nowe aplikacje',
    ],
    [
      'A02 ukośnik z odstępami (bez odstępów = ścieżka)',
      '- Po płatności: abonament / dziekujemy',
      [`${L}ścieżka strony ukrytej ${AB} (szkielet abonamentdziekujemy)`],
      '- Po płatności: abonament / podziękowanie',
    ],
  ];

  for (const [name, line, whys, twin] of forms) {
    it(`odmowa: ${name}`, () => {
      const r = llmsReport(`${base}${line}\n`, sm, opts);
      expect(r.problems).toEqual(whys);
      expect(r.ok).toBe(false);
    });
    it(`OK (bliźniak): ${name}`, () => {
      const r = llmsReport(`${base}${twin}\n`, sm, opts);
      expect(r.problems).toEqual([]);
      expect(r.ok).toBe(true);
    });
  }

  const slashes = ['∕', '⁄', '⧸', '／', '╱'];
  const hyphens = [...['‐', '‑', '‒', '–', '—', '―'], ...['−', '﹘', '﹣', '－']];
  for (const c of slashes) {
    const cp = c.codePointAt(0)!.toString(16).toUpperCase();
    it(`sobowtór ukośnika U+${cp}: odmowa; ten sam znak między słowami przechodzi`, () => {
      const r = llmsReport(`${base}Strona: abonament${c}dziekujemy\n`, sm, opts);
      expect(r.problems).toEqual([
        `${L}ścieżka strony ukrytej ${AB} (szkielet abonamentdziekujemy)`,
      ]);
      expect(llmsReport(`${base}Strona: abonament ${c} cennik\n`, sm, opts).ok).toBe(true);
    });
  }
  for (const h of hyphens) {
    const cp = h.codePointAt(0)!.toString(16).toUpperCase();
    it(`sobowtór dywizu U+${cp}: odmowa; ten sam znak jako myślnik w tekście przechodzi`, () => {
      const r = llmsReport(`${base}Nowość: systemy${h}ai${h}aplikacje\n`, sm, opts);
      expect(r.problems).toEqual([
        `${L}ścieżka strony ukrytej ${AI} (szkielet systemyaiaplikacje)`,
      ]);
      expect(llmsReport(`${base}Nowość: systemy AI ${h} nowe aplikacje\n`, sm, opts).ok).toBe(true);
    });
  }

  it('strona jednoczłonowa bez slasha: `nazwa/` jako cały token; słowo i dłuższe słowo przechodzą', () => {
    const o = { keyPaths: ['/a/'], hiddenPaths: ['/hidden/'] };
    const r = llmsReport(`${base}Zobacz hidden/ tu\n`, sm, o);
    expect(r.problems).toEqual([`${L}ścieżka strony ukrytej /hidden/ (szkielet hidden)`]);
    expect(llmsReport(`${base}Ukryte hidden w tekście\n`, sm, o).ok).toBe(true);
    expect(llmsReport(`${base}Zobacz unhidden/ tu\n`, sm, o).ok).toBe(true);
  });

  it('złączenie linii zdejmuje znaczniki: nagłówek, opis `> `, podpunkt z wcięciem', () => {
    for (const split of ['## Nowość: systemy-ai-\n> aplikacje', '- systemy-ai-\n  - aplikacje']) {
      const r = llmsReport(`${base}${split}\n`, sm, opts);
      expect(r.problems).toEqual([
        `llms.txt: ścieżka strony ukrytej ${AI} (szkielet systemyaiaplikacje) po złączeniu linii`,
      ]);
    }
    expect(llmsReport(`${base}- systemy AI\n  - nowe aplikacje\n`, sm, opts).ok).toBe(true);
  });
});

describe('MIX-1665: skan stron ukrytych po szkielecie (litery i cyfry), granica wyrazu, próg długości', () => {
  // Formy V z WERDYKT-MIX-1662 (19 przeszło w r1) + AV z formy-ataku.md + własne. Znaki spoza ASCII
  // jako sekwencje \u (konwencja MIX-1657). Bliźniak różni się literami, nie samym separatorem.
  const opts = { keyPaths: ['/a/'], hiddenPaths: prerenderOnlyRoutes };
  const sm = xml('/a/');
  const base = `# T\n\n- [a](${BASE_URL}/a/): opis\n`;
  const L = 'llms.txt linia 4: ';
  const AB = '/abonament/dziekujemy/';
  const AI = '/web-development/systemy-ai-aplikacje/';
  const hitAB = [`${L}ścieżka strony ukrytej ${AB} (szkielet abonamentdziekujemy)`];
  const hitAI = [`${L}ścieżka strony ukrytej ${AI} (szkielet systemyaiaplikacje)`];
  const joinAB = [
    `llms.txt: ścieżka strony ukrytej ${AB} (szkielet abonamentdziekujemy) po złączeniu linii`,
  ];
  const joinAI = [
    `llms.txt: ścieżka strony ukrytej ${AI} (szkielet systemyaiaplikacje) po złączeniu linii`,
  ];
  const slash = (id: string, c: string): [string, string, string[], string] => [
    `${id} separator U+${c.codePointAt(0)!.toString(16).toUpperCase()} jako /`,
    `- Strona: abonament${c}dziekujemy`,
    hitAB,
    `- Strona: abonament ${c} cennik`,
  ];
  const dash = (id: string, c: string): [string, string, string[], string] => [
    `${id} separator U+${c.codePointAt(0)!.toString(16).toUpperCase()} jako -`,
    `- Nowość: systemy${c}ai${c}aplikacje`,
    hitAI,
    `- Nowość: systemy AI ${c} nowe aplikacje`,
  ];
  const forms: [string, string, string[], string][] = [
    slash('V01', '⟋'),
    slash('V02', 'ノ'),
    slash('V03', '᜵'),
    slash('V04', '∖'),
    slash('V05', '⧵'),
    dash('V06', '⸺'),
    dash('V07', '⁃'),
    dash('V08', 'ー'),
    dash('V09', '˗'),
    dash('V10', '֊'),
    [
      'V11 cyrylickie a',
      '- Po płatności: abonаment/dziekujemy',
      hitAB,
      '- Po płatności: abonаment/cennik',
    ],
    [
      'V12 cyrylickie e',
      '- Po płatności: abonament/dziеkujemy',
      hitAB,
      '- Po płatności: abonament i dziеkujemy',
    ],
    [
      'V13 tureckie İ',
      '- Po płatności: ABONAMENT/DZİEKUJEMY',
      hitAB,
      '- Po płatności: ABONAMENT I DZİEKUJEMY',
    ],
    [
      'V14 ogonek',
      '- Po płatności: abonament/dziękujemy',
      hitAB,
      '- Po płatności: abonament, za który dziękujemy',
    ],
    [
      'V15 pogrubienie',
      '- Po płatności: abonament/**dziekujemy**',
      hitAB,
      '- Po płatności: abonament/**cennik**',
    ],
    [
      'V16 kursywa *',
      '- Po płatności: abonament/*dziekujemy*',
      hitAB,
      '- Po płatności: abonament/*cennik*',
    ],
    [
      'V17 kursywa _',
      '- Po płatności: abonament/_dziekujemy_',
      hitAB,
      '- Po płatności: abonament/_cennik_',
    ],
    [
      'V18 dwa znaczniki `> - `',
      '> - abonament/\n> - dziekujemy',
      joinAB,
      '> - abonament/\n> - cennik',
    ],
    [
      'V19 następna linia pogrubiona',
      'abonament/\n**dziekujemy**',
      joinAB,
      'abonament/\n**cennik**',
    ],
    [
      'AV1 host i ścieżka w prozie',
      'Strona mixturemarketing.pl/abonament/dziekujemy/',
      [
        `${L}ścieżka adresu (/segment): /abonament/: Strona mixturemarketing.pl/abonament/dziekujemy/`,
        ...hitAB,
      ],
      'Strona mixturemarketing w tekście',
    ],
    [
      'AV13 NBSP wokół ukośnika',
      '- Po płatności: abonament / dziekujemy',
      hitAB,
      '- Po płatności: abonament / cennik',
    ],
    [
      'AV14 znak łączący U+0338 zamiast /',
      '- Po płatności: abonament̸dziekujemy',
      hitAB,
      '- Po płatności: abonament̸cennik',
    ],
    [
      'AV12 rozbicie z numerem `1. `',
      '- Nowość: systemy-ai-\n1. aplikacje',
      joinAI,
      '- Nowość: systemy-ai-\n1. nowe aplikacje',
    ],
    ['W01 znaczniki `> 1. `', 'abonament/\n> 1. dziekujemy', joinAB, 'abonament/\n> 1. cennik'],
    ['W02 greckie ε i κ', '- Nowość: systεmy-ai-apliκacje', hitAI, '- Nowość: systεmy-ai'],
    ['W03 kapitaliki', '- Nowość: ᴀʙᴏɴᴀᴍᴇɴᴛ/dziekujemy', hitAB, '- Nowość: ᴀʙᴏɴᴀᴍᴇɴᴛ/cennik'],
    [
      'W04 cyfry 0 i 1 zamiast o i i',
      '- Po płatności: ab0nament/dz1ekujemy',
      hitAB,
      '- Po płatności: ab0nament/cennik',
    ],
    [
      'W05 litery rozstrzelone',
      '- Po płatności: a b o n a m e n t / d z i e k u j e m y',
      hitAB,
      '- Po płatności: a b o n a m e n t / c e n n i k',
    ],
    [
      'W06 cała ścieżka słowami',
      'Zobacz web development systemy ai aplikacje',
      [`${L}ścieżka strony ukrytej ${AI} (szkielet webdevelopmentsystemyaiaplikacje)`],
      'Zobacz web development i systemy AI',
    ],
    [
      'W07 %XX w nazwie',
      'Zobacz abonament%2Fdziekujemy',
      [`${L}kodowanie procentowe (%XX): %2f: Zobacz abonament%2Fdziekujemy`, ...hitAB],
      'Zobacz abonament 2 cennik',
    ],
  ];

  it(`co najmniej 19 form V + 3 AV (jest ${forms.length})`, () => {
    expect(forms.filter(([n]) => n.startsWith('V')).length).toBe(19);
    expect(forms.filter(([n]) => n.startsWith('AV')).length).toBeGreaterThanOrEqual(3);
  });

  for (const [name, line, whys, twin] of forms) {
    it(`odmowa: ${name}`, () => {
      const r = llmsReport(`${base}${line}\n`, sm, opts);
      expect(r.problems).toEqual(whys);
      expect(r.ok).toBe(false);
    });
    it(`OK (bliźniak): ${name}`, () => {
      const r = llmsReport(`${base}${twin}\n`, sm, opts);
      expect(r.problems).toEqual([]);
      expect(r.ok).toBe(true);
    });
  }

  it('dawne fałszywe odmowy: szkielet ścieżki wewnątrz dłuższego wyrazu przechodzi', () => {
    for (const t of [
      '- superabonament/dziekujemyteraz',
      '- abonament/dziekujemyteraz',
      '- xabonament/dziekujemy',
      '- abonament/dziekujem\u00fdteraz',
    ]) {
      const r = llmsReport(`${base}${t}\n`, sm, opts);
      expect(r.problems, t).toEqual([]);
      expect(r.ok, t).toBe(true);
    }
  });

  it(`szkielet krótszy niż ${MIN_SKELETON}: tylko cały wyraz przy separatorze twardym`, () => {
    const o = { keyPaths: ['/a/'], hiddenPaths: ['/hidden/', '/ab/cd/'] };
    for (const t of [
      'Zobacz hidden⟋ tu',
      'Zobacz ∖hidden tu',
      'Zobacz ab/cd tu',
      'Zobacz abノcd tu',
    ]) {
      const r = llmsReport(`${base}${t}\n`, sm, o);
      expect(r.ok, t).toBe(false);
      expect(r.problems.at(-1), t).toMatch(
        /^llms\.txt linia 4: ścieżka strony ukrytej \/(hidden|ab\/cd)\/ \(szkielet (hidden|abcd)\)$/,
      );
    }
    for (const t of [
      'Ukryte: hidden.',
      'Ukryte hidden, tu',
      'Zobacz (hidden) tu',
      'Zobacz ab cd tu',
      'Zobacz abcd tu',
    ]) {
      const r = llmsReport(`${base}${t}\n`, sm, o);
      expect(r.problems, t).toEqual([]);
    }
  });

  it('szkielet: NFKC, małe litery, bez znaków łączących, tablica sobowtórów, separatory miękkie i twarde', () => {
    expect(skeletonText('Abаİę x.y/zノ1l0')).toBe(`abaie x y/z${WILDCARD}iio`);
  });
});

describe('MIX-1670: sobowtóry przed małymi literami, litera spoza tablicy = dżoker, pary rn/cl/vv', () => {
  // Formy F z WERDYKT-MIX-1665 (uwaga 1: 14 przeszło) + własne G. Znaki spoza ASCII jako \u.
  // Każda odmowa ma bliźniaka z tym samym znakiem, który przechodzi.
  const opts = { keyPaths: ['/a/'], hiddenPaths: prerenderOnlyRoutes };
  const sm = xml('/a/');
  const base = `# T\n\n- [a](${BASE_URL}/a/): opis\n`;
  const L = 'llms.txt linia 4: ';
  const AB = '/abonament/dziekujemy/';
  const AI = '/web-development/systemy-ai-aplikacje/';
  const hitAB = [`${L}ścieżka strony ukrytej ${AB} (szkielet abonamentdziekujemy)`];
  const hitAI = [`${L}ścieżka strony ukrytej ${AI} (szkielet systemyaiaplikacje)`];
  const hitAIfull = [
    `${L}ścieżka strony ukrytej ${AI} (szkielet webdevelopmentsystemyaiaplikacje)`,
  ];
  const joinAB = [
    `llms.txt: ścieżka strony ukrytej ${AB} (szkielet abonamentdziekujemy) po złączeniu linii`,
  ];
  const ab = (id: string, attack: string, twin: string): [string, string, string[], string] => [
    id,
    `- Strona ${attack}`,
    hitAB,
    `- Strona ${twin}`,
  ];
  const forms: [string, string, string[], string][] = [
    ab('F01 greckie wielkie Ν', 'ABOΝAMEΝT/DZIEKUJEMY', 'ABOΝAMEΝT/CENNIK'),
    [
      'F02 greckie wielkie Υ w nazwie z myślnikiem',
      '- Nowość: SYSTEMΥ-AI-APLIKACJE',
      hitAI,
      '- Nowość: SYSTEMΥ AI i APLIKACJE',
    ],
    ab('F03 greckie wielkie Μ', 'ABONAΜENT/DZIEKUJEMY', 'ABONAΜENT/CENNIK'),
    ab('F04 greckie wielkie Ζ', 'ABONAMENT/DΖIEKUJEMY', 'CENNIK/DΖIEKUJEMY'),
    ab('F05 łacińskie ɛ (U+025B)', 'abonamɛnt/dziekujemy', 'abonamɛnt i podziękowanie'),
    ab('F06 łacińskie ƶ (U+01B6)', 'abonament/dƶiekujemy', 'dƶiekujemy za abonament'),
    [
      'F07 łacińskie ɨ (U+0268) w nazwie z myślnikiem',
      '- Nowość: systemy-aɨ-aplɨkacje',
      hitAI,
      '- Nowość: systemy aɨ oraz aplɨkacje',
    ],
    ab('F08 łacińskie ꞵ (U+A7B5)', 'aꞵonament/dziekujemy', 'aꞵonament/cennik'),
    ab('F09 ormiańskie օ', 'abօnament/dziekujemy', 'abօnament/cennik'),
    ab('F10 koptyjskie ⲟ', 'abⲟnament/dziekujemy', 'abⲟnament/cennik'),
    ab('F11 lisu ꓮ', 'ꓮBONAMENT/DZIEKUJEMY', 'ꓮBONAMENT/CENNIK'),
    ab('F12 czirokeskie Ꭺ', 'ᎪBONAMENT/DZIEKUJEMY', 'ᎪBONAMENT/CENNIK'),
    ab('F13 rn zamiast m', 'abonarnent/dziekujemy', 'abonarnent/cennik'),
    ab('F14 cl zamiast d', 'abonament/clziekujemy', 'cennik/clziekujemy'),
    [
      'G01 vv zamiast w (nazwa strony ukrytej, cała ścieżka)',
      '- Strona: vveb-development/systemy-ai-aplikacje',
      hitAIfull,
      '- Strona: vveb-development/systemy-ai-aplikac',
    ],
    ab('G02 cyrylickie wielkie И jako N', 'ABOИAMEИT/DZIEKUJEMY', 'ABOИAMEИT/CENNIK'),
    ab('G03 symbol ∩ zamiast n', 'abo∩ament/dziekujemy', 'abo∩ament/cennik'),
    ab('G04 cyfra arabska ٥ zamiast o', 'ab٥nament/dziekujemy', 'ab٥nament/cennik'),
    ab('G05 litera spoza tablicy na granicy', 'ξabonament/dziekujemy', 'xabonament/dziekujemy'),
    [
      'G06 litera spoza tablicy po złączeniu linii',
      'abonament/\n> - dʑiekujemy',
      joinAB,
      'abonament/\n> - dʑiekuje',
    ],
  ];

  it(`14 form F z WERDYKT-MIX-1665 + własne G (jest ${forms.length})`, () => {
    expect(forms.filter(([n]) => n.startsWith('F')).length).toBe(14);
    expect(forms.filter(([n]) => n.startsWith('G')).length).toBeGreaterThanOrEqual(6);
  });

  for (const [name, line, whys, twin] of forms) {
    it(`odmowa: ${name}`, () => {
      const r = llmsReport(`${base}${line}\n`, sm, opts);
      expect(r.problems).toEqual(whys);
      expect(r.ok).toBe(false);
    });
    it(`OK (bliźniak): ${name}`, () => {
      const r = llmsReport(`${base}${twin}\n`, sm, opts);
      expect(r.problems).toEqual([]);
      expect(r.ok).toBe(true);
    });
  }

  it('pary w drugą stronę: m w tekście za rn ścieżki, d za cl (szkielet ci)', () => {
    const o = { keyPaths: ['/a/'], hiddenPaths: ['/kornel-club/'] };
    const r = llmsReport(`${base}Zobacz Komel-dub tu\n`, sm, o);
    expect(r.problems).toEqual([`${L}ścieżka strony ukrytej /kornel-club/ (szkielet kornelclub)`]);
    const twin = llmsReport(`${base}Zobacz Komel-dubs tu\n`, sm, o);
    expect(twin.problems).toEqual([]);
  });

  it('szkielet krótki: dżoker jako litera i jako separator twardy, para cl', () => {
    const o = { keyPaths: ['/a/'], hiddenPaths: ['/hidden/'] };
    for (const t of ['Zobacz hiddօn/ tu', 'Zobacz hiclden/ tu', 'Zobacz hiddenօ tu']) {
      const r = llmsReport(`${base}${t}\n`, sm, o);
      expect(r.problems, t).toEqual([`${L}ścieżka strony ukrytej /hidden/ (szkielet hidden)`]);
    }
    for (const t of ['Zobacz hiddօn tu', 'Zobacz hiclden tu', 'Zobacz hiddenօx tu']) {
      const r = llmsReport(`${base}${t}\n`, sm, o);
      expect(r.problems, t).toEqual([]);
    }
  });

  it('wiersz w obcym alfabecie dłuższy niż nazwa = odmowa (fail-closed), krótki przechodzi', () => {
    const r = llmsReport(`${base}${'ⲁ'.repeat(19)}\n`, sm, opts);
    expect(r.problems).toEqual([...hitAB, ...hitAI]);
    const twin = llmsReport(`${base}${'ⲁ'.repeat(5)}\n`, sm, opts);
    expect(twin.problems).toEqual([]);
  });

  it('szkielet: tablica przed małymi literami, dżoker dla litery, cyfry i symbolu spoza tablicy', () => {
    expect(skeletonText('ABOΝAMEΝT Ζɛ ノ∩° —')).toBe(
      `abonament z${WILDCARD} ${WILDCARD.repeat(3)} /`,
    );
  });

  it('public/llms.txt: 0 liter spoza tablicy (dżokerów z liter)', () => {
    const letters = [...llms.normalize('NFKC')].filter(
      (c) => /\p{L}/u.test(c) && skeletonText(c).includes(WILDCARD),
    );
    expect(letters).toEqual([]);
  });
});

describe('MIX-1684: allowlista liter (tablica bez małych liter przed nią, dżoker dla reszty), pary z dżokerem', () => {
  // Formy V17/V19/X01–X03 z WERDYKT-MIX-1670 (przeszły) + własne H. Znaki spoza ASCII jako \u, bo
  // greckie Ϲ/Σ i łacińskie C/E wyglądają w kodzie tak samo. Każda odmowa ma bliźniaka, który przechodzi.
  const opts = { keyPaths: ['/a/'], hiddenPaths: prerenderOnlyRoutes };
  const sm = xml('/a/');
  const base = `# T\n\n- [a](${BASE_URL}/a/): opis\n`;
  const L = 'llms.txt linia 4: ';
  const AB = '/abonament/dziekujemy/';
  const AI = '/web-development/systemy-ai-aplikacje/';
  const ART = '/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto/';
  const hitAB = [`${L}ścieżka strony ukrytej ${AB} (szkielet abonamentdziekujemy)`];
  const hitAI = [`${L}ścieżka strony ukrytej ${AI} (szkielet systemyaiaplikacje)`];
  const hitART = [`${L}ścieżka strony ukrytej ${ART} (szkielet aplikacjededykowanezaikiedywarto)`];
  const ab = (id: string, attack: string, twin: string): [string, string, string[], string] => [
    id,
    `- Strona ${attack}`,
    hitAB,
    `- Strona ${twin}`,
  ];
  const ai = (id: string, attack: string, twin: string): [string, string, string[], string] => [
    id,
    `- Nowość: ${attack}`,
    hitAI,
    `- Nowość: ${twin}`,
  ];
  const forms: [string, string, string[], string][] = [
    // Ϲ U+03F9 → NFKC Σ; zamiana na C przed NFKC (bliźniak: Ϲ zamiast K = aplicacje, przechodzi).
    ai('H01 greckie Ϲ U+03F9 (V17, X02)', 'SYSTEMY-AI-APLIKAϹJE', 'SYSTEMY-AI-APLIϹACJE'),
    ai('H02 greckie ϲ U+03F2 (X01)', 'systemy-ai-aplikaϲje', 'systemy-ai-apliϲacje'),
    ab('H03 greckie Σ jako E (V19)', 'ABONAMΣNT/DZIEKUJEMY', 'ABONAMΣNT/CENNIK'),
    ai('H04 greckie Σ jako S', 'ΣYΣTEMY-AI-APLIKACJE', 'ΣYΣTEMY AI i APLIKACJE'),
    ab('H05 greckie Ω jako O (X03)', 'ABΩNAMENT/DZIEKUJEMY', 'ABΩNAMENT/CENNIK'),
    [
      'H06 greckie Γ (małe γ w tablicy = y) jako R',
      '- Artykuł: APLIKACJE-DEDYKOWANE-Z-AI-KIEDY-WAΓTO',
      hitART,
      '- Artykuł: APLIKACJE-DEDYKOWANE-Z-AI-KIEDY-WAΓ',
    ],
    ab('H07 cyrylickie wielkie Д spoza tablicy', 'ABONAMENT/ДZIEKUJEMY', 'CENNIK/ДZIEKUJEMY'),
    ab('H08 ukraińskie wielkie Є spoza tablicy', 'ABONAMЄNT/DZIEKUJEMY', 'ABONAMЄNT/CENNIK'),
    ab('H09 rn z dżokerem jako drugą literą', 'abonarօent/dziekujemy', 'abonarօent/cennik'),
    ab('H10 cl z dżokerem jako drugą literą', 'abonament/cօziekujemy', 'cennik/cօziekujemy'),
    ab('H11 rn z dżokerem jako pierwszą literą', 'abonaօnent/dziekujemy', 'abonaօnent/cennik'),
    [
      'H12 vv z dżokerem jako drugą literą',
      '- Artykuł: aplikacje-dedykowane-z-ai-kiedy-vօarto',
      hitART,
      '- Artykuł: aplikacje-dedykowane-z-ai-kiedy-vօato',
    ],
    ai(
      'H13 łacińskie wielkie Ł (małe litery tylko dla łaciny)',
      'SYSTEMY-AI-APŁIKACJE',
      'SYSTEMY AI i APŁIKACJE',
    ),
    ab(
      'H14 cyrylickie wielkie А В О М Е Т (wiersz wielkich liter)',
      'АВОNAМЕNТ/DZIEKUJEMY',
      'АВОNAМЕNТ/CENNIK',
    ),
  ];

  it(`co najmniej 10 form H (jest ${forms.length})`, () => {
    expect(forms.length).toBeGreaterThanOrEqual(10);
  });

  for (const [name, line, whys, twin] of forms) {
    it(`odmowa: ${name}`, () => {
      const r = llmsReport(`${base}${line}\n`, sm, opts);
      expect(r.problems).toEqual(whys);
      expect(r.ok).toBe(false);
    });
    it(`OK (bliźniak): ${name}`, () => {
      const r = llmsReport(`${base}${twin}\n`, sm, opts);
      expect(r.problems).toEqual([]);
      expect(r.ok).toBe(true);
    });
  }

  it('Ϲ rozbite końcem linii: odmowa po złączeniu; bliźniak przechodzi', () => {
    const r = llmsReport(`${base}- Nowość: systemy-ai-\n> - aplikaϹje\n`, sm, opts);
    expect(r.problems).toEqual([
      `llms.txt: ścieżka strony ukrytej ${AI} (szkielet systemyaiaplikacje) po złączeniu linii`,
    ]);
    const twin = llmsReport(`${base}- Nowość: systemy-ai-\n> - apliϹacje\n`, sm, opts);
    expect(twin.problems).toEqual([]);
  });

  // Proza w innych językach przechodzi (pisma spoza łaciny: tylko tablica albo dżoker, bez długiego
  // ciągu dżokerów); długi wiersz w piśmie spoza tablicy zostaje odmową (AV19, test MIX-1670).
  const prose = [
    '- Zażółć gęślą jaźń: ĄĆĘŁŃÓŚŹŻ ąćęłńóśźż',
    '- Українською: ми створюємо сайти, системи штучного інтелекту та застосунки для бізнесу',
    '- По-русски: мы делаем сайты, системы искусственного интеллекта и приложения для бизнеса',
    '- Ελληνικά: κατασκευή ιστοσελίδων και εφαρμογών τεχνητής νοημοσύνης για επιχειρήσεις',
    '- ΣΥΣΤΗΜΑΤΑ ΤΕΧΝΗΤΗΣ ΝΟΗΜΟΣΥΝΗΣ ΓΙΑ ΕΠΙΧΕΙΡΗΣΕΙΣ',
    '- Auf Deutsch: Webentwicklung, Systeme für künstliche Intelligenz, Größe und Qualität',
  ];
  for (const t of prose) {
    it(`proza przechodzi: ${t.slice(2, 14)}`, () => {
      const r = llmsReport(`${base}${t}\n`, sm, opts);
      expect(r.problems).toEqual([]);
    });
  }

  it('szkielet: tablica dla wszystkich pism bez małych liter, łacina z małymi literami, reszta = dżoker', () => {
    const W = WILDCARD;
    expect(skeletonText('ΑΒΩ Σ Ϲϲ ΓДЄ')).toBe(`abo ${W} cc ${W}${W}${W}`);
    expect(skeletonText('ŁÓĐƐ ßẞ')).toBe(`iod${W} ssss`);
    expect(skeletonText('АВЕКМНОРСТУХ')).toBe('abekmhopctyx');
    expect(skeletonText('a|b @c 3 ١')).toBe(`a/b /c 3 ${W}`);
  });
});

describe('llmsReport: wejście puste albo nieczytelne = odmowa (fail-closed)', () => {
  const opts = { keyPaths: ['/a/'], hiddenPaths: ['/hidden/'] };
  const ok = `- [a](${BASE_URL}/a/): opis\n`;

  it('pusta lista stron ukrytych = odmowa; lista z jednym wpisem przechodzi', () => {
    const msg = 'lista stron ukrytych (prerenderOnlyRoutes) pusta albo nieczytelna';
    for (const hiddenPaths of [[], undefined, [''], ['bez-ukosnika'], [42], ['/-/']]) {
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
      `PROBLEM: llms.txt linia ${lines + 1}: ścieżka strony ukrytej /abonament/dziekujemy/ (szkielet abonamentdziekujemy)`,
    );
    expect(r.stdout).toContain('llms-check: BŁĄD');
    expect(r.status).toBe(1);
  });

  it('odmowa: ukryta strona zakodowana %2F, rc 1', () => {
    const r = run(`${llms}Zobacz %2Fabonament%2Fdziekujemy\n`);
    expect(r.stdout).toContain(
      `PROBLEM: llms.txt linia ${lines + 1}: ścieżka strony ukrytej /abonament/dziekujemy/ (szkielet abonamentdziekujemy)`,
    );
    expect(r.status).toBe(1);
  });

  it('odmowa: ukryta strona bez slasha na początku i z ukośnikiem U+2215, rc 1 (MIX-1662)', () => {
    const r = run(`${llms}- Po płatności: abonament\u2215dziekujemy\n`);
    expect(r.stdout).toContain(
      `PROBLEM: llms.txt linia ${lines + 1}: ścieżka strony ukrytej /abonament/dziekujemy/ (szkielet abonamentdziekujemy)`,
    );
    expect(r.stdout).toContain('llms-check: BŁĄD');
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
