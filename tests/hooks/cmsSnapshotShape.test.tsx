import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import KnowledgeBase from '../../components/pages/KnowledgeBase';
import {
  CMS_SNAPSHOT_ID,
  CMS_DOC,
  readCmsSnapshot,
  serializeCmsSnapshot,
  isValidSnapshotEntry,
  type CmsDocId,
} from '../../hooks/useCmsDocument';
import type { Article } from '../../types/article';

// MIX-1613: wpis zrzutu, który nie ma kształtu listy (albo ma uszkodzone pozycje), nie może
// wywrócić strony ani przejść jako dane: hook pobiera z CMS jak bez zrzutu.

const h = vi.hoisted(() => ({ getArticles: vi.fn() }));
vi.mock('../../services/cmsService', () => ({
  cmsService: { getArticles: (...a: unknown[]) => h.getArticles(...a) },
}));

const art = (n: number): Article => ({
  id: `a${n}`,
  title: `Artykuł numer ${n}`,
  description: `Opis ${n}`,
  category: 'tech',
  categoryLabel: 'tech',
  image: '/assets/images/sygnet.png',
  date: `2026-01-0${n}`,
  readTime: '5 min',
  slug: `/baza-wiedzy/art-${n}`,
  tags: ['x'],
});
const good = [art(1), art(2)];

const putRaw = (key: string, value: unknown, omitKey = false) => {
  const el = document.createElement('script');
  el.setAttribute('type', 'application/json');
  el.id = CMS_SNAPSHOT_ID;
  el.textContent = serializeCmsSnapshot(omitKey ? {} : { [key]: value });
  document.body.appendChild(el);
};

afterEach(() => {
  document.getElementById(CMS_SNAPSHOT_ID)?.remove();
  h.getArticles.mockReset();
  vi.restoreAllMocks();
  cleanup();
});

const badLists: Array<[string, unknown]> = [
  ['obiekt zamiast listy', { 0: art(1), length: 1 }],
  ['tekst', 'Artykuł numer 1'],
  ['liczba', 42],
  ['null', null],
  ['pusty obiekt', {}],
  ['lista z null', [art(1), null]],
  ['lista z tekstem', [art(1), 'x']],
  ['lista z zagnieżdżoną listą', [art(1), [art(2)]]],
  ['pozycja bez tytułu', [{ ...art(1), title: undefined }]],
  ['pozycja z liczbą w slugu', [{ ...art(1), slug: 5 }]],
  ['pozycja z pustą datą', [{ ...art(1), date: '' }]],
];

describe('readCmsSnapshot: kształt wpisu', () => {
  it.each(badLists)('lista artykułów: %s = brak zrzutu', (_name, value) => {
    putRaw('articleList|list', value);
    expect(readCmsSnapshot<Article[]>(CMS_DOC.articleList, 'list')).toBeUndefined();
  });

  it('brak wpisu = brak zrzutu', () => {
    putRaw('x', 1, true);
    expect(readCmsSnapshot(CMS_DOC.articleList, 'list')).toBeUndefined();
  });

  it('poprawna lista przechodzi bez zmian (bliźniak)', () => {
    putRaw('articleList|list', good);
    expect(readCmsSnapshot<Article[]>(CMS_DOC.articleList, 'list')).toEqual(good);
  });

  it('pusta lista z udanej odpowiedzi jest poprawna (bliźniak)', () => {
    putRaw('caseStudyList|list', []);
    expect(readCmsSnapshot(CMS_DOC.caseStudyList, 'list')).toEqual([]);
  });

  it.each<[CmsDocId, unknown[], unknown[]]>([
    ['industryList', [{ name: 'A', slug: 'a' }], [{ name: 'A' }, { slug: 'a' }]],
    ['caseStudyList', [{ title: 'T', slug: 't' }], [{ title: 'T' }, { slug: 't' }]],
  ])('%s (te same reguły co /baza-wiedzy/): dobra przechodzi, zła nie', (id, ok, bad) => {
    expect(isValidSnapshotEntry(id, ok)).toBe(true);
    for (const b of bad) expect(isValidSnapshotEntry(id, [b])).toBe(false);
    expect(isValidSnapshotEntry(id, { name: 'A', slug: 'a', title: 'T' })).toBe(false);
    expect(isValidSnapshotEntry(id, 'tekst')).toBe(false);
    expect(isValidSnapshotEntry(id, null)).toBe(false);
  });

  it('dokument (nie lista): obiekt tak, lista/tekst/liczba nie', () => {
    expect(isValidSnapshotEntry(CMS_DOC.article, { title: 'x' })).toBe(true);
    expect(isValidSnapshotEntry(CMS_DOC.article, [])).toBe(false);
    expect(isValidSnapshotEntry(CMS_DOC.article, 'x')).toBe(false);
    expect(isValidSnapshotEntry(CMS_DOC.industry, 7)).toBe(false);
    expect(isValidSnapshotEntry(CMS_DOC.location, null)).toBe(false);
  });
});

describe('/baza-wiedzy/ ze zrzutem o złym kształcie', () => {
  const renderPage = () =>
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/baza-wiedzy/']}>
          <KnowledgeBase />
        </MemoryRouter>
      </HelmetProvider>,
    );

  it.each(badLists)('%s: strona się nie wywraca, lista idzie z CMS', async (_name, value) => {
    putRaw('articleList|list', value);
    h.getArticles.mockResolvedValue(good);
    renderPage();
    expect(await screen.findByText('Artykuł numer 2')).toBeInTheDocument();
    expect(h.getArticles).toHaveBeenCalledTimes(1);
  });

  it('poprawny zrzut: bez żądania do CMS (bliźniak)', () => {
    putRaw('articleList|list', good);
    renderPage();
    expect(screen.getByText('Artykuł numer 2')).toBeInTheDocument();
    expect(h.getArticles).not.toHaveBeenCalled();
  });
});
