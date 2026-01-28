import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { routes } from '../routes.js';

const PORT = 4173;

async function runPerfAudit() {
  console.log('⏱️ Starting Deep Performance Audit...');

  const server = spawn('npm', ['run', 'preview', '--', '--port', PORT.toString()], {
    stdio: 'ignore',
    shell: true,
  });

  await new Promise((resolve) => setTimeout(resolve, 3000));

  const browser = await puppeteer.launch({ headless: true });
  const results = [];

  console.log(`📋 Found ${routes.length} routes to audit.`);

  for (const route of routes) {
    // Test home, offers and one heavy article
    const page = await browser.newPage();

    // Enable performance tracing
    const client = await page.target().createCDPSession();
    await client.send('Performance.enable');

    console.log(`🚀 Analyzing performance: ${route}`);

    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0' });

    // Get Web Vitals from the page
    const metrics = await page.evaluate(() => {
      const perf = window.performance.getEntriesByType('navigation')[0];
      const paint = window.performance.getEntriesByType('paint');
      const fcp = paint.find((p) => p.name === 'first-contentful-paint')?.startTime;

      return {
        domInteractive: perf.domInteractive,
        domContentLoaded: perf.domContentLoadedEventEnd,
        loadEvent: perf.loadEventEnd,
        fcp: fcp ? Math.round(fcp) : 'N/A',
        ttfb: Math.round(perf.responseStart - perf.requestStart),
      };
    });

    // Measure TBT (Total Blocking Time) approximation
    const perfMetrics = await client.send('Performance.getMetrics');
    const scriptDuration =
      perfMetrics.metrics.find((m) => m.name === 'ScriptDuration')?.value * 1000;
    const layoutDuration =
      perfMetrics.metrics.find((m) => m.name === 'LayoutDuration')?.value * 1000;
    const taskDuration = perfMetrics.metrics.find((m) => m.name === 'TaskDuration')?.value * 1000;

    results.push({
      route,
      ...metrics,
      jsTime: Math.round(scriptDuration),
      layoutTime: Math.round(layoutDuration),
      totalThreadTime: Math.round(taskDuration),
    });

    await page.close();
  }

  console.table(results);

  console.log('\n💡 Analysis:');
  results.forEach((r) => {
    if (r.ttfb > 200)
      console.log(`⚠️ ${r.route}: High TTFB (${r.ttfb}ms). Check Cloudflare Edge Caching.`);
    if (r.jsTime > 500)
      console.log(
        `⚠️ ${r.route}: Heavy JS execution (${r.jsTime}ms). Consider delaying non-critical scripts.`,
      );
  });

  await browser.close();
  server.kill();
  process.exit(0);
}

runPerfAudit();
