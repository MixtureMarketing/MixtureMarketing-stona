export type ConsentState = {
  analytics: boolean;
  marketing: boolean;
};

export const gtag = (...args: unknown[]) => {
  if (typeof window !== 'undefined') {
    if (typeof window.gtag === 'function') {
      window.gtag(...args);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(args);
    }
  }
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
