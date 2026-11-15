#!/usr/bin/env node
/**
 * MIX-1745 round 2: which condition switches the look of BACK (case study -> list)? N backs per condition, one build.
 *
 *   node .bieg/mix1745/cond.mjs <dist-dir> <out-dir>   env FR_VP=375|412|1280, FR_TAG (label), CD_RUNS (default 10),
 *                                                      CD_CONDS (csv, default fresh,series,noload,scrolled,quick)
 * Conditions (allowlist):
 *   fresh:    new page per back, whole list scrolled first (every card rendered once, images fetched), first back
 *   series:   one page, N consecutive backs without reload (later backs), list scrolled once at the start
 *   noload:   new page per back, NO scroll through the list (cards below never rendered, lazy images not fetched),
 *             the card scrolled into view and tapped after 300 ms
 *   scrolled: as series, but on the case study the page is scrolled down 1.5 screens before BACK (reading)
 *   quick:    as series, BACK 350 ms after the tap (right after the 300 ms entry transition)
 * Cards per back k cycle: last, last-1, second, last-2, last-3 (same order in every build).
 * Per back, at view transition `ready`, every ::view-transition-* animation is paused, sampled at 0, 25, 50, 75 and
 * 100 % of its duration (computed geometry of the image group realizacja-zdjecie and title group realizacja-tytul,
 * animated names), then put back to 0 and played; plus whether the target card image was loaded, scroll, rest class.
 * Lines B (one per back), LOOK (distinct looks per condition). JSON <out>/cond-<vp>-<tag>.json.
 * Exit 0 = every back measured; 2 = a back not measured / probe error (fail-closed).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import puppeteer from 'puppeteer';
import { createProdSafe } from '../../scripts/lib/prod-safe.mjs';

const [srcArg, outArg] = process.argv.slice(2);
if (!srcArg || !outArg) {
  console.error('usage: cond.mjs <dist-dir> <out-dir>');
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
  const vt = {
    pause: false,
    calls: 0,
    paused: false,
    T: null,
    skipped: false,
    finished: false,
    readyErr: false,
  };
  window.__vt = vt;
  const vtAnims = () =>
    document
      .getAnimations()
      .filter((a) => String(a.effect?.pseudoElement || '').startsWith('::view-transition'));
  const num = (v) => (v === 'auto' || v === '' ? NaN : parseFloat(v));
  const mat = (cs) => {
    const m = cs.transform;
    const v =
      !m || m === 'none'
        ? [1, 0, 0, 1, 0, 0]
        : /matrix\(([^)]+)\)/.exec(m)?.[1].split(',').map(Number);
    const [ox, oy] = cs.transformOrigin.split(' ').map(parseFloat);
    if (!v || v.length !== 6) return () => [NaN, NaN];
    const [a, b, c, d, e, f] = v;
    return ([px, py]) => [
      a * (px - ox) + c * (py - oy) + ox + e,
      b * (px - ox) + d * (py - oy) + oy + f,
    ];
  };
  const rect = (cs, outer) => {
    const w = num(cs.width);
    const h = num(cs.height);
    const own = mat(cs);
    const pts = [
      [0, 0],
      [w, 0],
      [0, h],
      [w, h],
    ].map((p) => (outer ? outer(own(p)) : own(p)));
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
  };
  const geometry = () => {
    const an = vtAnims();
    const pseudos = new Set(an.map((a) => String(a.effect.pseudoElement)));
    const names = [
      ...new Set([...pseudos].map((p) => /\(([^)]+)\)/.exec(p)?.[1]).filter(Boolean)),
    ].sort();
    const out = {};
    for (const n of names) {
      const g = getComputedStyle(document.documentElement, `::view-transition-group(${n})`);
      const gm = mat(g);
      for (const part of ['group', 'old', 'new']) {
        const p = `::view-transition-${part}(${n})`;
        if (!pseudos.has(p)) continue;
        const cs = part === 'group' ? g : getComputedStyle(document.documentElement, p);
        out[`${part}(${n})`] = {
          ...rect(cs, part === 'group' ? null : gm),
          op: Number(cs.opacity),
        };
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
  window.__geom = geometry;
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
    [...(region?.querySelectorAll('button') ?? [])]
      .find((b) => b.textContent.trim() === 'Odrzuć opcjonalne')
      ?.click();
  });
  await page
    .waitForFunction(
      () => !document.querySelector('[role="region"][aria-label="Baner plików cookies"]'),
      {
        timeout: 3000,
      },
    )
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
    document
      .querySelector(`a[href="${h}"]`)
      ?.scrollIntoView({ block: 'center', behavior: 'instant' });
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

// Second instrument (after INSTRUMENT): samples every BACK animation at fixed fractions without showing a paused frame.
const SAMPLER = () => {
  const orig = Document.prototype.startViewTransition;
  window.__vs = [];
  if (!orig) return;
  Document.prototype.startViewTransition = function (cb) {
    const t = orig.call(this, cb);
    const rec = { sy0: Math.round(scrollY), ready: false, skipped: false, finished: false };
    window.__vs.push(rec);
    const origSkip = t.skipTransition.bind(t);
    t.skipTransition = () => {
      rec.skipped = true;
      return origSkip();
    };
    t.ready.then(
      () => {
        rec.ready = true;
        rec.sy = Math.round(scrollY);
        const an = document
          .getAnimations()
          .filter((a) => String(a.effect?.pseudoElement || '').startsWith('::view-transition'));
        const T = Math.max(0, ...an.map((a) => Number(a.effect.getComputedTiming().endTime) || 0));
        rec.T = T;
        an.forEach((a) => a.pause());
        rec.f = [0, 0.25, 0.5, 0.75, 1].map((fr) => {
          an.forEach((a) => (a.currentTime = fr * T * 0.999));
          const g = window.__geom();
          return {
            fr,
            names: g.names,
            pseudos: g.pseudos.length,
            img: g.rec['group(realizacja-zdjecie)'] ?? null,
            tit: g.rec['group(realizacja-tytul)'] ?? null,
          };
        });
        an.forEach((a) => {
          a.currentTime = 0;
          a.play();
        });
        const el = [...document.querySelectorAll('[style*="view-transition-name"]')].find(
          (e) => e.style.getPropertyValue('view-transition-name') === 'realizacja-zdjecie',
        );
        const img = el && (el.tagName === 'IMG' ? el : el.querySelector('img'));
        rec.newImg = img ? (img.complete && img.naturalWidth > 0 ? 'loaded' : 'empty') : 'none';
      },
      () => (rec.readyErr = true),
    );
    t.finished.then(
      () => (rec.finished = true),
      () => (rec.finished = true),
    );
    return t;
  };
};

const ALLOWED = ['fresh', 'series', 'noload', 'scrolled', 'quick'];
const CONDS = (process.env.CD_CONDS || ALLOWED.join(',')).split(',');
const RUNS = Number(process.env.CD_RUNS || 10);
if (!CONDS.every((c) => ALLOWED.includes(c)) || !(RUNS >= 1 && RUNS <= 40)) {
  console.error(`CD_CONDS must be from ${ALLOWED} and CD_RUNS 1..40 (got ${CONDS}, ${RUNS})`);
  process.exit(2);
}

async function openSampled() {
  const page = await openPage();
  await page.evaluateOnNewDocument(SAMPLER);
  return page;
}

async function openList(full) {
  const page = await openSampled();
  if (full) return { page, hrefs: await loadAll(page) };
  await page.goto(ORIGIN + '/portfolio/', { waitUntil: 'networkidle2', timeout: 45000 });
  await dismissConsent(page);
  await page.waitForSelector('.vt-lista a[href^="/portfolio/"]', { timeout: 20000 });
  return { page, hrefs: await cardHrefs(page) };
}

const pick = (hrefs, k) => {
  const n = hrefs.length;
  const cyc = [n - 1, n - 2, 1, n - 3, n - 4];
  return hrefs[cyc[(k - 1) % cyc.length]];
};

async function oneBack(page, href, cond) {
  if (cond === 'noload') {
    await page.evaluate((h) => {
      document
        .querySelector(`a[href="${h}"]`)
        ?.scrollIntoView({ block: 'center', behavior: 'instant' });
    }, href);
    await sleep(300);
  } else await centre(page, href);
  const y0 = await page.evaluate(() => Math.round(scrollY));
  const box = await page.evaluate((h) => {
    const a = document.querySelector(`a[href="${h}"]`);
    const r = (a.closest('.group') || a).getBoundingClientRect();
    return {
      x: r.x + r.width / 2,
      y: Math.min(Math.max(r.y + r.height / 2, 120), innerHeight - 120),
    };
  }, href);
  if (vp.hasTouch) await page.touchscreen.tap(box.x, box.y);
  else await page.mouse.click(box.x, box.y);
  await page.waitForFunction((h) => location.pathname === h, { timeout: 10000 }, href);
  if (cond === 'quick') await sleep(350);
  else {
    await sleep(1300);
    if (cond === 'scrolled') {
      await page.evaluate(() =>
        window.scrollBy({ top: Math.round(innerHeight * 1.5), behavior: 'instant' }),
      );
      await sleep(400);
    }
  }
  const caseY = await page.evaluate(() => {
    window.__vs = [];
    return Math.round(scrollY);
  });
  await page.goBack({ waitUntil: 'load' }).catch(() => {});
  await page.waitForFunction(() => location.pathname === '/portfolio/', { timeout: 10000 });
  await sleep(1900);
  const vs = await page.evaluate(() => window.__vs);
  const after = await listState(page, href);
  return { href, y0, caseY, vs, rest: after.y, cls: classify(after, y0) };
}

const rnd = (r) =>
  r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) } : null;
const look = (b) => {
  const v = b.vs[0];
  if (!v) return 'no-transition';
  if (!v.ready) return `not-ready(skipped=${v.skipped})`;
  const f0 = v.f[0];
  const f1 = v.f[4];
  return `names=${f0.names.join('+')} img0=${fr(rnd(f0.img))} img1=${fr(rnd(f1.img))} tit0=${fr(rnd(f0.tit))} tit1=${fr(rnd(f1.tit))} newImg=${v.newImg}`;
};

const result = { vp: vpTag, tag: TAG, conds: {} };
for (const cond of CONDS) {
  const backs = [];
  result.conds[cond] = backs;
  let page;
  let hrefs = [];
  const perPage = cond === 'fresh' || cond === 'noload';
  for (let k = 1; k <= RUNS; k++) {
    try {
      if (perPage || !page || (await page.evaluate(() => location.pathname)) !== '/portfolio/') {
        await page?.close().catch(() => {});
        ({ page, hrefs } = await openList(cond !== 'noload'));
      }
      const href = pick(hrefs, k);
      if (!href) throw new Error(`no card (cards=${hrefs.length})`);
      const b = { k, ...(await oneBack(page, href, cond)) };
      backs.push(b);
      const v = b.vs[0];
      const sig = look(b);
      b.look = sig;
      const f = (i, key) => fr(v?.f?.[i]?.[key] ?? null);
      console.log(
        `B ${vpTag} ${TAG} ${cond} k=${k} href=${href.split('/')[2].slice(0, 24)} y0=${b.y0} caseY=${b.caseY} calls=${b.vs.length} ready=${v?.ready ?? '-'} skipped=${v?.skipped ?? '-'} T=${v?.T ?? '-'} img0=${f(0, 'img')} img50=${f(2, 'img')} img100=${f(4, 'img')} tit0=${f(0, 'tit')} tit100=${f(4, 'tit')} newImg=${v?.newImg ?? '-'} names=${v?.f?.[0]?.names?.join('+') ?? '-'} rest=${b.rest} cls=${b.cls}`,
      );
    } catch (e) {
      errors.push(`${cond} k=${k}: ${String(e.message).slice(0, 160)}`);
    }
    if (perPage) {
      await page?.close().catch(() => {});
      page = undefined;
    }
  }
  await page?.close().catch(() => {});
  const looks = new Map();
  for (const b of backs) looks.set(b.look, (looks.get(b.look) || 0) + 1);
  console.log(
    `LOOK ${vpTag} ${TAG} ${cond} backs=${backs.length} distinct=${looks.size} footer=${backs.filter((b) => b.cls === 'FOOTER').length}`,
  );
  for (const [s, n] of looks) console.log(`LOOK ${vpTag} ${TAG} ${cond} n=${n} ${s}`);
}
await browser.close();
server.close();
errors.push(...safe.finish().problems.map((p) => `prod-safe: ${p}`));
result.errors = errors;
await fs.writeFile(path.join(OUT, `cond-${vpTag}-${TAG}.json`), JSON.stringify(result));
for (const e of errors) console.log(`ERROR ${e}`);
const measured = errors.length === 0 && CONDS.every((c) => result.conds[c].length === RUNS);
console.log(`COND ${vpTag} ${TAG} measured=${measured} errors=${errors.length}`);
process.exit(measured ? 0 : 2);
