/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: portal/get_messages
 * Path: /api/portal/get_messages
 */

import { CHAT_CACHE_TTL, chatCacheKey, kvGetJson, kvPut } from '../_shared/kv';

interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, data } = context;
  const user = data.user as { id: number };

  try {
    const cacheKey = chatCacheKey(user.id);

    // 1. Check KV Cache (fail-open: błąd KV = idziemy do D1)
    const cached = await kvGetJson<unknown[]>(env.CACHE, cacheKey);
    if (cached) {
      return new Response(JSON.stringify({ messages: cached, source: 'cache' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Fetch from D1
    const messages: any = await env.DB.prepare(
      `
      SELECT * FROM messages WHERE user_id = ? ORDER BY created_at ASC
    `,
    )
      .bind(user.id)
      .all();

    // 3. Mark admin messages as read — tylko gdy są nieprzeczytane (bez pustych zapisów).
    const hasUnread = (messages.results as any[]).some(
      (m) => m.sender_type === 'admin' && !Number(m.is_read),
    );
    if (hasUnread) {
      await env.DB.prepare(
        `UPDATE messages SET is_read = 1 WHERE user_id = ? AND sender_type = 'admin' AND is_read = 0`,
      )
        .bind(user.id)
        .run();
    }

    // 4. Save to KV Cache (fail-open — wyczerpany limit zapisów KV nie może dać 500)
    await kvPut(env.CACHE, cacheKey, JSON.stringify(messages.results), {
      expirationTtl: CHAT_CACHE_TTL,
    });

    return new Response(JSON.stringify({ messages: messages.results, source: 'database' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
