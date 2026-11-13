import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ArticleTemplate from '../../components/templates/ArticleTemplate';
import CaseStudyTemplate from '../../components/templates/CaseStudyTemplate';
import PseoTemplate from '../../components/templates/pseo/PseoTemplate';
import { ModalProvider } from '../../context/ModalContext';
import {
  CMS_SNAPSHOT_ID,
  CMS_DOC,
  readCmsSnapshot,
  serializeCmsSnapshot,
  isValidSnapshotEntry,
} from '../../hooks/useCmsDocument';
import {
  MAX_SNAPSHOT_COLLECTION,
  MAX_SNAPSHOT_STRING_ARRAY,
  SNAPSHOT_DOCUMENT_SCHEMAS,
  SNAPSHOT_LIST_SCHEMAS,
} from '../../hooks/cmsSnapshotSchema';

// MIX-1620: dokumenty pojedyncze CMS (artykuł, realizacja, branża, lokalizacja) mają allowlistę
// WSZYSTKICH pól czytanych przez szablony, z typem, jak listy w MIX-1613. Zły kształt = zrzut
// odrzucony = dokument z CMS (strona się nie wywraca). `null` w polu opcjonalnym jest poprawny
// (tak GROQ oddaje puste pole), zły TYP odrzuca. Każdy zły kształt ma dobrego bliźniaka.

const h = vi.hoisted(() => ({
  getArticleBySlug: vi.fn(),
  getCaseStudyPage: vi.fn(),
  getIndustryBySlug: vi.fn(),
  getLocationBySlug: vi.fn(),
}));
vi.mock('../../services/cmsService', () => {
  const chain = {
    width: () => chain,
    height: () => chain,
    fit: () => chain,
    url: () => 'https://example.com/i.jpg',
  };
  return {
    cmsService: {
      getArticleBySlug: (...a: unknown[]) => h.getArticleBySlug(...a),
      getCaseStudyPage: (...a: unknown[]) => h.getCaseStudyPage(...a),
      getIndustryBySlug: (...a: unknown[]) => h.getIndustryBySlug(...a),
      getLocationBySlug: (...a: unknown[]) => h.getLocationBySlug(...a),
    },
    client: {},
    urlFor: () => chain,
    CmsUnavailableError: class CmsUnavailableError extends Error {},
  };
});
vi.mock('@sanity/image-url', () => {
  const chain = {
    width: () => chain,
    height: () => chain,
    fit: () => chain,
    url: () => 'https://example.com/i.jpg',
  };
  return { default: () => ({ image: () => chain }) };
});
vi.mock('../../components/articles/RelatedArticles', () => ({ default: () => null }));
vi.mock('../../components/common/PortableTextRenderer', () => ({ default: () => null }));
vi.mock('../../components/common/ArticleSchemaSeo', () => ({ default: () => null }));
vi.mock('../../components/features/audit/AuditTeaser', () => ({ default: () => null }));

type Doc = Record<string, unknown>;

const IMG = { _type: 'image', asset: { _ref: 'image-abc123-800x600-jpg', _type: 'reference' } };
const BLOCK = {
  _type: 'block',
  _key: 'k1',
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', text: 'Treść' }],
};

/** Dokument z jednym polem zamienionym na złe albo usuniętym (undefined = brak klucza). */
const zmien = (base: Doc, pole: string, wartosc: unknown): Doc => {
  const kopia = { ...base };
  if (wartosc === undefined) delete kopia[pole];
  else kopia[pole] = wartosc;
  return kopia;
};
const lista = (n: number) => Array.from({ length: n }, (_, i) => `t${i}`);

// --- artykuł ---------------------------------------------------------------------------------
const art = (extra: Doc = {}): Doc => ({
  _id: 'a1',
  title: 'Zrzut artykuł',
  slug: 'art-1',
  publishedAt: '2026-01-01',
  body: [BLOCK],
  excerpt: 'Opis',
  category: { title: 'tech' },
  readTime: '5',
  tags: ['x'],
  ...extra,
});
const artZle: Array<[string, Doc]> = [
  ['_id: brak', zmien(art(), '_id', undefined)],
  ['title: brak', zmien(art(), 'title', undefined)],
  ['title: null', art({ title: null })],
  ['title: obiekt', art({ title: { a: 1 } })],
  ['title: pusty tekst', art({ title: '' })],
  ['slug: brak', zmien(art(), 'slug', undefined)],
  ['slug: obiekt (stary kształt slug.current)', art({ slug: { current: 'art-1' } })],
  ['slug: liczba', art({ slug: 5 })],
  ['publishedAt: brak', zmien(art(), 'publishedAt', undefined)],
  ['publishedAt: null', art({ publishedAt: null })],
  ['publishedAt: liczba', art({ publishedAt: 1767225600 })],
  ['body: brak', zmien(art(), 'body', undefined)],
  ['body: null', art({ body: null })],
  ['body: tekst', art({ body: 'treść' })],
  ['body: obiekt', art({ body: { 0: BLOCK, length: 1 } })],
  ['body: blok = liczba', art({ body: [1] })],
  ['body: blok bez _type', art({ body: [{ children: [] }] })],
  ['body: block bez children', art({ body: [{ _type: 'block', _key: 'k' }] })],
  ['body: children = tekst', art({ body: [{ _type: 'block', children: 'x' }] })],
  ['body: markDefs = tekst', art({ body: [{ ...BLOCK, markDefs: 'x' }] })],
  [
    'body: link bez tekstowego href',
    art({ body: [{ ...BLOCK, markDefs: [{ _type: 'link', _key: 'm', href: 5 }] }] }),
  ],
  ['body: obraz ze złym _ref', art({ body: [{ _type: 'image', asset: { _ref: 'zly' } }] })],
  ['body: kod z obiektem zamiast tekstu', art({ body: [{ _type: 'code', code: { a: 1 } }] })],
  [
    'body: za dużo bloków',
    art({ body: Array.from({ length: MAX_SNAPSHOT_COLLECTION + 1 }, () => BLOCK) }),
  ],
  ['excerpt: liczba', art({ excerpt: 3 })],
  ['excerpt: obiekt', art({ excerpt: { a: 1 } })],
  ['category: tekst', art({ category: 'tech' })],
  ['category: lista', art({ category: ['tech'] })],
  ['category: title obiekt', art({ category: { title: { a: 1 } } })],
  ['readTime: liczba', art({ readTime: 5 })],
  ['readTime: obiekt', art({ readTime: { a: 1 } })],
  ['tags: tekst', art({ tags: 'a,b' })],
  ['tags: obiekt', art({ tags: { 0: 'a', length: 1 } })],
  ['tags: lista liczb', art({ tags: [1, 2] })],
  ['tags: lista z null', art({ tags: ['a', null] })],
  ['tags: za dużo', art({ tags: lista(MAX_SNAPSHOT_STRING_ARRAY + 1) })],
];
const artDobre: Array<[string, Doc]> = [
  ['excerpt: null', art({ excerpt: null })],
  ['excerpt: brak', zmien(art(), 'excerpt', undefined)],
  ['excerpt: pusty tekst', art({ excerpt: '' })],
  ['category: null', art({ category: null })],
  ['category: brak', zmien(art(), 'category', undefined)],
  ['category: title null', art({ category: { title: null } })],
  ['readTime: null', art({ readTime: null })],
  ['readTime: brak', zmien(art(), 'readTime', undefined)],
  ['tags: null', art({ tags: null })],
  ['tags: brak', zmien(art(), 'tags', undefined)],
  ['tags: pusta lista', art({ tags: [] })],
  ['tags: dokładnie limit', art({ tags: lista(MAX_SNAPSHOT_STRING_ARRAY) })],
  ['body: pusta lista', art({ body: [] })],
  [
    'body: link, obraz, kod',
    art({
      body: [
        { ...BLOCK, markDefs: [{ _type: 'link', _key: 'm', href: '/x/' }] },
        { _type: 'image', asset: { _ref: 'image-abc123-800x600-jpg' } },
        { _type: 'code', code: 'a = 1' },
        { _type: 'inneCmsowe', x: 1 },
      ],
    }),
  ],
  [
    'pola spoza allowlisty (ignorowane)',
    art({ _updatedAt: 'x', mainImage: { x: 1 }, author: { name: 'A' } }),
  ],
];

// --- realizacja ------------------------------------------------------------------------------
const proj = (extra: Doc = {}): Doc => ({
  title: 'Zrzut realizacja',
  category: 'web',
  subcategory: ['landing'],
  client: 'K1',
  clientLogo: IMG,
  date: '2026-01-01',
  excerpt: 'Opis realizacji',
  mainImage: IMG,
  challenge: [BLOCK],
  solution: [BLOCK],
  result: [BLOCK],
  websiteUrl: 'https://example.com',
  techStack: ['React'],
  integrations: ['Stripe'],
  tools: ['Figma'],
  platforms: ['Google Ads'],
  typography: 'Inter',
  kpi: [{ value: '10', label: 'wzrost' }],
  gallery: [IMG],
  designAssets: [{ asset: { _ref: 'image-abc123-800x600-jpg', _type: 'reference' }, caption: 'c' }],
  downloads: [{ asset: { url: 'https://example.com/f.pdf' }, description: 'plik' }],
  credits: [{ _id: 'c1', name: 'Ala', role: 'Dev', image: null }],
  ...extra,
});
const next = (extra: Doc = {}): Doc => ({
  title: 'Następna realizacja',
  slug: 'nastepna',
  mainImage: IMG,
  ...extra,
});
const cs = (p: Doc = proj(), n: unknown = next()): Doc => ({ project: p, nextProject: n });
const csp = (pole: string, wartosc: unknown): Doc => cs(zmien(proj(), pole, wartosc));
const csZle: Array<[string, Doc]> = [
  ['project: brak', zmien(cs(), 'project', undefined)],
  ['project: null', cs(null as unknown as Doc)],
  ['project: tekst', cs('x' as unknown as Doc)],
  ['project: lista', cs([] as unknown as Doc)],
  ['title: brak', csp('title', undefined)],
  ['title: obiekt', csp('title', { a: 1 })],
  ['category: brak', csp('category', undefined)],
  ['category: liczba', csp('category', 1)],
  ['subcategory: tekst', csp('subcategory', 'landing')],
  ['subcategory: lista liczb', csp('subcategory', [1])],
  ['client: obiekt', csp('client', { a: 1 })],
  ['clientLogo: tekst', csp('clientLogo', 'logo.png')],
  ['clientLogo: zły _ref', csp('clientLogo', { asset: { _ref: 'zly' } })],
  ['date: liczba', csp('date', 20260101)],
  ['excerpt: obiekt', csp('excerpt', { a: 1 })],
  ['mainImage: tekst', csp('mainImage', 'obraz.jpg')],
  ['mainImage: pusty obiekt', csp('mainImage', {})],
  ['mainImage: zły _ref', csp('mainImage', { asset: { _ref: 'zly' } })],
  ['challenge: tekst', csp('challenge', 'treść')],
  ['challenge: obiekt', csp('challenge', { a: 1 })],
  ['solution: blok = liczba', csp('solution', [1])],
  ['result: block bez children', csp('result', [{ _type: 'block' }])],
  ['websiteUrl: liczba', csp('websiteUrl', 5)],
  ['techStack: tekst', csp('techStack', 'React')],
  ['techStack: lista liczb', csp('techStack', [1])],
  ['integrations: obiekt', csp('integrations', { a: 1 })],
  ['tools: liczba', csp('tools', 5)],
  ['platforms: lista z obiektem', csp('platforms', [{ a: 1 }])],
  ['typography: liczba', csp('typography', 5)],
  ['kpi: tekst', csp('kpi', 'x')],
  ['kpi: value liczba', csp('kpi', [{ value: 10, label: 'a' }])],
  ['kpi: brak label', csp('kpi', [{ value: '10' }])],
  ['kpi: element null', csp('kpi', [null])],
  ['gallery: tekst', csp('gallery', 'x')],
  ['gallery: element tekst', csp('gallery', ['x'])],
  ['gallery: zły _ref', csp('gallery', [{ asset: { _ref: 'zly' } }])],
  [
    'gallery: za dużo',
    csp(
      'gallery',
      Array.from({ length: MAX_SNAPSHOT_COLLECTION + 1 }, () => IMG),
    ),
  ],
  ['designAssets: brak asset', csp('designAssets', [{ caption: 'x' }])],
  ['designAssets: asset tekst', csp('designAssets', [{ asset: 'x' }])],
  ['designAssets: zły _ref', csp('designAssets', [{ asset: { _ref: 'zly' } }])],
  [
    'designAssets: caption obiekt',
    csp('designAssets', [{ asset: { _ref: 'image-abc123-800x600-jpg' }, caption: { a: 1 } }]),
  ],
  ['designAssets: element null', csp('designAssets', [null])],
  ['downloads: brak asset', csp('downloads', [{ description: 'x' }])],
  ['downloads: asset null (zerwana referencja)', csp('downloads', [{ asset: null }])],
  ['downloads: url liczba', csp('downloads', [{ asset: { url: 5 } }])],
  ['downloads: description obiekt', csp('downloads', [{ asset: { url: 'u' }, description: {} }])],
  ['credits: element null (usunięty członek)', csp('credits', [null])],
  ['credits: brak _id', csp('credits', [{ name: 'Ala' }])],
  ['credits: name liczba', csp('credits', [{ _id: 'c', name: 5 }])],
  ['credits: image zły', csp('credits', [{ _id: 'c', name: 'Ala', image: { x: 1 } }])],
  ['credits: role obiekt', csp('credits', [{ _id: 'c', name: 'Ala', role: {} }])],
  ['nextProject: tekst', cs(proj(), 'x')],
  ['nextProject: lista', cs(proj(), [])],
  ['nextProject: brak sluga', cs(proj(), zmien(next(), 'slug', undefined))],
  ['nextProject: slug liczba', cs(proj(), next({ slug: 5 }))],
  ['nextProject: brak title', cs(proj(), zmien(next(), 'title', undefined))],
  ['nextProject: mainImage zły', cs(proj(), next({ mainImage: { asset: { _ref: 'zly' } } }))],
];
const csDobre: Array<[string, Doc]> = [
  [
    'minimalny projekt (tylko wymagane)',
    cs({ title: 'Zrzut realizacja', category: 'design' }, null),
  ],
  ['nextProject: null', cs(proj(), null)],
  ['nextProject: brak', zmien(cs(), 'nextProject', undefined)],
  ['nextProject: mainImage null', cs(proj(), next({ mainImage: null }))],
  ['downloads: null (zmierzone na prodzie)', csp('downloads', null)],
  ['credits: null (zmierzone na prodzie)', csp('credits', null)],
  ['clientLogo: null (zmierzone na prodzie)', csp('clientLogo', null)],
  ['subcategory: null', csp('subcategory', null)],
  ['client: null', csp('client', null)],
  ['date: null', csp('date', null)],
  ['excerpt: null', csp('excerpt', null)],
  ['mainImage: null', csp('mainImage', null)],
  [
    'challenge, solution, result: null',
    cs(proj({ challenge: null, solution: null, result: null })),
  ],
  ['websiteUrl, typography: null', cs(proj({ websiteUrl: null, typography: null }))],
  [
    'techStack, integrations, tools, platforms, kpi, gallery: null',
    cs(
      proj({
        techStack: null,
        integrations: null,
        tools: null,
        platforms: null,
        kpi: null,
        gallery: null,
        designAssets: null,
      }),
    ),
  ],
  [
    'credits: osoba z image i role null',
    csp('credits', [{ _id: 'c', name: 'Ala', role: null, image: IMG }]),
  ],
  ['downloads: description null', csp('downloads', [{ asset: { url: 'u' }, description: null }])],
  ['pusta galeria i puste listy', cs(proj({ gallery: [], credits: [], downloads: [], kpi: [] }))],
  [
    'obraz z crop i hotspot',
    csp('mainImage', { ...IMG, crop: { top: 0 }, hotspot: { x: 0.5, y: 0.5 } }),
  ],
  [
    'pola spoza allowlisty (ignorowane)',
    cs(proj({ _rev: 'r', performanceScore: 99, testimonial: 't' })),
  ],
];

// --- branża ----------------------------------------------------------------------------------
const ind = (extra: Doc = {}): Doc => ({
  _id: 'i1',
  name: 'Zrzut branża',
  slug: 'branza-1',
  forWho: 'dla firm',
  painPoints: ['Niska konwersja'],
  techRequirements: ['Płatności'],
  jargon: ['ROAS'],
  compliance: 'RODO',
  ...extra,
});
const indZle: Array<[string, Doc]> = [
  ['name: brak', zmien(ind(), 'name', undefined)],
  ['name: null', ind({ name: null })],
  ['name: liczba', ind({ name: 5 })],
  ['name: obiekt', ind({ name: { a: 1 } })],
  ['name: pusty tekst', ind({ name: '' })],
  ['forWho: liczba', ind({ forWho: 5 })],
  ['forWho: lista', ind({ forWho: ['Kliniki'] })],
  ['forWho: obiekt', ind({ forWho: { a: 1 } })],
  ['forWho: true', ind({ forWho: true })],
  ['painPoints: tekst', ind({ painPoints: 'a,b' })],
  ['painPoints: lista liczb', ind({ painPoints: [1] })],
  ['painPoints: lista obiektów', ind({ painPoints: [{ a: 1 }] })],
  ['painPoints: obiekt', ind({ painPoints: { 0: 'a', length: 1 } })],
  ['painPoints: za dużo', ind({ painPoints: lista(MAX_SNAPSHOT_STRING_ARRAY + 1) })],
  ['techRequirements: tekst', ind({ techRequirements: 'x' })],
  ['techRequirements: lista obiektów', ind({ techRequirements: [{ a: 1 }] })],
  ['jargon: liczba', ind({ jargon: 5 })],
  ['jargon: lista liczb', ind({ jargon: [1, 2] })],
  ['compliance: obiekt', ind({ compliance: { a: 1 } })],
  ['compliance: liczba', ind({ compliance: 5 })],
];
const indDobre: Array<[string, Doc]> = [
  ['forWho: null (zmierzone na prodzie)', ind({ forWho: null })],
  ['forWho: brak', zmien(ind(), 'forWho', undefined)],
  ['forWho: pusty tekst', ind({ forWho: '' })],
  ['painPoints: null (zmierzone na prodzie)', ind({ painPoints: null })],
  ['techRequirements: null (zmierzone na prodzie)', ind({ techRequirements: null })],
  ['jargon: null (zmierzone na prodzie)', ind({ jargon: null })],
  ['compliance: null (zmierzone na prodzie)', ind({ compliance: null })],
  ['listy puste', ind({ painPoints: [], techRequirements: [], jargon: [] })],
  ['pusty element listy (null)', ind({ painPoints: ['a', null], jargon: [null] })],
  ['tylko name', { name: 'Zrzut branża' }],
  [
    'pola spoza allowlisty (ignorowane)',
    ind({ heroImage: null, slug: { current: 'x' }, extra: 1 }),
  ],
];

// --- lokalizacja -----------------------------------------------------------------------------
const loc = (extra: Doc = {}): Doc => ({
  _id: 'l1',
  city: 'Zrzutowo',
  slug: 'zrzutowo',
  genitive: 'Zrzutowa',
  businessContext: 'Opis rynku',
  seoTitle: 'Tytuł SEO',
  seoDescription: 'Opis SEO',
  ...extra,
});
const locZle: Array<[string, Doc]> = [
  ['city: brak', zmien(loc(), 'city', undefined)],
  ['city: null', loc({ city: null })],
  ['city: liczba', loc({ city: 5 })],
  ['city: pusty tekst', loc({ city: '' })],
  ['genitive: brak', zmien(loc(), 'genitive', undefined)],
  ['genitive: null', loc({ genitive: null })],
  ['genitive: obiekt', loc({ genitive: { a: 1 } })],
  ['businessContext: liczba', loc({ businessContext: 5 })],
  ['businessContext: obiekt', loc({ businessContext: { a: 1 } })],
  ['seoTitle: obiekt', loc({ seoTitle: { a: 1 } })],
  ['seoTitle: liczba', loc({ seoTitle: 5 })],
  ['seoDescription: obiekt', loc({ seoDescription: { a: 1 } })],
  ['seoDescription: lista', loc({ seoDescription: ['a'] })],
];
const locDobre: Array<[string, Doc]> = [
  ['businessContext: null (zmierzone na prodzie)', loc({ businessContext: null })],
  ['businessContext: brak', zmien(loc(), 'businessContext', undefined)],
  ['seoTitle: null', loc({ seoTitle: null })],
  ['seoDescription: null (zmierzone na prodzie)', loc({ seoDescription: null })],
  ['tylko city i genitive', { city: 'Zrzutowo', genitive: 'Zrzutowa' }],
  ['pola spoza allowlisty (ignorowane)', loc({ slug: { current: 'x' }, extra: 1 })],
];

// --- strony ----------------------------------------------------------------------------------
const wrap = (path: string, route: string, el: React.ReactElement) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <ModalProvider>
          <Routes>
            <Route path={route} element={el} />
          </Routes>
        </ModalProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

interface DocCase {
  id: (typeof CMS_DOC)[keyof typeof CMS_DOC];
  slug: string;
  zrzut: Doc;
  zle: Array<[string, Doc]>;
  dobre: Array<[string, Doc]>;
  mock: ReturnType<typeof vi.fn>;
  cms: Doc;
  tekstZrzutu: RegExp;
  tekstCms: RegExp;
  render: () => ReturnType<typeof render>;
}

const DOKUMENTY: DocCase[] = [
  {
    id: CMS_DOC.article,
    slug: 'art-1',
    zrzut: art(),
    zle: artZle,
    dobre: artDobre,
    mock: h.getArticleBySlug,
    cms: art({ title: 'Z CMS artykuł' }),
    tekstZrzutu: /Zrzut artykuł/,
    tekstCms: /Z CMS artykuł/,
    render: () => wrap('/baza-wiedzy/art-1', '/baza-wiedzy/:slug', <ArticleTemplate />),
  },
  {
    id: CMS_DOC.caseStudy,
    slug: 'real-1',
    zrzut: cs(),
    zle: csZle,
    dobre: csDobre,
    mock: h.getCaseStudyPage,
    cms: cs(proj({ title: 'Z CMS realizacja' })),
    tekstZrzutu: /Zrzut realizacja/,
    tekstCms: /Z CMS realizacja/,
    render: () => wrap('/portfolio/real-1', '/portfolio/:slug', <CaseStudyTemplate />),
  },
  {
    id: CMS_DOC.industry,
    slug: 'branza-1',
    zrzut: ind(),
    zle: indZle,
    dobre: indDobre,
    mock: h.getIndustryBySlug,
    cms: ind({ name: 'Z CMS branża' }),
    tekstZrzutu: /Zrzut branża/,
    tekstCms: /Z CMS branża/,
    render: () => wrap('/branza/branza-1', '/branza/:slug', <PseoTemplate mode="industry" />),
  },
  {
    id: CMS_DOC.location,
    slug: 'zrzutowo',
    zrzut: loc(),
    zle: locZle,
    dobre: locDobre,
    mock: h.getLocationBySlug,
    cms: loc({ city: 'Zcmsowo' }),
    tekstZrzutu: /Zrzutowo/,
    tekstCms: /Zcmsowo/,
    render: () => wrap('/miasto/zrzutowo', '/miasto/:slug', <PseoTemplate mode="location" />),
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
  for (const m of Object.values(h)) m.mockReset();
  vi.restoreAllMocks();
  cleanup();
});

const zleKsztaltyDokumentu: Array<[string, unknown]> = [
  ['lista', [{}]],
  ['pusta lista', []],
  ['tekst', 'dokument'],
  ['liczba', 42],
  ['prawda', true],
  ['pusty obiekt', {}],
];

describe.each(DOKUMENTY)('zrzut dokumentu $id', (D) => {
  const key = `${D.id}|${D.slug}`;

  it('unit: pełny dobry dokument przechodzi', () => {
    expect(isValidSnapshotEntry(D.id, D.zrzut)).toBe(true);
    expect(isValidSnapshotEntry(D.id, D.cms)).toBe(true);
  });

  it.each(zleKsztaltyDokumentu)('unit: %s zamiast dokumentu = brak zrzutu', (_n, value) => {
    expect(isValidSnapshotEntry(D.id, value)).toBe(false);
    putRaw(key, value);
    expect(readCmsSnapshot(D.id, D.slug)).toBeUndefined();
  });

  it.each(D.zle)('unit: zły kształt (%s) = brak zrzutu', (_n, zly) => {
    expect(isValidSnapshotEntry(D.id, zly)).toBe(false);
    putRaw(key, zly);
    expect(readCmsSnapshot(D.id, D.slug)).toBeUndefined();
  });

  it.each(D.dobre)('unit: dobry bliźniak (%s) przechodzi', (_n, dobry) => {
    expect(isValidSnapshotEntry(D.id, dobry)).toBe(true);
    putRaw(key, dobry);
    expect(readCmsSnapshot(D.id, D.slug)).toBeDefined();
  });

  it.each(D.zle)(
    'STRONA %s: nie wywraca się, dokument idzie z CMS (jedno pobranie), zrzut ignorowany',
    async (_n, zly) => {
      putRaw(key, zly);
      D.mock.mockResolvedValue(D.cms);
      D.render();
      expect((await screen.findAllByText(D.tekstCms)).length).toBeGreaterThan(0);
      expect(screen.queryByText(D.tekstZrzutu)).not.toBeInTheDocument();
      expect(D.mock).toHaveBeenCalledTimes(1);
      expect(document.querySelector('[data-cms-error]')).toBeNull();
    },
  );

  it.each(D.dobre)(
    'STRONA, dobry bliźniak (%s): renderuje zrzut, bez żądania do CMS',
    async (_n, dobry) => {
      putRaw(key, dobry);
      D.render();
      await waitFor(() => expect(screen.getAllByText(D.tekstZrzutu).length).toBeGreaterThan(0));
      expect(D.mock).not.toHaveBeenCalled();
      expect(document.querySelector('[data-cms-error]')).toBeNull();
    },
  );
});

describe('allowlista dokumentów: spójność ze szablonami', () => {
  it('każdy identyfikator z CMS_DOC ma dokładnie jedną allowlistę (lista albo dokument)', () => {
    const wszystkie = Object.values(CMS_DOC).sort();
    const listy = Object.keys(SNAPSHOT_LIST_SCHEMAS);
    const dokumenty = Object.keys(SNAPSHOT_DOCUMENT_SCHEMAS);
    expect([...listy, ...dokumenty].sort()).toEqual(wszystkie);
    expect(listy.filter((k) => dokumenty.includes(k))).toEqual([]);
    expect(dokumenty.sort()).toEqual(
      [CMS_DOC.article, CMS_DOC.caseStudy, CMS_DOC.industry, CMS_DOC.location].sort(),
    );
  });

  it('nieznany identyfikator = odmowa (fail-closed), także nazwy z prototypu', () => {
    for (const id of ['nieznany', '', 'constructor', '__proto__', 'toString', 'hasOwnProperty']) {
      expect(isValidSnapshotEntry(id, { title: 'x', name: 'x', city: 'x' })).toBe(false);
      // Nazwa z prototypu nie może uchodzić za listę (pusta allowlista przepuściłaby tablicę).
      expect(isValidSnapshotEntry(id, [{ title: 'x' }])).toBe(false);
      expect(isValidSnapshotEntry(id, [])).toBe(false);
    }
  });

  it('pusty obiekt nie przechodzi żadnego dokumentu (wymagane pola)', () => {
    for (const id of [CMS_DOC.article, CMS_DOC.caseStudy, CMS_DOC.industry, CMS_DOC.location]) {
      expect(isValidSnapshotEntry(id, {})).toBe(false);
    }
  });
});
