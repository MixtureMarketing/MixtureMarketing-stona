// MIX-1855: odnośnik do /cennik/ w 6 istniejących artykułach bazy wiedzy, renderowany TYLKO przy
// VITE_MM_CENNIK=1 (inaczej prowadziłby przez 301 na /offers/). Wyłączony = HTML artykułu bez linku.
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ModalProvider } from '../../context/ModalContext';
import { NotificationProvider } from '../../context/NotificationContext';
import ArticleShell from '../../components/articles/ArticleShell';
import CennikLink from '../../components/common/CennikLink';
import IleKosztujeStronaRzeszowArticle from '../../components/articles/IleKosztujeStronaRzeszowArticle';
import GoogleAdsArticle from '../../components/articles/GoogleAdsArticle';
import UxAuditArticle from '../../components/articles/UxAuditArticle';
import HeadlessArticle from '../../components/articles/HeadlessArticle';
import NextJsArticle from '../../components/articles/NextJsArticle';
import AiSystemsArticle from '../../components/articles/AiSystemsArticle';

vi.setConfig({ testTimeout: 20_000 });
vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('../../components/articles/RelatedArticles', () => ({ default: () => null }));
vi.mock('../../components/common/Powiazane', () => ({ default: () => null }));

const root = path.resolve(__dirname, '../..');

const ARTYKULY: Array<[string, string, React.ComponentType]> = [
  [
    'IleKosztujeStronaRzeszowArticle',
    '/baza-wiedzy/ile-kosztuje-strona-internetowa-rzeszow-2026/',
    IleKosztujeStronaRzeszowArticle,
  ],
  ['GoogleAdsArticle', '/baza-wiedzy/google-ads-skalowanie-budzetu/', GoogleAdsArticle],
  ['UxAuditArticle', '/baza-wiedzy/audyt-ux-sklepu-internetowego/', UxAuditArticle],
  [
    'HeadlessArticle',
    '/baza-wiedzy/headless-wordpress-wydajnosc-i-bezpieczenstwo/',
    HeadlessArticle,
  ],
  ['NextJsArticle', '/baza-wiedzy/nextjs-zloty-standard-aplikacji-webowych/', NextJsArticle],
  ['AiSystemsArticle', '/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto/', AiSystemsArticle],
];

const renderAt = (route: string, page: React.ReactElement) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[route]}>
        <NotificationProvider>
          <ModalProvider>{page}</ModalProvider>
        </NotificationProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('lista artykułów z odnośnikiem do /cennik/ (docs: artykuly.md)', () => {
  it('5–8 plików artykułów przekazuje cennikLink do ArticleShell, w tym artykuł o cenie strony', () => {
    const dir = path.join(root, 'components/articles');
    const z = fs
      .readdirSync(dir)
      .filter((f) => /Article\.tsx$/.test(f))
      .filter((f) => /^\s*cennikLink\s*$/m.test(fs.readFileSync(path.join(dir, f), 'utf8')));
    expect(z.length).toBeGreaterThanOrEqual(5);
    expect(z.length).toBeLessThanOrEqual(8);
    expect(z).toContain('IleKosztujeStronaRzeszowArticle.tsx');
    expect(z.sort()).toEqual(ARTYKULY.map(([n]) => `${n}.tsx`).sort());
  });
});

describe('CennikLink: przełącznik VITE_MM_CENNIK', () => {
  it('wyłączony: nic w DOM', () => {
    vi.stubEnv('VITE_MM_CENNIK', '');
    const { container } = renderAt('/x/', <CennikLink />);
    expect(container.innerHTML).toBe('');
  });
  it.each([['0'], ['true'], [' 1'], ['yes']])('VITE_MM_CENNIK=%p: nic w DOM', (v) => {
    vi.stubEnv('VITE_MM_CENNIK', v);
    const { container } = renderAt('/x/', <CennikLink />);
    expect(container.innerHTML).toBe('');
  });
  it('włączony: akapit z linkiem do /cennik/ (ze slashem) i niepustym tekstem', () => {
    vi.stubEnv('VITE_MM_CENNIK', '1');
    const { container } = renderAt('/x/', <CennikLink />);
    const a = container.querySelector('a[href="/cennik/"]');
    expect(a?.textContent).toBe('cenniku Mixture Marketing');
    expect(container.querySelectorAll('[data-cennik-link]')).toHaveLength(1);
  });
});

describe('ArticleShell: cennikLink opt-in', () => {
  const shell = (cennikLink?: boolean) => (
    <ArticleShell
      id="x"
      title="Artykuł"
      description="Opis"
      category="tech"
      categoryLabel="Tech"
      image="/assets/images/sygnet.png"
      accentColor="#3F3D91"
      slug="/baza-wiedzy/x/"
      cennikLink={cennikLink}
    >
      <p>Treść</p>
    </ArticleShell>
  );
  it('przełącznik włączony, ale artykuł bez cennikLink: brak linku', () => {
    vi.stubEnv('VITE_MM_CENNIK', '1');
    const { container } = renderAt('/baza-wiedzy/x/', shell());
    expect(container.querySelector('a[href="/cennik/"]')).toBeNull();
  });
  it('przełącznik włączony i cennikLink: link wewnątrz <article>, po treści', () => {
    vi.stubEnv('VITE_MM_CENNIK', '1');
    const { container } = renderAt('/baza-wiedzy/x/', shell(true));
    const art = container.querySelector('article')!;
    expect(art.querySelector('a[href="/cennik/"]')).not.toBeNull();
    expect(art.textContent!.indexOf('Treść')).toBeLessThan(art.textContent!.indexOf('cenniku'));
  });
  it('przełącznik wyłączony, cennikLink ustawiony: brak linku', () => {
    vi.stubEnv('VITE_MM_CENNIK', '');
    const { container } = renderAt('/baza-wiedzy/x/', shell(true));
    expect(container.querySelector('a[href^="/cennik"]')).toBeNull();
  });
});

describe('6 artykułów: link przy włączonym przełączniku, brak przy wyłączonym', () => {
  it.each(ARTYKULY)(
    '%s: VITE_MM_CENNIK=1 → dokładnie jeden link /cennik/',
    async (_n, route, Page) => {
      vi.stubEnv('VITE_MM_CENNIK', '1');
      const { container } = renderAt(route, <Page />);
      await waitFor(() => expect(container.querySelectorAll('a').length).toBeGreaterThan(0));
      expect(container.querySelectorAll('a[href="/cennik/"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-cennik-link]')).toHaveLength(1);
    },
  );

  it.each(ARTYKULY)(
    '%s: wyłączony → HTML bez /cennik/ i bez znacznika',
    async (_n, route, Page) => {
      vi.stubEnv('VITE_MM_CENNIK', '');
      const { container } = renderAt(route, <Page />);
      await waitFor(() => expect(container.querySelectorAll('a').length).toBeGreaterThan(0));
      expect(container.querySelector('a[href^="/cennik"]')).toBeNull();
      expect(container.innerHTML).not.toContain('data-cennik-link');
      expect(container.innerHTML).not.toContain('/cennik');
    },
  );
});
