import React, { useState, useEffect, useRef } from 'react';
import { Cookie, Check, Settings, ChevronUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { ConsentState, applyConsent } from '../../utils/analytics';
import CookiePreferences from './CookiePreferences';
import CookieFloatingButton from './CookieFloatingButton';

const CookieBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentState>({
    analytics: false,
    marketing: false,
  });
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookie-consent-v2');
    if (!storedConsent) {
      setTimeout(() => setIsOpen(true), 0);
    } else {
      const parsedConsent = JSON.parse(storedConsent);
      setTimeout(() => {
        setPreferences(parsedConsent);
        applyConsent(parsedConsent);
      }, 0);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
      if (e.key === 'Tab' && bannerRef.current) {
        const focusableSelector =
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusableElements = bannerRef.current.querySelectorAll(focusableSelector);
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (
            document.activeElement === firstElement ||
            document.activeElement === bannerRef.current
          ) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      const focusable = bannerRef.current?.querySelector('button, [href], input');
      if (focusable instanceof HTMLElement) focusable.focus();
      else bannerRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen]);

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

  if (!isOpen) {
    return <CookieFloatingButton onClick={() => setIsOpen(true)} />;
  }

  return (
    <div
      ref={bannerRef}
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-fade-in-up"
      // region zamiast complementary — banner renderuje się wewnątrz landmarku,
      // a complementary musi być top-level (axe: landmark-complementary-is-top-level)
      role="region"
      aria-label="Baner plików cookies"
      tabIndex={-1}
    >
      <div className="max-w-screen-lg mx-auto bg-white/95 backdrop-blur-md border border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Zamknij"
        >
          <X size={20} />
        </button>

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

          {showPreferences && (
            <CookiePreferences preferences={preferences} onToggle={togglePreference} />
          )}

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
