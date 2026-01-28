/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
        title="Darmowy Audyt Strony WWW & SEO | Mixture Audit 360™"
        description="Sprawdź błędy na swojej stronie, porównaj się z konkurencją i oblicz, ile pieniędzy tracisz. Odbierz darmowy raport PDF w 60 sekund."
      />
      <div className="pt-20">
        <AuditWizard />
      </div>
    </>
  );
};

export default AuditPage;
