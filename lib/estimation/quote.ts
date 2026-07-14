// Pełny pipeline wyceny — CZYSTY TS. Ten sam kod: podgląd na żywo w UI (f1b) i serwerowy
// finalize (f1c) — inwariant 4. Łączy ewaluację reguł (05), agregację i Confidence (03).
// Wiedza wyłącznie z przekazanej biblioteki (inwariant 2) — zero hardkodów widełek/progów.
// Wyjątek świadomy: Confidence (03) odwołuje się do stałych kodów pytań/obszarów zdefiniowanych
// w formule 03 (existing_data, data_sample, discovery, archetype laravel/headless) — to część
// specyfikacji silnika (wersjonowana przez engine_version), nie „wartość domenowa".
import { evaluateRules, aggregate, computeConfidence } from './engine';
import { isUnknown } from './types';
import type {
  Answers,
  AnswerValue,
  Risk,
  ComputeQuoteInput,
  QuoteComputation,
  AspectComputation,
  ValidationOverrides,
  QuoteItem,
} from './types';

const EMPTY_OVERRIDES: ValidationOverrides = {
  chosenLevels: {},
  overrideHours: {},
  levelReasons: {},
  disabledModules: [],
  disabledIntegrations: [],
  disabledMultipliers: [],
  extraCostItems: [],
};

const dedupe = (arr: string[]): string[] => [...new Set(arr)];
const multiselect = (answers: Answers, q: string): string[] => {
  const v = answers[q];
  return Array.isArray(v) ? (v as string[]) : [];
};

export function computeQuote(input: ComputeQuoteInput): QuoteComputation {
  const { answers, library } = input;
  const ov: ValidationOverrides = { ...EMPTY_OVERRIDES, ...input.overrides };

  const knownAspectCodes = library.aspects.map((a) => a.code);
  const ruleEval = evaluateRules({
    answers,
    archetypeDefaults: library.archetypeDefaults,
    rules: library.rules,
    knownAspectCodes,
  });

  // ── Obszary (locked wykluczone — „nie pokazywane w walidacji", 04) ──
  const levelHours = (code: string, level: number) => {
    const l = library.levels.find((x) => x.aspectCode === code && x.level === level);
    return { min: l?.hoursMin ?? 0, max: l?.hoursMax ?? 0 };
  };
  const aspects: AspectComputation[] = [];
  for (const a of library.aspects) {
    const sug = ruleEval.levels[a.code];
    if (sug?.locked) continue;
    const suggestedLevel = sug?.level ?? 0;
    const chosenLevel = ov.chosenLevels[a.code] ?? suggestedLevel;
    const oh = ov.overrideHours[a.code];
    const h = oh ? { min: oh.min, max: oh.max } : levelHours(a.code, chosenLevel);
    aspects.push({
      code: a.code,
      category: a.category,
      name: a.name,
      suggestedLevel,
      chosenLevel,
      locked: false,
      hoursMin: h.min,
      hoursMax: h.max,
      reasons: sug?.reasons ?? [],
    });
  }

  // ── Pozycje addytywne: moduły + integracje (D4 — obszary nie rosną od integracji) ──
  const activeModules = dedupe([
    ...ruleEval.suggestedModules,
    ...multiselect(answers, 'modules'),
  ]).filter((c) => !ov.disabledModules.includes(c));

  const activeIntegrations = dedupe([
    ...ruleEval.suggestedIntegrations,
    ...['payments', 'shipping', 'erp', 'marketplace', 'other_integrations'].flatMap((q) =>
      multiselect(answers, q),
    ),
  ]).filter((c) => !ov.disabledIntegrations.includes(c));

  const items: QuoteItem[] = [];
  for (const code of activeModules) {
    const m = library.modules.find((x) => x.code === code);
    if (m)
      items.push({
        type: 'module',
        code: m.code,
        name: m.name,
        hoursMin: m.hoursMin,
        hoursMax: m.hoursMax,
        risk: m.risk,
      });
  }
  for (const code of activeIntegrations) {
    const it = library.integrations.find((x) => x.code === code);
    if (!it) continue;
    const custom =
      library.integrationMode === 'custom' || it.platformMin == null || it.platformMax == null;
    items.push({
      type: 'integration',
      code: it.code,
      name: it.name,
      hoursMin: custom ? it.customMin : (it.platformMin as number),
      hoursMax: custom ? it.customMax : (it.platformMax as number),
      risk: it.risk,
    });
  }
  for (const c of ov.extraCostItems) {
    items.push({ type: 'cost', code: c.code, name: c.name, amountPln: c.amountPln });
  }

  // ── Mnożniki (odznaczalne) ──
  const activeMultipliers = ruleEval.multipliers
    .filter((c) => !ov.disabledMultipliers.includes(c))
    .map((code) => library.multipliers.find((m) => m.code === code))
    .filter((m): m is NonNullable<typeof m> => !!m)
    .map((m) => ({ code: m.code, name: m.name, value: m.value }));

  const totals = aggregate({
    aspects: aspects.map((a) => ({
      code: a.code,
      category: a.category,
      hoursMin: a.hoursMin,
      hoursMax: a.hoursMax,
    })),
    items,
    multipliers: activeMultipliers.map((m) => ({ code: m.code, value: m.value })),
    params: library.params,
    categoryRates: library.categoryRates,
  });

  // ── Confidence (03) ──
  const unknowns = (Object.entries(answers) as [string, AnswerValue | { unknown: true }][])
    .filter(([, v]) => isUnknown(v))
    .map(([code]) => ({ code, weight: library.questionWeights[code] ?? 1 }));
  const itemRisks: Risk[] = items
    .filter((i): i is Extract<QuoteItem, { risk?: Risk }> => i.type !== 'cost')
    .map((i) => i.risk ?? 'low');
  const dataMigrationWithoutSample =
    answers.existing_data === 'przenosimy' && answers.data_sample === false;
  const customArchetypeWithoutDiscovery =
    ['laravel', 'headless'].includes(String(answers.archetype)) &&
    (ruleEval.levels['discovery']?.level ?? 0) <= 1;
  const confidence = computeConfidence(
    { unknowns, itemRisks, dataMigrationWithoutSample, customArchetypeWithoutDiscovery },
    { green: library.params.confidenceGreen, yellow: library.params.confidenceYellow },
  );

  return {
    aspects,
    activeModules,
    activeIntegrations,
    activeMultipliers,
    costItems: ruleEval.costItems,
    warnings: ruleEval.warnings,
    recommendedArchetypes: ruleEval.recommendedArchetypes,
    totals,
    confidence,
  };
}
