// MIX-783: lista /baza-wiedzy/ łączy rejestr z Sanity. Dokumenty Sanity dla 28 artykułów są kopią
// rejestru (seed.ts), więc bez deduplikacji każdy był dwa razy, a WAF z CMS miał datę z przyszłości.
import { describe, it, expect, vi, beforeEach } from 'vitest';

const fetchWithCache = vi.fn();
vi.mock('../../services/cms/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/cms/client')>();
  return { ...actual, fetchWithCache: (...args: unknown[]) => fetchWithCache(...args) };
});

import { articleService } from '../../services/cms/articleService';
import { LEGACY_ARTICLES } from '../../services/cms/legacyArticles';

const cmsDoc = (slug: string, publishedAt: string) => ({
  _id: `article-${slug}`,
  _updatedAt: '2026-02-02T16:40:00Z',
  title: `CMS ${slug}`,
  slug,
  publishedAt,
  excerpt: 'opis',
  tags: [],
});

describe('articleService.getArticles — rejestr wygrywa z kopią w Sanity', () => {
  beforeEach(() => {
    fetchWithCache.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('duplikaty po slugu usunięte, WAF raz i z datą z rejestru, artykuł tylko z CMS zostaje', async () => {
    fetchWithCache.mockResolvedValueOnce([
      cmsDoc('waf-bezpieczenstwo', '2026-12-02T12:00:00.000Z'),
      cmsDoc('redis-optymalizacja', '2025-12-22T12:00:00.000Z'),
      cmsDoc('tylko-w-cms', '2026-03-01T12:00:00.000Z'),
    ]);
    const list = await articleService.getArticles();
    expect(list).toHaveLength(LEGACY_ARTICLES.length + 1);
    const waf = list.filter((a) => a.slug === '/baza-wiedzy/waf-bezpieczenstwo');
    expect(waf).toHaveLength(1);
    expect(waf[0].date).toBe('2026-01-28');
    expect(list.filter((a) => a.slug === '/baza-wiedzy/redis-optymalizacja')).toHaveLength(1);
    expect(list.some((a) => a.slug === '/baza-wiedzy/tylko-w-cms')).toBe(true);
    const today = new Date().toISOString().slice(0, 10);
    expect(list.filter((a) => a.date.slice(0, 10) > today)).toEqual([]);
    // sortowanie od najnowszej
    const times = list.map((a) => new Date(a.date).getTime());
    expect([...times].sort((x, y) => y - x)).toEqual(times);
  });
});
