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

/** D26: sentinel „nie dotyczy" (answer_json = {"not_applicable":true}). PEŁNOPRAWNA odpowiedź:
 *  zero kary w Confidence, żadna reguła nie matchuje (poza jawnym operatorem not_applicable). */
export interface NotApplicableAnswer {
  not_applicable: true;
}

export type Answer = AnswerValue | UnknownAnswer | NotApplicableAnswer;

/** Odpowiedzi wyceny: brak klucza = pytanie bez odpowiedzi (≠ „nie wiem" ≠ „nie dotyczy"). */
export type Answers = Record<string, Answer>;

export function isUnknown(a: Answer | undefined): a is UnknownAnswer {
  return typeof a === 'object' && a !== null && !Array.isArray(a) && 'unknown' in a;
}

/** D26: „nie dotyczy" — odpowiedź udzielona, ale pytanie nie ma zastosowania w tym projekcie. */
export function isNotApplicable(a: Answer | undefined): a is NotApplicableAnswer {
  return typeof a === 'object' && a !== null && !Array.isArray(a) && 'not_applicable' in a;
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
  | 'unknown'
  /** D26: jedyny operator, który matchuje odpowiedź „nie dotyczy". */
  | 'not_applicable';

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
  /** D23: próg kompletności (udział odpowiedzianych widocznych pytań); poniżej = „szacunek wstępny". */
  completenessThreshold: number; // domyślnie 0.60
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
      unit?: string;
      unitPrice?: number;
      /** Doprecyzowanie formuły do pokazania w ofercie (np. „150 km w jedną stronę × 2"). */
      note?: string;
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
  /** D23: widoczne pytania „nie wiem" LUB nieodpowiedziane (waga = unknown_weight);
   *  `label` = czytelna treść pytania do breakdownu (fix 4a).
   *  `said` rozróżnia powód w breakdownie: jawne „nie wiem" vs brak odpowiedzi (kara ta sama). */
  unknowns: { code: string; weight: number; label?: string; said?: 'unknown' | 'missing' }[];
  /** Pozycje ryzyka (moduły/integracje) z nazwą do breakdownu (fix 4a). */
  items: { name: string; risk: Risk }[];
  /** Migracja danych bez próbki/dostępu do źródła. */
  dataMigrationWithoutSample: boolean;
  /** Archetyp laravel/headless ORAZ discovery ≤ 1. */
  customArchetypeWithoutDiscovery: boolean;
  /** Konfigurator w zakresie, a klient NIE ma spisanej macierzy zależności opcji (S2).
   *  Wzorzec jak dataMigrationWithoutSample: brak źródła prawdy = zakres nieokreślony. */
  configuratorWithoutMatrix: boolean;
  /** D23: poniżej progu kompletności (udział odpowiedzianych widocznych pytań). */
  belowCompleteness: boolean;
}

export interface ConfidenceBreakdownEntry {
  reason: string;
  delta: number; // ujemny
}

export interface ConfidenceResult {
  score: number; // 0..100
  band: 'green' | 'yellow' | 'red';
  breakdown: ConfidenceBreakdownEntry[];
  /** D23: true = poniżej progu kompletności → etykieta „szacunek wstępny". */
  belowCompleteness: boolean;
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
  /** name/description: treść dla dokumentów (oferta opisuje zakres słowami, nie godzinami).
   *  Snapshotowane przy finalize (migracja 0005) — inwariant 3 dotyczy też tekstów. */
  levels: {
    aspectCode: string;
    level: number;
    hoursMin: number;
    hoursMax: number;
    name?: string | null;
    description?: string | null;
  }[];
  archetypeDefaults: ArchetypeDefault[]; // dla WYBRANEGO archetypu
  rules: Rule[];
  /** archetypes/goals: null = bez ograniczenia; lista = tylko dla wskazanych (D24).
   *  Filtr (przecięcie archetyp ∩ cel) stosuje buildLibraryData — tu pola informacyjne. */
  modules: {
    code: string;
    name: string;
    hoursMin: number;
    hoursMax: number;
    risk: Risk;
    archetypes?: string[] | null;
    goals?: string[] | null;
  }[];
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
  /** Pytania: waga „nie wiem", warunek widoczności (D23 kompletność), etykieta (breakdown). */
  questions: { code: string; unknownWeight: number; visibleIf: string | null; label: string }[];
  /** Typy pozycji kosztowych (D14) — źródło stawek dla akcji reguł `cost_item` (np. dojazd zł/km). */
  costItemTypes: { code: string; name: string; unit: string | null; unitPrice: number | null }[];
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
  /** Ręczna kwota pozycji kosztowej z reguły (klucz = kod typu kosztu). Dla pozycji, których
   *  silnik nie umie wycenić (brak stawki/ilości) — np. „usługa zewnętrzna". 0 nie blokuje
   *  finalize: pozycja z notatką „do wyceny ręcznej" i tak wchodzi do snapshotu. */
  costAmounts: Record<string, number>;
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
  /** Nazwa i opis WYBRANEGO poziomu (f2a) — treść zakresu w ofercie. Undefined, gdy poziom
   *  nie ma wpisu w bibliotece (np. override na poziom bez definicji). */
  levelName?: string;
  levelDescription?: string;
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
  /** Rozwiązane pozycje (moduł/integracja/koszt) z nazwami i godzinami — źródło snapshotu
   *  est_quote_items przy finalize (f1c). Te same wartości, które trafiają do agregacji. */
  items: QuoteItem[];
  costItems: CostItemSuggestion[];
  warnings: string[];
  recommendedArchetypes: ArchetypeRecommendation[];
  totals: Totals;
  confidence: ConfidenceResult;
}
