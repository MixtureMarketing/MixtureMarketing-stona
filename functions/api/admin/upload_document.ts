/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/upload_document
 * Path: /api/admin/upload_document
 */

import { ValidationError, badRequest, optText, reqId } from '../_shared/input';
import { serverError } from '../_shared/errors';

interface Env {
  DB: D1Database;
  FILES: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') return badRequest('Brak pliku do wgrania.');
    const project_id = reqId(formData.get('project_id'), 'Projekt');
    const name = optText(formData.get('name'), 'Nazwa', 200);
    const type = formData.get('type') === 'invoice' ? 'invoice' : 'document';
    const subtype = optText(formData.get('subtype'), 'Podtyp', 50);

    // 1. Generate R2 key (path)
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const r2Key = `uploads/docs/${project_id}_${timestamp}_${cleanFileName}`;

    // 2. Upload to R2
    await env.FILES.put(r2Key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    // 3. Save reference to D1
    await env.DB.prepare(
      `
      INSERT INTO documents (project_id, name, file_path, type, subtype)
      VALUES (?, ?, ?, ?, ?)
    `,
    )
      .bind(project_id, name || file.name, r2Key, type, subtype || 'other')
      .run();

    return new Response(JSON.stringify({ status: 'success', key: r2Key }), { status: 200 });
  } catch (err: any) {
    if (err instanceof ValidationError) return badRequest(err.message);
    return serverError(err, 'admin/upload_document');
  }
};
