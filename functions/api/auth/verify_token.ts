/**
 * Cloudflare Pages Function: verify_token
 * Path: /api/auth/verify_token
 */

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const { token } = (await request.json()) as { token: string };

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token is required' }), { status: 400 });
    }

    // 1. Find and validate token
    const authRecord: any = await env.DB.prepare(`
      SELECT email FROM auth_tokens 
      WHERE token = ? AND used = 0 AND expires_at > datetime('now')
    `).bind(token).first();

    if (!authRecord) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 403 });
    }

    // 2. Get User
    const user: any = await env.DB.prepare('SELECT id, email, name, role, company_name FROM users WHERE email = ? AND is_active = 1')
      .bind(authRecord.email)
      .first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found or inactive' }), { status: 404 });
    }

    // 3. Mark token as used
    await env.DB.prepare('UPDATE auth_tokens SET used = 1 WHERE token = ?').bind(token).run();

    // 4. Generate Session Token (Simple UUID for now)
    const sessionToken = crypto.randomUUID().replace(/-/g, '');
    const sessionExpires = new Date(Date.now() + 7 * 24 * 3600000).toISOString(); // 7 days

    // 5. Update User with session
    await env.DB.prepare('UPDATE users SET session_token = ?, session_expires = ? WHERE id = ?')
      .bind(sessionToken, sessionExpires, user.id)
      .run();

    return new Response(JSON.stringify({
      status: 'success',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_name: user.company_name
      },
      session_token: sessionToken
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
