/// <reference types="vite/client" />

declare global {
  interface Window {
    isPrerendering?: boolean;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    zaraz?: {
      track: (event: string, data?: Record<string, unknown>) => void | Promise<unknown>;
      // zaraz.set(key, value): m.in. zastrzeżony klucz `google_consent_update` (Consent Mode v2).
      set?: (key: string, value: unknown) => void;
      consent: {
        // true, gdy Consent API jest gotowe (Cloudflare Zaraz, Consent API → Properties).
        APIReady?: boolean;
        set: (data: Record<string, boolean>) => void;
      };
    };
  }
}

export {};
