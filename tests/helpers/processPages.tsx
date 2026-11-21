// MIX-1317: render podstron usług z sekcją procesu (K1 „Oś procesu” za VITE_MM_PROCESS_TIMELINE).
// Wspólne dla tests/process/processTimeline.test.tsx i jednorazowego zrzutu wzorca z bazy
// (.bieg/m1317/zrzut.sh), więc wzorzec i test widzą dokładnie ten sam wycinek strony.
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider } from '../../context/ModalContext';
import { NotificationProvider } from '../../context/NotificationContext';
import GoogleAds from '../../components/pages/GoogleAds';
import MarketingSeo from '../../components/pages/MarketingSeo';
import AiSystemsApps from '../../components/pages/AiSystemsApps';
import SeoRzeszow from '../../components/pages/SeoRzeszow';
import CustomAppStart from '../../components/features/web-development/CustomAppStart';
import BrandProcess from '../../components/features/design/BrandProcess';
import { AI_SYSTEMS_CONTENT, CUSTOM_WEB_APP_CONTENT } from '../../data/content';

export interface ProcessPage {
  /** Adres podstrony (sitemap.xml). */
  path: string;
  /** Plik z sekcją procesu. */
  file: string;
  /** Nagłówek H2 sekcji (dokładny tekst). */
  heading: string;
  /** Liczba kroków procesu. */
  steps: number;
  /** Wycinek do porównania: najbliższa <section> albo bezpośredni rodzic H2. */
  scope: 'section' | 'parent';
  el: () => React.ReactElement;
}

export const PROCESS_PAGES: ProcessPage[] = [
  {
    path: '/marketing/google-ads/',
    file: 'components/pages/GoogleAds.tsx',
    heading: 'Jak prowadzimy konto',
    steps: 4,
    scope: 'section',
    el: () => <GoogleAds />,
  },
  {
    path: '/marketing/seo/',
    file: 'components/pages/MarketingSeo.tsx',
    heading: 'Jak wygląda pierwszy rok',
    steps: 4,
    scope: 'section',
    el: () => <MarketingSeo />,
  },
  {
    path: '/web-development/systemy-ai-aplikacje/',
    file: 'components/pages/AiSystemsApps.tsx',
    heading: 'Jak zaczynamy',
    steps: AI_SYSTEMS_CONTENT.process.steps.length,
    scope: 'section',
    el: () => <AiSystemsApps />,
  },
  {
    path: '/web-development/custom-app/',
    file: 'components/features/web-development/CustomAppStart.tsx',
    heading: 'Jak zaczynamy — zanim wydasz złotówkę.',
    steps: CUSTOM_WEB_APP_CONTENT.start.steps.length,
    scope: 'section',
    el: () => <CustomAppStart />,
  },
  {
    path: '/agencja-seo-rzeszow/',
    file: 'components/pages/SeoRzeszow.tsx',
    heading: 'Proces pozycjonowania krok po kroku',
    steps: 6,
    scope: 'parent',
    el: () => <SeoRzeszow />,
  },
  {
    path: '/design/branding/',
    file: 'components/features/design/BrandProcess.tsx',
    heading: 'Jak powstaje marka?',
    steps: 4,
    scope: 'section',
    el: () => <BrandProcess />,
  },
];

export const renderProcessPage = (p: ProcessPage) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[p.path]}>
        <NotificationProvider>
          <ModalProvider>{p.el()}</ModalProvider>
        </NotificationProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

/** Sekcja procesu po nagłówku H2. */
export async function findProcessSection(p: ProcessPage): Promise<HTMLElement> {
  const h2 = await screen.findByRole('heading', { level: 2, name: p.heading });
  const el = p.scope === 'parent' ? h2.parentElement : h2.closest('section');
  if (!el) throw new Error(`brak wycinka sekcji dla ${p.path}`);
  return el as HTMLElement;
}

/**
 * Bez stanu przewijania: useSectionProgress dopisuje `--p: …;` w klatce animacji, więc jego obecność
 * zależy od chwili zrzutu, nie od treści (jak tests/seo/homeSeo.test.tsx). Reszta co do znaku.
 */
export const stableHtml = (html: string) =>
  html.replace(/ ?--(?:page-)?p: [0-9.]+;/g, '').replace(/ style=""/g, '');
