import { describe, it, expect, vi, beforeEach } from 'vitest';

const fetchWithCache = vi.fn();
vi.mock('../../services/cms/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/cms/client')>();
  return { ...actual, fetchWithCache: (...args: unknown[]) => fetchWithCache(...args) };
});

import { CmsUnavailableError } from '../../services/cms/client';
import { articleService } from '../../services/cms/articleService';
import { caseStudyService } from '../../services/cms/caseStudyService';
import { pseoService, dedupeIndustriesBySlug } from '../../services/cms/pseoService';

const bySlug: Array<[string, (s: string) => Promise<unknown>]> = [
  ['getArticleBySlug', (s) => articleService.getArticleBySlug(s)],
  ['getCaseStudyBySlug', (s) => caseStudyService.getCaseStudyBySlug(s)],
  ['getIndustryBySlug', (s) => pseoService.getIndustryBySlug(s)],
  ['getLocationBySlug', (s) => pseoService.getLocationBySlug(s)],
];

describe('serwisy CMS — „brak dokumentu” vs „błąd pobrania”', () => {
  beforeEach(() => {
    fetchWithCache.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it.each(bySlug)('%s: null z Sanity → null', async (_name, fn) => {
    fetchWithCache.mockResolvedValueOnce(null);
    await expect(fn('x')).resolves.toBeNull();
  });

  it.each(bySlug)('%s: wyjątek Sanity → CmsUnavailableError (nie null)', async (_name, fn) => {
    fetchWithCache.mockRejectedValueOnce(new Error('HTTP 429'));
    await expect(fn('x')).rejects.toBeInstanceOf(CmsUnavailableError);
  });
});

describe('getIndustryList — hub /branza/', () => {
  beforeEach(() => {
    fetchWithCache.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('deduplikuje po slugu (wygrywa pełniejszy dokument) i sortuje po nazwie', async () => {
    fetchWithCache.mockResolvedValueOnce([
      {
        _id: 'a',
        name: 'E-commerce',
        slug: 'e-commerce',
        forWho: 'Dla branży E-commerce',
        painPointCount: null,
      },
      {
        _id: 'b',
        name: 'Deweloperzy',
        slug: 'deweloperzy',
        forWho: 'Firmy deweloperskie',
        painPointCount: 3,
      },
      {
        _id: 'c',
        name: 'E-commerce',
        slug: 'e-commerce',
        forWho: 'Producenci odzieży',
        painPointCount: 3,
      },
    ]);
    const list = await pseoService.getIndustryList();
    expect(list.map((i) => i._id)).toEqual(['b', 'c']);
  });

  it('wyjątek Sanity → CmsUnavailableError (nie pusta lista)', async () => {
    fetchWithCache.mockRejectedValueOnce(new Error('HTTP 503'));
    await expect(pseoService.getIndustryList()).rejects.toBeInstanceOf(CmsUnavailableError);
  });

  it('pomija wiersze bez sluga lub nazwy; przy remisie zostaje pierwszy', () => {
    const out = dedupeIndustriesBySlug([
      { _id: '1', name: 'A', slug: 'a' },
      { _id: '2', name: 'A bis', slug: 'a' },
      { _id: '3', name: '', slug: 'b' },
      { _id: '4', name: 'C', slug: '' },
    ]);
    expect(out.map((i) => i._id)).toEqual(['1']);
  });
});
