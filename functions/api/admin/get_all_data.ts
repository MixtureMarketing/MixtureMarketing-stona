/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/get_all_data
 * Returns all clients and their projects for the admin.
 * Path: /api/admin/get_all_data
 */

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    // 1. Get all Clients
    const clients: any = await env.DB.prepare(
      `
      SELECT id, email, name, company_name, is_active, created_at 
      FROM users WHERE role = 'client' ORDER BY created_at DESC
    `,
    ).all();

    // 2. Get all Projects with client names
    const projects: any = await env.DB.prepare(
      `
      SELECT p.*, u.name as client_name, u.company_name
      FROM projects p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `,
    ).all();

    const results = projects.results;

    // 3. Hydrate each project with documents and milestones
    for (const project of results) {
      const docs: any = await env.DB.prepare(
        `
        SELECT id, name, file_path, type, subtype, created_at FROM documents WHERE project_id = ?
      `,
      )
        .bind(project.id)
        .all();
      project.documents = docs.results;

      const miles: any = await env.DB.prepare(
        `
        SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date ASC
      `,
      )
        .bind(project.id)
        .all();
      project.milestones = miles.results;
    }

    return new Response(
      JSON.stringify({
        clients: clients.results,
        projects: results,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
