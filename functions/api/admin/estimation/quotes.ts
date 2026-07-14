/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/estimation/quotes
 * Path: /api/admin/estimation/quotes
 * Auth: dziedziczona z functions/api/admin/_middleware.ts (rola admin; klient → 403).
 * F0: tylko lista wycen (GET). Tworzenie/finalize w F1.
 */

interface Env {
  DB: D1Database;
}

/** Kolumny listy (bez ciężkich pól JSON — te ładowane przy szczegółach wyceny w F1). */
const LIST_QUERY = `
  SELECT id, name, client_name, archetype_code, status, confidence, engine_version,
         created_at, updated_at
  FROM est_quotes
  ORDER BY created_at DESC
`;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    const quotes = await env.DB.prepare(LIST_QUERY).all();
    return new Response(JSON.stringify({ quotes: quotes.results ?? [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
