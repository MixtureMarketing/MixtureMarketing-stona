import React, { useEffect } from 'react';
import AuditWizard from '../features/audit/AuditWizard';
import Seo from '../common/Seo';

const AuditPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Seo
        title="Darmowy audyt SEO + UX strony w 60 sekund — Mixture Audit 360™"
        description="Wpisz adres strony — w 60 sekund dostaniesz raport PDF: błędy SEO, Core Web Vitals, porównanie z konkurencją, ile leadów tracisz. Bez rejestracji, bez kontaktu handlowca."
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
