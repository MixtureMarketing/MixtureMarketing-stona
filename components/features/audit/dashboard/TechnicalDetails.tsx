import React from 'react';
import { FileCode, Gauge, ImageIcon } from 'lucide-react';
import Accordion from '../../../common/Accordion';
import LazyHydrate from '../../../common/LazyHydrate';
import { AuditResult } from '../../../../services/auditService';

interface TechnicalDetailsProps {
  client: AuditResult['client'];
}

const TechnicalDetails: React.FC<TechnicalDetailsProps> = ({ client }) => {
  return (
    <LazyHydrate minHeight="400px">
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-black text-dark uppercase tracking-tight flex items-center gap-2">
          <FileCode className="text-gray-500" /> Szczegóły Techniczne (Raport V2)
        </h3>

        {/* 1. Struktura Nagłówków */}
        {client.content.details?.headings && client.content.details.headings.length > 0 && (
          <Accordion
            title={`Struktura Treści (${client.content.details.headings.length} nagłówków)`}
          >
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar text-sm font-mono bg-gray-50 p-4 rounded-xl">
              {client.content.details.headings.map((h, i: number) => (
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

        {/* 2. Brakujące ALT */}
        {client.content.details?.images_missing_alt &&
          client.content.details.images_missing_alt.length > 0 && (
            <Accordion
              title={`Obrazy bez opisu ALT (${client.content.details.images_missing_alt.length} przykładów)`}
            >
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar text-sm bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-2 italic">
                  Oto lista plików graficznych, które nie są widoczne dla Google (brak atrybutu
                  alt):
                </p>
                {client.content.details.images_missing_alt.map((src: string, i: number) => (
                  <div
                    key={i}
                    className="flex gap-2 items-center text-red-500 bg-white border border-red-100 p-2 rounded shadow-sm"
                  >
                    <ImageIcon size={14} className="shrink-0" />
                    <span className="truncate font-mono text-xs" title={src}>
                      {src}
                    </span>
                  </div>
                ))}
              </div>
            </Accordion>
          )}

        {/* 3. Lighthouse Opportunities */}
        {client.metrics.opportunities && client.metrics.opportunities.length > 0 && (
          <Accordion title={`Top 5 Możliwości Przyspieszenia`}>
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
              {client.metrics.opportunities.map((op) => (
                <div
                  key={op.id}
                  className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Gauge size={16} className="text-yellow-600" />
                    <span className="font-bold text-gray-700 text-sm">{op.title}</span>
                  </div>
                  <span className="text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full whitespace-nowrap">
                    Oszczędź {Math.round(op.savings)}ms
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
