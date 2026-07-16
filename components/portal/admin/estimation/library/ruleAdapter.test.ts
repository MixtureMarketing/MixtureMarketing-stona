import { describe, it, expect } from 'vitest';
import { toRuleModel, toRuleModels, ruleToPatch, type RawRuleRow } from './ruleAdapter';

// TEST KONTRAKTU (korekta architekta f2c-2a): edytor reguł czyta pełny odczyt/eksport WYŁĄCZNIE
// przez ten adapter. Gdy format źródła się zmieni (np. eksport przemianuje condition_json),
// TU ma się zapalić czerwone — a nie wysypać UI. Dlatego kontrakt jest zamrożony testem.

const RAW: RawRuleRow = {
  id: 7,
  name: 'Krytyczność 24/7',
  priority: 10,
  is_active: 1,
  reason_template: 'Krytyczność {downtime_tolerance} wymaga redundancji',
  condition_json: JSON.stringify({
    all: [{ q: 'downtime_tolerance', op: 'eq', val: 'critical_247' }],
  }),
  actions_json: JSON.stringify([
    { type: 'min_level', aspect: 'high_availability', level: 2 },
    { type: 'multiplier', code: 'hard_deadline' },
  ]),
};

describe('ruleAdapter — kontrakt surowy wiersz → RuleModel', () => {
  it('mapuje wszystkie pola, parsuje JSON, is_active→boolean', () => {
    const m = toRuleModel(RAW);
    expect(m).toEqual({
      id: 7,
      name: 'Krytyczność 24/7',
      priority: 10,
      isActive: true,
      reasonTemplate: 'Krytyczność {downtime_tolerance} wymaga redundancji',
      condition: { all: [{ q: 'downtime_tolerance', op: 'eq', val: 'critical_247' }] },
      actions: [
        { type: 'min_level', aspect: 'high_availability', level: 2 },
        { type: 'multiplier', code: 'hard_deadline' },
      ],
    });
  });

  it('is_active=0 → isActive=false', () => {
    expect(toRuleModel({ ...RAW, is_active: 0 }).isActive).toBe(false);
  });

  it('toRuleModels mapuje tablicę', () => {
    expect(toRuleModels([RAW, { ...RAW, id: 8 }]).map((m) => m.id)).toEqual([7, 8]);
  });
});

describe('ruleAdapter — round-trip przez ruleToPatch', () => {
  it('model → patch → te same struktury JSON (bez utraty)', () => {
    const m = toRuleModel(RAW);
    const patch = ruleToPatch(m);
    expect(patch.name).toBe(RAW.name);
    expect(patch.priority).toBe(RAW.priority);
    expect(patch.is_active).toBe(1);
    expect(patch.reason_template).toBe(RAW.reason_template);
    expect(JSON.parse(patch.condition_json)).toEqual(JSON.parse(RAW.condition_json));
    expect(JSON.parse(patch.actions_json)).toEqual(JSON.parse(RAW.actions_json));
  });

  it('edycja wartości (próg val) przechodzi do patcha', () => {
    const m = toRuleModel(RAW);
    // symulacja edytora: zmiana progu w liściu
    (m.condition as { all: { q: string; op: string; val: unknown }[] }).all[0].val = 'krytyczne';
    const patch = ruleToPatch(m);
    expect(JSON.parse(patch.condition_json).all[0].val).toBe('krytyczne');
  });
});
