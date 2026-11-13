import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import PseoTemplate from '../../components/templates/pseo/PseoTemplate';
import ArticleTemplate from '../../components/templates/ArticleTemplate';
import CaseStudyTemplate from '../../components/templates/CaseStudyTemplate';
import ArticleShell, { articlePublicSlug } from '../../components/articles/ArticleShell';
import { NotificationProvider } from '../../context/NotificationContext';
import { ModalProvider } from '../../context/ModalContext';
import { cmsService } from '../../services/cmsService';

// MIX-1268: blok „Powiązane” na 3 rodzajach stron z CMS za przełącznikiem VITE_MM_POWIAZANE.
// Wyłączony = dotychczasowe RelatedArticles (artykuł, realizacja) i brak bloku na branży.

vi.mock('../../services/cmsService', () => ({
  cmsService: {
    getIndustryBySlug: vi.fn(),
    getLocationBySlug: vi.fn(),
    getArticleBySlug: vi.fn(),
    getCaseStudyPage: vi.fn(),
  },
  client: { fetch: vi.fn() },
  urlFor: () => ({ width: () => ({ url: () => 'img' }) }),
  CmsUnavailableError: class CmsUnavailableError extends Error {},
}));
// Stary blok w LazyHydrate znika po pierwszym renderze (atrapa IntersectionObserver nie
// zgłasza widoczności), więc liczymy jego rendery zamiast szukać go w DOM.
const oldRelated = vi.hoisted(() => vi.fn());
vi.mock('../../components/articles/RelatedArticles', () => ({
  default: () => {
    oldRelated();
    return null;
  },
}));
vi.mock('../../components/common/Powiazane', () => ({
  default: ({ type, slug }: { type: string; slug?: string }) => (
    <div data-testid="powiazane" data-type={type} data-slug={slug} />
  ),
}));
vi.mock('../../components/common/PortableTextRenderer', () => ({ default: () => null }));
vi.mock('../../components/common/ArticleSchemaSeo', () => ({ default: () => null }));
vi.mock('../../components/templates/case-study/CaseStudyHero', () => ({ default: () => null }));
vi.mock('../../components/templates/case-study/CaseStudyContent', () => ({
  default: () => null,
}));
vi.mock('../../components/templates/case-study/CaseStudySidebar', () => ({
  default: () => null,
}));
vi.mock('../../components/templates/case-study/CaseStudyNavigation', () => ({
  default: () => null,
}));

const renderAt = (url: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[url]}>
        <ModalProvider>
          <Routes>
            <Route path="/branza/:slug" element={<PseoTemplate mode="industry" />} />
            <Route path="/miasto/:slug" element={<PseoTemplate mode="location" />} />
            <Route path="/baza-wiedzy/:slug" element={<ArticleTemplate />} />
            <Route path="/portfolio/:slug" element={<CaseStudyTemplate />} />
          </Routes>
        </ModalProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

const PAGES = [
  { url: '/baza-wiedzy/art-1', type: 'article', slug: 'art-1', old: true, h: 'Artykuł testowy' },
  {
    url: '/portfolio/real-1',
    type: 'caseStudy',
    slug: 'real-1',
    old: true,
    h: 'Realizacja testowa',
  },
  { url: '/branza/e-commerce', type: 'industry', slug: 'e-commerce', old: false, h: 'E-commerce' },
] as const;

beforeEach(() => {
  oldRelated.mockClear();
  vi.mocked(cmsService.getArticleBySlug).mockResolvedValue({
    _id: 'a1',
    title: 'Artykuł testowy',
    slug: 'art-1',
    publishedAt: '2026-01-01',
    body: [],
    tags: [],
  } as never);
  vi.mocked(cmsService.getCaseStudyPage).mockResolvedValue({
    project: { _id: 'c1', title: 'Realizacja testowa', slug: 'real-1', category: 'web' },
    nextProject: null,
  } as never);
  vi.mocked(cmsService.getIndustryBySlug).mockResolvedValue({
    _id: 'i1',
    name: 'E-commerce',
    forWho: 'Sklepów',
    painPoints: [],
    techRequirements: [],
    jargon: [],
  } as never);
  vi.mocked(cmsService.getLocationBySlug).mockResolvedValue({
    _id: 'l1',
    city: 'Rzeszów',
    genitive: 'Rzeszowa',
    businessContext: '',
  } as never);
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('VITE_MM_POWIAZANE=1', () => {
  beforeEach(() => vi.stubEnv('VITE_MM_POWIAZANE', '1'));

  for (const p of PAGES) {
    it(`${p.type}: blok „Powiązane” z rodzajem i slugiem strony, bez starego bloku`, async () => {
      renderAt(p.url);
      const el = await screen.findByTestId('powiazane');
      expect(el).toHaveAttribute('data-type', p.type);
      expect(el).toHaveAttribute('data-slug', p.slug);
      expect(screen.getAllByTestId('powiazane')).toHaveLength(1);
      expect(oldRelated).not.toHaveBeenCalled();
    });
  }

  it('miasto: bez bloku (poza zakresem)', async () => {
    renderAt('/miasto/rzeszow');
    await waitFor(() => expect(cmsService.getLocationBySlug).toHaveBeenCalled());
    await screen.findAllByText(/Rzeszów/);
    expect(screen.queryByTestId('powiazane')).toBeNull();
  });
});

describe('przełącznik wyłączony (produkcja do TAK)', () => {
  for (const p of PAGES) {
    it(`${p.type}: bez bloku „Powiązane”; stary blok tam, gdzie był`, async () => {
      vi.stubEnv('VITE_MM_POWIAZANE', '');
      renderAt(p.url);
      if (p.old) await waitFor(() => expect(oldRelated).toHaveBeenCalled());
      else await screen.findAllByText(/Branża:/);
      expect(screen.queryByTestId('powiazane')).toBeNull();
      if (!p.old) expect(oldRelated).not.toHaveBeenCalled();
    });
  }

  it('wartość inna niż „1” nie włącza bloku', async () => {
    vi.stubEnv('VITE_MM_POWIAZANE', 'true');
    renderAt('/baza-wiedzy/art-1');
    await screen.findAllByText('Artykuł testowy');
    expect(screen.queryByTestId('powiazane')).toBeNull();
  });
});

// MIX-1268 r3: 29 stron /baza-wiedzy/* to stałe trasy (config/routes.tsx) z ArticleShell,
// nie ArticleTemplate, więc przełącznik musi działać także tutaj.
const renderShell = (slug: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/baza-wiedzy/x/']}>
        <NotificationProvider>
          <ArticleShell
            id="cdn-globalna-wydajnosc"
            title="Artykuł statyczny"
            description="Opis"
            category="tech"
            categoryLabel="Technologia"
            image="/assets/images/CDN.png"
            accentColor="#0EA5E9"
            slug={slug}
          >
            <p>Treść artykułu</p>
          </ArticleShell>
        </NotificationProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('ArticleShell (stałe trasy /baza-wiedzy/*)', () => {
  it('VITE_MM_POWIAZANE=1: nowy blok ze slugiem z trasy, poza prozą, bez starego bloku', () => {
    vi.stubEnv('VITE_MM_POWIAZANE', '1');
    renderShell('/baza-wiedzy/cdn-globalna-wydajnosc');
    const el = screen.getByTestId('powiazane');
    expect(el).toHaveAttribute('data-type', 'article');
    expect(el).toHaveAttribute('data-slug', 'cdn-globalna-wydajnosc');
    expect(el.closest('article')).toBeNull();
    expect(screen.getAllByTestId('powiazane')).toHaveLength(1);
    expect(oldRelated).not.toHaveBeenCalled();
  });

  it('przełącznik pusty (produkcja): stary blok, bez nowego', () => {
    vi.stubEnv('VITE_MM_POWIAZANE', '');
    renderShell('/baza-wiedzy/cdn-globalna-wydajnosc');
    expect(screen.queryByTestId('powiazane')).toBeNull();
    expect(oldRelated).toHaveBeenCalled();
  });

  it('wartość „true” zamiast „1”: stary blok, bez nowego', () => {
    vi.stubEnv('VITE_MM_POWIAZANE', 'true');
    renderShell('/baza-wiedzy/cdn-globalna-wydajnosc/');
    expect(screen.queryByTestId('powiazane')).toBeNull();
    expect(oldRelated).toHaveBeenCalled();
  });
});

describe('articlePublicSlug', () => {
  it('kanoniczna ścieżka artykułu: ostatni segment', () => {
    expect(articlePublicSlug('/baza-wiedzy/redis-optymalizacja/')).toBe('redis-optymalizacja');
  });
  it.each(['/baza-wiedzy/', '/portfolio/x/', '/baza-wiedzy/a/b/', '', '/baza-wiedzy/x'])(
    'inna ścieżka %j: brak sluga',
    (p) => expect(articlePublicSlug(p)).toBeUndefined(),
  );
});
