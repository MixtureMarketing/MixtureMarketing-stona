/**
 * Cloudflare Pages Middleware: Portal Auth
 * Verifies session token for all /api/portal/* requests.
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

  // Verify token in DB
  const user: any = await env.DB.prepare(`
    SELECT id, email, name, role FROM users 
    WHERE session_token = ? AND session_expires > datetime('now') AND is_active = 1
  `).bind(token).first();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired session' }), { status: 401 });
  }

  // Attach user to context for use in functions
  context.data.user = user;

  return next();
};
