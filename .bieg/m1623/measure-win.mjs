// MIX-1623 r3: pomiar TBT mobile samym Node (bez bash/curl; ma isc na stacji Windows).
//   node .bieg/m1623/measure-win.mjs [N=10]      zmienne: PAGES="/baza-wiedzy/ / /portfolio/", OUT=.bieg/m1623/out-win, SKIP_BUILD=1
// Build z flagami Preview -> prosty serwer statyczny dist na 127.0.0.1:4400 -> Lighthouse 13.6.0 (API, domyslnie mobile),
// po kolei, serie A i B (ten sam build, naprzemiennie = kontrola A/A), benchmarkIndex w kazdym przebiegu,
// slad devtools z kategoria v8.cpu_profiler dla przebiegu o najwyzszym TBT na stronie -> top 5 wg czasu wlasnego.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ENV = process.env;
const N = Number(process.argv[2] || 10);
const OUT = ENV.OUT || '.bieg/m1623/out-win';
const PAGES = (ENV.PAGES || '/baza-wiedzy/ / /portfolio/').split(/\s+/).filter(Boolean);
const PORT = 4400;
const LH_DIR = '.bieg/m1623/lhtool';
const FLAGS = {
  VITE_SANITY_PROJECT_ID: 'azuef2ua',
  VITE_SANITY_DATASET: 'production',
  VITE_MM_PREONBOARD_KEY: '',
  VITE_STRIPE_PUBLISHABLE_KEY: '',
  VITE_MM_MOBILE_MENU_B: '1',
  VITE_MM_LIVE_PRICE_BAR: '1',
  VITE_MM_VIEW_TRANSITIONS: '1',
  VITE_MM_TESTIMONIALS: '1',
  VITE_MM_COOKIE_BANNER_STATIC: '1',
};
const log = (...a) => console.log(...a);
const median = (xs) => {
  const s = [...xs].filter(Number.isFinite).sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : NaN;
};
const r0 = (x) => (Number.isFinite(x) ? Math.round(x) : 'brak');
function sh(cmd, args, extra = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', env: { ...ENV, ...extra } });
  return r.status ?? 1;
}
const slugOf = (p) => p.replace(/\//g, '') || 'home';

fs.mkdirSync(OUT, { recursive: true });
log(`node ${process.version} ${process.platform} ${process.arch}, N=${N}, strony: ${PAGES.join(' ')}`);
const git = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
log(`SHA=${(git.stdout || 'brak').trim()}`);

if (!ENV.SKIP_BUILD) {
  fs.writeFileSync('.npmrc', 'legacy-peer-deps=true\n');
  let rc = sh('npm', ['ci', '--no-audit', '--no-fund']);
  log(`npm ci rc ${rc}`);
  if (rc) process.exit(1);
  rc = sh('npm', ['run', 'build'], FLAGS);
  log(`build rc ${rc}`);
  if (rc) process.exit(1);
}
if (!fs.existsSync('dist/index.html')) {
  log('brak dist/index.html');
  process.exit(1);
}

// Lighthouse w katalogu w repo (poza package.json projektu); chrome-launcher jest jego zaleznoscia
fs.mkdirSync(LH_DIR, { recursive: true });
if (!fs.existsSync(path.join(LH_DIR, 'node_modules/lighthouse/package.json'))) {
  const rc = sh('npm', ['install', '--prefix', LH_DIR, '--no-save', '--no-audit', '--no-fund', 'lighthouse@13.6.0']);
  log(`npm install lighthouse rc ${rc}`);
  if (rc) process.exit(1);
}
const imp = (rel) => import(pathToFileURL(path.resolve(LH_DIR, 'node_modules', rel)).href);
const lhPkg = JSON.parse(fs.readFileSync(path.join(LH_DIR, 'node_modules/lighthouse/package.json'), 'utf8'));
log(`lighthouse ${lhPkg.version}`);
const { default: lighthouse } = await imp('lighthouse/core/index.js');
const chromeLauncher = await imp('chrome-launcher/dist/index.js');
let chromePath = ENV.CHROME_PATH || '';
try {
  const pup = await import('puppeteer'); // rozwiazywane z node_modules repo (skrypt lezy w repo)
  const p = (pup.default || pup).executablePath?.();
  if (p && fs.existsSync(p)) chromePath = p;
} catch {
  /* chrome-launcher znajdzie zainstalowana przegladarke */
}
log(`chrome: ${chromePath || '(chrome-launcher: systemowy)'}`);

// serwer statyczny (SPA fallback jak `vite preview`, bez kompresji)
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon',
  '.txt': 'text/plain', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4',
};
const root = path.resolve('dist');
const server = http.createServer((req, res) => {
  const p = decodeURIComponent((req.url || '/').split('?')[0]);
  let f = path.join(root, p);
  if (!f.startsWith(root)) {
    res.writeHead(403);
    return res.end();
  }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) f = path.join(root, 'index.html');
  res.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((ok) => server.listen(PORT, '127.0.0.1', ok));
log(`serwer statyczny http://127.0.0.1:${PORT} root ${root}`);

const results = [];
const worst = {};
async function once(page, series, n) {
  const chrome = await chromeLauncher.launch({
    chromePath: chromePath || undefined,
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  try {
    const rr = await lighthouse(`http://127.0.0.1:${PORT}${page}`, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance'],
      maxWaitForLoad: 60000,
      additionalTraceCategories: 'disabled-by-default-v8.cpu_profiler,disabled-by-default-v8.cpu_profiler.hires',
    });
    const a = rr.lhr.audits;
    const row = {
      page, series, n,
      tbt: a['total-blocking-time']?.numericValue,
      lcp: a['largest-contentful-paint']?.numericValue,
      cls: a['cumulative-layout-shift']?.numericValue,
      fcp: a['first-contentful-paint']?.numericValue,
      bi: rr.lhr.environment?.benchmarkIndex,
      finalUrl: rr.lhr.finalDisplayedUrl,
    };
    const trace = rr.artifacts?.traces?.defaultPass;
    const w = worst[page];
    if (trace && Number.isFinite(row.tbt) && (!w || row.tbt > w.tbt)) {
      const f = path.join(OUT, `${slugOf(page)}-worst.trace.json`);
      fs.writeFileSync(f, JSON.stringify(trace));
      worst[page] = { tbt: row.tbt, file: f, series, n };
    }
    return row;
  } finally {
    await chrome.kill();
  }
}
const t0 = Date.now();
for (const page of PAGES) {
  for (let n = 1; n <= N; n++) {
    for (const series of ['A', 'B']) {
      let row;
      try {
        row = await once(page, series, n);
        row.rc = 0;
      } catch (e) {
        row = { page, series, n, rc: 1, err: String(e.message || e).slice(0, 150) };
      }
      results.push(row);
      log(`lh ${slugOf(page)} ${series}${n} rc ${row.rc} tbt ${r0(row.tbt)} lcp ${r0(row.lcp)} cls ${Number.isFinite(row.cls) ? row.cls.toFixed(3) : 'brak'} bi ${r0(row.bi)}${row.err ? ' ERR ' + row.err : ''} [${((Date.now() - t0) / 60000).toFixed(1)} min]`);
      fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
    }
  }
}
server.close();

log('=== TABELA (TBT ms; A = seria 1, B = seria 2 tego samego builda, naprzemiennie; A/A = |medA - medB|)');
log('| strona | medA | medB | A/A | min..max A | min..max B | med A+B | med benchmarkIndex | LCP med | CLS med | finalUrl |');
log('|---|---|---|---|---|---|---|---|---|---|---|');
for (const page of PAGES) {
  const rows = results.filter((r) => r.page === page && r.rc === 0);
  const A = rows.filter((r) => r.series === 'A').map((r) => r.tbt);
  const B = rows.filter((r) => r.series === 'B').map((r) => r.tbt);
  const mm = (xs) => (xs.length ? `${r0(Math.min(...xs))}..${r0(Math.max(...xs))}` : 'brak');
  const cls = median(rows.map((r) => r.cls));
  log(`| ${page} | ${r0(median(A))} | ${r0(median(B))} | ${r0(Math.abs(median(A) - median(B)))} | ${mm(A)} (n=${A.length}) | ${mm(B)} (n=${B.length}) | ${r0(median([...A, ...B]))} | ${r0(median(rows.map((r) => r.bi)))} | ${r0(median(rows.map((r) => r.lcp)))} | ${Number.isFinite(cls) ? cls.toFixed(3) : 'brak'} | ${[...new Set(rows.map((r) => r.finalUrl))].join(' ')} |`);
}
log(`bledne przebiegi: ${results.filter((r) => r.rc !== 0).length} z ${results.length}`);
const { analyze } = await import(pathToFileURL(path.resolve('.bieg/m1623/longtasks.mjs')).href);
for (const page of PAGES) {
  const w = worst[page];
  log(`=== DLUGIE ZADANIA ${page}: przebieg o najwyzszym TBT (${w ? `${r0(w.tbt)} ms, ${w.series}${w.n}` : 'brak sladu'})`);
  if (w) {
    try {
      log(analyze(w.file, 5).join('\n'));
    } catch (e) {
      log(`analiza nieudana: ${e.message}`);
    }
  }
}
log('=== KONIEC measure-win.mjs');
