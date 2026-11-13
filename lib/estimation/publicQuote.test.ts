import { describe, it, expect } from 'vitest';
import {
  parsePublicConfig,
  computePublicQuote,
  sanitizePublicAnswers,
  PUBLIC_NUMBER_RANGES,
  PUBLIC_TEXT_MAX,
} from './publicQuote';
import type { PublicQuestionDef } from './publicQuote';
import type { RawLibrary } from './toLibraryData';

// Minimalna biblioteka: 1 obszar (frontend, kat. A), archetyp 'x' z domyślnym L1, jedna reguła
// recommend_archetype. Matematyka policzona RĘCZNIE (TDD — test weryfikuje wiring, nie impl.).
const rawLib: RawLibrary = {
  aspects: [{ code: 'frontend', name: 'Frontend', category: 'A' }],
  levels: [
    { aspect_code: 'frontend', level: 0, hours_min: 0, hours_max: 0 },
    { aspect_code: 'frontend', level: 1, hours_min: 10, hours_max: 20 },
  ],
  archetypes: [{ code: 'x', name: 'X', integration_mode: 'platform' }],
  archetypeDefaults: [
    { archetype_code: 'x', aspect_code: 'frontend', default_level: 1, is_locked: 0 },
  ],
  questions: [{ code: 'project_goal', text: 'Cel?', unknown_weight: 1, visible_if_json: null }],
  rules: [
    {
      id: 1,
      name: 'rec X',
      condition_json: '{"q":"project_goal","op":"eq","val":"x"}',
      actions_json: '[{"type":"recommend_archetype","code":"x","reason":"bo x"}]',
      reason_template: '',
      priority: 0,
    },
  ],
  modules: [],
  integrations: [],
  multipliers: [],
  costItemTypes: [],
  params: [
    { key: 'hourly_rate', value: '50' },
    { key: 'buffer', value: '0' },
    { key: 'multiplier_cap', value: '0.4' },
    { key: 'offer_low_k', value: '0.2' },
    { key: 'offer_high_k', value: '0.3' },
    { key: 'rounding_pln', value: '100' },
    { key: 'confidence_green', value: '80' },
    { key: 'confidence_yellow', value: '60' },
    { key: 'confidence_completeness', value: '0.6' },
    { key: 'public_widen_k', value: '0.15' },
    { key: 'public_round_pln', value: '500' },
    { key: 'public_rate_per_hour', value: '5' },
    { key: 'public_archetype_fallback', value: '{"sklep":"woocommerce"}' },
  ],
};

describe('parsePublicConfig', () => {
  it('czyta parametry publiczne + mapę fallback (JSON)', () => {
    const c = parsePublicConfig(rawLib.params);
    expect(c).toEqual({
      widenK: 0.15,
      roundPln: 500,
      ratePerHour: 5,
      fallbackMap: { sklep: 'woocommerce' },
    });
  });

  it('braki → domyślne z kontraktu; zły JSON mapy → pusta mapa', () => {
    const c = parsePublicConfig([{ key: 'public_archetype_fallback', value: '{niepoprawny' }]);
    expect(c).toEqual({ widenK: 0.15, roundPln: 500, ratePerHour: 5, fallbackMap: {} });
  });
});

describe('computePublicQuote — wiring silnika + transform publiczny', () => {
  it('primary: reguła recommend → archetyp x; widełki = toPublicOffer(offer)', () => {
    // frontend L1 = 10–20h; rate 50; buffer 0; mnożniki 0 ⇒ cena 500–1000.
    // offer: mid=750, span=500 → min=roundUp(650,100)=700, max=roundUp(900,100)=900.
    // public: min=floor(700·0.85/500)·500=floor(595/500)·500=500 ;
    //         max=ceil(900·1.15/500)·500=ceil(1035/500)·500=1500.
    const config = parsePublicConfig(rawLib.params);
    const r = computePublicQuote(rawLib, { project_goal: 'x' }, config);
    expect(r.archetype.code).toBe('x');
    expect(r.archetype.reason).toContain('bo x');
    expect(r.priceRange).toEqual({ min: 500, max: 1500 });
  });

  it('fallback: brak rekomendacji dla celu → archetyp z mapy per-cel', () => {
    const config = parsePublicConfig(rawLib.params);
    const r = computePublicQuote(rawLib, { project_goal: 'sklep' }, config);
    expect(r.archetype.code).toBe('woocommerce');
    expect(r.archetype.reason).toContain('sklep');
  });

  it('fallback globalny: cel spoza mapy i bez reguły → laravel', () => {
    const config = parsePublicConfig(rawLib.params);
    const r = computePublicQuote(rawLib, { project_goal: 'nieznany' }, config);
    expect(r.archetype.code).toBe('laravel');
  });
});

const GOALS = '[{"value":"sklep","label":"Sklep"},{"value":"wizytowka","label":"Wizytówka"}]';
const USERS = '[{"value":"nikt","label":"Nikt"},{"value":"klienci","label":"Klienci"}]';
const DEFS = [
  { code: 'project_goal', answer_type: 'select', options_json: GOALS },
  { code: 'languages', answer_type: 'number' },
  { code: 'views_count', answer_type: 'number' },
  { code: 'sensitive_data', answer_type: 'bool' },
  { code: 'users_type', answer_type: 'multiselect', options_json: USERS },
  { code: 'notes', answer_type: 'text' },
];
const OK = { project_goal: 'sklep' };
/** Jeden przypadek: dokładny zestaw kodów powodów (pusty = przepuszczone). */
const reasonsOf = (raw: unknown, defs: PublicQuestionDef[] = DEFS) =>
  sanitizePublicAnswers(raw, defs).reasons;

describe('sanitizePublicAnswers — allowlista kodów i typów (kontrakt §3)', () => {
  it('kod spoza zbioru publicznego → odmowa „kod: spoza listy” bez echa kodu; bliźniak: same kody publiczne', () => {
    const r = sanitizePublicAnswers({ ...OK, sla_value: 99.9, '<img src=x>': 1 }, DEFS);
    expect(r.reasons).toEqual(['kod: spoza listy', 'kod: spoza listy']);
    expect(r.errors.join(' ')).not.toContain('<img');
    expect(r.answers).toEqual(OK);
    expect(reasonsOf(OK)).toEqual([]);
  });

  it('typy: number zostaje liczbą, multiselect tablicą, bool bool; null = brak odpowiedzi', () => {
    const r = sanitizePublicAnswers(
      { ...OK, languages: 2, sensitive_data: true, users_type: ['klienci'], views_count: null },
      DEFS,
    );
    expect(r.errors).toEqual([]);
    expect(r.answers).toEqual({
      ...OK,
      languages: 2,
      sensitive_data: true,
      users_type: ['klienci'],
    });
  });

  it('project_goal wymagane → „wymagane: project_goal”', () => {
    expect(reasonsOf({ languages: 2 })).toEqual(['wymagane: project_goal']);
    expect(reasonsOf(undefined)).toEqual(['wymagane: project_goal']);
  });

  it('answers nie-obiekt (tablica, tekst, liczba) → „odpowiedzi: nie obiekt”', () => {
    for (const raw of [[OK], 'sklep', 5])
      expect(reasonsOf(raw)).toEqual(['odpowiedzi: nie obiekt']);
  });

  it('bool: "true" i 1 → odmowa; bliźniak false → przechodzi', () => {
    expect(reasonsOf({ ...OK, sensitive_data: 'true' })).toEqual(['bool: typ sensitive_data']);
    expect(reasonsOf({ ...OK, sensitive_data: 1 })).toEqual(['bool: typ sensitive_data']);
    expect(reasonsOf({ ...OK, sensitive_data: false })).toEqual([]);
  });
});

describe('A9: select/multiselect tylko z listy opcji, tekst ≤ 200 z allowlisty znaków', () => {
  it('select spoza opcji, HTML, liczba, pusty → „opcja: spoza listy”; bliźniak: każda opcja z listy', () => {
    for (const v of ['blog', '<img src=x onerror=alert(1)>', 'SKLEP', '', 1, ['sklep']])
      expect(reasonsOf({ project_goal: v })).toEqual([
        'opcja: spoza listy project_goal',
        'wymagane: project_goal',
      ]);
    expect(reasonsOf({ project_goal: 'sklep' })).toEqual([]);
    expect(reasonsOf({ project_goal: 'wizytowka' })).toEqual([]);
  });

  it('multiselect: jedna obca, duplikat, nie-string, za długa lista → odmowa; bliźniak: wszystkie z listy', () => {
    const bad: unknown[] = [
      ['klienci', 'hakerzy'],
      ['klienci', 'klienci'],
      ['klienci', 1],
      ['nikt', 'klienci', 'nikt'],
    ];
    for (const v of bad)
      expect(reasonsOf({ ...OK, users_type: v })).toEqual(['opcja: spoza listy users_type']);
    expect(reasonsOf({ ...OK, users_type: 'klienci' })).toEqual(['opcja: typ users_type']);
    expect(reasonsOf({ ...OK, users_type: ['nikt', 'klienci'] })).toEqual([]);
    expect(reasonsOf({ ...OK, users_type: [] })).toEqual([]);
  });

  it('select/multiselect bez poprawnej listy opcji w bazie → odmowa (fail-closed)', () => {
    for (const options_json of [
      null,
      '',
      'nie-json',
      '[]',
      '{"value":"sklep"}',
      '[{"v":"sklep"}]',
    ]) {
      const defs = [{ code: 'project_goal', answer_type: 'select', options_json }];
      expect(reasonsOf(OK, defs)[0]).toBe('opcje: brak listy project_goal');
    }
    const multi = [...DEFS.slice(0, 1), { code: 'users_type', answer_type: 'multiselect' }];
    expect(reasonsOf({ ...OK, users_type: ['nikt'] }, multi)).toEqual([
      'opcje: brak listy users_type',
    ]);
  });

  it('tekst: 201 znaków, 1 MB, HTML, nowa linia, nie-string → odmowa; bliźniak: 200 zwykłych znaków', () => {
    expect(reasonsOf({ ...OK, notes: 'a'.repeat(201) })).toEqual(['tekst: za długi notes']);
    expect(reasonsOf({ ...OK, notes: 'a'.repeat(1024 * 1024) })).toEqual(['tekst: za długi notes']);
    expect(reasonsOf({ ...OK, notes: '<img src=x onerror=alert(1)>' })).toEqual([
      'tekst: znaki notes',
    ]);
    expect(reasonsOf({ ...OK, notes: 'a\nb' })).toEqual(['tekst: znaki notes']);
    expect(reasonsOf({ ...OK, notes: 5 })).toEqual(['tekst: typ notes']);
    expect(reasonsOf({ ...OK, notes: 'Ż'.repeat(200) })).toEqual([]);
    expect(reasonsOf({ ...OK, notes: 'Sklep z kawą, 20% taniej (B2B) - info@firma.pl!' })).toEqual(
      [],
    );
  });

  it('nieznany typ pytania → „typ: nieznany” (fail-closed)', () => {
    const defs = [...DEFS, { code: 'termin', answer_type: 'date' }];
    expect(reasonsOf({ ...OK, termin: '2026-12-01' }, defs)).toEqual(['typ: nieznany termin']);
  });
});

describe('A10: zakresy liczb (podstrony 1–500, języki 1–20), tylko liczba całkowita JSON', () => {
  it('−5, 0, 1e9, 501, 21, 1.5, "5", "NaN" → odmowa z kodem; bliźniak: krańce 1/500 i 1/20', () => {
    for (const v of [-5, 0, 1e9, 501])
      expect(reasonsOf({ ...OK, views_count: v })).toEqual(['liczba: zakres views_count']);
    for (const v of [-5, 0, 1e9, 21])
      expect(reasonsOf({ ...OK, languages: v })).toEqual(['liczba: zakres languages']);
    for (const v of [1.5, '5', 'NaN', true, [5]])
      expect(reasonsOf({ ...OK, languages: v })).toEqual(['liczba: typ languages']);
    for (const v of [1, 500]) expect(reasonsOf({ ...OK, views_count: v })).toEqual([]);
    for (const v of [1, 20]) expect(reasonsOf({ ...OK, languages: v })).toEqual([]);
  });

  it('pole liczbowe bez zakresu w PUBLIC_NUMBER_RANGES → odmowa (fail-closed)', () => {
    const defs = [...DEFS, { code: 'budzet', answer_type: 'number' }];
    expect(reasonsOf({ ...OK, budzet: 10 }, defs)).toEqual(['liczba: brak zakresu budzet']);
    expect(PUBLIC_NUMBER_RANGES).toEqual({ views_count: [1, 500], languages: [1, 20] });
    expect(PUBLIC_TEXT_MAX).toBe(200);
  });
});

// MIX-626: limity z łańcucha MIX-490 złożone z allowlistą A9 (MIX-1383). Tekst ma limit
// PUBLIC_TEXT_MAX (200) zamiast 2000, a bliźniaki „przechodzi” używają wartości z listy opcji.
describe('sanitizePublicAnswers — limity długości', () => {
  it('(−) odpowiedź tekstowa ponad limit → błąd po polsku, odpowiedź odrzucona', () => {
    const { answers, errors } = sanitizePublicAnswers(
      { project_goal: 'sklep', notes: 'x'.repeat(201) },
      DEFS,
    );
    expect(errors).toContain('Pole „notes" ma więcej niż 200 znaków.');
    expect(answers).not.toHaveProperty('notes');
  });

  it('odpowiedź tekstowa dokładnie na limicie przechodzi', () => {
    const { answers, errors } = sanitizePublicAnswers(
      { project_goal: 'sklep', notes: 'x'.repeat(200) },
      DEFS,
    );
    expect(errors).toEqual([]);
    expect(answers.notes).toHaveLength(200);
  });

  it('(−) lista ponad 50 pozycji → błąd; lista z opcji przechodzi', () => {
    const lista = (n: number) => Array.from({ length: n }, () => 'a');
    const za = sanitizePublicAnswers({ project_goal: 'sklep', users_type: lista(51) }, DEFS);
    expect(za.errors).toEqual(['Pole „users_type" może mieć maks. 50 pozycji.']);
    expect(za.reasons).toEqual(['opcja: za dużo pozycji users_type']);
    const ok = sanitizePublicAnswers(
      { project_goal: 'sklep', users_type: ['nikt', 'klienci'] },
      DEFS,
    );
    expect(ok.errors).toEqual([]);
    expect(ok.answers.users_type).toHaveLength(2);
  });

  it('(−) pozycja listy ponad 200 znaków → błąd; pozycja z opcji przechodzi', () => {
    const za = sanitizePublicAnswers(
      { project_goal: 'sklep', users_type: ['a'.repeat(201)] },
      DEFS,
    );
    expect(za.errors).toEqual(['Pozycja w polu „users_type" może mieć maks. 200 znaków.']);
    expect(za.reasons).toEqual(['opcja: za długa pozycja users_type']);
    const ok = sanitizePublicAnswers({ project_goal: 'sklep', users_type: ['klienci'] }, DEFS);
    expect(ok.errors).toEqual([]);
  });

  it('(−) ponad 100 odpowiedzi → jeden błąd, nic nie przetworzone', () => {
    const wiele = Object.fromEntries(Array.from({ length: 101 }, (_, i) => [`k${i}`, 'x']));
    const r = sanitizePublicAnswers({ project_goal: 'sklep', ...wiele }, DEFS);
    expect(r).toEqual({
      answers: {},
      errors: ['Za dużo odpowiedzi (maks. 100).'],
      reasons: ['odpowiedzi: za dużo'],
    });
  });

  it('dokładnie 100 odpowiedzi nie trafia w limit liczby (dalej allowlista kodów)', () => {
    const wiele = Object.fromEntries(Array.from({ length: 99 }, (_, i) => [`k${i}`, 'x']));
    const r = sanitizePublicAnswers({ project_goal: 'sklep', ...wiele }, DEFS);
    expect(r.reasons).not.toContain('odpowiedzi: za dużo');
    expect(r.reasons.filter((x) => x === 'kod: spoza listy')).toHaveLength(99);
  });
});
