// MIX-1790: klient podglądu, kontrakt v2 — lista „Twój zakres" po liście dozwolonej
// (parseScope). Każda odmowa ma obok dozwolonego bliźniaka.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseScope, requestPricePreview } from './pricePreviewService';
import {
  SCOPE_DESCRIPTION_MAX,
  SCOPE_MAX_ITEMS,
  SCOPE_NAME_MAX,
} from '../lib/estimation/publicScope';

const respond = (body: unknown) =>
  vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(body) });
const PR = { min: 1000, max: 2000 };
const ITEM = { client_name: 'SEO', client_description: 'Opis' };

afterEach(() => vi.unstubAllGlobals());

describe('requestPricePreview: scope (kontrakt v2)', () => {
  it('serwer v1 (bez pola scope) = scope undefined; v2 = lista', async () => {
    vi.stubGlobal('fetch', respond({ priceRange: PR }));
    const v1 = await requestPricePreview({ answers: {} });
    expect(v1.ok && v1.scope).toBeUndefined();
    vi.stubGlobal('fetch', respond({ priceRange: PR, scope: [ITEM] }));
    const v2 = await requestPricePreview({ answers: {} });
    expect(v2).toEqual({ ok: true, priceRange: PR, previewToken: undefined, scope: [ITEM] });
  });

  it('C1 pola spoza listy (godziny, cena, nazwa wewnętrzna) odrzucone; pozycja ma 2 klucze', async () => {
    vi.stubGlobal(
      'fetch',
      respond({
        priceRange: PR,
        scope: [{ ...ITEM, hours_min: 10, price: 5000, name: 'WEWN', __proto__: { x: 1 } }],
      }),
    );
    const r = await requestPricePreview({ answers: {} });
    expect(r.ok).toBe(true);
    const scope = r.ok ? r.scope! : [];
    expect(scope).toEqual([ITEM]);
    expect(Object.keys(scope[0]).sort()).toEqual(['client_description', 'client_name']);
  });

  it('C2 zły scope nie psuje widełek (zakres pusty, cena zostaje)', async () => {
    vi.stubGlobal('fetch', respond({ priceRange: PR, scope: 'x' }));
    expect(await requestPricePreview({ answers: {} })).toMatchObject({
      ok: true,
      priceRange: PR,
      scope: [],
    });
  });
});

describe('parseScope: formy ataku (odmowa + dozwolony bliźniak)', () => {
  it('C3 nie-tablica (obiekt, tekst, null, liczba) = []; tablica = lista', () => {
    for (const raw of [{ 0: ITEM, length: 1 }, 'SEO', null, undefined, 5, { scope: [ITEM] }])
      expect(parseScope(raw)).toEqual([]);
    expect(parseScope([ITEM])).toEqual([ITEM]);
  });

  it('C4 pozycja nie-obiekt (tekst, null, tablica) = pominięta; obiekt = jest', () => {
    expect(parseScope(['SEO', null, ['SEO', 'x'], 7, ITEM])).toEqual([ITEM]);
  });

  it('C5 nazwa pusta, niewidoczna, nie-tekst = pominięta; tekst = jest', () => {
    for (const client_name of ['', '  ', '\u200B\u00AD', 42, { a: 1 }, null, true])
      expect(parseScope([{ client_name, client_description: 'x' }])).toEqual([]);
    expect(parseScope([{ client_name: ' SEO\u200B', client_description: 'x' }])).toEqual([
      { client_name: 'SEO', client_description: 'x' },
    ]);
  });

  it(`C6 nazwa ${SCOPE_NAME_MAX + 1} znaków = pominięta; ${SCOPE_NAME_MAX} = jest`, () => {
    expect(parseScope([{ client_name: 'a'.repeat(SCOPE_NAME_MAX + 1) }])).toEqual([]);
    expect(parseScope([{ client_name: 'a'.repeat(SCOPE_NAME_MAX) }])).toHaveLength(1);
  });

  it(`C7 opis nie-tekst albo ${SCOPE_DESCRIPTION_MAX + 1} znaków = null; ${SCOPE_DESCRIPTION_MAX} = jest`, () => {
    for (const client_description of [5, { a: 1 }, 'b'.repeat(SCOPE_DESCRIPTION_MAX + 1)])
      expect(parseScope([{ client_name: 'SEO', client_description }])).toEqual([
        { client_name: 'SEO', client_description: null },
      ]);
    const ok = parseScope([
      { client_name: 'SEO', client_description: 'b'.repeat(SCOPE_DESCRIPTION_MAX) },
    ]);
    expect(ok[0].client_description).toHaveLength(SCOPE_DESCRIPTION_MAX);
  });

  it(`C8 ${SCOPE_MAX_ITEMS + 10} pozycji = najwyżej ${SCOPE_MAX_ITEMS}`, () => {
    const many = Array.from({ length: SCOPE_MAX_ITEMS + 10 }, (_, i) => ({ client_name: `O${i}` }));
    expect(parseScope(many)).toHaveLength(SCOPE_MAX_ITEMS);
    expect(parseScope(many.slice(0, 3))).toHaveLength(3);
  });
});
