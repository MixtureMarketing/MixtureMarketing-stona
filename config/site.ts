/**
 * Global site configuration.
 * Centralizing these values makes it easier to update contact info, social links, and other global metadata.
 */

import { resolveTurnstileSiteKey } from './turnstileKey';
import { SITE_IDENTITY } from './siteIdentity';

export const SITE_CONFIG = {
  ...SITE_IDENTITY,
  contact: {
    ...SITE_IDENTITY.contact,
    // Cloudflare Turnstile Site Key. Publiczny - przeznaczony do osadzenia w kodzie frontend.
    // MIX-1934: wartość ze zmiennej budowy VITE_TURNSTILE_SITE_KEY (allowlista w strażniku
    // vite.config.ts; Preview = klucz testowy Cloudflare), brak = klucz produkcyjny.
    // Sekret TURNSTILE_SECRET żyje w zmiennych Functions Cloudflare Pages.
    turnstileSiteKey: resolveTurnstileSiteKey(import.meta.env.VITE_TURNSTILE_SITE_KEY),
  },
  social: {
    facebook: 'https://www.facebook.com/MixtureMarketing',
    instagram: 'https://www.instagram.com/mixture_marketing/',
    linkedin: 'https://pl.linkedin.com/company/mixture-marketing',
    tiktok: 'https://www.tiktok.com/@mixturemarketing',
  },
  /**
   * Wizytówka firmy w Google (MIX-1020). Profil nie ma adresu — tylko obszar działania —
   * więc w JSON-LD zamiast adresu biura wirtualnego idą `areaServed` + te linki.
   * - `profileUrl`: link od Jakuba (przycisk „Zobacz nas w Google”),
   * - `knowledgeGraphUrl`: stały adres profilu (kgmid) do `sameAs` / `hasMap`,
   * - `reviewUrl`: link „Wystaw opinię” z panelu (od Karola). PUSTY = przycisk ukryty.
   */
  google: {
    profileUrl: 'https://share.google/U5QLwlwd3Ls52C3An',
    knowledgeGraphUrl: 'https://www.google.com/search?kgmid=/g/11t_svlzz2',
    reviewUrl: 'https://g.page/r/CTeu70P5NjsgEBM/review',
  },
};
