#!/usr/bin/env node
/**
 * MIX-1675: probe of the back transition case study -> list (reverse of the forward morph).
 *
 *   node scripts/probe-case-study-back.mjs <dist-dir | https://preview-host> <out-dir>
 *
 * A directory is served locally (SPA fallback, build with VITE_MM_VIEW_TRANSITIONS=1);
 * an https URL is opened as is (service-token headers from the files named by the env
 * PROBE_ACCESS_ID_FILE / PROBE_ACCESS_SECRET_FILE, never printed). Only GET to the site and
 * to Sanity (read only) pass; analytics is blocked (prod-safe).
 *
 * Per viewport 375 / 1280 and per case (transition, reduced-motion, no API support):
 *   scroll the list so the 2nd card is centred, click it (forward), press browser back
 *   (page.goBack = popstate), then measure:
 *   - scroll before entry / right after the update callback / at the end / at rest (+-4 px),
 *   - number of startViewTransition calls (1 for transition, 0 for the fallbacks),
 *   - `realizacja-zdjecie` exactly once on the old (hero) and on the new (card) side, same asset,
 *   - scrollY on every animation frame on the list (first painted frame already at the saved
 *     position), scroll events after the first list frame (target 0), no smooth scroll,
 *   - no view-transition-name left after the transition.
 * Round 3 (switch ON): extra cases "card-removed" (the card link is renamed so the list has no card:
 * transition skipped after 300 ms, position must still be restored, F1) and "double-back" (two
 * history.back() a few ms apart from case study -> list -> "/" (gaps from PROBE_GAPS, default 40), the list position must not be restored
 * on "/", F2). PROBE_MODE=observe (switch OFF build or the base b95200e): no restore assertions,
 * only the numbers (listeners, scrollRestoration, rest, first frame) so OFF can be compared with base.
 * Output: <out>/probe.json and <out>/shots/*.png. Exit 0 = every criterion met.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { createProdSafe } from './lib/prod-safe.mjs';

const [srcArg, outArg] = process.argv.slice(2);
if (!srcArg || !outArg) {
  console.error('usage: probe-case-study-back.mjs <dist-dir | https://host> <out-dir>');
  process.exit(2);
}
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

let accessHeaders = null;
if (remote) {
  const files = [process.env.PROBE_ACCESS_ID_FILE, process.env.PROBE_ACCESS_SECRET_FILE];
  if (!files[0] || !files[1]) {
    console.error('set PROBE_ACCESS_ID_FILE and PROBE_ACCESS_SECRET_FILE for a remote host');
    process.exit(2);
  }
  const [id, secret] = files.map((f) => readFileSync(f, 'utf8').trim());
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

// In-page instrument: view transitions (names on both sides), scroll events, scrollY per frame.
const INSTRUMENT = () => {
  const lc = {};
  const origAdd = window.addEventListener;
  window.addEventListener = function (t, ...r) {
    lc[t] = (lc[t] || 0) + 1;
    return origAdd.call(this, t, ...r);
  };
  window.__listeners = lc;
  window.__hideCard = (h) => {
    const hide = () =>
      document.querySelectorAll(`a[href="${h}"]`).forEach((a) => a.setAttribute('href', '#hidden'));
    new MutationObserver(hide).observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['href'],
    });
  };
  const vt = { calls: 0, records: [], frames: [], scrollEvents: [], scrollCalls: [], backT0: null };
  const origScrollTo = window.scrollTo.bind(window);
  window.scrollTo = (...a) => {
    vt.scrollCalls.push([
      Math.round(performance.now()),
      JSON.stringify(a),
      Math.round(scrollY),
      location.pathname,
    ]);
    return origScrollTo(...a);
  };
  window.__vt = vt;
  const named = () => {
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
  window.__vtNames = named;
  window.addEventListener('click', () => (vt.clickY = Math.round(scrollY)), true);
  const cardTop = () => {
    const a = window.__watchHref && document.querySelector(`a[href="${window.__watchHref}"]`);
    return a ? Math.round(a.getBoundingClientRect().top) : null;
  };
  window.addEventListener(
    'scroll',
    () =>
      vt.scrollEvents.push([Math.round(performance.now()), Math.round(scrollY), location.pathname]),
    { passive: true },
  );
  window.__logFrames = () => {
    // Sampled right AFTER the frame is painted (timer inside rAF), so a correction made by the
    // page in a rAF callback of the same frame is part of what the visitor saw.
    const tick = () => {
      const t = Math.round(performance.now());
      setTimeout(() => vt.frames.push([t, Math.round(scrollY), location.pathname, cardTop()]));
      if (vt.frames.length < 400) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  window.__reset = () => {
    vt.calls = 0;
    vt.records = [];
    vt.frames = [];
    vt.scrollEvents = [];
    vt.scrollCalls = [];
    vt.backT0 = performance.now();
  };
  if (window.__noApi) {
    delete Document.prototype.startViewTransition;
    return;
  }
  const orig = Document.prototype.startViewTransition;
  if (!orig) return;
  Document.prototype.startViewTransition = function (cb) {
    const rec = { t0: performance.now(), scrollAtCall: scrollY, old: named(), oldImg: namedImg() };
    vt.calls++;
    vt.records.push(rec);
    const t = orig.call(this, async () => {
      await cb();
      rec.next = named();
      rec.nextImg = namedImg();
      rec.scrollAfterUpdate = scrollY;
      rec.pathAfterUpdate = location.pathname;
      rec.tCbDone = performance.now();
      rec.heightAtCbDone = document.documentElement.scrollHeight;
      rec.cardTopAtCbDone = cardTop();
    });
    t.ready.then(
      () => {
        rec.tReady = performance.now();
        rec.scrollAtReady = scrollY;
        rec.heightAtReady = document.documentElement.scrollHeight;
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
  { tag: '375', width: 375, height: 800, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
  { tag: '1280', width: 1280, height: 800, deviceScaleFactor: 1 },
];
const ONLY = process.env.PROBE_CASE ? process.env.PROBE_CASE.split(',') : null;
const OBSERVE = process.env.PROBE_MODE === 'observe';
const CASES = [
  { name: 'transition', reduce: false, noApi: false },
  { name: 'reduced-motion', reduce: true, noApi: false },
  { name: 'no-api', reduce: false, noApi: true },
  { name: 'card-removed', reduce: false, noApi: false, hideCard: true },
  ...(process.env.PROBE_GAPS || '40').split(',').map((g) => ({
    name: `double-back-${g}`,
    reduce: false,
    noApi: false,
    double: true,
    gap: Number(g),
  })),
].filter((c) => !OBSERVE || c.name === 'transition' || c.double);
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36';
const report = { source: remote ? 'preview' : 'local', viewports: {}, failures: [] };
const fail = (m) => report.failures.push(m);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const assetId = (u) => (u ? (/\/images\/[^/]+\/[^/]+\/([a-f0-9]+)-/.exec(u)?.[1] ?? null) : null);
const TOL = 4;

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
safe.watchBrowser(browser);

async function openPage(vp, c) {
  const { reduce, noApi } = c;
  const page = await browser.newPage();
  await page.setViewport(vp);
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' },
  ]);
  await page.evaluateOnNewDocument((n) => (window.__noApi = n), noApi);
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

async function gotoList(page, spa = false) {
  if (spa) {
    // in-app link click: "/" and the list stay in ONE document (a router navigation, not a page load)
    await page.evaluate(() => document.querySelector('a[href="/portfolio/"]')?.click());
    await page.waitForFunction(() => location.pathname === '/portfolio/', { timeout: 10000 });
    await sleep(1500);
  } else {
    await page.goto(ORIGIN + '/portfolio/', { waitUntil: 'networkidle2', timeout: 45000 });
  }
  await dismissConsent(page);
  for (let i = 0; i < 30; i++) {
    const hrefs = await cardHrefs(page);
    if (hrefs.length >= 3) return hrefs;
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'instant' }));
    await sleep(250);
  }
  return cardHrefs(page);
}

/** List -> card (forward) -> browser back; numbers for one viewport and case. */
async function measureBack(vp, c, pick) {
  const page = await openPage(vp, c);
  const hrefs = await gotoList(page);
  const href = hrefs[Math.min(pick, hrefs.length - 1)];
  const card = await page.evaluateHandle((h) => document.querySelector(`a[href="${h}"]`), href);
  await card.evaluate((a) => a.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await sleep(700);
  // Plain mouse events at the centre of the card: no scrollIntoViewIfNeeded animation (the card
  // is taller than a phone viewport), so the position at the click is the position that is saved.
  const box = await card.evaluate((a) => {
    const r = (a.closest('article, li, div') || a).getBoundingClientRect();
    return {
      x: r.x + r.width / 2,
      y: Math.min(Math.max(r.y + r.height / 2, 120), innerHeight - 120),
    };
  });
  await page.mouse.move(box.x, box.y);
  await sleep(1200); // hover starts the data preload (forward transition falls back after 300 ms)
  await page.mouse.click(box.x, box.y);
  // true position at the moment of the click (the click may scroll the card fully into view)
  const scrollAtClick = await page.evaluate(() => window.__vt.clickY);
  await page.waitForFunction((h) => location.pathname === h, { timeout: 10000 }, href);
  await sleep(2000);
  const scrollBefore = scrollAtClick;
  const forwardScroll = await page.evaluate(() => Math.round(scrollY));
  await page.evaluate((hide) => {
    window.__reset();
    window.__watchHref = location.pathname;
    if (hide) window.__hideCard(location.pathname);
    window.__logFrames();
  }, !!c.hideCard);
  await page.goBack({ waitUntil: 'load' }).catch(() => {});
  await page.waitForFunction(() => location.pathname === '/portfolio/', { timeout: 10000 });
  await sleep(2200);
  const r = await page.evaluate(() => {
    const vt = window.__vt;
    return {
      path: location.pathname,
      calls: vt.calls,
      rec: vt.records.at(-1) ?? null,
      frames: vt.frames,
      scrollEvents: vt.scrollEvents,
      scrollCalls: vt.scrollCalls,
      namesAtRest: window.__vtNames(),
      scrollNow: Math.round(scrollY),
      listeners: window.__listeners,
      restoration: history.scrollRestoration,
    };
  });
  const shot = `powrot-${c.name}-${vp.tag}.png`;
  await page.screenshot({ path: path.join(OUT, 'shots', shot) });
  await page.close();
  // During the update callback rendering is suppressed: only frames after it are visible.
  const visibleFrom = r.rec?.tCbDone ?? 0;
  const onList = r.frames.filter(([t, , p]) => p === '/portfolio/' && t >= visibleFrom);
  const firstListFrame = onList[0] ?? null;
  const eventsAfterFirstFrame = firstListFrame
    ? r.scrollEvents.filter(([t]) => t > firstListFrame[0])
    : [];
  return {
    href,
    scrollBefore,
    forwardScroll,
    calls: r.calls,
    scrollAfterUpdate: r.rec?.scrollAfterUpdate ?? null,
    scrollAtEnd: r.rec?.scrollAtEnd ?? null,
    scrollNow: r.scrollNow,
    firstListFrame,
    listFramesMinY: onList.length ? Math.min(...onList.map(([, y]) => y)) : null,
    listFramesMaxY: onList.length ? Math.max(...onList.map(([, y]) => y)) : null,
    scrollCalls: r.scrollCalls,
    rec: r.rec && {
      tCbDone: r.rec.tCbDone,
      tReady: r.rec.tReady,
      scrollAtReady: r.rec.scrollAtReady,
      heightAtCbDone: r.rec.heightAtCbDone,
      cardTopAtCbDone: r.rec.cardTopAtCbDone,
      heightAtReady: r.rec.heightAtReady,
    },
    firstFrames: r.frames.slice(0, 8),
    scrollEvents: r.scrollEvents,
    scrollEventsTotal: r.scrollEvents.length,
    scrollEventsAfterFirstListFrame: eventsAfterFirstFrame.length,
    scrollEventsMovingAfterFirstListFrame: eventsAfterFirstFrame.filter(
      ([, y]) => Math.abs(y - scrollBefore) > TOL,
    ).length,
    old: r.rec?.old ?? null,
    next: r.rec?.next ?? null,
    sameAsset:
      !!r.rec?.oldImg &&
      assetId(r.rec.oldImg) !== null &&
      assetId(r.rec.oldImg) === assetId(r.rec.nextImg),
    namesAtRest: r.namesAtRest,
    listeners: r.listeners,
    restoration: r.restoration,
    shot,
  };
}

/** Rapid double back: case study -> list -> "/" (history: "/", list, case study). */
async function measureDouble(vp, c) {
  const gap = c.gap ?? 40;
  const page = await openPage(vp, c);
  await page.goto(ORIGIN + '/', { waitUntil: 'networkidle2', timeout: 45000 });
  await dismissConsent(page);
  const hrefs = await gotoList(page, true);
  const href = hrefs[Math.min(1, hrefs.length - 1)];
  const card = await page.evaluateHandle((h) => document.querySelector(`a[href="${h}"]`), href);
  await card.evaluate((a) => a.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await sleep(700);
  const box = await card.evaluate((a) => {
    const r = (a.closest('article, li, div') || a).getBoundingClientRect();
    return {
      x: r.x + r.width / 2,
      y: Math.min(Math.max(r.y + r.height / 2, 120), innerHeight - 120),
    };
  });
  await page.mouse.move(box.x, box.y);
  await sleep(1200);
  await page.mouse.click(box.x, box.y);
  const scrollAtClick = await page.evaluate(() => window.__vt.clickY);
  await page.waitForFunction((h) => location.pathname === h, { timeout: 10000 }, href);
  await sleep(2000);
  await page.evaluate((g) => {
    window.__reset();
    window.__logFrames();
    history.back();
    setTimeout(() => history.back(), g);
  }, gap);
  await page.waitForFunction(() => location.pathname === '/', { timeout: 10000 });
  await sleep(2500);
  const r = await page.evaluate(() => ({
    path: location.pathname,
    scrollNow: Math.round(scrollY),
    calls: window.__vt.calls,
    scrollCalls: window.__vt.scrollCalls,
    sameDocument: !!window.__vt.clickY,
    framesOnRoot: window.__vt.frames.filter(([, , p]) => p === '/').map(([, y]) => y),
    namesAtRest: window.__vtNames(),
    listeners: window.__listeners,
    restoration: history.scrollRestoration,
  }));
  await page.close();
  return {
    href,
    scrollBefore: scrollAtClick,
    path: r.path,
    scrollNow: r.scrollNow,
    calls: r.calls,
    scrollCalls: r.scrollCalls,
    sameDocument: r.sameDocument,
    rootFramesMaxY: r.framesOnRoot.length ? Math.max(...r.framesOnRoot) : null,
    namesAtRest: r.namesAtRest,
    listeners: r.listeners,
    restoration: r.restoration,
  };
}

const saveReport = () =>
  fs.writeFile(path.join(OUT, 'probe.json'), JSON.stringify(report, null, 2));
for (const vp of VIEWPORTS) {
  const v = (report.viewports[vp.tag] = {});
  for (const c of CASES.filter((x) => !ONLY || ONLY.includes(x.name))) {
    const id = `${vp.tag} ${c.name}`;
    if (c.double) {
      const D = (v[c.name] = await measureDouble(vp, c));
      if (!OBSERVE) {
        if (D.path !== '/') fail(`${id}: ended on ${D.path}`);
        if (D.scrollNow > TOL) fail(`${id}: rest on "/" at ${D.scrollNow} (expected 0)`);
        if (Object.keys(D.namesAtRest).length) fail(`${id}: names left`);
        if (D.calls > 1) fail(`${id}: transitions ${D.calls}`);
        if (!D.sameDocument) fail(`${id}: "/" and the list are not in one document (probe invalid)`);
        const onRoot = D.scrollCalls.filter((x) => x[3] === '/' && !x[1].startsWith('[0')).length;
        if (onRoot) fail(`${id}: ${onRoot} scrollTo to a saved position while on "/"`);
      }
      await saveReport();
      continue;
    }
    const M = (v[c.name] = await measureBack(vp, c, 1));
    const near = (y) => y !== null && Math.abs(y - M.scrollBefore) <= TOL;
    if (OBSERVE) continue;
    if (M.scrollBefore < 100) fail(`${id}: list scroll before entry too small (${M.scrollBefore})`);
    if (M.forwardScroll !== 0) fail(`${id}: case study not at top (${M.forwardScroll})`);
    if (!near(M.scrollNow)) fail(`${id}: scroll at rest ${M.scrollNow} vs ${M.scrollBefore}`);
    if (!near(M.firstListFrame?.[1] ?? null))
      fail(`${id}: first list frame y ${M.firstListFrame?.[1]} vs ${M.scrollBefore}`);
    if (M.listFramesMinY !== null && !near(M.listFramesMinY))
      fail(`${id}: frame min ${M.listFramesMinY}`);
    if (M.listFramesMaxY !== null && !near(M.listFramesMaxY))
      fail(`${id}: frame max ${M.listFramesMaxY}`);
    if (M.scrollEventsMovingAfterFirstListFrame !== 0)
      fail(`${id}: ${M.scrollEventsMovingAfterFirstListFrame} moving scroll events after frame 1`);
    if (Object.keys(M.namesAtRest).length) fail(`${id}: names left after transition`);
    if (c.name.startsWith('transition')) {
      if (M.calls !== 1) fail(`${id}: transitions ${M.calls}`);
      if (M.old?.['realizacja-zdjecie'] !== 1 || M.next?.['realizacja-zdjecie'] !== 1)
        fail(`${id}: shared name not exactly once (old/new)`);
      if (!M.sameAsset) fail(`${id}: hero and card image are different assets`);
      if (!near(M.scrollAfterUpdate)) fail(`${id}: scroll after update ${M.scrollAfterUpdate}`);
    } else if (c.hideCard) {
      if (M.calls > 1) fail(`${id}: transitions ${M.calls}`);
    } else if (M.calls !== 0) fail(`${id}: ${M.calls} transitions, expected 0`);
    if (process.env.PROBE_TRACE === '1' || report.failures.some((f) => f.startsWith(id))) {
      console.log(`TRACE ${id} calls=${JSON.stringify(M.scrollCalls)}`);
      console.log(`TRACE ${id} events=${JSON.stringify(M.scrollEvents)}`);
      console.log(`TRACE ${id} frames=${JSON.stringify(M.firstFrames)}`);
    }
    await saveReport();
  }
}

await browser.close();
local?.server.close();
const verdict = safe.finish().problems;
if (verdict.length) report.failures.push(...verdict.map((p) => `prod-safe: ${p}`));
await saveReport();
for (const [vpTag, vv] of Object.entries(report.viewports)) {
  for (const [name, M] of Object.entries(vv)) {
    if (name.startsWith('double-back')) {
      console.log(
        `NUM ${vpTag} ${name} path=${M.path} rest=${M.scrollNow} sameDocument=${M.sameDocument} transitions=${M.calls} restoreCallsOnRoot=${M.scrollCalls.filter((c) => c[3] === '/' && !c[1].startsWith('[0')).length} rootFramesMaxY=${M.rootFramesMaxY} listeners=${JSON.stringify(M.listeners)} restoration=${M.restoration}`,
      );
      continue;
    }
    console.log(
      `NUM ${vpTag} ${name} ${M.href} scrollY before/afterUpdate/end/rest=${M.scrollBefore}/${M.scrollAfterUpdate}/${M.scrollAtEnd}/${M.scrollNow}` +
        ` transitions=${M.calls} firstListFrameY=${M.firstListFrame?.[1]} frames min/max=${M.listFramesMinY}/${M.listFramesMaxY}` +
        ` scrollEvents total/afterFirstFrame/movingAfterFirstFrame=${M.scrollEventsTotal}/${M.scrollEventsAfterFirstListFrame}/${M.scrollEventsMovingAfterFirstListFrame}` +
        ` sharedName old/new=${M.old?.['realizacja-zdjecie'] ?? null}/${M.next?.['realizacja-zdjecie'] ?? null} sameAsset=${M.sameAsset} listeners=${JSON.stringify(M.listeners)} restoration=${M.restoration}`,
    );
  }
}
console.log(`PROBE ${report.source}: failures ${report.failures.length}`);
for (const f of report.failures) console.log('FAIL ' + f);
process.exit(report.failures.length ? 1 : 0);
