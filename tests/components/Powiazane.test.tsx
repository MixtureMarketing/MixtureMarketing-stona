import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import axe from 'axe-core';

// MIX-1268 (plan SEO A11): widok bloku „Powiązane”, zrzut z prerenderu, a11y i klawiatura.
const getRelatedFor = vi.hoisted(() => vi.fn());
vi.mock('../../services/cms/relatedService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/cms/relatedService')>();
  return { ...actual, relatedService: { getRelatedFor } };
});
vi.mock('../../utils/errorReporter', () => ({ reportError: vi.fn() }));

import Powiazane, { PowiazaneLista } from '../../components/common/Powiazane';
import { CMS_SNAPSHOT_ID } from '../../hooks/useCmsDocument';
import type { RelatedLink } from '../../utils/related';

const LINKS: RelatedLink[] = [
  { _type: 'article', slug: 'vue', title: 'Vue w firmie' },
  { _type: 'caseStudy', slug: 'trydive', title: 'Szkoła nurkowania' },
  { _type: 'industry', slug: 'e-commerce', title: 'E-commerce' },
];

const renderLista = (links: RelatedLink[] | null | undefined) =>
  render(
    <MemoryRouter>
      <PowiazaneLista links={links} />
    </MemoryRouter>,
  );

const hrefs = () => screen.queryAllByRole('link').map((a) => a.getAttribute('href'));

const putSnapshot = (map: Record<string, unknown>) => {
  const el = document.createElement('script');
  el.type = 'application/json';
  el.id = CMS_SNAPSHOT_ID;
  el.textContent = JSON.stringify(map);
  document.body.appendChild(el);
};

afterEach(() => {
  cleanup();
  document.getElementById(CMS_SNAPSHOT_ID)?.remove();
});

describe('PowiazaneLista', () => {
  it('sekcja z nagłówkiem „Powiązane”, linki z adresem rodzaju i podpisem', () => {
    renderLista(LINKS);
    const region = screen.getByRole('region', { name: 'Powiązane' });
    expect(region).toHaveAttribute('data-powiazane', '3');
    expect(hrefs()).toEqual(['/baza-wiedzy/vue/', '/portfolio/trydive/', '/branza/e-commerce/']);
    expect(screen.getByRole('link', { name: /Artykuł\s*Vue w firmie/ })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Realizacja\s*Szkoła nurkowania/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Branża\s*E-commerce/ })).toBeInTheDocument();
  });

  it('pusta lista, null i nie-tablica: nic w DOM (bez nagłówka i bez rezerwy miejsca)', () => {
    for (const v of [[], null, undefined, 'x' as unknown as RelatedLink[]]) {
      const { container, unmount } = renderLista(v);
      expect(container.innerHTML).toBe('');
      unmount();
    }
  });

  it('limit 4 także, gdy dane mają więcej pozycji', () => {
    const many = Array.from({ length: 7 }, (_, i) => ({
      _type: 'article' as const,
      slug: `s${i}`,
      title: `T${i}`,
    }));
    renderLista(many);
    expect(hrefs()).toHaveLength(4);
  });

  it('axe: 0 naruszeń w bloku (WCAG 2.2 AA w jsdom)', async () => {
    const { container } = renderLista(LINKS);
    const res = await axe.run(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
    });
    expect(res.violations.map((v) => v.id)).toEqual([]);
  });

  it('klawiatura: każdy link osiągalny (bez tabindex), kolejność = kolejność w DOM', () => {
    renderLista(LINKS);
    const links = screen.getAllByRole('link');
    for (const a of links) {
      expect(a.tagName).toBe('A');
      expect(a.hasAttribute('tabindex')).toBe(false);
      a.focus();
      expect(document.activeElement).toBe(a);
    }
    expect(links.map((a) => a.textContent)).toEqual([
      'ArtykułVue w firmie',
      'RealizacjaSzkoła nurkowania',
      'BranżaE-commerce',
    ]);
  });
});

describe('Powiazane (dane)', () => {
  beforeEach(() => getRelatedFor.mockReset());

  const renderBlock = () =>
    render(
      <MemoryRouter>
        <Powiazane type="article" slug="react" />
      </MemoryRouter>,
    );

  it('zrzut z prerenderu: linki w pierwszym renderze, bez zapytania do CMS', () => {
    putSnapshot({ 'related|article:react': LINKS });
    renderBlock();
    expect(hrefs()).toHaveLength(3);
    expect(getRelatedFor).not.toHaveBeenCalled();
  });

  it('zrzut ze złym slugiem jest odrzucony (fail-closed): blok pyta CMS', async () => {
    putSnapshot({
      'related|article:react': [{ _type: 'article', slug: '../admin', title: 'X' }],
    });
    getRelatedFor.mockResolvedValue([]);
    const { container } = renderBlock();
    await waitFor(() => expect(getRelatedFor).toHaveBeenCalledWith('article:react'));
    expect(container.innerHTML).toBe('');
  });

  it('bez zrzutu: ładowanie = nic, potem linki z CMS', async () => {
    getRelatedFor.mockResolvedValue(LINKS.slice(0, 2));
    const { container } = renderBlock();
    expect(container.innerHTML).toBe('');
    await waitFor(() => expect(hrefs()).toHaveLength(2));
  });

  it('brak dopasowań z CMS = nic', async () => {
    getRelatedFor.mockResolvedValue([]);
    const { container } = renderBlock();
    await waitFor(() => expect(getRelatedFor).toHaveBeenCalled());
    await Promise.resolve();
    expect(container.innerHTML).toBe('');
  });

  it('błąd CMS = nic (bez stanu błędu na stronie)', async () => {
    getRelatedFor.mockImplementation(async () => {
      throw new Error('Sanity 503');
    });
    const { container } = renderBlock();
    await waitFor(() => expect(getRelatedFor).toHaveBeenCalled());
    await Promise.resolve();
    expect(container.innerHTML).toBe('');
    expect(screen.queryByText(/Spróbuj ponownie/)).toBeNull();
  });
});
