import React from 'react';
import { FileText } from 'lucide-react';
import { Lead } from '../types';

interface AdminLeadsProps {
  leads: Lead[];
  onViewDetails: (lead: Lead) => void;
  onConvert: (leadId: string) => void;
  onReply: (lead: Lead) => void;
}

const AdminLeads: React.FC<AdminLeadsProps> = ({ leads, onViewDetails, onConvert, onReply }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Klient / Usługa</th>
              <th className="px-6 py-4">Postęp</th>
              <th className="px-6 py-4">Wiadomość</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className={`hover:bg-gray-50 transition-colors ${lead.status === 'new' ? 'bg-blue-50/30' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs relative">
                  {lead.status === 'new' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                  )}
                  {new Date(lead.created_at).toLocaleString('pl-PL')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-dark">{lead.name || 'Anonim'}</div>
                    {lead.status === 'new' && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">{lead.email}</div>
                  <div className="text-xxs uppercase font-bold text-primary mt-1">
                    {lead.service_type} {lead.package_name && `• ${lead.package_name}`}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 w-20">
                    <div className="text-xxs font-bold text-gray-400 uppercase">
                      Krok {lead.current_step || 1}/3
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${lead.current_step >= 3 ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${(lead.current_step / 3) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-600 line-clamp-2 max-w-xs">
                    {lead.message || 'Brak treści'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xxs font-bold uppercase ${
                      lead.status === 'new'
                        ? 'bg-blue-100 text-blue-600'
                        : lead.status === 'converted'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {lead.status === 'new'
                      ? 'Nowy'
                      : lead.status === 'converted'
                        ? 'KLIENT'
                        : 'Kontakt'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button
                    onClick={() => onViewDetails(lead)}
                    className="p-2 text-gray-500 hover:text-secondary hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zobacz szczegóły"
                  >
                    <FileText size={16} />
                  </button>
                  {lead.status !== 'converted' && (
                    <button
                      onClick={() => onConvert(lead.id)}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors"
                      title="Utwórz konto klienta"
                    >
                      Zrób Klienta
                    </button>
                  )}
                  <button
                    onClick={() => onReply(lead)}
                    className="px-3 py-1 bg-secondary text-white rounded-lg text-xs font-bold hover:bg-dark transition-colors"
                  >
                    Odpisz
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLeads;
