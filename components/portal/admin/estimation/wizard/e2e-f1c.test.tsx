import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import QuoteEditor from './QuoteEditor';
import type { EstimationLibrary } from '../useEstimationLibrary';

// E2E f1c: walidacja → FINALIZE (serwer) → ekran wyniku z READ-BACK snapshotu (nie stan lokalny).
// Silnik i komponenty realne; fetch podmieniony i routowany po URL (finalize/quote GET).

const LIBRARY: EstimationLibrary = {
  aspects: [{ code: 'frontend', name: 'Frontend', category: 'A', description: null }],
  levels: [{ aspect_code: 'frontend', level: 2, hours_min: 40, hours_max: 100 }],
  archetypes: [
    { code: 'woocommerce', name: 'WooCommerce', description: null, integration_mode: 'platform' },
  ],
  archetypeDefaults: [
    { archetype_code: 'woocommerce', aspect_code: 'frontend', default_level: 2, is_locked: 0 },
  ],
  questions: [
    {
      code: 'sensitive_data',
      text: 'Dane wrażliwe?',
      help_text: null,
      answer_type: 'bool',
      options_json: null,
      allow_unknown: 1,
      visibility: 'internal',
      unknown_weight: 1,
      visible_if_json: null,
      question_group: 'projekt',
      sort_order: 30,
    },
  ],
  rules: [],
  modules: [],
  integrations: [],
  multipliers: [],
  costItemTypes: [],
  params: [
    { key: 'hourly_rate', value: '50' },
    { key: 'buffer', value: '0.10' },
    { key: 'confidence_completeness', value: '0.60' },
  ],
};

const READBACK = {
  quote: { status: 'review', confidence: 88 },
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
        rule_reasons_json: '["Sklep WooCommerce"]',
      },
    ],
    items: [],
    totals: {
      offer: { min: 3000, max: 6000 },
      price: { min: 2000, max: 8000 },
      afterBuffer: { hoursMin: 44, hoursMax: 110 },
      costs: 0,
    },
    confidenceBreakdown: [{ reason: 'Brak odpowiedzi: Dane wrażliwe?', delta: -8 }],
  },
};

let fetchMock: ReturnType<typeof vi.fn>;
function stubFetch(finalizeResponse: { ok: boolean; status: number; body: unknown }) {
  fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (typeof url === 'string' && url.includes('/quote-finalize')) {
      return {
        ok: finalizeResponse.ok,
        status: finalizeResponse.status,
        json: async () => finalizeResponse.body,
      };
    }
    if (typeof url === 'string' && url.includes('/quote?id=')) {
      return { ok: true, status: 200, json: async () => READBACK };
    }
    // autosave PUT/inne
    return { ok: true, status: 200, json: async () => ({}), _init: init };
  });
  vi.stubGlobal('fetch', fetchMock);
}
beforeEach(() => vi.useRealTimers());
afterEach(() => vi.unstubAllGlobals());

const boolBtn = (label: string, btn: 'Tak' | 'Nie') =>
  within(screen.getByText(label).closest('div')!.parentElement!).getByText(btn);

const renderEditor = () =>
  render(
    <QuoteEditor
      quoteId={7}
      archetype="woocommerce"
      initialAnswers={{}}
      library={LIBRARY}
      sessionToken="tok"
      onChangePlatform={() => {}}
    />,
  );

describe('E2E f1c — finalize → ekran wyniku z read-backu', () => {
  it('walidacja → Finalizuj → POST finalize → ResultScreen pokazuje snapshot z serwera', async () => {
    stubFetch({ ok: true, status: 200, body: { id: 7, status: 'review', engine_version: '1.7' } });
    renderEditor();

    fireEvent.click(boolBtn('Dane wrażliwe?', 'Nie'));
    fireEvent.click(screen.getByText(/Przejdź do walidacji/));
    fireEvent.click(screen.getByText(/Finalizuj wycenę/));

    // Ekran wyniku czyta read-back (async) — widełki ofertowe + decyzje ze snapshotu.
    expect(await screen.findByText('Wycena sfinalizowana')).toBeTruthy();
    expect(screen.getByText(/3\s*000 zł – 6\s*000 zł/)).toBeTruthy(); // offer ze snapshotu
    expect(screen.getByText('Frontend')).toBeTruthy();
    expect(screen.getByText('Sklep WooCommerce')).toBeTruthy(); // rule_reasons z D1
    expect(screen.getByText('88%')).toBeTruthy(); // confidence z read-backu

    // finalize wołany z overrides + id
    const call = fetchMock.mock.calls.find((c) => String(c[0]).includes('/quote-finalize'));
    expect(call).toBeTruthy();
    const body = JSON.parse(String((call![1] as RequestInit).body));
    expect(body.id).toBe(7);
    expect(body).toHaveProperty('overrides');
  });

  it('GUARD 409 z serwera → komunikat na ekranie walidacji, brak przejścia do wyniku', async () => {
    stubFetch({
      ok: false,
      status: 409,
      body: { error: 'Wycena w statusie „sent" jest nietykalna. Utwórz duplikat…' },
    });
    renderEditor();
    fireEvent.click(boolBtn('Dane wrażliwe?', 'Nie'));
    fireEvent.click(screen.getByText(/Przejdź do walidacji/));
    fireEvent.click(screen.getByText(/Finalizuj wycenę/));

    expect(await screen.findByText(/jest nietykalna/)).toBeTruthy();
    expect(screen.queryByText('Wycena sfinalizowana')).toBeNull(); // nie przeszło do wyniku
  });
});
