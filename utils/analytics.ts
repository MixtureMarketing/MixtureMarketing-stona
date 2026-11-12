// Typy window.zaraz / window.gtag / window.dataLayer: vite-env.d.ts (jedno źródło deklaracji).
import { type ConsentState, checkConsentValue } from './consentValue';
import { contactLinkOf, linkLocationOf, linkScheme } from './ga4Events';
import { sendGa4 } from './ga4Send';
import { queueZarazDelivery } from './zarazConsent';

export { ga4RefusalCounts, resetGa4RefusalCountsForTests, sendGa4 } from './ga4Send';

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

  // MIX-1457: także ten sygnał idzie przez jedną bramę zdarzeń (sendGa4).
  sendGa4('cookie_consent_update', {}, 'dataLayer');
};

/**
 * Wysyla event do Zaraz (-> GA4 jako custom event) przez `sendGa4`.
 * Bezpieczny - nic nie robi gdy zaraz nie zaladowany lub w SSR.
 *
 * Eventy oznaczone jako key events w GA4 (konwersje):
 * - lead_start, contact_form_success, form_submit
 * - click_phone, click_email, consultation_click
 * - calculator_submit (hooks/usePublicCalculator), audit_request (AuditWizard)
 */
export const trackEvent = (eventName: string, data?: Record<string, unknown>): void =>
  sendGa4(eventName, data, 'zaraz');

/**
 * Globalny listener na klikniecia w `<a href="tel:...">` i `<a href="mailto:...">`.
 * Wywolaj raz w App.tsx (useEffect). Wykrywa nawet linki w dynamicznie
 * renderowanej tresci (event delegation na document).
 *
 * MIX-1457 (slownik P4): `click_phone` / `click_email` z jednym parametrem `link_location`
 * (header / footer / section). Numer, adres i sciezka strony NIE ida do GA4.
 */
export const installContactLinkTracking = (): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;

  const handler = (e: MouseEvent) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const anchor = contactLinkOf(target);
    if (!anchor) return;
    const scheme = linkScheme(anchor);
    const event = scheme === 'tel:' ? 'click_phone' : scheme === 'mailto:' ? 'click_email' : null;
    if (event) trackEvent(event, { link_location: linkLocationOf(anchor) });
  };

  document.addEventListener('click', handler, { capture: true });
  return () => document.removeEventListener('click', handler, { capture: true });
};
