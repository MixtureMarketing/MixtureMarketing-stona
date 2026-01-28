import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { routes } from '../routes.js';
import { createClient } from '@sanity/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITEMAP_PATH = path.resolve(__dirname, '../public/sitemap.xml');
const BASE_URL = 'https://mixturemarketing.pl';

const sanityClient = createClient({
  projectId: 'azuef2ua',
  dataset: 'production',
  apiVersion: '2024-01-21',
  useCdn: false,
});

async function generateSitemap() {
  console.log('🚀 Generating sitemap.xml...');

  // Fetch dynamic routes
  let dynamicRoutes = [];
  try {
    const articles = await sanityClient.fetch('*[_type == "article"]{ "slug": slug.current }');
    const industries = await sanityClient.fetch('*[_type == "industry"]{ "slug": slug.current }');
    const locations = await sanityClient.fetch('*[_type == "location"]{ "slug": slug.current }');

    dynamicRoutes = [
      ...articles.map((a) => `/baza-wiedzy/${a.slug}`),
      ...industries.map((i) => `/branza/${i.slug}`),
      ...locations.map((l) => `/miasto/${l.slug}`),
    ];
    console.log(`✅ Found ${dynamicRoutes.length} dynamic routes.`);
  } catch (err) {
    console.warn('⚠️ Failed to fetch dynamic routes for sitemap:', err.message);
  }

  const allRoutes = [...routes, ...dynamicRoutes];
  const now = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map((route) => {
    const fullUrl = `${BASE_URL}${route}`;
    let priority = '0.5';
    let changefreq = 'monthly';

    if (route === '/') {
      priority = '1.0';
      changefreq = 'weekly';
    } else if (
      route.startsWith('/web-development/') ||
      route.startsWith('/marketing/') ||
      route.startsWith('/design/')
    ) {
      priority = '0.8';
      changefreq = 'monthly';
    } else if (route.startsWith('/baza-wiedzy/')) {
      priority = '0.7';
      changefreq = 'monthly';
    } else if (route.startsWith('/branza/') || route.startsWith('/miasto/')) {
      priority = '0.6';
      changefreq = 'monthly';
    }

    return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, xml);
  console.log(`✅ Sitemap generated at: ${SITEMAP_PATH}`);
}

generateSitemap();
