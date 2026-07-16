// Adapter reguł (f2c-2a) — JEDYNE miejsce, które zna format surowego wiersza reguły z pełnego
// odczytu/eksportu. Edytor operuje na RuleModel; zmiana formatu źródła zapala test kontraktu
// (ruleAdapter.test.ts), a nie wysypuje UI. Symetryczny: read (toRuleModel) i write (ruleToPatch).
import type { Condition, RuleAction } from '@/lib/estimation/types';

export interface RawRuleRow {
  id: number;
  name: string;
  priority: number;
  is_active: number;
  reason_template: string;
  condition_json: string;
  actions_json: string;
}

export interface RuleModel {
  id: number;
  name: string;
  priority: number;
  isActive: boolean;
  reasonTemplate: string;
  condition: Condition;
  actions: RuleAction[];
}

export function toRuleModel(row: RawRuleRow): RuleModel {
  return {
    id: row.id,
    name: row.name,
    priority: row.priority,
    isActive: row.is_active === 1,
    reasonTemplate: row.reason_template,
    condition: JSON.parse(row.condition_json) as Condition,
    actions: JSON.parse(row.actions_json) as RuleAction[],
  };
}

export function toRuleModels(rows: RawRuleRow[]): RuleModel[] {
  return rows.map(toRuleModel);
}

/** Model (po edycji wartości) → patch dla PATCH /library entity=rule. Serializuje drzewo z
 *  powrotem do JSON. Struktura drzewa niezmieniona (edytujemy wartości; restrukturyzacja → F3). */
export function ruleToPatch(m: {
  name: string;
  priority: number;
  isActive: boolean;
  reasonTemplate: string;
  condition: Condition;
  actions: RuleAction[];
}): {
  name: string;
  priority: number;
  is_active: number;
  reason_template: string;
  condition_json: string;
  actions_json: string;
} {
  return {
    name: m.name,
    priority: m.priority,
    is_active: m.isActive ? 1 : 0,
    reason_template: m.reasonTemplate,
    condition_json: JSON.stringify(m.condition),
    actions_json: JSON.stringify(m.actions),
  };
}
