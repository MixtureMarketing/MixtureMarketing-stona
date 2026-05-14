declare global {
  interface Window {
    zaraz?: {
      consent: {
        set: (data: Record<string, boolean>) => void;
      };
      track: (event: string, data?: Record<string, unknown>) => void;
    };
    dataLayer: Record<string, unknown>[];
  }
  const gtag: (...args: unknown[]) => void;
}

export type ConsentState = {
  analytics: boolean;
  marketing: boolean;
};

export const applyConsent = (consent: ConsentState) => {
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

  if (typeof window !== 'undefined' && window.dataLayer) {
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
    window.zaraz?.track(eventName, data);
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
