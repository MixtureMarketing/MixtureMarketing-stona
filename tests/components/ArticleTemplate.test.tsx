import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ArticleTemplate from '../../components/templates/ArticleTemplate';
import { cmsService, CmsUnavailableError, SanityArticle } from '../../services/cmsService';

vi.mock('../../services/cmsService', () => ({
  cmsService: { getArticleBySlug: vi.fn() },
  urlFor: () => ({ width: () => ({ url: () => 'img' }) }),
  CmsUnavailableError: class CmsUnavailableError extends Error {},
}));
vi.mock('../../components/articles/RelatedArticles', () => ({ default: () => null }));
vi.mock('../../components/common/PortableTextRenderer', () => ({ default: () => null }));
vi.mock('../../components/common/ArticleSchemaSeo', () => ({ default: () => null }));

const article = {
  _id: '1',
  title: 'Artykuł testowy',
  slug: { current: 'ok' },
  excerpt: 'Opis',
  publishedAt: '2026-01-01',
  body: [],
  tags: [],
} as unknown as SanityArticle;

const renderAt = (url: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/baza-wiedzy/:slug" element={<ArticleTemplate />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );

const robotsNoindex = () =>
  Array.from(document.querySelectorAll('meta[name="robots"]')).some((m) =>
    /noindex/.test(m.getAttribute('content') || ''),
  );

describe('ArticleTemplate — błąd Sanity ≠ 404', () => {
  beforeEach(() => {
    vi.mocked(cmsService.getArticleBySlug).mockReset();
  });

  it('błąd pobrania → stan błędu z „Spróbuj ponownie”, bez NotFound i bez noindex', async () => {
    vi.mocked(cmsService.getArticleBySlug).mockRejectedValueOnce(
      new CmsUnavailableError('getArticleBySlug: ok'),
    );
    renderAt('/baza-wiedzy/ok');
    expect(await screen.findByText('Nie udało się wczytać treści')).toBeInTheDocument();
    expect(document.querySelector('[data-not-found]')).toBeNull();
    expect(document.querySelector('[data-cms-error]')).not.toBeNull();
    await new Promise((r) => setTimeout(r, 20)); // flush Helmeta
    expect(robotsNoindex()).toBe(false);

    vi.mocked(cmsService.getArticleBySlug).mockResolvedValueOnce(article);
    fireEvent.click(screen.getByRole('button', { name: /Spróbuj ponownie/i }));
    expect(await screen.findByRole('heading', { name: 'Artykuł testowy' })).toBeInTheDocument();
  });

  it('brak dokumentu (null) → NotFound z noindex', async () => {
    vi.mocked(cmsService.getArticleBySlug).mockResolvedValueOnce(null);
    renderAt('/baza-wiedzy/nie-ma');
    await waitFor(() => expect(document.querySelector('[data-not-found]')).not.toBeNull());
    expect(document.querySelector('[data-cms-error]')).toBeNull();
    await waitFor(() => expect(robotsNoindex()).toBe(true));
  });
});
