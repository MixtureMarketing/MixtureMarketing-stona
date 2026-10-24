/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/get_all_data
 * Returns all clients and their projects for the admin.
 * Path: /api/admin/get_all_data
 */

import { attachChildren } from '../_shared/projects';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    // Stała liczba zapytań (4, w jednym batchu) zamiast 2 na projekt: D1 ma limit
    // 50 zapytań na wywołanie (plan Free), więc przy >24 projektach endpoint padał,
    // a panel admina zostawał bez listy klientów i projektów.
    const [clients, projects, docs, miles] = (await env.DB.batch([
      env.DB.prepare(
        `SELECT id, email, name, company_name, is_active, created_at
         FROM users WHERE role = 'client' ORDER BY created_at DESC`,
      ),
      env.DB.prepare(
        `SELECT p.*, u.name as client_name, u.company_name
         FROM projects p
         JOIN users u ON p.user_id = u.id
         ORDER BY p.created_at DESC`,
      ),
      env.DB.prepare(
        `SELECT id, project_id, name, file_path, type, subtype, created_at
         FROM documents ORDER BY created_at DESC, id DESC`,
      ),
      env.DB.prepare(`SELECT * FROM milestones ORDER BY due_date ASC, id ASC`),
    ])) as D1Result<any>[];

    const results = attachChildren(projects.results, docs.results, miles.results);

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
