// Warstwa D1 dla publicznego kalkulatora (f4a). BEZ onRequest* → NIE jest trasą Pages.
// Ładuje surowe wiersze biblioteki w kształcie RawLibrary — TE SAME zapytania co quote-finalize
// (is_active=1, JOIN-y ID→code), więc publiczny compute jest parytetem admina. Cała logika
// wyceny jest CZYSTA (lib/estimation/publicQuote); tu wyłącznie odczyt bazy.
import type { RawLibrary } from '../../../lib/estimation/toLibraryData';
import type { PublicQuestionDef } from '../../../lib/estimation/publicQuote';

/** Definicje pytań publicznych (kod + typ) do walidacji odpowiedzi POST (kontrakt §3). */
export async function loadPublicQuestionDefs(DB: D1Database): Promise<PublicQuestionDef[]> {
  const res = await DB.prepare(
    `SELECT code, answer_type FROM est_questions WHERE visibility = 'public' AND is_active = 1`,
  ).all();
  return (res.results ?? []) as PublicQuestionDef[];
}

/** Surowe wiersze biblioteki (kształt RawLibrary) — te same SELECT-y co quote-finalize. */
export async function loadRawLibrary(DB: D1Database): Promise<RawLibrary> {
  const all = (sql: string) => DB.prepare(sql).all();
  const [
    aspects,
    levels,
    archetypes,
    archetypeDefaults,
    questions,
    rules,
    modules,
    integrations,
    multipliers,
    costItemTypes,
    params,
  ] = await Promise.all([
    all(
      `SELECT code, name, category, description, client_name FROM est_aspects WHERE is_active = 1`,
    ),
    all(`SELECT a.code AS aspect_code, l.level, l.hours_min, l.hours_max, l.name, l.description, l.client_description
         FROM est_levels l JOIN est_aspects a ON a.id = l.aspect_id`),
    all(`SELECT code, name, description, integration_mode FROM est_archetypes WHERE is_active = 1`),
    all(`SELECT ar.code AS archetype_code, asp.code AS aspect_code, d.default_level, d.is_locked
         FROM est_archetype_defaults d
         JOIN est_archetypes ar ON ar.id = d.archetype_id
         JOIN est_aspects asp ON asp.id = d.aspect_id`),
    all(
      `SELECT code, text, unknown_weight, visible_if_json FROM est_questions WHERE is_active = 1`,
    ),
    all(`SELECT id, name, condition_json, actions_json, reason_template, priority
         FROM est_rules WHERE is_active = 1 ORDER BY priority DESC, id`),
    all(`SELECT code, name, hours_min, hours_max, risk, archetypes_json, goals_json
         FROM est_modules WHERE is_active = 1`),
    all(`SELECT code, name, hours_platform_min, hours_platform_max, hours_custom_min, hours_custom_max, risk
         FROM est_integrations WHERE is_active = 1`),
    all(`SELECT code, name, value FROM est_multipliers WHERE is_active = 1`),
    all(`SELECT code, name, unit, unit_price FROM est_cost_item_types WHERE is_active = 1`),
    all(`SELECT key, value FROM est_params`),
  ]);
  const r = (x: D1Result) => (x.results ?? []) as never;
  return {
    aspects: r(aspects),
    levels: r(levels),
    archetypes: r(archetypes),
    archetypeDefaults: r(archetypeDefaults),
    questions: r(questions),
    rules: r(rules),
    modules: r(modules),
    integrations: r(integrations),
    multipliers: r(multipliers),
    costItemTypes: r(costItemTypes),
    params: r(params),
  };
}
