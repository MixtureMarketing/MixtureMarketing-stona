// Eksport/import biblioteki wiedzy (f2c-2b) — CZYSTY TS. Paczka = pełny zrzut tabel est_*
// (też nieaktywne), deterministyczna kolejność. Import: diff (added/changed/removed) + walidacja.
//
// schema_version: KLUCZ DOPASOWANIA reguł to `id` (nie mają `code`). Ogranicza przenośność między
// bazami — id nie jest stabilne cross-DB. v2 wprowadzi stabilny klucz reguł (hash/slug) i to jest
// koncern „paczek wiedzy" F4. Dla backup/restore i round-tripu TEJ SAMEJ bazy id wystarcza.

import { validateLibraryCreate } from './libraryEdit';
import { validateRule, buildRuleContext, type RuleLibraryContext } from './ruleValidation';

export const SCHEMA_VERSION = 1;

export type EntityName =
  | 'aspects'
  | 'levels'
  | 'archetypes'
  | 'archetype_defaults'
  | 'questions'
  | 'rules'
  | 'modules'
  | 'integrations'
  | 'multipliers'
  | 'cost_item_types'
  | 'params'
  | 'category_rates';

/** Klucz naturalny per encja (dopasowanie przy imporcie). Reguły po `id` — patrz nota wyżej. */
export const KEY_FIELDS: Record<EntityName, readonly string[]> = {
  aspects: ['code'],
  levels: ['aspect_code', 'level'],
  archetypes: ['code'],
  archetype_defaults: ['archetype_code', 'aspect_code'],
  questions: ['code'],
  rules: ['id'],
  modules: ['code'],
  integrations: ['code'],
  multipliers: ['code'],
  cost_item_types: ['code'],
  params: ['key'],
  category_rates: ['category'],
};

export const ENTITIES = Object.keys(KEY_FIELDS) as EntityName[];

export type Row = Record<string, unknown>;
export type LibraryPackTables = Record<EntityName, Row[]>;

export interface LibraryPack extends LibraryPackTables {
  schema_version: number;
  exported_at: string;
  counts: Record<EntityName, number>;
}

/** Klucz wiersza jako string (deterministyczny) — do map/porównań i raportu.
 *  Pojedyncze pole → goła wartość (czytelne: „wishlist"); złożone → JSON (np. `["frontend",2]`). */
export function rowKey(entity: EntityName, row: Row): string {
  const fields = KEY_FIELDS[entity];
  if (fields.length === 1) return String(row[fields[0]]);
  return JSON.stringify(fields.map((f) => row[f]));
}

/** Kanoniczna postać wiersza (posortowane klucze) — do wykrywania zmiany. */
function canonical(row: Row): string {
  const sorted: Row = {};
  for (const k of Object.keys(row).sort()) sorted[k] = row[k];
  return JSON.stringify(sorted);
}

function sortRows(entity: EntityName, rows: Row[]): Row[] {
  return [...rows].sort((a, b) => (rowKey(entity, a) < rowKey(entity, b) ? -1 : 1));
}

/** Buduje deterministyczną paczkę z surowych tabel (już zrzutowanych na kolumny eksportu). */
export function buildExport(tables: LibraryPackTables): LibraryPack {
  const counts = {} as Record<EntityName, number>;
  const sorted = {} as LibraryPackTables;
  for (const e of ENTITIES) {
    const rows = tables[e] ?? [];
    sorted[e] = sortRows(e, rows);
    counts[e] = rows.length;
  }
  return {
    schema_version: SCHEMA_VERSION,
    exported_at: new Date().toISOString(),
    counts,
    ...sorted,
  };
}

// ── Walidacja importu + ostrzeżenia (WS2) ────────────────────────────────────

/** Stan docelowy = current ⊕ incoming (upsert po kluczu; NO-DELETE — wiersze current przeżywają). */
function mergeState(current: LibraryPackTables, incoming: LibraryPackTables): LibraryPackTables {
  const out = {} as LibraryPackTables;
  for (const e of ENTITIES) {
    const m = new Map((current[e] ?? []).map((r) => [rowKey(e, r), r]));
    for (const r of incoming[e] ?? []) m.set(rowKey(e, r), r);
    out[e] = [...m.values()];
  }
  return out;
}

const CATEGORY_AG = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G']);

/** Kontekst spójności reguł ze stanu docelowego. activeOnly=true ⇒ tylko is_active=1 (do ostrzeżeń). */
function buildCtx(target: LibraryPackTables, activeOnly: boolean): RuleLibraryContext {
  const act = (rows: Row[]) => (activeOnly ? rows.filter((r) => r.is_active === 1) : rows);
  const activeAspects = new Set(act(target.aspects).map((a) => String(a.code)));
  const levels = activeOnly
    ? target.levels.filter((l) => activeAspects.has(String(l.aspect_code)))
    : target.levels;
  const codes = (rows: Row[]) => act(rows).map((r) => ({ code: String(r.code) }));
  return buildRuleContext({
    aspects: codes(target.aspects),
    levels: levels.map((l) => ({ aspect_code: String(l.aspect_code), level: Number(l.level) })),
    modules: codes(target.modules),
    integrations: codes(target.integrations),
    multipliers: codes(target.multipliers),
    costItemTypes: codes(target.cost_item_types),
    questions: codes(target.questions),
    archetypes: codes(target.archetypes),
  });
}

/** min≤max + ściśle rosnące poziomy per obszar (na wierszach z paczki). */
function checkLevels(levels: Row[]): string[] {
  const errors: string[] = [];
  const byAspect = new Map<string, Row[]>();
  for (const l of levels) {
    const a = String(l.aspect_code);
    if (!byAspect.has(a)) byAspect.set(a, []);
    byAspect.get(a)!.push(l);
    if (Number(l.hours_min) > Number(l.hours_max))
      errors.push(`Poziom ${a}/${l.level}: min > maks.`);
  }
  for (const [a, rows] of byAspect) {
    const sorted = [...rows].sort((x, y) => Number(x.level) - Number(y.level));
    for (let i = 1; i < sorted.length; i++) {
      if (!(Number(sorted[i].hours_min) > Number(sorted[i - 1].hours_min)))
        errors.push(
          `Poziomy ${a}: hours_min nie rośnie ściśle (${sorted[i - 1].level}→${sorted[i].level}).`,
        );
      if (!(Number(sorted[i].hours_max) > Number(sorted[i - 1].hours_max)))
        errors.push(
          `Poziomy ${a}: hours_max nie rośnie ściśle (${sorted[i - 1].level}→${sorted[i].level}).`,
        );
    }
  }
  return errors;
}

/** BŁĘDY blokujące apply: pola niepoprawne + reguła wskazuje kod NIEOBECNY w stanie docelowym. */
export function validateImport(incoming: LibraryPackTables, current: LibraryPackTables): string[] {
  const errors: string[] = [];
  const target = mergeState(current, incoming);
  const ctxAll = buildCtx(target, false);

  for (const a of incoming.aspects ?? [])
    if (!CATEGORY_AG.has(String(a.category)))
      errors.push(`Obszar „${a.code}": kategoria spoza A..G.`);

  errors.push(...checkLevels(incoming.levels ?? []));

  for (const m of incoming.modules ?? [])
    errors.push(
      ...validateLibraryCreate({ entity: 'module', code: m.code, row: m }).map(
        (e) => `Moduł „${m.code}": ${e}`,
      ),
    );
  for (const i of incoming.integrations ?? [])
    errors.push(
      ...validateLibraryCreate({ entity: 'integration', code: i.code, row: i }).map(
        (e) => `Integracja „${i.code}": ${e}`,
      ),
    );

  for (const r of incoming.rules ?? [])
    errors.push(
      ...validateRule(String(r.condition_json), String(r.actions_json), ctxAll).map(
        (e) => `Reguła #${r.id}: ${e}`,
      ),
    );

  return errors;
}

/** OSTRZEŻENIA (nie blokują): żywa reguła w stanie docelowym wskazuje kod OBECNY, ale is_active=0.
 *  Cichy no-op przez plik — ta sama choroba, którą wybiliśmy w edytorze. */
export function computeImportWarnings(
  incoming: LibraryPackTables,
  current: LibraryPackTables,
): string[] {
  const target = mergeState(current, incoming);
  const ctxAll = buildCtx(target, false);
  const ctxActive = buildCtx(target, true);
  const warnings: string[] = [];
  for (const r of target.rules ?? []) {
    if (r.is_active !== 1) continue; // martwa reguła nie no-opuje
    const activeErrs = validateRule(String(r.condition_json), String(r.actions_json), ctxActive);
    const allErrs = validateRule(String(r.condition_json), String(r.actions_json), ctxAll);
    for (const e of activeErrs.filter((x) => !allErrs.includes(x)))
      warnings.push(
        `Reguła #${r.id} („${r.name}"): ${e} — kod gaszony/nieaktywny, reguła nie zadziała.`,
      );
  }
  return warnings;
}

export interface EntityDiff {
  added: string[]; // klucze w paczce, brak w DB
  changed: string[]; // klucze wspólne, inne dane
  removed: string[]; // klucze w DB, brak w paczce (RAPORTOWANE, nie kasowane)
  unchanged: number;
}

/** Diff DB (current) vs paczka (incoming) per encja. Klucz = KEY_FIELDS. */
export function computeLibraryDiff(
  current: LibraryPackTables,
  incoming: LibraryPackTables,
): Record<EntityName, EntityDiff> {
  const out = {} as Record<EntityName, EntityDiff>;
  for (const e of ENTITIES) {
    const cur = new Map((current[e] ?? []).map((r) => [rowKey(e, r), r]));
    const inc = new Map((incoming[e] ?? []).map((r) => [rowKey(e, r), r]));
    const added: string[] = [];
    const changed: string[] = [];
    const removed: string[] = [];
    let unchanged = 0;
    for (const [k, r] of inc) {
      const c = cur.get(k);
      if (!c) added.push(k);
      else if (canonical(c) !== canonical(r)) changed.push(k);
      else unchanged++;
    }
    for (const k of cur.keys()) if (!inc.has(k)) removed.push(k);
    out[e] = {
      added: added.sort(),
      changed: changed.sort(),
      removed: removed.sort(),
      unchanged,
    };
  }
  return out;
}
