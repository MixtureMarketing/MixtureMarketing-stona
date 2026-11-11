/**
 * Wspólna blokada analityki dla skryptów przeglądarkowych (Puppeteer) wchodzących na stronę.
 *
 * Po co: 24-25.10 testy na produkcji wygenerowały ok. 3 400 fałszywych użytkowników w GA4,
 * bo GA działa przez Cloudflare Zaraz z własnej domeny (/cdn-cgi/zaraz/*) i skrypty blokowały
 * tylko część adresów. Ten moduł jest jedynym miejscem, które wie, co jest analityką.
 *
 * Użycie w skrypcie:
 *   const safe = createProdSafe(BASE);               // BASE = adres, na który skrypt wchodzi
 *   const browser = await puppeteer.launch(...);
 *   safe.watchBrowser(browser);                      // niezależny licznik (bezpiecznik)
 *   const page = await browser.newPage();
 *   await safe.protect(page, { userAgent, handler }); // UA z dopiskiem + blokada
 *   ...
 *   await browser.close();
 *   safe.finish();                                   // exit 1, gdy coś przeciekło / brak blokady
 *
 * Zasada: wszystko, co nie jest pętlą zwrotną (localhost), uznajemy za produkcję (fail-closed).
 */

export const E2E_UA_TAG = 'MixtureE2E/1';

// Hosty analityki (sufiks domeny, też subdomeny).
const BLOCKED_HOSTS = [
  /(^|\.)google-analytics\.com$/,
  /(^|\.)analytics\.google\.com$/,
  /(^|\.)googletagmanager\.com$/,
  /(^|\.)doubleclick\.net$/,
  /(^|\.)facebook\.(com|net)$/,
  /(^|\.)clarity\.ms$/,
  /(^|\.)hotjar\.(com|io)$/,
  /(^|\.)cloudflareinsights\.com$/,
];

// Ścieżki analityki na DOWOLNYM hoście (Zaraz i RUM serwowane z własnej domeny).
// Dopasowanie po normalizacji (małe litery, zdekodowane %, zwinięte //).
const BLOCKED_PATHS = [/^\/cdn-cgi\/zaraz(\/|$)/, /^\/cdn-cgi\/rum(\/|$)/, /\/rifd\//];

function normalizePath(pathname) {
  let p = pathname;
  for (let i = 0; i < 3; i++) {
    try {
      const d = decodeURIComponent(p);
      if (d === p) break;
      p = d;
    } catch {
      break; // niepoprawne % — zostaw jak jest
    }
  }
  return p.toLowerCase().replace(/\/{2,}/g, '/');
}

/** true, gdy adres to analityka (host albo ścieżka). Niepoprawny adres = true (fail-closed). */
export function isAnalyticsUrl(rawUrl) {
  let url;
  try {
    url = new URL(String(rawUrl));
  } catch {
    return true;
  }
  if (url.protocol === 'data:' || url.protocol === 'blob:' || url.protocol === 'about:') {
    return false;
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (BLOCKED_HOSTS.some((r) => r.test(host))) return true;
  return BLOCKED_PATHS.some((r) => r.test(normalizePath(url.pathname)));
}

/** true tylko dla pętli zwrotnej; wszystko inne (też błędny adres) to produkcja. */
export function isProdUrl(rawUrl) {
  try {
    const host = new URL(String(rawUrl)).hostname.toLowerCase().replace(/^\[|\]$/g, '');
    return !(
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '0.0.0.0'
    );
  } catch {
    return true;
  }
}

/** Dopisuje znacznik testów do user-agenta (bez „Headless”, idempotentnie). */
export function withE2eUa(ua) {
  const base = String(ua || '')
    .replace(/HeadlessChrome/g, 'Chrome')
    .replace(/\s*MixtureE2E\/\d+\s*$/, '')
    .trim();
  return `${base} ${E2E_UA_TAG}`.trim();
}

/**
 * @param {string} baseUrl adres, na który skrypt wchodzi
 * @param {{ log?: { log: (m: string) => void, error: (m: string) => void } }} [opts]
 */
export function createProdSafe(baseUrl, { log = console } = {}) {
  const isProd = isProdUrl(baseUrl);
  const stats = {
    isProd,
    blocked: 0,
    passed: 0,
    passedUrls: [],
    protectedPages: new WeakSet(),
    protectedCount: 0,
    watchedPages: new Set(),
  };

  const countPassed = (url) => {
    stats.passed++;
    if (stats.passedUrls.length < 20) stats.passedUrls.push(String(url).slice(0, 160));
  };

  return {
    stats,
    isProd,

    /** Niezależny obserwator: każda odpowiedź z adresu analityki = przeciek; strony bez blokady są liczone. */
    watchBrowser(browser) {
      browser.on('targetcreated', async (target) => {
        if (target.type() !== 'page') return;
        let page;
        try {
          page = await target.page();
        } catch {
          return;
        }
        if (!page) return;
        // Wyskakujące okna (opener) bywają zamykane od razu przez skrypt: nie wymagamy dla
        // nich blokady, ale każda odpowiedź z analityki i tak liczy się jako przeciek.
        if (!target.opener()) stats.watchedPages.add(page);
        page.on('response', (res) => {
          if (isAnalyticsUrl(res.url())) countPassed(res.url());
        });
      });
    },

    /** Ustawia UA z dopiskiem i blokadę. `handler(req)` obsługuje resztę żądań, `onBlocked(req)` dostaje zablokowane. */
    async protect(page, { userAgent, handler, onBlocked } = {}) {
      const ua = userAgent || (await page.browser().userAgent());
      await page.setUserAgent({ userAgent: withE2eUa(ua) });
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (req.isInterceptResolutionHandled()) return;
        if (isAnalyticsUrl(req.url())) {
          stats.blocked++;
          onBlocked?.(req);
          req.abort('blockedbyclient').catch(() => {});
          return;
        }
        if (handler) {
          handler(req);
          return;
        }
        req.continue().catch(() => {});
      });
      stats.protectedPages.add(page);
      stats.protectedCount++;
    },

    /** Werdykt bezpiecznika (bez efektów ubocznych). */
    verdict() {
      const problems = [];
      if (stats.passed > 0) {
        problems.push(
          `przepuszczono ${stats.passed} żądań analityki: ${stats.passedUrls.join(' ')}`,
        );
      }
      if (isProd) {
        if (stats.protectedCount === 0)
          problems.push('blokada analityki nie została zainstalowana');
        const bare = [...stats.watchedPages].filter((p) => !stats.protectedPages.has(p));
        if (bare.length > 0) problems.push(`${bare.length} kart bez blokady analityki`);
      }
      return { ok: problems.length === 0, problems };
    },

    /** Podsumowanie + exit code 1 przy naruszeniu. Wywołać po zamknięciu przeglądarki. */
    finish() {
      const v = this.verdict();
      log.log(
        `prod-safe: zablokowano ${stats.blocked}, przepuszczono ${stats.passed}, karty z blokadą ${stats.protectedCount}${isProd ? ' (produkcja)' : ' (lokalnie)'}.`,
      );
      if (!v.ok) {
        log.error(`PROD-SAFE BŁĄD: ${v.problems.join('; ')}`);
        process.exitCode = 1;
      }
      return v;
    },
  };
}
