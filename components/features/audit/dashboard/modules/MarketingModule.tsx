import React from 'react';
import { TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

interface MarketingModuleProps {
  analytics: boolean;
  pixel: boolean;
}

const MarketingModule: React.FC<MarketingModuleProps> = ({ analytics, pixel }) => {
  return (
    <div className="group p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-100 transition-colors"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
        </div>
        <h4 className="text-xl font-black text-dark mb-4">Analityka</h4>
        <ul className="space-y-2.5">
          <li className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100/50">
            <span className="text-xxs font-black text-gray-400 uppercase tracking-wider">
              Google Analytics 4
            </span>
            {analytics ? (
              <CheckCircle2 size={16} className="text-emerald-500" />
            ) : (
              <XCircle size={16} className="text-rose-400" />
            )}
          </li>
          <li className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100/50">
            <span className="text-xxs font-black text-gray-400 uppercase tracking-wider">
              Meta Pixel
            </span>
            {pixel ? (
              <CheckCircle2 size={16} className="text-emerald-500" />
            ) : (
              <XCircle size={16} className="text-rose-400" />
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MarketingModule;
