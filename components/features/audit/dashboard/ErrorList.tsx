import React, { useState } from 'react';
import { AlertTriangle, XCircle, AlertCircle, Zap, ChevronDown } from 'lucide-react';
import { ErrorDetail } from '../../../../data/auditErrors';
import Button from '../../../common/Button';
import LazyHydrate from '../../../common/LazyHydrate';

interface ErrorListProps {
  auditResults: Record<string, boolean>;
  errorDetails: Record<string, ErrorDetail>;
}

const TONES = {
  red: { tile: 'bg-[#fff1f2] text-[#be123c]', Icon: XCircle },
  yellow: { tile: 'bg-[#fff7ed] text-[#b45309]', Icon: AlertCircle },
  blue: { tile: 'bg-[#eaf4fb] text-dark', Icon: Zap },
} as const;

const ErrorList: React.FC<ErrorListProps> = ({ auditResults, errorDetails }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const activeErrors = Object.entries(auditResults).filter(
    ([key, active]) => active && errorDetails[key],
  );

  return (
    <LazyHydrate minHeight="240px">
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-[0.04em] text-gray-400 flex items-center gap-2">
          <AlertTriangle size={14} className="text-[#be123c]" /> Wykryte błędy ·{' '}
          <span className="tabular-nums">{activeErrors.length}</span>
        </h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
          {activeErrors.map(([key]) => {
            const error = errorDetails[key];
            const isOpen = expanded === key;
            const tone = TONES[error.priority as keyof typeof TONES] ?? TONES.blue;
            const Icon = tone.Icon;

            return (
              <div
                key={key}
                className={`rounded-xl border bg-white transition-all duration-200 ${
                  isOpen
                    ? 'border-gray-300 shadow-[0_1px_2px_rgba(16,24,40,0.04)]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  className="w-full p-4 flex items-center gap-3 text-left"
                  onClick={() => setExpanded(isOpen ? null : key)}
                >
                  <span
                    className={`w-9 h-9 rounded-[9px] grid place-items-center shrink-0 ${tone.tile}`}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-bold text-dark truncate">
                      {error.title}
                    </span>
                    <span className="block text-[12px] text-gray-400 truncate">{error.impact}</span>
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-300 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 pl-16">
                      <p className="text-[13px] text-gray-600 leading-relaxed mb-3">{error.desc}</p>
                      {error.dataValue && (
                        <div className="bg-[#f8f9fb] px-3 py-1.5 rounded-lg inline-block text-xs font-mono text-gray-500 mb-3 border border-gray-100">
                          {error.dataValue}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2.5">
                        <a href={error.offerLink} target="_blank" rel="noopener noreferrer">
                          <Button variant="primary" size="sm" className="text-xs font-bold">
                            {error.cta} →
                          </Button>
                        </a>
                        {error.articleLink && (
                          <a
                            href={error.articleLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-gray-500 hover:text-secondary border border-gray-200 hover:border-gray-300 rounded-lg transition-colors"
                          >
                            Dowiedz się więcej
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </LazyHydrate>
  );
};

export default ErrorList;
