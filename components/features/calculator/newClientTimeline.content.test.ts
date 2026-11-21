// MIX-1816 (Z13) K1: treść osi czasu w jednym pliku; bez obietnicy wyniku i bez cen.
import { describe, it, expect } from 'vitest';
import {
  NEW_CLIENT_TIMELINE,
  NEW_CLIENT_TIMELINE_HEADING,
  NEW_CLIENT_TIMELINE_INTRO,
} from './newClientTimeline.content';
import { forbiddenIn, FORBIDDEN } from './newClientTimeline.guard';

const ALL_TEXT = [
  NEW_CLIENT_TIMELINE_HEADING,
  NEW_CLIENT_TIMELINE_INTRO,
  ...NEW_CLIENT_TIMELINE.flatMap((p) => [p.period, ...p.items]),
];

describe('K1 treść osi czasu', () => {
  it('trzy okresy w kolejności: Tydzień 1, Miesiąc 1, 90 dni; każdy ma 1–3 krótkie punkty', () => {
    expect(NEW_CLIENT_TIMELINE.map((p) => p.period)).toEqual(['Tydzień 1', 'Miesiąc 1', '90 dni']);
    for (const p of NEW_CLIENT_TIMELINE) {
      expect(p.items.length).toBeGreaterThanOrEqual(1);
      expect(p.items.length).toBeLessThanOrEqual(3);
      for (const i of p.items) {
        expect(i.trim()).not.toBe('');
        expect(i.length).toBeLessThanOrEqual(110);
      }
    }
  });

  it('żaden tekst nie zawiera: gwarant*, wzrost o, zwrot z inwestycji, %, pewn*, cen ani kwot', () => {
    for (const t of ALL_TEXT) expect(forbiddenIn(t), t).toEqual([]);
    // dosłownie wymagane w kryterium, niezależnie od modułu strażnika
    const joined = ALL_TEXT.join('\n');
    expect(joined).not.toMatch(/gwarant|wzrost o|zwrot z inwestycji|%|pewn/i);
    expect(joined).not.toMatch(/zł|pln|\d{3,}/i);
  });

  it('copy jest po polsku i opisuje, co klient dostaje (czasowniki dostawy, nie wyniku)', () => {
    const joined = ALL_TEXT.join(' ');
    expect(joined).toMatch(/makiet/i);
    expect(joined).toMatch(/uruchomieni/i);
    expect(joined).toMatch(/[ąęłńóśźż]/);
  });
});

describe('strażnik treści: każda odmowa ma dozwolonego bliźniaka', () => {
  const deny: [string, string][] = [
    ['gwarant', 'Gwarantujemy efekt.'],
    ['gwarant', 'To jest gwarancja jakości.'],
    ['wzrost o', 'Wzrost o dwa razy w rok.'],
    ['zwrot z inwestycji', 'Szybki zwrot z inwestycji.'],
    ['procent', 'Więcej ruchu o 30 %.'],
    ['procent', 'Rabat 10%'],
    ['pewn', 'Pewny efekt.'],
    ['pewn', 'Na pewno zadziała.'],
    ['waluta', 'Start od 3 tys. zł.'],
    ['waluta', 'Płatność w PLN.'],
    ['cena', 'Cena jest stała.'],
    ['koszt', 'Bez dodatkowych kosztów.'],
    ['kwota', 'Pakiet 2500 dla firm.'],
  ];
  const allow: string[] = [
    'Rozmowa startowa: ustalamy cele, zakres i kolejność prac.',
    'Tydzień 1',
    '90 dni',
    'Makiety głównych podstron do Twojej akceptacji.',
    'Przegląd pierwszych danych i lista dalszych usprawnień.',
    'Zespół wybiera narzędzia, a Ty akceptujesz kierunek.',
  ];
  for (const [rule, text] of deny)
    it(`odmowa ${rule}: „${text}"`, () => {
      expect(forbiddenIn(text)).toContain(rule);
    });
  for (const text of allow)
    it(`dozwolone: „${text}"`, () => {
      expect(forbiddenIn(text)).toEqual([]);
    });

  it('każda reguła strażnika ma co najmniej jeden test odmowy (żadna nie jest martwa)', () => {
    const used = new Set(deny.map(([r]) => r));
    for (const [name] of FORBIDDEN) expect(used.has(name), name).toBe(true);
  });

  it('pusty tekst jest czysty (strażnik dotyczy treści, nie braku treści)', () => {
    expect(forbiddenIn('')).toEqual([]);
  });
});
