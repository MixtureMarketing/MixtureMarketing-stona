/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/estimation/library-import
 * Path: /api/admin/estimation/library-import
 * Auth: dziedziczona z admin/_middleware.ts (rola admin).
 * POST { data, apply } — import paczki biblioteki (f2c-2b):
 *   apply=false (dry-run) → raport diff + ostrzeżenia + błędy, ZERO zapisów.
 *   apply=true → atomowy upsert (D1 batch) TYLKO gdy błędów zero; NO-DELETE; est_quote* NIETKNIĘTE.
 * Walidacja reużywa walidatorów pól i reguł — sieroty łapane też w imporcie (dopięcie WS2).
 */
import { readLibraryTables, buildUpsertBatch } from './packDb';
import {
  validateImport,
  computeImportWarnings,
  computeLibraryDiff,
  SCHEMA_VERSION,
  type LibraryPackTables,
} from '../../../../lib/estimation/libraryPack';

interface Env {
  DB: D1Database;
}

interface Body {
  data?: any;
  apply?: boolean;
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const body = (await request.json()) as Body;
    const data = body.data;
    if (!data || typeof data !== 'object')
      return json({ error: 'Brak danych paczki (pole „data").' }, 400);
    if (data.schema_version !== SCHEMA_VERSION)
      return json(
        {
          error: `Niezgodna wersja formatu paczki (${data.schema_version}); oczekiwano ${SCHEMA_VERSION}.`,
        },
        400,
      );

    const incoming = data as LibraryPackTables;
    const current = await readLibraryTables(env.DB);

    const errors = validateImport(incoming, current);
    const warnings = computeImportWarnings(incoming, current);
    const report = computeLibraryDiff(current, incoming);

    // DRY-RUN: raport bez zapisu.
    if (!body.apply) return json({ dryRun: true, report, warnings, errors });

    // APPLY: tylko przy zerze błędów (ostrzeżenia NIE blokują).
    if (errors.length > 0) return json({ applied: false, errors, warnings }, 400);

    const stmts = await buildUpsertBatch(env.DB, incoming);
    if (stmts.length > 0) await env.DB.batch(stmts);
    return json({ applied: true, report, warnings });
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
