// Kanoniczna forma wewnętrznego URL-a w serwisie: ścieżka zakończona "/".
// Prerender zapisuje dist/<route>/index.html, a Cloudflare Pages na wersję bez
// slasha odpowiada przekierowaniem 308 — każdy link bez slasha to zbędny hop
// (i rozjazd z canonicalami / sitemapą, które zawsze mają slash).

const SITE_ORIGIN = 'https://mixturemarketing.pl';

const normalizePath = (url: string): string => {
  const cut = url.search(/[?#]/);
  const pathname = cut === -1 ? url : url.slice(0, cut);
  const rest = cut === -1 ? '' : url.slice(cut);
  if (pathname === '' || pathname.endsWith('/')) return url;
  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1);
  // Pliki (np. /assets/x.png, /cennik.pdf) zostają bez slasha.
  if (/\.[a-z0-9]{2,5}$/i.test(lastSegment)) return url;
  return `${pathname}/${rest}`;
};

/**
 * Dopisuje trailing slash do wewnętrznej ścieżki (przed `?` / `#`).
 * Nie rusza: URL-i zewnętrznych, `mailto:`/`tel:`, samych kotwic (`#x`),
 * ścieżek do plików (z rozszerzeniem) ani pustych wartości.
 * Absolutny URL do własnej domeny (https://mixturemarketing.pl/...) też normalizuje.
 */
export const withTrailingSlash = (url: string): string => {
  if (!url) return url;
  if (url.startsWith(SITE_ORIGIN)) {
    const rest = url.slice(SITE_ORIGIN.length);
    if (rest === '' || /^[?#]/.test(rest)) return `${SITE_ORIGIN}/${rest}`;
    if (!rest.startsWith('/')) return url;
    return `${SITE_ORIGIN}${normalizePath(rest)}`;
  }
  if (!url.startsWith('/') || url.startsWith('//')) return url;
  return normalizePath(url);
};
