// Budowa dokumentów wyceny ze SNAPSHOTU (f2a) — CZYSTY TS, zero jspdf/React.
// Źródłem jest WYŁĄCZNIE snapshot z D1 (est_quote_aspects/items/multipliers + totals_json),
// nigdy live biblioteka — inaczej edycja widełek zmieniałaby treść wysłanej oferty (inwariant 3).
//
// Dwa dokumenty, dwie publiczności:
//   buildOffer        → KLIENT. Widełki ofertowe, zakres słowami, zero godzin i zero Confidence.
//   buildDecisionCard → MY / załącznik. Decyzje, uzasadnienia, ryzyka, alerty, Confidence.
// Podział jest tu, w jednym pure module — render (PDF/markdown) tylko go rysuje.

/**
 * Pola, które NIE MOGĄ opuścić panelu w ofercie dla klienta. Lista jest jawna i pokryta testem
 * (documents.test.ts) — nowe pole wewnętrzne dopisz TU, a test złapie regresję.
 * Powód nie jest kosmetyczny: pełne widełki i godziny to nasza pozycja negocjacyjna,
 * a Confidence to informacja o naszej niepewności — klient dostaje cenę, nie nasz warsztat.
 */
export const INTERNAL_ONLY_FIELDS = [
  'price', // pełne widełki wewnętrzne
  'afterBuffer', // godziny po buforze
  'base', // godziny bazowe
  'multiplierSum', // mnożniki ryzyka
  'confidence', // wskaźnik pewności
  'confidenceBreakdown', // co obniżyło pewność
  'hours_min', // godziny per obszar/pozycja
  'hours_max',
  'suggested_level', // sugestia silnika (klient widzi tylko wybór)
  'rule_reasons_json', // uzasadnienia reguł = Karta decyzji, nie oferta
  'engine_version',
] as const;

// ── Kształt snapshotu (wiersze z D1 przez GET /quote?id=) ────────────────────

export interface SnapshotAspect {
  aspect_code: string;
  aspect_name: string;
  category: string;
  suggested_level: number;
  chosen_level: number;
  hours_min: number;
  hours_max: number;
  override_reason: string | null;
  rule_reasons_json: string | null;
  level_name: string | null;
  level_description: string | null;
}

export interface SnapshotItem {
  item_type: string; // 'module' | 'integration' | 'cost'
  ref_code: string | null;
  name: string;
  hours_min: number | null;
  hours_max: number | null;
  amount_pln: number | null;
  unit: string | null;
  unit_price: number | null;
  notes: string | null;
}

export interface QuoteSnapshot {
  quote: {
    id: number;
    name: string;
    client_name: string | null;
    status: string;
    archetype_code: string;
    archetype_recommended: string | null;
    archetype_reason: string | null;
    confidence: number | null;
    created_at: string;
    engine_version: string;
  };
  aspects: SnapshotAspect[];
  items: SnapshotItem[];
  multipliers: { code: string; name: string; value: number; source: string }[];
  totals: {
    offer: { min: number; max: number };
    price: { min: number; max: number };
    afterBuffer: { hoursMin: number; hoursMax: number };
    base: { hoursMin: number; hoursMax: number };
    costs: number;
    multiplierSum: number;
  } | null;
  confidenceBreakdown: { reason: string; delta: number }[] | null;
  warnings: string[];
  /** Termin ważności oferty w dniach (est_params.offer_validity_days). */
  validityDays: number;
  /** Warunki „co w cenie" (est_params.offer_terms). Treść = dane, nie kod. */
  terms: string[];
}

// ── Oferta (klient) ──────────────────────────────────────────────────────────

export interface OfferScopeRow {
  title: string;
  level: string | null;
  description: string | null;
}
export interface OfferCostRow {
  name: string;
  amountPln: number;
  note: string | null;
  /** Pozycja bez wyceny — pokazujemy JAWNIE, żeby nie zniknęła z oferty (retro f1c). */
  toBeQuoted: boolean;
}
export interface Offer {
  meta: {
    quoteNumber: number;
    projectName: string;
    clientName: string | null;
    issuedAt: string;
    validUntil: string;
    validityDays: number;
  };
  priceRange: { min: number; max: number };
  scope: OfferScopeRow[];
  modules: string[];
  integrations: string[];
  costs: OfferCostRow[];
  costsTotal: number;
  excluded: { title: string; reason: string | null }[];
  terms: string[];
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** created_at z D1 („YYYY-MM-DD HH:MM:SS") → Date; fallback na dziś przy śmieciach. */
function parseCreated(raw: string): Date {
  const d = new Date(raw.replace(' ', 'T') + (raw.includes('Z') ? '' : 'Z'));
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

/** Obszary spoza zakresu: wybrano MNIEJ, niż sugerował silnik (D-plan F2 krok 3). */
const isExcluded = (a: SnapshotAspect) => a.chosen_level < a.suggested_level;

export function buildOffer(s: QuoteSnapshot): Offer {
  const issued = parseCreated(s.quote.created_at);
  const valid = new Date(issued);
  valid.setDate(valid.getDate() + s.validityDays);

  const costs: OfferCostRow[] = s.items
    .filter((i) => i.item_type === 'cost')
    .map((i) => ({
      name: i.name,
      amountPln: i.amount_pln ?? 0,
      note: i.notes,
      toBeQuoted: (i.amount_pln ?? 0) === 0,
    }));

  return {
    meta: {
      quoteNumber: s.quote.id,
      projectName: s.quote.name,
      clientName: s.quote.client_name,
      issuedAt: isoDate(issued),
      validUntil: isoDate(valid),
      validityDays: s.validityDays,
    },
    // WYŁĄCZNIE widełki ofertowe. `price` (pełne) nie ma prawa się tu pojawić.
    priceRange: { min: s.totals?.offer.min ?? 0, max: s.totals?.offer.max ?? 0 },
    // Zakres = to, co realnie robimy (godziny > 0), opisane słowami z poziomu.
    scope: s.aspects
      .filter((a) => a.hours_max > 0)
      .map((a) => ({
        title: a.aspect_name,
        level: a.level_name,
        description: a.level_description,
      })),
    modules: s.items.filter((i) => i.item_type === 'module').map((i) => i.name),
    integrations: s.items.filter((i) => i.item_type === 'integration').map((i) => i.name),
    costs,
    costsTotal: costs.reduce((sum, c) => sum + c.amountPln, 0),
    excluded: s.aspects
      .filter(isExcluded)
      .map((a) => ({ title: a.aspect_name, reason: a.override_reason })),
    terms: s.terms,
  };
}

// ── Karta decyzji technicznych (wewnętrzna / załącznik) ──────────────────────

export interface DecisionRow {
  title: string;
  code: string;
  category: string;
  level: number;
  levelName: string | null;
  levelDescription: string | null;
  reasons: string[];
  overrideReason: string | null;
}
export interface DecisionCard {
  meta: { quoteNumber: number; projectName: string; clientName: string | null; issuedAt: string };
  platform: {
    recommended: string | null;
    chosen: string;
    reason: string | null;
    againstRecommendation: boolean;
  };
  decisions: DecisionRow[];
  overrides: { title: string; suggested: number; chosen: number; reason: string | null }[];
  alerts: string[];
  outOfScope: { title: string; reason: string | null }[];
  confidence: { score: number | null; breakdown: { reason: string; delta: number }[] | null };
  risks: { name: string; value: number }[];
}

const parseReasons = (json: string | null): string[] => {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? (v as string[]) : [];
  } catch {
    return [];
  }
};

export function buildDecisionCard(s: QuoteSnapshot): DecisionCard {
  const issued = parseCreated(s.quote.created_at);
  return {
    meta: {
      quoteNumber: s.quote.id,
      projectName: s.quote.name,
      clientName: s.quote.client_name,
      issuedAt: isoDate(issued),
    },
    platform: {
      recommended: s.quote.archetype_recommended,
      chosen: s.quote.archetype_code,
      reason: s.quote.archetype_reason,
      againstRecommendation:
        !!s.quote.archetype_recommended && s.quote.archetype_recommended !== s.quote.archetype_code,
    },
    // Decyzje = obszary, które realnie robimy, z uzasadnieniem reguły która podniosła poziom.
    decisions: s.aspects
      .filter((a) => a.hours_max > 0)
      .map((a) => ({
        title: a.aspect_name,
        code: a.aspect_code,
        category: a.category,
        level: a.chosen_level,
        levelName: a.level_name,
        levelDescription: a.level_description,
        reasons: parseReasons(a.rule_reasons_json),
        overrideReason: a.override_reason,
      })),
    // Ręczne odstępstwa od sugestii silnika — w OBIE strony (podniesienie i obniżenie).
    overrides: s.aspects
      .filter((a) => a.chosen_level !== a.suggested_level)
      .map((a) => ({
        title: a.aspect_name,
        suggested: a.suggested_level,
        chosen: a.chosen_level,
        reason: a.override_reason,
      })),
    alerts: s.warnings,
    outOfScope: s.aspects
      .filter(isExcluded)
      .map((a) => ({ title: a.aspect_name, reason: a.override_reason })),
    confidence: { score: s.quote.confidence, breakdown: s.confidenceBreakdown },
    risks: s.multipliers.map((m) => ({ name: m.name, value: m.value })),
  };
}
