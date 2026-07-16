// Wspólna warstwa D1 dla eksportu/importu biblioteki (f2c-2b). BEZ onRequest* → NIE jest trasą Pages.
// Odczyt: rzutowanie tabel est_* na kolumny paczki (natural key, bez surrogate id poza regułami).
// Upsert: atomowy batch w kolejności zależności FK; levels/defaults rozwiązują id po code. NO-DELETE.
import type { LibraryPackTables, Row } from '../../../../lib/estimation/libraryPack';

/** Odczyt wszystkich tabel biblioteki w kształcie paczki (te same kolumny co eksport). */
export async function readLibraryTables(DB: D1Database): Promise<LibraryPackTables> {
  const all = (sql: string) => DB.prepare(sql).all();
  const [
    aspects,
    levels,
    archetypes,
    archetype_defaults,
    questions,
    rules,
    modules,
    integrations,
    multipliers,
    cost_item_types,
    params,
    category_rates,
  ] = await Promise.all([
    all(
      `SELECT code, name, category, description, client_name, sort_order, is_active FROM est_aspects`,
    ),
    all(`SELECT a.code AS aspect_code, l.level, l.name, l.description, l.client_description, l.hours_min, l.hours_max
         FROM est_levels l JOIN est_aspects a ON a.id = l.aspect_id`),
    all(`SELECT code, name, description, integration_mode, is_active FROM est_archetypes`),
    all(`SELECT ar.code AS archetype_code, asp.code AS aspect_code, d.default_level, d.is_locked
         FROM est_archetype_defaults d JOIN est_archetypes ar ON ar.id = d.archetype_id JOIN est_aspects asp ON asp.id = d.aspect_id`),
    all(
      `SELECT code, text, help_text, answer_type, options_json, allow_unknown, visibility, unknown_weight, visible_if_json, question_group, sort_order, is_active FROM est_questions`,
    ),
    all(
      `SELECT id, name, rule_type, condition_json, actions_json, reason_template, priority, is_active FROM est_rules`,
    ),
    all(
      `SELECT code, name, description, includes, excludes, hours_min, hours_max, risk, archetypes_json, goals_json, is_active FROM est_modules`,
    ),
    all(
      `SELECT code, name, category, hours_platform_min, hours_platform_max, hours_custom_min, hours_custom_max, risk, requirements, notes, is_active FROM est_integrations`,
    ),
    all(`SELECT code, name, value, description, is_active FROM est_multipliers`),
    all(`SELECT code, name, unit, unit_price, is_active FROM est_cost_item_types`),
    all(`SELECT key, value, description FROM est_params`),
    all(`SELECT category, hourly_rate FROM est_category_rates`),
  ]);
  const r = (x: D1Result) => (x.results ?? []) as Row[];
  return {
    aspects: r(aspects),
    levels: r(levels),
    archetypes: r(archetypes),
    archetype_defaults: r(archetype_defaults),
    questions: r(questions),
    rules: r(rules),
    modules: r(modules),
    integrations: r(integrations),
    multipliers: r(multipliers),
    cost_item_types: r(cost_item_types),
    params: r(params),
    category_rates: r(category_rates),
  };
}

/** Kolumny danych (poza kluczem) per encja — do budowy UPSERT. Muszą zgadzać się z odczytem. */
const UPSERT: Record<string, { table: string; keyCols: string[]; dataCols: string[] }> = {
  aspects: {
    table: 'est_aspects',
    keyCols: ['code'],
    dataCols: ['name', 'category', 'description', 'client_name', 'sort_order', 'is_active'],
  },
  archetypes: {
    table: 'est_archetypes',
    keyCols: ['code'],
    dataCols: ['name', 'description', 'integration_mode', 'is_active'],
  },
  questions: {
    table: 'est_questions',
    keyCols: ['code'],
    dataCols: [
      'text',
      'help_text',
      'answer_type',
      'options_json',
      'allow_unknown',
      'visibility',
      'unknown_weight',
      'visible_if_json',
      'question_group',
      'sort_order',
      'is_active',
    ],
  },
  modules: {
    table: 'est_modules',
    keyCols: ['code'],
    dataCols: [
      'name',
      'description',
      'includes',
      'excludes',
      'hours_min',
      'hours_max',
      'risk',
      'archetypes_json',
      'goals_json',
      'is_active',
    ],
  },
  integrations: {
    table: 'est_integrations',
    keyCols: ['code'],
    dataCols: [
      'name',
      'category',
      'hours_platform_min',
      'hours_platform_max',
      'hours_custom_min',
      'hours_custom_max',
      'risk',
      'requirements',
      'notes',
      'is_active',
    ],
  },
  multipliers: {
    table: 'est_multipliers',
    keyCols: ['code'],
    dataCols: ['name', 'value', 'description', 'is_active'],
  },
  cost_item_types: {
    table: 'est_cost_item_types',
    keyCols: ['code'],
    dataCols: ['name', 'unit', 'unit_price', 'is_active'],
  },
  params: { table: 'est_params', keyCols: ['key'], dataCols: ['value', 'description'] },
  category_rates: { table: 'est_category_rates', keyCols: ['category'], dataCols: ['hourly_rate'] },
  rules: {
    table: 'est_rules',
    keyCols: ['id'],
    dataCols: [
      'name',
      'rule_type',
      'condition_json',
      'actions_json',
      'reason_template',
      'priority',
      'is_active',
    ],
  },
};

/** Prosty UPSERT dla encji z kluczem kolumnowym (code/key/category/id reguł). */
function simpleUpsert(DB: D1Database, entity: string, row: Row): D1PreparedStatement {
  const { table, keyCols, dataCols } = UPSERT[entity];
  const cols = [...keyCols, ...dataCols];
  const placeholders = cols.map(() => '?').join(', ');
  const set = dataCols.map((c) => `${c} = excluded.${c}`).join(', ');
  const sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})
               ON CONFLICT(${keyCols.join(', ')}) DO UPDATE SET ${set}`;
  return DB.prepare(sql).bind(...cols.map((c) => row[c] ?? null));
}

/** Buduje ATOMOWY batch upsertów w kolejności zależności FK. Levels/defaults rozwiązują id po code.
 *  NO-DELETE: wiersze w DB, których nie ma w paczce, zostają nietknięte. est_quote* NIGDY nie dotykane. */
export async function buildUpsertBatch(
  DB: D1Database,
  incoming: LibraryPackTables,
): Promise<D1PreparedStatement[]> {
  const stmts: D1PreparedStatement[] = [];

  // 1. aspects (fundament dla levels/defaults)
  for (const row of incoming.aspects ?? []) stmts.push(simpleUpsert(DB, 'aspects', row));

  // mapy id po code (po upsercie aspects/archetypes muszą istnieć — dlatego czytamy PO zbudowaniu?
  // nie: czytamy BIEŻĄCE + zakładamy, że nowe aspekty z paczki są w tym samym batchu wcześniej.
  // D1 batch to transakcja sekwencyjna — INSERT aspektów wykona się przed SELECT? NIE, batch nie
  // przeplata z odczytem. Dlatego id rozwiązujemy z UNII: bieżące id + (dla nowych) przez podzapytanie.)
  // Levels: UPSERT z aspect_id przez podzapytanie SELECT id FROM est_aspects WHERE code=? (działa,
  // bo aspekt albo już był, albo został wstawiony wcześniej w tym samym batchu/transakcji).
  for (const l of incoming.levels ?? []) {
    stmts.push(
      DB.prepare(
        `INSERT INTO est_levels (aspect_id, level, name, description, client_description, hours_min, hours_max)
         VALUES ((SELECT id FROM est_aspects WHERE code = ?), ?, ?, ?, ?, ?, ?)
         ON CONFLICT(aspect_id, level) DO UPDATE SET
           name = excluded.name, description = excluded.description,
           client_description = excluded.client_description,
           hours_min = excluded.hours_min, hours_max = excluded.hours_max`,
      ).bind(
        l.aspect_code,
        l.level,
        l.name ?? null,
        l.description ?? null,
        l.client_description ?? null,
        l.hours_min,
        l.hours_max,
      ),
    );
  }

  // 2. archetypes → archetype_defaults
  for (const row of incoming.archetypes ?? []) stmts.push(simpleUpsert(DB, 'archetypes', row));
  for (const d of incoming.archetype_defaults ?? []) {
    stmts.push(
      DB.prepare(
        `INSERT INTO est_archetype_defaults (archetype_id, aspect_id, default_level, is_locked)
         VALUES ((SELECT id FROM est_archetypes WHERE code = ?), (SELECT id FROM est_aspects WHERE code = ?), ?, ?)
         ON CONFLICT(archetype_id, aspect_id) DO UPDATE SET
           default_level = excluded.default_level, is_locked = excluded.is_locked`,
      ).bind(d.archetype_code, d.aspect_code, d.default_level, d.is_locked ?? 0),
    );
  }

  // 3. reszta encji z kluczem kolumnowym
  for (const entity of [
    'questions',
    'rules',
    'modules',
    'integrations',
    'multipliers',
    'cost_item_types',
    'params',
    'category_rates',
  ] as const)
    for (const row of incoming[entity] ?? []) stmts.push(simpleUpsert(DB, entity, row));

  return stmts;
}
