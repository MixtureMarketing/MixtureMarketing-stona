/**
 * Stary panel na stronie wyłączony (decyzja Karola z 25.10.2026): portal klienta, Klienci, Projekty, Czat,
 * Metryki i Wyceny są w Mixture CRM. Na stronie zostaje logowanie admina i podgląd leadów (tylko odczyt)
 * oraz publiczny kalkulator /wycena/. Wyłączone endpointy odpowiadają 410 Gone z tym komunikatem.
 */
export const PANEL_PRZENIESIONY =
  'Ta część panelu została przeniesiona do Mixture CRM. Na stronie zostaje tylko podgląd leadów.';

/** Jedyna ścieżka admina, która zostaje: lista leadów do podglądu. */
export const ADMIN_DOZWOLONE = new Set(['GET /api/admin/get_leads']);

export const przeniesione = () =>
  new Response(JSON.stringify({ error: PANEL_PRZENIESIONY }), {
    status: 410,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
