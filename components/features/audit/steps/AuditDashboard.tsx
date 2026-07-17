import React from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { AuditResult } from '@/services/auditService';
import { getErrorDetails } from '@/data/auditErrors';

import AuditHeader from '../dashboard/AuditHeader';
import AuditScoreSidebar from '../dashboard/AuditScoreSidebar';
import BusinessLossCalculator from '../dashboard/BusinessLossCalculator';
import ModuleDetails from '../dashboard/ModuleDetails';
import ErrorList from '../dashboard/ErrorList';
import ActionPlan from '../dashboard/ActionPlan';
import TechnicalDetails from '../dashboard/TechnicalDetails';
import AuditQuickWins from '../dashboard/AuditQuickWins';
import { EASE, revealChild, SectionHead } from '../dashboard/ui';

interface AuditDashboardProps {
  data: AuditResult;
  onReset: () => void;
}

const Block: React.FC<React.PropsWithChildren> = ({ children }) => (
  <motion.div
    variants={revealChild}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: '-60px' }}
  >
    {children}
  </motion.div>
);

const AuditDashboard: React.FC<AuditDashboardProps> = ({ data, onReset }) => {
  const { client, competitor } = data;
  const score = client.total_score;
  const lcp = client.metrics.lcp_value;

  const errorDetails = getErrorDetails(
    lcp,
    client.reputation.reviews_count,
    client.reputation.rating,
  );

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_60px_-30px_rgba(16,24,40,0.18)] overflow-hidden border border-gray-200 w-full font-sans"
      >
        <AuditHeader url={client.url} onReset={onReset} />

        <div className="grid grid-cols-1 lg:grid-cols-12">
          <AuditScoreSidebar score={score} screenshot={client.screenshot} />

          <div className="lg:col-span-9 p-5 md:p-8 space-y-9 bg-white min-w-0">
            <Block>
              <BusinessLossCalculator lcp={lcp} />
            </Block>

            <div>
              <SectionHead>Analiza modułowa</SectionHead>
              <ModuleDetails client={client} competitor={competitor} score={score} />
            </div>

            <Block>
              <ErrorList auditResults={client.audit_results} errorDetails={errorDetails} />
            </Block>

            <Block>
              <ActionPlan auditResults={client.audit_results} errorDetails={errorDetails} />
            </Block>

            <Block>
              <TechnicalDetails client={client} />
            </Block>

            <Block>
              <AuditQuickWins
                lcp={lcp}
                imagesNoAlt={client.content?.images_no_alt ?? 0}
                hasAnalytics={!!client.tech?.analytics}
              />
            </Block>
          </div>
        </div>
      </motion.div>
    </MotionConfig>
  );
};

export default AuditDashboard;
