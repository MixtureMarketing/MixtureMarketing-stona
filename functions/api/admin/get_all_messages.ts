/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/get_all_messages
 * Path: /api/admin/get_all_messages
 */

interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const targetUserId = url.searchParams.get('user_id');

  try {
    // 1. Get all conversations (unique users who have messages)
    const conversations: any = await env.DB.prepare(
      `
      SELECT DISTINCT u.id, u.name, u.email, u.company_name,
      (SELECT COUNT(*) FROM messages m2 WHERE m2.user_id = u.id AND m2.is_read = 0 AND m2.sender_type = 'client') as unread_count
      FROM users u
      JOIN messages m ON u.id = m.user_id
      ORDER BY unread_count DESC, u.name ASC
    `,
    ).all();

    let messages: any[] = [];
    if (targetUserId) {
      const msgResult: any = await env.DB.prepare(
        `
        SELECT * FROM messages WHERE user_id = ? ORDER BY created_at ASC
      `,
      )
        .bind(targetUserId)
        .all();
      messages = msgResult.results;

      // Read-receipt: gdy admin otwiera rozmowe, oznacz wiadomosci KLIENTA jako
      // przeczytane (symetrycznie do portal/get_messages, ktory oznacza wiadomosci
      // admina). Dzieki temu u klienta zapala sie podwojny ptaszek. Czyscimy tez
      // jego cache chatu, zeby nastepny polling zobaczyl is_read=1 od razu.
      await env.DB.prepare(
        `UPDATE messages SET is_read = 1 WHERE user_id = ? AND sender_type = 'client'`,
      )
        .bind(targetUserId)
        .run();
      await env.CACHE.delete(`chat_history_${targetUserId}`);
    }

    return new Response(
      JSON.stringify({
        conversations: conversations.results,
        messages: messages,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};
