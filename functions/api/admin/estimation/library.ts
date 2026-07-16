/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/estimation/library
 * Path: /api/admin/estimation/library
 * Auth: dziedziczona z admin/_middleware.ts (rola admin).
 * GET   — komplet biblioteki wiedzy (est_*) dla silnika w UI (podgląd, krok „Platforma").
 * PATCH — edycja pojedynczego wiersza biblioteki (f2c-1). Twarde granice: kody/klucze/value
 *         opcji NIEEDYTOWALNE (walidator libraryEdit), zmiany działają wyłącznie wprzód
 *         (snapshoty nietykalne — inwariant 3). „Wiedza = dane" (inwariant 2).
 * Kolumny JSON (condition_json/actions_json/options_json...) zwracane jako surowe stringi —
 * parsowanie po stronie klienta przy budowie wejścia silnika.
 */
import {
  validateLibraryPatch,
  ENTITY_FIELDS,
  type LibraryEntity,
} from '../../../../lib/estimation/libraryEdit';

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
        `SELECT code, name, category, description, client_name, sort_order FROM est_aspects WHERE is_active = 1 ORDER BY sort_order`,
      ),
      all(`SELECT a.code AS aspect_code, l.level, l.name, l.description, l.client_description, l.hours_min, l.hours_max
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

// ── PATCH: edycja wiersza biblioteki (f2c-1) ─────────────────────────────────

const TABLE: Record<LibraryEntity, string> = {
  aspect: 'est_aspects',
  level: 'est_levels',
  module: 'est_modules',
  integration: 'est_integrations',
  question: 'est_questions',
  param: 'est_params',
};

const KNOWN_ENTITIES: LibraryEntity[] = [
  'aspect',
  'level',
  'module',
  'integration',
  'question',
  'param',
];

interface PatchBody {
  entity?: string;
  key?: Record<string, any>;
  patch?: Record<string, unknown>;
}

/** Wczytuje bieżący wiersz + zwraca klauzulę WHERE (kod/klucz = kontrakt, nie zmieniamy).
 *  Dla poziomu dokłada rodzeństwo z zastosowanym patchem (monotoniczność). */
async function loadTarget(
  DB: D1Database,
  entity: LibraryEntity,
  key: Record<string, any>,
  patch: Record<string, unknown>,
): Promise<{
  current: Record<string, unknown> | null;
  where: string;
  whereBinds: unknown[];
  siblingLevels?: { level: number; hours_min: number; hours_max: number }[];
}> {
  if (entity === 'level') {
    const asp = (await DB.prepare('SELECT id FROM est_aspects WHERE code = ?')
      .bind(key.aspect_code)
      .first()) as any;
    if (!asp) return { current: null, where: '', whereBinds: [] };
    const level = Number(key.level);
    const current = (await DB.prepare(
      'SELECT level, name, description, client_description, hours_min, hours_max FROM est_levels WHERE aspect_id = ? AND level = ?',
    )
      .bind(asp.id, level)
      .first()) as any;
    const sibs = await DB.prepare(
      'SELECT level, hours_min, hours_max FROM est_levels WHERE aspect_id = ?',
    )
      .bind(asp.id)
      .all();
    // rodzeństwo z NADPISANYM docelowym poziomem (patch), reszta bez zmian
    const siblingLevels = ((sibs.results ?? []) as any[]).map((r) =>
      r.level === level
        ? {
            level,
            hours_min: patch.hours_min !== undefined ? Number(patch.hours_min) : r.hours_min,
            hours_max: patch.hours_max !== undefined ? Number(patch.hours_max) : r.hours_max,
          }
        : { level: r.level, hours_min: r.hours_min, hours_max: r.hours_max },
    );
    return {
      current,
      where: 'aspect_id = ? AND level = ?',
      whereBinds: [asp.id, level],
      siblingLevels,
    };
  }

  // pozostałe encje: naturalny klucz to code (aspect/module/integration/question) lub key (param)
  const keyCol = entity === 'param' ? 'key' : 'code';
  const keyVal = entity === 'param' ? key.key : key.code;
  const current = (await DB.prepare(`SELECT * FROM ${TABLE[entity]} WHERE ${keyCol} = ?`)
    .bind(keyVal)
    .first()) as any;
  return { current, where: `${keyCol} = ?`, whereBinds: [keyVal] };
}

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  try {
    const body = (await request.json()) as PatchBody;
    const entity = body.entity as LibraryEntity;
    if (!entity || !KNOWN_ENTITIES.includes(entity))
      return json({ error: 'Nieznana encja biblioteki.' }, 400);

    const patch = body.patch ?? {};
    const key = body.key ?? {};

    const { current, where, whereBinds, siblingLevels } = await loadTarget(
      env.DB,
      entity,
      key,
      patch,
    );
    if (!current) return json({ error: 'Wiersz biblioteki nie istnieje.' }, 404);

    const errors = validateLibraryPatch({ entity, patch, current, siblingLevels });
    if (errors.length > 0) return json({ errors }, 400);

    // UPDATE wyłącznie z pól whitelisty (nazwy kolumn ze stałej listy — nie z inputu; wartości bindowane).
    const cols = Object.keys(patch).filter((k) => ENTITY_FIELDS[entity].includes(k));
    const setSql = cols.map((c) => `${c} = ?`).join(', ');
    const setBinds = cols.map((c) => patch[c]);
    await env.DB.prepare(`UPDATE ${TABLE[entity]} SET ${setSql} WHERE ${where}`)
      .bind(...setBinds, ...whereBinds)
      .run();

    return json({ ok: true, entity, updated: cols });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
