import { describe, it, expect } from 'vitest';
import { validateRule, buildRuleContext, type RuleLibraryContext } from './ruleValidation';

// Spójność reguł z biblioteką (f2c-2a, uwaga architekta): reguła-sierota to CICHY no-op —
// akcja wskazująca nieistniejący kod modułu/integracji/mnożnika, min_level na obszar spoza
// biblioteki albo poziom spoza zakresu obszaru, warunek na nieistniejące pytanie. Walidator
// łapie to PRZED zapisem (endpoint → 400), a nie pozwala regule przejść i nigdy nie zadziałać.

const ctx: RuleLibraryContext = buildRuleContext({
  aspects: [{ code: 'frontend' }, { code: 'high_availability' }, { code: 'load_balancing' }],
  levels: [
    { aspect_code: 'frontend', level: 0 },
    { aspect_code: 'frontend', level: 1 },
    { aspect_code: 'frontend', level: 2 },
    { aspect_code: 'high_availability', level: 0 },
    { aspect_code: 'high_availability', level: 1 },
    { aspect_code: 'high_availability', level: 2 },
    { aspect_code: 'high_availability', level: 3 },
    { aspect_code: 'load_balancing', level: 0 },
    { aspect_code: 'load_balancing', level: 1 },
  ],
  modules: [{ code: 'b2b_pricing' }],
  integrations: [{ code: 'inpost' }],
  multipliers: [{ code: 'hard_deadline' }],
  costItemTypes: [{ code: 'travel' }],
  questions: [
    { code: 'downtime_tolerance' },
    { code: 'users_concurrent' },
    { code: 'workshops_travel_km' },
  ],
  archetypes: [{ code: 'sylius' }],
});

const V = (cond: unknown, actions: unknown) =>
  validateRule(JSON.stringify(cond), JSON.stringify(actions), ctx);

describe('validateRule — poprawne reguły', () => {
  it('warunek all/any + akcje na istniejących kodach → []', () => {
    const errs = V(
      {
        all: [
          { q: 'downtime_tolerance', op: 'eq', val: 'critical_247' },
          { any: [{ q: 'users_concurrent', op: 'gte', val: 500 }] },
        ],
      },
      [
        { type: 'min_level', aspect: 'high_availability', level: 3 },
        { type: 'multiplier', code: 'hard_deadline' },
        { type: 'suggest_module', code: 'b2b_pricing' },
        { type: 'cost_item', code: 'travel', qty_from: 'workshops_travel_km' },
      ],
    );
    expect(errs).toEqual([]);
  });

  it('archetype_warning (bez code) + recommend_archetype na istniejącym → []', () => {
    expect(
      V({ q: 'downtime_tolerance', op: 'answered' }, [
        { type: 'archetype_warning', message: 'Rozważ Sylius' },
        { type: 'recommend_archetype', code: 'sylius', reason: 'x' },
      ]),
    ).toEqual([]);
  });
});

describe('validateRule — SIEROTY AKCJI → błąd', () => {
  it('suggest_module na nieistniejący kod', () => {
    const e = V({ q: 'downtime_tolerance', op: 'answered' }, [
      { type: 'suggest_module', code: 'nie_ma_takiego' },
    ]);
    expect(e.length).toBeGreaterThan(0);
    expect(e.join(' ')).toMatch(/nie_ma_takiego/);
  });
  it('suggest_integration / multiplier / cost_item na nieistniejący kod', () => {
    expect(
      V({ q: 'downtime_tolerance', op: 'answered' }, [{ type: 'suggest_integration', code: 'x' }])
        .length,
    ).toBeGreaterThan(0);
    expect(
      V({ q: 'downtime_tolerance', op: 'answered' }, [{ type: 'multiplier', code: 'x' }]).length,
    ).toBeGreaterThan(0);
    expect(
      V({ q: 'downtime_tolerance', op: 'answered' }, [{ type: 'cost_item', code: 'x' }]).length,
    ).toBeGreaterThan(0);
  });
  it('recommend_archetype na nieistniejący archetyp', () => {
    expect(
      V({ q: 'downtime_tolerance', op: 'answered' }, [
        { type: 'recommend_archetype', code: 'brak' },
      ]).length,
    ).toBeGreaterThan(0);
  });
  it('min_level na obszar spoza biblioteki', () => {
    expect(
      V({ q: 'downtime_tolerance', op: 'answered' }, [
        { type: 'min_level', aspect: 'brak', level: 1 },
      ]).length,
    ).toBeGreaterThan(0);
  });
  it('min_level na POZIOM spoza zakresu obszaru (load_balancing ma 0..1, żądane 2)', () => {
    const e = V({ q: 'downtime_tolerance', op: 'answered' }, [
      { type: 'min_level', aspect: 'load_balancing', level: 2 },
    ]);
    expect(e.length).toBeGreaterThan(0);
    expect(e.join(' ')).toMatch(/load_balancing/);
  });
  it('nieznany typ akcji', () => {
    expect(
      V({ q: 'downtime_tolerance', op: 'answered' }, [{ type: 'teleport', code: 'x' }]).length,
    ).toBeGreaterThan(0);
  });
});

describe('validateRule — SIEROTY WARUNKU → błąd', () => {
  it('liść q na nieistniejące pytanie', () => {
    const e = V({ q: 'nie_ma_pytania', op: 'eq', val: 'x' }, [
      { type: 'multiplier', code: 'hard_deadline' },
    ]);
    expect(e.length).toBeGreaterThan(0);
    expect(e.join(' ')).toMatch(/nie_ma_pytania/);
  });
  it('nieznany operator', () => {
    expect(
      V({ q: 'downtime_tolerance', op: 'blisko', val: 'x' }, [
        { type: 'multiplier', code: 'hard_deadline' },
      ]).length,
    ).toBeGreaterThan(0);
  });
  it('zagnieżdżony q-sierota w all/any', () => {
    const e = V(
      {
        all: [
          { q: 'downtime_tolerance', op: 'answered' },
          { any: [{ q: 'widmo', op: 'answered' }] },
        ],
      },
      [{ type: 'multiplier', code: 'hard_deadline' }],
    );
    expect(e.join(' ')).toMatch(/widmo/);
  });
});

describe('validateRule — złe JSON / kształt', () => {
  it('condition_json nie-JSON → błąd', () => {
    expect(validateRule('{niepoprawny', '[]', ctx).length).toBeGreaterThan(0);
  });
  it('actions_json nie-tablica → błąd', () => {
    expect(
      validateRule('{"q":"downtime_tolerance","op":"answered"}', '{"nie":"tablica"}', ctx).length,
    ).toBeGreaterThan(0);
  });
  it('pusta lista akcji → błąd (reguła bez efektu)', () => {
    expect(
      validateRule('{"q":"downtime_tolerance","op":"answered"}', '[]', ctx).length,
    ).toBeGreaterThan(0);
  });
});
