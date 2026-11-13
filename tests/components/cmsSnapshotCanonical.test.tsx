import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import PseoTemplate from '../../components/templates/pseo/PseoTemplate';
import ArticleTemplate from '../../components/templates/ArticleTemplate';
import IndustryHub from '../../components/pages/IndustryHub';
import { ModalProvider } from '../../context/ModalContext';
import { cmsService } from '../../services/cmsService';
import { CMS_SNAPSHOT_ID, serializeCmsSnapshot } from '../../hooks/useCmsDocument';
import { preloadRoute } from '../../config/routes';

// MIX-922 (audyt MIX-897 P1): canonical strony CMS po JS = jej własny URL,
// także gdy Sanity jest niedostępne (dane z zrzutu w prerenderowanym HTML).

vi.mock('../../services/cmsService', () => ({
  cmsService: {
    getIndustryBySlug: vi.fn(),
    getLocationBySlug: vi.fn(),
    getArticleBySlug: vi.fn(),
    getIndustryList: vi.fn(),
    getCaseStudyPage: vi.fn(),
  },
  client: { fetch: vi.fn() },
  urlFor: () => ({ width: () => ({ url: () => 'img' }) }),
  CmsUnavailableError: class CmsUnavailableError extends Error {},
}));
vi.mock('../../components/articles/RelatedArticles', () => ({ default: () => null }));
vi.mock('../../components/common/PortableTextRenderer', () => ({ default: () => null }));
vi.mock('../../components/common/ArticleSchemaSeo', () => ({ default: () => null }));

const BASE = 'https://mixturemarketing.pl';

const putSnapshot = (data: Record<string, unknown>) => {
  const el = document.createElement('script');
  el.setAttribute('type', 'application/json');
  el.id = CMS_SNAPSHOT_ID;
  el.textContent = serializeCmsSnapshot(data);
  document.body.appendChild(el);
};

const canonical = () =>
  document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null;

const renderAt = (url: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[url]}>
        <ModalProvider>
          <Routes>
            <Route path="/branza/" element={<IndustryHub />} />
            <Route path="/branza/:slug" element={<PseoTemplate mode="industry" />} />
            <Route path="/miasto/:slug" element={<PseoTemplate mode="location" />} />
            <Route path="/baza-wiedzy/:slug" element={<ArticleTemplate />} />
          </Routes>
        </ModalProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

const industry = {
  _id: 'ind-1',
  name: 'E-commerce',
  slug: { current: 'e-commerce' },
  forWho: 'Sklepów Internetowych',
  painPoints: ['Niska konwersja'],
  techRequirements: ['Płatności'],
  jargon: ['ROAS'],
};
const location = {
  _id: 'loc-1',
  city: 'Rzeszów',
  slug: { current: 'rzeszow' },
  genitive: 'Rzeszowa',
  businessContext: 'Stolica Podkarpacia.',
};
const article = {
  _id: 'a1',
  title: 'Artykuł ze zrzutu',
  slug: 'artykul', // kształt z GROQ: "slug": slug.current (tekst, MIX-1386)
  excerpt: 'Opis',
  publishedAt: '2026-01-01',
  body: [],
  tags: [],
};

const CASES = [
  {
    url: '/branza/e-commerce/',
    snap: { 'industry|e-commerce': industry },
    text: /Sklepów Internetowych/i,
  },
  { url: '/miasto/rzeszow/', snap: { 'location|rzeszow': location }, text: /Rzeszow/i },
  { url: '/baza-wiedzy/artykul/', snap: { 'article|artykul': article }, text: /Artykuł ze zrzutu/ },
  {
    url: '/branza/',
    snap: { 'industryList|list': [{ _id: 'i', name: 'E-commerce', slug: 'e-commerce' }] },
    text: /E-commerce/,
  },
];

describe('MIX-922: strona CMS po JS przy niedostępnym Sanity', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (const fn of Object.values(cmsService)) {
      vi.mocked(fn as () => Promise<unknown>).mockReset();
      vi.mocked(fn as () => Promise<unknown>).mockRejectedValue(new Error('Sanity 503'));
    }
  });
  afterEach(() => {
    cleanup();
    document.getElementById(CMS_SNAPSHOT_ID)?.remove();
    vi.restoreAllMocks();
  });

  for (const c of CASES) {
    it(`${c.url}: ze zrzutem — treść zostaje, canonical = własny URL, 0 żądań do Sanity`, async () => {
      putSnapshot(c.snap);
      renderAt(c.url);
      await waitFor(() => expect(canonical()).toBe(`${BASE}${c.url}`));
      expect(screen.getAllByText(c.text).length).toBeGreaterThan(0);
      expect(document.querySelector('[data-cms-error]')).toBeNull();
      for (const fn of Object.values(cmsService)) expect(fn).not.toHaveBeenCalled();
    });

    it(`${c.url}: ujemne — bez zrzutu Sanity 503 daje stan błędu i brak canonical`, async () => {
      renderAt(c.url);
      await waitFor(() => expect(document.querySelector('[data-cms-error]')).not.toBeNull());
      expect(canonical()).toBeNull();
    });
  }
});

describe('MIX-922: preloadRoute przy starcie z prerenderu', () => {
  beforeEach(() => {
    vi.mocked(cmsService.getIndustryBySlug).mockReset();
    vi.mocked(cmsService.getIndustryBySlug).mockResolvedValue(null);
    vi.mocked(cmsService.getIndustryList).mockReset();
    vi.mocked(cmsService.getIndustryList).mockResolvedValue([]);
  });
  afterEach(() => document.getElementById(CMS_SNAPSHOT_ID)?.remove());

  it('zrzut w HTML → bez żądania do Sanity przed pierwszym renderem', async () => {
    putSnapshot({ 'industry|medycyna': industry, 'industryList|list': [] });
    await preloadRoute('/branza/medycyna/');
    await preloadRoute('/branza/');
    expect(cmsService.getIndustryBySlug).not.toHaveBeenCalled();
    expect(cmsService.getIndustryList).not.toHaveBeenCalled();
  });

  it('ujemne: bez zrzutu preload pyta Sanity (jak dawniej)', async () => {
    await preloadRoute('/branza/medycyna/');
    await preloadRoute('/branza/');
    expect(cmsService.getIndustryBySlug).toHaveBeenCalledWith('medycyna');
    expect(cmsService.getIndustryList).toHaveBeenCalledTimes(1);
  });
});
