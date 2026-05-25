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
  // Dla kluczowych stron lokalnych dodajemy image:image z geo_location -
  // sygnal dla Google Image Search ze obrazy sa powiazane z Rzeszowem.
  const LOCAL_IMAGE_OVERRIDES = {
    '/': {
      loc: `${BASE_URL}/assets/images/sygnet.png`,
      title: 'Mixture Marketing — Agencja Marketingowa Rzeszów',
      caption: 'Biuro Mixture Marketing przy Al. Józefa Piłsudskiego 17/4 w Rzeszowie',
      geo: 'Rzeszów, Podkarpacie, Polska',
    },
    '/miasto/rzeszow/': {
      loc: `${BASE_URL}/assets/images/sygnet.png`,
      title: 'Agencja Marketingowa Rzeszów',
      caption: 'Mixture Marketing — agencja marketingowa i software house w Rzeszowie',
      geo: 'Rzeszów, Podkarpacie, Polska',
    },
    '/web-development/rzeszow/': {
      loc: `${BASE_URL}/assets/images/sygnet.png`,
      title: 'Tworzenie stron internetowych Rzeszów',
      caption: 'Strony WWW, sklepy, aplikacje dla firm z Rzeszowa i Podkarpacia',
      geo: 'Rzeszów, Podkarpacie, Polska',
    },
    '/agencja-seo-rzeszow/': {
      loc: `${BASE_URL}/assets/images/sygnet.png`,
      title: 'Pozycjonowanie stron Rzeszów',
      caption: 'Agencja SEO Rzeszów — lokalne i ogólnopolskie pozycjonowanie',
      geo: 'Rzeszów, Podkarpacie, Polska',
    },
    '/agencja-interaktywna-rzeszow/': {
      loc: `${BASE_URL}/assets/images/sygnet.png`,
      title: 'Agencja interaktywna Rzeszów',
      caption: 'Branding, web, marketing pod jednym dachem w Rzeszowie',
      geo: 'Rzeszów, Podkarpacie, Polska',
    },
    '/o-nas/': {
      loc: `${BASE_URL}/assets/images/sygnet.png`,
      title: 'Zespół Mixture Marketing — Rzeszów',
      caption: 'Eksperci web development, SEO i marketingu z biura w Rzeszowie',
      geo: 'Rzeszów, Podkarpacie, Polska',
    },
  };

  const staticEntries = routes.map((route) => {
    const url = `${BASE_URL}${withTrailingSlash(route)}`;
    const override = LOCAL_IMAGE_OVERRIDES[withTrailingSlash(route)];
    return {
      url,
      lastmod: todayIso,
      image: override || null,
    };
  });

  // Dynamiczne sciezki z Sanity - lastmod = _updatedAt z dokumentu.
  // Portfolio caseStudy dostaje image (xmlns:image) dla Google Image Search.
  let dynamicEntries = [];
  try {
    const [articles, industries, locations, projects] = await Promise.all([
      sanityClient.fetch(
        '*[_type == "article" && defined(slug.current)]{ "slug": slug.current, _updatedAt, mainImage }',
      ),
      sanityClient.fetch(
        '*[_type == "industry" && defined(slug.current)]{ "slug": slug.current, _updatedAt }',
      ),
      sanityClient.fetch(
        '*[_type == "location" && defined(slug.current)]{ "slug": slug.current, _updatedAt }',
      ),
      sanityClient.fetch(
        '*[_type == "caseStudy" && defined(slug.current)]{ "slug": slug.current, _updatedAt, title, "imageRef": gallery[0].asset._ref }',
      ),
    ]);

    // Helper: zbuduj URL obrazu z Sanity asset ref.
    const sanityProjectId = process.env.VITE_SANITY_PROJECT_ID;
    const sanityDataset = process.env.VITE_SANITY_DATASET || 'production';
    const sanityImageUrl = (ref) => {
      if (!ref || !sanityProjectId) return null;
      // ref format: image-{hash}-{w}x{h}-{ext}
      const m = ref.match(/^image-([a-f0-9]+)-(\d+)x(\d+)-(\w+)$/);
      if (!m) return null;
      return `https://cdn.sanity.io/images/${sanityProjectId}/${sanityDataset}/${m[1]}-${m[2]}x${m[3]}.${m[4]}`;
    };

    dynamicEntries = [
      ...articles.map((a) => ({
        url: `${BASE_URL}${withTrailingSlash(`/baza-wiedzy/${a.slug}`)}`,
        lastmod: formatLastmod(a._updatedAt),
        image: a.mainImage?.asset?._ref ? { loc: sanityImageUrl(a.mainImage.asset._ref) } : null,
      })),
      ...industries.map((i) => ({
        url: `${BASE_URL}${withTrailingSlash(`/branza/${i.slug}`)}`,
        lastmod: formatLastmod(i._updatedAt),
      })),
      // Tylko /miasto/rzeszow/ trafia do sitemap — pozostale 7 miast jest noindex
      // (doorway pages risk) i nie powinny byc zglaszane Google. Po dodaniu unikalnej
      // tresci per miasto (min 600 slow lokalne case studies/partnerzy) zdjac filtr.
      ...locations
        .filter((l) => l.slug === 'rzeszow')
        .map((l) => ({
          url: `${BASE_URL}${withTrailingSlash(`/miasto/${l.slug}`)}`,
          lastmod: formatLastmod(l._updatedAt),
        })),
      ...projects.map((p) => {
        const imgUrl = sanityImageUrl(p.imageRef);
        return {
          url: `${BASE_URL}${withTrailingSlash(`/portfolio/${p.slug}`)}`,
          lastmod: formatLastmod(p._updatedAt),
          // Portfolio: domyślnie geo Rzeszów (siedziba agencji, większość klientów
          // z Podkarpacia). Jeśli kiedyś w Sanity dojdą pola location per project,
          // można to dynamicznie nadpisywać.
          image: imgUrl
            ? {
                loc: imgUrl,
                title: p.title || p.slug,
                caption: `Realizacja Mixture Marketing — ${p.title || p.slug}`,
                geo: 'Rzeszów, Podkarpacie, Polska',
              }
            : null,
        };
      }),
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

  // XML escape dla URL i title (Sanity moze zwracac apostrofy, &, itp.).
  const xmlEscape = (s) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allEntries
  .map((entry) => {
    let inner = `    <loc>${xmlEscape(entry.url)}</loc>\n    <lastmod>${entry.lastmod}</lastmod>`;
    if (entry.image && entry.image.loc) {
      inner += `\n    <image:image>\n      <image:loc>${xmlEscape(entry.image.loc)}</image:loc>`;
      if (entry.image.title)
        inner += `\n      <image:title>${xmlEscape(entry.image.title)}</image:title>`;
      if (entry.image.caption)
        inner += `\n      <image:caption>${xmlEscape(entry.image.caption)}</image:caption>`;
      if (entry.image.geo)
        inner += `\n      <image:geo_location>${xmlEscape(entry.image.geo)}</image:geo_location>`;
      inner += `\n    </image:image>`;
    }
    return `  <url>\n${inner}\n  </url>`;
  })
  .join('\n')}
</urlset>
`;

  fs.writeFileSync(SITEMAP_PATH, xml);
  console.log(`Sitemap generated at: ${SITEMAP_PATH} (${allEntries.length} URLs)`);
}

generateSitemap();
