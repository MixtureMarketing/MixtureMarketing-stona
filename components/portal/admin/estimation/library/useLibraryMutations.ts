import { useState } from 'react';
import type { LibraryEntity } from '@/lib/estimation/libraryEdit';

export interface PatchResult {
  ok: boolean;
  errors?: string[];
}

/** PATCH pojedynczego wiersza biblioteki. Zwraca błędy walidacji serwera (twarde granice)
 *  zamiast rzucać — UI pokazuje je przy formularzu. */
export function useLibraryMutations(sessionToken: string | null) {
  const [saving, setSaving] = useState(false);

  const patchRow = async (
    entity: LibraryEntity,
    key: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Promise<PatchResult> => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/estimation/library', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ entity, key, patch }),
      });
      const data = (await res.json().catch(() => ({}))) as { errors?: string[]; error?: string };
      if (!res.ok)
        return { ok: false, errors: data.errors ?? [data.error ?? `HTTP ${res.status}`] };
      return { ok: true };
    } catch (e) {
      return { ok: false, errors: [e instanceof Error ? e.message : 'Błąd zapisu'] };
    } finally {
      setSaving(false);
    }
  };

  return { patchRow, saving };
}
