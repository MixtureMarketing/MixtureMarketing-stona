/**
 * Cloudflare Pages Function: admin/save_milestone
 * Path: /api/admin/save_milestone
 */

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const data: any = await request.json();
    const { id, project_id, title, description, due_date, status, order_index } = data;

    if (id) {
      // UPDATE
      await env.DB.prepare(`
        UPDATE milestones SET 
          title = ?, description = ?, due_date = ?, status = ?, order_index = ?
        WHERE id = ?
      `).bind(title, description, due_date, status, order_index, id).run();
    } else {
      // INSERT
      await env.DB.prepare(`
        INSERT INTO milestones (project_id, title, description, due_date, status, order_index)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(project_id, title, description, due_date, status || 'pending', order_index || 0).run();
    }

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });

  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};
