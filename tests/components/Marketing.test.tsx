import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Marketing from '../../components/pages/Marketing';
import { BrowserRouter } from 'react-router-dom';
import { ModalProvider } from '../../context/ModalContext';
import { HelmetProvider } from 'react-helmet-async';

// Mock content — kształt po przebudowie 2026-07-16 (proof/models/services).
vi.mock('@/data/content', () => ({
  MARKETING_CONTENT: {
    seo: { title: 'Test Title', description: 'Test Desc', image: 'test.jpg' },
    hero: {
      title: 'Hero Title',
      titleAccent: 'Accent',
      description: 'Hero Desc',
      cta: 'Hero CTA',
    },
    proof: {
      title: 'Proof Title',
      description: 'Proof Desc',
      method: [],
      linkLabel: 'Link',
      linkTo: '/portfolio',
    },
    painPoints: { title: 'Pains Title', description: 'Pains Desc', items: [] },
    models: {
      title: 'Models Title',
      description: 'Models Desc',
      sprint: { title: 'Sprint', lines: [], note: 'Note' },
      marathon: { title: 'Maraton', lines: [], note: 'Note' },
    },
    synergy: { title: 'Synergy Title', description: 'Synergy Desc', items: [] },
    services: { title: 'Services Title', description: 'Services Desc', items: [] },
    faqs: [],
    cta: {
      title: 'CTA Title',
      description: 'CTA Desc',
      button: 'CTA Button',
    },
  },
}));

// Mock hooks
vi.mock('@/hooks/useCounter', () => ({
  useCounter: () => 1000,
}));

// Mock LazyHydrate - using factory to avoid hoisting issues with variables
vi.mock('@/components/common/LazyHydrate', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-lazy-hydrate">{children}</div>
    ),
  };
});

describe('Marketing Page', () => {
  it('renders hero section correctly', async () => {
    await React.act(async () => {
      render(
        <HelmetProvider>
          <BrowserRouter>
            <ModalProvider>
              <Marketing />
            </ModalProvider>
          </BrowserRouter>
        </HelmetProvider>,
      );
    });

    expect(screen.getByText('Hero Title')).toBeInTheDocument();
    expect(screen.getByText('Hero Desc')).toBeInTheDocument();
  });
});
