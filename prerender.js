import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { routes } from './routes.js';
import Critters from 'critters';
import http from 'node:http';
import { createClient } from '@sanity/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, 'dist');
const PORT = 4173;
const MAX_CONCURRENCY = 2; // Render 2 pages in parallel

const sanityClient = createClient({
  projectId: 'azuef2ua',
  dataset: 'production',
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
    stdio: 'ignore', // Keep it quiet
    shell: true,
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

    // 4. Init Critters
    const critters = new Critters({
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
      console.log('Fetching articles...');
      const articles = await sanityClient.fetch('*[_type == "article"]{ "slug": slug.current }');
      const articleRoutes = articles.map((a) => `/baza-wiedzy/${a.slug}`);

      console.log('Fetching industries...');
      const industries = await sanityClient.fetch('*[_type == "industry"]{ "slug": slug.current }');
      const industryRoutes = industries.map((i) => `/branza/${i.slug}`);

      console.log('Fetching locations...');
      const locations = await sanityClient.fetch('*[_type == "location"]{ "slug": slug.current }');
      const locationRoutes = locations.map((l) => `/miasto/${l.slug}`);

      console.log('Fetching portfolio...');
      const projects = await sanityClient.fetch('*[_type == "caseStudy"]{ "slug": slug.current }');
      const projectRoutes = projects.map((p) => `/portfolio/${p.slug}`);

      dynamicRoutes = [...articleRoutes, ...industryRoutes, ...locationRoutes, ...projectRoutes];
      console.log(
        `✅ Found ${dynamicRoutes.length} dynamic routes (${articleRoutes.length} articles, ${industryRoutes.length} industries, ${locationRoutes.length} locations, ${projectRoutes.length} projects).`,
      );
    } catch (err) {
      console.warn(
        '⚠️ Failed to fetch dynamic routes from Sanity. Proceeding with static only.',
        err.message,
      );
    }

    const queue = [...routes, ...dynamicRoutes];
    const workers = [];

    // Helper to run workers
    const next = async () => {
      while (queue.length > 0) {
        const route = queue.shift();
        if (route) {
          await processRoute(browser, critters, route).catch((e) => {
            // Optional: Add to retry queue or just log
            console.error(`⚠️ Skipping ${route} due to error.`);
          });
        }
      }
    };

    // Spawn workers
    for (let i = 0; i < MAX_CONCURRENCY; i++) {
      workers.push(next());
    }

    await Promise.all(workers);

    console.log('🛑 Closing browser...');
    await browser.close();
  } catch (err) {
    console.error('❌ Critical Error during prerendering:', err);
    process.exit(1);
  } finally {
    server.kill();
    // Ensure process exits even if child process lingers
    setTimeout(() => process.exit(0), 1000);
  }
}

prerender();
