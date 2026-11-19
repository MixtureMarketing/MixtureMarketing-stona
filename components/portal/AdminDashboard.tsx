import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import AdminLeads from './admin/AdminLeads';
import { LeadDetailsModal } from './admin/AdminModals';
import { Lead } from './types';
import { asArray } from '../../utils/sessionExpiry';

/**
 * Panel admina po przeniesieniu do Mixture CRM (decyzja Karola z 25.10.2026): Klienci, Projekty, Czat,
 * Metryki i Wyceny są w CRM. Tu zostaje podgląd leadów, tylko do odczytu (bez „Odpisz” i „Zrób klienta”).
 * Leady i tak trafiają do CRM: webhook (functions/api/_crm.ts) i dociąganie (functions/api/crm/leady.ts).
 * Komponenty starych zakładek (admin/AdminClients, AdminProjects, AdminChat, AdminMetrics, estimation/)
 * zostają w repo do usunięcia w osobnym PR.
 */
const ADRES_CRM = 'https://mixture-crm.pages.dev';

const AdminDashboard: React.FC = () => {
  const { user, sessionToken, isLoading, authFetch } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [blad, setBlad] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    // Brak użytkownika (np. sesja wygasła → AuthContext wylogował) → logowanie;
    // zalogowany nie-admin → strona o przeniesionym portalu klienta.
    if (!user) navigate('/portal', { replace: true });
    else if (user.role !== 'admin') navigate('/portal/dashboard');
  }, [user, isLoading, navigate]);

  const pobierzLeady = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const res = await authFetch(`/api/admin/get_leads?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status} (get_leads)`);
      const next = asArray<Lead>((await res.json())?.leads);
      setLeads((prev) => (JSON.stringify(prev) !== JSON.stringify(next) ? next : prev));
      setBlad(false);
    } catch (e) {
      // Wygasła sesja: authFetch już wylogował, efekt wyżej przeniesie na logowanie.
      console.error(e);
      setBlad(true);
    }
    // authFetch jest stabilny (useCallback po sessionToken w AuthContext), więc interwał niżej
    // nie startuje od nowa przy każdym renderze.
  }, [sessionToken, authFetch]);

  useEffect(() => {
    if (!sessionToken) return;
    Promise.resolve().then(pobierzLeady);
    const interval = setInterval(pobierzLeady, 30000);
    return () => clearInterval(interval);
  }, [sessionToken, pobierzLeady]);

  if (isLoading || !user) return null;

  return (
    // pt-28 = Navbar strony (fixed, h-20) + dotychczasowy odstęp p-8.
    <div className="min-h-screen bg-slate-50 px-4 pb-8 pt-28 sm:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h1 className="text-3xl font-black text-dark">Leady ze strony</h1>
          <a
            href={ADRES_CRM}
            className="px-4 py-2 rounded-lg font-bold bg-dark text-white flex items-center gap-2"
          >
            Otwórz Mixture CRM <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
        <p
          role="status"
          className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg p-3 mb-6"
        >
          Klienci, projekty, czat, metryki i wyceny są teraz w Mixture CRM. Tu zostaje podgląd
          leadów, tylko do odczytu; odpowiedź do leada i zamiana na klienta są w CRM.
        </p>

        {blad && (
          <p
            role="alert"
            className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
          >
            Nie udało się pobrać leadów. Odświeżymy listę za 30 sekund; jeśli błąd zostaje, sprawdź
            leady w Mixture CRM.
          </p>
        )}

        <AdminLeads leads={leads} onViewDetails={setViewingLead} />

        {viewingLead && (
          <LeadDetailsModal lead={viewingLead} onClose={() => setViewingLead(null)} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
