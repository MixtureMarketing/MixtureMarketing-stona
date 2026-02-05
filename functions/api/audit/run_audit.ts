/**
 * Cloudflare Pages Function: audit/run_audit
 * Path: /api/audit/run_audit
 * Perfroms a live SEO/Performance audit using HTMLRewriter and external APIs.
 */

interface Env {
  GOOGLE_BACKEND_KEY: string; // Add this to Cloudflare Secrets
  CACHE: KVNamespace;
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const input: any = await request.json();
    const { url, competitorUrl, placeId, force } = input;

    if (!url) return new Response('URL is required', { status: 400 });

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const cacheKey = `v6_live_${btoa(normalizedUrl).substring(0, 32)}`;

    // 1. Check KV Cache
    if (!force) {
      const cached: any = await env.CACHE.get(cacheKey, 'json');
      if (cached) return new Response(JSON.stringify({ status: 'success', source: 'cache', data: cached }));
    }

    // 2. Parallel Execution Engine
    const [pageContent, psiData, placesData] = await Promise.all([
      scrapePage(normalizedUrl),
      fetchPSI(normalizedUrl, env.GOOGLE_BACKEND_KEY),
      placeId ? fetchPlaces(placeId, env.GOOGLE_BACKEND_KEY) : Promise.resolve(null)
    ]);

    // 3. Process Results & Scoring
    const auditResult = calculateScore({
      url: normalizedUrl,
      scrape: pageContent,
      performance: psiData,
      reputation: placesData
    });

    // 4. Save to Cache
    await env.CACHE.put(cacheKey, JSON.stringify(auditResult), { expirationTtl: 86400 }); // 24h

    return new Response(JSON.stringify({ status: 'success', data: auditResult }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'error', message: err.message }), { status: 500 });
  }
};

/**
 * Super-fast Streaming Scraper using HTMLRewriter
 */
async function scrapePage(url: string) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MixtureBot/1.0; +https://mixturemarketing.pl)' }
  });

  const result = {
    seo: { title: '', h1: '', description: '', og_tags: false },
    tech: { gtm: false, pixel: false, analytics: false, ssl: url.startsWith('https') },
    content: { images_count: 0, images_no_alt: 0, h1_count: 0, word_count: 0, headings: [] as any[] }
  };

  const rewriter = new HTMLRewriter()
    .on('title', { text(t) { result.seo.title += t.text; } })
    .on('meta[name="description"]', { element(e) { result.seo.description = e.getAttribute('content') || ''; } })
    .on('meta[property^="og:"]', { element() { result.seo.og_tags = true; } })
    .on('h1', { 
      element() { result.content.h1_count++; },
      text(t) { result.seo.h1 += t.text; } 
    })
    .on('h2, h3', {
      element(e) {
        const tag = e.tagName;
        // Logic to capture text would require a buffer, keeping it simple for now
      }
    })
    .on('img', {
      element(e) {
        result.content.images_count++;
        if (!e.getAttribute('alt')) result.content.images_no_alt++;
      }
    })
    .on('script', {
      element(e) {
        const src = e.getAttribute('src') || '';
        if (src.includes('gtm.js')) result.tech.gtm = true;
        if (src.includes('fbevents.js')) result.tech.pixel = true;
        if (src.includes('analytics.js') || src.includes('gtag')) result.tech.analytics = true;
      }
    });

  await rewriter.transform(response).arrayBuffer(); // Trigger transformation
  return result;
}

async function fetchPSI(url: string, key: string) {
  const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${key}&strategy=mobile&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY`;
  const res = await fetch(psiUrl);
  return res.json();
}

async function fetchPlaces(placeId: string, key: string) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  const res = await fetch(url, {
    headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'rating,userRatingCount,addressComponents' }
  });
  return res.json();
}

function calculateScore(data: any) {
  // Logic from run_audit.php ported to TS
  let totalScore = 100;
  const errors: Record<string, boolean> = {};
  
  // Example scoring logic
  if (!data.scrape.tech.ssl) { totalScore -= 10; errors.NO_SSL = true; }
  if (!data.scrape.tech.pixel) { totalScore -= 10; errors.NO_PIXEL = true; }
  
  return {
    client: {
      url: data.url,
      total_score: Math.max(0, totalScore),
      tech: data.scrape.tech,
      seo: data.scrape.seo,
      content: data.scrape.content,
      audit_results: errors
    }
  };
}
