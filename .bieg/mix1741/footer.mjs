#!/usr/bin/env node
/**
 * MIX-1741: "back from a case study sometimes lands on the footer".
 *
 *   node .bieg/mix1741/footer.mjs <dist-dir> <out-dir>
 *   env FOOT_VP=375|1280, FOOT_RUNS (backs, default 20), FOOT_CASE=back|toggle, FOOT_TAG (label in the lines)
 *
 * Server, Sanity proxy and prod-safe as .bieg/mix1711/smooth.mjs. One page per width; all cards are loaded first
 * (the list scrolled to its end), then per run:
 *   back:   card k (cycle from the LAST card, then the others; the owner's video: PickMe = last card, FBX), centred,
 *           y0 = scrollY, tap (375, touch) or click (1280), 1200/2000 ms on the case study (alternating), page.goBack(),
 *           scrollY sampled on every frame for 2500 ms on the list;
 *   toggle: no navigation: the list at card k (y0), html[data-vt] set for 2 frames and removed (exactly what the end
 *           of the back transition does, components/common/caseStudyTransitions.css), then sampled 1500 ms.
 * Rest classes: FOOTER = <footer> visible and the card not on screen; OK = |rest - y0| <= 4 px and the card on screen;
 * OTHER = anything else. Also: grid height before/after (content-visibility:auto, contain-intrinsic-size) and
 * whether the card image is skipped (checkVisibility contentVisibilityAuto).
 * Lines: RUN <vp> <tag> <case> k=<n> href=... y0= rest= cls= gridBefore= gridAfter= skipped= minY= maxY=,
 *        SUMMARY <vp> <tag> <case> runs= ok= footer= other=.
 * Exit (fail-closed): 0 = every run measured, 0 FOOTER and 0 OTHER; 1 = measured, >= 1 FOOTER or OTHER;
 * 2 = a run not measured or a probe error.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { createProdSafe } from '../../scripts/lib/prod-safe.mjs';

const [srcArg, outArg] = process.argv.slice(2);
if (!srcArg || !outArg) {
  console.error('usage: footer.mjs <dist-dir> <out-dir>');
  process.exit(2);
}
const OUT = path.resolve(outArg);
await fs.mkdir(OUT, { recursive: true });
const RUNS = Number(process.env.FOOT_RUNS || 20);
const CASE = process.env.FOOT_CASE || 'back';
const TAG = process.env.FOOT_TAG || 'x';
if (!['back', 'toggle'].includes(CASE) || !(RUNS >= 1)) {
  console.error(`FOOT_CASE must be back|toggle, FOOT_RUNS >= 1 (got ${CASE}, ${RUNS})`);
  process.exit(2);
}
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
    const body = cloneSnapshot(file, await fs.readFile(file));
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
/**
 * FOOT_CLONES=N: the case-study LIST answer (query `_type == "caseStudy"` without a slug filter) gets N copies of its
 * items in front (unique _id and slug), so the real cards are the last ones and the list is as tall at 1280 as at 375
 * (9 real cards = 3 rows at 1280, too short for the bug). Case-study pages (slug filter) are untouched.
 */
const CLONES = Number(process.env.FOOT_CLONES || 0);
let clonedAnswers = 0;
/**
 * The list on /portfolio/ comes from the CMS snapshot in the prerendered HTML (hooks/useCmsDocument.ts, no Sanity
 * request): with FOOT_CLONES the entry `caseStudyList|list` of <script id="cms-snapshot"> gets the same copies in front.
 */
function cloneSnapshot(file, body) {
  if (!(CLONES > 0) || !file.endsWith('.html')) return body;
  const html = body.toString('utf8');
  const re = /(<script type="application\/json" id="cms-snapshot">)([\s\S]*?)(<\/script>)/;
  const m = re.exec(html);
  if (!m) return body;
  try {
    const snap = JSON.parse(m[2]);
    const real = snap['caseStudyList|list'];
    if (!Array.isArray(real) || !real.length || !real.every((x) => x && x.slug)) return body;
    snap['caseStudyList|list'] = withCopies(real);
    clonedAnswers += 1;
    const json = JSON.stringify(snap).replace(/</g, '\\u003c'); // U+2028/2029 are valid in JSON and in a script since ES2019
    return Buffer.from(html.replace(re, () => `${m[1]}${json}${m[3]}`));
  } catch {
    return body;
  }
}
function withCopies(real) {
  const copies = [];
  for (let i = 1; copies.length < CLONES; i++)
    for (const x of real) if (copies.length < CLONES) copies.push({ ...x, _id: `${x._id}-kopia-${i}`, slug: `${x.slug}-kopia-${i}` });
  return [...copies, ...real];
}
function withClones(url, body) {
  if (!(CLONES > 0)) return body;
  let q = '';
  try {
    q = new URL(url).searchParams.get('query') || '';
  } catch {
    return body;
  }
  if (!q.includes('_type == "caseStudy"') || q.includes('slug.current ==') || !q.includes('order(date desc)')) return body;
  try {
    const json = JSON.parse(body.toString('utf8'));
    if (!Array.isArray(json.result) || !json.result.length || !json.result.every((x) => x && x.slug)) return body;
    const real = json.result;
    json.result = withCopies(real);
    clonedAnswers += 1;
    return Buffer.from(JSON.stringify(json));
  } catch {
    return body;
  }
}
async function proxySanity(req) {
  try {
    const res = await fetch(req.url(), { headers: { accept: 'application/json' } });
    const body = withClones(req.url(), Buffer.from(await res.arrayBuffer()));
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

// In-page: scrollY on every frame while armed (from the first popstate or from __arm()).
const INSTRUMENT = () => {
  const m = { armed: false, ys: [] };
  window.__f = m;
  const tick = () => {
    if (m.armed) m.ys.push(Math.round(scrollY));
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  window.__arm = () => {
    m.ys = [];
    m.armed = true;
  };
  window.__disarm = () => {
    m.armed = false;
    return m.ys;
  };
};

const VPS = {
  375: { width: 375, height: 800, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
  1280: { width: 1280, height: 800, deviceScaleFactor: 1 },
};
const vpTag = process.env.FOOT_VP || '375';
const vp = VPS[vpTag];
if (!vp) {
  console.error(`FOOT_VP must be 375 or 1280 (got ${vpTag})`);
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

const rows = [];
let page = await openPage();
let hrefs = [];
try {
  hrefs = await loadAll(page);
} catch (e) {
  errors.push(`load: ${String(e.message).slice(0, 160)}`);
}
console.log(`CARDS ${vpTag} ${TAG} n=${hrefs.length} clones=${CLONES} clonedAnswers=${clonedAnswers} last=${hrefs.at(-1) ?? '-'}`);
// order: last, second to last, then from the end backwards (cards near the footer first), cyclic
const order = hrefs.slice().reverse();
for (let k = 1; k <= RUNS && order.length; k++) {
  const href = order[(k - 1) % Math.min(order.length, 4)];
  try {
    if ((await page.evaluate(() => location.pathname)) !== '/portfolio/') {
      await page.close().catch(() => {});
      page = await openPage();
      await loadAll(page);
    }
    await centre(page, href);
    const before = await listState(page, href);
    const y0 = before.y;
    if (CASE === 'toggle') {
      await page.evaluate(() => window.__arm());
      await page.evaluate(
        () =>
          new Promise((res) => {
            document.documentElement.setAttribute('data-vt', 'realizacja-powrot');
            requestAnimationFrame(() =>
              requestAnimationFrame(() => {
                document.documentElement.removeAttribute('data-vt');
                res();
              }),
            );
          }),
      );
      await sleep(1500);
    } else {
      const box = await page.evaluate((h) => {
        const a = document.querySelector(`a[href="${h}"]`);
        const r = (a.closest('.group') || a).getBoundingClientRect();
        return { x: r.x + r.width / 2, y: Math.min(Math.max(r.y + r.height / 2, 120), innerHeight - 120) };
      }, href);
      if (vp.hasTouch) await page.touchscreen.tap(box.x, box.y);
      else await page.mouse.click(box.x, box.y);
      await page.waitForFunction((h) => location.pathname === h, { timeout: 10000 }, href);
      await sleep(k % 2 ? 1200 : 2000);
      await page.evaluate(() => window.__arm());
      await page.goBack({ waitUntil: 'load' }).catch(() => {});
      await page.waitForFunction(() => location.pathname === '/portfolio/', { timeout: 10000 });
      await sleep(2500);
    }
    const ys = await page.evaluate(() => window.__disarm());
    const after = await listState(page, href);
    const cls = classify(after, y0);
    const row = {
      k,
      href,
      y0,
      rest: after.y,
      cls,
      gridBefore: before.grid,
      gridAfter: after.grid,
      skipped: after.skipped,
      footerTop: after.footerTop,
      cardTop: after.cardTop,
      docH: `${before.docH}->${after.docH}`,
      minY: ys.length ? Math.min(...ys) : null,
      maxY: ys.length ? Math.max(...ys) : null,
      frames: ys.length,
    };
    rows.push(row);
    console.log(
      `RUN ${vpTag} ${TAG} ${CASE} k=${k} href=${href} y0=${y0} rest=${row.rest} cls=${cls} gridBefore=${row.gridBefore} gridAfter=${row.gridAfter} skipped=${row.skipped} cardTop=${row.cardTop} footerTop=${row.footerTop} docH=${row.docH} minY=${row.minY} maxY=${row.maxY} frames=${row.frames}`,
    );
    if (cls !== 'OK') await page.screenshot({ path: path.join(OUT, `${TAG}-${vpTag}-${CASE}-k${k}.png`) }).catch(() => {});
  } catch (e) {
    errors.push(`run ${k}: ${String(e.message).slice(0, 160)}`);
  }
}
await browser.close();
server.close();
errors.push(...safe.finish().problems.map((p) => `prod-safe: ${p}`));
await fs.writeFile(path.join(OUT, `footer-${TAG}-${vpTag}-${CASE}.json`), JSON.stringify({ rows, errors }, null, 2));
const n = (c) => rows.filter((r) => r.cls === c).length;
for (const e of errors) console.log(`ERROR ${e}`);
const measured = rows.length === RUNS && errors.length === 0;
console.log(
  `SUMMARY ${vpTag} ${TAG} ${CASE} runs=${rows.length}/${RUNS} ok=${n('OK')} footer=${n('FOOTER')} other=${n('OTHER')} errors=${errors.length}`,
);
process.exit(!measured ? 2 : n('OK') === RUNS ? 0 : 1);
