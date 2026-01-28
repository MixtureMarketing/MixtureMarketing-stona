/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  Cookie,
  Check,
  Settings,
  ChevronUp,
  ShieldCheck,
  BarChart3,
  Megaphone,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    zaraz?: {
      consent: {
        set: (data: Record<string, boolean>) => void;
      };
    };
  }
}

// Helper to push to dataLayer safely
const gtag = (...args: unknown[]) => {
  if (typeof window !== 'undefined') {
    if (typeof window.gtag === 'function') {
      window.gtag(...args);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(args);
    }
  }
};

type ConsentState = {
  analytics: boolean;
  marketing: boolean;
};

const CookieBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentState>({
    analytics: false,
    marketing: false,
  });

  const applyConsent = (consent: ConsentState) => {
    const consentSettings = {
      ad_storage: consent.marketing ? 'granted' : 'denied',
      ad_user_data: consent.marketing ? 'granted' : 'denied',
      ad_personalization: consent.marketing ? 'granted' : 'denied',
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      personalization_storage: 'granted',
      functionality_storage: 'granted',
      security_storage: 'granted',
    };

    gtag('consent', 'update', consentSettings);

    // Update Cloudflare Zaraz Consent
    if (typeof window !== 'undefined' && window.zaraz?.consent) {
      try {
        window.zaraz.consent.set({
          kese: consent.analytics,
          Pzjv: consent.marketing,
        });
      } catch (e) {
        console.error('Zaraz consent error:', e);
      }
    }

    // Push event to trigger GTM tags immediately
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'cookie_consent_update',
      });
    }
  };

  useEffect(() => {
    // Check local storage
    const storedConsent = localStorage.getItem('cookie-consent-v2');

    if (!storedConsent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
    } else {
      // Restore consent state on reload for GTM
      const parsedConsent = JSON.parse(storedConsent);
      setPreferences(parsedConsent); // Sync state with stored values
      applyConsent(parsedConsent);
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = { analytics: true, marketing: true };
    setPreferences(fullConsent);
    localStorage.setItem('cookie-consent-v2', JSON.stringify(fullConsent));
    applyConsent(fullConsent);
    setIsOpen(false);
  };

  const handleRejectAll = () => {
    const noConsent = { analytics: false, marketing: false };
    setPreferences(noConsent);
    localStorage.setItem('cookie-consent-v2', JSON.stringify(noConsent));
    applyConsent(noConsent);
    setIsOpen(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent-v2', JSON.stringify(preferences));
    applyConsent(preferences);
    setIsOpen(false);
  };

  const togglePreference = (key: keyof ConsentState) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // FLOATING BUTTON STATE (When Banner is Closed)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[90] p-3 bg-white text-secondary rounded-full shadow-lg border border-gray-100 hover:scale-110 transition-transform duration-300 group"
        aria-label="Ustawienia plików cookies"
      >
        <Cookie size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="sr-only">Ustawienia Cookies</span>

        {/* Tooltip */}
        <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1 bg-dark text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Ustawienia prywatności
        </span>
      </button>
    );
  }

  // FULL BANNER STATE
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-fade-in-up">
      <div className="max-w-screen-lg mx-auto bg-white/95 backdrop-blur-md border border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden relative">
        {/* Close Button (X) */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Zamknij"
        >
          <X size={20} />
        </button>

        {/* Main Banner Content */}
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-start gap-4 pr-8">
            <div className="p-3 bg-blue-50 text-secondary rounded-xl shrink-0 hidden md:flex">
              <Cookie size={24} aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-dark text-lg mb-2">Ustawienia prywatności</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Używamy plików cookies, aby strona działała poprawnie (niezbędne) oraz – za Twoją
                zgodą – do analizy ruchu i personalizacji reklam. Możesz dostosować swoje wybory
                poniżej. Szczegóły w{' '}
                <Link
                  to="/privacy-policy/"
                  className="text-accent-dark hover:underline font-medium"
                >
                  Polityce Prywatności
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Expanded Preferences Section */}
          {showPreferences && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-4 animate-fade-in border border-gray-100">
              {/* Essential */}
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

              {/* Analytics */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => togglePreference('analytics')}
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

              {/* Marketing */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => togglePreference('marketing')}
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
          )}

          {/* Actions */}
          <div className="flex flex-col md:flex-row items-center gap-3 justify-end pt-2">
            {!showPreferences ? (
              <>
                <button
                  onClick={handleRejectAll}
                  className="w-full md:w-auto px-4 py-2.5 rounded-xl text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors"
                >
                  Odrzuć opcjonalne
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-dark font-bold text-sm hover:bg-white hover:border-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Settings size={16} /> Dostosuj
                </button>
                <Button
                  onClick={handleAcceptAll}
                  className="w-full md:w-auto justify-center shadow-lg shadow-secondary/20"
                  icon={<Check size={18} />}
                >
                  Akceptuję wszystkie
                </Button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="w-full md:w-auto px-4 py-2.5 rounded-xl text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                >
                  <ChevronUp size={16} /> Zwiń
                </button>
                <Button onClick={handleSavePreferences} className="w-full md:w-auto justify-center">
                  Zapisz wybrane
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
