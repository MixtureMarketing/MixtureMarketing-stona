import { SITE_CONFIG } from '../config/site';

export interface GoogleProfileConfig {
  profileUrl: string;
  knowledgeGraphUrl: string;
  reviewUrl: string;
}

export interface GoogleProfileLinks {
  profileUrl: string | null;
  reviewUrl: string | null;
}

/** Link ma być pokazany tylko, gdy jest niepustym adresem https (pusty/spacje/inny schemat = ukryty). */
export const cleanHttpsUrl = (value: string | null | undefined): string | null => {
  const url = (value ?? '').trim();
  if (!url) return null;
  try {
    return new URL(url).protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
};

/** Linki do przycisków „Zobacz nas w Google” / „Wystaw opinię”; brak linku = `null` (przycisk ukryty). */
export const getGoogleProfileLinks = (
  config: Pick<GoogleProfileConfig, 'profileUrl' | 'reviewUrl'> = SITE_CONFIG.google,
): GoogleProfileLinks => ({
  profileUrl: cleanHttpsUrl(config.profileUrl),
  reviewUrl: cleanHttpsUrl(config.reviewUrl),
});
