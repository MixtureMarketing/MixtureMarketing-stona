import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import KnowledgeBase from '../../components/pages/KnowledgeBase';
import { CMS_SNAPSHOT_ID, serializeCmsSnapshot } from '../../hooks/useCmsDocument';
import { CMS_LIST } from '../../config/routes';
import type { Article } from '../../types/article';

// MIX-1589: /baza-wiedzy/ bierze listę ze zrzutu w prerenderowanym HTML (jak /portfolio/),
// więc pierwszy render nie zwija kart do szkieletów, a lista po pobraniu jest ta sama.

const h = vi.hoisted(() => ({ getArticles: vi.fn() }));

vi.mock('../../services/cmsService', () => ({
  cmsService: {
    getArticles: (...a: unknown[]) => h.getArticles(...a),
  },
}));

const mk = (n: number, category: Article['category']): Article => ({
  id: `a${n}`,
  title: `Artykuł numer ${n}`,
  description: `Opis ${n}`,
  category,
  categoryLabel: category,
  image: '/assets/images/sygnet.png',
  date: '2026-01-0' + n,
  readTime: '5 min',
  slug: `/baza-wiedzy/art-${n}`,
  tags: ['x'],
});
const articles: Article[] = [mk(1, 'tech'), mk(2, 'marketing'), mk(3, 'tech')];

const putSnapshot = (list: unknown) => {
  const el = document.createElement('script');
  el.setAttribute('type', 'application/json');
  el.id = CMS_SNAPSHOT_ID;
  el.textContent = serializeCmsSnapshot({ 'articleList|list': list });
  document.body.appendChild(el);
};

const renderPage = (url = '/baza-wiedzy/') =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[url]}>
        <KnowledgeBase />
      </MemoryRouter>
    </HelmetProvider>,
  );

const titles = () => screen.getAllByRole('heading', { level: 3 }).map((e) => e.textContent ?? '');

afterEach(() => {
  document.getElementById(CMS_SNAPSHOT_ID)?.remove();
  h.getArticles.mockReset();
  vi.restoreAllMocks();
  cleanup();
});

describe('KnowledgeBase — zrzut z prerenderu', () => {
  it('zrzut: karty są od pierwszego renderu (bez szkieletów), bez żądania do CMS', async () => {
    putSnapshot(articles);
    const { container } = renderPage();
    // synchronicznie, bez await: pierwszy render ma już listę
    expect(titles()).toEqual(['Artykuł numer 1', 'Artykuł numer 2', 'Artykuł numer 3']);
    expect(container.querySelector('.animate-pulse')).toBeNull();
    await waitFor(() => expect(h.getArticles).not.toHaveBeenCalled());
  });

  it('bez zrzutu: szkielety, potem ta sama lista co ze zrzutu', async () => {
    let resolve: (v: Article[]) => void = () => {};
    h.getArticles.mockReturnValue(new Promise<Article[]>((r) => (resolve = r)));
    const { container } = renderPage();
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(6);
    resolve(articles);
    await screen.findByText('Artykuł numer 3');
    expect(titles()).toEqual(['Artykuł numer 1', 'Artykuł numer 2', 'Artykuł numer 3']);
    expect(container.querySelector('.animate-pulse')).toBeNull();
  });

  it('filtr kategorii działa na liście ze zrzutu (bliźniak)', () => {
    putSnapshot(articles);
    renderPage();
    fireEvent.click(screen.getAllByRole('button', { name: /Filtruj artykuły/ })[1]);
    expect(titles().length).toBeLessThan(3);
  });

  it('uszkodzony zrzut = pobranie z CMS jak dawniej', async () => {
    const el = document.createElement('script');
    el.setAttribute('type', 'application/json');
    el.id = CMS_SNAPSHOT_ID;
    el.textContent = '{nie json';
    document.body.appendChild(el);
    h.getArticles.mockResolvedValue(articles);
    renderPage();
    expect(await screen.findByText('Artykuł numer 2')).toBeInTheDocument();
    expect(h.getArticles).toHaveBeenCalledTimes(1);
  });

  it('udana odpowiedź bez pozycji: pusty stan, a nie szkielet', async () => {
    h.getArticles.mockResolvedValue([]);
    renderPage();
    expect(await screen.findAllByRole('heading', { level: 3 })).toHaveLength(1);
  });

  it('trasa /baza-wiedzy ma zrzut listy artykułów w CMS_LIST (prerender + preload)', () => {
    expect(CMS_LIST['/baza-wiedzy']?.id).toBe('articleList');
  });
});
