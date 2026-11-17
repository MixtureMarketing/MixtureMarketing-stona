import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * MIX-1323 (decyzja właściciela, MIX-1311): czas darmowego audytu na stronie
 * ma jedną formę — „60 sekund". Nie „15-minutowy", nie „w 60s", nie „około minutę".
 * Teksty o 15-minutowej ROZMOWIE (marketing/main.ts, web-development) to inna
 * usługa i ten test ich nie dotyczy.
 */
const ROOT = path.resolve(__dirname, '../..');

/** Miejsca, które mówią o czasie audytu (przegląd z karty MIX-1323). */
const AUDIT_TIME_PLACES: Array<[file: string, phrase: string]> = [
  ['data/content/pages/home.ts', 'wynik w 60 sekund'],
  ['components/sections/Hero.tsx', 'Darmowy audyt strony w 60 sekund'],
  ['components/pages/Home.tsx', 'label="Darmowy audyt w 60 sekund"'],
  ['components/features/audit/AuditTeaser.tsx', "'Darmowy audyt w 60 sekund'"],
  ['components/features/audit/AuditTeaser.tsx', "label: 'Wynik w 60 sekund'"],
  ['components/features/audit/AuditTeaser.tsx', 'Bezpłatnie • Wynik w 60 sekund'],
  ['components/pages/AuditPage.tsx', 'Wpisz adres strony — w 60 sekund dostaniesz'],
  ['components/features/audit/steps/AuditProgress.tsx', 'Pomiar może potrwać do 60 sekund'],
  ['components/pages/SeoRzeszow.tsx', 'Wpisz URL strony — w 60 sekund dostaniesz raport'],
  [
    'components/pages/PozycjonowanieRzeszow.tsx',
    'Wpisz URL strony — w 60 sekund dostaniesz raport',
  ],
];

/**
 * MIX-1938: przed sprawdzeniem sprowadza zapis do jednej postaci (formy F1, F2, F9 z werdyktu
 * MIX-1910): encja twardej spacji (`&nbsp;`, `&#160;`, `&#xa0;`) = spacja, każdy myślnik
 * (U+2010–U+2015, U+2212) = „-". Sam znak twardej spacji (U+00A0, U+2007, U+202F) łapie już `\s`
 * we wzorcach niżej (w JS `\s` je obejmuje), więc nie trzeba go zamieniać.
 */
const normalize = (line: string): string =>
  line.replace(/&nbsp;|&#160;|&#x0*a0;/gi, ' ').replace(/[\u2010-\u2015\u2212]/g, '-');

/** Formy zakazane w components/ i data/ (inne niż „60 sekund"), sprawdzane po normalize(). */
const FORBIDDEN: Array<[name: string, test: (line: string) => boolean]> = [
  // „15-minutowy audyt" i „15 minut" w tej samej linii co „audyt" (F4, F5). Rozmowa 15-minutowa
  // (inna usługa) nie ma w linii słowa „audyt".
  ['„15 minut" przy audycie', (l) => /\b15\s*-?\s*min/i.test(l) && /audyt/i.test(l)],
  // „w 60s", „W 60 s", „60 sek.", „60&nbsp;s" (F3, F8, F9); „60 sekund" przechodzi.
  ['„60s" / „60 sek."', (l) => /\b60\s*(?:s|sek)(?![\p{L}\d])/iu.test(l)],
  [
    '„około minutę" przy audycie',
    (l) =>
      /(audyt|wynik|raport)[^'"\n]{0,80}około minut|około minut[^'"\n]{0,80}(wynik|raport)/i.test(
        l,
      ),
  ],
  // „w minutę", „w jedną minutę" w linii o audycie, wyniku albo raporcie (F6). Kalkulator wyceny
  // („widełki w około minutę") tych słów nie ma.
  [
    '„w minutę" przy audycie',
    (l) =>
      /audyt|wynik|raport/i.test(l) &&
      /\bw\s+(?:około\s+)?(?:jedn[aą]\s+)?minut(?:[eę]|y)(?!\p{L})/iu.test(l),
  ],
];

const offendersIn = (line: string): string[] => {
  const n = normalize(line);
  return FORBIDDEN.filter(([, t]) => t(n)).map(([name]) => name);
};

/** Pliki z treścią strony: .ts, .tsx i .json (F7, MIX-1938), bez testów. */
const sourceFiles = (): string[] =>
  ['components', 'data'].flatMap((dir) =>
    (fs.readdirSync(path.join(ROOT, dir), { recursive: true }) as string[])
      .map((f) => path.join(dir, f))
      .filter((f) => /\.(ts|tsx|json)$/.test(f) && !/\.test\.tsx?$/.test(f)),
  );

/** Formy ataku z werdyktu MIX-1910 (F1–F9); F7 (plik .json) dodatkowo przez listę plików niżej. */
const ATTACK_FORMS: Array<[id: string, line: string]> = [
  ['F1 twarda spacja', 'Darmowy, 15\u00a0minutowy audyt strony'],
  ['F2 półpauza', 'Darmowy 15\u2013minutowy audyt strony'],
  ['F3 wielka litera', 'W 60s dostaniesz wynik audytu'],
  ['F4 słowo w środku', 'Bezpłatny 15-minutowy, techniczny audyt'],
  ['F5 audyt trwa 15 minut', 'Audyt trwa 15 minut.'],
  ['F6 w minutę', 'Darmowy audyt w minutę'],
  ['F7 tekst w .json', '"label": "Darmowy audyt w 60s"'],
  ['F8 60 sek.', 'Wynik audytu w 60 sek.'],
  ['F9 JSX &nbsp;', '<span>Wynik w 60&nbsp;s</span>'],
];

/** Noga dodatnia: forma „60 sekund", rozmowa 15-minutowa, kalkulator wyceny. */
const ALLOWED_LINES = [
  'Darmowy audyt strony w 60 sekund',
  'Pomiar może potrwać do 60 sekund',
  'Wpisz URL strony — w 60 sekund dostaniesz raport',
  'Umów się na 15-minutową rozmowę.',
  'Policz widełki dla swojej aplikacji w około minutę.',
  'nowe funkcje pojawiają się na stronie w minuty, a nie tygodnie',
];

describe('czas audytu — jedna forma „60 sekund" (MIX-1323)', () => {
  it.each(AUDIT_TIME_PLACES)('%s mówi „%s"', (file, phrase) => {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
    expect(src).toContain(phrase);
  });

  it.each(ATTACK_FORMS)('forma ataku %s jest złapana (MIX-1938)', (_id, line) => {
    expect(offendersIn(line)).not.toEqual([]);
  });

  it.each(ALLOWED_LINES)('tekst dozwolony „%s" przechodzi (MIX-1938)', (line) => {
    expect(offendersIn(line)).toEqual([]);
  });

  it('lista plików nie jest pusta i obejmuje .json oraz miejsca z czasem audytu (MIX-1938)', () => {
    const files = sourceFiles();
    expect(files.length).toBeGreaterThan(50);
    expect(files.some((f) => f.endsWith('.json'))).toBe(true);
    for (const [file] of AUDIT_TIME_PLACES) expect(files).toContain(path.normalize(file));
  });

  it('w components/ i data/ nie ma innych form czasu audytu', () => {
    const files = sourceFiles();
    expect(files.length).toBeGreaterThan(0);
    const offenders: string[] = [];
    for (const file of files) {
      const lines = fs.readFileSync(path.join(ROOT, file), 'utf8').split('\n');
      lines.forEach((line, i) => {
        for (const name of offendersIn(line)) offenders.push(`${file}:${i + 1} ${name}`);
      });
    }
    expect(offenders).toEqual([]);
  });

  it('15-minutowa rozmowa (inna usługa) zostaje bez zmian', () => {
    const src = fs.readFileSync(path.join(ROOT, 'data/content/services/marketing/main.ts'), 'utf8');
    expect(src).toContain('Umów się na 15-minutową rozmowę.');
  });
});
