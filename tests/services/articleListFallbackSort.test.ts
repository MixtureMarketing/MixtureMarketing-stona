// MIX-1613: awaria CMS podczas buildu nie może wpisać do zrzutu listy w kolejności pliku
// rejestru. Lista z awarii ma tę samą kolejność co z udanego pobrania (data malejąco).
import { describe, it, expect, vi, beforeEach } from 'vitest';

const fetchWithCache = vi.fn();
vi.mock('../../services/cms/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/cms/client')>();
  return { ...actual, fetchWithCache: (...args: unknown[]) => fetchWithCache(...args) };
});

import { articleService } from '../../services/cms/articleService';
import { LEGACY_ARTICLES } from '../../services/cms/legacyArticles';

const times = (list: { date: string }[]) => list.map((a) => new Date(a.date).getTime());
const isNewestFirst = (list: { date: string }[]) => {
  const t = times(list);
  return [...t].sort((x, y) => y - x).every((v, i) => v === t[i]);
};

describe('articleService.getArticles: kolejność przy awarii i przy sukcesie', () => {
  beforeEach(() => {
    fetchWithCache.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('wejście do testu: rejestr w pliku NIE jest posortowany (test nie jest pusty)', () => {
    expect(isNewestFirst(LEGACY_ARTICLES)).toBe(false);
  });

  it('awaria CMS: lista z rejestru, te same pozycje, data malejąco', async () => {
    fetchWithCache.mockRejectedValueOnce(new Error('Sanity 503'));
    const list = await articleService.getArticles();
    expect(list).toHaveLength(LEGACY_ARTICLES.length);
    expect(new Set(list.map((a) => a.slug))).toEqual(new Set(LEGACY_ARTICLES.map((a) => a.slug)));
    expect(isNewestFirst(list)).toBe(true);
  });

  it('awaria CMS: nie zmienia rejestru w miejscu', async () => {
    const before = LEGACY_ARTICLES.map((a) => a.slug);
    fetchWithCache.mockRejectedValueOnce(new Error('timeout'));
    await articleService.getArticles();
    expect(LEGACY_ARTICLES.map((a) => a.slug)).toEqual(before);
  });

  it('sukces: ta sama kolejność co przy awarii, plus artykuł tylko z CMS na swoim miejscu', async () => {
    fetchWithCache.mockResolvedValueOnce([
      {
        _id: 'x',
        _updatedAt: '2026-02-02T16:40:00Z',
        title: 'Tylko w CMS',
        slug: 'tylko-w-cms',
        publishedAt: '2026-03-01T12:00:00.000Z',
        excerpt: 'opis',
        tags: [],
      },
    ]);
    const ok = await articleService.getArticles();
    expect(isNewestFirst(ok)).toBe(true);
    expect(ok).toHaveLength(LEGACY_ARTICLES.length + 1);
    fetchWithCache.mockRejectedValueOnce(new Error('x'));
    const failed = await articleService.getArticles();
    expect(failed.map((a) => a.slug)).toEqual(
      ok.filter((a) => a.slug !== '/baza-wiedzy/tylko-w-cms').map((a) => a.slug),
    );
  });
});
