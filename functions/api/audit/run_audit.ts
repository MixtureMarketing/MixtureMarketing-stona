/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: audit/run_audit
 * Path: /api/audit/run_audit
 *
 * Live audit SEO / wydajnosci / reputacji:
 *   - HTMLRewriter (streaming scrape: SEO, tech, CMS, social, naglowki, ALT, slowa)
 *   - Google PageSpeed Insights (Core Web Vitals + kategorie + "opportunities")
 *   - Google Places (reputacja: ocena + liczba recenzji, po placeId lub nazwie firmy)
 *
 * Wynik zwracany jako { status, data: { client, competitor? } } — ksztalt zgodny
 * z services/auditService.ts (AuditResult). Cache KV 24h (klucz po URL).
 */

interface Env {
  GOOGLE_BACKEND_KEY: string; // sekret CF Pages (PageSpeed Insights API + Places API)
  CACHE: KVNamespace;
  DB: D1Database;
}

// Kuracja wiekszych miast PL — fallback wykrywania lokalnego SEO, gdy Places nie zwroci miasta.
const PL_CITIES = [
  'Warszawa',
  'Kraków',
  'Łódź',
  'Wrocław',
  'Poznań',
  'Gdańsk',
  'Szczecin',
  'Bydgoszcz',
  'Lublin',
  'Białystok',
  'Katowice',
  'Gdynia',
  'Częstochowa',
  'Radom',
  'Rzeszów',
  'Toruń',
  'Kielce',
  'Gliwice',
  'Zabrze',
  'Olsztyn',
  'Bielsko-Biała',
  'Bytom',
  'Zielona Góra',
  'Rybnik',
  'Opole',
  'Tarnów',
  'Gorzów Wielkopolski',
  'Płock',
  'Elbląg',
  'Wałbrzych',
  'Włocławek',
  'Nowy Sącz',
  'Koszalin',
  'Kalisz',
  'Legnica',
  'Grudziądz',
  'Słupsk',
  'Jaworzno',
  'Jastrzębie-Zdrój',
  'Mielec',
  'Stalowa Wola',
  'Przemyśl',
  'Sanok',
  'Krosno',
  'Dębica',
];

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); // usun diakrytyki (porownania miast PL)

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const input = (await request.json()) as {
      url: string;
      companyName?: string;
      placeId?: string;
      force?: boolean;
    };
    const { url, companyName, placeId, force } = input;

    if (!url) return json({ status: 'error', message: 'URL is required' }, 400);

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    // v7 — ksztalt wyniku zmieniony vs v6 (social/local/opportunities/cms), bumpujemy klucz cache.
    const cacheKey = `v7_live_${btoa(unescape(encodeURIComponent(normalizedUrl))).substring(0, 40)}`;

    if (!force) {
      const cached = (await env.CACHE.get(cacheKey, 'json')) as any;
      if (cached) {
        return json({ status: 'success', source: 'cache', data: cached });
      }
    }

    // Silnik rownolegly: scrape + PSI + Places.
    const [pageContent, psiData, placesData] = await Promise.all([
      scrapePage(normalizedUrl),
      fetchPSI(normalizedUrl, env.GOOGLE_BACKEND_KEY),
      fetchPlaces(placeId, companyName, env.GOOGLE_BACKEND_KEY),
    ]);

    // Bez pomiaru PSI nie ma uczciwego wyniku — fallbacki (LCP 2.5s, score 0)
    // pokazywaly uzytkownikowi zmyslone liczby jako JEGO pomiar.
    if (!psiData?.lighthouseResult) {
      return json(
        {
          status: 'error',
          message:
            'Pomiar wydajności (PageSpeed Insights) chwilowo niedostępny — spróbuj ponownie za minutę.',
        },
        503,
      );
    }

    const auditResult = calculateScore({
      url: normalizedUrl,
      scrape: pageContent,
      performance: psiData,
      reputation: placesData,
    });

    await env.CACHE.put(cacheKey, JSON.stringify(auditResult), { expirationTtl: 86400 }); // 24h

    return json({ status: 'success', data: auditResult });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return json({ status: 'error', message }, 500);
  }
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

interface ScrapeResult {
  seo: { title: string; h1: string; description: string; og_tags: boolean };
  tech: { gtm: boolean; pixel: boolean; analytics: boolean; ssl: boolean; cms: string[] };
  social: Record<string, boolean>;
  content: {
    images_count: number;
    images_no_alt: number;
    h1_count: number;
    h2_count: number;
    h3_count: number;
    word_count: number;
    text_ratio: number;
    details: {
      images_missing_alt: string[];
      headings: Array<{ tag: string; text: string }>;
    };
  };
}

/**
 * Streaming scraper (HTMLRewriter) — jeden przebieg po HTML.
 */
async function scrapePage(url: string): Promise<ScrapeResult> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MixtureBot/1.0; +https://mixturemarketing.pl)',
    },
  });

  const cmsSet = new Set<string>();
  const social: Record<string, boolean> = { og_tags: false };
  const result: ScrapeResult = {
    seo: { title: '', h1: '', description: '', og_tags: false },
    tech: { gtm: false, pixel: false, analytics: false, ssl: url.startsWith('https'), cms: [] },
    social,
    content: {
      images_count: 0,
      images_no_alt: 0,
      h1_count: 0,
      h2_count: 0,
      h3_count: 0,
      word_count: 0,
      text_ratio: 0,
      details: { images_missing_alt: [], headings: [] },
    },
  };

  // Bufory tekstu (capowane, zeby nie rozjechac pamieci na duzych stronach).
  const MAX_CONTENT = 80000;
  let contentText = '';
  const appendContent = (t: string) => {
    if (contentText.length < MAX_CONTENT) contentText += t;
  };
  // Osobny bufor na tresc inline'owych <script> — nowoczesne GA4/Pixel/GTM czesto
  // siedza w inline bootstrapie (gtag()/dataLayer/fbq), nie w atrybucie src.
  let scriptBuf = '';
  const appendScript = (t: string) => {
    if (scriptBuf.length < 150000) scriptBuf += t;
  };
  let currentHeading: { tag: string; text: string } | null = null;

  const detectCmsFromSrc = (src: string) => {
    const s = src.toLowerCase();
    if (s.includes('wp-content') || s.includes('wp-includes')) cmsSet.add('WordPress');
    if (s.includes('cdn.shopify') || s.includes('shopifycdn')) cmsSet.add('Shopify');
    if (s.includes('wixstatic') || s.includes('parastorage')) cmsSet.add('Wix');
    if (s.includes('squarespace')) cmsSet.add('Squarespace');
    if (s.includes('/media/jui/') || s.includes('joomla')) cmsSet.add('Joomla');
    if (s.includes('/sites/default/files') || s.includes('drupal')) cmsSet.add('Drupal');
    if (s.includes('prestashop')) cmsSet.add('PrestaShop');
    if (s.includes('cdn.builder.io') || s.includes('webflow')) cmsSet.add('Webflow');
  };

  const rewriter = new HTMLRewriter()
    .on('title', {
      text(t) {
        result.seo.title += t.text;
      },
    })
    .on('meta[name="description"]', {
      element(e) {
        result.seo.description = e.getAttribute('content') || '';
      },
    })
    .on('meta[property^="og:"]', {
      element() {
        result.seo.og_tags = true;
        social.og_tags = true;
      },
    })
    .on('meta[name="generator"]', {
      element(e) {
        const g = (e.getAttribute('content') || '').trim();
        if (g) {
          if (/wordpress/i.test(g)) cmsSet.add('WordPress');
          else if (/joomla/i.test(g)) cmsSet.add('Joomla');
          else if (/drupal/i.test(g)) cmsSet.add('Drupal');
          else if (/wix/i.test(g)) cmsSet.add('Wix');
          else if (/shopify/i.test(g)) cmsSet.add('Shopify');
          else if (/squarespace/i.test(g)) cmsSet.add('Squarespace');
          else if (/prestashop/i.test(g)) cmsSet.add('PrestaShop');
          else cmsSet.add(g.split(' ')[0]);
        }
      },
    })
    .on('h1, h2, h3', {
      element(e) {
        const tag = e.tagName.toLowerCase();
        if (tag === 'h1') result.content.h1_count++;
        else if (tag === 'h2') result.content.h2_count++;
        else if (tag === 'h3') result.content.h3_count++;
        const h = { tag, text: '' };
        if (result.content.details.headings.length < 100) result.content.details.headings.push(h);
        currentHeading = h;
        e.onEndTag(() => {
          currentHeading = null;
        });
      },
      text(t) {
        if (currentHeading) currentHeading.text += t.text;
        if (t.text.trim()) {
          appendContent(' ' + t.text);
          if (currentHeading?.tag === 'h1') result.seo.h1 += t.text;
        }
      },
    })
    .on('p, li, td, blockquote, h4, h5, h6, span, a, strong, em', {
      text(t) {
        if (t.text.trim()) appendContent(' ' + t.text);
      },
    })
    .on('img', {
      element(e) {
        result.content.images_count++;
        if (!e.getAttribute('alt')) {
          result.content.images_no_alt++;
          const src = e.getAttribute('src') || e.getAttribute('data-src') || '';
          if (src && result.content.details.images_missing_alt.length < 30) {
            result.content.details.images_missing_alt.push(src);
          }
        }
      },
    })
    .on('script', {
      element(e) {
        const src = e.getAttribute('src') || '';
        if (src.includes('gtm.js') || src.includes('googletagmanager')) result.tech.gtm = true;
        if (src.includes('fbevents.js') || src.includes('connect.facebook'))
          result.tech.pixel = true;
        if (
          src.includes('analytics.js') ||
          src.includes('gtag') ||
          src.includes('google-analytics')
        )
          result.tech.analytics = true;
        detectCmsFromSrc(src);
      },
      text(t) {
        appendScript(t.text);
      },
    })
    .on('link', {
      element(e) {
        detectCmsFromSrc(e.getAttribute('href') || '');
      },
    })
    .on('a[href]', {
      element(e) {
        const href = (e.getAttribute('href') || '').toLowerCase();
        if (href.includes('facebook.com')) social.facebook = true;
        else if (href.includes('instagram.com')) social.instagram = true;
        else if (href.includes('linkedin.com')) social.linkedin = true;
        else if (href.includes('twitter.com') || /\/\/(x\.com)/.test(href)) social.twitter = true;
        else if (href.includes('youtube.com') || href.includes('youtu.be')) social.youtube = true;
        else if (href.includes('tiktok.com')) social.tiktok = true;
      },
    });

  const transformed = await rewriter.transform(response).arrayBuffer();
  const htmlLen = transformed.byteLength || 1;

  // Detekcja z tresci inline'owych <script> (uzupelnia detekcje po atrybucie src).
  // Lapie GA4/UA/GTM/Pixel wstrzykiwane inline lub przez baner zgody — bez tego
  // czesty false-negative "brak GA4" na stronach, gdzie tag idzie przez gtag()/dataLayer.
  const sb = scriptBuf.toLowerCase();
  if (!result.tech.gtm && (sb.includes('gtm.js') || /gtm-[a-z0-9]/i.test(scriptBuf))) {
    result.tech.gtm = true;
  }
  if (
    !result.tech.analytics &&
    (sb.includes('gtag(') ||
      sb.includes('gtag/js') ||
      sb.includes('google-analytics') ||
      sb.includes('datalayer') ||
      /\bg-[a-z0-9]{6,}\b/i.test(scriptBuf) ||
      /\bua-\d{4,}/i.test(scriptBuf))
  ) {
    result.tech.analytics = true;
  }
  if (
    !result.tech.pixel &&
    (sb.includes('fbevents') || sb.includes('fbq(') || sb.includes('connect.facebook'))
  ) {
    result.tech.pixel = true;
  }

  result.seo.title = result.seo.title.trim();
  result.seo.h1 = result.seo.h1.trim();
  result.tech.cms = Array.from(cmsSet);
  const words = contentText.trim().split(/\s+/).filter(Boolean);
  result.content.word_count = words.length;
  result.content.text_ratio = Math.min(100, Math.round((contentText.length / htmlLen) * 100));
  (result as any)._contentText = contentText; // do detekcji lokalnego SEO w calculateScore

  return result;
}

async function fetchPSI(url: string, key: string): Promise<any> {
  const psiUrl =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}` +
    `&key=${key}&strategy=mobile&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES`;
  const res = await fetch(psiUrl);
  // Bez res.ok cicha awaria PSI fabrykowała wynik (fallback „LCP 2.50 s"
  // pokazywany użytkownikowi jako JEGO pomiar). Teraz brak pomiaru = błąd.
  if (!res.ok) return null;
  return res.json();
}

/**
 * Reputacja z Google Places (nowe Places API v1).
 * Priorytet: placeId (Details). Fallback: nazwa firmy (Text Search) -> pierwszy wynik.
 */
async function fetchPlaces(
  placeId: string | undefined,
  companyName: string | undefined,
  key: string,
): Promise<any> {
  if (!key) return null;
  try {
    if (placeId) {
      const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
        headers: {
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'rating,userRatingCount,addressComponents,displayName',
        },
      });
      return res.ok ? await res.json() : null;
    }
    if (companyName && companyName.trim()) {
      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask':
            'places.rating,places.userRatingCount,places.addressComponents,places.displayName,places.id',
        },
        body: JSON.stringify({
          textQuery: companyName.trim(),
          languageCode: 'pl',
          regionCode: 'PL',
        }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as any;
      return data.places?.[0] || null;
    }
  } catch {
    /* ignore — reputacja opcjonalna */
  }
  return null;
}

function extractCity(places: any): string | null {
  const comps = places?.addressComponents || [];
  const byType = (type: string) =>
    comps.find((c: any) => Array.isArray(c.types) && c.types.includes(type));
  const c =
    byType('locality') ||
    byType('postal_town') ||
    byType('administrative_area_level_2') ||
    byType('administrative_area_level_1');
  return c?.longText || c?.shortText || null;
}

function calculateScore(data: any) {
  const scrape: ScrapeResult = data.scrape;
  const psi = data.performance?.lighthouseResult || {};
  const audits = psi.audits || {};
  const categories = psi.categories || {};

  const lcp = (audits['largest-contentful-paint']?.numericValue || 2500) / 1000;
  const cls = audits['cumulative-layout-shift']?.numericValue || 0;
  const perfScore = Math.round((categories.performance?.score || 0) * 100);

  // PSI "opportunities" — realne mozliwosci przyspieszenia (top 5 wg oszczednosci ms).
  const opportunities = Object.entries(audits)
    .filter(([, a]: any) => {
      const type = a?.details?.type;
      const val = a?.numericValue || 0;
      return type === 'opportunity' && val > 0 && a?.score !== null && a?.score < 0.9;
    })
    .map(([id, a]: any) => ({ id, title: a.title as string, savings: a.numericValue as number }))
    .sort((x, y) => y.savings - x.savings)
    .slice(0, 5);

  // Reputacja
  const places = data.reputation || {};
  const rating = places.rating || 0;
  const reviews = places.userRatingCount || 0;

  // Lokalne SEO — miasto z Places, fallback do listy miast PL wykrytych w tresci.
  const contentText: string = (scrape as any)._contentText || '';
  let city = extractCity(places);
  if (!city) {
    const hay = norm(`${scrape.seo.title} ${scrape.seo.h1} ${contentText}`);
    city = PL_CITIES.find((c) => hay.includes(norm(c))) || null;
  }
  let local: { city: string; in_title: boolean; in_h1: boolean; in_content: boolean } | null = null;
  if (city) {
    const nc = norm(city);
    local = {
      city,
      in_title: norm(scrape.seo.title).includes(nc),
      in_h1: norm(scrape.seo.h1).includes(nc),
      in_content: norm(contentText).includes(nc),
    };
  }

  // Scoring
  let totalScore = 100;
  const errors: Record<string, boolean> = {};
  if (!scrape.tech.ssl) {
    totalScore -= 10;
    errors.NO_SSL = true;
  }
  if (!scrape.tech.pixel) {
    totalScore -= 10;
    errors.NO_PIXEL = true;
  }
  if (lcp > 2.5) {
    totalScore -= 10;
    errors.SLOW_LCP = true;
  }
  if (scrape.content.h1_count !== 1) {
    totalScore -= 5;
    errors.BAD_H1 = true;
  }
  if (scrape.content.images_no_alt > 0) {
    totalScore -= 5;
    errors.NO_ALTS = true;
  }
  if (!scrape.tech.analytics) {
    totalScore -= 5;
    errors.NO_ANALYTICS = true;
  }

  return {
    client: {
      url: data.url,
      total_score: Math.max(0, totalScore),
      metrics: {
        lcp_value: lcp,
        cls_value: cls,
        speed_score: perfScore,
        scores: {
          performance: perfScore,
          accessibility: Math.round((categories.accessibility?.score || 0) * 100),
          seo: Math.round((categories.seo?.score || 0) * 100),
          best_practices: Math.round((categories['best-practices']?.score || 0) * 100),
        },
        opportunities,
      },
      tech: scrape.tech,
      seo: {
        title: scrape.seo.title || null,
        h1: scrape.seo.h1 || null,
        description: scrape.seo.description || null,
        local,
      },
      content: {
        images_count: scrape.content.images_count,
        images_no_alt: scrape.content.images_no_alt,
        h1_count: scrape.content.h1_count,
        h2_count: scrape.content.h2_count,
        h3_count: scrape.content.h3_count,
        text_ratio: scrape.content.text_ratio,
        word_count: scrape.content.word_count,
        details: scrape.content.details,
      },
      social: scrape.social,
      reputation: {
        rating,
        reviews_count: reviews,
        score: Math.round((rating / 5) * 100),
      },
      audit_results: errors,
      screenshot: audits['final-screenshot']?.details?.data || null,
    },
  };
}
