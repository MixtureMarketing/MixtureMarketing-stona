import { describe, it, expect } from 'vitest';
import {
  buildOffer,
  buildDecisionCard,
  INTERNAL_ONLY_FIELDS,
  type QuoteSnapshot,
} from './documents';

// Budowa dokumentów z SNAPSHOTU (f2a). Zero jspdf, zero React — czysta struktura danych.
// Najważniejszy test w tym pliku to KLASA TESTU „internal-only" (jak real-seeds w PlatformStep):
// oferta idzie do klienta, więc wyciek pełnych widełek / godzin / Confidence to nie kosmetyka,
// tylko szkoda handlowa. Lista pól jest stałą — nowe pole internal MUSI tu trafić.

const SNAP: QuoteSnapshot = {
  quote: {
    id: 42,
    name: 'Sklep meblowy',
    client_name: 'Meble Sp. z o.o.',
    status: 'review',
    archetype_code: 'woocommerce',
    archetype_recommended: 'sylius',
    archetype_reason: 'Klient ma zespół PHP i licencję',
    confidence: 72,
    created_at: '2026-07-15 10:00:00',
    engine_version: '1.7',
  },
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
      rule_reasons_json: '["Sklep wymaga własnego layoutu"]',
      level_name: 'Standard',
      level_description: 'Własny layout, komponenty, responsywność.',
    },
    {
      // chosen < suggested → „czego świadomie nie robimy"
      aspect_code: 'observability',
      aspect_name: 'Observability',
      category: 'E',
      suggested_level: 2,
      chosen_level: 0,
      hours_min: 0,
      hours_max: 0,
      override_reason: 'Klient ma własny monitoring',
      rule_reasons_json: '["Sklep wymaga monitoringu"]',
      level_name: null,
      level_description: null,
    },
    {
      // poziom 0 bez obniżenia → w ogóle nie dotyczy, nie pokazujemy nigdzie
      aspect_code: 'rls',
      aspect_name: 'RLS',
      category: 'C',
      suggested_level: 0,
      chosen_level: 0,
      hours_min: 0,
      hours_max: 0,
      override_reason: null,
      rule_reasons_json: null,
      level_name: null,
      level_description: null,
    },
  ],
  items: [
    {
      item_type: 'module',
      ref_code: 'omnibus',
      name: 'Omnibus',
      hours_min: 4,
      hours_max: 10,
      amount_pln: null,
      unit: null,
      unit_price: null,
      notes: null,
    },
    {
      item_type: 'integration',
      ref_code: 'payu',
      name: 'PayU',
      hours_min: 6,
      hours_max: 14,
      amount_pln: null,
      unit: null,
      unit_price: null,
      notes: null,
    },
    {
      item_type: 'cost',
      ref_code: 'travel',
      name: 'Dojazd',
      hours_min: null,
      hours_max: null,
      amount_pln: 276,
      unit: 'km',
      unit_price: 1.15,
      notes: '120 km w jedną stronę × 2',
    },
    {
      item_type: 'cost',
      ref_code: 'external',
      name: 'Usługa zewnętrzna',
      hours_min: null,
      hours_max: null,
      amount_pln: 0,
      unit: null,
      unit_price: null,
      notes: 'kwota do wyceny ręcznej',
    },
  ],
  multipliers: [{ code: 'new_tech', name: 'Nowa technologia', value: 0.15, source: 'rule' }],
  totals: {
    offer: { min: 13200, max: 19600 },
    price: { min: 9405, max: 22055 },
    afterBuffer: { hoursMin: 188, hoursMax: 441 },
    costs: 276,
    base: { hoursMin: 150, hoursMax: 360 },
    multiplierSum: 0.15,
  },
  confidenceBreakdown: [{ reason: 'Odpowiedź „nie wiem": Ruch miesięczny', delta: -4 }],
  warnings: ['Sklep może wyrosnąć z WooCommerce — rozważ Sylius'],
  validityDays: 30,
  terms: ['6 miesięcy wsparcia (SLA) w cenie.', 'Ceny netto.'],
};

describe('buildOffer — KLASA TESTU: dane internal-only NIE WYCIEKAJĄ do klienta', () => {
  const offer = buildOffer(SNAP);
  const serialized = JSON.stringify(offer);

  it('lista pól internal-only jest jawna i kompletna', () => {
    // Gdy dojdzie nowe pole wewnętrzne (np. MPE, marża) — dopisz je TU, nie w komentarzu.
    expect(INTERNAL_ONLY_FIELDS).toEqual([
      'price', // pełne widełki wewnętrzne
      'afterBuffer', // godziny po buforze
      'base', // godziny bazowe
      'multiplierSum', // mnożniki ryzyka
      'confidence', // wskaźnik pewności
      'confidenceBreakdown', // co obniżyło pewność
      'hours_min', // godziny per obszar/pozycja
      'hours_max',
      'suggested_level', // sugestia silnika (klient widzi tylko wybór)
      'rule_reasons_json', // uzasadnienia reguł = Karta decyzji, nie oferta
      'engine_version',
    ]);
  });

  it('żadna liczba godzin ani pełnych widełek nie trafia do oferty', () => {
    // pełne widełki
    expect(serialized).not.toContain('9405');
    expect(serialized).not.toContain('22055');
    // godziny (po buforze, bazowe, per obszar, per pozycja)
    for (const h of ['188', '441', '150', '360', '40', '100', '4', '14']) {
      expect(offer.scope.some((s) => String(s.description ?? '').includes(`${h} h`))).toBe(false);
    }
    expect(serialized).not.toMatch(/"hoursM(in|ax)"/);
    expect(serialized).not.toMatch(/hours_m(in|ax)/);
  });

  it('Confidence i jego rozbicie NIE trafiają do oferty', () => {
    expect(serialized).not.toContain('72');
    expect(serialized).not.toContain('confidence');
    expect(serialized).not.toContain('nie wiem');
  });

  it('mnożniki ryzyka i wersja silnika NIE trafiają do oferty', () => {
    expect(serialized).not.toContain('0.15');
    expect(serialized).not.toContain('new_tech');
    expect(serialized).not.toContain('Nowa technologia');
    expect(serialized).not.toContain('1.7');
  });

  it('sugerowany poziom i uzasadnienia reguł NIE trafiają do oferty', () => {
    expect(serialized).not.toContain('suggested');
    expect(serialized).not.toContain('Sklep wymaga własnego layoutu');
  });
});

describe('buildOffer — treść dla klienta', () => {
  const offer = buildOffer(SNAP);

  it('widełki OFERTOWE + metadane (numer, data, ważność)', () => {
    expect(offer.priceRange).toEqual({ min: 13200, max: 19600 });
    expect(offer.meta).toMatchObject({ quoteNumber: 42, clientName: 'Meble Sp. z o.o.' });
    expect(offer.meta.issuedAt).toBe('2026-07-15');
    expect(offer.meta.validUntil).toBe('2026-08-14'); // 15.07 + 30 dni
  });

  it('zakres opisany słowami: nazwa obszaru + nazwa/opis poziomu, zero godzin', () => {
    const fe = offer.scope.find((s) => s.title === 'Frontend')!;
    expect(fe.level).toBe('Standard');
    expect(fe.description).toBe('Własny layout, komponenty, responsywność.');
    // obszary bez godzin (chosen 0) nie są zakresem
    expect(offer.scope.some((s) => s.title === 'Observability')).toBe(false);
    expect(offer.scope.some((s) => s.title === 'RLS')).toBe(false);
  });

  it('moduły i integracje po nazwach; koszty osobno, z pozycją „do wyceny ręcznej" JAWNIE', () => {
    expect(offer.modules).toEqual(['Omnibus']);
    expect(offer.integrations).toEqual(['PayU']);
    expect(offer.costs).toEqual([
      { name: 'Dojazd', amountPln: 276, note: '120 km w jedną stronę × 2', toBeQuoted: false },
      {
        name: 'Usługa zewnętrzna',
        amountPln: 0,
        note: 'kwota do wyceny ręcznej',
        toBeQuoted: true,
      },
    ]);
    expect(offer.costsTotal).toBe(276);
  });

  it('warunki „co w cenie" przechodzą z seedów (treść = dane, nie kod)', () => {
    expect(offer.terms).toEqual(['6 miesięcy wsparcia (SLA) w cenie.', 'Ceny netto.']);
  });

  it('„poza zakresem" = obszary, gdzie wybrano MNIEJ niż sugerował system', () => {
    expect(offer.excluded).toEqual([
      { title: 'Observability', reason: 'Klient ma własny monitoring' },
    ]);
  });
});

describe('buildDecisionCard — dokument wewnętrzny', () => {
  const card = buildDecisionCard(SNAP);

  it('rekomendacja vs wybór + powód rozjazdu', () => {
    expect(card.platform).toEqual({
      recommended: 'sylius',
      chosen: 'woocommerce',
      reason: 'Klient ma zespół PHP i licencję',
      againstRecommendation: true,
    });
  });

  it('decyzje z uzasadnieniami reguł (język wymagań)', () => {
    const fe = card.decisions.find((d) => d.title === 'Frontend')!;
    expect(fe).toMatchObject({ level: 2, levelName: 'Standard' });
    expect(fe.reasons).toEqual(['Sklep wymaga własnego layoutu']);
  });

  it('overridy z powodami + alerty + „czego świadomie nie robimy"', () => {
    expect(card.overrides).toEqual([
      {
        title: 'Observability',
        suggested: 2,
        chosen: 0,
        reason: 'Klient ma własny monitoring',
      },
    ]);
    expect(card.alerts).toEqual(['Sklep może wyrosnąć z WooCommerce — rozważ Sylius']);
    expect(card.outOfScope).toEqual([
      { title: 'Observability', reason: 'Klient ma własny monitoring' },
    ]);
  });

  it('Karta (wewnętrzna) WOLNO pokazuje Confidence i ryzyka — inaczej niż oferta', () => {
    expect(card.confidence).toEqual({ score: 72, breakdown: SNAP.confidenceBreakdown });
    expect(card.risks).toEqual([{ name: 'Nowa technologia', value: 0.15 }]);
  });
});
