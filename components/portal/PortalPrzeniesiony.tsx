import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../common/GlassCard';

/**
 * Portal klienta przeniesiony do Mixture CRM (decyzja Karola z 25.10.2026). Dawny /portal/dashboard:
 * admin trafia do podglądu leadów, klient widzi informację. Nowy portal ma osobny adres dla każdej firmy,
 * (https://mixture-crm.pages.dev/klient/<adres-firmy>), więc nie ma jednego celu przekierowania;
 * link przychodzi e-mailem z CRM.
 */
const PortalPrzeniesiony: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user?.role === 'admin') navigate('/portal/admin', { replace: true });
  }, [user, isLoading, navigate]);

  useEffect(() => {
    document.title = 'Portal klienta przeniesiony | Mixture Marketing';
    return () => {
      document.title = 'Mixture Marketing';
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-20">
      <GlassCard className="max-w-md w-full p-8 text-center bg-white border-gray-200 shadow-xl">
        <div className="inline-flex p-3 rounded-xl bg-indigo-50 text-secondary mb-4">
          <ArrowRightLeft size={24} aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-dark mb-2">Portal klienta ma nowy adres</h1>
        <p className="text-gray-600">
          Projekty, materiały do akceptacji, wiadomości i dokumenty są teraz w nowym portalu Mixture
          Marketing. Link do logowania wysyłamy e-mailem na adres osoby kontaktowej.
        </p>
        <p className="text-gray-600 mt-4">
          Nie masz linku? Napisz do nas:{' '}
          <a className="font-bold text-secondary underline" href="mailto:info@mixturemarketing.pl">
            info@mixturemarketing.pl
          </a>
          .
        </p>
      </GlassCard>
    </div>
  );
};

export default PortalPrzeniesiony;
