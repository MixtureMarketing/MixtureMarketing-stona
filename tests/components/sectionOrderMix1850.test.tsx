// MIX-1850: sekcje wyżej na stronach.
// 1) Strona główna: <AiSystemsTeaser /> zaraz po <Services /> (druga sekcja pod hero), reszta kolejności bez zmian.
// 2) Google Ads i sklepy internetowe: <LocalRzeszowSection /> w pierwszej połowie strony, zaraz po pierwszej
//    sekcji z ofertą (Google Ads: Branże; sklepy: cennik + utrzymanie), przed FAQ i stopką.
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider } from '../../context/ModalContext';
import { NotificationProvider } from '../../context/NotificationContext';
import Home from '../../components/pages/Home';
import GoogleAds from '../../components/pages/GoogleAds';
import Ecommerce from '../../components/pages/Ecommerce';
import {
  LOCAL_RZESZOW_ECOMMERCE,
  LOCAL_RZESZOW_GOOGLE_ADS,
  type LocalRzeszowContent,
} from '../../data/content/services/local-rzeszow';
import { GOOGLE_ADS_CONTENT } from '../../data/content/services/marketing/google-ads';
import { ECOMMERCE_CONTENT } from '../../data/content/services/web-development/ecommerce';

const mk = vi.hoisted(() => (name: string) => async () => {
  const R = await import('react');
  return { default: () => R.createElement('div', { 'data-mock': name, 'data-testid': name }) };
});
vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('../../services/cmsService', () => ({
  cmsService: {
    getArticles: () => Promise.resolve([]),
    getPricingSection: () => Promise.resolve(null),
  },
}));
// Strona główna: ciężkie sekcje jako znaczniki (kolejność liczymy po znacznikach).
vi.mock('../../components/sections/Hero', mk('hero'));
vi.mock('../../components/common/StickyMobileBar', () => ({ default: () => null }));
vi.mock('../../components/sections/WhyUs', mk('whyus'));
vi.mock('../../components/sections/Services', mk('services'));
vi.mock('../../components/sections/LeadMagnet', mk('leadmagnet'));
vi.mock('../../components/sections/KnowledgeBaseTeaser', mk('kb'));
vi.mock('../../components/sections/FinalBand', mk('final'));

const wrap = (el: React.ReactElement, path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <NotificationProvider>
          <ModalProvider>{el}</ModalProvider>
        </NotificationProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

/** Nazwa sekcji: znacznik atrapy, id sekcji albo znacznik atrapy w opakowaniu. */
const znacznik = (el: Element) => {
  const mock = el.getAttribute('data-mock');
  if (mock) return mock;
  if (el.id) return el.id;
  const wewnatrz = el.querySelector('[data-mock]');
  return wewnatrz ? wewnatrz.getAttribute('data-mock') : el.tagName.toLowerCase();
};

afterEach(() => {
  vi.unstubAllEnvs();
  cleanup();
});

describe('strona główna: sekcja AI zaraz po Services', () => {
  it('AI jest drugą sekcją pod hero, reszta kolejności bez zmian', async () => {
    vi.stubEnv('VITE_MM_AI_SECTION', '1');
    vi.stubEnv('VITE_MM_TESTIMONIALS', undefined as unknown as string);
    const { container } = wrap(<Home />, '/');
    await screen.findByTestId('final');
    const sheet = container.querySelector('.hero-takeover-offset')!;
    const ai = container.querySelector('#ai-systems')!;
    expect(ai).not.toBeNull();
    const kolejnosc = Array.from(sheet.children).map(znacznik);
    expect(kolejnosc).toEqual(['services', 'ai-systems', 'whyus', 'leadmagnet', 'kb', 'final']);
    expect(container.querySelector('[data-mock="services"]')!.nextElementSibling).toBe(ai);
  });
});

const strony: Array<[string, React.ComponentType, string, LocalRzeszowContent, string]> = [
  [
    'Google Ads',
    GoogleAds,
    '/marketing/google-ads/',
    LOCAL_RZESZOW_GOOGLE_ADS,
    GOOGLE_ADS_CONTENT.industries.title,
  ],
  [
    'sklepy internetowe',
    Ecommerce,
    '/web-development/ecommerce/',
    LOCAL_RZESZOW_ECOMMERCE,
    ECOMMERCE_CONTENT.maintenance.title,
  ],
];

describe.each(strony)('%s: Rzeszów w pierwszej połowie', (nazwa, Page, path, content, oferta) => {
  it('zaraz po pierwszej sekcji z ofertą i przed połową sekcji strony', async () => {
    vi.stubEnv('VITE_MM_RZESZOW_SEKCJE', '1');
    const { container } = wrap(<Page />, path);
    await screen.findByRole('heading', { level: 2, name: content.title });
    const local = container.querySelector('[data-testid="local-rzeszow"]')!;
    const strona = local.parentElement!;
    const sekcje = Array.from(strona.children);
    const idx = sekcje.indexOf(local);
    console.info(`[MIX-1850] ${nazwa}: indeks sekcji Rzeszów ${idx} z ${sekcje.length}`);
    expect(idx).toBeGreaterThan(0);
    expect(idx).toBeLessThan(sekcje.length / 2);
    // Poprzednia sekcja = pierwsza sekcja z ofertą (jej nagłówek).
    expect(local.previousElementSibling!.querySelector('h2')!.textContent).toBe(oferta);
    // Przed FAQ (sekcja nie stoi już tuż przed stopką).
    const faq = screen.getByRole('heading', {
      level: 2,
      name: /^(Pytania o Google Ads|Najczęstsze pytania)$/,
    });
    expect(local.compareDocumentPosition(faq) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
