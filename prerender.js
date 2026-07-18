import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { routes } from './routes.js';
import Beasties from 'beasties';
import http from 'node:http';
import { createClient } from '@sanity/client';

// Konwencja repo to `.env.local` (jak w Vite), nie `.env`. Bez argumentu `loadEnvFile`
// czytał nieistniejący `.env`, więc `npm run prerender`/`build:full` padał lokalnie na
// `createClient` Sanity (brak `VITE_SANITY_PROJECT_ID`). Brak pliku (np. w CI, gdzie zmienne
// idą wprost z workflow) jest w porządku — dlatego try/catch. Bliźniak fixu generate-sitemap (a2bb840).
try {
  process.loadEnvFile('.env.local');
} catch {
  // brak .env.local (CI podaje zmienne przez env) — nieistotne
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, 'dist');
const PORT = 4173;
// 4 daje najlepszy stosunek czasu do RAM/CPU na typowym ubuntu-latest CI runnerze.
// Powyzej 4 puppeteer page pool zaczyna konkurowac o RAM (~500MB/page).
const MAX_CONCURRENCY = parseInt(process.env.PRERENDER_CONCURRENCY || '4', 10);

const sanityClient = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-21',
  useCdn: false,
});

// Utility: Wait for server to be ready
async function waitForServer(port, timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
          if (res.statusCode === 200) resolve();
          else reject(new Error(`Status ${res.statusCode}`));
        });
        req.on('error', reject);
        req.end();
      });
      return;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error(`Server at port ${port} did not start within ${timeout}ms`);
}

// Trasy, ktore po retry nadal nie maja pelnego heada (title/canonical/meta) —
// build konczy sie bledem zamiast cicho wysylac SEO-dziure na produkcje.
// (2026-07-18: pierwsze ~6 tras kolejki na CI zapisywalo sie bez heada —
// zimny start przegladarki/preview przekraczal 30s wait, fallback maskowal problem;
// prod mial home-title i zero canonical na /, /offers/, /contact/, /wycena/,
// /o-nas/, /privacy-policy/.)
const helmetFailures = [];

async function processRoute(browser, critters, route, attempt = 1) {
  const page = await browser.newPage();
  let pageClosed = false;
  const closePage = async () => {
    if (pageClosed) return;
    pageClosed = true;
    await page.close().catch(() => {});
  };
  try {
    await page.setViewport({ width: 1280, height: 800 });

    // Set global flag for components
    await page.evaluateOnNewDocument(() => {
      window.isPrerendering = true;
    });

    // Optimization: Intercept and abort unnecessary requests
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'media', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    const url = `http://localhost:${PORT}${route}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
    await page.waitForSelector('#root', { timeout: 90000 });

    // Czekaj az React Helmet w pelni zhydratowal head: title + meta description +
    // canonical link. Wszystkie trzy elementy ustawia Seo.tsx, wiec ich obecnosc
    // sygnalizuje ze Helmet skonczyl prace.
    try {
      // Sygnal ukonczenia Helmeta: canonical + meta description z data-rh
      // (oba wstawia Seo.tsx na KAZDEJ stronie). Poprzedni warunek
      // `title !== placeholder` byl z definicji falszywy dla home — jej
      // realny tytul JEST placeholderem — wiec home zawsze wpadala w
      // timeout+fallback i szla na prod bez canonical (2026-07-18).
      await page.waitForFunction(
        () => {
          const canonical = document.querySelector('link[rel="canonical"][data-rh="true"]');
          const metaDesc = document.querySelector('meta[name="description"][data-rh="true"]');
          return !!(document.title && canonical && metaDesc);
        },
        { timeout: 30000, polling: 200 },
      );
    } catch {
      if (attempt === 1) {
        // Zimny start (pierwsza partia na swiezym Chromium/preview) — druga
        // wizyta jest juz ciepla i przechodzi. Retry zamiast fallbacku.
        throw new Error('__HELMET_RETRY__');
      }
      console.warn(`⚠️ Helmet hydration timeout (30s) dla ${route} TAKZE po retry`);
      helmetFailures.push(route);
    }

    // Dodatkowy buffer dla async schemas (JSON-LD wstrzykiwany przez Helmet).
    // Przyciete 800->400ms (2026-07-11) — Helmet i tak jest juz odczekany wyzej
    // (waitForFunction na title+canonical+meta), to tylko margines na JSON-LD.
    await new Promise((r) => setTimeout(r, 400));

    // Error detection
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.toLowerCase().includes('coś poszło nie tak') && bodyText.length < 500) {
      throw new Error(`React Error Boundary triggered on ${route}`);
    }

    let html = await page.content();
    try {
      html = await critters.process(html);
    } catch (crittersError) {
      console.error(`⚠️ Critters error on ${route}:`, crittersError.message);
    }

    // Dedup duplicate <link rel="preload"> tagi — Beasties czasem dodaje
    // taki sam preload co Vite (ten sam href). Eliminuje zbedne network hint.
    {
      const seen = new Set();
      html = html.replace(/<link\b[^>]*rel="preload"[^>]*>/g, (match) => {
        const href = (match.match(/href="([^"]+)"/) || [])[1];
        const as = (match.match(/\bas="([^"]+)"/) || [])[1];
        const key = `${as || ''}|${href || ''}`;
        if (!href) return match;
        if (seen.has(key)) return '';
        seen.add(key);
        return match;
      });
    }

    // Calculate file path
    const cleanRoute = route === '/' ? '' : route.replace(/^\/|\/$/g, '');
    const routeDir = path.join(DIST_DIR, cleanRoute);
    const filePath = path.join(routeDir, 'index.html');

    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    fs.writeFileSync(filePath, html);
    console.log(`✅ Prerendered & Optimized: ${route}${attempt > 1 ? ' (po retry)' : ''}`);
  } catch (err) {
    if (err.message === '__HELMET_RETRY__') {
      console.warn(`♻️ Helmet timeout dla ${route} (zimny start) — retry...`);
      await closePage();
      return processRoute(browser, critters, route, attempt + 1);
    }
    console.error(`❌ Failed to prerender ${route}:`, err.message);
    throw err;
  } finally {
    await closePage();
  }
}

async function prerender() {
  console.log('🚀 Starting optimized prerendering...');

  // 1. Start Server
  console.log('📦 Starting preview server...');
  const server = spawn('npm', ['run', 'preview', '--', '--port', PORT.toString()], {
    stdio: 'ignore',
    shell: true,
    detached: true, // Allow killing process group
  });

  try {
    // 2. Wait for server
    console.log('⏳ Waiting for server to be ready...');
    await waitForServer(PORT);
    console.log('🟢 Server is ready!');

    // 3. Launch Browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      timeout: 60000,
    });

    // 4. Init Beasties
    const critters = new Beasties({
      path: DIST_DIR,
      publicPath: '/',
      compress: true,
      inlineFonts: true,
      preloadFonts: true,
      preload: 'swap',
      reduceInlineStyles: true,
    });

    // 5. Process Routes in Batches (Parallel)
    console.log('🔄 Fetching dynamic routes from Sanity...');
    let dynamicRoutes = [];
    try {
      const [articles, industries, locations, projects] = await Promise.all([
        sanityClient.fetch('*[_type == "article"]{ "slug": slug.current }'),
        sanityClient.fetch('*[_type == "industry"]{ "slug": slug.current }'),
        sanityClient.fetch('*[_type == "location"]{ "slug": slug.current }'),
        sanityClient.fetch('*[_type == "caseStudy"]{ "slug": slug.current }'),
      ]);

      dynamicRoutes = [
        ...articles.map((a) => `/baza-wiedzy/${a.slug}`),
        ...industries.map((i) => `/branza/${i.slug}`),
        ...locations.map((l) => `/miasto/${l.slug}`),
        ...projects.map((p) => `/portfolio/${p.slug}`),
      ];

      console.log(`✅ Found ${articles.length} articles.`);
      console.log(`✅ Found ${industries.length} industries.`);
      console.log(`✅ Found ${locations.length} locations.`);
      console.log(`✅ Found ${projects.length} projects.`);
      console.log(`🚀 Total dynamic routes: ${dynamicRoutes.length}`);
    } catch (err) {
      console.warn('⚠️ Failed to fetch dynamic routes:', err.message);
    }

    // Rozgrzewka: jedna wizyta na home ZANIM ruszy kolejka — zimny Chromium +
    // preview + Beasties powodowaly, ze pierwsza partia workerow przekraczala
    // 30s wait Helmeta i zapisywala strony bez heada (patrz helmetFailures).
    console.log('🔥 Warm-up render (throwaway)...');
    try {
      const warmup = await browser.newPage();
      await warmup.goto(`http://localhost:${PORT}/`, {
        waitUntil: 'networkidle0',
        timeout: 90000,
      });
      await warmup.waitForSelector('#root', { timeout: 90000 });
      await warmup.close();
    } catch (e) {
      console.warn('⚠️ Warm-up failed (kontynuuję):', e.message);
    }

    const queue = [...routes, ...dynamicRoutes];
    const workers = [];

    const next = async () => {
      while (queue.length > 0) {
        const route = queue.shift();
        if (route) await processRoute(browser, critters, route);
      }
    };

    for (let i = 0; i < MAX_CONCURRENCY; i++) workers.push(next());
    await Promise.all(workers);

    // Fail-loud: strona bez heada to SEO-dziura na produkcji (zly title,
    // brak canonical/description) — lepiej czerwone CI niz cichy fallback.
    if (helmetFailures.length > 0) {
      throw new Error(
        `Helmet nie zhydratowal heada (po retry) dla ${helmetFailures.length} tras: ${helmetFailures.join(', ')}`,
      );
    }

    // CF Pages soft-404 fix: prerender NotFound jako dist/404.html.
    // CF Pages automatycznie serwuje ten plik ze statusem 404 dla URL-i ktore
    // nie maja fizycznego pliku w dist/. NotFound komponent ma <meta robots=noindex>
    // wiec Google dostaje poprawny sygnal: 404 + noindex.
    console.log('📄 Prerendering /404.html for Pages fallback...');
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.evaluateOnNewDocument(() => {
        window.isPrerendering = true;
      });
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'media', 'font'].includes(req.resourceType())) req.abort();
        else req.continue();
      });
      // Specjalny URL ktorego nie ma w routes - React Router pokaze NotFound (catchall '*').
      await page.goto(`http://localhost:${PORT}/__prerender_404`, {
        waitUntil: 'networkidle0',
        timeout: 60000,
      });
      await page.waitForSelector('#root', { timeout: 60000 });
      await new Promise((r) => setTimeout(r, 1000));
      let html = await page.content();
      try {
        html = await critters.process(html);
      } catch (e) {
        console.warn('Critters 404 skip:', e.message);
      }
      fs.writeFileSync(path.join(DIST_DIR, '404.html'), html);
      console.log('✅ Wrote dist/404.html (CF Pages soft-404 fix)');
      await page.close();
    } catch (e) {
      console.warn('⚠️ Failed to prerender 404.html:', e.message);
    }

    console.log('🛑 Closing browser...');
    await browser.close();
  } catch (err) {
    console.error('❌ Critical Error during prerendering:', err);
    process.exit(1);
  } finally {
    if (server.pid) {
      try {
        // Kill the entire process group on Unix-like systems
        process.kill(-server.pid, 'SIGTERM');
      } catch (e) {
        server.kill();
      }
    }
    setTimeout(() => process.exit(0), 1000);
  }
}

prerender();
