/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: portal/dashboard
 * Path: /api/portal/dashboard
 */

import { attachChildren } from '../_shared/projects';
import { serverError } from '../_shared/errors';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, data } = context;
  const user = data.user as { id: number };

  try {
    // Stała liczba zapytań (3, jeden batch) zamiast 2 na projekt — limit D1 to
    // 50 zapytań na wywołanie (Free). Dokumenty i etapy tylko z projektów klienta.
    const [projects, documents, milestones] = (await env.DB.batch([
      env.DB.prepare(`SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC`).bind(
        user.id,
      ),
      env.DB.prepare(
        `SELECT d.id, d.project_id, d.name, d.file_path, d.type, d.subtype, d.created_at
         FROM documents d JOIN projects p ON d.project_id = p.id
         WHERE p.user_id = ?
         ORDER BY d.created_at DESC, d.id DESC`,
      ).bind(user.id),
      env.DB.prepare(
        `SELECT m.* FROM milestones m JOIN projects p ON m.project_id = p.id
         WHERE p.user_id = ?
         ORDER BY m.due_date ASC, m.id ASC`,
      ).bind(user.id),
    ])) as D1Result<any>[];

    const results = attachChildren(projects.results, documents.results, milestones.results);

    return new Response(JSON.stringify({ projects: results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return serverError(err, 'portal/dashboard');
  }
};
