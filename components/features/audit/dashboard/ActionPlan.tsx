import React from 'react';
import { ListTodo, AlertCircle, Zap } from 'lucide-react';
import { ErrorDetail } from '../../../../data/auditErrors';
import LazyHydrate from '../../../common/LazyHydrate';

interface ActionPlanProps {
  auditResults: Record<string, boolean>;
  errorDetails: Record<string, ErrorDetail>;
}

const ActionPlan: React.FC<ActionPlanProps> = ({ auditResults, errorDetails }) => {
  const redErrors = Object.entries(auditResults).filter(
    ([k, v]) => v && errorDetails[k]?.priority === 'red',
  );
  const yellowErrors = Object.entries(auditResults).filter(
    ([k, v]) => v && errorDetails[k]?.priority === 'yellow',
  );

  return (
    <LazyHydrate minHeight="400px">
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg mt-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
        <div className="absolute top-0 left-0 w-2 h-full bg-secondary"></div>
        <h3 className="text-xl font-black text-dark mb-6 flex items-center gap-2">
          <ListTodo size={24} className="text-secondary" /> Twój Plan Naprawczy
        </h3>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {redErrors.length > 0 && (
            <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 h-full">
              <h4 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle size={16} /> Priorytet: Krytyczny (Zrób to teraz)
              </h4>
              <div className="space-y-3">
                {redErrors.map(([k]) => (
                  <div
                    key={k}
                    className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-sm border border-red-50"
                  >
                    <div className="mt-1 min-w-[20px]">
                      <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-800 font-bold text-sm block">
                        {errorDetails[k]?.title}
                      </span>
                      <span className="text-gray-500 text-xs font-medium">
                        Działanie: {errorDetails[k]?.cta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {yellowErrors.length > 0 && (
            <div className="bg-yellow-50/50 rounded-2xl p-6 border border-yellow-100 h-full">
              <h4 className="text-sm font-bold text-yellow-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap size={16} /> Priorytet: Wysoki (Zaplanuj w tym tygodniu)
              </h4>
              <div className="space-y-3">
                {yellowErrors.map(([k]) => (
                  <div
                    key={k}
                    className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-sm border border-yellow-50"
                  >
                    <div className="mt-1 min-w-[20px]">
                      <div className="w-5 h-5 rounded-full border-2 border-yellow-400 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-800 font-bold text-sm block">
                        {errorDetails[k]?.title}
                      </span>
                      <span className="text-gray-500 text-xs font-medium">
                        Działanie: {errorDetails[k]?.cta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm mb-4">Nie masz czasu na samodzielne naprawy?</p>
          <a
            href="/kontakt"
            target="_blank"
            className="inline-flex items-center gap-2 text-secondary font-bold hover:underline"
          >
            Skorzystaj z pomocy ekspertów Mixture Marketing ➔
          </a>
        </div>
      </div>
    </LazyHydrate>
  );
};

export default ActionPlan;
