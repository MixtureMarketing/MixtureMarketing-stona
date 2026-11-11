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

// MIX-1266 (audyt P9): publiczne slugi branż zamiast błędnych slugów z CMS.
describe('pseoService — aliasy slugów branż', () => {
  beforeEach(() => {
    fetchWithCache.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('getIndustryBySlug(publiczny) pyta CMS o slug dokumentu', async () => {
    fetchWithCache.mockResolvedValueOnce({ _id: 'x', name: 'Usługi B2B' });
    await pseoService.getIndustryBySlug('uslugi-b2b');
    expect(fetchWithCache).toHaveBeenCalledTimes(1);
    expect(fetchWithCache.mock.calls[0][1]).toEqual({ slug: 'usugi-b2b' });
  });

  it.each(['usugi-b2b', 'saas--startups'])(
    'getIndustryBySlug(stary błędny „%s”) → null bez pytania CMS (adres idzie 301, nie jako kopia)',
    async (legacy) => {
      await expect(pseoService.getIndustryBySlug(legacy)).resolves.toBeNull();
      expect(fetchWithCache).not.toHaveBeenCalled();
    },
  );

  it('zwykły slug idzie do CMS bez zmian', async () => {
    fetchWithCache.mockResolvedValueOnce(null);
    await pseoService.getIndustryBySlug('e-commerce');
    expect(fetchWithCache.mock.calls[0][1]).toEqual({ slug: 'e-commerce' });
  });

  it('getIndustryList zwraca kafelki z publicznymi slugami', async () => {
    fetchWithCache.mockResolvedValueOnce([
      { _id: 'a', name: 'Usługi B2B', slug: 'usugi-b2b', painPointCount: 1 },
      { _id: 'b', name: 'SaaS i startupy', slug: 'saas--startups', painPointCount: 1 },
      { _id: 'c', name: 'E-commerce', slug: 'e-commerce', painPointCount: 1 },
    ]);
    const slugs = (await pseoService.getIndustryList()).map((i) => i.slug).sort();
    expect(slugs).toEqual(['e-commerce', 'saas-startups', 'uslugi-b2b']);
  });
});
