/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Middleware: Admin Auth
 * Only allows users with role 'admin' to access /api/admin/*
 */

import { serverError } from '../_shared/errors';

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context;
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  // Bez try awaria D1 dawała stronę błędu Cloudflare (HTML 1101), na której
  // front wywracał się na res.json(). Teraz JSON 500 bez szczegółów.
  let user: any;
  try {
    // Verify token and check for admin role
    user = await env.DB.prepare(
      `
    SELECT id, role FROM users 
    WHERE session_token = ? AND julianday(session_expires) > julianday('now') AND is_active = 1
  `,
    )
      .bind(token)
      .first();
  } catch (err) {
    return serverError(err, 'admin/_middleware');
  }

  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403 });
  }

  // Attach user to context
  context.data.user = user;

  return next();
};
