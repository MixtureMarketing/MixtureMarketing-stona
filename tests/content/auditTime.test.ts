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

/** Formy zakazane w components/ i data/ (inne niż „60 sekund"). */
const FORBIDDEN: Array<[name: string, re: RegExp]> = [
  ['„15-minutowy audyt"', /15[- ]minutow\w* audyt/i],
  ['„w 60s" / „w 60 s"', /\bw 60 ?s\b/],
  [
    '„około minutę" przy audycie',
    /(audyt|wynik|raport)[^'"\n]{0,80}około minut|około minut[^'"\n]{0,80}(wynik|raport)/i,
  ],
];

const sourceFiles = (): string[] =>
  ['components', 'data'].flatMap((dir) =>
    (fs.readdirSync(path.join(ROOT, dir), { recursive: true }) as string[])
      .map((f) => path.join(dir, f))
      .filter((f) => /\.(ts|tsx)$/.test(f) && !/\.test\.tsx?$/.test(f)),
  );

describe('czas audytu — jedna forma „60 sekund" (MIX-1323)', () => {
  it.each(AUDIT_TIME_PLACES)('%s mówi „%s"', (file, phrase) => {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
    expect(src).toContain(phrase);
  });

  it('w components/ i data/ nie ma innych form czasu audytu', () => {
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      const lines = fs.readFileSync(path.join(ROOT, file), 'utf8').split('\n');
      lines.forEach((line, i) => {
        for (const [name, re] of FORBIDDEN) {
          if (re.test(line)) offenders.push(`${file}:${i + 1} ${name}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });

  it('15-minutowa rozmowa (inna usługa) zostaje bez zmian', () => {
    const src = fs.readFileSync(path.join(ROOT, 'data/content/services/marketing/main.ts'), 'utf8');
    expect(src).toContain('Umów się na 15-minutową rozmowę.');
  });
});
