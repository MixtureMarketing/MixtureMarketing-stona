import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { routes } from '../routes.js';

// Użycie: `npm run audit:a11y` (wszystkie statyczne trasy z routes.js)
// albo `node scripts/audit-a11y.js /contact/ /o-nas/` (wybrane trasy).
// Audyt chodzi WYŁĄCZNIE po lokalnym `vite preview` (dist/) — zbuduj najpierw.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = path.resolve(__dirname, '../a11y-report.json');
const PORT = 4173; // Preview server port
const BASE_URL = `http://localhost:${PORT}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Czy ktoś już słucha na porcie (dowolna odpowiedź HTTP = tak).
const probe = (port) =>
  new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });

async function waitForServer(port, timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await probe(port)) return;
    await sleep(500);
  }
  throw new Error(`Preview na porcie ${port} nie wstał w ${timeout}ms`);
}

/**
 * Przewija stronę KROKAMI do samego dołu i czeka, aż wszystko się dociągnie.
 * Sekcje są w `LazyHydrate whenVisible` (i animacjach whileInView) — axe na świeżo
 * załadowanej stronie po cichu pominąłby wszystko poniżej linii zgięcia i dał
 * „czysty” wynik dla niezmierzonej strony (CLAUDE.md, precedens 2026-07-15).
 * Pętla kończy się, gdy jesteśmy na dole i wysokość dokumentu przestała rosnąć
 * (hydracja sekcji wydłuża stronę w trakcie przewijania).
 */
async function scrollToBottom(page) {
  const steps = await page.evaluate(async () => {
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    const doc = document.scrollingElement || document.documentElement;
    let lastHeight = -1;
    let stableAtBottom = 0;
    let i = 0;
    for (; i < 400 && stableAtBottom < 3; i++) {
      // behavior: 'instant' — html ma scroll-behavior: smooth, a nam zależy na
      // deterministycznym kroku (smooth przy szybkich wywołaniach gubi kroki).
      window.scrollTo({ top: window.scrollY + window.innerHeight * 0.75, behavior: 'instant' });
      await pause(200);
      const height = doc.scrollHeight;
      const atBottom = window.scrollY + window.innerHeight >= height - 2;
      stableAtBottom = atBottom && height === lastHeight ? stableAtBottom + 1 : 0;
      lastHeight = height;
    }
    return i;
  });
  // Doczekaj leniwe chunki/dane sekcji i dokończenie animacji wejścia.
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 15000 }).catch(() => {});
  await sleep(1500);
  return steps;
}

async function runAudit() {
  console.log('🔍 Starting Accessibility Audit...');

  const selected = process.argv.slice(2);
  const auditRoutes = selected.length > 0 ? selected : routes;

  // Pułapka z CLAUDE.md: zombie `vite preview` na 4173 serwowałby stary dist/,
  // a audyt mierzyłby nie tę aplikację. Zajęty port = przerwij, zamiast mierzyć cudzy serwer.
  if (await probe(PORT)) {
    console.error(
      `❌ Port ${PORT} jest już zajęty (pozostałość po buildzie/prerenderze?). Zabij proces i uruchom ponownie.`,
    );
    process.exit(1);
  }

  // 1. Start the preview server (własna grupa procesów — da się ją potem zabić w całości;
  // samo server.kill() przy shell:true zabijało tylko powłokę, a vite zostawał na porcie).
  console.log('📦 Starting preview server...');
  const server = spawn('npm', ['run', 'preview', '--', '--port', PORT.toString(), '--strictPort'], {
    stdio: 'ignore',
    shell: true,
    detached: true,
  });
  const stopServer = () => {
    if (!server.pid) return;
    try {
      process.kill(-server.pid, 'SIGTERM');
    } catch {
      server.kill();
    }
  };

  let browser = null;
  const fullReport = {};
  const failed = [];
  let exitCode = 0;

  try {
    await waitForServer(PORT);

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    // UA bez „Headless”: App.tsx/LazyHydrate traktują taki UA jak prerender (wszystko
    // renderowane od razu, bez modala) — audyt ma widzieć to, co realny użytkownik.
    const userAgent = (await browser.userAgent()).replace(/HeadlessChrome/g, 'Chrome');

    const axeCoreSource = fs.readFileSync(
      path.resolve(__dirname, '../node_modules/axe-core/axe.min.js'),
      'utf8',
    );

    for (const route of auditRoutes) {
      const page = await browser.newPage();
      await page.setUserAgent(userAgent);
      await page.setViewport({ width: 1280, height: 800 });

      const url = `${BASE_URL}${route}`;
      console.log(`📡 Auditing: ${route}`);

      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        // Wait for app to mount
        await page.waitForSelector('#root');

        // Przewiń do dołu i zmierz NA DOLE — bez powrotu na górę (powrót chowa
        // sekcje z powrotem i zaniża wynik; CLAUDE.md).
        const steps = await scrollToBottom(page);

        // Inject axe-core
        await page.evaluate(axeCoreSource);

        // Run audit
        const results = await page.evaluate(async () => {
          return await window.axe.run();
        });

        if (results.violations.length > 0) {
          fullReport[route] = results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodes: v.nodes.length,
            help: v.help,
            helpUrl: v.helpUrl,
          }));
          console.log(
            `❌ Found ${results.violations.length} violations on ${route} (${steps} scroll steps)`,
          );
        } else {
          console.log(`✅ ${route} passed audit (${steps} scroll steps).`);
        }
      } catch (err) {
        // Niezmierzona strona to nie „czysta” strona — trafia do raportu jako błąd.
        console.error(`❌ Failed to audit ${route}:`, err.message);
        fullReport[route] = { error: err.message };
        failed.push(route);
      } finally {
        await page.close();
      }
    }

    fs.writeFileSync(REPORT_PATH, JSON.stringify(fullReport, null, 2));
    console.log(`\n🎉 Audit complete! Report saved to: ${REPORT_PATH}`);
    if (failed.length > 0) {
      console.error(`⚠️ Nie zmierzono ${failed.length} tras: ${failed.join(', ')}`);
      exitCode = 1;
    }
  } catch (err) {
    console.error('❌ Audit process failed:', err);
    exitCode = 1;
  } finally {
    console.log('🛑 Closing browser and server...');
    if (browser) await browser.close().catch(() => {});
    stopServer();
    setTimeout(() => process.exit(exitCode), 500);
  }
}

runAudit();
