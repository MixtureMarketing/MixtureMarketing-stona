/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/get_leads
 * Path: /api/admin/get_leads
 */

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    const leads: any = await env.DB.prepare(
      `
      SELECT * FROM leads ORDER BY created_at DESC
    `,
    ).all();

    return new Response(JSON.stringify({ leads: leads.results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
