// Typy domenowe silnika wycen (System Wycen).
// Źródła: docs/estimation/02 (schemat), 03 (model obliczeniowy), 05 (reguły).
// Silnik jest CZYSTYM TS — bez React/DOM/D1. Dane wchodzą jako argumenty (inwariant 4).

// ── Odpowiedzi na pytania biznesowe ─────────────────────────────────────────

/** Wartość odpowiedzi; multiselect = tablica stringów. */
export type AnswerValue = string | number | boolean | string[];

/** Sentinel „nie wiem" (odwzorowuje answer_json = {"unknown":true} z DB). */
export interface UnknownAnswer {
  unknown: true;
}

export type Answer = AnswerValue | UnknownAnswer;

/** Odpowiedzi wyceny: brak klucza = pytanie bez odpowiedzi (≠ „nie wiem"). */
export type Answers = Record<string, Answer>;

export function isUnknown(a: Answer | undefined): a is UnknownAnswer {
  return typeof a === 'object' && a !== null && !Array.isArray(a) && 'unknown' in a;
}

// ── Reguły (05) ─────────────────────────────────────────────────────────────

export type ConditionOp =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'contains'
  | 'answered'
  | 'unknown';

/** Drzewo warunków: { all } | { any } | liść { q, op, val }. */
export type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { q: string; op: ConditionOp; val?: AnswerValue };

export type RuleAction =
  | { type: 'min_level'; aspect: string; level: number }
  | { type: 'multiplier'; code: string }
  | { type: 'suggest_module'; code: string }
  | { type: 'suggest_integration'; code: string }
  | { type: 'cost_item'; code: string; qty_from?: string }
  | { type: 'archetype_warning'; message: string }
  | { type: 'recommend_archetype'; code: string; reason?: string };

export interface Rule {
  id: number;
  name: string;
  priority: number;
  condition: Condition;
  actions: RuleAction[];
  /** Szablon uzasadnienia z placeholderami {question_code}. */
  reasonTemplate: string;
}

// ── Biblioteka (przekazywana do silnika; nie importuje D1) ───────────────────

export type Category = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type Risk = 'low' | 'medium' | 'high';

export interface LevelDef {
  level: number; // 0..4
  hoursMin: number;
  hoursMax: number;
  name?: string;
}

export interface AspectDef {
  code: string;
  category: Category;
  name: string;
  levels: LevelDef[];
}

export interface ArchetypeDefault {
  aspect: string;
  defaultLevel: number;
  isLocked: boolean;
}

export interface MultiplierDef {
  code: string;
  name: string;
  value: number; // 0.10 = +10%
}

// ── Parametry globalne (03) ─────────────────────────────────────────────────

export interface EngineParams {
  hourlyRate: number; // domyślnie 50
  multiplierCap: number; // domyślnie 0.40
  buffer: number; // domyślnie 0.10
  offerLowK: number; // domyślnie 0.20
  offerHighK: number; // domyślnie 0.30
  roundingPln: number; // domyślnie 100
  confidenceGreen: number; // domyślnie 80
  confidenceYellow: number; // domyślnie 60
}

/** Stawki per kategoria (D8); brak klucza ⇒ fallback do hourlyRate. */
export type CategoryRates = Partial<Record<Category, number>>;

// ── Wynik ewaluacji reguł ────────────────────────────────────────────────────

export interface AspectSuggestion {
  /** Poziom po ewaluacji reguł (max z domyślnego archetypu i reguł). */
  level: number;
  /** Obszar ukryty przez archetyp (is_locked). */
  locked: boolean;
  /** Uzasadnienia reguł, które podniosły poziom. */
  reasons: string[];
}

export interface CostItemSuggestion {
  code: string;
  qtyFrom?: string;
}

export interface ArchetypeRecommendation {
  code: string;
  reason?: string;
}

export interface EvaluateRulesInput {
  answers: Answers;
  archetypeDefaults: ArchetypeDefault[];
  rules: Rule[];
  /** Kody obszarów z biblioteki — do walidacji min_level (błędny kod → warning, skip). */
  knownAspectCodes: string[];
}

export interface RuleEvaluation {
  /** Sugerowany poziom per kod obszaru. */
  levels: Record<string, AspectSuggestion>;
  multipliers: string[]; // kody, deduplikowane
  suggestedModules: string[];
  suggestedIntegrations: string[];
  costItems: CostItemSuggestion[];
  warnings: string[]; // archetype_warning + akcje pominięte (błędny kod)
  recommendedArchetypes: ArchetypeRecommendation[];
}

// ── Wejście agregacji (03) ───────────────────────────────────────────────────

/** Obszar rozwiązany do godzin (poziom→widełki albo override). */
export interface ResolvedAspect {
  code: string;
  category: Category;
  hoursMin: number;
  hoursMax: number;
}

export type QuoteItem =
  | {
      type: 'module' | 'integration';
      code?: string;
      name: string;
      hoursMin: number;
      hoursMax: number;
      risk?: Risk;
    }
  | {
      type: 'cost';
      code?: string;
      name: string;
      amountPln?: number;
      qty?: number;
      unitPrice?: number;
    };

export interface AggregateInput {
  aspects: ResolvedAspect[];
  items: QuoteItem[];
  /** Aktywne mnożniki (już rozwiązane wartości; kolejność bez znaczenia). */
  multipliers: { code: string; value: number }[];
  params: EngineParams;
  categoryRates?: CategoryRates;
}

export interface MinMax {
  hoursMin: number;
  hoursMax: number;
}

export interface CategoryTotal {
  hoursMin: number;
  hoursMax: number;
  priceMin: number;
  priceMax: number;
}

export interface Totals {
  base: MinMax; // krok 1: obszary
  afterItems: MinMax; // krok 2: + moduły/integracje
  multiplierSum: number; // krok 3: Σ wartości, po capie
  afterMultipliers: MinMax;
  afterBuffer: MinMax; // krok 4
  price: { min: number; max: number }; // krok 5 (pełne wewnętrzne)
  offer: { min: number; max: number }; // krok 6 (zawężone)
  costs: number; // krok 7 (osobno, bez mnożników/bufora)
  byCategory: Record<string, CategoryTotal>;
  engineVersion: string;
}

// ── Confidence (03) ──────────────────────────────────────────────────────────

export interface ConfidenceInput {
  /** Odpowiedzi „nie wiem" z wagą pytania (unknown_weight). */
  unknowns: { code: string; weight: number }[];
  /** Ryzyko itemów (moduły/integracje). */
  itemRisks: Risk[];
  /** Migracja danych bez próbki/dostępu do źródła. */
  dataMigrationWithoutSample: boolean;
  /** Archetyp laravel/headless ORAZ discovery ≤ 1. */
  customArchetypeWithoutDiscovery: boolean;
}

export interface ConfidenceBreakdownEntry {
  reason: string;
  delta: number; // ujemny
}

export interface ConfidenceResult {
  score: number; // 0..100
  band: 'green' | 'yellow' | 'red';
  breakdown: ConfidenceBreakdownEntry[];
}

// ── Walidacja przed finalize (03 inwarianty 3–4) ─────────────────────────────

/** Obszar wyceny z punktu widzenia walidacji (suggested/chosen/override). */
export interface QuoteAspectValidation {
  code: string;
  suggestedLevel: number;
  chosenLevel: number;
  overrideHoursMin?: number;
  overrideHoursMax?: number;
  overrideReason?: string;
}

export interface FinalizeValidationInput {
  aspects: QuoteAspectValidation[];
  /** Suma godzin max obszarów + itemów module/integration (do wykrycia pustej wyceny). */
  totalHoursMax: number;
}

// ── computeQuote — pełny pipeline (f1b podgląd na żywo + f1c finalize) ────────

/** Biblioteka w formie gotowej dla silnika (hook UI / serwer transformują surowe wiersze D1). */
export interface LibraryData {
  aspects: { code: string; category: Category; name: string }[];
  levels: { aspectCode: string; level: number; hoursMin: number; hoursMax: number }[];
  archetypeDefaults: ArchetypeDefault[]; // dla WYBRANEGO archetypu
  rules: Rule[];
  modules: { code: string; name: string; hoursMin: number; hoursMax: number; risk: Risk }[];
  integrations: {
    code: string;
    name: string;
    platformMin: number | null;
    platformMax: number | null;
    customMin: number;
    customMax: number;
    risk: Risk;
  }[];
  multipliers: MultiplierDef[];
  /** Waga „nie wiem" per pytanie (Confidence). */
  questionWeights: Record<string, number>;
  params: EngineParams;
  categoryRates?: CategoryRates;
  /** Tryb integracji wybranego archetypu ('platform'|'custom') — wybór taryfy godzin. */
  integrationMode: 'platform' | 'custom';
}

/** Ręczne korekty warstwy walidacji (f1b: w stanie klienta; f1c snapshotuje). */
export interface ValidationOverrides {
  chosenLevels: Record<string, number>;
  overrideHours: Record<string, { min: number; max: number }>;
  levelReasons: Record<string, string>;
  disabledModules: string[];
  disabledIntegrations: string[];
  disabledMultipliers: string[];
  extraCostItems: { code: string; name: string; amountPln: number }[];
}

export interface AspectComputation {
  code: string;
  category: Category;
  name: string;
  suggestedLevel: number;
  chosenLevel: number;
  locked: boolean;
  hoursMin: number;
  hoursMax: number;
  reasons: string[];
}

export interface ComputeQuoteInput {
  answers: Answers;
  library: LibraryData;
  overrides?: Partial<ValidationOverrides>;
}

export interface QuoteComputation {
  aspects: AspectComputation[];
  activeModules: string[];
  activeIntegrations: string[];
  activeMultipliers: { code: string; name: string; value: number }[];
  costItems: CostItemSuggestion[];
  warnings: string[];
  recommendedArchetypes: ArchetypeRecommendation[];
  totals: Totals;
  confidence: ConfidenceResult;
}
