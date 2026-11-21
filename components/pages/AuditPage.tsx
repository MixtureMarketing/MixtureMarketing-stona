import React from 'react';
import AuditWizard from '../features/audit/AuditWizard';
import Seo from '../common/Seo';

const AuditPage: React.FC = () => {
  return (
    <>
      {/* SEO 2026-07-17: „porównanie z konkurencją" usunięte (niedostarczane —
          backend nie liczy competitor), „60 sekund" → „minutę" (PSI bywa
          wolniejsze); raport PDF od dziś realnie wysyłany użytkownikowi.
          MIX-1323 (decyzja właściciela, MIX-1311): wszędzie jedna forma „60 sekund". */}
      <Seo
        title="Darmowy audyt SEO + UX strony — Mixture Audit 360™"
        description="Wpisz adres strony — w 60 sekund dostaniesz wynik online i raport PDF na maila: błędy SEO, Core Web Vitals, analityka. Bez rejestracji i handlowca."
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
