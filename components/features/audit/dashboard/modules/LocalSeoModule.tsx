import React from 'react';
import { MapPin, Check, X } from 'lucide-react';
import { AuditResult } from '../../../../../services/auditService';
import { cardCls, IconTile } from '../ui';

interface LocalSeoModuleProps {
  local: AuditResult['client']['seo']['local'];
}

const LocalSeoModule: React.FC<LocalSeoModuleProps> = ({ local }) => {
  return (
    <div className={`${cardCls} h-full p-5`}>
      <div className="flex items-start justify-between mb-3.5">
        <IconTile tone="blue">
          <MapPin size={20} />
        </IconTile>
        {local?.city && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#eaf4fb] text-dark">
            {local.city}
          </span>
        )}
      </div>
      <h4 className="text-[15px] font-bold text-dark mb-3">Lokalne SEO</h4>
      {local?.city ? (
        <ul className="flex flex-col gap-2">
          {[
            { l: 'W tytule', v: local.in_title },
            { l: 'W nagłówku H1', v: local.in_h1 },
            { l: 'W treści', v: local.in_content },
          ].map((item, i) => (
            <li
              key={i}
              className="flex items-center justify-between text-[12.5px] text-gray-600 px-3 py-2.5 bg-[#f8f9fb] border border-gray-100 rounded-lg"
            >
              <span>{item.l}</span>
              {item.v ? (
                <Check size={16} className="text-success" />
              ) : (
                <X size={16} className="text-gray-300" />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12.5px] text-gray-400 leading-relaxed">
          Nie wykryto miasta. Upewnij się, że wizytówka Google jest poprawnie połączona.
        </p>
      )}
    </div>
  );
};

export default LocalSeoModule;
