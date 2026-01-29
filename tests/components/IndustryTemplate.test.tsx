import { render, screen, waitFor } from '@testing-library/react';
import PseoTemplate from '../../components/templates/pseo/PseoTemplate';
import { cmsService } from '../../services/cmsService';
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
    (cmsService.getIndustryBySlug as any).mockResolvedValue(mockIndustry);

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/branza/e-commerce']}>
          <ModalProvider>
            <Routes>
              <Route path="/branza/:slug" element={<PseoTemplate mode="industry" />} />
            </Routes>
          </ModalProvider>
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Branża:/i)).toBeInTheDocument();
      expect(screen.getAllByText(/E-commerce/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Sklepów Internetowych/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});