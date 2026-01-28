/// <reference types="vite/client" />

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    zaraz?: {
      track: (event: string, data?: Record<string, unknown>) => void;
      consent: {
        set: (data: Record<string, boolean>) => void;
      };
    };
  }
}

export {};
