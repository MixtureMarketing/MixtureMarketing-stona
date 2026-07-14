// Transform surowej biblioteki (z /api/admin/estimation/library) → kształt silnika (LibraryData),
// dla WYBRANEGO archetypu (filtruje archetype_defaults, ustawia taryfę integracji). Pure.
import { toEngineRules } from './engineAdapter';
import type { EstimationLibrary } from './useEstimationLibrary';
import type { LibraryData, EngineParams, Risk, Category } from '@/lib/estimation/types';

const asRisk = (r: string): Risk => (r === 'high' || r === 'medium' ? r : 'low');

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

export function toLibraryData(lib: EstimationLibrary, archetype: string): LibraryData {
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
    })),
    archetypeDefaults: lib.archetypeDefaults
      .filter((d) => d.archetype_code === archetype)
      .map((d) => ({
        aspect: d.aspect_code,
        defaultLevel: d.default_level,
        isLocked: d.is_locked === 1,
      })),
    rules: toEngineRules(lib.rules),
    modules: lib.modules.map((m) => ({
      code: m.code,
      name: m.name,
      hoursMin: m.hours_min,
      hoursMax: m.hours_max,
      risk: asRisk(m.risk),
    })),
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
    params: parseParams(lib.params),
    integrationMode: arch?.integration_mode === 'custom' ? 'custom' : 'platform',
  };
}
