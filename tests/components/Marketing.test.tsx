import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Marketing from '../../components/pages/Marketing';
import { BrowserRouter } from 'react-router-dom';
import { ModalProvider } from '../../context/ModalContext';
import { HelmetProvider } from 'react-helmet-async';

// Mock content
vi.mock('@/data/content', () => ({
  MARKETING_CONTENT: {
    seo: { title: 'Test Title', description: 'Test Desc', image: 'test.jpg' },
    hero: {
      badge: 'Test Badge',
      title: 'Hero Title',
      titleAccent: 'Accent',
      description: 'Hero Desc',
      cta: 'Hero CTA',
      revenueLabel: 'Revenue',
    },
    arsenal: {
      title: 'Arsenal Title',
      subtitle: 'Arsenal Sub',
      description: 'Arsenal Desc',
      items: [],
    },
    strategy: {
      title: 'Strategy Title',
      description: 'Strategy Desc',
      quick: {
        title: 'Quick',
        subtitle: 'Sub',
        paramsTitle: 'Params',
        timeLabel: 'Time',
        timeVal: '1m',
        durabilityLabel: 'Dur',
        durabilityVal: 'Low',
      },
      stable: {
        title: 'Stable',
        subtitle: 'Sub',
        paramsTitle: 'Params',
        timeLabel: 'Time',
        timeVal: '1y',
        durabilityLabel: 'Dur',
        durabilityVal: 'High',
      },
      quickTools: [],
      stableTools: [],
    },
    synergy: {
      title: 'Synergy Title',
      description: 'Synergy Desc',
      items: [],
    },
    industries: {
      title: 'Industries Title',
      description: 'Industries Desc',
      items: [],
    },
    faqs: [],
    cta: {
      title: 'CTA Title',
      description: 'CTA Desc',
      button: 'CTA Button',
    },
    painPoints: { items: [] },
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
  it('renders hero section correctly', () => {
    render(
      <HelmetProvider>
        <BrowserRouter>
          <ModalProvider>
            <Marketing />
          </ModalProvider>
        </BrowserRouter>
      </HelmetProvider>,
    );

    expect(screen.getByText('Hero Title')).toBeInTheDocument();
    expect(screen.getByText('Hero Desc')).toBeInTheDocument();
  });
});
