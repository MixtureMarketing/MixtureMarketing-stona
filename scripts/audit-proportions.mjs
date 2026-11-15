#!/usr/bin/env node
/**
 * MIX-1732 (from MIX-1724): 16:9 proportion gate in a real browser on the BUILT dist.
 *   node scripts/audit-proportions.mjs [dist-dir]      (npm run audit:proportions; default dist)
 * At 375x812 and 1280x800: every list card frame and the case-study hero frame are 16:9 (1.7778 +-0.01),
 * and the card and hero image request the same crop box, equal at both widths. Works for the build with the
 * view-transitions switch ON or OFF (the layout is read from the page and printed).
 * Fail-closed (Z3): hero not found, SVG/logo hero, 0 cards, page error, missing viewport = rc 2 or 1 with a
 * reason line "FAIL: ...". rc 0 = pass, 1 = criterion fails, 2 = could not measure. Decision logic: scripts/lib/proportions.mjs.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { createProdSafe } from './lib/prod-safe.mjs';
import { evaluate, applyPageErrors, exitCode } from './lib/proportions.mjs';

const DIST = path.resolve(process.argv[2] || 'dist');
const VPS = [
  {
    name: '375x812',
    width: 375,
    height: 812,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  },
  { name: '1280x800', width: 1280, height: 800, deviceScaleFactor: 1 },
];
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
const SANITY = /^https:\/\/([a-z0-9]+\.api\.sanity\.io|cdn\.sanity\.io)\//;
const SANITY_API = /^https:\/\/[a-z0-9]+\.api\.sanity\.io\//;
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fail(code, line) {
  console.log(`FAIL: ${line}`);
  process.exit(code);
}
try {
  await fs.access(path.join(DIST, 'index.html'));
} catch {
  fail(2, `dist not found or has no index.html: ${DIST} (build first)`);
}

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

// Stable hook: the hero photo is the non-SVG image whose alt equals the page H1. Never "the first img".
const pick = () => {
  const h1 = document.querySelector('h1');
  const t = h1 && h1.textContent.trim();
  return t
    ? [...document.images].find(
        (x) => x.alt.trim() === t && !/\.svg(\?|$)/i.test(x.currentSrc || x.src),
      ) || null
    : null;
};

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
safe.watchBrowser(browser);
const rows = [];
const layouts = new Set();
try {
  for (const vp of VPS) {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e.message).slice(0, 120)));
    await page.setViewport(vp);
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
    const row = { vp: vp.name, error: null, cardRatios: [], cardSrc: null, hero: null };
    try {
      await page.goto(ORIGIN + '/portfolio/', { waitUntil: 'networkidle2', timeout: 45000 });
      await page.waitForSelector('.vt-lista img', { timeout: 20000 });
      await sleep(1000);
      const cards = await page.evaluate(() =>
        [...document.querySelectorAll('.vt-lista img')]
          .filter((i) => i.getAttribute('aria-hidden') !== 'true')
          .map((i) => {
            const f = i.parentElement.getBoundingClientRect();
            const a =
              i.closest('a') ||
              i.closest('div').parentElement.querySelector('a[href^="/portfolio/"]');
            return {
              ratio: f.width / f.height,
              src: i.currentSrc || i.src,
              href: a && a.getAttribute('href'),
            };
          }),
      );
      row.cardRatios = cards.map((c) => c.ratio);
      const first = cards.find((c) => c.href);
      row.cardSrc = first ? first.src : null;
      if (first) {
        await page.goto(ORIGIN + first.href, { waitUntil: 'networkidle2', timeout: 45000 });
        try {
          await page.waitForFunction(`(${pick.toString()})() !== null`, { timeout: 20000 });
        } catch {
          /* hero stays null: reported as "hero not found" by evaluate */
        }
        await sleep(800);
        row.hero =
          await page.evaluate(`(() => { const i = (${pick.toString()})(); if (!i) return null;
          const f = i.parentElement.getBoundingClientRect(); return { ratio: f.width / f.height, src: i.currentSrc || i.src }; })()`);
        layouts.add(
          await page.evaluate(
            () =>
              document
                .querySelector('header[data-hero-layout]')
                ?.getAttribute('data-hero-layout') || 'classic',
          ),
        );
      } else if (cards.length) {
        row.error = 'cards found but none links to /portfolio/<slug> (hero not reachable)';
      }
      applyPageErrors(row, pageErrors);
    } catch (e) {
      row.error = `not measured: ${String(e.message).slice(0, 160)}`;
    }
    rows.push(row);
    console.log(
      `VP ${row.vp} cards=${row.cardRatios.length} card=${row.cardRatios.map((r) => r.toFixed(4)).join(',')} hero=${row.hero ? row.hero.ratio.toFixed(4) : 'none'}${row.error ? ' ERROR ' + row.error : ''}`,
    );
    await page.close();
  }
} finally {
  await browser.close().catch(() => {});
  server.close();
}
const reasons = evaluate(
  rows,
  VPS.map((v) => v.name),
);
// prod-safe verdict (analytics leak, unprotected page): a violation is a failure like any other.
const verdict = safe.finish();
if (!verdict.ok) reasons.push(`prod-safe: ${verdict.problems.join('; ')}`);
console.log(`layout=${[...layouts].join('+') || 'unknown'} (16:9 required in both layouts)`);
for (const r of reasons) console.log(`FAIL: ${r}`);
console.log(reasons.length ? `PROPORTIONS NIE: ${reasons.length} reason(s)` : 'PROPORTIONS OK');
process.exit(exitCode(reasons, rows, VPS.length));
