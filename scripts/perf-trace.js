const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Ścieżka do folderu z wynikami
const TRACE_DIR = path.join(__dirname, '../perf-traces');
if (!fs.existsSync(TRACE_DIR)) {
  fs.mkdirSync(TRACE_DIR);
}

// Lista kluczowych ścieżek do przetestowania
const ROUTES = [
  '/',
  '/audyt-360/',
  '/contact/',
  '/web-development/corporate/',
  '/marketing/seo/',
  '/portal', // Jeśli wymaga logowania, trace pokaże ekran logowania
  '/branza/medycyna',
  '/miasto/rzeszow'
];

const BASE_URL = 'http://localhost:4173';

async function runTrace() {
  console.log('🚀 Rozpoczynam głęboki tracing wydajności...');
  const browser = await puppeteer.launch({ headless: "new" });

  for (const route of ROUTES) {
    const page = await browser.newPage();
    const url = `${BASE_URL}${route}`;
    const fileName = route.replace(/\//g, '_') || 'home';
    const tracePath = path.join(TRACE_DIR, `trace_${fileName}.json`);

    console.log(`⏱️  Analizuję: ${route}...`);

    try {
      // Rozpocznij tracing (Main Thread, Layout Shifts, Network)
      await page.tracing.start({
        path: tracePath,
        categories: ['devtools.timeline', 'v8.execute', 'blink.user_timing', 'latencyInfo', 'disabled-by-default-devtools.timeline.frame', 'disabled-by-default-devtools.timeline.stack'],
      });

      await page.goto(url, { waitUntil: 'networkidle0' });
      
      // Dodatkowy czas na "stabilizację" animacji Reacta/Framer Motion
      await new Promise(r => setTimeout(r, 2000));

      await page.tracing.stop();
      console.log(`✅ Trace zapisany: ${tracePath}`);
    } catch (err) {
      console.error(`❌ Błąd podczas tracingu ${route}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\n🏁 Tracing zakończony. Pliki można załadować do chrome://tracing');
}

runTrace();
