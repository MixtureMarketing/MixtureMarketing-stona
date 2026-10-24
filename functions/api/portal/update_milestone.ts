/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: portal/update_milestone
 * Path: /api/portal/update_milestone
 */

import {
  ValidationError,
  badRequest,
  optText,
  readJsonObject,
  reqId,
  reqText,
} from '../_shared/input';
import { serverError } from '../_shared/errors';

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env, data } = context;
  const user = data.user as { id: number };

  try {
    const body = await readJsonObject(request);
    const id = reqId(body.id, 'id');
    const status = reqText(body.status, 'Status', 50);
    const feedback = optText(body.feedback, 'Uwagi');

    // Security: Check if milestone belongs to user's project
    const milestone: any = await env.DB.prepare(
      `
      SELECT m.id FROM milestones m
      JOIN projects p ON m.project_id = p.id
      WHERE m.id = ? AND p.user_id = ?
    `,
    )
      .bind(id, user.id)
      .first();

    if (!milestone) return new Response('Unauthorized', { status: 403 });

    await env.DB.prepare(
      `
      UPDATE milestones SET status = ?, feedback = ? WHERE id = ?
    `,
    )
      .bind(status, feedback || null, id)
      .run();

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (err: any) {
    if (err instanceof ValidationError) return badRequest(err.message);
    return serverError(err, 'portal/update_milestone');
  }
};
