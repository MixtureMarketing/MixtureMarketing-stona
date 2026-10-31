import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { routes } from '../routes.js';
import { createClient } from '@sanity/client';
import { fetchDynamicLists } from './sanity-dynamic-routes.js';
import { formatLastmod, assertLastmod, buildSitemapXml } from './lib/sitemap.js';
import { resolveLastmods } from './lib/lastmod.js';

// Konwencja repo to `.env.local` (jak w Vite), nie `.env`. Bez argumentu `loadEnvFile`
// czytał nieistniejący `.env`, więc `npm run build`/`sitemap` padał lokalnie na braku
// `VITE_SANITY_PROJECT_ID`. Brak pliku (np. w CI, gdzie zmienne idą wprost z workflow)
// jest w porządku — dlatego try/catch.
try {
  process.loadEnvFile('.env.local');
} catch {
  // brak .env.local (CI podaje zmienne przez env) — nieistotne
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITEMAP_PATH = path.resolve(__dirname, '../public/sitemap.xml');
const BASE_URL = 'https://mixturemarketing.pl';
// Realne daty zmian stron statycznych (git log po plikach treści). Z pełną historią gita
// (CI: fetch-depth 0) liczone na żywo; bez niej (płytki klon) z commitowanego manifestu
// data/seo/lastmod.json, który odświeża `npm run lastmod`.
const ROOT = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/seo/lastmod.json'), 'utf8'));
const staticLastmods = resolveLastmods(ROOT, routes, manifest);

const sanityClient = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-21',
  useCdn: false,
});

// Wymusza trailing slash poza root i URL-ami z query/hash. Kanoniczna forma.
function withTrailingSlash(route) {
  if (!route) return '/';
  if (route === '/') return '/';
  if (route.includes('?') || route.includes('#')) return route;
  return route.endsWith('/') ? route : `${route}/`;
}

async function generateSitemap() {
  console.log('Generating sitemap.xml...');

  // Statyczne sciezki: lastmod = realna data zmiany tresci strony z data/seo/lastmod.json
  // (git log po plikach tresci, scripts/lib/lastmod.js). Wczesniej data buildu (kazdy push
  // „odswiezal" ~60 stron bez zmiany tresci), potem brak lastmod. Trasa bez daty w manifescie
  // = blad buildu (assertLastmod nizej), NIGDY „dzisiaj".
  // Dla kluczowych stron lokalnych dodajemy image:image z geo_location -
  // sygnal dla Google Image Search ze obrazy sa powiazane z Rzeszowem.
  const LOCAL_IMAGE_OVERRIDES = {
    '/': {
      loc: `${BASE_URL}/assets/images/sygnet.png`,
      title: 'Mixture Marketing — Agencja Marketingowa Rzeszów',
      caption: 'Mixture Marketing — Al. Józefa Piłsudskiego 17/4, Rzeszów (adres rejestrowy)',
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
      caption: 'Eksperci web development, SEO i marketingu z Rzeszowa',
      geo: 'Rzeszów, Podkarpacie, Polska',
    },
  };

  const staticEntries = routes.map((route) => {
    const url = `${BASE_URL}${withTrailingSlash(route)}`;
    const override = LOCAL_IMAGE_OVERRIDES[withTrailingSlash(route)];
    return {
      url,
      lastmod: staticLastmods[withTrailingSlash(route)] ?? null,
      image: override || null,
    };
  });

  // Dynamiczne sciezki z Sanity - lastmod = _updatedAt z dokumentu.
  // Portfolio caseStudy dostaje image (xmlns:image) dla Google Image Search.
  // FAIL-LOUD (scripts/sanity-dynamic-routes.js): błąd pobrania albo pusta lista = wyjątek
  // i exit 1. Dawniej ostrzeżenie + sitemapa bez /branza/*, /miasto/*, /portfolio/*.
  let dynamicEntries = [];
  {
    const {
      article: articles,
      industry: industries,
      location: locations,
      caseStudy: projects,
    } = await fetchDynamicLists(sanityClient, {
      article:
        '*[_type == "article" && defined(slug.current)]{ "slug": slug.current, _updatedAt, mainImage }',
      industry:
        '*[_type == "industry" && defined(slug.current)]{ "slug": slug.current, _updatedAt }',
      location:
        '*[_type == "location" && defined(slug.current)]{ "slug": slug.current, _updatedAt }',
      caseStudy:
        '*[_type == "caseStudy" && defined(slug.current)]{ "slug": slug.current, _updatedAt, title, "imageRef": gallery[0].asset._ref }',
    });

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

  // Fail-loud: kazdy adres mapy musi miec lastmod (MIX-781). Sanity dostarcza _updatedAt,
  // trasy statyczne — manifest; brak = czerwony build zamiast mapy z dziurami.
  assertLastmod(allEntries);

  const xml = buildSitemapXml(allEntries);

  fs.writeFileSync(SITEMAP_PATH, xml);
  console.log(`Sitemap generated at: ${SITEMAP_PATH} (${allEntries.length} URLs)`);

  // Build ma kolejnosc `vite build && sitemap && ...` — vite kopiuje public/
  // do dist/ ZANIM ten skrypt sie uruchomi, wiec deploy serwowal sitemape
  // zakomitowana w repo (zawsze o jeden build za pozno; prod 2026-07-18 nie
  // mial /wycena/ i lastmod <= 07-15). Swieza wersja musi trafic TEZ do dist/.
  const distSitemap = path.resolve(__dirname, '../dist/sitemap.xml');
  if (fs.existsSync(path.dirname(distSitemap))) {
    fs.writeFileSync(distSitemap, xml);
    console.log(`Sitemap copied to: ${distSitemap}`);
  }
}

generateSitemap().catch((err) => {
  // Sitemapa NIE jest zapisywana — lepiej czerwony build niż sitemapa bez podstron z CMS.
  console.error(`❌ Sitemap: ${err instanceof Error ? err.message : err}`);
  process.exitCode = 1;
});
