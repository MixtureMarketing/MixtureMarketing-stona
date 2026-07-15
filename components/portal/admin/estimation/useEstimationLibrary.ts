import { useEffect, useState } from 'react';
import type { RawRule } from './engineAdapter';

export interface LibQuestion {
  code: string;
  text: string;
  help_text: string | null;
  answer_type: 'bool' | 'select' | 'multiselect' | 'number' | 'text';
  options_json: string | null;
  allow_unknown: number;
  visibility: string;
  unknown_weight: number;
  visible_if_json: string | null;
  question_group: string | null;
  sort_order: number;
}
export interface LibArchetype {
  code: string;
  name: string;
  description: string | null;
  integration_mode: string;
}

export interface EstimationLibrary {
  aspects: { code: string; name: string; category: string; description: string | null }[];
  levels: { aspect_code: string; level: number; hours_min: number; hours_max: number }[];
  archetypes: LibArchetype[];
  archetypeDefaults: {
    archetype_code: string;
    aspect_code: string;
    default_level: number;
    is_locked: number;
  }[];
  questions: LibQuestion[];
  rules: RawRule[];
  modules: {
    code: string;
    name: string;
    hours_min: number;
    hours_max: number;
    risk: string;
    archetypes_json?: string | null;
    goals_json?: string | null;
  }[];
  integrations: {
    code: string;
    name: string;
    category: string;
    hours_platform_min: number | null;
    hours_platform_max: number | null;
    hours_custom_min: number;
    hours_custom_max: number;
    risk: string;
  }[];
  multipliers: { code: string; name: string; value: number }[];
  /** Typy pozycji kosztowych (D14) — stawki dla akcji reguł `cost_item` (np. dojazd zł/km). */
  costItemTypes: { code: string; name: string; unit: string | null; unit_price: number | null }[];
  params: { key: string; value: string }[];
}

/** Ładuje pełną bibliotekę wiedzy dla silnika w UI (podgląd/Platforma). */
export function useEstimationLibrary(sessionToken: string | null) {
  const [library, setLibrary] = useState<EstimationLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionToken) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/estimation/library', {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as EstimationLibrary;
        if (!cancelled) setLibrary(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Błąd ładowania biblioteki');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionToken]);

  return { library, loading, error };
}
