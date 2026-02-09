import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { routes } from '../routes.js';
import { createClient } from '@sanity/client';

try {
  process.loadEnvFile();
} catch (e) {
  // .env might not exist
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = path.resolve(__dirname, '../health-report.json');
const PORT = 4173;
const MAX_CONCURRENCY = 5; // Check 5 pages at once

const sanityClient = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'azuef2ua',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-21',
  useCdn: false,
});

async function processRoute(browser, route, fullReport) {
  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', async (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      const args = await Promise.all(
        msg.args().map(async (arg) => {
          try {
            const val = await arg.jsonValue();
            return typeof val === 'object' ? JSON.stringify(val) : String(val);
          } catch (e) {
            return 'Unserializable';
          }
        }),
      );
      const text = args.join(' ');
      if (
        text &&
        !text.includes('Failed to load resource') &&
        !text.includes('chrome-extension') &&
        !text.includes('ERR_BLOCKED_BY_CLIENT')
      ) {
        consoleErrors.push(`[${type.toUpperCase()}] ${text}`);
      }
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(`[PAGE_ERROR] ${err.message}\n${err.stack}`);
  });

  const url = `http://localhost:${PORT}${route}`;
  console.log(`🚀 Checking: ${route}`);

  try {
    // Use networkidle2 for more reliable checks
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    if (!response || !response.ok()) {
      const status = response ? response.status() : 'No Response';
      consoleErrors.push(`[HTTP_ERROR] Status ${status}`);
    }

    // Visual Check: Verify critical elements
    const visualStatus = await page.evaluate(() => {
      const root = document.getElementById('root');
      const rootPopulated = root && root.innerHTML.trim().length > 100;
      const nav = !!document.querySelector('nav');
      const footer = !!document.querySelector('footer');
      const bodyText = document.body.innerText;
      const isErrorBoundary =
        bodyText.toLowerCase().includes('coś poszło nie tak') && bodyText.length < 500;
      return { rootPopulated, nav, footer, isErrorBoundary };
    });

    if (!visualStatus.rootPopulated || !visualStatus.nav || !visualStatus.footer) {
      consoleErrors.push(
        `[VISUAL_ERROR] Missing components: RootPopulated=${visualStatus.rootPopulated}, Nav=${visualStatus.nav}, Footer=${visualStatus.footer}`,
      );
    }

    if (consoleErrors.length > 0 || visualStatus.isErrorBoundary) {
      fullReport.errors.push({ route, errors: consoleErrors });
      console.log(`❌ Issues detected on ${route}:`);
      consoleErrors.slice(0, 5).forEach((err) => console.log(`   - ${err.substring(0, 200)}`));
      if (visualStatus.isErrorBoundary) console.log('   - Error Boundary UI triggered');
    } else {
      fullReport.success.push(route);
      console.log(`✅ ${route} is healthy.`);
    }
  } catch (err) {
    fullReport.errors.push({ route, errors: [err.message] });
    console.log(`❌ Critical error on ${route}: ${err.message}`);
  } finally {
    await page.close();
  }
}

async function runHealthCheck() {
  console.log('🛡️ Starting Site Health Audit (Smoke Test)...');

  const server = spawn('npm', ['run', 'preview', '--', '--port', PORT.toString()], {
    stdio: 'ignore',
    shell: true,
    detached: true,
  });

  await new Promise((resolve) => setTimeout(resolve, 5000));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const fullReport = {
    timestamp: new Date().toISOString(),
    errors: [],
    success: [],
  };

  try {
    // Discovery dynamic routes
    console.log('🔍 Discovering dynamic routes...');
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
        if (route) await processRoute(browser, route, fullReport);
      }
    };

    for (let i = 0; i < MAX_CONCURRENCY; i++) workers.push(next());
    await Promise.all(workers);

    fs.writeFileSync(REPORT_PATH, JSON.stringify(fullReport, null, 2));

    console.log('\n📊 Health Summary:');
    console.log(`- Healthy: ${fullReport.success.length}`);
    console.log(`- Broken: ${fullReport.errors.length}`);

    if (fullReport.errors.length > 0) {
      console.log('\n❌ Breakdown of errors:');
      fullReport.errors.forEach((e) => {
        console.log(`  - ${e.route}: ${e.errors[0]?.substring(0, 150)}...`);
      });
    }
  } catch (err) {
    console.error('❌ Failed:', err);
  } finally {
    await browser.close();
    if (server.pid) {
      try {
        process.kill(-server.pid, 'SIGTERM');
      } catch (e) {
        server.kill();
      }
    }
    process.exit(fullReport.errors.length > 0 ? 1 : 0);
  }
}

runHealthCheck();
