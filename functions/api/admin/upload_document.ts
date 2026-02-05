/**
 * Cloudflare Pages Function: admin/upload_document
 * Path: /api/admin/upload_document
 */

interface Env {
  DB: D1Database;
  FILES: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const project_id = formData.get('project_id') as string;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const subtype = formData.get('subtype') as string;
    const file = formData.get('file') as File;

    if (!project_id || !file) {
      return new Response('Missing project_id or file', { status: 400 });
    }

    // 1. Generate R2 key (path)
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const r2Key = `uploads/docs/${project_id}_${timestamp}_${cleanFileName}`;

    // 2. Upload to R2
    await env.FILES.put(r2Key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type }
    });

    // 3. Save reference to D1
    await env.DB.prepare(`
      INSERT INTO documents (project_id, name, file_path, type, subtype)
      VALUES (?, ?, ?, ?, ?)
    `).bind(project_id, name || file.name, r2Key, type || 'document', subtype || 'other').run();

    return new Response(JSON.stringify({ status: 'success', key: r2Key }), { status: 200 });

  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};
