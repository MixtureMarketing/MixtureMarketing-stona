// Walidacja SPÓJNOŚCI reguły z biblioteką (f2c-2a) — CZYSTY TS. Reguła-sierota (akcja/warunek
// wskazujący nieistniejący kod) to cichy no-op: silnik ją pomija (SKILL inwariant), więc nikt
// nie widzi błędu. Ten walidator łapie to PRZED zapisem (endpoint → 400).
// Zakres: NIE waliduje struktury drzewa (restrukturyzacja → F3) — waliduje, że każdy kod, na
// który reguła się powołuje, istnieje, a min_level celuje w zdefiniowany poziom obszaru.

const CONDITION_OPS = new Set([
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'contains',
  'answered',
  'unknown',
  'not_applicable',
]);

const ACTION_TYPES = new Set([
  'min_level',
  'multiplier',
  'suggest_module',
  'suggest_integration',
  'cost_item',
  'archetype_warning',
  'recommend_archetype',
]);

export interface RuleLibraryContext {
  aspectCodes: Set<string>;
  /** aspect_code → zbiór zdefiniowanych poziomów (0..4 wg seeda, ale nie zakładamy) */
  levelsByAspect: Map<string, Set<number>>;
  moduleCodes: Set<string>;
  integrationCodes: Set<string>;
  multiplierCodes: Set<string>;
  costItemCodes: Set<string>;
  questionCodes: Set<string>;
  archetypeCodes: Set<string>;
}

/** Buduje kontekst z surowych wierszy biblioteki (te same, które ma endpoint z D1). */
export function buildRuleContext(raw: {
  aspects: { code: string }[];
  levels: { aspect_code: string; level: number }[];
  modules: { code: string }[];
  integrations: { code: string }[];
  multipliers: { code: string }[];
  costItemTypes: { code: string }[];
  questions: { code: string }[];
  archetypes: { code: string }[];
}): RuleLibraryContext {
  const levelsByAspect = new Map<string, Set<number>>();
  for (const l of raw.levels) {
    if (!levelsByAspect.has(l.aspect_code)) levelsByAspect.set(l.aspect_code, new Set());
    levelsByAspect.get(l.aspect_code)!.add(l.level);
  }
  return {
    aspectCodes: new Set(raw.aspects.map((a) => a.code)),
    levelsByAspect,
    moduleCodes: new Set(raw.modules.map((m) => m.code)),
    integrationCodes: new Set(raw.integrations.map((i) => i.code)),
    multiplierCodes: new Set(raw.multipliers.map((m) => m.code)),
    costItemCodes: new Set(raw.costItemTypes.map((c) => c.code)),
    questionCodes: new Set(raw.questions.map((q) => q.code)),
    archetypeCodes: new Set(raw.archetypes.map((a) => a.code)),
  };
}

/** Syntetyczne „pytania" wstrzykiwane przez silnik jako odpowiedzi (nie ma ich w est_questions).
 *  Świadomy wyjątek od inwariantu 2 — część specyfikacji silnika (jak INTEGRATION_QUESTIONS w quote.ts).
 *  `archetype` = kod wybranego archetypu (quote.ts: answers.archetype); reguły recommend_archetype /
 *  archetype_warning i „archetype∈{laravel,headless}" (docs/05) na nim warunkują. */
const SYNTHETIC_Q = new Set(['archetype']);

type CondNode =
  | { all: CondNode[] }
  | { any: CondNode[] }
  | { q: string; op: string; val?: unknown };

function walkCondition(node: unknown, ctx: RuleLibraryContext, errors: string[]): void {
  if (node == null || typeof node !== 'object') {
    errors.push('Warunek: węzeł nie jest obiektem.');
    return;
  }
  const n = node as CondNode;
  if ('all' in n || 'any' in n) {
    const arr = 'all' in n ? n.all : (n as { any: CondNode[] }).any;
    if (!Array.isArray(arr)) {
      errors.push('Warunek: „all"/„any" musi być tablicą.');
      return;
    }
    arr.forEach((c) => walkCondition(c, ctx, errors));
    return;
  }
  // liść
  if (typeof n.q !== 'string') {
    errors.push('Warunek: liść wymaga pola „q".');
    return;
  }
  if (!ctx.questionCodes.has(n.q) && !SYNTHETIC_Q.has(n.q))
    errors.push(`Warunek: nieistniejące pytanie „${n.q}".`);
  if (typeof n.op !== 'string' || !CONDITION_OPS.has(n.op))
    errors.push(`Warunek: nieznany operator „${String(n.op)}" (pytanie „${n.q}").`);
}

function validateAction(a: unknown, ctx: RuleLibraryContext, errors: string[]): void {
  if (a == null || typeof a !== 'object') {
    errors.push('Akcja: element nie jest obiektem.');
    return;
  }
  const act = a as Record<string, unknown>;
  const type = act.type;
  if (typeof type !== 'string' || !ACTION_TYPES.has(type)) {
    errors.push(`Akcja: nieznany typ „${String(type)}".`);
    return;
  }
  const code = typeof act.code === 'string' ? act.code : '';
  switch (type) {
    case 'min_level': {
      const aspect = typeof act.aspect === 'string' ? act.aspect : '';
      if (!ctx.aspectCodes.has(aspect)) {
        errors.push(`Akcja min_level: nieistniejący obszar „${aspect}".`);
        return;
      }
      const level = act.level;
      const defined = ctx.levelsByAspect.get(aspect);
      if (typeof level !== 'number' || !defined || !defined.has(level))
        errors.push(`Akcja min_level: poziom ${String(level)} spoza zakresu obszaru „${aspect}".`);
      break;
    }
    case 'multiplier':
      if (!ctx.multiplierCodes.has(code))
        errors.push(`Akcja multiplier: nieistniejący kod „${code}".`);
      break;
    case 'suggest_module':
      if (!ctx.moduleCodes.has(code))
        errors.push(`Akcja suggest_module: nieistniejący kod „${code}".`);
      break;
    case 'suggest_integration':
      if (!ctx.integrationCodes.has(code))
        errors.push(`Akcja suggest_integration: nieistniejący kod „${code}".`);
      break;
    case 'cost_item': {
      if (!ctx.costItemCodes.has(code))
        errors.push(`Akcja cost_item: nieistniejący kod „${code}".`);
      if (act.qty_from !== undefined && !ctx.questionCodes.has(String(act.qty_from)))
        errors.push(
          `Akcja cost_item: qty_from „${String(act.qty_from)}" to nieistniejące pytanie.`,
        );
      break;
    }
    case 'recommend_archetype':
      if (!ctx.archetypeCodes.has(code))
        errors.push(`Akcja recommend_archetype: nieistniejący archetyp „${code}".`);
      break;
    case 'archetype_warning':
      if (typeof act.message !== 'string' || act.message.trim() === '')
        errors.push('Akcja archetype_warning: wymagana treść „message".');
      break;
  }
}

/** Główny walidator. conditionJson/actionsJson jako STRINGI — walidator odpowiada też za
 *  poprawność JSON i kształt (tablica akcji, niepusta). */
export function validateRule(
  conditionJson: string,
  actionsJson: string,
  ctx: RuleLibraryContext,
): string[] {
  const errors: string[] = [];

  let condition: unknown;
  try {
    condition = JSON.parse(conditionJson);
  } catch {
    errors.push('condition_json nie jest poprawnym JSON-em.');
  }
  let actions: unknown;
  try {
    actions = JSON.parse(actionsJson);
  } catch {
    errors.push('actions_json nie jest poprawnym JSON-em.');
  }

  if (condition !== undefined) walkCondition(condition, ctx, errors);

  if (actions !== undefined) {
    if (!Array.isArray(actions)) {
      errors.push('actions_json musi być tablicą akcji.');
    } else if (actions.length === 0) {
      errors.push('Reguła bez akcji nie ma efektu — dodaj co najmniej jedną akcję.');
    } else {
      actions.forEach((a) => validateAction(a, ctx, errors));
    }
  }

  return errors;
}
