import React from 'react';
import { FileCode, Gauge, ImageIcon } from 'lucide-react';
import Accordion from '../../../common/Accordion';
import LazyHydrate from '../../../common/LazyHydrate';
import { AuditResult } from '../../../../services/auditService';

interface TechnicalDetailsProps {
  client: AuditResult['client'];
}

const TechnicalDetails: React.FC<TechnicalDetailsProps> = ({ client }) => {
  const details = client.content.details;
  const opportunities = client.metrics.opportunities;

  return (
    <LazyHydrate minHeight="200px">
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-[0.04em] text-gray-400 flex items-center gap-2">
          <FileCode size={14} className="text-gray-400" /> Szczegóły techniczne
        </h3>

        {details?.headings && details.headings.length > 0 && (
          <Accordion title={`Struktura treści · ${details.headings.length} nagłówków`}>
            <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar text-[13px] font-mono bg-[#f8f9fb] p-4 rounded-xl border border-gray-100">
              {details.headings.map((h, i: number) => (
                <div
                  key={i}
                  className={`flex gap-2 ${h.tag === 'h1' ? 'font-bold text-dark' : 'text-gray-600'}`}
                >
                  <span className="uppercase w-8 shrink-0 text-gray-400 select-none">{h.tag}</span>
                  <span className="truncate" title={h.text}>
                    {h.text}
                  </span>
                </div>
              ))}
            </div>
          </Accordion>
        )}

        {details?.images_missing_alt && details.images_missing_alt.length > 0 && (
          <Accordion
            title={`Obrazy bez opisu ALT · ${details.images_missing_alt.length} przykładów`}
          >
            <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar bg-[#f8f9fb] p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-2">
                Pliki graficzne niewidoczne dla Google (brak atrybutu alt):
              </p>
              {details.images_missing_alt.map((src: string, i: number) => (
                <div
                  key={i}
                  className="flex gap-2 items-center text-[#be123c] bg-white border border-[#fecdd3] px-2.5 py-1.5 rounded-lg"
                >
                  <ImageIcon size={13} className="shrink-0" />
                  <span className="truncate font-mono text-xs" title={src}>
                    {src}
                  </span>
                </div>
              ))}
            </div>
          </Accordion>
        )}

        {opportunities && opportunities.length > 0 && (
          <Accordion title="Top 5 możliwości przyspieszenia">
            <div className="space-y-2 bg-[#f8f9fb] p-4 rounded-xl border border-gray-100">
              {opportunities.map((op) => (
                <div
                  key={op.id}
                  className="flex justify-between items-center gap-3 px-3 py-2.5 bg-white rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Gauge size={15} className="text-[#b45309] shrink-0" />
                    <span className="font-semibold text-gray-700 text-[13px] truncate">
                      {op.title}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#b45309] bg-[#fff7ed] px-2 py-1 rounded-md whitespace-nowrap tabular-nums">
                    −{Math.round(op.savings)} ms
                  </span>
                </div>
              ))}
            </div>
          </Accordion>
        )}
      </div>
    </LazyHydrate>
  );
};

export default TechnicalDetails;
