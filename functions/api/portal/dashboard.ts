/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: portal/dashboard
 * Path: /api/portal/dashboard
 */

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, data } = context;
  const user = data.user as { id: number };

  try {
    // 1. Get Projects
    const projects: any = await env.DB.prepare(
      `
      SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC
    `,
    )
      .bind(user.id)
      .all();

    const results = projects.results;

    // 2. Hydrate each project with documents and milestones
    for (const project of results) {
      const documents: any = await env.DB.prepare(
        `
        SELECT id, name, file_path, type, subtype, created_at 
        FROM documents WHERE project_id = ? ORDER BY created_at DESC
      `,
      )
        .bind(project.id)
        .all();
      project.documents = documents.results;

      const milestones: any = await env.DB.prepare(
        `
        SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date ASC, id ASC
      `,
      )
        .bind(project.id)
        .all();
      project.milestones = milestones.results;
    }

    return new Response(JSON.stringify({ projects: results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
