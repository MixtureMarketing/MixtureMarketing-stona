#!/usr/bin/env node
/**
 * MIX-1745: BACK (case study -> list) frame by frame, for a comparison of two builds (3febcb0 grid class vs this tree).
 *
 *   node .bieg/mix1745/frames.mjs <dist-dir> <out-dir>     env FR_VP=375|412|1280, FR_TAG (label), FR_CARDS (default second,last)
 *
 * Server, Sanity proxy and prod-safe as .bieg/mix1741/footer.mjs (all cards loaded first: the list scrolled to its end).
 * Per card (second = card 2, last = last card) two passes on a fresh page each:
 *   rt:    real time; from the first popstate every animation frame is sampled for 2000 ms: animated view-transition
 *          names, image group rect (realizacja-zdjecie), title group rect (realizacja-tytul), scrollY, page height,
 *          list height and the live card image rect; then the rest state (OK / FOOTER / OTHER, footer.mjs classes).
 *   step:  at view transition `ready` every ::view-transition-* animation is paused and set to k*T/10, k = 0..10
 *          (11 frames over the 300 ms), screenshot frames/<vp>-<tag>-<card>-<k>.png and the computed geometry of every
 *          animated pseudo-element; then finish(), 1000 ms, screenshot of the rest (k = 'after').
 * Lines: CARD, RT, RTSUM, STEP, REST. JSON: <out>/frames-<vp>-<tag>.json.
 * Exit: 0 = every pass measured (a transition ran in rt and step paused); 2 = not measured / probe error (fail-closed).
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import puppeteer from 'puppeteer';
import { createProdSafe } from '../../scripts/lib/prod-safe.mjs';

const [srcArg, outArg] = process.argv.slice(2);
if (!srcArg || !outArg) {
  console.error('usage: frames.mjs <dist-dir> <out-dir>');
  process.exit(2);
}
const OUT = path.resolve(outArg);
await fs.mkdir(path.join(OUT, 'frames'), { recursive: true });
const TAG = process.env.FR_TAG || 'x';
const CARDS = (process.env.FR_CARDS || 'second,last').split(',');
if (!CARDS.every((c) => ['second', 'last'].includes(c)) || !/^[a-z0-9]+$/.test(TAG)) {
  console.error(`FR_CARDS must be second|last, FR_TAG [a-z0-9]+ (got ${CARDS}, ${TAG})`);
  process.exit(2);
}
const STEPS = 10;
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

// In-page instrument (before the app). Pause/step as .bieg/mix1711/reverse.mjs; plus a real-time sampler armed by the
// first popstate after __armRt(href).
const INSTRUMENT = () => {
  const vt = { pause: false, calls: 0, paused: false, T: null, skipped: false, finished: false, readyErr: false };
  window.__vt = vt;
  const vtAnims = () =>
    document.getAnimations().filter((a) => String(a.effect?.pseudoElement || '').startsWith('::view-transition'));
  const num = (v) => (v === 'auto' || v === '' ? NaN : parseFloat(v));
  const mat = (cs) => {
    const m = cs.transform;
    const v = !m || m === 'none' ? [1, 0, 0, 1, 0, 0] : /matrix\(([^)]+)\)/.exec(m)?.[1].split(',').map(Number);
    const [ox, oy] = cs.transformOrigin.split(' ').map(parseFloat);
    if (!v || v.length !== 6) return () => [NaN, NaN];
    const [a, b, c, d, e, f] = v;
    return ([px, py]) => [a * (px - ox) + c * (py - oy) + ox + e, b * (px - ox) + d * (py - oy) + oy + f];
  };
  const rect = (cs, outer) => {
    const w = num(cs.width);
    const h = num(cs.height);
    const own = mat(cs);
    const pts = [[0, 0], [w, 0], [0, h], [w, h]].map((p) => (outer ? outer(own(p)) : own(p)));
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
  };
  const geometry = () => {
    const an = vtAnims();
    const pseudos = new Set(an.map((a) => String(a.effect.pseudoElement)));
    const names = [...new Set([...pseudos].map((p) => /\(([^)]+)\)/.exec(p)?.[1]).filter(Boolean))].sort();
    const out = {};
    for (const n of names) {
      const g = getComputedStyle(document.documentElement, `::view-transition-group(${n})`);
      const gm = mat(g);
      for (const part of ['group', 'old', 'new']) {
        const p = `::view-transition-${part}(${n})`;
        if (!pseudos.has(p)) continue;
        const cs = part === 'group' ? g : getComputedStyle(document.documentElement, p);
        out[`${part}(${n})`] = { ...rect(cs, part === 'group' ? null : gm), op: Number(cs.opacity) };
      }
    }
    return { names, pseudos: [...pseudos].sort(), rec: out };
  };
  const cardImg = (h) => {
    const a = h && document.querySelector(`a[href="${h}"]`);
    let node = a;
    let img = a?.querySelector('img:not([aria-hidden="true"])') ?? null;
    for (let d = 0; a && !img && d < 4 && node.parentElement; d++) {
      node = node.parentElement;
      img = node.querySelector('img:not([aria-hidden="true"])');
    }
    return img;
  };
  window.__cardImg = cardImg;
  // real-time sampler
  const rt = { href: null, armed: false, on: false, t0: 0, rows: [] };
  window.__rt = rt;
  window.__armRt = (h) => {
    rt.href = h;
    rt.rows = [];
    rt.armed = true;
    rt.on = false;
  };
  window.addEventListener(
    'popstate',
    () => {
      if (!rt.armed || rt.on) return;
      rt.on = true;
      rt.t0 = performance.now();
    },
    true,
  );
  const tick = (ts) => {
    if (rt.on) {
      const t = Math.round(ts - rt.t0);
      if (t <= 2000) {
        const g = geometry();
        const img = cardImg(rt.href);
        const r = img?.getBoundingClientRect();
        const grid = document.querySelector('.vt-lista');
        rt.rows.push({
          t,
          vt: document.documentElement.getAttribute('data-vt'),
          names: g.names,
          img: g.rec['group(realizacja-zdjecie)'] ?? null,
          tit: g.rec['group(realizacja-tytul)'] ?? null,
          sy: Math.round(scrollY),
          docH: document.documentElement.scrollHeight,
          grid: grid ? Math.round(grid.getBoundingClientRect().height) : null,
          card: r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null,
          cardSkipped: img ? !img.checkVisibility({ contentVisibilityAuto: true }) : null,
        });
      } else {
        rt.on = false;
        rt.armed = false;
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  const orig = Document.prototype.startViewTransition;
  if (!orig) return;
  Document.prototype.startViewTransition = function (cb) {
    const t = orig.call(this, cb);
    vt.calls++;
    vt.paused = false;
    vt.finished = false;
    vt.skipped = false;
    const origSkip = t.skipTransition.bind(t);
    t.skipTransition = () => {
      vt.skipped = true;
      return origSkip();
    };
    t.ready.then(
      () => {
        const an = vtAnims();
        vt.T = Math.max(...an.map((a) => Number(a.effect.getComputedTiming().endTime) || 0));
        if (vt.pause) {
          an.forEach((a) => a.pause());
          an.forEach((a) => (a.currentTime = 0));
          vt.paused = true;
        }
      },
      () => (vt.readyErr = true),
    );
    t.finished.then(
      () => (vt.finished = true),
      () => (vt.finished = true),
    );
    return t;
  };
  window.__step = async (k, steps) => {
    vtAnims().forEach((a) => (a.currentTime = (k * vt.T) / steps));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return { ...geometry(), sy: Math.round(scrollY) };
  };
  window.__finishVt = () => vtAnims().forEach((a) => a.finish());
};

const VPS = {
  375: { width: 375, height: 800, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
  // phone-like (Android, DPR 2.625): the owner watches on a phone
  412: { width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2.625 },
  1280: { width: 1280, height: 800, deviceScaleFactor: 1 },
};
const vpTag = process.env.FR_VP || '375';
const vp = VPS[vpTag];
if (!vp) {
  console.error(`FR_VP must be 375, 412 or 1280 (got ${vpTag})`);
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

/** Case-study links that carry an image (list cards), in document order. */
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

/** State of the list: scrollY, card image rect, footer top, grid height, skipped card. */
async function listState(page, href) {
  return page.evaluate((h) => {
    const a = document.querySelector(`a[href="${h}"]`);
    let node = a;
    let img = a?.querySelector('img:not([aria-hidden="true"])') ?? null;
    for (let d = 0; a && !img && d < 4 && node.parentElement; d++) {
      node = node.parentElement;
      img = node.querySelector('img:not([aria-hidden="true"])');
    }
    const r = img?.getBoundingClientRect();
    const f = document.querySelector('footer')?.getBoundingClientRect();
    const grid = document.querySelector('.vt-lista');
    return {
      y: Math.round(scrollY),
      path: location.pathname,
      cardTop: r ? Math.round(r.top) : null,
      cardBottom: r ? Math.round(r.bottom) : null,
      cardOn: !!r && r.bottom > 0 && r.top < innerHeight && r.width > 0,
      footerTop: f ? Math.round(f.top) : null,
      footerOn: !!f && f.top < innerHeight && f.bottom > 0,
      grid: grid ? Math.round(grid.getBoundingClientRect().height) : null,
      skipped: img ? !img.checkVisibility({ contentVisibilityAuto: true }) : null,
      docH: document.documentElement.scrollHeight,
      ih: innerHeight,
    };
  }, href);
}

async function loadAll(page) {
  await page.goto(ORIGIN + '/portfolio/', { waitUntil: 'networkidle2', timeout: 45000 });
  await dismissConsent(page);
  await page.waitForSelector('.vt-lista a[href^="/portfolio/"]', { timeout: 20000 });
  // to the end and back to the top: every lazy image fetched (the owner had scrolled the whole list)
  for (let i = 0; i < 40; i++) {
    const end = await page.evaluate(() => {
      window.scrollBy({ top: 500, behavior: 'instant' });
      return scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    });
    await sleep(120);
    if (end) break;
  }
  await sleep(600);
  return cardHrefs(page);
}

async function centre(page, href) {
  await page.evaluate((h) => {
    document.querySelector(`a[href="${h}"]`)?.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, href);
  await sleep(700);
}

function classify(s, y0) {
  // a card skipped by content-visibility:auto is not painted: on screen only when rendered (MIX-1741 run m1741a: FBX)
  const seen = s.cardOn && s.skipped === false;
  if (s.footerOn && !seen) return 'FOOTER';
  if (Math.abs(s.y - y0) <= 4 && seen) return 'OK';
  return 'OTHER';
}


const r1 = (v) => (Number.isFinite(v) ? Math.round(v * 10) / 10 : 'NaN');
const fr = (r) => (r ? `${r1(r.x)},${r1(r.y)},${r1(r.w)},${r1(r.h)}` : '-');

/** Fresh page with every card loaded; returns the chosen card href. */
async function freshAt(choice) {
  const page = await openPage();
  const hrefs = await loadAll(page);
  const href = choice === 'second' ? hrefs[1] : hrefs.at(-1);
  if (!href) throw new Error(`no ${choice} card (cards=${hrefs.length})`);
  await centre(page, href);
  return { page, href, n: hrefs.length };
}

async function enter(page, href) {
  const box = await page.evaluate((h) => {
    const a = document.querySelector(`a[href="${h}"]`);
    const r = (a.closest('.group') || a).getBoundingClientRect();
    return { x: r.x + r.width / 2, y: Math.min(Math.max(r.y + r.height / 2, 120), innerHeight - 120) };
  }, href);
  if (vp.hasTouch) await page.touchscreen.tap(box.x, box.y);
  else await page.mouse.click(box.x, box.y);
  await page.waitForFunction((h) => location.pathname === h, { timeout: 10000 }, href);
  await page.waitForFunction(() => window.__vt.finished || window.__vt.calls === 0, { timeout: 10000 });
  await sleep(1500);
}

/** Paused stepping of the BACK transition; frames/<vp>-<tag>-<card>-<k>.png at half scale (palette PNG). */
async function shot(page, name) {
  const buf = await page.screenshot({ type: 'png' });
  const file = path.join(OUT, 'frames', `${name}.png`);
  await sharp(buf).resize(Math.round(vp.width / 2)).png({ palette: true, compressionLevel: 9 }).toFile(file);
  return file;
}

const result = { vp: vpTag, tag: TAG, cards: {} };
for (const choice of CARDS) {
  const rec = { choice };
  result.cards[choice] = rec;
  // rt pass
  let page;
  try {
    const f = await freshAt(choice);
    page = f.page;
    rec.href = f.href;
    rec.y0 = await page.evaluate(() => Math.round(scrollY));
    console.log(`CARD ${vpTag} ${TAG} ${choice} href=${f.href} n=${f.n} y0=${rec.y0}`);
    await enter(page, f.href);
    await page.evaluate((h) => {
      window.__vt.calls = 0;
      window.__armRt(h);
    }, f.href);
    await page.goBack({ waitUntil: 'load' }).catch(() => {});
    await page.waitForFunction(() => location.pathname === '/portfolio/', { timeout: 10000 });
    await sleep(2300);
    const rows = await page.evaluate(() => window.__rt.rows);
    const st = await page.evaluate(() => ({ ...window.__vt }));
    const after = await listState(page, f.href);
    rec.rt = { rows, calls: st.calls, skipped: st.skipped, rest: after.y, cls: classify(after, rec.y0) };
    let prev = '';
    for (const r of rows) {
      const line = `vt=${r.vt ?? '-'} names=${r.names.join('+') || '-'} img=${fr(r.img)} tit=${fr(r.tit)} sy=${r.sy} docH=${r.docH} grid=${r.grid} card=${fr(r.card)} skip=${r.cardSkipped}`;
      if (line !== prev) console.log(`RT ${vpTag} ${TAG} ${choice} t=${r.t} ${line}`);
      prev = line;
    }
    const vtRows = rows.filter((r) => r.names.length);
    const names = [...new Set(vtRows.flatMap((r) => r.names))].sort();
    rec.rt.names = names;
    rec.rt.vtFrames = vtRows.length;
    console.log(
      `RTSUM ${vpTag} ${TAG} ${choice} frames=${rows.length} vtFrames=${vtRows.length} calls=${st.calls} skipped=${st.skipped} names=${names.join('+') || '-'} y0=${rec.y0} rest=${after.y} cls=${rec.rt.cls} footerTop=${after.footerTop} grid=${after.grid}`,
    );
    if (!(st.calls >= 1) || !vtRows.length) errors.push(`${choice} rt: no BACK transition (calls=${st.calls}, vtFrames=${vtRows.length})`);
  } catch (e) {
    errors.push(`${choice} rt: ${String(e.message).slice(0, 160)}`);
  } finally {
    await page?.close().catch(() => {});
  }
  // step pass
  page = undefined;
  try {
    const f = await freshAt(choice);
    page = f.page;
    await enter(page, f.href);
    await page.evaluate(() => {
      window.__vt.calls = 0;
      window.__vt.pause = true;
    });
    await page.goBack({ waitUntil: 'load' }).catch(() => {});
    await page.waitForFunction(() => window.__vt.paused || window.__vt.skipped || window.__vt.readyErr, { timeout: 10000 });
    const st = await page.evaluate(() => ({ ...window.__vt }));
    if (!st.paused) throw new Error(`BACK not paused (skipped=${st.skipped} readyErr=${st.readyErr})`);
    rec.T = st.T;
    rec.steps = [];
    for (let k = 0; k <= STEPS; k++) {
      const g = await page.evaluate((kk, n) => window.__step(kk, n), k, STEPS);
      const file = await shot(page, `${vpTag}-${TAG}-${choice}-${String(k).padStart(2, '0')}`);
      rec.steps.push({ k, ...g, file: path.basename(file) });
      const img = g.rec['group(realizacja-zdjecie)'];
      const tit = g.rec['group(realizacja-tytul)'];
      console.log(
        `STEP ${vpTag} ${TAG} ${choice} k=${k} t=${Math.round((k * st.T) / STEPS)} names=${g.names.join('+')} pseudos=${g.pseudos.length} img=${fr(img)} tit=${fr(tit)} sy=${g.sy}`,
      );
    }
    await page.evaluate(() => window.__finishVt());
    await page.waitForFunction(() => window.__vt.finished, { timeout: 10000 });
    await sleep(1000);
    await shot(page, `${vpTag}-${TAG}-${choice}-after`);
    const after = await listState(page, f.href);
    console.log(`REST ${vpTag} ${TAG} ${choice} T=${st.T} y=${after.y} cardTop=${after.cardTop} footerTop=${after.footerTop} grid=${after.grid}`);
  } catch (e) {
    errors.push(`${choice} step: ${String(e.message).slice(0, 160)}`);
  } finally {
    await page?.close().catch(() => {});
  }
}
await browser.close();
server.close();
errors.push(...safe.finish().problems.map((p) => `prod-safe: ${p}`));
result.errors = errors;
await fs.writeFile(path.join(OUT, `frames-${vpTag}-${TAG}.json`), JSON.stringify(result, null, 2));
for (const e of errors) console.log(`ERROR ${e}`);
const measured =
  errors.length === 0 && CARDS.every((c) => result.cards[c]?.rt?.vtFrames > 0 && result.cards[c]?.steps?.length === STEPS + 1);
console.log(`FRAMES ${vpTag} ${TAG} measured=${measured} errors=${errors.length}`);
process.exit(measured ? 0 : 2);
