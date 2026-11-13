// MIX-1457: JEDYNE miejsce, z ktorego zdarzenie GA4 wychodzi ze strony (zaraz.track albo dataLayer).
// Typy window.zaraz / window.dataLayer: vite-env.d.ts.
import { type RefusalWhy, sanitizeGa4Event } from './ga4Events';
import { cleanPageContext } from './ga4Page';

const REASON: Record<RefusalWhy, string> = {
  personal: 'wyglada na e-mail lub telefon',
  unreadable: 'nieczytelny',
  format: 'poza allowlista',
};

const devWarn = (line: string): void => {
  if (import.meta.env.DEV) console.warn(`trackEvent: ${line}`);
};

export type Ga4Channel = 'zaraz' | 'dataLayer';

/**
 * MIX-1457: JEDYNE miejsce, z ktorego zdarzenie GA4 wychodzi ze strony (zaraz.track albo
 * dataLayer). Brama `sanitizeGa4Event` (utils/ga4Events.ts): nieznana nazwa = zdarzenie nie idzie;
 * parametr spoza rodzaju albo wygladajacy na e-mail / telefon = wartosc "(odrzucone)", zdarzenie
 * idzie. page_location / page_referrer / page_title czysci ten sam detektor. Odmowa daje linie
 * w konsoli (nazwa parametru i powod, bez wartosci) tylko w trybie dev.
 */
export const sendGa4 = (eventName: string, data?: unknown, via: Ga4Channel = 'zaraz'): void => {
  if (typeof window === 'undefined') return;
  const checked = sanitizeGa4Event(eventName, data);
  if (!checked.ok) {
    devWarn(checked.reason);
    return;
  }
  const page = cleanPageContext({
    location: window.location.href,
    referrer: document.referrer,
    title: document.title,
  });
  const refused = [...checked.refused, ...page.refused];
  if (refused.length > 0) {
    const what = refused.map((r) => `${r.param} (${REASON[r.why]})`).join(', ');
    devWarn(`${eventName}: odrzucone ${what}`);
  }
  const payload = { ...checked.params, ...page.params };
  if (via === 'dataLayer') {
    window.dataLayer?.push({ event: eventName, ...payload });
    return;
  }
  try {
    // Beacon idzie asynchronicznie: przy blokerze reklam / braku sieci Promise jest odrzucany
    // („Failed to fetch"). Bez .catch nieobsłużone odrzucenie trafiało do /api/client-error
    // jako błąd aplikacji (szum w logach + zjadało limit 5 zgłoszeń na sesję).
    const pending = window.zaraz?.track(eventName, payload);
    if (pending && typeof pending.catch === 'function') pending.catch(() => undefined);
  } catch (e) {
    // Zaraz moze nie byc gotowy - nic nie blokujemy.
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`trackEvent(${eventName}) failed:`, e);
    }
  }
};
