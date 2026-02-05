/**
 * Cloudflare Pages Middleware: Admin Auth
 * Only allows users with role 'admin' to access /api/admin/*
 */

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

  // Verify token and check for admin role
  const user: any = await env.DB.prepare(`
    SELECT id, role FROM users 
    WHERE session_token = ? AND session_expires > datetime('now') AND is_active = 1
  `).bind(token).first();

  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403 });
  }

  // Attach user to context
  context.data.user = user;

  return next();
};
