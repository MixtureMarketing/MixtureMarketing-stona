import React from 'react';
import { RefreshCw, Home, Phone } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';

interface CmsErrorStateProps {
  onRetry: () => void;
}

/**
 * Stan „chwilowo nie udało się wczytać treści” (błąd pobrania z CMS).
 * CELOWO bez <Seo noindex> i bez tytułu 404 — to nie jest „brak strony”.
 * `data-cms-error` łapie bramka w prerender.js (taki HTML nie może trafić do dist/).
 */
const CmsErrorState: React.FC<CmsErrorStateProps> = ({ onRetry }) => (
  <div
    data-cms-error=""
    role="alert"
    className="min-h-[70vh] flex flex-col items-center justify-center px-4 pt-32 pb-20 text-center"
  >
    <h1 className="text-3xl md:text-4xl font-black text-dark mb-4">Nie udało się wczytać treści</h1>
    <p className="text-lg text-gray-600 max-w-xl mb-8">
      To chwilowy problem z połączeniem — strona istnieje. Spróbuj ponownie za moment.
    </p>
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-white bg-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#213261]"
      >
        <RefreshCw size={18} aria-hidden="true" /> Spróbuj ponownie
      </button>
      <a
        href="/"
        className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold border-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
      >
        <Home size={18} aria-hidden="true" /> Strona główna
      </a>
    </div>
    <p className="mt-8 text-sm text-gray-600">
      Pilna sprawa?{' '}
      <a
        href={`tel:${SITE_CONFIG.contact.phoneFull}`}
        className="inline-flex items-center gap-1 font-bold text-secondary underline"
      >
        <Phone size={14} aria-hidden="true" /> {SITE_CONFIG.contact.phone}
      </a>
    </p>
  </div>
);

export default CmsErrorState;
