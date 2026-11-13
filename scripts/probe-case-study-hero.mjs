#!/usr/bin/env node
/**
 * MIX-1471: probe of the case-study hero with the photo at the very top.
 *
 *   node scripts/probe-case-study-hero.mjs <dist-dir | https://preview-host> <out-dir>
 *
 * A directory is served locally (SPA fallback); an https URL is opened as is (Preview behind
 * Cloudflare Access: the service-token headers are read from the files named by the env
 * PROBE_ACCESS_ID_FILE / PROBE_ACCESS_SECRET_FILE, added only to requests for that origin,
 * never printed or saved).
 * Only GET to the site and to Sanity (read only) pass; analytics is blocked (prod-safe).
 *
 * Per viewport 390 / 1280 / 1600, for the first 2 projects on /portfolio/:
 *  - direct load: photo top vs bottom of the fixed site header (criterion: <= header + 24 px),
 *    one H1, image attributes (alt, width/height, fetchpriority, no lazy), LCP element, CLS,
 *    axe-core serious/critical, screenshot of the first screen;
 *  - click from the list: one view transition, the shared name `realizacja-zdjecie` exactly once
 *    on the old and on the new page, the same Sanity asset on card and hero, scrollY per frame
 *    (transition start and end must be 0, no animated scroll), mid-transition screenshot;
 *  - prefers-reduced-motion: reduce = no startViewTransition.
 * Output: <out>/probe.json and <out>/shots/*.png. Exit 0 = every criterion met.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import puppeteer from 'puppeteer';
import { createProdSafe } from './lib/prod-safe.mjs';

const [srcArg, outArg] = process.argv.slice(2);
if (!srcArg || !outArg) {
  console.error('usage: probe-case-study-hero.mjs <dist-dir | https://host> <out-dir>');
  process.exit(2);
}
const OUT = path.resolve(outArg);
await fs.mkdir(path.join(OUT, 'shots'), { recursive: true });
const AXE = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

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
  '.ico': 'image/x-icon',
};

async function serve(distArg) {
  const DIST = path.resolve(distArg);
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
      res.writeHead(200, {
        'content-type': MIME[path.extname(file)] || 'application/octet-stream',
      });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

const remote = /^https:\/\//.test(srcArg);
const local = remote ? null : await serve(srcArg);
const ORIGIN = remote ? new URL(srcArg).origin : local.origin;

// Access headers (Preview only): file paths come from PROBE_ACCESS_ID_FILE and
// PROBE_ACCESS_SECRET_FILE; the values stay in memory and are never logged.
const ACCESS_FILES = [process.env.PROBE_ACCESS_ID_FILE, process.env.PROBE_ACCESS_SECRET_FILE];
let accessHeaders = null;
if (remote) {
  if (!ACCESS_FILES[0] || !ACCESS_FILES[1]) {
    console.error('set PROBE_ACCESS_ID_FILE and PROBE_ACCESS_SECRET_FILE for a remote host');
    process.exit(2);
  }
  const [id, secret] = ACCESS_FILES.map((f) => readFileSync(f, 'utf8').trim());
  if (!id || !secret) {
    console.error('access files empty');
    process.exit(2);
  }
  accessHeaders = { 'CF-Access-Client-Id': id, 'CF-Access-Client-Secret': secret };
}

const safe = createProdSafe(ORIGIN);
const SANITY = /^https:\/\/([a-z0-9]+\.api\.sanity\.io|cdn\.sanity\.io)\//;
const SANITY_API = /^https:\/\/[a-z0-9]+\.api\.sanity\.io\//;

/** Sanity API has no CORS entry for a random localhost port: fetch in Node, answer with CORS. */
async function proxySanity(req) {
  try {
    const res = await fetch(req.url(), { headers: { accept: 'application/json' } });
    const body = Buffer.from(await res.arrayBuffer());
    await req.respond({
      status: res.status,
      headers: {
        'content-type': res.headers.get('content-type') || 'application/json',
        'access-control-allow-origin': req.headers().origin || '*',
      },
      body,
    });
  } catch {
    req.abort().catch(() => {});
  }
}

// In-page instrument: view transitions, names, scrollY per frame, layout shifts, LCP.
const INSTRUMENT = () => {
  const vt = { calls: 0, records: [], shifts: [], frames: [], lcp: [] };
  window.__vt = vt;
  const names = () => {
    const m = {};
    for (const el of document.querySelectorAll('*')) {
      const n = getComputedStyle(el).viewTransitionName;
      if (el === document.documentElement && n === 'root') continue;
      if (n && n !== 'none') m[n] = (m[n] || 0) + 1;
    }
    return m;
  };
  const namedImg = () => {
    const el = [...document.querySelectorAll('*')].find(
      (e) => getComputedStyle(e).viewTransitionName === 'realizacja-zdjecie',
    );
    const img = el && (el.tagName === 'IMG' ? el : el.querySelector('img'));
    return img ? img.currentSrc || img.src : null;
  };
  window.__vtNames = names;
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) vt.shifts.push([e.startTime, e.value]);
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries())
        vt.lcp.push({ t: e.startTime, tag: e.element?.tagName ?? null, src: e.url || null });
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    /* observers unsupported: reported as empty lists */
  }
  window.__logFrames = () => {
    const tick = () => {
      vt.frames.push([Math.round(performance.now()), Math.round(scrollY), location.pathname]);
      if (vt.frames.length < 600) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (window.__noVT) return;
  const orig = Document.prototype.startViewTransition;
  if (!orig) return;
  Document.prototype.startViewTransition = function (cb) {
    const rec = { t0: performance.now(), scrollAtCall: scrollY, old: names(), oldImg: namedImg() };
    vt.calls++;
    vt.records.push(rec);
    const t = orig.call(this, async () => {
      await cb();
      rec.next = names();
      rec.nextImg = namedImg();
      rec.scrollAfterUpdate = scrollY;
    });
    t.ready.then(
      () => {
        rec.tReady = performance.now();
        rec.scrollAtStart = scrollY;
        if (window.__pauseMid) {
          const an = document
            .getAnimations()
            .filter((a) => String(a.effect?.pseudoElement || '').startsWith('::view-transition'));
          an.forEach((a) => {
            a.pause();
            a.currentTime = 150;
          });
          window.__paused = an;
        }
      },
      (e) => (rec.readyErr = String(e)),
    );
    t.finished.then(() => {
      rec.t1 = performance.now();
      rec.scrollAtEnd = scrollY;
    });
    return t;
  };
};

const VIEWPORTS = [
  { tag: '390', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
  { tag: '1280', width: 1280, height: 800, deviceScaleFactor: 1 },
  { tag: '1600', width: 1600, height: 900, deviceScaleFactor: 1 },
];
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36';
const report = { source: remote ? 'preview' : 'local', viewports: {}, failures: [] };
const fail = (m) => report.failures.push(m);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const assetId = (u) => (u ? (/\/images\/[^/]+\/[^/]+\/([a-f0-9]+)-/.exec(u)?.[1] ?? null) : null);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
safe.watchBrowser(browser);

async function openPage(vp, { reduce = false, pauseMid = false } = {}) {
  const page = await browser.newPage();
  await page.setViewport(vp);
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' },
  ]);
  await page.evaluateOnNewDocument((p) => (window.__pauseMid = p), pauseMid);
  await page.evaluateOnNewDocument(INSTRUMENT);
  await safe.protect(page, {
    userAgent: UA,
    handler: (req) => {
      const u = req.url();
      const own = u.startsWith(ORIGIN + '/');
      if (req.method() === 'GET' && SANITY_API.test(u)) proxySanity(req);
      else if (req.method() === 'GET' && own && accessHeaders)
        req.continue({ headers: { ...req.headers(), ...accessHeaders } }).catch(() => {});
      else if (req.method() === 'GET' && (own || SANITY.test(u))) req.continue().catch(() => {});
      else req.abort().catch(() => {});
    },
  });
  page.on('pageerror', (e) => fail(`pageerror ${vp.tag}: ${String(e.message).slice(0, 140)}`));
  return page;
}

async function dismissConsent(page) {
  const clicked = await page.evaluate(() => {
    const region = document.querySelector('[role="region"][aria-label="Baner plików cookies"]');
    const btn = [...(region?.querySelectorAll('button') ?? [])].find(
      (b) => b.textContent.trim() === 'Odrzuć opcjonalne',
    );
    btn?.click();
    return !!btn;
  });
  if (clicked)
    await page
      .waitForFunction(
        () => !document.querySelector('[role="region"][aria-label="Baner plików cookies"]'),
        { timeout: 3000 },
      )
      .catch(() => {});
}

/** Links of cards with an image on /portfolio/ (same rule as findCardParts). */
async function cardHrefs(page) {
  return page.evaluate(() => {
    const re = /^\/portfolio\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/;
    const out = [];
    for (const a of document.querySelectorAll('a[href]')) {
      const href = a.getAttribute('href');
      if (!re.test(href) || out.includes(href)) continue;
      let node = a;
      let img = a.querySelector('img:not([aria-hidden="true"])');
      for (let d = 0; !img && d < 4 && node.parentElement; d++) {
        node = node.parentElement;
        if (node.querySelectorAll('a[href]').length !== 1) break;
        img = node.querySelector('img:not([aria-hidden="true"])');
      }
      if (img) out.push(href);
    }
    return out;
  });
}

async function gotoList(page) {
  await page.goto(ORIGIN + '/portfolio/', { waitUntil: 'networkidle2', timeout: 45000 });
  await dismissConsent(page);
  for (let i = 0; i < 30; i++) {
    const hrefs = await cardHrefs(page);
    if (hrefs.length >= 2) return hrefs;
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'instant' }));
    await sleep(250);
  }
  return cardHrefs(page);
}

/** Direct load of a case study: geometry, attributes, LCP, CLS, axe, screenshot. */
async function measureLoad(vp, href, slugTag) {
  const page = await openPage(vp);
  await page.goto(ORIGIN + href, { waitUntil: 'networkidle2', timeout: 45000 });
  await page
    .waitForFunction(() => document.querySelector('main header img[fetchpriority]')?.complete, {
      timeout: 15000,
    })
    .catch(() => {});
  await sleep(2500);
  const m = await page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Główna nawigacja"]');
    const header = document.querySelector('main header');
    const img = header?.querySelector('img[fetchpriority]');
    const r = img?.getBoundingClientRect();
    const h1 = document.querySelector('h1');
    return {
      scrollY: Math.round(scrollY),
      layout: header?.getAttribute('data-hero-layout') ?? 'production',
      navBottom: nav ? Math.round(nav.getBoundingClientRect().bottom) : null,
      photoTop: r ? Math.round(r.top) : null,
      photoHeight: r ? Math.round(r.height) : null,
      h1Top: h1 ? Math.round(h1.getBoundingClientRect().top) : null,
      h1Count: document.querySelectorAll('h1').length,
      h1Text: h1?.textContent ?? null,
      img: img
        ? {
            alt: img.getAttribute('alt'),
            width: img.getAttribute('width'),
            height: img.getAttribute('height'),
            fetchpriority: img.getAttribute('fetchpriority'),
            loading: img.getAttribute('loading'),
            src: img.currentSrc || img.src,
          }
        : null,
      lcp: window.__vt.lcp.at(-1) ?? null,
      cls: Number(window.__vt.shifts.reduce((a, [, v]) => a + v, 0).toFixed(4)),
    };
  });
  await page.addScriptTag({ content: AXE });
  const axe = await page.evaluate(async () => {
    const r = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    return r.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
  });
  await dismissConsent(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(300);
  const shot = `zaladowanie-${slugTag}-${vp.tag}.png`;
  await page.screenshot({ path: path.join(OUT, 'shots', shot) });
  await page.close();
  return { ...m, axe, shot };
}

/** Click a card on the list and measure the transition. */
async function measureClick(vp, href, { reduce = false, pauseMid = false, shot = null } = {}) {
  const page = await openPage(vp, { reduce, pauseMid });
  await gotoList(page);
  const card = await page.evaluateHandle((h) => document.querySelector(`a[href="${h}"]`), href);
  await card.evaluate((a) => a.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await sleep(700);
  const scrollBefore = await page.evaluate(() => Math.round(scrollY));
  await page.evaluate(() => window.__logFrames());
  // A visitor hovers before the click, which starts the data preload; the transition falls back to
  // a plain navigation when the preload is slower than 300 ms, so a loaded machine would
  // otherwise measure the fallback instead of the transition. PROBE_COLD=1 clicks without the dwell.
  if (process.env.PROBE_COLD !== '1') {
    await card.hover();
    await sleep(Number(process.env.PROBE_DWELL_MS ?? 1200));
  }
  await card.click();
  let shotFile = null;
  if (pauseMid) {
    try {
      await page.waitForFunction(() => window.__paused, { timeout: 8000 });
      shotFile = shot;
      await page.screenshot({ path: path.join(OUT, 'shots', shot) });
      await page.evaluate(() => window.__paused.forEach((a) => a.play()));
    } catch {
      fail(`${vp.tag}: mid-transition screenshot not taken (${href})`);
    }
  }
  await page.waitForFunction((h) => location.pathname === h, { timeout: 10000 }, href);
  await sleep(1800);
  const r = await page.evaluate(() => {
    const vt = window.__vt;
    return {
      path: location.pathname,
      calls: vt.calls,
      rec: vt.records.at(-1) ?? null,
      frames: vt.frames,
      namesAtRest: window.__vtNames(),
      scrollNow: Math.round(scrollY),
    };
  });
  await page.close();
  const after = r.frames.filter(([, , p]) => p === href).map(([, y]) => y);
  const between = r.frames.map(([, y]) => y).filter((y) => y !== 0 && y !== scrollBefore);
  return {
    scrollBefore,
    calls: r.calls,
    scrollAtCall: r.rec?.scrollAtCall ?? null,
    scrollAtStart: r.rec?.scrollAtStart ?? null,
    scrollAtEnd: r.rec?.scrollAtEnd ?? null,
    scrollNow: r.scrollNow,
    framesLogged: r.frames.length,
    framesOnTarget: after.length,
    framesOnTargetMaxY: after.length ? Math.max(...after) : null,
    intermediateScrollValues: [...new Set(between)].slice(0, 10),
    old: r.rec?.old ?? null,
    next: r.rec?.next ?? null,
    sameAsset:
      !!r.rec?.oldImg &&
      assetId(r.rec.oldImg) !== null &&
      assetId(r.rec.oldImg) === assetId(r.rec.nextImg),
    namesAtRest: r.namesAtRest,
    shot: shotFile,
  };
}

let projects = [];
{
  const page = await openPage(VIEWPORTS[1]);
  projects = (await gotoList(page)).slice(0, 2);
  await page.close();
}
report.projects = projects;
if (projects.length < 2)
  fail(`fewer than 2 cards with an image on /portfolio/ (${projects.length})`);

// Short lock slots: PROBE_VP=390,1280 limits viewports, PROBE_P=1 limits projects (1-based),
// PROBE_LOAD_ONLY=1 measures only the direct load (before/after screenshots, geometry).
const VP_SEL = process.env.PROBE_VP ? process.env.PROBE_VP.split(',') : null;
const P_SEL = process.env.PROBE_P ? process.env.PROBE_P.split(',') : null;
const LOAD_ONLY = process.env.PROBE_LOAD_ONLY === '1';
report.selection = { vp: VP_SEL, p: P_SEL, loadOnly: LOAD_ONLY };
const saveReport = () =>
  fs.writeFile(path.join(OUT, 'probe.json'), JSON.stringify(report, null, 2));
for (const vp of VIEWPORTS.filter((v) => !VP_SEL || VP_SEL.includes(v.tag))) {
  const v = (report.viewports[vp.tag] = { load: {}, click: {} });
  for (const [i, href] of projects.entries()) {
    const tag = `p${i + 1}`;
    if (P_SEL && !P_SEL.includes(String(i + 1))) continue;
    const L = (v.load[href] = await measureLoad(vp, href, tag));
    if (L.photoTop === null) fail(`${vp.tag} ${href}: no hero photo`);
    else if (L.photoTop > L.navBottom + 24)
      fail(`${vp.tag} ${href}: photo top ${L.photoTop} > header ${L.navBottom} + 24`);
    if (L.h1Count !== 1) fail(`${vp.tag} ${href}: H1 count ${L.h1Count}`);
    if (!L.img?.alt || L.img.fetchpriority !== 'high' || L.img.loading === 'lazy')
      fail(`${vp.tag} ${href}: image attributes ${JSON.stringify(L.img)}`);
    if (!L.img?.width || !L.img?.height) fail(`${vp.tag} ${href}: image without width/height`);
    if (L.lcp?.tag !== 'IMG') fail(`${vp.tag} ${href}: LCP element ${L.lcp?.tag}`);
    if (L.cls > 0.1) fail(`${vp.tag} ${href}: CLS ${L.cls}`);
    if (L.axe.length) fail(`${vp.tag} ${href}: axe ${JSON.stringify(L.axe)}`);
    await saveReport();
    if (LOAD_ONLY) continue;

    const C = (v.click[href] = await measureClick(vp, href, {
      pauseMid: true,
      shot: `przejscie-${tag}-${vp.tag}.png`,
    }));
    if (C.calls !== 1) fail(`${vp.tag} ${href}: transitions ${C.calls}`);
    if (C.scrollAtStart !== 0 || C.scrollAtEnd !== 0)
      fail(`${vp.tag} ${href}: scrollY start ${C.scrollAtStart} end ${C.scrollAtEnd}`);
    if (C.framesOnTargetMaxY !== 0)
      fail(`${vp.tag} ${href}: target frames scrollY max ${C.framesOnTargetMaxY}`);
    if (C.intermediateScrollValues.length)
      fail(`${vp.tag} ${href}: animated scroll ${C.intermediateScrollValues.join(',')}`);
    if (C.old?.['realizacja-zdjecie'] !== 1 || C.next?.['realizacja-zdjecie'] !== 1)
      fail(`${vp.tag} ${href}: shared name not exactly once (old/new)`);
    if (!C.sameAsset) fail(`${vp.tag} ${href}: card and hero image are different assets`);
    if (Object.keys(C.namesAtRest).length) fail(`${vp.tag} ${href}: names left after transition`);
    await saveReport();
  }
  if (!LOAD_ONLY && (!P_SEL || P_SEL.includes('1'))) {
    const R = (v.reducedMotion = await measureClick(vp, projects[0], { reduce: true }));
    if (R.calls !== 0) fail(`${vp.tag}: reduced motion started ${R.calls} transitions`);
    await saveReport();
  }
}

await browser.close();
local?.server.close();
const verdict = safe.finish().problems;
if (verdict.length) report.failures.push(...verdict.map((p) => `prod-safe: ${p}`));
await fs.writeFile(path.join(OUT, 'probe.json'), JSON.stringify(report, null, 2));
for (const [vpTag, vv] of Object.entries(report.viewports)) {
  for (const [href, L] of Object.entries(vv.load)) {
    const C = vv.click?.[href];
    const names = (o) => o?.['realizacja-zdjecie'] ?? null;
    console.log(
      `NUM ${vpTag} ${href} photoTop=${L.photoTop} navBottom=${L.navBottom} cls=${L.cls} lcp=${L.lcp?.tag}` +
        ` axe=${L.axe.length} h1=${L.h1Count}` +
        (C
          ? ` transitions=${C.calls} scrollY start/end=${C.scrollAtStart}/${C.scrollAtEnd}` +
            ` animatedScroll=${C.intermediateScrollValues.length}` +
            ` sharedName old/new=${names(C.old)}/${names(C.next)} sameAsset=${C.sameAsset}`
          : ''),
    );
  }
  if (vv.reducedMotion)
    console.log(`NUM ${vpTag} reduced-motion transitions=${vv.reducedMotion.calls}`);
}
console.log(`PROBE ${report.source}: failures ${report.failures.length}`);
for (const f of report.failures) console.log('FAIL ' + f);
process.exit(report.failures.length ? 1 : 0);
