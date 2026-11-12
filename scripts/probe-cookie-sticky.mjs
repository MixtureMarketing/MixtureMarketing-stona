#!/usr/bin/env node
/**
 * MIX-1400: przycisk ciasteczek vs StickyMobileBar, pomiar na lokalnej budowie (Chromium headless).
 *
 *   node scripts/probe-cookie-sticky.mjs <dist> <katalog-wynikow> <etykieta>
 *   node scripts/probe-cookie-sticky.mjs --compare <przed.json> <po.json>
 *
 * Strony z paskiem (390 px): przewija do pojawienia sie paska (body[data-sticky-mobile-bar]),
 * mierzy pole nalozenia przycisku ciasteczek na pasek (px2) i robi zrzut. Strony bez paska i
 * 1366 px: mierzy odleglosc przycisku od dolu okna. Caly ruch poza serwerem lokalnym jest
 * ABORTOWANY. Kod wyjscia 0 = nalozenie 0 px2 na kazdej stronie z paskiem i bottom 16 px na
 * desktopie i stronach bez paska; 1 = prog niespelniony. --compare: 0 = strony bez paska
 * (390 i 1366) i desktop bez zmian miedzy przed a po.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

export const BAR_PAGES = [
  '/',
  '/web-development/',
  '/web-development/custom-app/',
  '/web-development/rzeszow/',
  '/marketing/',
  '/marketing/google-ads/',
  '/marketing/meta-ads/',
  '/marketing/seo/',
  '/marketing/analytics/',
  '/agencja-interaktywna-rzeszow/',
  '/agencja-seo-rzeszow/',
  '/abonament/',
  '/design/',
  '/design/branding/',
  '/design/ui-ux/',
  '/design/print/',
  '/design/visual-audit/',
];
export const CONTROL_PAGES = ['/contact/', '/o-nas/'];

if (process.argv[2] === '--compare') {
  const [before, after] = await Promise.all(
    process.argv.slice(3, 5).map(async (f) => JSON.parse(await fs.readFile(f, 'utf8'))),
  );
  const rows = [];
  let bad = 0;
  for (const [key, a] of Object.entries(after.pages)) {
    const b = before.pages[key];
    // Porownujemy: strony bez paska (390 i 1366) oraz wszystkie strony na 1366 px.
    if (!(key.startsWith('ctrl') || key.startsWith('d1366'))) continue;
    const same = b && b.cookieBottomGapPx === a.cookieBottomGapPx;
    if (!same) bad++;
    rows.push(
      `${key}: przed=${b?.cookieBottomGapPx}px po=${a.cookieBottomGapPx}px ${same ? 'OK' : 'ZMIANA'}`,
    );
  }
  console.log(rows.join('\n'));
  process.exit(bad ? 1 : 0);
}

const [distArg, outArg, label = 'run'] = process.argv.slice(2);
if (!distArg || !outArg) {
  console.error('uzycie: probe-cookie-sticky.mjs <dist> <out> <etykieta>');
  process.exit(2);
}
const { default: puppeteer } = await import('puppeteer');
const DIST = path.resolve(distArg);
const OUT = path.resolve(outArg);
await fs.mkdir(path.join(OUT, 'shots', label), { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let file = path.join(DIST, decodeURIComponent(url.pathname));
  if (!file.startsWith(DIST)) {
    res.writeHead(403).end();
    return;
  }
  try {
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
  } catch {
    file = path.join(DIST, 'index.html'); // SPA fallback
  }
  try {
    const body = await fs.readFile(file);
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 MixtureE2E/1';

const rectOf = (r) => ({
  x: Math.round(r.x),
  y: Math.round(r.y),
  w: Math.round(r.width),
  h: Math.round(r.height),
});
const overlapPx = (a, b) => {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (p) => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '_'));

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const pages = {};
const fails = [];

async function open(vp, route) {
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    deviceScaleFactor: 1,
  });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (new URL(req.url()).origin !== ORIGIN || req.method() !== 'GET') return req.abort();
    return req.continue();
  });
  // Zgoda zapisana: widoczny jest przycisk ciasteczek, nie otwarty baner.
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem(
      'cookie-consent-v2',
      JSON.stringify({ analytics: false, marketing: false }),
    );
  });
  await page.goto(`${ORIGIN}${route}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForSelector('.cookie-floating-btn', { timeout: 15000 });
  return page;
}

const geometry = (page) =>
  page.evaluate(() => {
    const r = (e) => {
      if (!e) return null;
      const b = e.getBoundingClientRect();
      return { x: b.x, y: b.y, width: b.width, height: b.height };
    };
    const bar = document.querySelector('div.fixed.inset-x-0.bottom-0[aria-hidden="false"]');
    return {
      bar: r(bar),
      cookie: r(document.querySelector('.cookie-floating-btn')),
      flag: document.body.dataset.stickyMobileBar ?? null,
      vh: window.innerHeight,
    };
  });

for (const route of BAR_PAGES) {
  for (const vp of [
    { key: 'm390', width: 390, height: 844, mobile: true },
    { key: 'd1366', width: 1366, height: 768, mobile: false },
  ]) {
    const key = `${vp.key}:${route}`;
    try {
      const page = await open(vp, route);
      let g;
      for (const y of [700, 1100, 1600, 2200, 3000, 4000]) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await sleep(450);
        g = await geometry(page);
        if (g.flag === 'true') break;
      }
      await sleep(600); // przejscie bottom przycisku (300 ms)
      g = await geometry(page);
      const cookie = rectOf(g.cookie);
      const entry = {
        flag: g.flag,
        cookie,
        cookieBottomGapPx: Math.round(g.vh - (g.cookie.y + g.cookie.height)),
      };
      if (vp.key === 'm390') {
        entry.bar = g.bar ? rectOf(g.bar) : null;
        entry.overlapPx2 = entry.bar ? overlapPx(entry.bar, cookie) : null;
        if (g.flag !== 'true' || !entry.bar) fails.push(`${key}: pasek nie pojawil sie`);
        else if (entry.overlapPx2 !== 0) fails.push(`${key}: nalozenie ${entry.overlapPx2} px2`);
        await page.screenshot({ path: path.join(OUT, 'shots', label, `${slug(route)}-m390.png`) });
      } else if (entry.cookieBottomGapPx !== 16) {
        fails.push(`${key}: desktop bottom ${entry.cookieBottomGapPx} px (oczekiwane 16)`);
      }
      pages[key] = entry;
      await page.close();
    } catch (e) {
      fails.push(`${key}: blad ${e.message}`);
    }
  }
}

for (const route of CONTROL_PAGES) {
  for (const vp of [
    { key: 'ctrl-m390', width: 390, height: 844, mobile: true },
    { key: 'ctrl-d1366', width: 1366, height: 768, mobile: false },
  ]) {
    const key = `${vp.key}:${route}`;
    try {
      const page = await open(vp, route);
      await page.evaluate(() => window.scrollTo(0, 800));
      await sleep(900);
      const g = await geometry(page);
      pages[key] = {
        flag: g.flag,
        cookie: rectOf(g.cookie),
        cookieBottomGapPx: Math.round(g.vh - (g.cookie.y + g.cookie.height)),
      };
      if (g.flag !== null) fails.push(`${key}: strona bez paska ma znacznik paska`);
      if (pages[key].cookieBottomGapPx !== 16)
        fails.push(`${key}: bottom ${pages[key].cookieBottomGapPx} px (oczekiwane 16)`);
      await page.screenshot({
        path: path.join(OUT, 'shots', label, `${slug(route)}-${vp.key}.png`),
      });
      await page.close();
    } catch (e) {
      fails.push(`${key}: blad ${e.message}`);
    }
  }
}

await browser.close();
server.close();
const mobile = Object.entries(pages).filter(([k]) => k.startsWith('m390:'));
const result = {
  label,
  barPagesMeasured: mobile.length,
  barPagesOverlapZero: mobile.filter(([, v]) => v.overlapPx2 === 0).length,
  totalOverlapPx2: mobile.reduce((s, [, v]) => s + (v.overlapPx2 ?? 0), 0),
  fails,
  pages,
};
await fs.writeFile(path.join(OUT, `${label}.json`), JSON.stringify(result, null, 2));
console.log(
  `${label}: stron z paskiem ${result.barPagesMeasured}, nalozenie 0 na ${result.barPagesOverlapZero}, suma ${result.totalOverlapPx2} px2, bledow ${fails.length}`,
);
for (const f of fails) console.log(`  - ${f}`);
process.exit(fails.length ? 1 : 0);
