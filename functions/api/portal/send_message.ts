/**
 * Cloudflare Pages Function: portal/send_message
 * Path: /api/portal/send_message
 */

interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  RESEND_API_KEY: string;
  NOTIFY_EMAIL: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env, data } = context;
  const user = data.user as { id: number; name: string };

  try {
    const { content, project_id } = (await request.json()) as { content: string; project_id?: number };

    if (!content) {
      return new Response(JSON.stringify({ error: 'Message content is required' }), { status: 400 });
    }

    // 1. Save to D1
    await env.DB.prepare(`
      INSERT INTO messages (user_id, project_id, content, sender_type, is_read)
      VALUES (?, ?, ?, ?, ?)
    `).bind(user.id, project_id || null, content, 'client', 0).run();

    // 2. Invalidate KV Cache
    const cacheKey = `chat_history_${user.id}`;
    await env.CACHE.delete(cacheKey);

    // 3. Notify Admin via Resend
    if (env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Mixture Marketing <portal@mixturemarketing.pl>',
          to: [env.NOTIFY_EMAIL],
          subject: `Nowa wiadomość od ${user.name}`,
          html: `<p>Użytkownik <strong>${user.name}</strong> wysłał nową wiadomość:</p><blockquote>${content}</blockquote>`
        })
      });
    }

    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
