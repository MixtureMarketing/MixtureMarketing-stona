// K1 (MIX-1389): kolejka przekazania zgody do Zaraz Consent API.
// Typy window.zaraz: vite-env.d.ts.

/**
 * Zdarzenie Consent API Zaraz (źródło: https://developers.cloudflare.com/zaraz/consent-management/api/ ,
 * „Events → Consent API Ready”; właściwość `zaraz.consent.APIReady` w „Properties”).
 */
export const ZARAZ_CONSENT_API_READY_EVENT = 'zarazConsentAPIReady';

export type ZarazDelivery = {
  purposes: Record<string, boolean>;
  google: Record<string, 'granted' | 'denied'> | null;
};

// K1 (MIX-1389): przekazanie do Zaraz czeka na gotowość Consent API. Jedna oczekująca
// paczka (ostatnia wygrywa), jeden nasłuch zdarzenia, ta sama paczka nie idzie dwa razy.
let pendingDelivery: ZarazDelivery | null = null;
let lastDelivered: string | null = null;
let waitingForApi = false;

/** true = paczka wysłana albo nie ma czego wysyłać; false = API jeszcze niegotowe. */
const deliverToZaraz = (apiSignalled: boolean): boolean => {
  if (!pendingDelivery) return true;
  const zaraz = window.zaraz;
  const consentApi = zaraz?.consent;
  const ready =
    !!consentApi &&
    typeof consentApi.set === 'function' &&
    (apiSignalled || consentApi.APIReady === true);
  if (!zaraz || !consentApi || !ready) return false;

  const delivery = pendingDelivery;
  pendingDelivery = null;
  const fingerprint = JSON.stringify(delivery);
  if (fingerprint === lastDelivered) return true;
  try {
    consentApi.set(delivery.purposes);
    if (delivery.google && typeof zaraz.set === 'function') {
      zaraz.set('google_consent_update', delivery.google);
    }
    lastDelivered = fingerprint;
  } catch (e) {
    console.error('Zaraz consent error:', e);
  }
  return true;
};

const onConsentApiReady = () => {
  if (deliverToZaraz(true)) {
    document.removeEventListener(ZARAZ_CONSENT_API_READY_EVENT, onConsentApiReady);
    waitingForApi = false;
  }
};

export const queueZarazDelivery = (delivery: ZarazDelivery) => {
  pendingDelivery = delivery;
  if (deliverToZaraz(false)) return;
  if (!waitingForApi && typeof document !== 'undefined') {
    document.addEventListener(ZARAZ_CONSENT_API_READY_EVENT, onConsentApiReady);
    waitingForApi = true;
  }
};

/** Tylko testy: czyści stan kolejki między przypadkami. */
export const resetConsentDeliveryForTests = (): void => {
  pendingDelivery = null;
  lastDelivered = null;
  if (waitingForApi && typeof document !== 'undefined') {
    document.removeEventListener(ZARAZ_CONSENT_API_READY_EVENT, onConsentApiReady);
  }
  waitingForApi = false;
};
