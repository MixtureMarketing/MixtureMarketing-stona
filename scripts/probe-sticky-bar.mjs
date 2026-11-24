#!/usr/bin/env node
/**
 * MIX-2079: pomiar paska „Darmowy audyt” (StickyMobileBar) na telefonie, lokalna budowa.
 *
 *   node scripts/probe-sticky-bar.mjs <katalog-dist> <katalog-wyników> [--sim-gap N] [--engines webkit,chromium]
 *
 * Wymaga pakietu `playwright` (instalacja bez zapisu: `npm i --no-save playwright` +
 * `npx playwright install webkit chromium`); nie jest zależnością strony.
 * Skrypt sam serwuje dist na 127.0.0.1 (losowy port); każde żądanie poza ten serwer jest
 * ABORTOWANE (zero ruchu w sieć, zero analityki). Zgoda cookies zapisana (widać przycisk zgód).
 *
 * Strony: główna + 6 podstron usług. Silniki: WebKit (iPhone 14, 390×844) i Chromium 390×844.
 * Przewijanie co 0,35 wysokości widoku w dół do końca strony i z powrotem w górę; w każdym
 * punkcie, gdzie pasek jest widoczny (body[data-sticky-mobile-bar]): bar.bottom vs innerHeight,
 * prostokąt przycisku zgód (gdy widoczny) vs pasek i vs treść kart (main h2..li,a,svg,img).
 * Do tego: przodkowie paska z właściwością, która robi z nich blok zawierający dla `fixed`
 * (transform, filter, backdrop-filter, perspective, will-change, contain) — przyczyna nr 1 z karty.
 * Chromium: CLS ładowania (layout-shift bez wejścia) i axe (serious/critical) w punkcie z paskiem.
 *
 * --sim-gap N: atrapa błędu Safari — visualViewport.offsetTop zawyżony o N px (dół widoku o N
 * poniżej warstwy fixed). Oczekiwanie: pasek zjeżdża o N (bar.bottom = innerHeight + N).
 *
 * Wynik: <wyniki>/probe.json, zrzuty <wyniki>/shots/*.jpg. Kod wyjścia 0 = progi spełnione.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  if (i < 0) return def;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const SIM_GAP = Number(opt('--sim-gap', '0'));
const ENGINES = opt('--engines', 'webkit,chromium').split(',');
const [distArg, outArg] = args;
if (!distArg || !outArg || !Number.isFinite(SIM_GAP)) {
  console.error(
    'użycie: probe-sticky-bar.mjs <dist> <out> [--sim-gap N] [--engines webkit,chromium]',
  );
  process.exit(2);
}
const require = createRequire(import.meta.url);
const { webkit, chromium, devices } = require('playwright');
const AXE_SRC = await fs.readFile(require.resolve('axe-core/axe.min.js'), 'utf8');

const DIST = path.resolve(distArg);
const OUT = path.resolve(outArg);
await fs.mkdir(path.join(OUT, 'shots'), { recursive: true });

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
  '.xml': 'application/xml',
};
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let file = path.join(DIST, decodeURIComponent(url.pathname));
  if (!file.startsWith(DIST)) return res.writeHead(403).end();
  try {
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
  } catch {
    file = path.join(DIST, 'index.html');
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

const PAGES = [
  '/',
  '/marketing/',
  '/web-development/',
  '/design/',
  '/marketing/seo/',
  '/marketing/google-ads/',
  '/marketing/meta-ads/',
];
const TOL = 2;
const MIN_POINTS = 5;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fails = [];
const results = [];

const initScript = ({ simGap }) => {
  localStorage.setItem('cookie-consent-v2', JSON.stringify({ analytics: false, marketing: false }));
  window.__cls = 0;
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {
    window.__cls = null; // WebKit: brak layout-shift
  }
  if (simGap && window.VisualViewport) {
    const d = Object.getOwnPropertyDescriptor(VisualViewport.prototype, 'offsetTop');
    Object.defineProperty(VisualViewport.prototype, 'offsetTop', {
      configurable: true,
      get() {
        return d.get.call(this) + simGap;
      },
    });
  }
};

const measure = () => {
  const r = (el) => {
    const b = el.getBoundingClientRect();
    return { x: b.x, y: b.y, w: b.width, h: b.height, bottom: b.bottom };
  };
  const inter = (a, b) =>
    Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 0.5 &&
    Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 0.5;
  const bar =
    document.querySelector('[data-sticky-bar-panel]') ||
    document.querySelector('div.fixed.bottom-0.z-40');
  const shown = document.body.dataset.stickyMobileBar === 'true';
  const cookie = document.querySelector('.cookie-floating-btn');
  let cookieInfo = null;
  if (cookie) {
    const cs = getComputedStyle(cookie);
    const visible =
      cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.01;
    const cr = r(cookie);
    let hitsContent = 0;
    let hitsBar = false;
    if (visible) {
      hitsBar = !!bar && shown && inter(cr, r(bar));
      const els = document.querySelectorAll(
        'main h2, main h3, main h4, main p, main li, main a, main button, main svg, main img',
      );
      for (const el of els) {
        if (bar && bar.contains(el)) continue;
        const er = r(el);
        if (er.w > 0 && er.h > 0 && inter(cr, er)) hitsContent++;
      }
    }
    cookieInfo = { visible, rect: cr, hitsBar, hitsContent };
  }
  return {
    y: Math.round(window.scrollY),
    shown,
    innerHeight: window.innerHeight,
    vv: window.visualViewport
      ? {
          h: window.visualViewport.height,
          top: window.visualViewport.offsetTop,
          scale: window.visualViewport.scale,
        }
      : null,
    bar: bar ? r(bar) : null,
    barStyleBottom: bar ? bar.style.bottom : null,
    cookie: cookieInfo,
  };
};

const ancestors = () => {
  const bad = [];
  const bar =
    document.querySelector('[data-sticky-bar-panel]') ||
    document.querySelector('div.fixed.bottom-0.z-40');
  for (let el = bar && bar.parentElement; el; el = el.parentElement) {
    const cs = getComputedStyle(el);
    const hit = [];
    if (cs.transform !== 'none') hit.push(`transform:${cs.transform}`);
    if (cs.filter !== 'none') hit.push(`filter:${cs.filter}`);
    const bf = cs.backdropFilter || cs.webkitBackdropFilter;
    if (bf && bf !== 'none') hit.push(`backdrop-filter:${bf}`);
    if (cs.perspective !== 'none') hit.push(`perspective:${cs.perspective}`);
    if (/transform|filter|perspective/.test(cs.willChange))
      hit.push(`will-change:${cs.willChange}`);
    if (/paint|layout|strict|content/.test(cs.contain)) hit.push(`contain:${cs.contain}`);
    if (hit.length)
      bad.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} ${hit.join(' ')}`);
  }
  return bad;
};

for (const engine of ENGINES) {
  const browserType = engine === 'webkit' ? webkit : chromium;
  const browser = await browserType.launch({
    headless: true,
    args: engine === 'chromium' ? ['--no-sandbox'] : [],
  });
  const ctxOpts =
    engine === 'webkit'
      ? {
          ...devices['iPhone 14'],
          viewport: { width: 390, height: 844 },
          screen: { width: 390, height: 844 },
        }
      : {
          viewport: { width: 390, height: 844 },
          isMobile: true,
          hasTouch: true,
          deviceScaleFactor: 2,
        };
  for (const p of PAGES) {
    const ctx = await browser.newContext({
      ...ctxOpts,
      userAgent: `${ctxOpts.userAgent || 'Mozilla/5.0 (Linux; Android 14) Chrome/124.0 Mobile'} MixtureE2E/1`,
      reducedMotion: 'no-preference',
    });
    await ctx.route('**/*', (route) => {
      const u = new URL(route.request().url());
      if (u.origin !== ORIGIN || route.request().method() !== 'GET') return route.abort();
      return route.continue();
    });
    await ctx.addInitScript(initScript, { simGap: SIM_GAP });
    const page = await ctx.newPage();
    const slug = `${engine}-${p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '_')}`;
    const rec = { engine, page: p, simGap: SIM_GAP, points: [] };
    try {
      await page.goto(`${ORIGIN}${p}`, { waitUntil: 'load', timeout: 60000 });
      await sleep(1500);
      rec.clsLoad = await page.evaluate(() => window.__cls);
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = 'auto';
      });
      const docH = await page.evaluate(() => document.documentElement.scrollHeight);
      const step = Math.round(844 * 0.35);
      const ys = [];
      for (let y = 0; y < docH; y += step) ys.push(y);
      const path2 = [...ys.map((y) => ['dol', y]), ...[...ys].reverse().map((y) => ['gora', y])];
      let shotDone = false;
      for (const [dir, y] of path2) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await sleep(450); // transition 300 ms + rAF
        // Pomiar dopiero po ustaniu ruchu paska: IntersectionObserver i transition 300 ms w WebKit
        // potrafią ruszyć później niż 450 ms po przewinięciu (stan przejściowy to nie położenie).
        let m = await page.evaluate(measure);
        for (let i = 0; i < 12; i++) {
          await sleep(150);
          const n = await page.evaluate(measure);
          const still = !n.bar || !m.bar || Math.abs(n.bar.bottom - m.bar.bottom) < 0.5;
          const same = n.shown === m.shown && still;
          m = n;
          m.settleMs = 450 + 150 * (i + 1);
          if (same) break;
        }
        m.dir = dir;
        rec.points.push(m);
        if (m.shown && !shotDone && dir === 'dol' && m.y > 1500) {
          await page.screenshot({
            path: path.join(OUT, 'shots', `${slug}.jpg`),
            type: 'jpeg',
            quality: 45,
            scale: 'css',
          });
          rec.ancestors = await page.evaluate(ancestors);
          if (engine === 'chromium') {
            await page.evaluate(AXE_SRC);
            const ax = await page.evaluate(async () => {
              const res = await window.axe.run(document, { resultTypes: ['violations'] });
              return res.violations
                .filter((v) => v.impact === 'serious' || v.impact === 'critical')
                .map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length }));
            });
            rec.axeSeriousCritical = ax;
          }
          shotDone = true;
        }
      }
    } catch (e) {
      rec.error = String(e && e.message ? e.message : e);
    }
    await ctx.close();

    const shownPts = rec.points.filter((m) => m.shown && m.bar);
    const down = shownPts.filter((m) => m.dir === 'dol').length;
    const up = shownPts.filter((m) => m.dir === 'gora').length;
    const want = (m) => m.innerHeight + SIM_GAP;
    const badBar = shownPts.filter((m) => Math.abs(m.bar.bottom - want(m)) > TOL);
    const cookieBad = rec.points.filter(
      (m) => m.shown && m.cookie && (m.cookie.hitsBar || m.cookie.hitsContent > 0),
    );
    rec.summary = {
      shownDown: down,
      shownUp: up,
      barOffPoints: badBar.length,
      maxBarDelta: shownPts.reduce((a, m) => Math.max(a, Math.abs(m.bar.bottom - want(m))), 0),
      cookieOverlapPoints: cookieBad.length,
      cookieVisibleWhileBar: rec.points.filter((m) => m.shown && m.cookie && m.cookie.visible)
        .length,
      ancestors: rec.ancestors ? rec.ancestors.length : null,
      axe: rec.axeSeriousCritical ? rec.axeSeriousCritical.length : null,
      clsLoad: rec.clsLoad,
    };
    const s = rec.summary;
    const tag = `${engine} ${p}`;
    if (rec.error) fails.push(`${tag}: błąd ${rec.error}`);
    if (down < MIN_POINTS || up < MIN_POINTS)
      fails.push(`${tag}: za mało punktów z paskiem (dół ${down}, góra ${up})`);
    if (s.barOffPoints)
      fails.push(
        `${tag}: pasek poza dołem widoku w ${s.barOffPoints} punktach (max ${s.maxBarDelta.toFixed(1)} px)`,
      );
    if (s.cookieOverlapPoints)
      fails.push(`${tag}: przycisk zgód nachodzi w ${s.cookieOverlapPoints} punktach`);
    if (s.axe) fails.push(`${tag}: axe serious/critical ${s.axe}`);
    if (typeof s.clsLoad === 'number' && s.clsLoad > 0.1)
      fails.push(`${tag}: CLS ${s.clsLoad.toFixed(3)}`);
    console.log(
      `PROBE ${tag} sim=${SIM_GAP} pkt_dol=${down} pkt_gora=${up} bar_poza=${s.barOffPoints} max_delta=${s.maxBarDelta.toFixed(1)} ` +
        `zgody_nachodzi=${s.cookieOverlapPoints} zgody_widoczny_przy_pasku=${s.cookieVisibleWhileBar} ` +
        `przodkowie_cb=${s.ancestors} axe=${s.axe} cls=${s.clsLoad == null ? 'n/d' : s.clsLoad.toFixed(3)}`,
    );
    for (const b of badBar.slice(0, 5))
      console.log(
        `ODSTAJE ${tag} ${b.dir} y=${b.y} bottom=${b.bar.bottom.toFixed(1)} inner=${b.innerHeight} ` +
          `styl=${b.barStyleBottom || '-'} settle=${b.settleMs}`,
      );
    if (rec.ancestors && rec.ancestors.length)
      console.log(`PRZODKOWIE ${tag}: ${rec.ancestors.join(' | ')}`);
    results.push(rec);
  }
  await browser.close();
}
server.close();
await fs.writeFile(
  path.join(OUT, 'probe.json'),
  JSON.stringify({ simGap: SIM_GAP, fails, results }, null, 1),
);
console.log(`PROBE KONIEC fails=${fails.length}`);
for (const f of fails) console.log(`FAIL ${f}`);
process.exit(fails.length ? 1 : 0);
