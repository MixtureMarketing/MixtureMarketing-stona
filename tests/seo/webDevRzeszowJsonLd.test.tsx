// W8 z werdyktu MIX-1020 (MIX-1266): JSON-LD strony /web-development/rzeszow/ nie ma adresu
// ulicznego biura wirtualnego. Zasięg opisuje areaServed, firma to odwołanie do jednej encji
// (ORG_REF). Adres w widocznym HTML (<address>) to osobna sprawa i nie wchodzi do danych strukturalnych.
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModalProvider } from '../../context/ModalContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { SITE_CONFIG } from '../../config/site';
import { ORG_ID } from '../../utils/seo/organizationSchema';
import WebDevRzeszow from '../../components/pages/WebDevRzeszow';

vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('../../components/common/LazyMap', () => ({ default: () => null }));

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

/** Klucze i fragmenty tekstu, które zdradzają adres uliczny w danych strukturalnych. */
export const addressLeaks = (ld: Json): string[] => {
  const leaks: string[] = [];
  const street = SITE_CONFIG.contact.address.street;
  const walk = (node: Json, trail: string) => {
    if (node === null || typeof node !== 'object') {
      if (typeof node === 'string') {
        for (const needle of [street, SITE_CONFIG.contact.address.postalCode, 'Piłsudskiego']) {
          if (node.includes(needle)) leaks.push(`${trail} zawiera „${needle}”`);
        }
        if (node === 'PostalAddress' || node === 'GeoCoordinates') leaks.push(`${trail} = ${node}`);
      }
      return;
    }
    if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${trail}[${i}]`));
    for (const [k, v] of Object.entries(node)) {
      if (['address', 'streetAddress', 'postalCode', 'geo'].includes(k)) {
        leaks.push(`${trail}.${k}`);
      }
      walk(v, `${trail}.${k}`);
    }
  };
  walk(ld, '$');
  return leaks;
};

const headLd = (): Json[] =>
  Array.from(document.head.querySelectorAll('script[type="application/ld+json"]')).flatMap((s) => {
    const d = JSON.parse(s.textContent || 'null') as Json;
    return Array.isArray(d) ? d : [d];
  });

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/web-development/rzeszow/']}>
        <NotificationProvider>
          <ModalProvider>
            <WebDevRzeszow />
          </ModalProvider>
        </NotificationProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

beforeEach(() => {
  document.head.innerHTML = '';
});

describe('wykrywacz adresu w JSON-LD (negatywne nogi: test nie jest pusty)', () => {
  it.each([
    ['klucz address', { '@type': 'Service', address: { streetAddress: 'x' } }],
    ['PostalAddress', { '@type': 'PostalAddress' }],
    ['ulica w tekście', { description: `Biuro: ${SITE_CONFIG.contact.address.street}` }],
    ['kod pocztowy', { location: `${SITE_CONFIG.contact.address.postalCode} Rzeszów` }],
    ['współrzędne', { geo: { '@type': 'GeoCoordinates' } }],
  ])('wykrywa: %s', (_n, ld) => {
    expect(addressLeaks(ld as Json).length).toBeGreaterThan(0);
  });

  it('dozwolony bliźniak: areaServed bez adresu przechodzi', () => {
    const ok = { '@type': 'Service', areaServed: [{ '@type': 'City', name: 'Rzeszów' }] };
    expect(addressLeaks(ok as Json)).toEqual([]);
  });
});

describe('/web-development/rzeszow/ — JSON-LD bez adresu biura (W8, MIX-1020)', () => {
  it('żaden blok JSON-LD w <head> nie ma adresu ulicznego, kodu pocztowego ani współrzędnych', async () => {
    renderPage();
    await waitFor(() => expect(headLd().length).toBeGreaterThan(0));
    const blocks = headLd();
    expect(blocks.length).toBeGreaterThanOrEqual(3);
    expect(blocks.flatMap((b) => addressLeaks(b))).toEqual([]);
  });

  it('Service: zasięg przez areaServed, firma jako odwołanie do encji (bez własnego adresu)', async () => {
    renderPage();
    await waitFor(() => expect(headLd().length).toBeGreaterThan(0));
    const service = headLd().find((b) => (b as { '@type'?: string })['@type'] === 'Service') as
      { areaServed: { name: string }[]; provider: { '@id': string } } | undefined;
    expect(service).toBeDefined();
    expect(service!.areaServed.map((a) => a.name)).toEqual(
      expect.arrayContaining(['Rzeszów', 'Podkarpackie', 'Polska']),
    );
    expect(service!.provider).toEqual({ '@id': ORG_ID });
  });
});
