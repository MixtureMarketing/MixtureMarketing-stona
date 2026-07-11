import React from 'react';
import { ListTodo, AlertCircle, Zap } from 'lucide-react';
import { ErrorDetail } from '../../../../data/auditErrors';
import LazyHydrate from '../../../common/LazyHydrate';

interface ActionPlanProps {
  auditResults: Record<string, boolean>;
  errorDetails: Record<string, ErrorDetail>;
}

const PriorityColumn: React.FC<{
  title: string;
  errors: [string, boolean][];
  errorDetails: Record<string, ErrorDetail>;
  tone: 'red' | 'yellow';
  icon: React.ReactNode;
}> = ({ title, errors, errorDetails, tone, icon }) => {
  const c =
    tone === 'red'
      ? { head: 'text-[#be123c]', dot: 'border-[#e11d48]', dotIn: 'bg-[#e11d48]' }
      : { head: 'text-[#b45309]', dot: 'border-[#f4b400]', dotIn: 'bg-[#f4b400]' };

  return (
    <div className="bg-[#fbfcfd] rounded-xl p-5 border border-gray-200 h-full">
      <h4
        className={`text-[12.5px] font-bold ${c.head} uppercase tracking-[0.03em] mb-3.5 flex items-center gap-2`}
      >
        {icon} {title}
      </h4>
      <div className="space-y-2.5">
        {errors.map(([k]) => (
          <div
            key={k}
            className="flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-100"
          >
            <span
              className={`mt-0.5 w-5 h-5 rounded-full border-2 ${c.dot} grid place-items-center shrink-0`}
            >
              <span className={`w-2 h-2 ${c.dotIn} rounded-full`} />
            </span>
            <span className="min-w-0">
              <span className="text-dark font-semibold text-[13px] block">
                {errorDetails[k]?.title}
              </span>
              <span className="text-gray-500 text-[12px]">Działanie: {errorDetails[k]?.cta}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActionPlan: React.FC<ActionPlanProps> = ({ auditResults, errorDetails }) => {
  const redErrors = Object.entries(auditResults).filter(
    ([k, v]) => v && errorDetails[k]?.priority === 'red',
  );
  const yellowErrors = Object.entries(auditResults).filter(
    ([k, v]) => v && errorDetails[k]?.priority === 'yellow',
  );

  return (
    <LazyHydrate minHeight="240px">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-7 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <h3 className="text-[17px] font-bold text-dark mb-5 flex items-center gap-2.5">
          <ListTodo size={20} className="text-secondary" /> Twój plan naprawczy
        </h3>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {redErrors.length > 0 && (
            <PriorityColumn
              title="Krytyczny — zrób to teraz"
              errors={redErrors}
              errorDetails={errorDetails}
              tone="red"
              icon={<AlertCircle size={15} />}
            />
          )}
          {yellowErrors.length > 0 && (
            <PriorityColumn
              title="Wysoki — zaplanuj w tym tygodniu"
              errors={yellowErrors}
              errorDetails={errorDetails}
              tone="yellow"
              icon={<Zap size={15} />}
            />
          )}
        </div>
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-[13px] mb-3">Nie masz czasu na samodzielne naprawy?</p>
          <a
            href="/kontakt"
            target="_blank"
            className="inline-flex items-center gap-2 text-secondary font-semibold hover:underline"
          >
            Skorzystaj z pomocy ekspertów Mixture Marketing →
          </a>
        </div>
      </div>
    </LazyHydrate>
  );
};

export default ActionPlan;
