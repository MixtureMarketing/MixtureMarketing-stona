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
});
