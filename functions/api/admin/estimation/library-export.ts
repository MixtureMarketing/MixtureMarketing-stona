/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/estimation/library-export
 * Path: /api/admin/estimation/library-export
 * Auth: dziedziczona z admin/_middleware.ts (rola admin).
 * GET — pełny zrzut biblioteki wiedzy (wszystkie wiersze, też nieaktywne) jako plik JSON (f2c-2b).
 * Backup treści + wejście do importu/round-tripu. NIE dotyka warstwy wycen.
 */
import { readLibraryTables } from './packDb';
import { buildExport } from '../../../../lib/estimation/libraryPack';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const pack = buildExport(await readLibraryTables(env.DB));
    const date = pack.exported_at.slice(0, 10);
    return new Response(JSON.stringify(pack, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="biblioteka-wycen-${date}.json"`,
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
