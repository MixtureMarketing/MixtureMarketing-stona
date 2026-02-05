import React from 'react';
import { motion } from 'framer-motion';
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

interface AuditDashboardProps {
  data: AuditResult;
  onReset: () => void;
}

const AuditDashboard: React.FC<AuditDashboardProps> = ({ data, onReset }) => {
  const { client, competitor } = data;
  const score = client.total_score;
  const lcp = client.metrics?.lcp_value ?? 2.5;

  const errorDetails = getErrorDetails(
    lcp,
    client.reputation?.reviews_count ?? 0,
    client.reputation?.rating ?? 0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 w-full font-sans"
    >
      <AuditHeader url={client.url} onReset={onReset} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        <AuditScoreSidebar score={score} screenshot={client.screenshot} />

        <div className="lg:col-span-9 p-6 md:p-12 space-y-12 bg-white">
          <BusinessLossCalculator lcp={lcp} />

          <ModuleDetails client={client} competitor={competitor} score={score} />

          <ErrorList auditResults={client.audit_results} errorDetails={errorDetails} />

          <ActionPlan auditResults={client.audit_results} errorDetails={errorDetails} />

          <TechnicalDetails client={client} />

          <AuditQuickWins />
        </div>
      </div>
    </motion.div>
  );
};

export default AuditDashboard;
