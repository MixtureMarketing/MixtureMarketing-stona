import { describe, it, expect } from 'vitest';
import {
  toEngineRules,
  collectQuestionCodes,
  rulesWithAction,
  platformQuestionCodes,
  type RawRule,
} from './engineAdapter';

const raw: RawRule[] = [
  {
    id: 35,
    name: 'woo',
    condition_json:
      '{"all":[{"q":"project_goal","op":"eq","val":"sklep"},{"q":"products_count","op":"lt","val":2000}]}',
    actions_json: '[{"type":"recommend_archetype","code":"woocommerce"}]',
    reason_template: 'x',
    priority: 0,
  },
  {
    id: 41,
    name: 'warn',
    condition_json: '{"q":"archetype","op":"eq","val":"woocommerce"}',
    actions_json: '[{"type":"archetype_warning","message":"m"}]',
    reason_template: 'x',
    priority: 0,
  },
];

describe('engineAdapter', () => {
  it('toEngineRules parsuje condition/actions z JSON', () => {
    const rules = toEngineRules(raw);
    expect(rules[0].condition).toEqual({
      all: [
        { q: 'project_goal', op: 'eq', val: 'sklep' },
        { q: 'products_count', op: 'lt', val: 2000 },
      ],
    });
    expect(rules[0].actions[0]).toEqual({ type: 'recommend_archetype', code: 'woocommerce' });
  });

  it('rulesWithAction filtruje po typie akcji', () => {
    const rules = toEngineRules(raw);
    expect(rulesWithAction(rules, 'recommend_archetype').map((r) => r.id)).toEqual([35]);
    expect(rulesWithAction(rules, 'archetype_warning').map((r) => r.id)).toEqual([41]);
  });

  it('collectQuestionCodes zbiera q z drzewa', () => {
    const rules = toEngineRules(raw);
    expect([...collectQuestionCodes(rules[0].condition)].sort()).toEqual([
      'products_count',
      'project_goal',
    ]);
  });

  it('platformQuestionCodes = q z recommend_archetype, bez archetype', () => {
    const rules = toEngineRules(raw);
    const codes = platformQuestionCodes(rules);
    expect(codes.has('project_goal')).toBe(true);
    expect(codes.has('products_count')).toBe(true);
    expect(codes.has('archetype')).toBe(false); // pomijane
  });
});
