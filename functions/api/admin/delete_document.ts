/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/delete_document
 * Path: /api/admin/delete_document
 */

interface Env {
  DB: D1Database;
  FILES: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const { id } = (await request.json()) as { id: number };

    // 1. Find file path
    const doc: any = await env.DB.prepare('SELECT file_path FROM documents WHERE id = ?')
      .bind(id)
      .first();
    if (!doc) return new Response('Not found', { status: 404 });

    // 2. Delete from R2
    await env.FILES.delete(doc.file_path);

    // 3. Delete from D1
    await env.DB.prepare('DELETE FROM documents WHERE id = ?').bind(id).run();

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};
