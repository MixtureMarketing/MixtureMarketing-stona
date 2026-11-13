// MIX-1286 (plan SEO A35): sekcje lokalne „Rzeszów” na stronach Google Ads i sklepów internetowych.
// Za przełącznikiem VITE_MM_RZESZOW_SEKCJE (domyślnie wyłączony do akceptacji tekstu).
import React from 'react';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { ModalProvider } from '../../context/ModalContext';
import { NotificationProvider } from '../../context/NotificationContext';
import GoogleAds from '../../components/pages/GoogleAds';
import Ecommerce from '../../components/pages/Ecommerce';
import { appRoutes } from '../../config/routes';
import { routes } from '../../routes.js';
import { SITE_CONFIG } from '../../config/site';
import { isRzeszowSectionsEnabled } from '../../config/flags';
import {
  LOCAL_RZESZOW_ECOMMERCE,
  LOCAL_RZESZOW_GOOGLE_ADS,
  type LocalRzeszowContent,
} from '../../data/content/services/local-rzeszow';
import { GOOGLE_ADS_CONTENT } from '../../data/content/services/marketing/google-ads';
import { ECOMMERCE_CONTENT } from '../../data/content/services/web-development/ecommerce';

vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('../../services/cmsService', () => ({
  cmsService: { getPricingSection: () => Promise.resolve(null) },
}));

const renderPage = (Page: React.ComponentType, path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <NotificationProvider>
          <ModalProvider>
            <Page />
          </ModalProvider>
        </NotificationProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

const strony: Array<[string, React.ComponentType, string, LocalRzeszowContent, string]> = [
  ['Google Ads', GoogleAds, '/marketing/google-ads/', LOCAL_RZESZOW_GOOGLE_ADS, '/miasto/rzeszow/'],
  [
    'sklepy internetowe',
    Ecommerce,
    '/web-development/ecommerce/',
    LOCAL_RZESZOW_ECOMMERCE,
    '/web-development/rzeszow/',
  ],
];

const slowa = (tekst: string) => tekst.split(/\s+/).filter(Boolean).length;

beforeEach(() => {
  document.head.innerHTML = '';
});
afterEach(() => {
  vi.unstubAllEnvs();
  cleanup();
});

describe('isRzeszowSectionsEnabled (allowlista: tylko "1")', () => {
  it.each([[undefined], [''], ['0'], ['true'], ['TRUE'], [' 1'], ['yes']])(
    '%p = wyłączony',
    (raw) => {
      vi.stubEnv('VITE_MM_RZESZOW_SEKCJE', raw as unknown as string);
      expect(isRzeszowSectionsEnabled()).toBe(false);
    },
  );
  it('"1" = włączony', () => {
    vi.stubEnv('VITE_MM_RZESZOW_SEKCJE', '1');
    expect(isRzeszowSectionsEnabled()).toBe(true);
  });
});

describe.each(strony)('%s: sekcja lokalna Rzeszów', (_nazwa, Page, path, content, localPath) => {
  it('przełącznik włączony: jest H2, 120–250 słów, linki do /contact/ i strony lokalnej', async () => {
    vi.stubEnv('VITE_MM_RZESZOW_SEKCJE', '1');
    const { container } = renderPage(Page, path);
    const naglowek = await screen.findByRole('heading', { level: 2, name: content.title });
    expect(naglowek).toBeVisible();
    const sekcja = container.querySelector('[data-testid="local-rzeszow"]') as HTMLElement;
    expect(sekcja).not.toBeNull();
    expect(sekcja.id).toBe(content.id);
    expect(sekcja.getAttribute('aria-labelledby')).toBe(naglowek.id);
    const tresc = (sekcja.textContent ?? '').replace(naglowek.textContent ?? '', '');
    const n = slowa(tresc);
    expect(n).toBeGreaterThanOrEqual(120);
    expect(n).toBeLessThanOrEqual(250);
    const hrefy = Array.from(sekcja.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefy).toContain('/contact/');
    expect(hrefy).toContain(localPath);
    expect(sekcja.textContent).toContain(SITE_CONFIG.contact.address.postalCode);
    expect(sekcja.textContent).toContain('Rzeszów');
  });

  it('przełącznik włączony: dokładnie jeden H1 na stronie (sekcja go nie dodaje)', async () => {
    vi.stubEnv('VITE_MM_RZESZOW_SEKCJE', '1');
    const { container } = renderPage(Page, path);
    await screen.findByRole('heading', { level: 2, name: content.title });
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="local-rzeszow"] h1')).toHaveLength(0);
  });

  it('przełącznik wyłączony: sekcji nie ma w DOM', async () => {
    vi.stubEnv('VITE_MM_RZESZOW_SEKCJE', undefined as unknown as string);
    const { container } = renderPage(Page, path);
    await waitFor(() => expect(container.querySelectorAll('h1')).toHaveLength(1));
    expect(container.querySelector('[data-testid="local-rzeszow"]')).toBeNull();
    expect(container.textContent).not.toContain(content.title);
  });

  it('link do strony lokalnej ma slash na końcu i trasa istnieje', () => {
    expect(localPath.endsWith('/')).toBe(true);
    const trasa = (p: string) => p.replace(/\/$/, '');
    // /miasto/:slug jest trasą dynamiczną (Sanity, prerender z CMS), reszta musi być na listach tras.
    if (localPath.startsWith('/miasto/')) {
      expect(appRoutes.map((r) => r.path)).toContain('/miasto/:slug');
    } else {
      expect(routes).toContain(localPath);
      expect(appRoutes.map((r) => r.path)).toContain(trasa(localPath));
    }
    expect(routes).toContain('/contact/');
  });

  it('treść bez nazw klientów i bez liczb spoza źródeł (allowlista liczb: 2020, 24/7)', () => {
    const wszystko = [content.title, ...content.paragraphs, ...content.bullets].join(' ');
    for (const nazwa of ['Q-PLAST', 'PsychON', 'Bibmot', 'Niepodzielni', 'Gabinet', 'Driftmark']) {
      expect(wszystko).not.toContain(nazwa);
    }
    const liczby = wszystko.match(/\d[\d\s.,/]*/g) ?? [];
    for (const l of liczby) expect(['2020', '24/7']).toContain(l.trim());
    expect(wszystko).not.toMatch(/\d\s*%|zł|gwarant|1\.\s*miejsce|TOP\s*\d/i);
  });
});

describe('title i meta stron bez zmian (kryterium: SEO tags nietknięte)', () => {
  it('Google Ads', () => {
    expect(GOOGLE_ADS_CONTENT.seo.title).toBe('Kampanie Google Ads — agencja Google Partner');
    expect(GOOGLE_ADS_CONTENT.seo.description).toBe(
      'Kampanie Google Ads: Search, Shopping, Performance Max. Pilnujemy wykluczeń i jakości ruchu, konto reklamowe zostaje Twoje. Dashboard z wynikami 24/7.',
    );
  });
  it('sklepy internetowe', () => {
    expect(ECOMMERCE_CONTENT.seo.title).toBe(
      'Sklepy internetowe — WooCommerce, PrestaShop | Mixture Marketing',
    );
    expect(ECOMMERCE_CONTENT.seo.description).toBe(
      'Sklepy na WooCommerce i PrestaShop, przy nietypowej sprzedaży Medusa.js lub Sylius. BLIK, Przelewy24, InPost, Allegro przez BaseLinker. Kod i dane są Twoje.',
    );
  });
});
