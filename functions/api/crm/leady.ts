/**
 * GET /api/crm/leady?od=<czas zmiany>&po_id=<id>&limit=<1-200>: leady zmienione od `od` (updated_at,
 * migracja 0009; przed nią created_at), do dociągnięcia przez Mixture CRM, gdy wysyłka w tle (_crm.ts) nie
 * przeszła. Kolejność po (czas zmiany, id); następna strona zaczyna się od `kursor` z odpowiedzi
 * (`wiecej: true`, gdy są dalsze strony).
 * CRM sam decyduje, co dopisać (brakujący lead) albo uzupełnić (dalszy krok formularza).
 * Tylko odczyt, podpis jak w _podpis.ts. Format leada jak w wysyłce do CRM (LeadDoCrm).
 */
import type { LeadDoCrm } from '../_crm';
import { bladPodpisu, blad, json, type CrmZapytanieEnv } from './_podpis';

type Env = CrmZapytanieEnv;

export const MAKS_LIMIT = 200;
const ZRODLA = ['website', 'calculator', 'audit', 'subscription'] as const;
/** Formularz kontaktowy ma 3 kroki (contact-submit.ts); inne źródła wysyłają lead jednym krokiem. */
const KROKOW_FORMULARZA = 3;

export interface WierszLeada {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  service_type: string | null;
  package_name: string | null;
  source_url: string | null;
  website: string | null;
  budget: string | null;
  message: string | null;
  details: string | null;
  current_step: number | null;
  source: string | null;
  created_at: string;
  zmiana: string;
  quote_ref: number | null;
}

/** Czas z D1 („YYYY-MM-DD HH:MM:SS”, UTC) jako ISO 8601. */
const iso = (czas: string) =>
  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(czas) ? `${czas.replace(' ', 'T')}Z` : czas;

function szczegoly(w: WierszLeada): Record<string, unknown> | null {
  let d: Record<string, unknown> = {};
  try {
    const p: unknown = w.details ? JSON.parse(w.details) : null;
    if (p && typeof p === 'object' && !Array.isArray(p)) d = p as Record<string, unknown>;
  } catch {
    // Uszkodzony JSON w details: pomijamy, reszta leada przechodzi.
  }
  if (w.website) d.website = w.website;
  if (w.package_name) d.package_name = w.package_name;
  return Object.keys(d).length ? d : null;
}

/** Wiersz tabeli leads w formacie wysyłki do CRM. */
export function leadDoCrm(w: WierszLeada): LeadDoCrm {
  const source = (ZRODLA as readonly string[]).includes(w.source ?? '')
    ? (w.source as LeadDoCrm['source'])
    : 'website';
  return {
    external_id: w.id,
    source,
    received_at: iso(w.created_at),
    source_url: w.source_url,
    name: w.name,
    company: w.company,
    email: w.email,
    phone: w.phone,
    service: w.service_type ?? w.package_name,
    budget_text: w.budget,
    message: w.message,
    details: szczegoly(w),
    quote_ref: w.quote_ref === null ? null : String(w.quote_ref),
    form_step: w.current_step,
    form_steps: source === 'website' ? KROKOW_FORMULARZA : null,
  };
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const zly = await bladPodpisu(request, env);
  if (zly) return zly;
  const p = new URL(request.url).searchParams;
  const od = p.get('od') ?? '1970-01-01 00:00:00';
  const poId = p.get('po_id') ?? '';
  const limit = Number(p.get('limit') ?? 100);
  if (!/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/.test(od))
    return blad(400, 'Parametr od: YYYY-MM-DD albo YYYY-MM-DD HH:MM:SS.');
  if (!Number.isInteger(limit) || limit < 1 || limit > MAKS_LIMIT)
    return blad(400, `Parametr limit: 1–${MAKS_LIMIT}.`);

  const { results } = await env.DB.prepare(
    `SELECT l.id, l.name, l.email, l.phone, l.company, l.service_type, l.package_name, l.source_url, l.website,
            l.budget, l.message, l.details, l.current_step, l.source, l.created_at,
            coalesce(l.updated_at, l.created_at) AS zmiana,
            (SELECT max(q.id) FROM est_quotes q WHERE q.lead_id = l.id) AS quote_ref
       FROM leads l
      WHERE coalesce(l.updated_at, l.created_at) > ?
         OR (coalesce(l.updated_at, l.created_at) = ? AND l.id > ?)
      ORDER BY zmiana, l.id
      LIMIT ?`,
  )
    .bind(od, od, poId, limit + 1)
    .all<WierszLeada>();
  const strona = results.slice(0, limit);
  const ostatni = strona.at(-1);
  return json({
    leady: strona.map(leadDoCrm),
    // Kursor ostatniego leada strony: CRM zapisuje go i od niego zaczyna następne zapytanie (tie-break po id).
    kursor: ostatni ? { od: ostatni.zmiana, po_id: ostatni.id } : null,
    wiecej: results.length > limit,
  });
};
