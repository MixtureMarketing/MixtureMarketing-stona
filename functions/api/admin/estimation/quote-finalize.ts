/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/estimation/quote-finalize
 * Path: /api/admin/estimation/quote-finalize
 * Auth: dziedziczona z admin/_middleware.ts (rola admin).
 * POST {id, overrides} — serwerowe, AUTORYTATYWNE przeliczenie (ten sam pure computeQuote co UI)
 * + snapshot-first: kopiuje wszystkie użyte wartości do est_quote_aspects/items/multipliers
 * i totals_json (inwariant 3). Status draft/review → review; sent+ nietykalne (guard 409, C.6).
 */
import { computeQuote } from '../../../../lib/estimation/quote';
import { validateForFinalize, ENGINE_VERSION } from '../../../../lib/estimation/engine';
import { buildLibraryData, type RawLibrary } from '../../../../lib/estimation/toLibraryData';
import type {
  Answers,
  ValidationOverrides,
  QuoteAspectValidation,
} from '../../../../lib/estimation/types';

interface Env {
  DB: D1Database;
}

// Statusy, z których wolno (prze)liczać. sent/won/lost/closed = wysłane klientowi → nietykalne (C.6).
const FINALIZABLE = new Set(['draft', 'review']);

interface Body {
  id?: number;
  overrides?: Partial<ValidationOverrides>;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  try {
    const body = (await request.json()) as Body;
    if (!body.id) return json({ error: 'Pole „id" jest wymagane.' }, 400);

    const quote = (await env.DB.prepare('SELECT * FROM est_quotes WHERE id = ?')
      .bind(body.id)
      .first()) as any;
    if (!quote) return json({ error: 'Wycena nie istnieje.' }, 404);

    // GUARD cyklu życia (C.6): wycena wysłana klientowi jest nietykalna — zmiana przez duplikat (F2).
    if (!FINALIZABLE.has(quote.status)) {
      return json(
        {
          error: `Wycena w statusie „${quote.status}" jest nietykalna. Utwórz duplikat, aby wprowadzić zmiany.`,
        },
        409,
      );
    }

    const answers = await loadAnswers(env.DB, body.id);
    answers.archetype = quote.archetype_code; // atrybut wyceny widoczny dla silnika (jak w UI)
    const rawLib = await loadRawLibrary(env.DB);
    // Ten sam builder i te same argumenty co UI (archetyp + cel) ⇒ parytet checklisty (D24).
    const goal = typeof answers.project_goal === 'string' ? answers.project_goal : undefined;
    const library = buildLibraryData(rawLib, quote.archetype_code, goal);
    const overrides = body.overrides ?? {};

    const c = computeQuote({ answers, library, overrides });

    // Walidacja przed zapisem (inwarianty 3–4): pusta wycena, override min>max, zmiana bez powodu.
    const ov = normalizeOverrides(overrides);
    const validationAspects: QuoteAspectValidation[] = c.aspects.map((a) => ({
      code: a.code,
      suggestedLevel: a.suggestedLevel,
      chosenLevel: a.chosenLevel,
      overrideHoursMin: ov.overrideHours[a.code]?.min,
      overrideHoursMax: ov.overrideHours[a.code]?.max,
      overrideReason: ov.levelReasons[a.code],
    }));
    const totalHoursMax =
      c.aspects.reduce((s, a) => s + a.hoursMax, 0) +
      c.items.reduce((s, i) => s + (i.type !== 'cost' ? i.hoursMax : 0), 0);
    const errors = validateForFinalize({ aspects: validationAspects, totalHoursMax });
    if (errors.length > 0) return json({ errors }, 400);

    // ── Snapshot atomowy (batch = transakcja D1). Re-finalize nadpisuje poprzedni snapshot. ──
    const P = (sql: string) => env.DB.prepare(sql);
    const stmts: D1PreparedStatement[] = [
      P('DELETE FROM est_quote_aspects WHERE quote_id = ?').bind(body.id),
      P('DELETE FROM est_quote_items WHERE quote_id = ?').bind(body.id),
      P('DELETE FROM est_quote_multipliers WHERE quote_id = ?').bind(body.id),
    ];

    for (const a of c.aspects) {
      const oh = ov.overrideHours[a.code];
      stmts.push(
        P(
          `INSERT INTO est_quote_aspects
             (quote_id, aspect_code, aspect_name, category, suggested_level, chosen_level,
              hours_min, hours_max, override_hours_min, override_hours_max, override_reason, rule_reasons_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          body.id,
          a.code,
          a.name,
          a.category,
          a.suggestedLevel,
          a.chosenLevel,
          a.hoursMin,
          a.hoursMax,
          oh?.min ?? null,
          oh?.max ?? null,
          ov.levelReasons[a.code] ?? null,
          JSON.stringify(a.reasons ?? []),
        ),
      );
    }

    for (const it of c.items) {
      const isCost = it.type === 'cost';
      stmts.push(
        P(
          `INSERT INTO est_quote_items
             (quote_id, item_type, ref_code, name, hours_min, hours_max, amount_pln, qty, unit, unit_price, risk, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          body.id,
          it.type,
          it.code ?? null,
          it.name,
          isCost ? null : (it as any).hoursMin,
          isCost ? null : (it as any).hoursMax,
          isCost ? ((it as any).amountPln ?? null) : null,
          isCost ? ((it as any).qty ?? null) : null,
          isCost ? ((it as any).unit ?? null) : null,
          isCost ? ((it as any).unitPrice ?? null) : null,
          isCost ? null : ((it as any).risk ?? null),
          isCost ? ((it as any).note ?? null) : null, // doprecyzowanie formuły w ofercie
        ),
      );
    }

    for (const m of c.activeMultipliers) {
      stmts.push(
        P(
          `INSERT INTO est_quote_multipliers (quote_id, code, name, value, source)
           VALUES (?, ?, ?, ?, 'rule')`,
        ).bind(body.id, m.code, m.name, m.value),
      );
    }

    stmts.push(
      P(
        `UPDATE est_quotes
           SET status = 'review', totals_json = ?, confidence = ?, confidence_breakdown_json = ?,
               engine_version = ?, updated_at = datetime('now')
         WHERE id = ?`,
      ).bind(
        JSON.stringify(c.totals),
        c.confidence.score,
        JSON.stringify(c.confidence.breakdown),
        ENGINE_VERSION,
        body.id,
      ),
    );

    await env.DB.batch(stmts);

    return json({
      id: body.id,
      status: 'review',
      engine_version: ENGINE_VERSION,
      totals: c.totals,
      confidence: c.confidence,
    });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

async function loadAnswers(DB: D1Database, quoteId: number): Promise<Answers> {
  const res = await DB.prepare(
    'SELECT question_code, answer_json FROM est_quote_answers WHERE quote_id = ?',
  )
    .bind(quoteId)
    .all();
  const answers: Answers = {};
  for (const row of (res.results ?? []) as { question_code: string; answer_json: string }[]) {
    try {
      answers[row.question_code] = JSON.parse(row.answer_json);
    } catch {
      answers[row.question_code] = row.answer_json as any;
    }
  }
  return answers;
}

/** Ładuje surowe wiersze biblioteki w kształcie RawLibrary (te same zapytania co library.ts). */
async function loadRawLibrary(DB: D1Database): Promise<RawLibrary> {
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
    all(`SELECT code, name, category, description FROM est_aspects WHERE is_active = 1`),
    all(`SELECT a.code AS aspect_code, l.level, l.hours_min, l.hours_max
         FROM est_levels l JOIN est_aspects a ON a.id = l.aspect_id`),
    all(`SELECT code, name, description, integration_mode FROM est_archetypes WHERE is_active = 1`),
    all(`SELECT ar.code AS archetype_code, asp.code AS aspect_code, d.default_level, d.is_locked
         FROM est_archetype_defaults d
         JOIN est_archetypes ar ON ar.id = d.archetype_id
         JOIN est_aspects asp ON asp.id = d.aspect_id`),
    all(
      `SELECT code, text, unknown_weight, visible_if_json FROM est_questions WHERE is_active = 1`,
    ),
    all(
      `SELECT id, name, condition_json, actions_json, reason_template, priority FROM est_rules WHERE is_active = 1 ORDER BY priority DESC, id`,
    ),
    all(
      `SELECT code, name, hours_min, hours_max, risk, archetypes_json, goals_json FROM est_modules WHERE is_active = 1`,
    ),
    all(`SELECT code, name, hours_platform_min, hours_platform_max, hours_custom_min, hours_custom_max, risk
         FROM est_integrations WHERE is_active = 1`),
    all(`SELECT code, name, value FROM est_multipliers WHERE is_active = 1`),
    all(`SELECT code, name, unit, unit_price FROM est_cost_item_types WHERE is_active = 1`),
    all(`SELECT key, value FROM est_params`),
  ]);
  return {
    aspects: (aspects.results ?? []) as any,
    levels: (levels.results ?? []) as any,
    archetypes: (archetypes.results ?? []) as any,
    archetypeDefaults: (archetypeDefaults.results ?? []) as any,
    questions: (questions.results ?? []) as any,
    rules: (rules.results ?? []) as any,
    modules: (modules.results ?? []) as any,
    integrations: (integrations.results ?? []) as any,
    multipliers: (multipliers.results ?? []) as any,
    costItemTypes: (costItemTypes.results ?? []) as any,
    params: (params.results ?? []) as any,
  };
}

const EMPTY_OV: ValidationOverrides = {
  chosenLevels: {},
  overrideHours: {},
  levelReasons: {},
  disabledModules: [],
  disabledIntegrations: [],
  disabledMultipliers: [],
  extraCostItems: [],
  costAmounts: {},
};
const normalizeOverrides = (o: Partial<ValidationOverrides>): ValidationOverrides => ({
  ...EMPTY_OV,
  ...o,
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
