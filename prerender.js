import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { routes } from './routes.js';
import Beasties from 'beasties';
import http from 'node:http';
import { createClient } from '@sanity/client';

try {
  process.loadEnvFile();
} catch (e) {
  // .env might not exist
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, 'dist');
const PORT = 4173;
const MAX_CONCURRENCY = 3; // Even more conservative for CI stability

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
  const consoleErrors = [];

  // Capture ALL browser logs for debugging
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`[BROWSER ERROR] ${msg.text()}`);
  });
  page.on('pageerror', (err) => consoleErrors.push(`[PAGE ERROR] ${err.message}`));

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
      const url = req.url();
      if (
        ['image', 'media', 'font'].includes(resourceType) ||
        url.includes('google-analytics') ||
        url.includes('facebook.com') ||
        url.includes('googletagmanager.com') ||
        url.includes('hotjar.com')
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    const url = `http://localhost:${PORT}${route}`;
    console.log(`🔍 Prerendering: ${route}`);

    // Fast navigation - wait only for initial DOM
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Explicit wait for the #root to be populated (with retry logic)
    try {
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root');
          return root && root.innerHTML.trim().length > 100;
        },
        { timeout: 45000 }
      );
    } catch (timeoutErr) {
      console.error(`⚠️ Timeout on ${route}. Captured errors so far:\n`, consoleErrors.join('\n'));
      throw timeoutErr;
    }

    // Small buffer for hydration stability
    await new Promise((r) => setTimeout(r, 2000));

    // Final check
    const content = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const rootHtml = document.getElementById('root')?.innerHTML || '';
      const isError = bodyText.toLowerCase().includes('coś poszło nie tak') && bodyText.length < 500;
      return { textLength: bodyText.length, rootLength: rootHtml.length, isError };
    });

    if (content.isError) {
      throw new Error(`React Error Boundary triggered on ${route}`);
    }
    if (content.rootLength < 100) {
      throw new Error(`Empty render on ${route} (Root length: ${content.rootLength})`);
    }

    let html = await page.content();

    // Ensure absolute paths for assets
    html = html.replace(/(src|href)="assets\//g, '$1="/assets/');

    try {
      html = await critters.process(html);
    } catch (crittersError) {
      console.error(`⚠️ Critters error on ${route}:`, crittersError.message);
    }

    // Calculate file path
    const cleanRoute = route === '/' ? '' : route.replace(/^\/|\/$/g, '');
    const routeDir = path.join(DIST_DIR, cleanRoute);
    const filePath = path.join(routeDir, 'index.html');

    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    fs.writeFileSync(filePath, html);
    console.log(`✅ Success: ${route}`);
  } catch (err) {
    console.error(`❌ Failed: ${route} - ${err.message}`);
    if (consoleErrors.length > 0) {
      console.error(`📋 Browser Console for ${route}:\n${consoleErrors.join('\n')}`);
    }
    throw err;
  } finally {
    await page.close();
  }
}

async function prerender() {
  console.log('🚀 Starting robust prerendering process...');

  const server = spawn('npm', ['run', 'preview', '--', '--port', PORT.toString()], {
    stdio: 'ignore',
    shell: true,
    detached: true,
  });

  try {
    await waitForServer(PORT);
    console.log('🟢 Preview server ready.');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process'],
    });

    const critters = new Beasties({
      path: DIST_DIR,
      publicPath: '/',
      compress: true,
      reduceInlineStyles: true,
      pruneSource: false,
    });

    console.log('🔄 Fetching dynamic routes...');
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
      console.log(`📊 Found ${dynamicRoutes.length} dynamic routes.`);
    } catch (err) {
      console.warn('⚠️ CMS Fetch failed, continuing with static routes only.');
    }

    const queue = [...routes, ...dynamicRoutes];
    console.log(`🚀 Total pages to render: ${queue.length}`);

    const workers = [];
    const next = async () => {
      while (queue.length > 0) {
        const route = queue.shift();
        if (route) await processRoute(browser, critters, route);
      }
    };

    for (let i = 0; i < MAX_CONCURRENCY; i++) workers.push(next());
    await Promise.all(workers);

    await browser.close();
    console.log('✨ Prerendering complete!');
  } catch (err) {
    console.error('❌ Critical Prerender Failure:', err);
    process.exit(1);
  } finally {
    if (server.pid) {
      try {
        process.kill(-server.pid, 'SIGTERM');
      } catch (e) {
        server.kill();
      }
    }
    setTimeout(() => process.exit(0), 1000);
  }
}

prerender();