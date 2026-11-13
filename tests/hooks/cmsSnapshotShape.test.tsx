import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import KnowledgeBase from '../../components/pages/KnowledgeBase';
import PortfolioPage from '../../components/pages/PortfolioPage';
import IndustryHub from '../../components/pages/IndustryHub';
import { ModalProvider } from '../../context/ModalContext';
import {
  CMS_SNAPSHOT_ID,
  CMS_DOC,
  readCmsSnapshot,
  serializeCmsSnapshot,
  isValidSnapshotEntry,
} from '../../hooks/useCmsDocument';
import {
  MAX_SNAPSHOT_LIST_ITEMS,
  MAX_SNAPSHOT_STRING_ARRAY,
  SNAPSHOT_LIST_SCHEMAS,
} from '../../hooks/cmsSnapshotSchema';

// MIX-1613 r2: zrzut listy CMS ma allowlistę WSZYSTKICH pól czytanych przez szablon (z typem).
// Jedna zła pozycja = cały zrzut odrzucony = lista z CMS; strona nigdy się nie wywraca.
// Testy na poziomie STRON (render) dla 3 list, każdy zły kształt ma dobrego bliźniaka.

const h = vi.hoisted(() => ({
  getArticles: vi.fn(),
  getCaseStudyList: vi.fn(),
  getIndustryList: vi.fn(),
}));
vi.mock('../../services/cmsService', () => ({
  cmsService: {
    getArticles: (...a: unknown[]) => h.getArticles(...a),
    getCaseStudyList: (...a: unknown[]) => h.getCaseStudyList(...a),
    getIndustryList: (...a: unknown[]) => h.getIndustryList(...a),
    getTestimonials: () => Promise.resolve([]),
  },
  urlFor: () => ({ width: () => ({ height: () => ({ url: () => 'https://example.com/i.jpg' }) }) }),
}));

type Item = Record<string, unknown>;

const art = (n: number, extra: Item = {}): Item => ({
  id: `a${n}`,
  title: `Zrzut artykuł ${n}`,
  description: `Opis ${n}`,
  category: 'tech',
  categoryLabel: 'tech',
  image: '/assets/images/sygnet.png',
  date: `2026-01-0${n}`,
  readTime: '5 min',
  slug: `/baza-wiedzy/art-${n}`,
  tags: ['x'],
  ...extra,
});
const proj = (n: number, extra: Item = {}): Item => ({
  _id: `p${n}`,
  title: `Zrzut projekt ${n}`,
  slug: `projekt-${n}`,
  category: 'web',
  subcategory: ['landing'],
  client: 'K1',
  excerpt: 'Opis projektu',
  mainImage: { _type: 'image', asset: { _ref: 'image-abc123-800x600-jpg', _type: 'reference' } },
  ...extra,
});
const ind = (n: number, extra: Item = {}): Item => ({
  _id: `i${n}`,
  name: `Zrzut branża ${n}`,
  slug: `branza-${n}`,
  forWho: 'dla firm',
  ...extra,
});

/** Pozycja z jednym polem zamienionym na złe albo usuniętym (undefined = brak klucza). */
const zmien = (base: Item, pole: string, wartosc: unknown): Item => {
  const kopia = { ...base };
  if (wartosc === undefined) delete kopia[pole];
  else kopia[pole] = wartosc;
  return kopia;
};

interface ListCase {
  id: (typeof CMS_DOC)[keyof typeof CMS_DOC];
  strona: string;
  mock: ReturnType<typeof vi.fn>;
  zrzut: (n: number, extra?: Item) => Item;
  cms: Item;
  tytulZrzutu: (n: number) => string;
  tytulCms: string;
  zle: Array<[string, Item]>;
  dobreBliznaki: Array<[string, Item]>;
  render: () => ReturnType<typeof render>;
}

const wrap = (el: React.ReactElement, path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <ModalProvider>{el}</ModalProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

const LISTY: ListCase[] = [
  {
    id: CMS_DOC.articleList,
    strona: '/baza-wiedzy/',
    mock: h.getArticles,
    zrzut: art,
    cms: art(9, { title: 'Z CMS artykuł' }),
    tytulZrzutu: (n) => `Zrzut artykuł ${n}`,
    tytulCms: 'Z CMS artykuł',
    render: () => wrap(<KnowledgeBase />, '/baza-wiedzy/'),
    zle: [
      ['tags: brak', zmien(art(2), 'tags', undefined)],
      ['tags: tekst', zmien(art(2), 'tags', 'a,b')],
      ['tags: obiekt', zmien(art(2), 'tags', { 0: 'a', length: 1 })],
      ['tags: liczba', zmien(art(2), 'tags', 5)],
      ['tags: lista liczb', zmien(art(2), 'tags', [1, 2])],
      ['tags: null', zmien(art(2), 'tags', null)],
      ['category: brak', zmien(art(2), 'category', undefined)],
      ['category: liczba', zmien(art(2), 'category', 7)],
      ['category: pusty tekst', zmien(art(2), 'category', '')],
      ['categoryLabel: brak', zmien(art(2), 'categoryLabel', undefined)],
      ['description: brak', zmien(art(2), 'description', undefined)],
      ['description: liczba', zmien(art(2), 'description', 3)],
      ['title: obiekt', zmien(art(2), 'title', { a: 1 })],
      ['title: brak', zmien(art(2), 'title', undefined)],
      ['id: liczba', zmien(art(2), 'id', 4)],
      ['image: brak', zmien(art(2), 'image', undefined)],
      ['date: liczba', zmien(art(2), 'date', 20260101)],
      ['readTime: liczba', zmien(art(2), 'readTime', 5)],
      ['slug: liczba', zmien(art(2), 'slug', 5)],
      ['pozycja = null', null as unknown as Item],
      ['pozycja = tekst', 'x' as unknown as Item],
      ['pozycja = lista', [art(2)] as unknown as Item],
    ],
    dobreBliznaki: [
      ['pusty opis (tekst)', art(2, { description: '' })],
      ['tags: pusta lista', art(2, { tags: [] })],
      [
        'pola spoza allowlisty (ignorowane)',
        art(2, { isFeatured: true, updatedDate: '2026-02-01' }),
      ],
    ],
  },
  {
    id: CMS_DOC.caseStudyList,
    strona: '/portfolio/',
    mock: h.getCaseStudyList,
    zrzut: proj,
    cms: proj(9, { title: 'Z CMS projekt' }),
    tytulZrzutu: (n) => `Zrzut projekt ${n}`,
    tytulCms: 'Z CMS projekt',
    render: () => wrap(<PortfolioPage />, '/portfolio/'),
    zle: [
      ['subcategory: tekst', zmien(proj(2), 'subcategory', 'landing')],
      ['subcategory: liczba', zmien(proj(2), 'subcategory', 5)],
      ['subcategory: obiekt', zmien(proj(2), 'subcategory', { 0: 'a', length: 1 })],
      ['subcategory: lista liczb', zmien(proj(2), 'subcategory', [1, 2])],
      ['subcategory: null', zmien(proj(2), 'subcategory', null)],
      ['category: brak', zmien(proj(2), 'category', undefined)],
      ['category: liczba', zmien(proj(2), 'category', 1)],
      ['_id: brak', zmien(proj(2), '_id', undefined)],
      ['title: obiekt', zmien(proj(2), 'title', { a: 1 })],
      ['slug: liczba', zmien(proj(2), 'slug', 5)],
      ['client: obiekt', zmien(proj(2), 'client', { a: 1 })],
      ['excerpt: obiekt', zmien(proj(2), 'excerpt', { a: 1 })],
      ['mainImage: tekst', zmien(proj(2), 'mainImage', 'obraz.jpg')],
      ['mainImage: pusty obiekt', zmien(proj(2), 'mainImage', {})],
      ['mainImage: asset tekst', zmien(proj(2), 'mainImage', { asset: 'x' })],
      ['mainImage: zły _ref', zmien(proj(2), 'mainImage', { asset: { _ref: 'zly' } })],
      ['pozycja = null', null as unknown as Item],
    ],
    dobreBliznaki: [
      [
        'bez pól opcjonalnych',
        { _id: 'p2', title: 'Zrzut projekt 2', slug: 'p2', category: 'web' },
      ],
      ['subcategory: pusta lista', proj(2, { subcategory: [] })],
      ['pola spoza allowlisty (ignorowane)', proj(2, { clientLogo: { x: 1 }, date: '2026-01-01' })],
    ],
  },
  {
    id: CMS_DOC.industryList,
    strona: '/branza/',
    mock: h.getIndustryList,
    zrzut: ind,
    cms: ind(9, { name: 'Z CMS branża' }),
    tytulZrzutu: (n) => `Zrzut branża ${n}`,
    tytulCms: 'Z CMS branża',
    render: () => wrap(<IndustryHub />, '/branza/'),
    zle: [
      ['forWho: liczba', zmien(ind(2), 'forWho', 5)],
      ['forWho: lista', zmien(ind(2), 'forWho', ['Kliniki', 'Gabinety'])],
      ['forWho: obiekt', zmien(ind(2), 'forWho', { a: 1 })],
      ['forWho: true', zmien(ind(2), 'forWho', true)],
      ['name: liczba', zmien(ind(2), 'name', 5)],
      ['name: brak', zmien(ind(2), 'name', undefined)],
      ['slug: brak', zmien(ind(2), 'slug', undefined)],
      ['slug: liczba', zmien(ind(2), 'slug', 5)],
      ['pozycja = null', null as unknown as Item],
    ],
    dobreBliznaki: [
      ['forWho: null', ind(2, { forWho: null })],
      ['forWho: brak', zmien(ind(2), 'forWho', undefined)],
      ['forWho: pusty tekst', ind(2, { forWho: '' })],
      ['pola spoza allowlisty (ignorowane)', ind(2, { painPointCount: 3 })],
    ],
  },
];

const putRaw = (key: string, value: unknown) => {
  const el = document.createElement('script');
  el.setAttribute('type', 'application/json');
  el.id = CMS_SNAPSHOT_ID;
  el.textContent = serializeCmsSnapshot({ [key]: value });
  document.body.appendChild(el);
};

afterEach(() => {
  document.getElementById(CMS_SNAPSHOT_ID)?.remove();
  for (const m of [h.getArticles, h.getCaseStudyList, h.getIndustryList]) m.mockReset();
  vi.restoreAllMocks();
  cleanup();
});

const zleKsztaltyListy: Array<[string, unknown]> = [
  ['obiekt zamiast listy', { 0: {}, length: 1 }],
  ['tekst', 'lista'],
  ['liczba', 42],
  ['null', null],
  ['pusty obiekt', {}],
  ['lista zagnieżdżona', [[{}]]],
];

describe.each(LISTY)('zrzut listy $id', (L) => {
  const key = `${L.id}|list`;

  it.each(zleKsztaltyListy)('unit: %s = brak zrzutu', (_n, value) => {
    putRaw(key, value);
    expect(readCmsSnapshot(L.id, 'list')).toBeUndefined();
  });

  it.each(L.zle)('unit: zła pozycja (%s) unieważnia cały zrzut', (_n, zla) => {
    expect(isValidSnapshotEntry(L.id, [L.zrzut(1), zla])).toBe(false);
    putRaw(key, [L.zrzut(1), zla]);
    expect(readCmsSnapshot(L.id, 'list')).toBeUndefined();
  });

  it.each(L.dobreBliznaki)('unit: dobry bliźniak (%s) przechodzi', (_n, dobra) => {
    expect(isValidSnapshotEntry(L.id, [L.zrzut(1), dobra])).toBe(true);
  });

  it('unit: limit długości listy (1000 tak, 1001 nie)', () => {
    const lista = (n: number) => Array.from({ length: n }, (_, i) => L.zrzut(i));
    expect(isValidSnapshotEntry(L.id, lista(MAX_SNAPSHOT_LIST_ITEMS))).toBe(true);
    expect(isValidSnapshotEntry(L.id, lista(MAX_SNAPSHOT_LIST_ITEMS + 1))).toBe(false);
  });

  it('unit: dokument (nie lista) pod kluczem listy odrzucony, pusta lista z udanej odpowiedzi poprawna', () => {
    expect(isValidSnapshotEntry(L.id, L.zrzut(1))).toBe(false);
    expect(isValidSnapshotEntry(L.id, [])).toBe(true);
  });

  it.each(L.zle)(
    'STRONA %s: nie wywraca się, lista idzie z CMS (jedno pobranie), zrzut ignorowany',
    async (_n, zla) => {
      putRaw(key, [L.zrzut(1), zla]);
      L.mock.mockResolvedValue([L.cms]);
      L.render();
      expect(await screen.findByText(L.tytulCms)).toBeInTheDocument();
      expect(screen.queryByText(L.tytulZrzutu(1))).not.toBeInTheDocument();
      expect(L.mock).toHaveBeenCalledTimes(1);
    },
  );

  it.each(L.dobreBliznaki)(
    'STRONA, dobry bliźniak (%s): renderuje zrzut, bez żądania do CMS',
    (_n, dobra) => {
      putRaw(key, [L.zrzut(1), dobra]);
      L.render();
      expect(screen.getByText(L.tytulZrzutu(1))).toBeInTheDocument();
      expect(L.mock).not.toHaveBeenCalled();
    },
  );

  it('STRONA, pełny dobry zrzut: renderuje zrzut, bez żądania do CMS', () => {
    putRaw(key, [L.zrzut(1), L.zrzut(2)]);
    L.render();
    expect(screen.getByText(L.tytulZrzutu(1))).toBeInTheDocument();
    expect(L.mock).not.toHaveBeenCalled();
  });
});

describe('allowlista: spójność ze szablonami', () => {
  it('każda lista z CMS_DOC ma allowlistę list, a dokumenty (nie listy) mają osobną (MIX-1620)', () => {
    expect(Object.keys(SNAPSHOT_LIST_SCHEMAS).sort()).toEqual(
      [CMS_DOC.articleList, CMS_DOC.caseStudyList, CMS_DOC.industryList].sort(),
    );
    // Dokument bez wymaganych pól czytanych przez szablon nie przechodzi (kiedyś wystarczył obiekt).
    expect(isValidSnapshotEntry(CMS_DOC.article, { title: 'x' })).toBe(false);
    expect(isValidSnapshotEntry(CMS_DOC.industry, { name: 'x' })).toBe(true);
    expect(isValidSnapshotEntry(CMS_DOC.article, [])).toBe(false);
    expect(isValidSnapshotEntry(CMS_DOC.industry, 7)).toBe(false);
    expect(isValidSnapshotEntry(CMS_DOC.location, null)).toBe(false);
  });

  it('limit tablicy tekstów (tagi) i tablica zbyt długa = odrzucona', () => {
    const tags = (n: number) => Array.from({ length: n }, (_, i) => `t${i}`);
    expect(
      isValidSnapshotEntry(CMS_DOC.articleList, [
        art(1, { tags: tags(MAX_SNAPSHOT_STRING_ARRAY) }),
      ]),
    ).toBe(true);
    expect(
      isValidSnapshotEntry(CMS_DOC.articleList, [
        art(1, { tags: tags(MAX_SNAPSHOT_STRING_ARRAY + 1) }),
      ]),
    ).toBe(false);
  });

  it('brak wpisu = brak zrzutu', () => {
    putRaw('inny|klucz', 1);
    expect(readCmsSnapshot(CMS_DOC.articleList, 'list')).toBeUndefined();
  });
});
