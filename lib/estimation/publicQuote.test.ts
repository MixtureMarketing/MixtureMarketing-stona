import { describe, it, expect } from 'vitest';
import { parsePublicConfig, computePublicQuote, sanitizePublicAnswers } from './publicQuote';
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

const DEFS = [
  { code: 'project_goal', answer_type: 'select' },
  { code: 'languages', answer_type: 'number' },
  { code: 'sensitive_data', answer_type: 'bool' },
  { code: 'users_type', answer_type: 'multiselect' },
];

describe('sanitizePublicAnswers — filtr do kodów publicznych + kontrola typów', () => {
  it('odrzuca kody spoza zbioru publicznego (ochrona przed wstrzyknięciem internal)', () => {
    const { answers } = sanitizePublicAnswers(
      { project_goal: 'sklep', sla_value: 99.9, internal_x: true },
      DEFS,
    );
    expect(answers).toEqual({ project_goal: 'sklep' });
    expect(answers).not.toHaveProperty('sla_value');
  });

  it('koercja typu number ("2"→2); multiselect zostaje tablicą; bool zostaje bool', () => {
    const { answers, errors } = sanitizePublicAnswers(
      { project_goal: 'sklep', languages: '2', sensitive_data: true, users_type: ['klienci'] },
      DEFS,
    );
    expect(errors).toEqual([]);
    expect(answers).toEqual({
      project_goal: 'sklep',
      languages: 2,
      sensitive_data: true,
      users_type: ['klienci'],
    });
  });

  it('project_goal wymagane → błąd, gdy brak', () => {
    const { errors } = sanitizePublicAnswers({ languages: 2 }, DEFS);
    expect(errors.some((e) => e.includes('project_goal'))).toBe(true);
  });

  it('number niepoprawny (NaN) → błąd', () => {
    const { errors } = sanitizePublicAnswers({ project_goal: 'sklep', languages: 'dużo' }, DEFS);
    expect(errors.some((e) => e.includes('languages'))).toBe(true);
  });
});
