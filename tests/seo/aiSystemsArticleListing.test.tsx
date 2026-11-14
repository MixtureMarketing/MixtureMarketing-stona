// MIX-1680: lista /baza-wiedzy/ pokazuje opublikowany artykuł „aplikacje dedykowane z AI” jak inne artykuły
// (rejestr legacyArticles przy awarii CMS = ta sama lista, którą prerender zrzuca do HTML).
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

const fetchWithCache = vi.fn();
vi.mock('../../services/cms/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/cms/client')>();
  return { ...actual, fetchWithCache: (...args: unknown[]) => fetchWithCache(...args) };
});

import KnowledgeBase from '../../components/pages/KnowledgeBase';
import { articleService } from '../../services/cms/articleService';
import {
  AI_ARTICLE_CONTENT as CONTENT,
  AI_ARTICLE_SLUG,
} from '../../data/content/articles/ai-systems';

const SLUG_BARE = AI_ARTICLE_SLUG.replace(/\/$/, '');

beforeEach(() => {
  fetchWithCache.mockReset();
  fetchWithCache.mockRejectedValue(new Error('Sanity 503'));
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Baza wiedzy: artykuł o aplikacjach z AI na liście', () => {
  it('articleService (rejestr): artykuł jest raz, najnowszy, lista posortowana malejąco po dacie', async () => {
    const list = await articleService.getArticles();
    expect(list.filter((a) => a.slug === SLUG_BARE)).toHaveLength(1);
    expect(list[0].slug).toBe(SLUG_BARE);
    const dates = list.map((a) => a.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('noga ujemna: artykuł zwykłego innego adresu nie jest tym wpisem (test nie jest pusty)', async () => {
    const list = await articleService.getArticles();
    expect(list.filter((a) => a.slug === '/baza-wiedzy/nie-ma-takiego')).toHaveLength(0);
    expect(list.length).toBeGreaterThan(29);
  });

  it('strona /baza-wiedzy/ renderuje kafel z linkiem do artykułu (ze slashem) i jego tytułem', async () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/baza-wiedzy/']}>
          <KnowledgeBase />
        </MemoryRouter>
      </HelmetProvider>,
    );
    await waitFor(() => {
      expect(container.querySelector(`a[href="${AI_ARTICLE_SLUG}"]`)).not.toBeNull();
    });
    const tile = container.querySelector(`a[href="${AI_ARTICLE_SLUG}"]`)!;
    expect(tile.textContent).toContain(CONTENT.header.title);
    expect(container.querySelectorAll(`a[href="${AI_ARTICLE_SLUG}"]`).length).toBe(1);
  });
});
