import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import KnowledgeBase from '../../components/pages/KnowledgeBase';
import { CMS_SNAPSHOT_ID, serializeCmsSnapshot } from '../../hooks/useCmsDocument';
import type { Article } from '../../types/article';

// MIX-1607: karty pod pierwszym ekranem odkładają layout (content-visibility:auto), ale
// wszystkie linki do artykułów zostają w DOM (a więc i w HTML z prerenderu), a pierwszy rząd
// nie jest odkładany (LCP bez zmian).

vi.mock('../../services/cmsService', () => ({
  cmsService: { getArticles: vi.fn().mockResolvedValue([]) },
}));

const N = 10;
const articles: Article[] = Array.from({ length: N }, (_, i) => ({
  id: `a${i}`,
  title: `Artykuł numer ${i}`,
  description: `Opis ${i}`,
  category: 'tech',
  categoryLabel: 'tech',
  image: '/assets/images/sygnet.png',
  date: '2026-01-01',
  readTime: '5 min',
  slug: `/baza-wiedzy/art-${i}`,
  tags: ['x'],
}));

const renderPage = () => {
  const el = document.createElement('script');
  el.setAttribute('type', 'application/json');
  el.id = CMS_SNAPSHOT_ID;
  el.textContent = serializeCmsSnapshot({ 'articleList|list': articles });
  document.body.appendChild(el);
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/baza-wiedzy/']}>
        <KnowledgeBase />
      </MemoryRouter>
    </HelmetProvider>,
  );
};

afterEach(() => {
  document.getElementById(CMS_SNAPSHOT_ID)?.remove();
  cleanup();
});

const cards = (c: HTMLElement) =>
  Array.from(c.querySelectorAll('h3')).map((h) => h.closest('.group') as HTMLElement);

describe('KnowledgeBase: odroczony layout kart pod pierwszym ekranem', () => {
  it('karty od 4. w dół mają content-visibility:auto i wysokość zastępczą, pierwsze trzy nie', () => {
    const { container } = renderPage();
    const list = cards(container);
    expect(list).toHaveLength(N);
    list.slice(0, 3).forEach((c) => {
      expect(c.className).not.toContain('content-visibility');
    });
    list.slice(3).forEach((c) => {
      expect(c.className).toContain('[content-visibility:auto]');
      expect(c.className).toContain('[contain-intrinsic-size:auto_1px_auto_540px]');
    });
  });

  it('kontener siatki nie ma content-visibility (nie odkłada całej listy naraz)', () => {
    const { container } = renderPage();
    const grid = cards(container)[0].parentElement as HTMLElement;
    expect(grid.className).not.toContain('content-visibility');
  });

  it('wszystkie linki do artykułów są w DOM (tytuł + strzałka na każdą kartę)', () => {
    const { container } = renderPage();
    const hrefs = Array.from(container.querySelectorAll('a'))
      .map((a) => a.getAttribute('href') ?? '')
      .filter((h) => h.startsWith('/baza-wiedzy/art-'));
    expect(hrefs).toHaveLength(N * 2);
    expect(new Set(hrefs).size).toBe(N);
  });
});
