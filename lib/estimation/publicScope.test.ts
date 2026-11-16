// MIX-1790 K1/K6: „Twój zakres" z wyniku silnika. Lista dozwolona: każda pozycja ma DOKŁADNIE
// pola client_name i client_description; formy ataku (odmowa) z dozwolonym bliźniakiem.
import { describe, it, expect } from 'vitest';
import {
  toPublicScope,
  cleanClientText,
  SCOPE_NAME_MAX,
  SCOPE_DESCRIPTION_MAX,
  SCOPE_MAX_ITEMS,
} from './publicScope';
import type { AspectComputation } from './types';

const asp = (over: Partial<AspectComputation> & Record<string, unknown> = {}): AspectComputation =>
  ({
    code: 'frontend',
    category: 'A',
    name: 'WEWN-nazwa',
    suggestedLevel: 2,
    chosenLevel: 2,
    locked: false,
    hoursMin: 17,
    hoursMax: 33,
    reasons: ['WEWN-powod'],
    levelName: 'WEWN-poziom',
    levelDescription: 'WEWN-opis',
    clientName: 'Strona na telefon',
    levelClientDescription: 'Układ dopasowany do ekranu.',
    ...over,
  }) as AspectComputation;

const KEYS = ['client_description', 'client_name'];

describe('toPublicScope: pola z listy dozwolonej (K1)', () => {
  it('pozycja ma dokładnie 2 pola; dodatkowe pola wiersza (godziny, nazwy wewnętrzne) nie wychodzą', () => {
    const scope = toPublicScope([asp({ secretRate: 120, hours_min: 5, internal_name: 'WEWN-x' })]);
    expect(scope).toHaveLength(1);
    expect(Object.keys(scope[0]).sort()).toEqual(KEYS);
    expect(scope[0]).toEqual({
      client_name: 'Strona na telefon',
      client_description: 'Układ dopasowany do ekranu.',
    });
    const text = JSON.stringify(scope);
    for (const leak of ['WEWN', '17', '33', '120', 'hours', 'level', 'code', 'frontend'])
      expect(text).not.toContain(leak);
  });
});

describe('toPublicScope: formy ataku (odmowa + dozwolony bliźniak)', () => {
  it('S1 brak nazwy klienckiej = pozycja pominięta, BEZ nazwy wewnętrznej; z nazwą = jest', () => {
    for (const clientName of [undefined, null as unknown as string])
      expect(toPublicScope([asp({ clientName })])).toEqual([]);
    expect(toPublicScope([asp({ clientName: 'SEO' })])[0].client_name).toBe('SEO');
  });

  it('S2 nazwa pusta, same spacje albo znaki niewidoczne = pominięta; z literą = jest', () => {
    for (const clientName of ['', '   ', '\u200B', '\u00AD\u200B\uFEFF', ' \u2060 '])
      expect(toPublicScope([asp({ clientName })])).toEqual([]);
    expect(toPublicScope([asp({ clientName: '\u200BSEO ' })])[0].client_name).toBe('SEO');
  });

  it('S3 nazwa nie-tekst (liczba, obiekt, tablica, true) = pominięta; tekst = jest', () => {
    for (const clientName of [42, { toString: () => 'x' }, ['SEO'], true])
      expect(toPublicScope([asp({ clientName: clientName as unknown as string })])).toEqual([]);
    expect(toPublicScope([asp({ clientName: '42' })])).toHaveLength(1);
  });

  it(`S4 nazwa ${SCOPE_NAME_MAX + 1} znaków = pominięta (bez wzmocnienia); ${SCOPE_NAME_MAX} = jest`, () => {
    expect(toPublicScope([asp({ clientName: 'a'.repeat(SCOPE_NAME_MAX + 1) })])).toEqual([]);
    expect(toPublicScope([asp({ clientName: 'a'.repeat(SCOPE_NAME_MAX) })])).toHaveLength(1);
  });

  it(`S5 opis ${SCOPE_DESCRIPTION_MAX + 1} znaków albo nie-tekst = null; ${SCOPE_DESCRIPTION_MAX} = zostaje`, () => {
    const long = toPublicScope([
      asp({ levelClientDescription: 'b'.repeat(SCOPE_DESCRIPTION_MAX + 1) }),
    ]);
    expect(long).toEqual([{ client_name: 'Strona na telefon', client_description: null }]);
    const obj = toPublicScope([asp({ levelClientDescription: 7 as unknown as string })]);
    expect(obj[0].client_description).toBeNull();
    const ok = toPublicScope([asp({ levelClientDescription: 'b'.repeat(SCOPE_DESCRIPTION_MAX) })]);
    expect(ok[0].client_description).toHaveLength(SCOPE_DESCRIPTION_MAX);
  });

  it('S6 brak opisu klienckiego = null, BEZ opisu wewnętrznego; z opisem = opis', () => {
    const r = toPublicScope([asp({ levelClientDescription: undefined })]);
    expect(r).toEqual([{ client_name: 'Strona na telefon', client_description: null }]);
    expect(JSON.stringify(r)).not.toContain('WEWN');
  });

  it('S7 obszar niewybrany (godziny 0, NaN, ujemne) = pominięty; godziny > 0 = jest', () => {
    for (const hoursMax of [0, Number.NaN, -5])
      expect(toPublicScope([asp({ hoursMax })])).toEqual([]);
    expect(toPublicScope([asp({ hoursMax: 1 })])).toHaveLength(1);
  });

  it(`S8 ${SCOPE_MAX_ITEMS + 5} wybranych obszarów = najwyżej ${SCOPE_MAX_ITEMS} pozycji`, () => {
    const many = Array.from({ length: SCOPE_MAX_ITEMS + 5 }, (_, i) =>
      asp({ clientName: `O${i}` }),
    );
    const r = toPublicScope(many);
    expect(r).toHaveLength(SCOPE_MAX_ITEMS);
    expect(r[SCOPE_MAX_ITEMS - 1].client_name).toBe(`O${SCOPE_MAX_ITEMS - 1}`);
    expect(toPublicScope(many.slice(0, 2))).toHaveLength(2);
  });

  it('S9 HTML w treści przechodzi jako zwykły tekst (bez zmian, render jako tekst robi front)', () => {
    const html = '<img src=x onerror=alert(1)><script>alert(2)</script>';
    const r = toPublicScope([asp({ levelClientDescription: html })]);
    expect(r[0].client_description).toBe(html);
  });

  it('S10 pusta lista obszarów = pusta lista', () => {
    expect(toPublicScope([])).toEqual([]);
  });
});

describe('cleanClientText', () => {
  it('przycina, usuwa niewidoczne, null dla nie-tekstu', () => {
    expect(cleanClientText('  Ala\u200B ', 10)).toBe('Ala');
    expect(cleanClientText(null, 10)).toBeNull();
    expect(cleanClientText('abc', 2)).toBeNull();
  });
});
