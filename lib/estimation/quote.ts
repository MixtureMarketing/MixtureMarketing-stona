// Pełny pipeline wyceny — CZYSTY TS. Ten sam kod: podgląd na żywo w UI (f1b) i serwerowy
// finalize (f1c) — inwariant 4. Łączy ewaluację reguł (05), agregację i Confidence (03).
// Wiedza wyłącznie z przekazanej biblioteki (inwariant 2) — zero hardkodów widełek/progów.
// Wyjątek świadomy: Confidence (03) odwołuje się do stałych kodów pytań/obszarów zdefiniowanych
// w formule 03 (existing_data, data_sample, discovery, archetype laravel/headless) — to część
// specyfikacji silnika (wersjonowana przez engine_version), nie „wartość domenowa".
import {
  evaluateRules,
  aggregate,
  computeConfidence,
  isQuestionVisible,
  resolveVisibleAnswers,
} from './engine';
import { isUnknown } from './types';
import type {
  Answers,
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
  costAmounts: {},
};

/** Pytania, których odpowiedzi mapują się 1:1 na integracje z biblioteki (docs/05).
 *  Świadomy wyjątek od inwariantu 2: to część specyfikacji silnika (wersjonowana engine_version),
 *  nie wartość domenowa — same integracje i ich godziny żyją w seedach. */
const INTEGRATION_QUESTIONS = ['payments', 'shipping', 'erp', 'marketplace', 'other_integrations'];

const dedupe = (arr: string[]): string[] => [...new Set(arr)];
const multiselect = (answers: Answers, q: string): string[] => {
  const v = answers[q];
  return Array.isArray(v) ? (v as string[]) : [];
};

export function computeQuote(input: ComputeQuoteInput): QuoteComputation {
  const { library } = input;
  const ov: ValidationOverrides = { ...EMPTY_OVERRIDES, ...input.overrides };

  // D27: odpowiedzi, których prowadzący nie mógł udzielić, nie istnieją dla obliczeń —
  // filtrujemy NA WEJŚCIU, zanim zobaczą je reguły, pozycje i Confidence:
  //  (a) pytania niewidoczne (np. płatności sprzed zmiany celu na „portal treści"),
  //  (b) wartości multiselecta spoza JUŻ przefiltrowanej biblioteki (moduł/integracja poza
  //      zakresem archetyp ∩ cel — nie da się jej zaznaczyć, więc nie może nic odblokowywać).
  const answers = resolveVisibleAnswers(input.answers, library.questions, {
    modules: library.modules.map((m) => m.code),
    ...Object.fromEntries(
      INTEGRATION_QUESTIONS.map((q) => [q, library.integrations.map((i) => i.code)]),
    ),
  });

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
  // Tylko pozycje OBECNE w bibliotece (po filtrze archetyp ∩ cel, D24) — moduł spoza zakresu
  // nie może ani wejść do wyceny, ani wisieć na liście aktywnych jako goły kod.
  const activeModules = dedupe([...ruleEval.suggestedModules, ...multiselect(answers, 'modules')])
    .filter((c) => library.modules.some((m) => m.code === c))
    .filter((c) => !ov.disabledModules.includes(c));

  const activeIntegrations = dedupe([
    ...ruleEval.suggestedIntegrations,
    ...INTEGRATION_QUESTIONS.flatMap((q) => multiselect(answers, q)),
  ])
    .filter((c) => library.integrations.some((i) => i.code === c))
    .filter((c) => !ov.disabledIntegrations.includes(c));

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
  // ── Pozycje kosztowe z REGUŁ (D14; akcja cost_item). Poza godzinami/mnożnikami/buforem (03 krok 7).
  // Formuła v1 (03): dojazd = km w jedną stronę × 2 (tam i z powrotem) × stawka za km — JEDNA pozycja
  // na wycenę, niezależnie od liczby spotkań. Typ bez stawki lub bez qty_from → pozycja widoczna
  // z kwotą 0 i notatką „do wyceny ręcznej" (nie gubimy sygnału z reguły).
  const ROUND_TRIP = 2; // spec formuły (03), nie wartość domenowa — stawka zł/km żyje w seedach
  for (const sug of ruleEval.costItems) {
    const type = library.costItemTypes.find((t) => t.code === sug.code);
    if (!type) continue; // nieznany kod typu → pomiń (reguła do poprawy w bibliotece)
    const rawQty = sug.qtyFrom ? answers[sug.qtyFrom] : undefined;
    const oneWay = typeof rawQty === 'string' || typeof rawQty === 'number' ? Number(rawQty) : NaN;
    const priceable = type.unitPrice != null && Number.isFinite(oneWay) && oneWay > 0;
    const qty = priceable ? oneWay * ROUND_TRIP : undefined;
    // Ręczna kwota z walidacji ma pierwszeństwo (pozycje bez stawki, np. usługa zewnętrzna).
    const manual = ov.costAmounts[type.code];
    const computed = priceable ? qty! * (type.unitPrice as number) : 0;
    items.push({
      type: 'cost',
      code: type.code,
      name: type.name,
      amountPln: manual != null ? manual : computed,
      qty,
      unit: type.unit ?? undefined,
      unitPrice: type.unitPrice ?? undefined,
      note:
        manual != null
          ? 'kwota ustawiona ręcznie'
          : priceable
            ? `${oneWay} ${type.unit ?? ''} w jedną stronę × 2 (tam i z powrotem)`.trim()
            : 'kwota do wyceny ręcznej',
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

  // ── Confidence (03, D23 + D26) ──
  // D23: WIDOCZNE pytanie (visible_if spełniony) NIEODPOWIEDZIANE lub „nie wiem" → liczy się jak unknown.
  // D26: „nie dotyczy" to PEŁNOPRAWNA odpowiedź — zero kary, liczy się do kompletności
  //      (isNotApplicable ⇒ isAnswered = true, bo to nie jest niewiadoma tylko świadome „nie ma tego").
  const isAnswered = (code: string) => {
    const v = answers[code];
    return v !== undefined && !isUnknown(v);
  };
  // Ta sama widoczność co przy filtrowaniu odpowiedzi (D27) — liczona na już przefiltrowanym
  // zbiorze, więc kaskada warunków jest spójna: pytanie ukryte nie karze i nie liczy się do kompletności.
  const visibleQuestions = library.questions.filter((q) => isQuestionVisible(q.visibleIf, answers));
  const unknowns = visibleQuestions
    .filter((q) => !isAnswered(q.code))
    .map((q) => ({
      code: q.code,
      weight: q.unknownWeight,
      label: q.label,
      // ta sama kara, inny powód w breakdownie (uczciwie wobec tego, co zrobił użytkownik)
      said: isUnknown(answers[q.code]) ? ('unknown' as const) : ('missing' as const),
    }));
  const answeredVisible = visibleQuestions.length - unknowns.length;
  const completeness =
    visibleQuestions.length === 0 ? 1 : answeredVisible / visibleQuestions.length;

  const confItems = items
    .filter((i): i is Extract<QuoteItem, { risk?: Risk }> => i.type !== 'cost')
    .map((i) => ({ name: i.name, risk: (i.risk ?? 'low') as Risk }));
  const dataMigrationWithoutSample =
    answers.existing_data === 'przenosimy' && answers.data_sample === false;
  const customArchetypeWithoutDiscovery =
    ['laravel', 'headless'].includes(String(answers.archetype)) &&
    (ruleEval.levels['discovery']?.level ?? 0) <= 1;
  // `config_matrix` jest widoczne wyłącznie, gdy w checkliście jest konfigurator (visible_if),
  // a D27 usuwa odpowiedzi na pytania niewidoczne — samo `=== false` wystarcza za warunek zakresu.
  const configuratorWithoutMatrix = answers.config_matrix === false;
  const confidence = computeConfidence(
    {
      unknowns,
      items: confItems,
      dataMigrationWithoutSample,
      customArchetypeWithoutDiscovery,
      configuratorWithoutMatrix,
      belowCompleteness: completeness < library.params.completenessThreshold,
    },
    { green: library.params.confidenceGreen, yellow: library.params.confidenceYellow },
  );

  return {
    aspects,
    activeModules,
    activeIntegrations,
    activeMultipliers,
    items, // rozwiązane pozycje (snapshot est_quote_items przy finalize, f1c)
    costItems: ruleEval.costItems,
    warnings: ruleEval.warnings,
    recommendedArchetypes: ruleEval.recommendedArchetypes,
    totals,
    confidence,
  };
}
