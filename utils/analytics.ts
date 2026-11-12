// Typy window.zaraz / window.gtag / window.dataLayer: vite-env.d.ts (jedno źródło deklaracji).
import { type ConsentState, checkConsentValue } from './consentValue';
import { queueZarazDelivery } from './zarazConsent';

export {
  type ConsentCheck,
  type ConsentState,
  CONSENT_STORAGE_KEY,
  checkConsentValue,
  checkStoredConsent,
} from './consentValue';
export { ZARAZ_CONSENT_API_READY_EVENT, resetConsentDeliveryForTests } from './zarazConsent';

/** Identyfikatory celów (purposes) w Zaraz Consent Management: analityka, marketing. */
const ZARAZ_PURPOSES = { analytics: 'kese', marketing: 'Pzjv' } as const;

/**
 * K2 (MIX-1375 B5, MIX-1389): Consent Mode v2 po stronie Zaraz.
 * Gdy w panelu Zaraz zaznaczono „Set Google Consent Mode v2 state”, Zaraz wysyła do GA4
 * „denied”, dopóki strona nie ustawi zastrzeżonej właściwości `google_consent_update`
 * (źródło: https://developers.cloudflare.com/zaraz/advanced/google-consent-mode/ ,
 * sekcja „Update the consent status”: `zaraz.set("google_consent_update", {...})`).
 * Domyślnie WYŁĄCZONE: włączyć (true) tylko razem z tym zaznaczeniem w panelu.
 */
export const ZARAZ_GOOGLE_CONSENT_MODE = false;

export type ApplyConsentOptions = {
  /** K2: `zaraz.set('google_consent_update', …)`; domyślnie ZARAZ_GOOGLE_CONSENT_MODE (false). */
  googleConsentMode?: boolean;
};

export const applyConsent = (consent: ConsentState, options: ApplyConsentOptions = {}) => {
  if (typeof window === 'undefined') return;
  // Fail-closed: wartość spoza allowlisty nie trafia ani do gtag, ani do Zaraz.
  const checked = checkConsentValue(consent);
  if (!checked.ok) {
    if (process.env.NODE_ENV !== 'production') console.warn(`applyConsent: ${checked.reason}`);
    return;
  }
  const { analytics, marketing } = checked.consent;
  const googleConsentMode = options.googleConsentMode ?? ZARAZ_GOOGLE_CONSENT_MODE;

  const adSignal = marketing ? 'granted' : 'denied';
  const analyticsSignal = analytics ? 'granted' : 'denied';
  const consentSettings = {
    ad_storage: adSignal,
    ad_user_data: adSignal,
    ad_personalization: adSignal,
    analytics_storage: analyticsSignal,
    personalization_storage: 'granted',
    functionality_storage: 'granted',
    security_storage: 'granted',
  };

  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', consentSettings);
  }

  queueZarazDelivery({
    purposes: { [ZARAZ_PURPOSES.analytics]: analytics, [ZARAZ_PURPOSES.marketing]: marketing },
    google: googleConsentMode
      ? {
          ad_storage: adSignal,
          ad_user_data: adSignal,
          ad_personalization: adSignal,
          analytics_storage: analyticsSignal,
        }
      : null,
  });

  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'cookie_consent_update',
    });
  }
};

/**
 * Wysyla event do Zaraz (-> GA4 jako custom event).
 * Bezpieczny - nic nie robi gdy zaraz nie zaladowany lub w SSR.
 *
 * Eventy oznaczone jako key events w GA4 (konwersje):
 * - lead_start, contact_form_success, form_submit
 * - phone_click, email_click, consultation_click
 * - calculator_submit, audit_request
 */
export const trackEvent = (eventName: string, data?: Record<string, unknown>): void => {
  if (typeof window === 'undefined') return;
  try {
    // Beacon idzie asynchronicznie: przy blokerze reklam / braku sieci Promise jest odrzucany
    // („Failed to fetch"). Bez .catch nieobsłużone odrzucenie trafiało do /api/client-error
    // jako błąd aplikacji (szum w logach + zjadało limit 5 zgłoszeń na sesję).
    const pending = window.zaraz?.track(eventName, data);
    if (pending && typeof pending.catch === 'function') pending.catch(() => undefined);
  } catch (e) {
    // Zaraz moze nie byc gotowy - nic nie blokujemy.
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`trackEvent(${eventName}) failed:`, e);
    }
  }
};

/**
 * Globalny listener na klikiniecia w `<a href="tel:...">` i `<a href="mailto:...">`.
 * Wywolaj raz w App.tsx (useEffect). Wykrywa nawet linki w dynamicznie
 * renderowanej tresci (event delegation na document).
 */
export const installContactLinkTracking = (): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;

  const handler = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const anchor = target.closest('a') as HTMLAnchorElement | null;
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    if (href.startsWith('tel:')) {
      trackEvent('phone_click', {
        phone: href.replace('tel:', ''),
        source: window.location.pathname,
      });
    } else if (href.startsWith('mailto:')) {
      trackEvent('email_click', {
        email: href.replace('mailto:', '').split('?')[0],
        source: window.location.pathname,
      });
    }
  };

  document.addEventListener('click', handler, { capture: true });
  return () => document.removeEventListener('click', handler, { capture: true });
};
