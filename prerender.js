import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { routes } from './routes.js';
import Beasties from 'beasties';
import http from 'node:http';
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, 'dist');
const PORT = 4173;
const MAX_CONCURRENCY = 2; // Render 2 pages in parallel

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

async function processRoute(browser, critters, route) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1280, height: 800 });

    // Set global flag for components
    await page.evaluateOnNewDocument(() => {
      window.isPrerendering = true;
    });

    // Optimization: Intercept and abort unnecessary requests
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'media', 'font'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    const url = `http://localhost:${PORT}${route}`;
    // console.log(`⏳ Processing: ${route}`);

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
    await page.waitForSelector('#root', { timeout: 90000 });
    // Allow small delay for hydration/rendering final touches (Helmet etc.)
    await new Promise((r) => setTimeout(r, 1000));

    let html = await page.content();
    try {
      html = await critters.process(html);
    } catch (crittersError) {
      console.error(`⚠️ Critters error on ${route}:`, crittersError.message);
      // Proceed with unoptimized HTML if Critters fails
    }

    // Calculate file path
    let filePath;
    if (route === '/') {
      filePath = path.join(DIST_DIR, 'index.html');
    } else {
      // Remove leading/trailing slashes for path construction
      const cleanRoute = route.replace(/^\/|\/$/g, '');
      const routeDir = path.join(DIST_DIR, cleanRoute);

      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }
      filePath = path.join(routeDir, 'index.html');
    }

    fs.writeFileSync(filePath, html);
    // console.log(`✅ Prerendered & Optimized: ${route} -> ${filePath}`);
    console.log(`✅ Prerendered & Optimized: ${route}`);
  } catch (err) {
    console.error(`❌ Failed to prerender ${route}:`, err.message);
    throw err;
  } finally {
    await page.close();
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

    // Custom processRoute with error checking
    const processRouteWithCheck = async (browser, critters, route) => {
      const page = await browser.newPage();
      try {
        await page.setViewport({ width: 1280, height: 800 });

        await page.evaluateOnNewDocument(() => {
          window.isPrerendering = true;
        });

        await page.setRequestInterception(true);
        page.on('request', (req) => {
          if (['image', 'media', 'font'].includes(req.resourceType())) req.abort();
          else req.continue();
        });

        await page.goto(`http://localhost:${PORT}${route}`, {
          waitUntil: 'networkidle0',
          timeout: 90000,
        });
        await page.waitForSelector('#root', { timeout: 90000 });
        await new Promise((r) => setTimeout(r, 1000));

        const bodyText = await page.evaluate(() => document.body.innerText);
        if (bodyText.toLowerCase().includes('coś poszło nie tak') && bodyText.length < 500) {
          throw new Error(`React Error Boundary triggered on ${route}`);
        }

        let html = await page.content();
        html = await critters.process(html);

        let filePath =
          route === '/'
            ? path.join(DIST_DIR, 'index.html')
            : path.join(DIST_DIR, route.replace(/^\/|\/$/g, ''), 'index.html');
        if (route !== '/') fs.mkdirSync(path.dirname(filePath), { recursive: true });

        fs.writeFileSync(filePath, html);
        console.log(`✅ Prerendered & Optimized: ${route}`);
      } finally {
        await page.close();
      }
    };

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

      console.log(`✅ Found ${dynamicRoutes.length} dynamic routes.`);
    } catch (err) {
      console.warn('⚠️ Failed to fetch dynamic routes:', err.message);
    }

    const queue = [...routes, ...dynamicRoutes];
    const workers = [];

    const next = async () => {
      while (queue.length > 0) {
        const route = queue.shift();
        if (route) await processRouteWithCheck(browser, critters, route);
      }
    };

    for (let i = 0; i < MAX_CONCURRENCY; i++) workers.push(next());
    await Promise.all(workers);

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
