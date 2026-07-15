// Współdzielony transformat: surowe wiersze biblioteki (z /api/admin/estimation/library lub
// bezpośrednio z D1 przy finalize) → LibraryData (kształt silnika), dla WYBRANEGO archetypu.
// CZYSTY TS — ten sam kod w UI (podgląd) i na serwerze (finalize) = parytet z konstrukcji
// (inwariant 4). f1c: filtr modułów po archetypes_json (decyzja architekta).
import type {
  LibraryData,
  EngineParams,
  Risk,
  Category,
  Rule,
  Condition,
  RuleAction,
} from './types';

export interface RawRule {
  id: number;
  name: string;
  condition_json: string;
  actions_json: string;
  reason_template: string;
  priority: number;
}

export interface RawLibrary {
  aspects: { code: string; name: string; category: string; description?: string | null }[];
  levels: {
    aspect_code: string;
    level: number;
    hours_min: number;
    hours_max: number;
    name?: string | null;
    description?: string | null;
  }[];
  archetypes: {
    code: string;
    name: string;
    description?: string | null;
    integration_mode: string;
  }[];
  archetypeDefaults: {
    archetype_code: string;
    aspect_code: string;
    default_level: number;
    is_locked: number;
  }[];
  questions: {
    code: string;
    text: string;
    unknown_weight: number;
    visible_if_json: string | null;
  }[];
  rules: RawRule[];
  modules: {
    code: string;
    name: string;
    hours_min: number;
    hours_max: number;
    risk: string;
    archetypes_json?: string | null;
    /** D24: zakres celów projektu (project_goal); null = wszystkie cele. Migracja 0004. */
    goals_json?: string | null;
  }[];
  integrations: {
    code: string;
    name: string;
    hours_platform_min: number | null;
    hours_platform_max: number | null;
    hours_custom_min: number;
    hours_custom_max: number;
    risk: string;
  }[];
  multipliers: { code: string; name: string; value: number }[];
  costItemTypes?: { code: string; name: string; unit: string | null; unit_price: number | null }[];
  params: { key: string; value: string }[];
}

const asRisk = (r: string): Risk => (r === 'high' || r === 'medium' ? r : 'low');

/** archetypes_json / goals_json → lista kodów albo null (null/parse-fail = brak ograniczenia). */
function parseScope(json: string | null | undefined): string[] | null {
  if (!json) return null;
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) && v.length > 0 ? (v as string[]) : null;
  } catch {
    return null;
  }
}

/** Moduł jest w zakresie, gdy lista jest pusta (null = wszystko) albo zawiera bieżącą wartość.
 *  `current` undefined (np. cel jeszcze nieodpowiedziany) ⇒ nie filtrujemy (permisywnie). */
const inScope = (scope: string[] | null, current: string | null | undefined): boolean =>
  scope === null || current == null || scope.includes(current);

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

function parseParams(rows: { key: string; value: string }[]): EngineParams {
  const p: Record<string, string> = {};
  for (const r of rows) p[r.key] = r.value;
  const num = (k: string, d: number) => {
    const v = Number(p[k]);
    return Number.isFinite(v) ? v : d;
  };
  return {
    hourlyRate: num('hourly_rate', 50),
    multiplierCap: num('multiplier_cap', 0.4),
    buffer: num('buffer', 0.1),
    offerLowK: num('offer_low_k', 0.2),
    offerHighK: num('offer_high_k', 0.3),
    roundingPln: num('rounding_pln', 100),
    confidenceGreen: num('confidence_green', 80),
    confidenceYellow: num('confidence_yellow', 60),
    completenessThreshold: num('confidence_completeness', 0.6),
  };
}

/**
 * @param archetype kod wybranego archetypu (filtruje archetype_defaults i moduły)
 * @param goal      kod `project_goal` z odpowiedzi; undefined = jeszcze nieodpowiedziany (bez filtra celu)
 */
export function buildLibraryData(
  lib: RawLibrary,
  archetype: string,
  goal?: string | null,
): LibraryData {
  const arch = lib.archetypes.find((a) => a.code === archetype);
  return {
    aspects: lib.aspects.map((a) => ({
      code: a.code,
      category: a.category as Category,
      name: a.name,
    })),
    levels: lib.levels.map((l) => ({
      aspectCode: l.aspect_code,
      level: l.level,
      hoursMin: l.hours_min,
      hoursMax: l.hours_max,
      name: l.name ?? null,
      description: l.description ?? null,
    })),
    archetypeDefaults: lib.archetypeDefaults
      .filter((d) => d.archetype_code === archetype)
      .map((d) => ({
        aspect: d.aspect_code,
        defaultLevel: d.default_level,
        isLocked: d.is_locked === 1,
      })),
    rules: toEngineRules(lib.rules),
    modules: lib.modules
      .map((m) => ({
        code: m.code,
        name: m.name,
        hoursMin: m.hours_min,
        hoursMax: m.hours_max,
        risk: asRisk(m.risk),
        archetypes: parseScope(m.archetypes_json),
        goals: parseScope(m.goals_json),
      }))
      // D24: checklista = PRZECIĘCIE archetyp ∩ cel. Brak przypisania (null) = bez ograniczenia.
      .filter((m) => inScope(m.archetypes, archetype) && inScope(m.goals, goal)),
    integrations: lib.integrations.map((i) => ({
      code: i.code,
      name: i.name,
      platformMin: i.hours_platform_min,
      platformMax: i.hours_platform_max,
      customMin: i.hours_custom_min,
      customMax: i.hours_custom_max,
      risk: asRisk(i.risk),
    })),
    multipliers: lib.multipliers.map((m) => ({ code: m.code, name: m.name, value: m.value })),
    questions: lib.questions.map((q) => ({
      code: q.code,
      unknownWeight: q.unknown_weight,
      visibleIf: q.visible_if_json,
      label: q.text,
    })),
    costItemTypes: (lib.costItemTypes ?? []).map((c) => ({
      code: c.code,
      name: c.name,
      unit: c.unit,
      unitPrice: c.unit_price,
    })),
    params: parseParams(lib.params),
    integrationMode: arch?.integration_mode === 'custom' ? 'custom' : 'platform',
  };
}
