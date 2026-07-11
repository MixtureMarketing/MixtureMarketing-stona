/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: portal/download
 * Path: /api/portal/download?id=123
 */

interface Env {
  DB: D1Database;
  FILES: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env, data } = context;
  const user = data.user as { id: number; role: string };
  const url = new URL(request.url);
  const docId = url.searchParams.get('id');

  if (!docId || !Number.isInteger(Number(docId))) {
    return new Response('Missing or invalid ID', { status: 400 });
  }

  try {
    // 1. Permissions check
    const doc: any = await env.DB.prepare(
      `
      SELECT d.file_path, d.name, p.user_id 
      FROM documents d
      JOIN projects p ON d.project_id = p.id
      WHERE d.id = ?
    `,
    )
      .bind(docId)
      .first();

    if (!doc) return new Response('File not found in database', { status: 404 });

    const isAdmin = user.role === 'admin';
    if (!isAdmin && doc.user_id !== user.id) {
      return new Response('Unauthorized', { status: 403 });
    }

    // 2. Fetch from R2
    const object = await env.FILES.get(doc.file_path);

    if (!object) {
      return new Response('File not found in storage (R2). Please ensure files are migrated.', {
        status: 404,
      });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Content-Disposition', `inline; filename="${doc.name}"`);
    headers.set('Cache-Control', 'private, max-age=3600');

    return new Response(object.body, { headers });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};
