// MIX-1855: strona /cennik/ za przełącznikiem VITE_MM_CENNIK: trasa, render, JSON-LD FAQPage,
// CTA przez modal, link do kalkulatora tylko przy konfiguratorze. Wyłączony = brak trasy.
import React from 'react';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Cennik from '../../components/pages/Cennik';
import { cennikRoute } from '../../config/routes';
import { isCennikEnabled } from '../../config/flags';
import { cennikRoutes } from '../../routes.js';
import { CENNIK_CONTENT, CENNIK_PATH } from '../../data/content/pages/cennik';
import { fitTitle } from '../../utils/seo/title';
import { toMetaDescription } from '../../utils/seo/metaDescription';

const openModal = vi.hoisted(() => vi.fn());
vi.mock('../../context/ModalContext', () => ({ useModal: () => ({ openModal }) }));

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[CENNIK_PATH]}>
        <Cennik />
      </MemoryRouter>
    </HelmetProvider>,
  );

type Ld = { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
const headLd = (): Ld[] =>
  Array.from(document.head.querySelectorAll('script[type="application/ld+json"]')).flatMap((s) => {
    const d = JSON.parse(s.textContent || 'null') as Ld | Ld[];
    return Array.isArray(d) ? d : [d];
  });

beforeEach(() => {
  document.head.innerHTML = '';
  openModal.mockClear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('isCennikEnabled (allowlista: tylko "1")', () => {
  it.each([[undefined], [''], ['0'], ['true'], ['TRUE'], [' 1'], ['1 '], ['yes']])(
    '%p = wyłączony',
    (raw) => {
      vi.stubEnv('VITE_MM_CENNIK', raw as unknown as string);
      expect(isCennikEnabled()).toBe(false);
    },
  );
  it('"1" = włączony (bliźniak)', () => {
    vi.stubEnv('VITE_MM_CENNIK', '1');
    expect(isCennikEnabled()).toBe(true);
  });
});

describe('trasa /cennik/ w config/routes.tsx i routes.js', () => {
  it('cennikRoute: włączony = jedna trasa /cennik z elementem, wyłączony = pusta lista', () => {
    const on = cennikRoute(true);
    expect(on).toHaveLength(1);
    expect(on[0].path).toBe('/cennik');
    expect(on[0].element).toBeTruthy();
    expect(cennikRoute(false)).toEqual([]);
  });

  it('cennikRoutes (routes.js): tylko wartość "1" daje /cennik/ (ze slashem)', () => {
    expect(cennikRoutes('1')).toEqual(['/cennik/']);
    for (const v of [undefined, '', '0', 'true', ' 1', 'yes', 1, null])
      expect(cennikRoutes(v)).toEqual([]);
  });

  it('wyłączony (domyślnie): tabela tras i lista prerenderu/sitemapy bez /cennik', async () => {
    vi.stubEnv('VITE_MM_CENNIK', '');
    vi.resetModules();
    const { appRoutes } = await import('../../config/routes');
    expect(appRoutes.map((r) => r.path)).not.toContain('/cennik');
  });

  it('włączony: tabela tras ma /cennik, a routes.js (process.env) dodaje /cennik/ do sitemapy', async () => {
    vi.stubEnv('VITE_MM_CENNIK', '1');
    vi.resetModules();
    const { appRoutes } = await import('../../config/routes');
    expect(appRoutes.map((r) => r.path)).toContain('/cennik');
    const { routes } = (await import('../../routes.js')) as { routes: string[] };
    expect(routes).toContain('/cennik/');
    expect(routes.filter((r) => r === '/cennik/')).toHaveLength(1);
  });

  it('routes.js przy wyłączonym przełączniku: ani /cennik/, ani /cennik', async () => {
    vi.stubEnv('VITE_MM_CENNIK', '');
    vi.resetModules();
    const { routes } = (await import('../../routes.js')) as { routes: string[] };
    expect(routes).not.toContain('/cennik/');
    expect(routes).not.toContain('/cennik');
  });
});

describe('strona /cennik/: render', () => {
  it('jeden h1, sekcje z cenami i widełki „od” z danych', () => {
    renderPage();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(CENNIK_CONTENT.hero.title);
    for (const g of CENNIK_CONTENT.groups) {
      expect(screen.getByRole('heading', { level: 2, name: g.title })).toBeTruthy();
      for (const it of g.items) {
        expect(screen.getByRole('heading', { level: 3, name: it.name })).toBeTruthy();
        expect(screen.getAllByText(it.price).length).toBeGreaterThan(0);
      }
    }
    expect(screen.getAllByText('od 2 500 zł netto').length).toBeGreaterThan(0);
  });

  it('kampanie: budżety klientów 2–10 tys. zł/mc w opisie sekcji', () => {
    renderPage();
    expect(screen.getByText(/2–10 tys\. zł miesięcznie/)).toBeTruthy();
  });

  it('title mieści się w limicie, opis ≤ 160 znaków, kanoniczny adres ze slashem', async () => {
    renderPage();
    await waitFor(() => expect(document.title).toMatch(/Mixture Marketing/));
    expect(document.title).toBe(fitTitle(CENNIK_CONTENT.seo.title, 'Mixture Marketing'));
    expect(document.title.length).toBeLessThanOrEqual(60);
    expect(CENNIK_CONTENT.seo.description.length).toBeLessThanOrEqual(160);
    expect(toMetaDescription(CENNIK_CONTENT.seo.description)).toBe(CENNIK_CONTENT.seo.description);
    await waitFor(() =>
      expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
        'https://mixturemarketing.pl/cennik/',
      ),
    );
  });

  it('okruszki w JSON-LD: Strona Główna → Cennik', async () => {
    renderPage();
    await waitFor(() => expect(headLd().length).toBeGreaterThan(0));
    const bc = headLd().find((d) => d['@type'] === 'BreadcrumbList') as unknown as {
      itemListElement: { name: string; item: string }[];
    };
    expect(bc.itemListElement.map((x) => x.name)).toEqual(['Strona Główna', 'Cennik']);
    expect(bc.itemListElement[1].item).toBe('https://mixturemarketing.pl/cennik/');
  });
});

describe('FAQ: widoczne pytania = JSON-LD FAQPage', () => {
  it('6–10 pytań w danych', () => {
    expect(CENNIK_CONTENT.faqs.length).toBeGreaterThanOrEqual(6);
    expect(CENNIK_CONTENT.faqs.length).toBeLessThanOrEqual(10);
    expect(new Set(CENNIK_CONTENT.faqs.map((f) => f.q)).size).toBe(CENNIK_CONTENT.faqs.length);
  });

  it('dokładnie jeden FAQPage; pytania i odpowiedzi zgodne z widocznymi na stronie', async () => {
    const { container } = renderPage();
    await waitFor(() => expect(headLd().some((d) => d['@type'] === 'FAQPage')).toBe(true));
    const faq = headLd().filter((d) => d['@type'] === 'FAQPage');
    expect(faq).toHaveLength(1);
    const entities = faq[0].mainEntity!;
    expect(entities).toHaveLength(CENNIK_CONTENT.faqs.length);
    const section = container.querySelector('#cennik-faq')!.parentElement!;
    const visibleQs = Array.from(section.querySelectorAll('h3')).map((h) => h.textContent);
    expect(entities.map((e) => e.name)).toEqual(visibleQs);
    const visibleAs = Array.from(section.querySelectorAll('h3 + p')).map((p) => p.textContent);
    expect(entities.map((e) => e.acceptedAnswer.text)).toEqual(visibleAs);
    expect(visibleAs.every((a) => (a ?? '').length > 20)).toBe(true);
  });
});

describe('CTA kontaktowe przez modal', () => {
  it('oba przyciski „Poproś o wycenę” otwierają formularz kontaktu (useModal().openModal)', () => {
    renderPage();
    const buttons = screen.getAllByRole('button', { name: CENNIK_CONTENT.hero.cta });
    expect(buttons).toHaveLength(2);
    fireEvent.click(buttons[0]);
    expect(openModal).toHaveBeenCalledTimes(1);
    expect(openModal).toHaveBeenLastCalledWith('general', { specificType: 'cennik' });
    fireEvent.click(buttons[1]);
    expect(openModal).toHaveBeenCalledTimes(2);
  });

  it('przycisk nie przekazuje pakietu (temat leada nie dostaje „abonament: …”)', () => {
    renderPage();
    fireEvent.click(screen.getAllByRole('button', { name: CENNIK_CONTENT.hero.cta })[0]);
    expect(openModal.mock.calls[0][1]).not.toHaveProperty('package');
  });
});

describe('link do kalkulatora wyceny tylko przy konfiguratorze (isConfigLinkEnabled)', () => {
  it('wyłączony konfigurator: brak linku /wycena/', () => {
    vi.stubEnv('VITE_MM_CONFIG_LINK', '');
    const { container } = renderPage();
    expect(container.querySelector('a[href="/wycena/"]')).toBeNull();
    expect(screen.queryByText(CENNIK_CONTENT.hero.calculatorCta)).toBeNull();
  });
  it.each([['0'], ['yes'], [' 1']])('VITE_MM_CONFIG_LINK=%p: brak linku', (raw) => {
    vi.stubEnv('VITE_MM_CONFIG_LINK', raw);
    const { container } = renderPage();
    expect(container.querySelector('a[href="/wycena/"]')).toBeNull();
  });
  it('włączony konfigurator: link /wycena/ z tekstem', () => {
    vi.stubEnv('VITE_MM_CONFIG_LINK', '1');
    const { container } = renderPage();
    const a = container.querySelector('a[href="/wycena/"]');
    expect(a?.textContent).toBe(CENNIK_CONTENT.hero.calculatorCta);
  });
});
