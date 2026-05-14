import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { routes } from '../routes.js';
import { createClient } from '@sanity/client';

try {
  process.loadEnvFile();
} catch (e) {
  // Ignored
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITEMAP_PATH = path.resolve(__dirname, '../public/sitemap.xml');
const BASE_URL = 'https://mixturemarketing.pl';

const sanityClient = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-21',
  useCdn: false,
});

// Zwraca date w formacie YYYY-MM-DD (W3C Date subset wymagany przez <lastmod>).
function formatLastmod(value) {
  if (!value) return new Date().toISOString().split('T')[0];
  return new Date(value).toISOString().split('T')[0];
}

// Wymusza trailing slash poza root i URL-ami z query/hash. Kanoniczna forma.
function withTrailingSlash(route) {
  if (!route) return '/';
  if (route === '/') return '/';
  if (route.includes('?') || route.includes('#')) return route;
  return route.endsWith('/') ? route : `${route}/`;
}

async function generateSitemap() {
  console.log('Generating sitemap.xml...');

  const todayIso = new Date().toISOString().split('T')[0];

  // Statyczne sciezki - lastmod = data buildu.
  const staticEntries = routes.map((route) => ({
    url: `${BASE_URL}${withTrailingSlash(route)}`,
    lastmod: todayIso,
  }));

  // Dynamiczne sciezki z Sanity - lastmod = _updatedAt z dokumentu.
  let dynamicEntries = [];
  try {
    const [articles, industries, locations, projects] = await Promise.all([
      sanityClient.fetch('*[_type == "article" && defined(slug.current)]{ "slug": slug.current, _updatedAt }'),
      sanityClient.fetch('*[_type == "industry" && defined(slug.current)]{ "slug": slug.current, _updatedAt }'),
      sanityClient.fetch('*[_type == "location" && defined(slug.current)]{ "slug": slug.current, _updatedAt }'),
      sanityClient.fetch('*[_type == "caseStudy" && defined(slug.current)]{ "slug": slug.current, _updatedAt }'),
    ]);

    dynamicEntries = [
      ...articles.map((a) => ({
        url: `${BASE_URL}${withTrailingSlash(`/baza-wiedzy/${a.slug}`)}`,
        lastmod: formatLastmod(a._updatedAt),
      })),
      ...industries.map((i) => ({
        url: `${BASE_URL}${withTrailingSlash(`/branza/${i.slug}`)}`,
        lastmod: formatLastmod(i._updatedAt),
      })),
      ...locations.map((l) => ({
        url: `${BASE_URL}${withTrailingSlash(`/miasto/${l.slug}`)}`,
        lastmod: formatLastmod(l._updatedAt),
      })),
      ...projects.map((p) => ({
        url: `${BASE_URL}${withTrailingSlash(`/portfolio/${p.slug}`)}`,
        lastmod: formatLastmod(p._updatedAt),
      })),
    ];
    console.log(`Found ${dynamicEntries.length} dynamic routes.`);
  } catch (err) {
    console.warn('Failed to fetch dynamic routes for sitemap:', err.message);
  }

  // Deduplikacja po URL (statyczna lista ma korzenie typu /baza-wiedzy/,
  // a Sanity moze zwrocic wpisy ktore by sie z czyms zazebialy).
  // Zachowujemy pierwsze wystapienie -> statyczne maja priorytet nad dynamicznymi.
  const seen = new Set();
  const allEntries = [];
  for (const entry of [...staticEntries, ...dynamicEntries]) {
    if (seen.has(entry.url)) continue;
    seen.add(entry.url);
    allEntries.push(entry);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  fs.writeFileSync(SITEMAP_PATH, xml);
  console.log(`Sitemap generated at: ${SITEMAP_PATH} (${allEntries.length} URLs)`);
}

generateSitemap();
