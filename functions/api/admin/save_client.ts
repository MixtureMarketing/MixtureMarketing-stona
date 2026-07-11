/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/save_client
 * Path: /api/admin/save_client
 */

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const data: any = await request.json();
    const { id, name, company_name, is_active } = data;

    if (!id) return new Response('Missing Client ID', { status: 400 });

    await env.DB.prepare(
      `
      UPDATE users SET name = ?, company_name = ?, is_active = ?
      WHERE id = ?
    `,
    )
      .bind(name, company_name, is_active ? 1 : 0, id)
      .run();

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
