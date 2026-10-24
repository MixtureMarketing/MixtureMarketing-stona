import React from 'react';
import { X } from 'lucide-react';
import { Lead } from '../types';
import { toExternalHref, toTelHref } from '../../../utils/url';

interface LeadDetailsModalProps {
  lead: Lead;
  onClose: () => void;
}

const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({ lead, onClose }) => {
  // D1 trzyma firmę w kolumnie `company` (get_leads → SELECT *); `company_name` to fallback.
  const company = lead.company || lead.company_name;
  const telHref = toTelHref(lead.phone);
  const websiteHref = toExternalHref(lead.website);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-dark">Szczegóły Zgłoszenia</h2>
          <button onClick={onClose} aria-label="Zamknij">
            <X className="text-gray-400" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              Nadawca
            </div>
            <div className="font-bold text-dark">{lead.name}</div>
            <a
              href={`mailto:${lead.email}`}
              className="block text-sm text-gray-600 hover:text-secondary break-all"
            >
              {lead.email}
            </a>
            {lead.phone && (
              <div className="text-sm text-gray-600" data-testid="lead-phone">
                {telHref ? (
                  <a href={telHref} className="hover:text-secondary">
                    {lead.phone}
                  </a>
                ) : (
                  lead.phone
                )}
              </div>
            )}
          </div>
          {(company || lead.website) && (
            <div className="grid grid-cols-2 gap-4">
              {company && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Firma
                  </div>
                  <div className="text-sm text-gray-700 break-words">{company}</div>
                </div>
              )}
              {lead.website && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Strona www
                  </div>
                  {websiteHref ? (
                    <a
                      href={websiteHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-secondary hover:underline break-all"
                    >
                      {lead.website}
                    </a>
                  ) : (
                    <div className="text-sm text-gray-700 break-all">{lead.website}</div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Usługa
              </div>
              <div className="text-sm font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded inline-block">
                {lead.service_type}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Budżet
              </div>
              <div className="text-sm font-bold text-green-600">{lead.budget || '-'}</div>
            </div>
          </div>
          {lead.details && (
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <div className="text-xxs font-black text-secondary uppercase tracking-[0.2em] mb-3">
                Parametry Szczegółowe
              </div>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(JSON.parse(lead.details)).map(([key, val]) => {
                  if (!val || typeof val !== 'string') return null;
                  const label = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase());
                  return (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-500 font-medium">{label}:</span>
                      <span className="font-bold text-dark">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Treść / Opis Celu
            </div>
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap border border-gray-200 font-mono">
              {lead.message}
            </div>
          </div>
          <div className="flex justify-between gap-4 text-xs text-gray-400 pt-4 border-t border-gray-100">
            <span className="min-w-0 break-all">
              {lead.source && <>Źródło: {lead.source}</>}
              {lead.source_url && <> · {lead.source_url}</>}
            </span>
            <span className="shrink-0">
              Data: {new Date(lead.created_at).toLocaleString('pl-PL')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;
