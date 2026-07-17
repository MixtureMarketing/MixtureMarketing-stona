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
  validateLibraryCreate,
  ENTITY_FIELDS,
  CREATE_FIELDS,
  type LibraryEntity,
} from '../../../../lib/estimation/libraryEdit';
import { validateRule, buildRuleContext } from '../../../../lib/estimation/ruleValidation';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const all = (sql: string) => env.DB.prepare(sql).all();
  // scope=editor: pełny odczyt dla edytora reguł (reguły też NIEAKTYWNE + kolumna is_active).
  // Domyślnie GET jest engine-facing (tylko aktywne) — nie psujemy podglądu wizarda.
  const editor = new URL(request.url).searchParams.get('scope') === 'editor';
  const rulesSql = editor
    ? `SELECT id, name, rule_type, condition_json, actions_json, reason_template, priority, is_active
       FROM est_rules ORDER BY priority DESC, id`
    : `SELECT id, name, rule_type, condition_json, actions_json, reason_template, priority
       FROM est_rules WHERE is_active = 1 ORDER BY priority DESC, id`;
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
      all(rulesSql),
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
  rule: 'est_rules',
};

const KNOWN_ENTITIES: LibraryEntity[] = [
  'aspect',
  'level',
  'module',
  'integration',
  'question',
  'param',
  'rule',
];

/** Kontekst spójności reguł (kody biblioteki) — do walidacji semantycznej reguł (sieroty). */
async function loadRuleContext(DB: D1Database) {
  const all = (sql: string) => DB.prepare(sql).all();
  const [
    aspects,
    levels,
    modules,
    integrations,
    multipliers,
    costItemTypes,
    questions,
    archetypes,
  ] = await Promise.all([
    all(`SELECT code FROM est_aspects WHERE is_active = 1`),
    all(
      `SELECT a.code AS aspect_code, l.level FROM est_levels l JOIN est_aspects a ON a.id = l.aspect_id`,
    ),
    all(`SELECT code FROM est_modules WHERE is_active = 1`),
    all(`SELECT code FROM est_integrations WHERE is_active = 1`),
    all(`SELECT code FROM est_multipliers WHERE is_active = 1`),
    all(`SELECT code FROM est_cost_item_types WHERE is_active = 1`),
    all(`SELECT code FROM est_questions WHERE is_active = 1`),
    all(`SELECT code FROM est_archetypes WHERE is_active = 1`),
  ]);
  return buildRuleContext({
    aspects: (aspects.results ?? []) as any,
    levels: (levels.results ?? []) as any,
    modules: (modules.results ?? []) as any,
    integrations: (integrations.results ?? []) as any,
    multipliers: (multipliers.results ?? []) as any,
    costItemTypes: (costItemTypes.results ?? []) as any,
    questions: (questions.results ?? []) as any,
    archetypes: (archetypes.results ?? []) as any,
  });
}

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

  // reguła: tożsamość to id (niezmienne)
  if (entity === 'rule') {
    const id = Number(key.id);
    const current = (await DB.prepare('SELECT * FROM est_rules WHERE id = ?')
      .bind(id)
      .first()) as any;
    return { current, where: 'id = ?', whereBinds: [id] };
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

    // Reguła: gdy patch rusza drzewo/akcje — walidacja SEMANTYCZNA (sieroty) z kontekstem biblioteki.
    // Bierzemy stronę nieruszohaną z current (edycja tylko warunku LUB tylko akcji też ma być spójna).
    if (
      entity === 'rule' &&
      (patch.condition_json !== undefined || patch.actions_json !== undefined)
    ) {
      const cond = (patch.condition_json ?? current.condition_json) as string;
      const acts = (patch.actions_json ?? current.actions_json) as string;
      const ctx = await loadRuleContext(env.DB);
      errors.push(...validateRule(cond, acts, ctx));
    }

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

// ── POST: CREATE modułu / integracji (f2c-2a) ───────────────────────────────

interface CreateBody {
  entity?: string;
  code?: string;
  row?: Record<string, unknown>;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  try {
    const body = (await request.json()) as CreateBody;
    const entity = body.entity;
    if (entity !== 'module' && entity !== 'integration')
      return json({ error: 'Tworzyć można tylko moduł lub integrację.' }, 400);

    const code = body.code;
    const row = body.row ?? {};

    const errors = validateLibraryCreate({ entity, code, row });
    if (errors.length > 0) return json({ errors }, 400);

    // unikalność kodu (kod = kontrakt; kolizja → 409, nie cichy upsert)
    const existing = await env.DB.prepare(`SELECT 1 FROM ${TABLE[entity]} WHERE code = ?`)
      .bind(code)
      .first();
    if (existing) return json({ error: `Kod „${code}" już istnieje.` }, 409);

    // INSERT: code + pola whitelisty obecne w row (nazwy kolumn ze stałej listy; wartości bindowane).
    // is_active/risk/nullable domyślne z DDL, gdy nieobecne.
    const cols = ['code', ...CREATE_FIELDS[entity].filter((f) => row[f] !== undefined)];
    const binds = cols.map((c) => (c === 'code' ? code : row[c]));
    const placeholders = cols.map(() => '?').join(', ');
    await env.DB.prepare(
      `INSERT INTO ${TABLE[entity]} (${cols.join(', ')}) VALUES (${placeholders})`,
    )
      .bind(...binds)
      .run();

    return json({ ok: true, entity, code }, 201);
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
