import React from 'react';
import { FileText, ShieldCheck, FileDown } from 'lucide-react';
import GlassCard from '../../common/GlassCard';
import { Project } from '../types';

interface PortalDocumentsProps {
  projects: Project[];
  onDownload: (docId: string, fileName: string) => void;
}

const PortalDocuments: React.FC<PortalDocumentsProps> = ({ projects, onDownload }) => {
  const allDocs = projects.flatMap((p) => p.documents || []);
  const invoices = allDocs.filter((d) => d.type === 'invoice');
  const contracts = allDocs.filter((d) => d.type === 'document');

  return (
    <div className="grid md:grid-cols-2 gap-8 mb-16">
      {/* Invoices Column */}
      <GlassCard className="bg-white border border-gray-100 p-8 flex flex-col h-full">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-dark">Faktury i Rozliczenia</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Bieżące płatności
            </p>
          </div>
        </div>

        <div className="space-y-3 flex-1">
          {invoices.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-gray-50 rounded-2xl">
              <p className="text-sm text-gray-400 italic">Brak wystawionych faktur</p>
            </div>
          ) : (
            invoices.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors group"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-dark">{doc.name}</span>
                  <span className="text-xxs text-gray-400">
                    {new Date(doc.created_at).toLocaleDateString('pl-PL')}
                  </span>
                </div>
                <button
                  onClick={() => onDownload(doc.id, doc.name)}
                  className="p-2 bg-white text-blue-600 rounded-xl shadow-sm hover:scale-110 transition-transform cursor-pointer"
                  title="Pobierz fakturę"
                >
                  <FileDown size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* Documents Column */}
      <GlassCard className="bg-white border border-gray-100 p-8 flex flex-col h-full">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-dark">Umowy i Dokumenty</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Formalności i NDA
            </p>
          </div>
        </div>

        <div className="space-y-3 flex-1">
          {contracts.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-gray-50 rounded-2xl">
              <p className="text-sm text-gray-400 italic">Brak dokumentów projektowych</p>
            </div>
          ) : (
            contracts.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-purple-50 transition-colors group"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-dark">{doc.name}</span>
                    <span className="text-xxs px-1.5 py-0.5 bg-white text-purple-600 border border-purple-100 rounded-md font-bold uppercase">
                      {doc.subtype}
                    </span>
                  </div>
                  <span className="text-xxs text-gray-400">
                    {new Date(doc.created_at).toLocaleDateString('pl-PL')}
                  </span>
                </div>
                <button
                  onClick={() => onDownload(doc.id, doc.name)}
                  className="p-2 bg-white text-purple-600 rounded-xl shadow-sm hover:scale-110 transition-transform cursor-pointer"
                  title="Pobierz dokument"
                >
                  <FileDown size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default PortalDocuments;
