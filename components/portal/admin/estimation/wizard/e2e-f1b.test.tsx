import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import QuoteEditor from './QuoteEditor';
import type { EstimationLibrary } from '../useEstimationLibrary';

// ─────────────────────────────────────────────────────────────────────────────
// E2E f1b (granica fazy: pełny przepływ DO walidacji, BEZ finalize — finalize=f1c).
// Realne komponenty (QuoteEditor → WizardSteps + LivePreviewPanel + ValidationScreen)
// na realnym silniku (computeQuote). Pokrywa naprawy 1–4 + „nie wiem" + dowód flush/resume.
// Zero mocków silnika; fetch podmieniony, by przechwycić autosave (PUT) — inne warstwy realne.
// ─────────────────────────────────────────────────────────────────────────────

const LIBRARY: EstimationLibrary = {
  aspects: [
    { code: 'frontend', name: 'Frontend', category: 'A', description: null },
    { code: 'qa', name: 'QA / testy', category: 'G', description: null },
  ],
  levels: [
    { aspect_code: 'frontend', level: 2, hours_min: 40, hours_max: 100 },
    { aspect_code: 'qa', level: 2, hours_min: 20, hours_max: 40 },
  ],
  archetypes: [
    { code: 'woocommerce', name: 'WooCommerce', description: null, integration_mode: 'platform' },
  ],
  archetypeDefaults: [
    { archetype_code: 'woocommerce', aspect_code: 'frontend', default_level: 2, is_locked: 0 },
    { archetype_code: 'woocommerce', aspect_code: 'qa', default_level: 2, is_locked: 0 },
  ],
  questions: [
    // Pytanie kroku Platforma (referowane przez regułę recommend_archetype) — NIE może wrócić w wizardzie.
    {
      code: 'project_goal',
      text: 'Co ma robić projekt?',
      help_text: null,
      answer_type: 'select',
      options_json: '[{"value":"sklep","label":"Sklep"}]',
      allow_unknown: 0,
      visibility: 'internal',
      unknown_weight: 1.5,
      visible_if_json: null,
      question_group: 'projekt',
      sort_order: 20,
    },
    // Pytania wizarda (grupa projekt) — jedno odpowiadamy „nie wiem".
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
    {
      code: 'deadline_hard',
      text: 'Sztywny deadline?',
      help_text: null,
      answer_type: 'bool',
      options_json: null,
      allow_unknown: 1,
      visibility: 'internal',
      unknown_weight: 1,
      visible_if_json: null,
      question_group: 'projekt',
      sort_order: 40,
    },
  ],
  rules: [
    // recommend_archetype → czyni project_goal „pytaniem platformy" (dedup, naprawa 1).
    {
      id: 35,
      name: 'Woo',
      condition_json: '{"q":"project_goal","op":"eq","val":"sklep"}',
      actions_json: '[{"type":"recommend_archetype","code":"woocommerce","reason":"Sklep"}]',
      reason_template: 'x',
      priority: 0,
    },
    // archetype_warning na wybranym archetypie (wstrzykiwany do answers) → render w podglądzie (naprawa 2).
    {
      id: 41,
      name: 'Woo-warn',
      condition_json: '{"q":"archetype","op":"eq","val":"woocommerce"}',
      actions_json:
        '[{"type":"archetype_warning","message":"Sklep może wyrosnąć z WooCommerce — rozważ Sylius przy szybkim wzroście."}]',
      reason_template: 'x',
      priority: 0,
    },
  ],
  modules: [],
  integrations: [],
  multipliers: [],
  costItemTypes: [],
  params: [
    { key: 'hourly_rate', value: '50' },
    { key: 'multiplier_cap', value: '0.40' },
    { key: 'buffer', value: '0.10' },
    { key: 'offer_low_k', value: '0.20' },
    { key: 'offer_high_k', value: '0.30' },
    { key: 'rounding_pln', value: '100' },
    { key: 'confidence_green', value: '80' },
    { key: 'confidence_yellow', value: '60' },
    { key: 'confidence_completeness', value: '0.60' },
  ],
};

const TOKEN = 'e2e-token';
let fetchMock: ReturnType<typeof vi.fn>;
const putBodies = () =>
  fetchMock.mock.calls
    .filter((c) => (c[1] as RequestInit | undefined)?.method === 'PUT')
    .map((c) => JSON.parse(String((c[1] as RequestInit).body)));

beforeEach(() => {
  fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({}) }));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

const renderEditor = (initialAnswers = {}) =>
  render(
    <QuoteEditor
      quoteId={7}
      archetype="woocommerce"
      initialAnswers={initialAnswers}
      library={LIBRARY}
      sessionToken={TOKEN}
      onChangePlatform={() => {}}
    />,
  );

// label → nagłówek pytania (.closest div) → outer QuestionField div (parentElement) → przycisk bool.
const boolBtn = (label: string, btn: 'Tak' | 'Nie') =>
  within(screen.getByText(label).closest('div')!.parentElement!).getByText(btn);

describe('E2E f1b — przepływ do walidacji (bez finalize)', () => {
  it('naprawy 1+2+4: dedup, nagłówek archetypu, ostrzeżenie, kategorie po nazwach', () => {
    renderEditor();

    // Naprawa 2: nagłówek archetypu read-only + akcja zmiany platformy.
    expect(screen.getByText('WooCommerce')).toBeTruthy();
    expect(screen.getByText('Zmień platformę')).toBeTruthy();

    // Naprawa 1: pytanie kroku Platforma NIE pojawia się w wizardzie.
    expect(screen.queryByText('Co ma robić projekt?')).toBeNull();
    expect(screen.queryByText('Dane wrażliwe?')).not.toBeNull();

    // Naprawa 2: reguła archetype_warning wyrenderowana w podglądzie (dzięki wstrzyknięciu archetypu).
    expect(screen.getByText(/wyrosnąć z WooCommerce/)).toBeTruthy();

    // Naprawa 4b: rozbicie per kategoria po nazwach (nie litery A–G).
    fireEvent.click(screen.getByText('Rozbicie godzin per kategoria'));
    expect(screen.getByText('Prezentacja')).toBeTruthy(); // A
    expect(screen.getByText('Realizacja projektu')).toBeTruthy(); // G
    expect(screen.queryByText('A')).toBeNull();
    expect(screen.queryByText('G')).toBeNull();
  });

  it('naprawa 3 (D23): pusty formularz = niska pewność + „szacunek wstępny"', () => {
    renderEditor();
    // 2 widoczne pytania wizarda nieodpowiedziane → below completeness (0/2 < 0.60).
    expect(screen.getByText(/szacunek wstępny/)).toBeTruthy();
  });

  it('naprawa 4a + „nie wiem": powód obniżenia pewności nazwany po ludzku (etykieta pytania)', () => {
    renderEditor();
    fireEvent.click(boolBtn('Dane wrażliwe?', 'Nie')); // odpowiedziane
    fireEvent.click(screen.getAllByText('nie wiem')[1]); // „Sztywny deadline?" → nie wiem

    // Licznik „nie wiem".
    expect(screen.getByText(/„nie wiem": 1/)).toBeTruthy();
    // Breakdown Confidence: powód nazwany etykietą pytania (po ludzku), nie kodem/„pozycją",
    // i rozróżnia jawne „nie wiem" od braku odpowiedzi (kara ta sama, powód uczciwy).
    expect(screen.getByText(/Odpowiedź „nie wiem": Sztywny deadline\?/)).toBeTruthy();
    expect(screen.queryByText(/deadline_hard/)).toBeNull();
    expect(screen.queryByText(/pozycja/)).toBeNull();
  });

  it('przepływ do walidacji: odpowiedz oba → „Przejdź do walidacji" → ekran walidacji (bez finalize)', () => {
    renderEditor();
    fireEvent.click(boolBtn('Dane wrażliwe?', 'Nie'));
    fireEvent.click(boolBtn('Sztywny deadline?', 'Nie'));
    fireEvent.click(screen.getByText(/Przejdź do walidacji/));
    // Ekran walidacji: obszar z kategorii pojawia się do przeglądu poziomów.
    expect(screen.getByText('Frontend')).toBeTruthy();
    // f1c: akcja finalize jest już dostępna na ekranie walidacji.
    expect(screen.getByText(/Finalizuj wycenę/)).toBeTruthy();
  });
});

describe('E2E f1b — flush przy zamknięciu karty + wznowienie + wyczyszczenie overrides', () => {
  it('zmiana odpowiedzi → unmount → flush wysyła PUT z odpowiedzią', () => {
    const { unmount } = renderEditor();
    fireEvent.click(boolBtn('Sztywny deadline?', 'Tak'));
    act(() => {
      unmount(); // zamknięcie karty w trakcie wizarda
    });
    const puts = putBodies();
    expect(puts.length).toBeGreaterThan(0);
    expect(puts.some((b) => b.id === 7 && b.answers?.deadline_hard === true)).toBe(true);
  });

  it('wznowienie z initialAnswers pokazuje odpowiedź; overrides walidacji NIE przetrwają (client-only)', () => {
    // 1) wznowienie: odpowiedź z „serwera" widoczna w polu.
    const { unmount: u1 } = renderEditor({ deadline_hard: true });
    expect(boolBtn('Sztywny deadline?', 'Tak').className).toMatch(/bg-dark/); // aktywne = zapamiętane
    // wejdź w walidację i ZMIEŃ poziom (tworzy override client-only)
    fireEvent.click(boolBtn('Dane wrażliwe?', 'Nie'));
    fireEvent.click(screen.getByText(/Przejdź do walidacji/));
    const select = screen.getAllByRole('combobox')[0] as HTMLSelectElement; // frontend (kat. A, pierwszy)
    fireEvent.change(select, { target: { value: '4' } }); // override poziomu frontend 2→4
    expect(screen.getByPlaceholderText(/Powód zmiany poziomu/)).toBeTruthy(); // override aktywny
    act(() => u1());

    // 2) remount (wznowienie) — override zniknął (nie był persystowany), poziom wraca do sugerowanego.
    renderEditor({ deadline_hard: true });
    fireEvent.click(boolBtn('Dane wrażliwe?', 'Nie'));
    fireEvent.click(screen.getByText(/Przejdź do walidacji/));
    const select2 = screen.getAllByRole('combobox')[0] as HTMLSelectElement;
    expect(select2.value).toBe('2'); // wrócił do suggested, nie 4
    expect(screen.queryByPlaceholderText(/Powód zmiany poziomu/)).toBeNull(); // brak override
  });
});
