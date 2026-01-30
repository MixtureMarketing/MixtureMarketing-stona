import React from 'react';
import { MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { AuditResult } from '../../../../../services/auditService';

interface LocalSeoModuleProps {
  local: AuditResult['client']['seo']['local'];
}

const LocalSeoModule: React.FC<LocalSeoModuleProps> = ({ local }) => {
  return (
    <div className="group p-8 bg-white rounded-3xl border border-blue-50 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <MapPin size={24} />
          </div>
          {local?.city && (
            <span className="text-xxs font-black uppercase bg-blue-500 text-white px-3 py-1.5 rounded-lg shadow-sm">
              {local.city}
            </span>
          )}
        </div>
        <h4 className="text-xl font-black text-dark mb-4">Lokalne SEO</h4>
        {local?.city ? (
          <ul className="space-y-2.5">
            {[
              { l: 'W Tytule', v: local.in_title },
              { l: 'W Nagłówku H1', v: local.in_h1 },
              { l: 'W Treści', v: local.in_content },
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100/50"
              >
                <span className="text-xxs font-black text-gray-400 uppercase tracking-wider">
                  {item.l}
                </span>
                {item.v ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <XCircle size={16} className="text-rose-400" />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-400 italic leading-relaxed">
            Nie wykryto miasta. Upewnij się, że Twoja wizytówka Google jest poprawnie połączona.
          </p>
        )}
      </div>
    </div>
  );
};

export default LocalSeoModule;
