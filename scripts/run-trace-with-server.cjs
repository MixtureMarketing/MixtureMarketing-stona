const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Ścieżka do folderu z wynikami
const TRACE_DIR = path.join(__dirname, '../perf-traces');
if (!fs.existsSync(TRACE_DIR)) {
  fs.mkdirSync(TRACE_DIR);
}

// Lista kluczowych ścieżek do przetestowania
let ROUTES = [];

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

async function runTrace() {
  // Dynamic import for ESM module in CJS
  const routeModule = await import('../routes.js');
  ROUTES = routeModule.routes;
  
  console.log(`🚀 Rozpoczynam serwer preview i głęboki tracing wydajności dla ${ROUTES.length} podstron...`);

  // 1. Uruchomienie serwera preview
  const server = spawn('npm', ['run', 'preview', '--', '--port', PORT.toString()], {
    stdio: 'ignore',
    shell: true,
  });

  // Czekamy na start serwera
  console.log('⏳ Czekam na start serwera...');
  await new Promise((resolve) => setTimeout(resolve, 5000));

  let browser;
  try {
    browser = await puppeteer.launch({ headless: "new" });

    for (const route of ROUTES) {
      const page = await browser.newPage();
      const url = `${BASE_URL}${route}`;
      const fileName = route.replace(/\//g, '_') || 'home';
      // Usuń podwójne podkreślenia jeśli powstają
      const cleanFileName = fileName.replace(/_+/g, '_').replace(/^_/, '').replace(/_$/, '') || 'home';
      const tracePath = path.join(TRACE_DIR, `trace_${cleanFileName}.json`);

      console.log(`⏱️  Analizuję: ${route}...`);

      try {
        // Rozpocznij tracing (Main Thread, Layout Shifts, Network)
        await page.tracing.start({
          path: tracePath,
          categories: [
             'devtools.timeline', 
             'v8.execute',
             'blink.user_timing',
             'latencyInfo',
             'disabled-by-default-devtools.timeline.frame',
             'disabled-by-default-devtools.timeline.stack'
          ],
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
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    if (browser) await browser.close();
    if (server) {
        console.log('🛑 Zatrzymuję serwer...');
        process.kill(server.pid);
        // Na Windowsie spawn z shell:true uruchamia nowy proces cmd.exe, więc trzeba ubić drzewo procesów lub użyć taskkill w osobnym poleceniu,
        // ale w tym kontekście spróbujemy po prostu zakończyć proces nadrzędny Node, co powinno zamknąć dzieci w większości przypadków CI/CLI.
        // Dla pewności w środowisku lokalnym:
        try {
            require('child_process').execSync(`taskkill /F /IM node.exe /FI "PID ne ${process.pid}"`); 
        } catch (e) { /* ignore */ }
    }
    console.log('\n🏁 Tracing zakończony. Pliki można załadować do chrome://tracing lub https://ui.perfetto.dev/');
  }
}

runTrace();
