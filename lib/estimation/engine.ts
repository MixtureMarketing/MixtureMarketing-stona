// Silnik wycen — CZYSTY TS (bez React/DOM/D1). Ten sam kod liczy podgląd w UI i finalize
// na serwerze (inwariant 4). Determinizm: te same wejścia ⇒ ten sam wynik (inwariant 1).
// Kolejność obliczeń i formuły: docs/estimation/03. Ewaluacja reguł: docs/estimation/05.
// ⚠️ Każda zmiana kolejności/formuł ⇒ bump ENGINE_VERSION.
import type {
  Answer,
  Answers,
  Condition,
  ConditionOp,
  AnswerValue,
  RuleAction,
  Rule,
  EvaluateRulesInput,
  RuleEvaluation,
  AspectSuggestion,
  AggregateInput,
  Totals,
  CategoryTotal,
  ConfidenceInput,
  ConfidenceResult,
  ConfidenceBreakdownEntry,
  FinalizeValidationInput,
} from './types';
import { isUnknown, isNotApplicable } from './types';

// 1.1: D23 — widoczne-nieodpowiedziane pytania liczą się do Confidence jak „nie wiem" + próg kompletności.
// 1.2: D24 — filtr modułów per archetyp (buildLibraryData, archetypes_json) zmienia kompozycję wyceny.
// 1.3: D26 — trzeci stan odpowiedzi „nie dotyczy" (pełnoprawna odpowiedź, zero kary Confidence)
//      + wycena pozycji kosztowych z reguł (cost_item, np. dojazd km×2×stawka) — wcześniej nigdy
//      nie trafiały do totals.costs (bug f1c-fix1).
// 1.4: D24 rozszerzone — checklista modułów = PRZECIĘCIE archetyp ∩ cel (goals_json, migracja 0004);
//      moduły spoza zakresu nie wchodzą do wyceny. Ręczna kwota pozycji kosztowej (costAmounts).
// 1.5: D27 — odpowiedzi na pytania NIEWIDOCZNE nie istnieją dla obliczeń (filtr punktu stałego
//      przed regułami/pozycjami/Confidence); porzucona ścieżka odpowiedzi nie wycenia po cichu.
// 1.6: D27 rozszerzone — wartość multiselecta wskazująca na pozycję spoza (przefiltrowanej)
//      biblioteki też nie istnieje: nie wycenia, nie odblokowuje pytań kaskadowych, nie karze Confidence.
export const ENGINE_VERSION = '1.6';

// ── Pomocnicze ───────────────────────────────────────────────────────────────

/** Zaokrąglenie w górę do wielokrotności `step` (epsilon chroni przed błędem zmiennoprzecinkowym). */
export function roundUpTo(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.ceil(value / step - 1e-9) * step;
}

/** Koercja do liczby: liczby/bool wprost; stringi z sufiksem k/m (np. „300k" → 300000). */
function toNum(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') {
    const m = v.trim().match(/^([\d.]+)\s*([km])?$/i);
    if (m) {
      let n = parseFloat(m[1]);
      const s = m[2]?.toLowerCase();
      if (s === 'k') n *= 1e3;
      if (s === 'm') n *= 1e6;
      return n;
    }
    return NaN;
  }
  return NaN;
}

// ── Ewaluacja warunków (docs/05) ─────────────────────────────────────────────

export function matchCondition(cond: Condition, answers: Answers): boolean {
  if ('all' in cond) return cond.all.every((c) => matchCondition(c, answers));
  if ('any' in cond) return cond.any.some((c) => matchCondition(c, answers));

  const { q, op, val } = cond;
  const answer: Answer | undefined = answers[q];

  // „nie wiem" nie spełnia żadnego warunku poza `unknown`.
  // D26: „nie dotyczy" nie spełnia żadnego warunku poza `not_applicable` — także NIE `answered`
  //      (to odpowiedź „tego tu nie ma", więc nie może włączać reguł zakresu).
  if (op === 'unknown') return isUnknown(answer);
  if (op === 'not_applicable') return isNotApplicable(answer);
  if (answer === undefined || isUnknown(answer) || isNotApplicable(answer)) return false;
  if (op === 'answered') return true;

  return compareLeaf(answer as AnswerValue, op, val);
}

function compareLeaf(answer: AnswerValue, op: ConditionOp, val: AnswerValue | undefined): boolean {
  switch (op) {
    case 'eq':
      return answer === val;
    case 'neq':
      return answer !== val;
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte': {
      const a = toNum(answer);
      const b = toNum(val);
      if (Number.isNaN(a) || Number.isNaN(b)) return false;
      return op === 'gt' ? a > b : op === 'gte' ? a >= b : op === 'lt' ? a < b : a <= b;
    }
    case 'in':
      return Array.isArray(val) && (val as AnswerValue[]).includes(answer);
    case 'contains':
      return Array.isArray(answer) && (answer as AnswerValue[]).includes(val as AnswerValue);
    default:
      return false;
  }
}

// ── Widoczność pytań (D27) ───────────────────────────────────────────────────

/** Minimalny kształt pytania na potrzeby widoczności (UI i silnik podają swoje typy). */
export interface VisibilityQuestion {
  code: string;
  visibleIf: string | null;
}

/** Czy pytanie jest widoczne przy danych odpowiedziach. Brak warunku = zawsze.
 *  Niepoprawny JSON warunku → widoczne (nie chowamy pytania z powodu błędu w seedzie). */
export function isQuestionVisible(visibleIf: string | null, answers: Answers): boolean {
  if (!visibleIf) return true;
  try {
    return matchCondition(JSON.parse(visibleIf) as Condition, answers);
  } catch {
    return true;
  }
}

/**
 * D27: odpowiedź, której prowadzący nie mógł udzielić, NIE ISTNIEJE dla obliczeń. Dwie postacie:
 *
 * 1. **Pytanie niewidoczne** (`visible_if` niespełniony) → cała odpowiedź odpada. Zmiana celu →
 *    pytania sklepowe znikają z wizarda, ale odpowiedzi zostają w stanie i w bazie; bez filtra
 *    po cichu wyceniały integracje (retro #1: Stripe wchodził do wyceny portalu treści).
 * 2. **Wartość multiselecta spoza biblioteki** (`allowedValues`) → sama wartość odpada. Moduł
 *    odfiltrowany per archetyp/cel (D24) zostaje w `answers.modules`; bez czyszczenia dalej
 *    odblokowywał pytania kaskadowe i karał Confidence, choć nigdzie nie był wyceniany
 *    (retro #2: konfigurator zabierał −36 pkt w wycenie, w której go nie ma).
 *
 * PUNKT STAŁY: usunięcie odpowiedzi/wartości może ukryć kolejne pytania (kaskada `visible_if`),
 * więc filtrujemy do stabilizacji. Zbiór maleje monotonicznie ⇒ zbieżność ≤ liczba pytań.
 * Klucze spoza katalogu pytań (np. `archetype`) przechodzą nietknięte.
 *
 * @param allowedValues kod pytania → dozwolone wartości (kody z JUŻ przefiltrowanej biblioteki)
 */
export function resolveVisibleAnswers(
  answers: Answers,
  questions: VisibilityQuestion[],
  allowedValues?: Record<string, string[]>,
): Answers {
  const byCode = new Map(questions.map((q) => [q.code, q]));
  const allowed = new Map(
    Object.entries(allowedValues ?? {}).map(([code, codes]) => [code, new Set(codes)]),
  );
  // Czyszczenie wartości nie zależy od `current`, więc stabilizuje się po pierwszym przebiegu.
  const sanitize = (code: string, value: Answers[string]): Answers[string] => {
    const set = allowed.get(code);
    if (!set || !Array.isArray(value)) return value;
    return (value as string[]).filter((v) => set.has(v));
  };

  let current: Answers = answers;
  for (let i = 0; i <= questions.length; i++) {
    const next: Answers = {};
    for (const [code, value] of Object.entries(answers)) {
      const q = byCode.get(code);
      if (q && !isQuestionVisible(q.visibleIf, current)) continue;
      next[code] = sanitize(code, value);
    }
    if (Object.keys(next).length === Object.keys(current).length) return next;
    current = next;
  }
  return current;
}

/** Podstawia {code} wartościami odpowiedzi w szablonie uzasadnienia. */
function renderReason(template: string, answers: Answers): string {
  return template.replace(/\{(\w+)\}/g, (_m, code: string) => {
    const a = answers[code];
    if (a === undefined) return '?';
    if (isUnknown(a)) return 'nie wiem';
    if (isNotApplicable(a)) return 'nie dotyczy'; // D26
    return Array.isArray(a) ? a.join(', ') : String(a);
  });
}

// ── Ewaluacja reguł (docs/05) ────────────────────────────────────────────────

export function evaluateRules(input: EvaluateRulesInput): RuleEvaluation {
  const { answers, archetypeDefaults, rules, knownAspectCodes } = input;
  const known = new Set(knownAspectCodes);

  const levels: Record<string, AspectSuggestion> = {};
  for (const d of archetypeDefaults) {
    levels[d.aspect] = { level: d.defaultLevel, locked: d.isLocked, reasons: [] };
  }

  const multipliers: string[] = [];
  const suggestedModules: string[] = [];
  const suggestedIntegrations: string[] = [];
  const costItems: RuleEvaluation['costItems'] = [];
  const warnings: string[] = [];
  const recommendedArchetypes: RuleEvaluation['recommendedArchetypes'] = [];
  const pushUnique = (arr: string[], code: string) => {
    if (!arr.includes(code)) arr.push(code);
  };

  // Kolejność stabilna: priorytet DESC, potem id ASC (monotoniczność min_level ⇒ wynik niezależny).
  const ordered = [...rules].sort((a, b) => b.priority - a.priority || a.id - b.id);

  for (const rule of ordered) {
    if (!matchCondition(rule.condition, answers)) continue;
    const reason = renderReason(rule.reasonTemplate, answers);

    for (const action of rule.actions) {
      applyAction(action, rule, reason, {
        levels,
        known,
        multipliers,
        suggestedModules,
        suggestedIntegrations,
        costItems,
        warnings,
        recommendedArchetypes,
        pushUnique,
      });
    }
  }

  return {
    levels,
    multipliers,
    suggestedModules,
    suggestedIntegrations,
    costItems,
    warnings,
    recommendedArchetypes,
  };
}

interface ApplyCtx {
  levels: Record<string, AspectSuggestion>;
  known: Set<string>;
  multipliers: string[];
  suggestedModules: string[];
  suggestedIntegrations: string[];
  costItems: RuleEvaluation['costItems'];
  warnings: string[];
  recommendedArchetypes: RuleEvaluation['recommendedArchetypes'];
  pushUnique: (arr: string[], code: string) => void;
}

function applyAction(action: RuleAction, rule: Rule, reason: string, ctx: ApplyCtx): void {
  switch (action.type) {
    case 'min_level': {
      if (!ctx.known.has(action.aspect)) {
        ctx.warnings.push(`Reguła "${rule.name}": nieznany obszar "${action.aspect}" — pominięto.`);
        return;
      }
      let entry = ctx.levels[action.aspect];
      if (!entry) {
        entry = ctx.levels[action.aspect] = { level: 0, locked: false, reasons: [] };
      }
      if (entry.locked) return; // obszar ukryty przez archetyp — reguły go nie ruszają
      if (action.level > entry.level) {
        entry.level = action.level;
        entry.reasons.push(reason);
      }
      return;
    }
    case 'multiplier':
      ctx.pushUnique(ctx.multipliers, action.code);
      return;
    case 'suggest_module':
      ctx.pushUnique(ctx.suggestedModules, action.code);
      return;
    case 'suggest_integration':
      ctx.pushUnique(ctx.suggestedIntegrations, action.code);
      return;
    case 'cost_item':
      if (!ctx.costItems.some((c) => c.code === action.code)) {
        ctx.costItems.push({ code: action.code, qtyFrom: action.qty_from });
      }
      return;
    case 'archetype_warning':
      ctx.warnings.push(action.message);
      return;
    case 'recommend_archetype':
      if (!ctx.recommendedArchetypes.some((r) => r.code === action.code)) {
        ctx.recommendedArchetypes.push({ code: action.code, reason: action.reason });
      }
      return;
  }
}

// ── Agregacja (docs/03) ──────────────────────────────────────────────────────

const ITEMS_GROUP = 'items';

export function aggregate(input: AggregateInput): Totals {
  const { aspects, items, multipliers, params, categoryRates } = input;

  // Krok 1: godziny bazowe per kategoria (fundament: obszary).
  const groupMin: Record<string, number> = {};
  const groupMax: Record<string, number> = {};
  let baseMin = 0;
  let baseMax = 0;
  for (const a of aspects) {
    groupMin[a.category] = (groupMin[a.category] ?? 0) + a.hoursMin;
    groupMax[a.category] = (groupMax[a.category] ?? 0) + a.hoursMax;
    baseMin += a.hoursMin;
    baseMax += a.hoursMax;
  }

  // Krok 2: pozycje addytywne (moduły + integracje) → grupa 'items'.
  let itemsMin = 0;
  let itemsMax = 0;
  for (const it of items) {
    if (it.type === 'module' || it.type === 'integration') {
      itemsMin += it.hoursMin;
      itemsMax += it.hoursMax;
    }
  }
  if (itemsMin !== 0 || itemsMax !== 0) {
    groupMin[ITEMS_GROUP] = (groupMin[ITEMS_GROUP] ?? 0) + itemsMin;
    groupMax[ITEMS_GROUP] = (groupMax[ITEMS_GROUP] ?? 0) + itemsMax;
  }
  const afterItemsMin = baseMin + itemsMin;
  const afterItemsMax = baseMax + itemsMax;

  // Krok 3: mnożniki (suma addytywna, cap).
  const multiplierSum = Math.min(
    multipliers.reduce((s, m) => s + m.value, 0),
    params.multiplierCap,
  );
  // Krok 4: bufor. Współczynnik łączny działa proporcjonalnie na każdą grupę (docs/03 krok 5).
  const factor = (1 + multiplierSum) * (1 + params.buffer);

  const afterMultipliers = {
    hoursMin: afterItemsMin * (1 + multiplierSum),
    hoursMax: afterItemsMax * (1 + multiplierSum),
  };
  const afterBuffer = { hoursMin: afterItemsMin * factor, hoursMax: afterItemsMax * factor };

  // Krok 5: cena per kategoria (stawka kategorii lub globalna; grupa 'items' zawsze globalna).
  const rateFor = (group: string): number =>
    group === ITEMS_GROUP
      ? params.hourlyRate
      : (categoryRates?.[group as never] ?? params.hourlyRate);

  const byCategory: Record<string, CategoryTotal> = {};
  let priceMin = 0;
  let priceMax = 0;
  for (const group of Object.keys(groupMin)) {
    const rate = rateFor(group);
    const hMin = groupMin[group] * factor;
    const hMax = groupMax[group] * factor;
    const pMin = hMin * rate;
    const pMax = hMax * rate;
    byCategory[group] = { hoursMin: hMin, hoursMax: hMax, priceMin: pMin, priceMax: pMax };
    priceMin += pMin;
    priceMax += pMax;
  }

  // Krok 6: widełki ofertowe (zawężone, D7).
  const mid = (priceMin + priceMax) / 2;
  const span = priceMax - priceMin;
  const offer = {
    min: roundUpTo(mid - params.offerLowK * span, params.roundingPln),
    max: roundUpTo(mid + params.offerHighK * span, params.roundingPln),
  };

  // Krok 7: pozycje kosztowe (osobno, bez mnożników/bufora).
  let costs = 0;
  for (const it of items) {
    if (it.type === 'cost') {
      costs += it.amountPln ?? (it.qty ?? 0) * (it.unitPrice ?? 0);
    }
  }

  return {
    base: { hoursMin: baseMin, hoursMax: baseMax },
    afterItems: { hoursMin: afterItemsMin, hoursMax: afterItemsMax },
    multiplierSum,
    afterMultipliers,
    afterBuffer,
    price: { min: priceMin, max: priceMax },
    offer,
    costs,
    byCategory,
    engineVersion: ENGINE_VERSION,
  };
}

// ── Confidence (docs/03) ─────────────────────────────────────────────────────

export function computeConfidence(
  input: ConfidenceInput,
  thresholds: { green: number; yellow: number },
): ConfidenceResult {
  const breakdown: ConfidenceBreakdownEntry[] = [];
  let score = 100;
  const sub = (reason: string, delta: number) => {
    if (delta !== 0) {
      score -= delta;
      breakdown.push({ reason, delta: -delta });
    }
  };

  // D23: „nie wiem" ORAZ widoczne-nieodpowiedziane (caller składa listę); etykieta po ludzku (fix 4a).
  // Kara identyczna (D23), ale powód nazwany zgodnie z prawdą: jawne „nie wiem" ≠ brak odpowiedzi.
  for (const u of input.unknowns) {
    const prefix = u.said === 'unknown' ? 'Odpowiedź „nie wiem"' : 'Brak odpowiedzi';
    sub(`${prefix}: ${u.label ?? u.code}`, 8 * u.weight);
  }
  for (const it of input.items) {
    if (it.risk === 'high') sub(`Ryzyko wysokie: ${it.name}`, 6);
    else if (it.risk === 'medium') sub(`Ryzyko średnie: ${it.name}`, 2);
  }
  if (input.dataMigrationWithoutSample) sub('Migracja danych bez próbki źródła', 8);
  if (input.customArchetypeWithoutDiscovery) sub('Archetyp custom bez discovery', 6);

  score = Math.round(Math.max(0, Math.min(100, score)));
  const band: ConfidenceResult['band'] =
    score >= thresholds.green ? 'green' : score >= thresholds.yellow ? 'yellow' : 'red';

  return { score, band, breakdown, belowCompleteness: input.belowCompleteness };
}

// ── Walidacja przed finalize (docs/03 inwarianty 3–4) ────────────────────────

export function validateForFinalize(input: FinalizeValidationInput): string[] {
  const errors: string[] = [];

  if (input.totalHoursMax <= 0) {
    errors.push('Pusta wycena: brak obszaru z godzinami i brak pozycji — finalize zablokowany.');
  }

  for (const a of input.aspects) {
    const hasOverride = a.overrideHoursMin != null || a.overrideHoursMax != null;
    if (
      a.overrideHoursMin != null &&
      a.overrideHoursMax != null &&
      a.overrideHoursMin > a.overrideHoursMax
    ) {
      errors.push(`Obszar ${a.code}: override godzin min > max.`);
    }
    const changed = a.chosenLevel !== a.suggestedLevel || hasOverride;
    if (changed && !a.overrideReason?.trim()) {
      errors.push(`Obszar ${a.code}: zmiana poziomu/godzin wymaga powodu (override_reason).`);
    }
  }

  return errors;
}
