import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EstimationTab from '../EstimationTab';

// E2E f2b: cykl życia wyceny w UI. Komponenty realne, fetch podmieniony i routowany po URL.
//
// Pilnujemy trzech rzeczy, których nie widać w testach API:
//  1. o ekranie decyduje STATUS wyceny, nie kliknięcie (draft → wizard, review+ → wynik),
//  2. wysyłka NAJPIERW zapisuje dokumenty, POTEM zmienia status (kolejność, nie deklaracja),
//  3. przycisków nielegalnych przejść po prostu nie ma.

const SNAPSHOT = {
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
      rule_reasons_json: '[]',
      level_name: 'Standardowy',
      level_description: 'Własny layout.',
    },
  ],
  items: [],
  multipliers: [],
  totals: {
    offer: { min: 11400, max: 16800 },
    price: { min: 11400, max: 16800 },
    afterBuffer: { hoursMin: 44, hoursMax: 110 },
    costs: 0,
  },
  confidenceBreakdown: [],
  warnings: [],
  // WEWNĄTRZ snapshotu, bo tak zwraca je quote.ts (ResultScreen robi `{ quote, ...snapshot }`).
  // Gdy ich brakuje, buildOffer liczy datę ważności z undefined i przewraca się na
  // „Invalid time value" — w środku generowania PDF, więc objaw wygląda jak martwy przycisk.
  validityDays: 30,
  terms: ['Ceny netto; nie zawierają licencji.'],
};

const wycena = (nadpisz: Record<string, unknown> = {}) => ({
  id: 4,
  name: 'Sklep meblowy',
  client_name: 'Meble sp. z o.o.',
  archetype_code: 'woocommerce',
  archetype_recommended: 'woocommerce',
  archetype_reason: null,
  status: 'review',
  confidence: 88,
  pdf_r2_key: null,
  card_r2_key: null,
  sent_at: null,
  won_at: null,
  lost_at: null,
  lost_reason: null,
  created_at: '2026-07-15 09:00:00',
  ...nadpisz,
});

/**
 * Minimalna, ale KOMPLETNA biblioteka. Pusty obiekt `{}` nie wystarczy: jest „truthy",
 * więc wizard renderuje QuoteEditor, a toLibraryData wysypuje się na brakujących tablicach —
 * i cały ekran znika bez śladu w konsoli (React odmontowuje korzeń przy błędzie w renderze).
 */
const LIBRARY = {
  aspects: [{ code: 'frontend', name: 'Frontend', category: 'A', description: null }],
  levels: [{ aspect_code: 'frontend', level: 2, hours_min: 40, hours_max: 100 }],
  archetypes: [
    { code: 'woocommerce', name: 'WooCommerce', description: null, integration_mode: 'platform' },
  ],
  archetypeDefaults: [
    { archetype_code: 'woocommerce', aspect_code: 'frontend', default_level: 2, is_locked: 0 },
  ],
  questions: [],
  rules: [],
  modules: [],
  integrations: [],
  multipliers: [],
  costItemTypes: [],
  params: [
    { key: 'hourly_rate', value: '50' },
    { key: 'buffer', value: '0.10' },
  ],
};

/** Zapis wywołań w KOLEJNOŚCI — to on dowodzi „najpierw dokumenty, potem status". */
let wywolania: string[] = [];

function mockFetch(quote: Record<string, unknown>) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const u = String(url);
    const met = init?.method ?? 'GET';
    wywolania.push(`${met} ${u.split('?')[0].replace('/api/admin/estimation/', '')}`);
    const ok = (data: unknown) => new Response(JSON.stringify(data), { status: 200 });

    if (u.includes('/quotes')) return ok({ quotes: [quote] });
    if (u.includes('/quote?id=')) return ok({ quote, answers: {}, snapshot: SNAPSHOT });
    if (u.includes('/quote-documents'))
      return ok({ pdf_r2_key: 'quotes/4/oferta.pdf', card_r2_key: 'quotes/4/karta-decyzji.pdf' });
    if (u.includes('/quote-status')) return ok({ id: 4, status: 'sent' });
    if (u.includes('/quote-duplicate')) return ok({ id: 77, status: 'draft' });
    if (u.includes('/library')) return ok(LIBRARY);
    return ok({});
  });
}

beforeEach(() => {
  wywolania = [];
  window.history.replaceState({}, '', '/portal/admin');
});
afterEach(() => vi.unstubAllGlobals());

describe('f2b — otwieranie wyceny z listy (o ekranie decyduje status)', () => {
  it('klik w wycenę po finalize otwiera EKRAN WYNIKU z dokumentami', async () => {
    vi.stubGlobal('fetch', mockFetch(wycena({ status: 'review' })));
    render(<EstimationTab sessionToken="t" />);
    fireEvent.click(await screen.findByText('Sklep meblowy'));
    expect(await screen.findByText('Wycena sfinalizowana')).toBeTruthy();
    expect(screen.getByText('Pobierz ofertę PDF')).toBeTruthy();
  });

  it('klik w SZKIC wraca do wizarda — jest co dokończyć', async () => {
    vi.stubGlobal('fetch', mockFetch(wycena({ status: 'draft', confidence: null })));
    render(<EstimationTab sessionToken="t" />);
    fireEvent.click(await screen.findByText('Sklep meblowy'));
    // Wizard wznawia istniejący draft: pokazuje jego numer, nie „Nowa wycena".
    expect(await screen.findByText(/Wycena #4/)).toBeTruthy();
  });

  it('deep link ?quote=4 otwiera wycenę bez klikania', async () => {
    window.history.replaceState({}, '', '/portal/admin?tab=wyceny&quote=4');
    vi.stubGlobal('fetch', mockFetch(wycena({ status: 'review' })));
    render(<EstimationTab sessionToken="t" />);
    expect(await screen.findByText('Wycena sfinalizowana')).toBeTruthy();
  });
});

describe('f2b — wysyłka: najpierw dokumenty, potem status (D30)', () => {
  it('„Zapisz dokumenty i oznacz jako wysłaną" woła quote-documents PRZED quote-status', async () => {
    // Odwrotna kolejność dałaby 409 z guardu — ale to test UI: pilnujemy, że klient
    // w ogóle nie próbuje ustawić `sent` przed uploadem.
    vi.stubGlobal('fetch', mockFetch(wycena({ status: 'review' })));
    render(<EstimationTab sessionToken="t" />);
    fireEvent.click(await screen.findByText('Sklep meblowy'));
    fireEvent.click(await screen.findByText(/Zapisz dokumenty i oznacz jako wysłaną/));

    // Hojny timeout: klik generuje DWA prawdziwe PDF-y (font + logo w base64), a to
    // w jsdom trwa. Domyślna sekunda potrafi minąć w trakcie renderu, nie na błędzie.
    await waitFor(() => expect(wywolania).toContain('POST quote-status'), { timeout: 15000 });
    const iDok = wywolania.indexOf('POST quote-documents');
    const iSt = wywolania.indexOf('POST quote-status');
    expect(iDok, 'brak zapisu dokumentów').toBeGreaterThan(-1);
    expect(iDok, 'status zmieniony PRZED zapisem dokumentów').toBeLessThan(iSt);
  });

  it('w statusie review nie ma przycisków rozstrzygnięcia (to nie są legalne przejścia)', async () => {
    vi.stubGlobal('fetch', mockFetch(wycena({ status: 'review' })));
    render(<EstimationTab sessionToken="t" />);
    fireEvent.click(await screen.findByText('Sklep meblowy'));
    await screen.findByText('Wycena sfinalizowana');
    expect(screen.queryByText('Wygrana')).toBeNull();
    expect(screen.queryByText('Przegrana')).toBeNull();
  });
});

describe('f2b — rozstrzygnięcie', () => {
  const wyslana = () =>
    wycena({
      status: 'sent',
      pdf_r2_key: 'quotes/4/oferta.pdf',
      card_r2_key: 'quotes/4/karta-decyzji.pdf',
      sent_at: '2026-07-15 10:00:00',
    });

  it('wysłana ma Wygraną i Przegraną, a nie ma już przycisku wysyłki', async () => {
    vi.stubGlobal('fetch', mockFetch(wyslana()));
    render(<EstimationTab sessionToken="t" />);
    fireEvent.click(await screen.findByText('Sklep meblowy'));
    await screen.findByText('Wycena sfinalizowana');
    expect(screen.getByText('Wygrana')).toBeTruthy();
    expect(screen.getByText('Przegrana')).toBeTruthy();
    expect(screen.queryByText(/oznacz jako wysłaną/)).toBeNull();
  });

  it('„Przegrana" NIE wysyła nic, dopóki nie ma powodu (docs/02)', async () => {
    vi.stubGlobal('fetch', mockFetch(wyslana()));
    render(<EstimationTab sessionToken="t" />);
    fireEvent.click(await screen.findByText('Sklep meblowy'));
    fireEvent.click(await screen.findByText('Przegrana'));

    const zapisz = await screen.findByText('Zapisz przegraną');
    expect((zapisz as HTMLButtonElement).disabled, 'wolno zapisać bez powodu').toBe(true);
    expect(wywolania).not.toContain('POST quote-status');

    fireEvent.change(screen.getByPlaceholderText(/Dlaczego przegraliśmy/), {
      target: { value: 'Klient wybrał tańszą ofertę' },
    });
    expect((screen.getByText('Zapisz przegraną') as HTMLButtonElement).disabled).toBe(false);
  });
});

describe('f2b — duplikacja', () => {
  it('duplikat otwiera się jako NOWY draft w wizardzie', async () => {
    vi.stubGlobal('fetch', mockFetch(wycena({ status: 'sent' })));
    render(<EstimationTab sessionToken="t" />);
    fireEvent.click(await screen.findByText('Sklep meblowy'));
    fireEvent.click(await screen.findByText(/Duplikuj/));
    await waitFor(() => expect(wywolania).toContain('POST quote-duplicate'));
    // Po duplikacji UI przechodzi na wizard nowej wyceny (#77 z mocka).
    await waitFor(() => expect(wywolania.some((w) => w === 'GET quote')).toBe(true));
  });
});
