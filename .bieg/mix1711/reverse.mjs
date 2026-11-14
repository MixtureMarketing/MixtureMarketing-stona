#!/usr/bin/env node
/**
 * MIX-1711 r2: BACK = ENTER played backwards, frame by frame (Jakub, MIX-1311 14.11 21:38).
 *
 *   node .bieg/mix1711/reverse.mjs <dist-dir> <out-dir>      env: REV_VP=1280|375
 *
 * Server, Sanity proxy and prod-safe as in smooth.mjs. One page: list, card 2 centred, hover 1200 ms, click = ENTER;
 * at view transition `ready` every ::view-transition-* animation is paused; for k = 0..10 currentTime = k*T/10 on
 * all of them (T = longest delay+duration), two frames, then per animated name the computed style of
 * group/old/new (rect x,y = group translate, w,h = width/height; opacity) and a screenshot; then finish(). Same for
 * BACK (one page.goBack()). A second page records a real-time CDP screencast of ENTER and BACK (video).
 *
 * Pairing (time reversal): BACK at step k is compared with ENTER at step 10-k. group(n) ~ group(n); the BACK old
 * snapshot is the state ENTER ends in, so old(n)_BACK ~ new(n)_ENTER and new(n)_BACK ~ old(n)_ENTER.
 * Pass: same set of animated names; same set of paired pseudo-elements; every step |drect| <= 4 px and
 * |dopacity| <= 0.05; |T_ENTER - T_BACK| <= 20 ms.
 * Output: STEP / REV / REVSUM lines, out/strip-<vp>.png (ENTER left k=0..10, BACK right k=10..0), out/video-<vp>.webm,
 * out/reverse-<vp>.json. Exit 0 = measured, criteria pass and both artifacts written; 1 = measured, a criterion
 * fails; 2 = not measured / probe error / artifact missing (fail-closed).
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { createProdSafe } from '../../scripts/lib/prod-safe.mjs';

const [srcArg, outArg] = process.argv.slice(2);
if (!srcArg || !outArg) {
  console.error('usage: reverse.mjs <dist-dir> <out-dir>');
  process.exit(2);
}
const OUT = path.resolve(outArg);
await fs.mkdir(path.join(OUT, 'frames'), { recursive: true });
const STEPS = 10;
const MAX_PX = 4;
const MAX_OP = 0.05;
const MAX_DT = 20;
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

// In-page instrument (before the app): count transitions; in pause mode pause every view-transition animation at
// `ready`; __step(k) seeks all of them to k*T/10 and returns the computed geometry of every animated pseudo-element.
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
  window.__vtAnims = vtAnims;
  const orig = Document.prototype.startViewTransition;
  if (!orig) return;
  Document.prototype.startViewTransition = function (cb) {
    // old-state title (named realizacja-tytul when the transition starts): its scroll offset when the old
    // snapshot is taken (start of the update callback); a line-clamp title scrolled by focus shows another line
    const oldTitle = [...document.querySelectorAll('[style*="view-transition-name"]')].find(
      (e) => getComputedStyle(e).viewTransitionName === 'realizacja-tytul',
    );
    vt.titleScroll = null;
    const t = orig.call(this, async () => {
      if (oldTitle) vt.titleScroll = [oldTitle.scrollTop, oldTitle.scrollLeft];
      return cb();
    });
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
    const an = vtAnims();
    an.forEach((a) => (a.currentTime = (k * vt.T) / steps));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const pseudos = new Set(an.map((a) => String(a.effect.pseudoElement)));
    const names = [
      ...new Set([...pseudos].map((p) => /\(([^)]+)\)/.exec(p)?.[1]).filter(Boolean)),
    ].sort();
    const num = (v) => (v === 'auto' || v === '' ? NaN : parseFloat(v));
    // 2D matrix of a computed style about its transform-origin: point -> point (scale of a hovered card included)
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
    // visual bounding box of the pseudo-element: own box through its own matrix, then through the group matrix
    // (old/new sit at 0,0 inside the group)
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
      return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y, sw: w, sh: h };
    };
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
          tf: cs.transform,
          op: Number(cs.opacity),
          fit: part === 'group' ? cs.overflow : cs.objectFit,
          ease: cs.animationTimingFunction,
        };
      }
    }
    return { names, rec: out };
  };
  window.__finishVt = () => vtAnims().forEach((a) => a.finish());
};

const VPS = {
  375: { width: 375, height: 800, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
  1280: { width: 1280, height: 800, deviceScaleFactor: 1 },
};
const vpTag = process.env.REV_VP || '1280';
const vp = VPS[vpTag];
if (!vp) {
  console.error(`REV_VP must be 375 or 1280 (got ${vpTag})`);
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

/** List page, card 2 centred and hovered; returns the click point and the case-study path. */
async function prepare(page) {
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
    return {
      x: r.x + r.width / 2,
      y: Math.min(Math.max(r.y + r.height / 2, 120), innerHeight - 120),
    };
  });
  await page.mouse.move(box.x, box.y);
  await sleep(1200);
  return { href, box };
}

/** Paused stepping of the transition just started; screenshots into frames/<vp>-<dir>-<k>.png. */
async function stepAll(page, dir) {
  await page.waitForFunction(
    () => window.__vt.paused || window.__vt.skipped || window.__vt.readyErr,
    {
      timeout: 10000,
    },
  );
  const st = await page.evaluate(() => ({ ...window.__vt }));
  if (!st.paused)
    throw new Error(
      `${dir}: transition not paused (skipped=${st.skipped} readyErr=${st.readyErr})`,
    );
  const steps = [];
  for (let k = 0; k <= STEPS; k++) {
    const r = await page.evaluate((kk, n) => window.__step(kk, n), k, STEPS);
    const file = path.join(OUT, 'frames', `${vpTag}-${dir}-${String(k).padStart(2, '0')}.png`);
    await page.screenshot({ path: file, type: 'png' });
    steps.push({ k, ...r, file });
  }
  await page.evaluate(() => window.__finishVt());
  await page.waitForFunction(() => window.__vt.finished, { timeout: 10000 });
  return { T: st.T, calls: st.calls, titleScroll: st.titleScroll, steps };
}

async function measure() {
  const page = await openPage();
  try {
    const { href, box } = await prepare(page);
    await page.evaluate(() => {
      window.__vt.pause = true;
      window.__vt.calls = 0;
    });
    await page.mouse.click(box.x, box.y);
    const enter = await stepAll(page, 'E');
    await page.waitForFunction((h) => location.pathname === h, { timeout: 10000 }, href);
    await sleep(2000);
    await page.evaluate(() => (window.__vt.calls = 0));
    await page.goBack({ waitUntil: 'load' }).catch(() => {});
    const back = await stepAll(page, 'B');
    await page.waitForFunction(() => location.pathname === '/portfolio/', { timeout: 10000 });
    await sleep(500);
    back.calls = await page.evaluate(() => window.__vt.calls);
    return { href, enter, back };
  } finally {
    await page.close().catch(() => {});
  }
}

/** Real-time screencast (CDP) of ENTER and BACK; returns frames with wall timestamps and both trigger times. */
async function screencast() {
  const page = await openPage();
  const frames = [];
  const cdp = await page.createCDPSession();
  try {
    const { href, box } = await prepare(page);
    cdp.on('Page.screencastFrame', (f) => {
      frames.push({ ts: f.metadata.timestamp, data: f.data });
      cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    });
    const scale = vp.width > 800 ? 0.5 : 1;
    await cdp.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 70,
      maxWidth: Math.round(vp.width * scale),
      maxHeight: Math.round(vp.height * scale),
      everyNthFrame: 1,
    });
    await sleep(400);
    const tEnter = Date.now() / 1000;
    await page.mouse.click(box.x, box.y);
    await page.waitForFunction((h) => location.pathname === h, { timeout: 10000 }, href);
    await sleep(1800);
    const tBack = Date.now() / 1000;
    await page.goBack({ waitUntil: 'load' }).catch(() => {});
    await page.waitForFunction(() => location.pathname === '/portfolio/', { timeout: 10000 });
    await sleep(1500);
    await cdp.send('Page.stopScreencast').catch(() => {});
    return {
      frames,
      tEnter,
      tBack,
      w: Math.round(vp.width * scale),
      h: Math.round(vp.height * scale),
    };
  } finally {
    await cdp.detach().catch(() => {});
    await page.close().catch(() => {});
  }
}

/** WebM from screencast frames, encoded in the browser (canvas + MediaRecorder): each direction at 1x, then 0.25x. */
async function encodeVideo(sc) {
  const segs = [];
  for (const [label, t0] of [
    ['ENTER', sc.tEnter],
    ['BACK', sc.tBack],
  ]) {
    const fr = sc.frames.filter((f) => f.ts >= t0 - 0.2 && f.ts <= t0 + 1.2);
    if (fr.length < 3) throw new Error(`video: ${label} has ${fr.length} screencast frames`);
    segs.push({ label, fr });
  }
  const page = await browser.newPage();
  await safe.protect(page, { userAgent: UA, handler: (req) => req.abort().catch(() => {}) });
  try {
    await page.goto('about:blank');
    await page.bringToFront();
    const plan = [];
    for (const speed of [1, 0.25])
      for (const s of segs)
        plan.push({
          label: `${s.label} ${speed === 1 ? '1x' : '0.25x'} (${vpTag})`,
          frames: s.fr.map((f, i) => ({
            data: f.data,
            hold: Math.max(16, ((s.fr[i + 1]?.ts ?? f.ts + 0.3) - f.ts) * 1000) / speed,
          })),
        });
    const b64 = await page.evaluate(
      async (plan, w, h) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h + 24;
        document.body.appendChild(c);
        const ctx = c.getContext('2d');
        const rec = new MediaRecorder(c.captureStream(30), {
          mimeType: 'video/webm;codecs=vp8',
          videoBitsPerSecond: 1500000,
        });
        const chunks = [];
        rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
        const bitmap = async (d) =>
          createImageBitmap(await (await fetch(`data:image/jpeg;base64,${d}`)).blob());
        rec.start(100);
        for (const seg of plan) {
          for (const f of seg.frames) {
            const img = await bitmap(f.data);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, c.width, c.height);
            ctx.drawImage(img, 0, 24, w, h);
            ctx.fillStyle = '#fff';
            ctx.font = '16px sans-serif';
            ctx.fillText(seg.label, 6, 18);
            await new Promise((r) => setTimeout(r, f.hold));
          }
        }
        await new Promise((r) => setTimeout(r, 300));
        const stopped = new Promise((r) => (rec.onstop = r));
        rec.stop();
        await stopped;
        const buf = new Uint8Array(await new Blob(chunks, { type: 'video/webm' }).arrayBuffer());
        let s = '';
        for (let i = 0; i < buf.length; i += 0x8000)
          s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
        return btoa(s);
      },
      plan,
      sc.w,
      sc.h,
    );
    const buf = Buffer.from(b64, 'base64');
    if (buf.length < 2000) throw new Error(`video: webm only ${buf.length} bytes`);
    const file = path.join(OUT, `video-${vpTag}.webm`);
    await fs.writeFile(file, buf);
    return {
      file,
      bytes: buf.length,
      frames: segs.map((s) => `${s.label}=${s.fr.length}`).join(' '),
    };
  } finally {
    await page.close().catch(() => {});
  }
}

/** PNG strip: row i = ENTER k=i (left) | BACK k=10-i (right), labels on top of each frame. */
async function buildStrip(E, B) {
  const scale = vp.width > 800 ? 0.25 : 0.4;
  const w = Math.round(vp.width * scale);
  const h = Math.round(vp.height * scale);
  const lab = 16;
  const gap = 6;
  const W = 2 * w + gap;
  const H = (STEPS + 1) * (h + lab);
  const parts = [];
  const pix = [];
  for (let i = 0; i <= STEPS; i++) {
    const e = await sharp(E.steps[i].file).resize(w, h).png().toBuffer();
    const b = await sharp(B.steps[STEPS - i].file)
      .resize(w, h)
      .png()
      .toBuffer();
    const y = i * (h + lab);
    const svg = Buffer.from(
      `<svg width="${W}" height="${lab}"><rect width="100%" height="100%" fill="#000"/><text x="4" y="12" font-size="11" fill="#fff" font-family="sans-serif">ENTER k=${i}  t=${Math.round((i * E.T) / STEPS)} ms</text><text x="${w + gap + 4}" y="12" font-size="11" fill="#fff" font-family="sans-serif">BACK k=${STEPS - i}  t=${Math.round(((STEPS - i) * B.T) / STEPS)} ms</text></svg>`,
    );
    parts.push(
      { input: svg, left: 0, top: y },
      { input: e, left: 0, top: y + lab },
      { input: b, left: w + gap, top: y + lab },
    );
    // informational: mean absolute grey difference of the two frames (0..255), not a pass criterion
    const [ge, gb] = await Promise.all(
      [E.steps[i].file, B.steps[STEPS - i].file].map((f) =>
        sharp(f).resize(160).greyscale().raw().toBuffer(),
      ),
    );
    let s = 0;
    for (let j = 0; j < ge.length; j++) s += Math.abs(ge[j] - gb[j]);
    pix.push(Math.round((s / ge.length) * 10) / 10);
  }
  const file = path.join(OUT, `strip-${vpTag}.png`);
  await sharp({ create: { width: W, height: H, channels: 3, background: '#222' } })
    .composite(parts)
    .png({ palette: true, compressionLevel: 9 })
    .toFile(file);
  return { file, pix };
}

const PAIR = { group: 'group', old: 'new', new: 'old' };
function compare(E, B) {
  const fails = [];
  const namesE = [...new Set(E.steps.flatMap((s) => s.names))].sort();
  const namesB = [...new Set(B.steps.flatMap((s) => s.names))].sort();
  if (namesE.join() !== namesB.join()) fails.push(`names ENTER [${namesE}] != BACK [${namesB}]`);
  if (Math.abs(E.T - B.T) > MAX_DT) fails.push(`T ENTER ${E.T} vs BACK ${B.T}`);
  const keysB = Object.keys(B.steps[0].rec);
  const keysE = Object.keys(E.steps[0].rec);
  const rows = [];
  const pairedE = new Set();
  for (const kb of keysB) {
    const [, part, n] = /^(\w+)\((.+)\)$/.exec(kb);
    const ke = `${PAIR[part]}(${n})`;
    pairedE.add(ke);
    if (!keysE.includes(ke)) {
      fails.push(`BACK ${kb} has no ENTER ${ke}`);
      continue;
    }
    let dpx = 0;
    let dpxK = 0;
    let dop = 0;
    let dopK = 0;
    let bad = false;
    for (let k = 0; k <= STEPS; k++) {
      const b = B.steps[k].rec[kb];
      const e = E.steps[STEPS - k].rec[ke];
      if (!b || !e) {
        bad = true;
        continue;
      }
      const d = Math.max(
        Math.abs(b.x - e.x),
        Math.abs(b.y - e.y),
        Math.abs(b.w - e.w),
        Math.abs(b.h - e.h),
      );
      const o = Math.abs(b.op - e.op);
      if (!Number.isFinite(d) || !Number.isFinite(o)) bad = true;
      if (!(d <= dpx)) [dpx, dpxK] = [d, k];
      if (!(o <= dop)) [dop, dopK] = [o, k];
    }
    if (bad) fails.push(`${kb}: missing or unreadable step`);
    const ok = !bad && dpx <= MAX_PX && dop <= MAX_OP;
    if (!ok && !bad)
      fails.push(
        `${kb}~${ke}: dpx ${dpx.toFixed(1)} (k=${dpxK}) dop ${dop.toFixed(3)} (k=${dopK})`,
      );
    rows.push({
      kb,
      ke,
      dpx,
      dpxK,
      dop,
      dopK,
      ok,
      easeB: B.steps[0].rec[kb].ease,
      easeE: E.steps[0].rec[ke].ease,
      fitB: B.steps[0].rec[kb].fit,
      fitE: E.steps[0].rec[ke].fit,
    });
  }
  for (const ke of keysE) if (!pairedE.has(ke)) fails.push(`ENTER ${ke} has no BACK pair`);
  return { namesE, namesB, rows, fails };
}

let result = null;
let strip = null;
let video = null;
try {
  const m = await measure();
  if (m.enter.calls !== 1 || m.back.calls !== 1)
    errors.push(`transitions ENTER ${m.enter.calls} BACK ${m.back.calls} (want 1/1)`);
  result = { href: m.href, T: { E: m.enter.T, B: m.back.T }, ...compare(m.enter, m.back) };
  result.titleScroll = { E: m.enter.titleScroll, B: m.back.titleScroll };
  // the old title snapshot must show the title as drawn on the list (scroll 0,0), else the frame differs
  for (const [d, s] of Object.entries(result.titleScroll))
    if (!Array.isArray(s) || s.some((v) => v !== 0))
      result.fails.push(`${d} old title scroll at snapshot ${JSON.stringify(s)} (want [0,0])`);
  for (const [dir, D] of [
    ['ENTER', m.enter],
    ['BACK', m.back],
  ])
    for (const s of D.steps) {
      const fmt = Object.entries(s.rec)
        .map(
          ([k, r]) =>
            `${k}=${[r.x, r.y, r.w, r.h].map((v) => Math.round(v)).join(',')}/${r.op.toFixed(2)}`,
        )
        .join(' ');
      console.log(`STEP ${vpTag} ${dir} k=${s.k} ${fmt}`);
    }
  strip = await buildStrip(m.enter, m.back);
  result.stepsE = m.enter.steps.map(({ file, ...s }) => s);
  result.stepsB = m.back.steps.map(({ file, ...s }) => s);
} catch (e) {
  errors.push(`measure: ${String(e.message).slice(0, 200)}`);
}
try {
  video = await encodeVideo(await screencast());
} catch (e) {
  errors.push(`video: ${String(e.message).slice(0, 200)}`);
}
await browser.close();
server.close();
errors.push(...safe.finish().problems.map((p) => `prod-safe: ${p}`));
await fs.writeFile(
  path.join(OUT, `reverse-${vpTag}.json`),
  JSON.stringify({ result, strip, video, errors }, null, 2),
);

if (result) {
  for (const r of result.rows)
    console.log(
      `REV ${vpTag} BACK ${r.kb} ~ ENTER ${r.ke}: max dpx=${r.dpx.toFixed(1)} (k=${r.dpxK}) max dop=${r.dop.toFixed(3)} (k=${r.dopK}) ease B=${r.easeB} E=${r.easeE} fit B=${r.fitB} E=${r.fitE} ${r.ok ? 'OK' : 'NO'}`,
    );
  console.log(
    `REV ${vpTag} names ENTER=[${result.namesE}] BACK=[${result.namesB}] T ENTER=${result.T.E} BACK=${result.T.B} titleScroll ENTER=${JSON.stringify(result.titleScroll.E)} BACK=${JSON.stringify(result.titleScroll.B)}`,
  );
  for (const f of result.fails) console.log(`FAIL ${vpTag} ${f}`);
}
if (strip)
  console.log(
    `STRIP ${vpTag} ${path.relative(process.cwd(), strip.file)} pixdiff(row 0..10, 0-255, info)=${strip.pix.join(',')}`,
  );
if (video)
  console.log(
    `VIDEO ${vpTag} ${path.relative(process.cwd(), video.file)} bytes=${video.bytes} frames ${video.frames}`,
  );
for (const e of errors) console.log(`ERROR ${e}`);
const measured = !!result && !!strip && !!video && errors.length === 0;
const pass = measured && result.fails.length === 0;
const maxDpx = result ? Math.max(0, ...result.rows.map((r) => r.dpx)) : NaN;
const maxDop = result ? Math.max(0, ...result.rows.map((r) => r.dop)) : NaN;
console.log(
  `REVSUM ${vpTag} measured=${measured} maxDpx=${maxDpx.toFixed(1)} maxDop=${maxDop.toFixed(3)} fails=${result ? result.fails.length : '-'} verdict=${pass ? 'PASS' : 'FAIL'}`,
);
process.exit(!measured ? 2 : pass ? 0 : 1);
