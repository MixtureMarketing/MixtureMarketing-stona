import { describe, it, expect, vi, beforeEach } from 'vitest';

const fetchWithCache = vi.fn();
vi.mock('../../services/cms/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/cms/client')>();
  return { ...actual, fetchWithCache: (...args: unknown[]) => fetchWithCache(...args) };
});

import { CmsUnavailableError } from '../../services/cms/client';
import { articleService } from '../../services/cms/articleService';
import { caseStudyService } from '../../services/cms/caseStudyService';
import { pseoService } from '../../services/cms/pseoService';

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
