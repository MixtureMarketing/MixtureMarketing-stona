/**
 * Cloudflare Pages Function: portal/get_messages
 * Path: /api/portal/get_messages
 */

interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, data } = context;
  const user = data.user as { id: number };

  try {
    const cacheKey = `chat_history_${user.id}`;
    
    // 1. Check KV Cache
    const cached: any = await env.CACHE.get(cacheKey, 'json');
    if (cached) {
      return new Response(JSON.stringify({ messages: cached, source: 'cache' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Fetch from D1
    const messages: any = await env.DB.prepare(`
      SELECT * FROM messages WHERE user_id = ? ORDER BY created_at ASC
    `).bind(user.id).all();

    // 3. Mark admin messages as read
    await env.DB.prepare(`
      UPDATE messages SET is_read = 1 WHERE user_id = ? AND sender_type = 'admin'
    `).bind(user.id).run();

    // 4. Save to KV Cache
    await env.CACHE.put(cacheKey, JSON.stringify(messages.results), { expirationTtl: 3600 });

    return new Response(JSON.stringify({ messages: messages.results, source: 'database' }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
