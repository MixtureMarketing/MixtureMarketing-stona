/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: portal/get_messages
 * Path: /api/portal/get_messages
 */

import { CHAT_CACHE_TTL, chatCacheKey, kvGetJson, kvPut } from '../_shared/kv';
import { serverError } from '../_shared/errors';

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
    const results = messages.results as any[];
    const hasUnread = results.some((m) => m.sender_type === 'admin' && !Number(m.is_read));
    if (hasUnread) {
      await env.DB.prepare(
        `UPDATE messages SET is_read = 1 WHERE user_id = ? AND sender_type = 'admin' AND is_read = 0`,
      )
        .bind(user.id)
        .run();
    }

    // 4. Save to KV Cache (fail-open — wyczerpany limit zapisów KV nie może dać 500).
    // Do cache idzie stan PO oznaczeniu (is_read=1 dla wiadomości admina) — wcześniej
    // zapisywaliśmy stan sprzed UPDATE i każdy kolejny polling (nawet po przeładowaniu)
    // przez TTL zwracał „nieprzeczytane”: tytuł „(1) Nowa wiadomość” nie gasł.
    // Ta odpowiedź celowo niesie jeszcze stan sprzed odczytu — to jest moment, w którym
    // klient widzi, co jest nowe; następny polling (z cache) już „przeczytane”.
    const afterRead = hasUnread
      ? results.map((m) => (m.sender_type === 'admin' ? { ...m, is_read: 1 } : m))
      : results;
    await kvPut(env.CACHE, cacheKey, JSON.stringify(afterRead), {
      expirationTtl: CHAT_CACHE_TTL,
    });

    return new Response(JSON.stringify({ messages: messages.results, source: 'database' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return serverError(err, 'portal/get_messages');
  }
};
