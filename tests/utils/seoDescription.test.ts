import { describe, it, expect } from 'vitest';
import { industryDescription } from '../../utils/seo/description';

describe('industryDescription — meta stron branż', () => {
  it('z painPoints: pierwsze dwa problemy', () => {
    expect(
      industryDescription('E-commerce', ['Niska konwersja', 'Wolne ładowanie', 'Trzeci']),
    ).toBe(
      'Specjalistyczne usługi IT i marketingu dla branży: E-commerce. Rozwiązujemy problemy: Niska konwersja, Wolne ładowanie.',
    );
  });

  it.each([
    ['brak pola', undefined],
    ['null', null],
    ['pusta tablica', []],
    ['same puste wpisy', ['', '  ', null]],
  ])('%s → bez zdania o problemach i bez „undefined"', (_label, painPoints) => {
    const d = industryDescription('SaaS & Startups', painPoints as string[] | undefined);
    expect(d).toBe('Specjalistyczne usługi IT i marketingu dla branży: SaaS & Startups.');
    expect(d).not.toMatch(/undefined|null|problemy/);
  });

  it('nie dubluje kropki z CMS', () => {
    expect(industryDescription('B2B', ['Długi cykl sprzedaży.'])).toBe(
      'Specjalistyczne usługi IT i marketingu dla branży: B2B. Rozwiązujemy problemy: Długi cykl sprzedaży.',
    );
  });
});
