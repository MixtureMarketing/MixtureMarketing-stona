/**
 * Stary panel na stronie wyłączony (decyzja Karola z 25.10.2026): portal klienta, Klienci, Projekty, Czat,
 * Metryki i Wyceny są w Mixture CRM. Na stronie zostaje logowanie admina i podgląd leadów (tylko odczyt)
 * oraz publiczny kalkulator /wycena/. Wyłączone endpointy odpowiadają 410 Gone z tym komunikatem.
 */
export const PANEL_PRZENIESIONY =
  'Ta część panelu została przeniesiona do Mixture CRM. Na stronie zostaje tylko podgląd leadów.';

/** Jedyna ścieżka admina, która zostaje: lista leadów do podglądu. */
export const ADMIN_DOZWOLONE = new Set(['GET /api/admin/get_leads']);

/**
 * Biblioteka wycen strony (tabele est_*) jest zamrożona (decyzja M1 z 25.10.2026): kalkulator /wycena/
 * liczy z niej dalej, a bibliotekę prowadzi CRM. Zmiana, import i każdy inny zapis biblioteki to 403,
 * żeby nikt nie prowadził dwóch bibliotek naraz. Synchronizację kalkulatora z CRM decyduje Karol.
 */
export const BIBLIOTEKA_ZAMROZONA =
  'Biblioteka wycen na stronie jest zamrożona. Moduły i cele zmienia się w Mixture CRM.';

export const edycjaBiblioteki = (metoda: string, sciezka: string) =>
  metoda !== 'GET' && sciezka.startsWith('/api/admin/estimation/library');

const json = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export const przeniesione = () => json(410, PANEL_PRZENIESIONY);
export const bibliotekaZamrozona = () => json(403, BIBLIOTEKA_ZAMROZONA);
