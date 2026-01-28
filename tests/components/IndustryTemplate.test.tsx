/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import IndustryTemplate from '../../components/templates/IndustryTemplate';
import { cmsService } from '../../services/cmsService';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider } from '../../context/ModalContext';

// Mock dependencies
vi.mock('../../services/cmsService', () => ({
  cmsService: {
    getIndustryBySlug: vi.fn(),
  },
  client: {}, // Mock Sanity client
}));

vi.mock('@sanity/image-url', () => ({
  default: () => ({
    image: () => ({
      url: () => 'https://via.placeholder.com/150',
    }),
  }),
}));

// Mock params
const mockSlug = 'test-industry';
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ slug: mockSlug }),
  };
});

describe('IndustryTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Return a promise that never resolves to simulate loading
    vi.mocked(cmsService.getIndustryBySlug).mockReturnValue(new Promise(() => {}));

    render(
      <HelmetProvider>
        <ModalProvider>
          <MemoryRouter>
            <IndustryTemplate />
          </MemoryRouter>
        </ModalProvider>
      </HelmetProvider>,
    );

    // Look for the loading spinner or indicator
    const spinner = document.querySelector('.animate-pulse');
    expect(spinner).toBeInTheDocument();
  });

  it('renders industry content when data is fetched', async () => {
    const mockIndustry = {
      _id: '1',
      name: 'Prawnicy',
      slug: { current: 'prawnicy' },
      forWho: 'dla Prawników',
      painPoints: ['Zakaz reklamy'],
      techRequirements: ['Szyfrowana poczta'],
      jargon: ['Radca'],
      compliance: 'Kodeks Etyki',
    };

    vi.mocked(cmsService.getIndustryBySlug).mockResolvedValue(mockIndustry);

    render(
      <HelmetProvider>
        <ModalProvider>
          <MemoryRouter>
            <IndustryTemplate />
          </MemoryRouter>
        </ModalProvider>
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Branża: Prawnicy/i)).toBeInTheDocument();
      expect(screen.getByText(/dla Prawników/i)).toBeInTheDocument();
      expect(screen.getByText(/Zakaz reklamy/i)).toBeInTheDocument();
      expect(screen.getByText(/Szyfrowana poczta/i)).toBeInTheDocument();
      expect(screen.getByText(/Radca/i)).toBeInTheDocument();
    });
  });

  it('renders NotFound when industry is not found', async () => {
    vi.mocked(cmsService.getIndustryBySlug).mockResolvedValue(null);

    render(
      <HelmetProvider>
        <ModalProvider>
          <MemoryRouter>
            <IndustryTemplate />
          </MemoryRouter>
        </ModalProvider>
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Błąd 404/i)).toBeInTheDocument();
    });
  });
});
