#!/usr/bin/env node
/**
 * MIX-1711: smoothness of ENTER (list -> case study, click) against BACK (case study -> list, one browser back).
 *
 *   node .bieg/mix1711/smooth.mjs <dist-dir> <out-dir>      env: SMOOTH_VP=1280|375, SMOOTH_RUNS (default 8)
 *
 * Built from .bieg/mix1707/p/probe-x.mjs (server, Sanity proxy, prod-safe). One fresh page per run: list, card 2
 * centred, hover 1200 ms (data preload), click = ENTER, 2 s, page.goBack() = BACK, 2 s. Per direction:
 *   trig   = click event timeStamp (ENTER) or the first popstate (BACK, capture listener installed before the app),
 *   ready  = view transition `ready` (animations created) - trig,
 *   start  = `ready` - trig (animations created, painted in that frame; no rAF runs while rendering is suppressed),
 *   firstFrame = first rAF timestamp after `ready` - trig,
 *   dur    = `finished` - `ready` (wall time of the animation), css = declared duration of the image group,
 *   long   = rAF intervals > 20 ms between `ready` and `finished` (n = frames in that span),
 *   loaf   = long-animation-frame entries (PerformanceObserver) overlapping trig..finished.
 * Prints RUN lines, a side-by-side TABLE, MEDIAN lines and the MIX-1711 criteria (CRIT ... OK|NO).
 * Exit 0 = every run measured with exactly one non-skipped transition per direction AND all criteria OK;
 * 1 = measured, some criterion NO; 2 = a run without a transition or a probe error (fail-closed).
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { createProdSafe } from '../../scripts/lib/prod-safe.mjs';

const [srcArg, outArg] = process.argv.slice(2);
if (!srcArg || !outArg) {
  console.error('usage: smooth.mjs <dist-dir> <out-dir>');
  process.exit(2);
}
const OUT = path.resolve(outArg);
await fs.mkdir(OUT, { recursive: true });
const RUNS = Number(process.env.SMOOTH_RUNS || 8);
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
const DIST = path.resolve(srcArg);
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
const safe = createProdSafe(ORIGIN);
const SANITY = /^https:\/\/([a-z0-9]+\.api\.sanity\.io|cdn\.sanity\.io)\//;
const SANITY_API = /^https:\/\/[a-z0-9]+\.api\.sanity\.io\//;
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

// In-page instrument (before the app): trigger time, view transition timeline, rAF timestamps, LoAF entries.
const INSTRUMENT = () => {
  const m = { trig: null, recs: [], ts: [], loaf: [], armed: false };
  window.__m = m;
  window.addEventListener('click', (e) => m.armed && m.trig === null && (m.trig = e.timeStamp), true);
  window.addEventListener('popstate', () => m.armed && m.trig === null && (m.trig = performance.now()), true);
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) m.loaf.push([e.startTime, e.duration, e.blockingDuration ?? 0]);
    }).observe({ type: 'long-animation-frame', buffered: false });
  } catch {
    m.loafUnsupported = true;
  }
  const tick = (t) => {
    if (m.armed) m.ts.push(t);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  window.__arm = () => {
    m.trig = null;
    m.recs = [];
    m.ts = [];
    m.loaf = [];
    m.armed = true;
  };
  const orig = Document.prototype.startViewTransition;
  if (!orig) return;
  Document.prototype.startViewTransition = function (cb) {
    const rec = { t0: performance.now(), path0: location.pathname };
    if (m.armed) m.recs.push(rec);
    const t = orig.call(this, cb);
    const origSkip = t.skipTransition.bind(t);
    t.skipTransition = () => {
      rec.skipped ??= performance.now();
      return origSkip();
    };
    t.updateCallbackDone.then(() => (rec.tCb = performance.now()), () => (rec.cbErr = true));
    t.ready.then(
      () => {
        rec.tReady = performance.now();
        const all = document
          .getAnimations()
          .map((x) => [String(x.effect?.pseudoElement || ''), Number(x.effect?.getComputedTiming().duration)]);
        rec.anims = all.filter(([p]) => p.includes('view-transition'));
        const g = rec.anims.find(([p]) => p.includes('view-transition-group(realizacja-zdjecie)'));
        rec.css = g ? g[1] : null;
      },
      () => (rec.readyErr = true),
    );
    t.finished.then(() => (rec.t1 = performance.now()), () => (rec.t1 = performance.now()));
    return t;
  };
};

const VPS = {
  375: { width: 375, height: 800, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
  1280: { width: 1280, height: 800, deviceScaleFactor: 1 },
};
const vpTag = process.env.SMOOTH_VP || '1280';
const vp = VPS[vpTag];
if (!vp) {
  console.error(`SMOOTH_VP must be 375 or 1280 (got ${vpTag})`);
  process.exit(2);
}
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
safe.watchBrowser(browser);
const errors = [];

async function openPage() {
  const page = await browser.newPage();
  await page.setViewport(vp);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.evaluateOnNewDocument(INSTRUMENT);
  await safe.protect(page, {
    userAgent: UA,
    handler: (req) => {
      const u = req.url();
      const own = u.startsWith(ORIGIN + '/');
      if (req.method() === 'GET' && SANITY_API.test(u)) proxySanity(req);
      else if (req.method() === 'GET' && (own || SANITY.test(u))) req.continue().catch(() => {});
      else req.abort().catch(() => {});
    },
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e.message).slice(0, 140)}`));
  return page;
}

async function dismissConsent(page) {
  await page.evaluate(() => {
    const region = document.querySelector('[role="region"][aria-label="Baner plików cookies"]');
    [...(region?.querySelectorAll('button') ?? [])].find((b) => b.textContent.trim() === 'Odrzuć opcjonalne')?.click();
  });
  await page
    .waitForFunction(() => !document.querySelector('[role="region"][aria-label="Baner plików cookies"]'), {
      timeout: 3000,
    })
    .catch(() => {});
}

async function cardHrefs(page) {
  return page.evaluate(() => {
    const re = /^\/portfolio\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/;
    const out = [];
    for (const a of document.querySelectorAll('a[href]')) {
      const href = a.getAttribute('href');
      if (!re.test(href) || out.includes(href)) continue;
      // same rule as findCardParts / probe-x.mjs: the image is in the link or in a parent with this one link
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

/** Numbers of one direction from the in-page record. */
function summarise(m) {
  const rec = m.recs.at(-1);
  if (!rec || m.trig === null || rec.tReady === undefined || rec.t1 === undefined)
    return { ok: false, calls: m.recs.length, why: !rec ? 'no transition' : m.trig === null ? 'no trigger' : 'no ready/finished' };
  const ts = m.ts;
  // rendering is suppressed during the update callback (no rAF): only frames after `ready` are animation frames
  const span = ts.filter((t) => t >= rec.tReady - 1 && t <= rec.t1);
  const gaps = span.slice(1).map((t, i) => t - span[i]);
  const loaf = m.loaf.filter(([s, d]) => s + d > m.trig && s < rec.t1);
  return {
    ok: m.recs.length === 1 && rec.skipped === undefined,
    calls: m.recs.length,
    skipped: rec.skipped !== undefined,
    start: Math.round(rec.tReady - m.trig),
    firstFrame: span.length ? Math.round(span[0] - m.trig) : null,
    ready: Math.round(rec.tReady - m.trig),
    cb: rec.tCb !== undefined ? Math.round(rec.tCb - m.trig) : null,
    dur: Math.round(rec.t1 - rec.tReady),
    css: rec.css,
    anims: (rec.anims || []).map(([p, d]) => `${p.replace('::view-transition-', '')}=${d}`).join(','),
    long: gaps.filter((g) => g > 20).length,
    n: span.length,
    maxGap: gaps.length ? Math.round(Math.max(...gaps)) : null,
    loaf: loaf.length,
    loafMax: loaf.length ? Math.round(Math.max(...loaf.map(([, d]) => d))) : 0,
    loafUnsupported: !!m.loafUnsupported,
  };
}

async function oneRun(k) {
  const page = await openPage();
  try {
    await page.goto(ORIGIN + '/portfolio/', { waitUntil: 'networkidle2', timeout: 45000 });
    await dismissConsent(page);
    let hrefs = [];
    for (let i = 0; i < 30 && hrefs.length < 3; i++) {
      hrefs = await cardHrefs(page);
      if (hrefs.length < 3) {
        await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'instant' }));
        await sleep(250);
      }
    }
    const href = hrefs[Math.min(1, hrefs.length - 1)];
    if (!href) throw new Error('no card on the list');
    const card = await page.evaluateHandle((h) => document.querySelector(`a[href="${h}"]`), href);
    await card.evaluate((a) => a.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await sleep(700);
    const box = await card.evaluate((a) => {
      const r = (a.closest('article, li, div') || a).getBoundingClientRect();
      return { x: r.x + r.width / 2, y: Math.min(Math.max(r.y + r.height / 2, 120), innerHeight - 120) };
    });
    await page.mouse.move(box.x, box.y);
    await sleep(1200);
    await page.evaluate(() => window.__arm());
    await page.mouse.click(box.x, box.y);
    await page.waitForFunction((h) => location.pathname === h, { timeout: 10000 }, href);
    await sleep(2000);
    const enter = summarise(await page.evaluate(() => window.__m));
    await page.evaluate(() => window.__arm());
    await page.goBack({ waitUntil: 'load' }).catch(() => {});
    await page.waitForFunction(() => location.pathname === '/portfolio/', { timeout: 10000 });
    await sleep(2000);
    const back = summarise(await page.evaluate(() => window.__m));
    return { k, href, enter, back };
  } finally {
    await page.close().catch(() => {});
  }
}

const rows = [];
for (let k = 1; k <= RUNS; k++) {
  try {
    rows.push(await oneRun(k));
  } catch (e) {
    errors.push(`run ${k}: ${String(e.message).slice(0, 160)}`);
  }
}
await browser.close();
server.close();
const leaks = safe.finish().problems;
errors.push(...leaks.map((p) => `prod-safe: ${p}`));
await fs.writeFile(path.join(OUT, `smooth-${vpTag}.json`), JSON.stringify({ rows, errors }, null, 2));

const fmt = (s) =>
  s.ok || s.start !== undefined
    ? `start=${s.start} firstFrame=${s.firstFrame} cb=${s.cb} dur=${s.dur} css=${s.css} long=${s.long}/${s.n} maxGap=${s.maxGap} loaf=${s.loaf}(${s.loafMax}) calls=${s.calls}${s.skipped ? ' SKIPPED' : ''} anims=${s.anims}`
    : `NOT MEASURED (${s.why}, calls=${s.calls})`;
for (const r of rows) {
  console.log(`RUN ${vpTag} ${r.k} ENTER ${fmt(r.enter)}`);
  console.log(`RUN ${vpTag} ${r.k} BACK  ${fmt(r.back)}`);
}
const pad = (v, w = 6) => String(v ?? '-').padStart(w);
console.log(`TABLE ${vpTag} | run | ENTER start  dur long maxGap | BACK start  dur long maxGap |`);
for (const r of rows)
  console.log(
    `TABLE ${vpTag} | ${pad(r.k, 3)} | ${pad(r.enter.start)}${pad(r.enter.dur, 5)}${pad(r.enter.long, 5)}${pad(r.enter.maxGap, 7)} | ${pad(r.back.start)}${pad(r.back.dur, 5)}${pad(r.back.long, 5)}${pad(r.back.maxGap, 7)} |`,
  );
const med = (xs) => {
  const v = xs.filter(Number.isFinite).sort((a, b) => a - b);
  return v.length ? (v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2) : NaN;
};
const col = (dir, key) => rows.map((r) => r[dir][key]);
const sum = (xs) => xs.filter(Number.isFinite).reduce((a, b) => a + b, 0);
const S = {};
for (const dir of ['enter', 'back'])
  S[dir] = {
    start: med(col(dir, 'start')),
    startMax: Math.max(...col(dir, 'start').filter(Number.isFinite)),
    dur: med(col(dir, 'dur')),
    durMin: Math.min(...col(dir, 'dur').filter(Number.isFinite)),
    durMax: Math.max(...col(dir, 'dur').filter(Number.isFinite)),
    long: sum(col(dir, 'long')),
    loaf: sum(col(dir, 'loaf')),
    cssOk: rows.every((r) => Number.isFinite(r[dir].css) && Math.abs(r[dir].css - 300) <= 20),
    css: [...new Set(col(dir, 'css'))].join('/'),
  };
for (const dir of ['enter', 'back'])
  console.log(
    `MEDIAN ${vpTag} ${dir.toUpperCase()} runs=${rows.length} start med/max=${S[dir].start}/${S[dir].startMax} dur med/min/max=${S[dir].dur}/${S[dir].durMin}/${S[dir].durMax} long frames total=${S[dir].long} loaf total=${S[dir].loaf}`,
  );
const measured = rows.length === RUNS && rows.every((r) => r.enter.ok && r.back.ok);
const crit = [
  ['C1 BACK start median <= ENTER start median + 50', S.back.start <= S.enter.start + 50, `${S.back.start} <= ${S.enter.start + 50}`],
  ['C2 BACK long frames total <= ENTER total', S.back.long <= S.enter.long, `${S.back.long} <= ${S.enter.long}`],
  // declared duration of the image group (CSS 0.3 s) at every run, both directions; wall time is frame-bound on
  // the cloud (software rendering), so BACK wall time may not exceed ENTER wall time by more than 20 ms
  ['C3 declared image-group duration 300 +-20 (every run, ENTER and BACK)', S.enter.cssOk && S.back.cssOk, `ENTER ${S.enter.css} BACK ${S.back.css}`],
  ['C3 BACK wall dur median <= ENTER wall median + 20', S.back.dur <= S.enter.dur + 20, `${S.back.dur} <= ${S.enter.dur + 20}`],
];
for (const [name, ok, val] of crit) console.log(`CRIT ${vpTag} ${name}: ${val} ${ok ? 'OK' : 'NO'}`);
for (const e of errors) console.log(`ERROR ${e}`);
const green = measured && errors.length === 0 && crit.every(([, ok]) => ok);
console.log(`SMOOTH ${vpTag} measured=${measured} errors=${errors.length} verdict=${green ? 'GREEN' : 'RED'}`);
process.exit(!measured || errors.length ? 2 : green ? 0 : 1);
