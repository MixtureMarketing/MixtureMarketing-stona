import { render, screen, waitFor } from '@testing-library/react';
import PseoTemplate from '../../components/templates/pseo/PseoTemplate';
import { cmsService, SanityIndustry, SanityLocation } from '../../services/cmsService';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ModalProvider } from '../../context/ModalContext';
import { HelmetProvider } from 'react-helmet-async';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../services/cmsService', () => ({
  cmsService: {
    getIndustryBySlug: vi.fn(),
    getLocationBySlug: vi.fn(),
  },
  client: {
    fetch: vi.fn(),
  },
}));

const mockIndustry = {
  name: 'E-commerce',
  forWho: 'Sklepów Internetowych',
  painPoints: ['Niska konwersja', 'Wolne ładowanie'],
  techRequirements: ['Bezpieczne płatności'],
  jargon: ['ROI', 'ROAS'],
};

describe('PseoTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders industry data correctly', async () => {
    vi.mocked(cmsService.getIndustryBySlug).mockResolvedValue(
      mockIndustry as unknown as SanityIndustry,
    );

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/branza/e-commerce']}>
          <ModalProvider>
            <Routes>
              <Route path="/branza/:slug" element={<PseoTemplate mode="industry" />} />
            </Routes>
          </ModalProvider>
        </MemoryRouter>
      </HelmetProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText(/Branża:/i)).toBeInTheDocument();
        expect(screen.getAllByText(/E-commerce/i)[0]).toBeInTheDocument();
        expect(screen.getByText(/Sklepów Internetowych/i)).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('/miasto/rzeszow/: <title> lokalnego huba różni się od strony głównej (bez kanibalizacji)', async () => {
    vi.mocked(cmsService.getLocationBySlug).mockResolvedValue({
      _id: 'loc-rzeszow',
      city: 'Rzeszów',
      slug: { current: 'rzeszow' },
      genitive: 'Rzeszowa',
      businessContext: 'Stolica Podkarpacia.',
    } as unknown as SanityLocation);

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/miasto/rzeszow/']}>
          <ModalProvider>
            <Routes>
              <Route path="/miasto/:slug" element={<PseoTemplate mode="location" />} />
            </Routes>
          </ModalProvider>
        </MemoryRouter>
      </HelmetProvider>,
    );

    await waitFor(() => expect(document.title).toMatch(/^Rzeszów i Podkarpacie/), {
      timeout: 2000,
    });
    // Tytuł strony głównej (components/pages/Home.tsx) zaczyna się od tej frazy.
    expect(document.title).not.toMatch(/^Agencja Marketingowa Rzeszów/);
  });

  // Regresja z produkcji: FAQPage na /miasto/rzeszow/ miała 6 pytań z innym brzmieniem
  // odpowiedzi niż 8 widocznych (zdania obecne tylko w schemie). Schema = widoczny tekst.
  it('/miasto/rzeszow/: każde pytanie i odpowiedź z FAQPage są dosłownie widoczne', async () => {
    vi.mocked(cmsService.getLocationBySlug).mockResolvedValue({
      _id: 'loc-rzeszow',
      city: 'Rzeszów',
      slug: { current: 'rzeszow' },
      genitive: 'Rzeszowa',
      businessContext: 'Stolica Podkarpacia.',
    } as unknown as SanityLocation);

    const { container } = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/miasto/rzeszow/']}>
          <ModalProvider>
            <Routes>
              <Route path="/miasto/:slug" element={<PseoTemplate mode="location" />} />
            </Routes>
          </ModalProvider>
        </MemoryRouter>
      </HelmetProvider>,
    );

    type Faq = { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    let faq: Faq | undefined;
    await waitFor(() => {
      faq = Array.from(document.head.querySelectorAll('script[type="application/ld+json"]'))
        .map((s) => JSON.parse(s.textContent || 'null'))
        .find((d) => d?.['@type'] === 'FAQPage');
      expect(faq).toBeDefined();
    });
    const norm = (s: string | null) => (s || '').replace(/\s+/g, ' ').trim();
    const visible = Array.from(container.querySelectorAll('details')).map((d) => ({
      q: norm(d.querySelector('summary span')?.textContent ?? null),
      a: norm(d.querySelector('p')?.textContent ?? null),
    }));
    const schema = faq!.mainEntity.map((q) => ({ q: q.name, a: q.acceptedAnswer.text }));
    expect(schema).toEqual(visible);
  });

  // Regresja z produkcji: /branza/saas--startups/ i /branza/usugi-b2b/ (dokumenty bez
  // painPoints) miały meta „… Rozwiązujemy problemy: undefined.”
  it('branża bez painPoints: meta description bez „undefined”', async () => {
    const { painPoints: _omit, ...withoutPains } = mockIndustry;
    void _omit;
    vi.mocked(cmsService.getIndustryBySlug).mockResolvedValue(
      withoutPains as unknown as SanityIndustry,
    );

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/branza/saas--startups']}>
          <ModalProvider>
            <Routes>
              <Route path="/branza/:slug" element={<PseoTemplate mode="industry" />} />
            </Routes>
          </ModalProvider>
        </MemoryRouter>
      </HelmetProvider>,
    );

    await waitFor(() => {
      const meta = document.head.querySelector('meta[name="description"]');
      expect(meta?.getAttribute('content')).toBe(
        'Specjalistyczne usługi IT i marketingu dla branży: E-commerce.',
      );
    });
  });
});
