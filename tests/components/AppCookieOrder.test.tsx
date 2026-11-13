import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * MIX-1607: baner zgód w drzewie App stoi zaraz za linkiem „Przejdź do treści”, przed Navbarem
 * i <main>. W HTML prerenderu (~450 KB na /baza-wiedzy/) baner na końcu dokumentu nie był
 * jeszcze sparsowany przy pierwszym malowaniu, więc po podmianie #root stawał się nowym
 * elementem LCP (symulowany LCP 3,3–3,9 s zamiast ~1,1 s).
 */
vi.mock('react-helmet-async', () => ({ Helmet: () => null }));
vi.mock('@/context/ModalContext', () => ({
  useModal: () => ({
    isModalOpen: false,
    modalType: 'contact',
    openModal: vi.fn(),
    closeModal: vi.fn(),
  }),
}));
vi.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/context/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/context/BreadcrumbLabelContext', () => ({
  BreadcrumbLabelProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/layout/Navbar', () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock('@/components/layout/Footer', () => ({ default: () => <footer data-testid="footer" /> }));
vi.mock('@/components/common/ScrollToTop', () => ({ default: () => null }));
vi.mock('@/components/common/LazyHydrate', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/common/Breadcrumbs', () => ({ default: () => null }));
vi.mock('@/components/common/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/common/CursorGlow', () => ({ default: () => null }));
vi.mock('@/components/common/CaseStudyTransitions', () => ({
  CaseStudyTransitionsGate: () => null,
}));
vi.mock('@/components/features/CookieBanner', () => ({
  default: () => <div data-testid="cookie-banner" />,
}));
vi.mock('@/services/leadService', () => ({ leadService: { getLead: vi.fn() } }));
vi.mock('@/utils/analytics', () => ({ installContactLinkTracking: () => () => undefined }));
vi.mock('@/utils/seo/organizationSchema', () => ({ getOrganizationSchema: () => ({}) }));
vi.mock('@/config/routes', () => ({ appRoutes: [], hasOwnBreadcrumbs: () => false }));

import App from '@/App';

const FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;

describe('App: kolejność baneru zgód w DOM (MIX-1607)', () => {
  const setup = () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/baza-wiedzy/']}>
        <App />
      </MemoryRouter>,
    );
    return {
      skip: container.querySelector('a[href="#main-content"]') as HTMLElement,
      banner: container.querySelector('[data-testid="cookie-banner"]') as HTMLElement,
      navbar: container.querySelector('[data-testid="navbar"]') as HTMLElement,
      main: container.querySelector('main#main-content') as HTMLElement,
      footer: container.querySelector('[data-testid="footer"]') as HTMLElement,
    };
  };

  it('baner jest przed <main> i Navbarem, a po linku „Przejdź do treści”', () => {
    const { skip, banner, navbar, main } = setup();
    expect(banner).toBeTruthy();
    expect(skip.compareDocumentPosition(banner) & FOLLOWING).toBeTruthy();
    expect(banner.compareDocumentPosition(navbar) & FOLLOWING).toBeTruthy();
    expect(banner.compareDocumentPosition(main) & FOLLOWING).toBeTruthy();
  });

  it('baner siedzi w sekcji z etykietą „Zarządzanie plikami cookies” poza <main> i stopką', () => {
    const { banner, main, footer } = setup();
    const section = banner.closest('section');
    expect(section?.getAttribute('aria-label')).toBe('Zarządzanie plikami cookies');
    expect(main.contains(banner)).toBe(false);
    expect(footer.contains(banner)).toBe(false);
  });

  it('w DOM jest dokładnie jeden baner zgód (bez duplikatu)', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/baza-wiedzy/']}>
        <App />
      </MemoryRouter>,
    );
    expect(container.querySelectorAll('[data-testid="cookie-banner"]')).toHaveLength(1);
    expect(
      container.querySelectorAll('section[aria-label="Zarządzanie plikami cookies"]'),
    ).toHaveLength(1);
  });
});
