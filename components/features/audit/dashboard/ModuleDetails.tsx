import React from 'react';
import PerformanceModule from './modules/PerformanceModule';
import ReputationModule from './modules/ReputationModule';
import LocalSeoModule from './modules/LocalSeoModule';
import MarketingModule from './modules/MarketingModule';
import TechModule from './modules/TechModule';
import CompetitionModule from './modules/CompetitionModule';
import ContentDnaModule from './modules/ContentDnaModule';
import { AuditResult } from '../../../../services/auditService';

interface ModuleDetailsProps {
  client: AuditResult['client'];
  competitor?: AuditResult['competitor'];
  score: number;
}

const ModuleDetails: React.FC<ModuleDetailsProps> = ({ client, competitor, score }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <PerformanceModule lcp={client.metrics.lcp_value} />
      <ReputationModule
        rating={client.reputation.rating}
        reviewsCount={client.reputation.reviews_count}
      />
      <LocalSeoModule local={client.seo.local} />
      <MarketingModule analytics={client.tech.analytics} pixel={client.tech.pixel} />
      <TechModule
        cms={client.tech.cms}
        ssl={client.tech.ssl}
        accessibility={client.metrics.scores?.accessibility}
        socialCount={Object.values(client.social || {}).filter(Boolean).length}
      />
      <CompetitionModule competitor={competitor} score={score} />
      <ContentDnaModule content={client.content} />
    </div>
  );
};

export default ModuleDetails;
