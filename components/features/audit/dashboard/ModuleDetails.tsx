import React from 'react';
import { motion } from 'framer-motion';
import PerformanceModule from './modules/PerformanceModule';
import ReputationModule from './modules/ReputationModule';
import LocalSeoModule from './modules/LocalSeoModule';
import MarketingModule from './modules/MarketingModule';
import TechModule from './modules/TechModule';
import CompetitionModule from './modules/CompetitionModule';
import ContentDnaModule from './modules/ContentDnaModule';
import { AuditResult } from '../../../../services/auditService';
import { RevealGroup, revealChild } from './ui';

interface ModuleDetailsProps {
  client: AuditResult['client'];
  competitor?: AuditResult['competitor'];
  score: number;
}

const Tile: React.FC<React.PropsWithChildren<{ span: string }>> = ({ span, children }) => (
  <motion.div variants={revealChild} className={`${span} min-w-0`}>
    {children}
  </motion.div>
);

const ModuleDetails: React.FC<ModuleDetailsProps> = ({ client, competitor, score }) => {
  return (
    <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
      <Tile span="lg:col-span-2">
        <PerformanceModule lcp={client.metrics.lcp_value} />
      </Tile>
      <Tile span="lg:col-span-2">
        <ReputationModule
          rating={client.reputation.rating}
          reviewsCount={client.reputation.reviews_count}
        />
      </Tile>
      <Tile span="lg:col-span-2">
        <LocalSeoModule local={client.seo.local} />
      </Tile>
      <Tile span="sm:col-span-2 lg:col-span-3">
        <MarketingModule analytics={client.tech.analytics} pixel={client.tech.pixel} />
      </Tile>
      <Tile span="sm:col-span-2 lg:col-span-3">
        <TechModule
          cms={client.tech.cms}
          ssl={client.tech.ssl}
          accessibility={client.metrics.scores?.accessibility}
          socialCount={Object.values(client.social || {}).filter(Boolean).length}
        />
      </Tile>
      <Tile span="sm:col-span-2 lg:col-span-6">
        <ContentDnaModule content={client.content} />
      </Tile>
      {competitor && (
        <Tile span="sm:col-span-2 lg:col-span-6">
          <CompetitionModule competitor={competitor} score={score} />
        </Tile>
      )}
    </RevealGroup>
  );
};

export default ModuleDetails;
