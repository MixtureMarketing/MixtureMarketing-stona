import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const fetchWithCache = vi.fn();
vi.mock('../../services/cms/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/cms/client')>();
  return { ...actual, fetchWithCache: (...args: unknown[]) => fetchWithCache(...args) };
});

import { CmsUnavailableError } from '../../services/cms/client';
import { caseStudyService, CASE_STUDY_LIST_TIMEOUT_MS } from '../../services/cms/caseStudyService';

// MIX-1467: błąd pobrania listy realizacji to CmsUnavailableError, NIE pusta lista.
// Pusta lista = wyłącznie udana odpowiedź CMS bez pozycji.

const item = { _id: 'a', title: 'Projekt A', slug: 'projekt-a', category: 'web' as const };

describe('getCaseStudyList: błąd pobrania ≠ pusta lista', () => {
  beforeEach(() => {
    fetchWithCache.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const failures: Array<[string, () => Promise<unknown>]> = [
    ['błąd sieci', () => Promise.reject(new TypeError('Failed to fetch'))],
    [
      'HTTP 403 (CORS/Access)',
      () => Promise.reject(Object.assign(new Error('Request error: 403'), { statusCode: 403 })),
    ],
    ['niepoprawny JSON', () => Promise.reject(new SyntaxError('Unexpected token < in JSON'))],
    ['odpowiedź niebędąca listą (null)', () => Promise.resolve(null)],
    ['odpowiedź niebędąca listą (obiekt)', () => Promise.resolve({ error: 'x' })],
  ];

  it.each(failures)('%s → CmsUnavailableError (nie [])', async (_name, impl) => {
    fetchWithCache.mockImplementationOnce(impl);
    await expect(caseStudyService.getCaseStudyList()).rejects.toBeInstanceOf(CmsUnavailableError);
  });

  it('timeout: zawieszone żądanie → CmsUnavailableError po limicie', async () => {
    vi.useFakeTimers();
    fetchWithCache.mockImplementationOnce(() => new Promise(() => {}));
    const pending = caseStudyService.getCaseStudyList();
    const assertion = expect(pending).rejects.toBeInstanceOf(CmsUnavailableError);
    await vi.advanceTimersByTimeAsync(CASE_STUDY_LIST_TIMEOUT_MS + 1);
    await assertion;
  });

  it('bliźniak: udana odpowiedź z pozycjami → lista', async () => {
    fetchWithCache.mockResolvedValueOnce([item]);
    await expect(caseStudyService.getCaseStudyList()).resolves.toEqual([item]);
  });

  it('bliźniak: udana odpowiedź bez pozycji → [] (to jedyny „brak projektów”)', async () => {
    fetchWithCache.mockResolvedValueOnce([]);
    await expect(caseStudyService.getCaseStudyList()).resolves.toEqual([]);
  });

  it('getCaseStudies (inne sekcje) dalej połyka błąd i daje [] — bez zmiany zachowania', async () => {
    fetchWithCache.mockRejectedValueOnce(new Error('boom'));
    await expect(caseStudyService.getCaseStudies()).resolves.toEqual([]);
  });
});
