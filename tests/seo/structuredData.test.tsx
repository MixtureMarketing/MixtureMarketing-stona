import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { productIssues, searchActionCount, issueKey } from './richResultsCheck';

// MIX-1261 (audyt MIX-897 P7): dane strukturalne bez BŁĘDÓW Google.
// 1) Product na /abonament/professional/ ma image (wcześniej BŁĄD w „Informacjach o sprzedawcy”).
// 2) Strona główna nie ogłasza SearchAction (strona nie ma wyszukiwarki; Google skanował ?q=...).

vi.setConfig({ testTimeout: 20_000 });

vi.hoisted(() => {
  vi.stubEnv('VITE_MM_PREONBOARD_KEY', 'test-key');
  vi.stubEnv('VITE_MM_HUB_URL', 'https://hub.mock.invalid');
});
vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('@/context/ModalContext', () => ({ useModal: () => ({ openModal: vi.fn() }) }));
// Strona główna: liczy się tylko <Seo>; sekcje wizualne zastępujemy pustymi.
vi.mock('@/components/sections/Hero', () => ({ default: () => null }));
vi.mock('@/components/common/StickyMobileBar', () => ({ default: () => null }));
for (const s of ['WhyUs', 'Services', 'LeadMagnet', 'KnowledgeBaseTeaser', 'FinalBand']) {
  vi.doMock(`@/components/sections/${s}`, () => ({ default: () => null }));
}

type Node = Record<string, unknown>;

const jsonLdBlocks = (): Node[] =>
  Array.from(document.head.querySelectorAll('script[type="application/ld+json"]')).flatMap((s) => {
    const parsed = JSON.parse(s.textContent || 'null');
    return Array.isArray(parsed) ? parsed : [parsed];
  });

const typesOf = (n: Node) => ([] as unknown[]).concat(n['@type'] ?? []).map(String);

async function renderAndCollect(ui: React.ReactElement, url: string, mustHaveType: string) {
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[url]}>{ui}</MemoryRouter>
    </HelmetProvider>,
  );
  let blocks: Node[] = [];
  await waitFor(() => {
    blocks = jsonLdBlocks();
    expect(blocks.some((b) => typesOf(b).includes(mustHaveType))).toBe(true);
  });
  return blocks;
}

// Kalibracja walidatora: obiekt Product z produkcji 11.11 (0438927) musi dać dokładnie
// to, co Search Console zgłosił 3.11 (1 błąd + 8 ostrzeżeń, gsc_inspekcja.csv z MIX-897).
const PRODUKCJA_PRZED: Node = {
  '@context': 'https://schema.org',
  '@type': ['Service', 'Product'],
  name: 'Strona dla gabinetu / kancelarii — abonament Professional',
  description: 'opis',
  provider: { '@id': 'https://mixturemarketing.pl/#organization' },
  areaServed: { '@type': 'Country', name: 'Polska' },
  audience: { '@type': 'BusinessAudience', audienceType: 'Adwokaci' },
  offers: { '@type': 'Offer', name: 'Professional', price: '549', priceCurrency: 'PLN' },
};

describe('walidator Product odwzorowuje raport GSC (kalibracja)', () => {
  it('stary obiekt: 1 błąd image + 8 ostrzeżeń jak w GSC', () => {
    const keys = productIssues(PRODUKCJA_PRZED).map(issueKey).sort();
    expect(keys).toEqual(
      [
        'merchant:ERROR:image',
        'merchant:WARNING:audience@type',
        'merchant:WARNING:availability',
        'merchant:WARNING:brand|gtin',
        'merchant:WARNING:hasMerchantReturnPolicy',
        'merchant:WARNING:shippingDetails',
        'snippet:WARNING:aggregateRating',
        'snippet:WARNING:availability',
        'snippet:WARNING:review',
      ].sort(),
    );
  });

  it('SearchAction wykrywany także zagnieżdżony w potentialAction', () => {
    const site = { '@type': 'WebSite', potentialAction: { '@type': 'SearchAction' } };
    expect(searchActionCount(site)).toBe(1);
    expect(searchActionCount([{ '@type': 'WebSite' }])).toBe(0);
  });
});

describe('/abonament/professional/ — Product', () => {
  it('0 błędów; zostają ostrzeżenia wymagające danych firmy (opinie, zwroty)', async () => {
    const mod = await import('../../components/pages/abonament/Professional');
    const Professional = mod.default;
    const blocks = await renderAndCollect(<Professional />, '/abonament/professional/', 'Product');
    const products = blocks.filter((b) => typesOf(b).includes('Product'));
    expect(products).toHaveLength(1);
    const p = products[0];
    const issues = productIssues(p);
    expect(issues.filter((i) => i.level === 'ERROR')).toEqual([]);
    expect(issues.map(issueKey).sort()).toEqual(
      [
        'merchant:WARNING:hasMerchantReturnPolicy',
        'snippet:WARNING:aggregateRating',
        'snippet:WARNING:review',
      ].sort(),
    );
    // image to absolutny adres istniejącego pliku w public/.
    expect(p.image).toEqual(['https://mixturemarketing.pl/assets/images/og-main.png']);
    const offer = p.offers as Node;
    expect(offer.price).toBe('549');
    expect(offer.priceCurrency).toBe('PLN');
    expect(offer.url).toBe('https://mixturemarketing.pl/abonament/professional/');
    expect(p.url).toBe('https://mixturemarketing.pl/abonament/professional/');
    expect(searchActionCount(blocks)).toBe(0);
  });
});

describe('/ — WebSite bez SearchAction', () => {
  it('WebSite zostaje, SearchAction = 0 w całym JSON-LD strony', async () => {
    const { default: Home } = await import('../../components/pages/Home');
    const blocks = await renderAndCollect(<Home />, '/', 'WebSite');
    const site = blocks.find((b) => typesOf(b).includes('WebSite')) as Node;
    expect(site['@id']).toBe('https://mixturemarketing.pl/#website');
    expect(site.potentialAction).toBeUndefined();
    expect(searchActionCount(blocks)).toBe(0);
  });
});
