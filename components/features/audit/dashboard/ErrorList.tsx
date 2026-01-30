import React, { useState } from 'react';
import { AlertCircle, XCircle, Zap } from 'lucide-react';
import { ErrorDetail } from '../../../../data/auditErrors';
import Button from '../../../common/Button';
import LazyHydrate from '../../../common/LazyHydrate';

interface ErrorListProps {
  auditResults: Record<string, boolean>;
  errorDetails: Record<string, ErrorDetail>;
}

const ErrorList: React.FC<ErrorListProps> = ({ auditResults, errorDetails }) => {
  const [expandedError, setExpandedError] = useState<string | null>(null);

  const toggleError = (key: string) => {
    setExpandedError(expandedError === key ? null : key);
  };

  const activeErrors = Object.entries(auditResults).filter(
    ([key, active]) => active && errorDetails[key],
  );

  return (
    <LazyHydrate minHeight="400px">
      <div className="space-y-4">
        <h3 className="text-lg font-black text-dark uppercase tracking-tight flex items-center gap-2">
          <AlertCircle className="text-red-500" /> Wykryte błędy ({activeErrors.length})
        </h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {activeErrors.map(([key]) => {
            const error = errorDetails[key];
            const isExpanded = expandedError === key;
            const priorityColor =
              error.priority === 'red' ? 'red' : error.priority === 'yellow' ? 'yellow' : 'blue';
            const PriorityIcon =
              error.priority === 'red' ? XCircle : error.priority === 'yellow' ? AlertCircle : Zap;

            return (
              <div
                key={key}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isExpanded
                    ? 'bg-white shadow-lg border-gray-200'
                    : `bg-${priorityColor}-50 border-${priorityColor}-100 hover:bg-white hover:shadow-md cursor-pointer`
                }`}
              >
                <div
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleError(key)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`mt-1 p-2 rounded-full ${
                        error.priority === 'red'
                          ? 'bg-red-100 text-red-600'
                          : error.priority === 'yellow'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      <PriorityIcon size={20} />
                    </div>
                    <div>
                      <div
                        className={`font-bold text-sm uppercase tracking-tight ${
                          error.priority === 'red'
                            ? 'text-red-900'
                            : error.priority === 'yellow'
                              ? 'text-yellow-900'
                              : 'text-blue-900'
                        }`}
                      >
                        {error.title}
                      </div>
                      <div className="text-xs font-semibold text-gray-500 mt-0.5">
                        {error.impact}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="#9CA3AF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div
                  className={`px-4 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="pt-2 pl-[52px] pr-4">
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{error.desc}</p>

                    {error.dataValue && (
                      <div className="bg-gray-50 px-3 py-2 rounded-lg inline-block text-xs font-mono text-gray-500 mb-4 border border-gray-100">
                        🖥️ {error.dataValue}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 justify-start">
                      <a href={error.offerLink} target="_blank" rel="noopener noreferrer">
                        <Button variant="primary" size="sm" className="text-xs font-bold">
                          {error.cta} ➔
                        </Button>
                      </a>

                      {error.articleLink && (
                        <a
                          href={error.articleLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 text-xs font-bold text-gray-500 hover:text-secondary border border-transparent hover:border-gray-200 rounded-lg transition-all"
                        >
                          Dowiedz się więcej 📖
                        </a>
                      )}
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
