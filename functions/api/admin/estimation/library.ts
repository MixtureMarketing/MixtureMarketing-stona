/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/estimation/library
 * Path: /api/admin/estimation/library
 * Auth: dziedziczona z admin/_middleware.ts (rola admin).
 * Zwraca komplet biblioteki wiedzy (est_*) dla silnika działającego w UI (podgląd na żywo,
 * krok „Platforma"). „Wiedza = dane" — UI nie hardkoduje niczego domenowego (inwariant 2).
 * Kolumny JSON (condition_json/actions_json/options_json...) zwracane jako surowe stringi —
 * parsowanie po stronie klienta przy budowie wejścia silnika.
 */

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const all = (sql: string) => env.DB.prepare(sql).all();
  try {
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
        `SELECT code, name, category, description, sort_order FROM est_aspects WHERE is_active = 1 ORDER BY sort_order`,
      ),
      all(`SELECT a.code AS aspect_code, l.level, l.name, l.description, l.hours_min, l.hours_max
           FROM est_levels l JOIN est_aspects a ON a.id = l.aspect_id ORDER BY a.sort_order, l.level`),
      all(
        `SELECT code, name, description, integration_mode FROM est_archetypes WHERE is_active = 1`,
      ),
      all(`SELECT ar.code AS archetype_code, asp.code AS aspect_code, d.default_level, d.is_locked
           FROM est_archetype_defaults d
           JOIN est_archetypes ar ON ar.id = d.archetype_id
           JOIN est_aspects asp ON asp.id = d.aspect_id`),
      all(`SELECT code, text, help_text, answer_type, options_json, allow_unknown, visibility,
                  unknown_weight, visible_if_json, question_group, sort_order
           FROM est_questions WHERE is_active = 1 ORDER BY sort_order`),
      all(`SELECT id, name, rule_type, condition_json, actions_json, reason_template, priority
           FROM est_rules WHERE is_active = 1 ORDER BY priority DESC, id`),
      all(`SELECT code, name, description, includes, excludes, hours_min, hours_max, risk, archetypes_json, goals_json
           FROM est_modules WHERE is_active = 1`),
      all(`SELECT code, name, category, hours_platform_min, hours_platform_max,
                  hours_custom_min, hours_custom_max, risk, requirements
           FROM est_integrations WHERE is_active = 1`),
      all(`SELECT code, name, value, description FROM est_multipliers WHERE is_active = 1`),
      all(`SELECT code, name, unit, unit_price FROM est_cost_item_types WHERE is_active = 1`),
      all(`SELECT key, value, description FROM est_params`),
    ]);

    return new Response(
      JSON.stringify({
        aspects: aspects.results ?? [],
        levels: levels.results ?? [],
        archetypes: archetypes.results ?? [],
        archetypeDefaults: archetypeDefaults.results ?? [],
        questions: questions.results ?? [],
        rules: rules.results ?? [],
        modules: modules.results ?? [],
        integrations: integrations.results ?? [],
        multipliers: multipliers.results ?? [],
        costItemTypes: costItemTypes.results ?? [],
        params: params.results ?? [],
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
