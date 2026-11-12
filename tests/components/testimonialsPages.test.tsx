// MIX-1326 kryterium 1: sekcja opinii jest na stronie głównej i w portfolio (za przełącznikiem).
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider } from '../../context/ModalContext';
import { cmsItems } from '../fixtures/testimonials';
import Home from '../../components/pages/Home';
import PortfolioPage from '../../components/pages/PortfolioPage';

const h = vi.hoisted(() => ({ getTestimonials: vi.fn() }));

vi.mock('../../services/cmsService', () => ({
  cmsService: {
    getTestimonials: (...a: unknown[]) => h.getTestimonials(...a),
    getCaseStudies: () => Promise.resolve([]),
    getCaseStudyList: () => Promise.resolve([]),
    getArticles: () => Promise.resolve([]),
  },
}));
vi.mock('../../services/cms/client', () => ({
  urlFor: () => ({ width: () => ({ height: () => ({ url: () => 'https://example.com/l.png' }) }) }),
}));
vi.mock('../../components/sections/Hero', () => ({ default: () => <div data-testid="hero" /> }));
vi.mock('../../components/common/StickyMobileBar', () => ({ default: () => null }));
vi.mock('../../components/sections/WhyUs', () => ({ default: () => <div data-testid="whyus" /> }));
vi.mock('../../components/sections/Services', () => ({
  default: () => <div data-testid="services" />,
}));
vi.mock('../../components/sections/LeadMagnet', () => ({ default: () => <div /> }));
vi.mock('../../components/sections/KnowledgeBaseTeaser', () => ({
  default: () => <div data-testid="kb" />,
}));
vi.mock('../../components/sections/FinalBand', () => ({
  default: () => <div data-testid="final" />,
}));
vi.mock('../../components/features/portfolio/PortfolioGrid', () => ({ default: () => null }));

const renderPage = (el: React.ReactElement, path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <ModalProvider>{el}</ModalProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

afterEach(() => {
  vi.unstubAllEnvs();
  h.getTestimonials.mockReset();
  cleanup();
});

const pages: Array<[string, React.ComponentType, string]> = [
  ['strona główna', Home, '/'],
  ['portfolio', PortfolioPage, '/portfolio/'],
];

describe.each(pages)('%s — sekcja opinii klientów', (_name, Page, path) => {
  it('przełącznik włączony: sekcja renderuje opinie testowe', async () => {
    vi.stubEnv('VITE_MM_TESTIMONIALS', '1');
    h.getTestimonials.mockResolvedValue(cmsItems);
    renderPage(<Page />, path);
    expect(await screen.findByRole('heading', { level: 2, name: 'Opinie klientów' })).toBeVisible();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(3);
  });

  it('przełącznik wyłączony: brak sekcji w DOM i zero pobrań opinii', async () => {
    vi.stubEnv('VITE_MM_TESTIMONIALS', undefined as unknown as string);
    h.getTestimonials.mockResolvedValue(cmsItems);
    const { container } = renderPage(<Page />, path);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelector('#testimonials-heading')).toBeNull();
    expect(container.textContent).not.toContain('Opinie klientów');
    expect(h.getTestimonials).not.toHaveBeenCalled();
  });

  it('włączony, ale 0 opinii: sekcji nie ma', async () => {
    vi.stubEnv('VITE_MM_TESTIMONIALS', '1');
    h.getTestimonials.mockResolvedValue([]);
    const { container } = renderPage(<Page />, path);
    await waitFor(() => expect(h.getTestimonials).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 30));
    expect(container.querySelector('#testimonials-heading')).toBeNull();
  });
});
