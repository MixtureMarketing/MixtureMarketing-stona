import React, { useState, useEffect, useRef } from 'react';
import { Cookie, Check, Settings, ChevronUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import {
  CONSENT_STORAGE_KEY as CONSENT_KEY,
  ConsentState,
  applyConsent,
  checkStoredConsent,
} from '../../utils/analytics';
import CookiePreferences from './CookiePreferences';
import CookieFloatingButton from './CookieFloatingButton';
import { safeGetItem, safeSetItem } from '../../utils/safeStorage';
import { isCookieBannerStaticEnabled } from '../../config/flags';

// Ten sam wzorzec co w App.tsx (UA Headless lub flaga ustawiana przez prerender.js).
const isPrerenderingEnv = () =>
  typeof window !== 'undefined' &&
  (window.navigator.userAgent.includes('Headless') || window.isPrerendering === true);

// Tylko prerender.js (zrzut do dist/), bez heurystyki UA: przeglądarka headless u gościa
// zostaje przy dotychczasowym zachowaniu (baner się nie otwiera).
const isSnapshotRender = () => typeof window !== 'undefined' && window.isPrerendering === true;

const CookieBanner: React.FC = () => {
  // MIX-1579 (VITE_MM_COOKIE_BANNER_STATIC): baner jest w prerenderowanym HTML, więc maluje się
  // z pierwszą klatką, a nie po starcie Reacta (był elementem LCP po 4–5 s na telefonie).
  // Zrzut: baner otwarty (gościom z zapisaną zgodą chowa go skrypt w <head>, index.html).
  // Przeglądarka: stan od razu w pierwszym renderze (ta sama allowlista co w efekcie niżej),
  // żeby podmiana prerenderu przez Reacta nie zamykała i nie otwierała banera ponownie.
  const staticBanner = isCookieBannerStaticEnabled();
  const staticSnapshot = staticBanner && isSnapshotRender();
  const [isOpen, setIsOpen] = useState(() => {
    if (!staticBanner) return false;
    if (staticSnapshot) return true;
    if (isPrerenderingEnv()) return false;
    return !checkStoredConsent(safeGetItem(CONSENT_KEY)).ok;
  });
  // Wejście z animacją (opacity 0 → 1) tylko przy otwarciu przyciskiem: baner obecny już
  // w HTML nie może znikać i wjeżdżać od nowa przy podmianie prerenderu.
  const [entrance, setEntrance] = useState(!staticBanner);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentState>({
    analytics: false,
    marketing: false,
  });
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prerender (Puppeteer): banera nie otwieramy — inaczej otwarty baner
    // zostałby wypalony w każdym dist/**/index.html. Zostaje FloatingButton,
    // a decyzję o otwarciu podejmuje dopiero przeglądarka użytkownika.
    if (isPrerenderingEnv()) return;

    // Allowlista (fail-closed, MIX-1389): zablokowany storage, uszkodzony JSON, obiekt
    // niepełny, z obcym polem albo z nie-boolean = brak zgody → baner, nic do Zaraz.
    // applyConsent sam czeka na gotowość Consent API Zaraz (K1), więc wyścig z ładowaniem
    // Zaraz nie gubi zgody powracającego gościa.
    const stored = checkStoredConsent(safeGetItem(CONSENT_KEY));
    if (!stored.ok) {
      setTimeout(() => setIsOpen(true), 0);
    } else {
      setTimeout(() => {
        setPreferences(stored.consent);
        applyConsent(stored.consent);
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
    safeSetItem(CONSENT_KEY, JSON.stringify(fullConsent));
    applyConsent(fullConsent);
    setIsOpen(false);
  };

  const handleRejectAll = () => {
    const noConsent = { analytics: false, marketing: false };
    setPreferences(noConsent);
    safeSetItem(CONSENT_KEY, JSON.stringify(noConsent));
    applyConsent(noConsent);
    setIsOpen(false);
  };

  const handleSavePreferences = () => {
    safeSetItem(CONSENT_KEY, JSON.stringify(preferences));
    applyConsent(preferences);
    setIsOpen(false);
  };

  const togglePreference = (key: keyof ConsentState) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) {
    return (
      <CookieFloatingButton
        onClick={() => {
          setEntrance(true);
          setIsOpen(true);
        }}
      />
    );
  }

  const banner = (
    <div
      ref={bannerRef}
      className={`fixed bottom-0 left-0 right-0 z-[100] p-4${entrance ? ' animate-fade-in-up' : ''}${staticSnapshot ? ' mm-zgoda-baner' : ''}`}
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

  if (!staticSnapshot) return banner;
  // Zrzut: przycisk też trafia do HTML, ukryty (`hidden`). Skrypt w <head> przy zapisanej
  // zgodzie chowa baner (.mm-zgoda-baner) i pokazuje przycisk (.mm-zgoda-przycisk).
  return (
    <>
      {banner}
      <CookieFloatingButton onClick={() => setIsOpen(true)} className="mm-zgoda-przycisk hidden" />
    </>
  );
};

export default CookieBanner;
