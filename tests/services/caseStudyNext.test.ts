import { describe, it, expect, vi, beforeEach } from 'vitest';

// MIX-1378: „Następny projekt” prowadził do /portfolio/undefined/, bo kod czytał
// `slug.current`, a GROQ rzuca `"slug": slug.current` (zwykły tekst). Atrapa zwraca
// dokładnie ten kształt odpowiedzi, który daje Sanity.
const fetchWithCache = vi.fn();
vi.mock('../../services/cms/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/cms/client')>();
  return { ...actual, fetchWithCache: (...args: unknown[]) => fetchWithCache(...args) };
});

import { caseStudyService, pickNextCaseStudy } from '../../services/cms/caseStudyService';
import type { SanityCaseStudy } from '../../types';

const cs = (slug: unknown, title = String(slug)) =>
  ({ _id: `id-${String(slug)}`, title, slug, category: 'web' }) as unknown as SanityCaseStudy;

// Kolejność jak w `order(date desc)` z getCaseStudies.
const LIST = [cs('alfa'), cs('beta'), cs('gamma')];

/** Atrapa Sanity: zapytanie po slugu → dokument, zapytanie listy → LIST. */
const mockSanity = (list: SanityCaseStudy[]) =>
  fetchWithCache.mockImplementation(async (query: string, params?: { slug?: string }) => {
    if (params?.slug !== undefined) {
      return list.find((p) => p.slug === params.slug) ?? null;
    }
    expect(query).toContain('"slug": slug.current');
    return list;
  });

describe('getCaseStudyPage — następny projekt (prawdziwy kształt: slug jako tekst)', () => {
  beforeEach(() => {
    fetchWithCache.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it.each([
    ['alfa', 'beta'],
    ['beta', 'gamma'],
  ])('/portfolio/%s/ → następny %s', async (slug, expected) => {
    mockSanity(LIST);
    const page = await caseStudyService.getCaseStudyPage(slug);
    expect(page?.project.slug).toBe(slug);
    expect(page?.nextProject?.slug).toBe(expected);
  });

  it('ostatni projekt zawija do pierwszego (nigdy undefined)', async () => {
    mockSanity(LIST);
    const page = await caseStudyService.getCaseStudyPage('gamma');
    expect(page?.nextProject?.slug).toBe('alfa');
  });

  it('każdy projekt z listy dostaje istniejący następny slug, różny od siebie', async () => {
    mockSanity(LIST);
    const known = new Set(LIST.map((p) => p.slug));
    for (const p of LIST) {
      const page = await caseStudyService.getCaseStudyPage(p.slug);
      const next = page?.nextProject?.slug;
      expect(typeof next).toBe('string');
      expect(known.has(next as string)).toBe(true);
      expect(next).not.toBe(p.slug);
    }
  });

  it('jedyny projekt: brak następnego (null, nie link do siebie)', async () => {
    mockSanity([cs('solo')]);
    const page = await caseStudyService.getCaseStudyPage('solo');
    expect(page?.project.slug).toBe('solo');
    expect(page?.nextProject).toBeNull();
  });

  it('brak dokumentu → null (NotFound), lista nie ratuje', async () => {
    mockSanity(LIST);
    await expect(caseStudyService.getCaseStudyPage('nie-ma')).resolves.toBeNull();
  });

  it('lista niedostępna ([]) → strona bez nawigacji', async () => {
    fetchWithCache.mockImplementation(async (_q: string, params?: { slug?: string }) =>
      params?.slug !== undefined ? cs('alfa') : [],
    );
    const page = await caseStudyService.getCaseStudyPage('alfa');
    expect(page?.nextProject).toBeNull();
  });
});

describe('pickNextCaseStudy — pozycje bez użytecznego sluga są pomijane', () => {
  it('stary kształt obiektu {current} nie daje linku', () => {
    const legacy = [cs('alfa'), cs({ current: 'beta' })];
    expect(pickNextCaseStudy(legacy, 'alfa')).toBeNull();
  });

  it.each([[undefined], [null], [''], ['   '], [42]])('slug %p pominięty', (bad) => {
    const next = pickNextCaseStudy([cs('alfa'), cs(bad), cs('gamma')], 'alfa');
    expect(next?.slug).toBe('gamma');
  });

  it('bieżący spoza listy → pierwszy z listy', () => {
    expect(pickNextCaseStudy(LIST, 'spoza')?.slug).toBe('alfa');
  });

  it('pusta lista → null', () => {
    expect(pickNextCaseStudy([], 'alfa')).toBeNull();
  });

  it('ostatni użyteczny zawija przez pozycję bez sluga do pierwszego', () => {
    expect(pickNextCaseStudy([cs('alfa'), cs('beta'), cs(undefined)], 'beta')?.slug).toBe('alfa');
  });
});
