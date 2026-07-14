// Adapter: surowe wiersze biblioteki (z /api/admin/estimation/library) → typy silnika.
// Data-driven: zestaw pytań neutralnych kroku „Platforma" wyprowadzany z reguł
// recommend_archetype (nie hardkodujemy listy — inwariant 2).
import type { Rule, Condition, RuleAction } from '@/lib/estimation/types';

export interface RawRule {
  id: number;
  name: string;
  condition_json: string;
  actions_json: string;
  reason_template: string;
  priority: number;
}

export function toEngineRules(raw: RawRule[]): Rule[] {
  return raw.map((r) => ({
    id: r.id,
    name: r.name,
    priority: r.priority,
    condition: JSON.parse(r.condition_json) as Condition,
    actions: JSON.parse(r.actions_json) as RuleAction[],
    reasonTemplate: r.reason_template,
  }));
}

/** Reguły zawierające przynajmniej jedną akcję danego typu. */
export function rulesWithAction(rules: Rule[], type: RuleAction['type']): Rule[] {
  return rules.filter((r) => r.actions.some((a) => a.type === type));
}

/** Zbiera wszystkie kody pytań (`q`) z drzewa warunków. */
export function collectQuestionCodes(cond: Condition, acc: Set<string> = new Set()): Set<string> {
  if ('all' in cond) cond.all.forEach((c) => collectQuestionCodes(c, acc));
  else if ('any' in cond) cond.any.forEach((c) => collectQuestionCodes(c, acc));
  else acc.add(cond.q);
  return acc;
}

/** Kody pytań neutralnych: q-kody z warunków wszystkich reguł recommend_archetype,
 *  z pominięciem `archetype` (to wynik kroku, nie pytanie neutralne). */
export function platformQuestionCodes(rules: Rule[]): Set<string> {
  const acc = new Set<string>();
  for (const r of rulesWithAction(rules, 'recommend_archetype'))
    collectQuestionCodes(r.condition, acc);
  acc.delete('archetype');
  return acc;
}
