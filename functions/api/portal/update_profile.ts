/**
 * Cloudflare Pages Function: portal/update_profile
 * Path: /api/portal/update_profile
 */

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env, data } = context;
  const user = data.user as { id: number };

  try {
    const { name, company_name } = (await request.json()) as { name: string; company_name: string };

    await env.DB.prepare(`
      UPDATE users SET name = ?, company_name = ? WHERE id = ?
    `).bind(name, company_name, user.id).run();

    const updatedUser: any = await env.DB.prepare('SELECT id, email, name, role, company_name FROM users WHERE id = ?').bind(user.id).first();

    return new Response(JSON.stringify({ status: 'success', user: updatedUser }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};
