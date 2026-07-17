import React, { useEffect } from 'react';
import AuditWizard from '../features/audit/AuditWizard';
import Seo from '../common/Seo';

const AuditPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* SEO 2026-07-17: „porównanie z konkurencją" usunięte (niedostarczane —
          backend nie liczy competitor), „60 sekund" → „minutę" (PSI bywa
          wolniejsze); raport PDF od dziś realnie wysyłany użytkownikowi. */}
      <Seo
        title="Darmowy audyt SEO + UX strony — Mixture Audit 360™"
        description="Wpisz adres strony — w około minutę dostaniesz wynik online i raport PDF na maila: błędy SEO, Core Web Vitals, analityka. Bez rejestracji, bez kontaktu handlowca."
        canonical="/audyt-360/"
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Darmowy audyt SEO + UX', item: '/audyt-360/' },
        ]}
      />
      <div className="pt-20">
        <AuditWizard />
      </div>
    </>
  );
};

export default AuditPage;
