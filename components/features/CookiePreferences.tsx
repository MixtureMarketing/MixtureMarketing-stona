import React from 'react';
import { ShieldCheck, BarChart3, Megaphone } from 'lucide-react';
import { ConsentState } from '../../utils/analytics';

interface CookiePreferencesProps {
  preferences: ConsentState;
  onToggle: (key: keyof ConsentState) => void;
}

const CookiePreferences: React.FC<CookiePreferencesProps> = ({ preferences, onToggle }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-4 animate-fade-in border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-green-600" aria-hidden="true" />
          <div>
            <div className="font-bold text-dark text-sm">Niezbędne</div>
            <div className="text-xs text-gray-600">
              Wymagane do działania strony (bezpieczeństwo, logowanie).
            </div>
          </div>
        </div>
        <input
          type="checkbox"
          checked
          disabled
          className="w-5 h-5 accent-[#3F3D91] opacity-50 cursor-not-allowed"
          aria-label="Niezbędne cookies"
        />
      </div>

      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => onToggle('analytics')}
      >
        <div className="flex items-center gap-3">
          <BarChart3 size={20} className="text-accent-dark" aria-hidden="true" />
          <div>
            <div className="font-bold text-dark text-sm">Analityczne</div>
            <div className="text-xs text-gray-600">
              Pomagają nam ulepszać stronę (Google Analytics).
            </div>
          </div>
        </div>
        <button
          className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ${preferences.analytics ? 'bg-secondary' : 'bg-gray-300'}`}
          aria-pressed={preferences.analytics}
          aria-label="Zgoda na ciasteczka analityczne"
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${preferences.analytics ? 'translate-x-5' : ''}`}
          ></div>
        </button>
      </div>

      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => onToggle('marketing')}
      >
        <div className="flex items-center gap-3">
          <Megaphone size={20} className="text-accent-dark" aria-hidden="true" />
          <div>
            <div className="font-bold text-dark text-sm">Marketingowe</div>
            <div className="text-xs text-gray-600">
              Pozwalają dopasować reklamy do Twoich potrzeb (Google Ads, Meta).
            </div>
          </div>
        </div>
        <button
          className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ${preferences.marketing ? 'bg-secondary' : 'bg-gray-300'}`}
          aria-pressed={preferences.marketing}
          aria-label="Zgoda na ciasteczka marketingowe"
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${preferences.marketing ? 'translate-x-5' : ''}`}
          ></div>
        </button>
      </div>
    </div>
  );
};

export default CookiePreferences;
