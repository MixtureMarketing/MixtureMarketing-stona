/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/save_project
 * Path: /api/admin/save_project
 */

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const data: any = await request.json();
    const {
      id,
      user_id,
      name,
      type,
      status,
      progress,
      drive_link,
      next_milestone,
      next_milestone_date,
      budget,
    } = data;

    if (id) {
      // UPDATE
      await env.DB.prepare(
        `
        UPDATE projects SET 
          name = ?, type = ?, status = ?, progress = ?, 
          drive_link = ?, next_milestone = ?, next_milestone_date = ?, 
          budget = ?, updated_at = datetime('now')
        WHERE id = ?
      `,
      )
        .bind(
          name,
          type,
          status,
          progress,
          drive_link,
          next_milestone,
          next_milestone_date,
          budget,
          id,
        )
        .run();
    } else {
      // INSERT
      await env.DB.prepare(
        `
        INSERT INTO projects (user_id, name, type, status, progress, drive_link, next_milestone, next_milestone_date, budget)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      )
        .bind(
          user_id,
          name,
          type,
          status || 'pending',
          progress || 0,
          drive_link,
          next_milestone,
          next_milestone_date,
          budget,
        )
        .run();
    }

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
