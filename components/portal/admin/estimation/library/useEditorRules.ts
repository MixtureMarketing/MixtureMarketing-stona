import { useCallback, useEffect, useState } from 'react';
import type { RawRuleRow } from './ruleAdapter';

// Pełny odczyt reguł dla edytora (f2c-2a): GET /library?scope=editor zwraca reguły też NIEAKTYWNE
// + is_active + id. Osobno od useEstimationLibrary (engine-facing, tylko aktywne) — nie mieszamy
// źródła podglądu wizarda z pełnym odczytem edytora. `reload()` po zapisie.
export function useEditorRules(sessionToken: string | null) {
  const [rules, setRules] = useState<RawRuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!sessionToken) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/estimation/library?scope=editor', {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { rules: RawRuleRow[] };
        if (!cancelled) setRules(data.rules ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Błąd ładowania reguł');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionToken, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { rules, loading, error, reload };
}
