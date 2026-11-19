// MIX-1934: klucz strony Turnstile z budowy (VITE_TURNSTILE_SITE_KEY). Allowlistę i cel budowy
// sprawdza strażnik w vite.config.ts (scripts/lib/turnstileKeyGuard.mjs): build z wartością spoza
// listy albo z kluczem testowym poza Preview się nie kończy. Tu CELOWO nie ma literału klucza
// testowego: bundle produkcji nie może go zawierać (sprawdza to strażnik wgrania).

/** Klucz produkcyjny (publiczny, do osadzenia we froncie). Ten sam w turnstileKeyGuard.mjs. */
export const TURNSTILE_PROD_SITE_KEY = '0x4AAAAAACYHLgkgk3FJUj06';

/** Brak albo pusta zmienna (dev, testy, build lokalny) = klucz produkcyjny. */
export function resolveTurnstileSiteKey(raw: unknown): string {
  return typeof raw === 'string' && raw !== '' ? raw : TURNSTILE_PROD_SITE_KEY;
}
