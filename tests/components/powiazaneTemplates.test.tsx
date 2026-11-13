import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import PseoTemplate from '../../components/templates/pseo/PseoTemplate';
import ArticleTemplate from '../../components/templates/ArticleTemplate';
import CaseStudyTemplate from '../../components/templates/CaseStudyTemplate';
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
vi.mock('../../components/articles/RelatedArticles', () => ({
  default: () => <div data-testid="related-old" />,
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
      expect(screen.queryByTestId('related-old')).toBeNull();
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
      if (p.old) await screen.findByTestId('related-old');
      else await screen.findAllByText(p.h);
      expect(screen.queryByTestId('powiazane')).toBeNull();
      expect(screen.queryAllByTestId('related-old')).toHaveLength(p.old ? 1 : 0);
    });
  }

  it('wartość inna niż „1” nie włącza bloku', async () => {
    vi.stubEnv('VITE_MM_POWIAZANE', 'true');
    renderAt('/baza-wiedzy/art-1');
    await screen.findAllByText('Artykuł testowy');
    expect(screen.queryByTestId('powiazane')).toBeNull();
  });
});
