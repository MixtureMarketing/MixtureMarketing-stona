import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResultScreen from './ResultScreen';

// E2E f2a: read-back ze snapshotu → przyciski → dokumenty zbudowane Z TEGO SAMEGO snapshotu.
// jspdf zamockowany (render nie jest tu testowany — od tego jest documents.test.ts).

const offerSpy = vi.fn(async (_offer: unknown) => new Blob(['pdf']));
const cardSpy = vi.fn(async (_card: unknown) => new Blob(['pdf']));
const mdSpy = vi.fn((_card: unknown) => '# Karta');
vi.mock('../pdf/offerPdf', () => ({ generateOfferPdf: (o: unknown) => offerSpy(o) }));
vi.mock('../pdf/decisionCardDoc', () => ({
  generateDecisionCardPdf: (c: unknown) => cardSpy(c),
  decisionCardMarkdown: (c: unknown) => mdSpy(c),
}));

const READBACK = {
  quote: {
    id: 7,
    name: 'Sklep meblowy',
    client_name: 'Meble sp. z o.o.',
    status: 'review',
    confidence: 88,
    archetype_code: 'woocommerce',
    archetype_recommended: 'woocommerce',
    archetype_reason: null,
    created_at: '2026-07-15 10:00:00',
    engine_version: '1.7',
  },
  snapshot: {
    aspects: [
      {
        aspect_code: 'frontend',
        aspect_name: 'Frontend',
        category: 'A',
        suggested_level: 2,
        chosen_level: 2,
        hours_min: 40,
        hours_max: 100,
        override_reason: null,
        rule_reasons_json: '["Sklep wymaga layoutu"]',
        level_name: 'Standard',
        level_description: 'Własny layout i komponenty.',
      },
    ],
    items: [],
    multipliers: [],
    totals: {
      offer: { min: 13200, max: 19600 },
      price: { min: 9405, max: 22055 },
      afterBuffer: { hoursMin: 188, hoursMax: 441 },
      base: { hoursMin: 150, hoursMax: 360 },
      costs: 0,
      multiplierSum: 0,
    },
    confidenceBreakdown: [],
    warnings: ['Uwaga do platformy'],
    validityDays: 30,
    terms: ['Ceny netto.'],
  },
};

beforeEach(() => {
  offerSpy.mockClear();
  cardSpy.mockClear();
  mdSpy.mockClear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, status: 200, json: async () => READBACK })),
  );
  // jsdom nie ma createObjectURL — pobieranie pliku tylko zamarkuj
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn(() => 'blob:x'),
    revokeObjectURL: vi.fn(),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('E2E f2a — dokumenty ze snapshotu', () => {
  it('oferta PDF: budowana ze snapshotu z read-backu, BEZ pełnych widełek i godzin', async () => {
    render(<ResultScreen quoteId={7} sessionToken="tok" />);
    fireEvent.click(await screen.findByText('Pobierz ofertę PDF'));

    await waitFor(() => expect(offerSpy).toHaveBeenCalledTimes(1));
    const offer = offerSpy.mock.calls[0]![0] as Record<string, unknown>;
    // to, co realnie poszłoby do PDF-a klienta:
    expect(offer.priceRange).toEqual({ min: 13200, max: 19600 });
    expect(offer.meta).toMatchObject({ quoteNumber: 7, validUntil: '2026-08-14' });
    expect(offer.terms).toEqual(['Ceny netto.']);
    // klasa internal-only w praktyce: pełne widełki i godziny nie mają jak wyciec
    const s = JSON.stringify(offer);
    expect(s).not.toContain('9405');
    expect(s).not.toContain('22055');
    expect(s).not.toContain('441');
    expect(s).not.toContain('88'); // confidence
  });

  it('Karta decyzji (PDF + MD): dostaje alerty i uzasadnienia — inaczej niż oferta', async () => {
    render(<ResultScreen quoteId={7} sessionToken="tok" />);
    fireEvent.click(await screen.findByText('Karta decyzji (PDF)'));
    await waitFor(() => expect(cardSpy).toHaveBeenCalledTimes(1));
    const card = cardSpy.mock.calls[0]![0] as Record<string, unknown>;
    expect(card.alerts).toEqual(['Uwaga do platformy']);
    expect(card.confidence).toMatchObject({ score: 88 });

    fireEvent.click(screen.getByText('Karta decyzji (MD)'));
    await waitFor(() => expect(mdSpy).toHaveBeenCalledTimes(1));
  });

  it('draft (przed finalize) → przyciski zablokowane', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ ...READBACK, quote: { ...READBACK.quote, status: 'draft' } }),
      })),
    );
    render(<ResultScreen quoteId={7} sessionToken="tok" />);
    const b = (await screen.findByText('Pobierz ofertę PDF')).closest('button')!;
    expect(b).toBeDisabled();
    expect(screen.getByText(/dokumenty dostępne po finalize/)).toBeTruthy();
  });
});
