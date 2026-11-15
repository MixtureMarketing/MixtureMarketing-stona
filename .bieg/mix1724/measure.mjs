#!/usr/bin/env node
/**
 * MIX-1724 (from MIX-1722): card ratio vs hero ratio, switch ON or OFF at 375x812, 768x1024, 1280x800, 1920x1080.
 *   node .bieg/mix1724/measure.mjs <dist-dir> <out-dir> <on|off>      (dist built with VITE_MM_VIEW_TRANSITIONS=1 for on, unset for off)
 * Per width: every list card frame (img.parentElement) w/h, the hero frame w/h (first card's case study),
 * the img src crop params of both (same rect = same crop box), layout shift during the list load.
 * Pass: all card ratios and the hero ratio within 1.7778 +-0.01 AND the card and hero crop box are the same (sameCropBox). Exit 0 pass, 1 criterion fails, 2 not measured.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { createProdSafe } from '../../scripts/lib/prod-safe.mjs';

const [srcArg, outArg, modeArg] = process.argv.slice(2);
if (!srcArg || !outArg || !['on', 'off'].includes(modeArg)) {
  console.error('usage: measure.mjs <dist-dir> <out-dir> <on|off>');
  process.exit(2);
}
const OUT = path.resolve(outArg);
await fs.mkdir(OUT, { recursive: true });
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' };
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
    await req.respond({ status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json', 'access-control-allow-origin': req.headers().origin || '*' }, body });
  } catch {
    req.abort().catch(() => {});
  }
}
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36';
const VPS = [
  { width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
  { width: 768, height: 1024, deviceScaleFactor: 1 },
  { width: 1280, height: 800, deviceScaleFactor: 1 },
  { width: 1920, height: 1080, deviceScaleFactor: 1 },
];
const TARGET = 16 / 9;
const TOL = 0.01;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
safe.watchBrowser(browser);
const rows = [];
let bad = 0;
let unmeasured = 0;
const crop = (src) => {
  const u = new URL(src, 'http://x');
  const p = u.searchParams;
  return { path: u.pathname.split('/').pop(), rect: p.get('rect'), crop: p.get('crop'), fit: p.get('fit'), w: p.get('w'), h: p.get('h') };
};
try {
  for (const vp of VPS) {
    const page = await browser.newPage();
    await page.setViewport(vp);
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    await page.evaluateOnNewDocument(() => {
      window.__cls = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
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
    try {
      await page.goto(ORIGIN + '/portfolio/', { waitUntil: 'networkidle2', timeout: 45000 });
      await page.waitForSelector('.vt-lista img', { timeout: 20000 });
      await sleep(1500);
      const list = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('.vt-lista img')]
          .filter((i) => i.getAttribute('aria-hidden') !== 'true')
          .map((i) => {
            const f = i.parentElement.getBoundingClientRect();
            const a = i.closest('a') || i.closest('div').parentElement.querySelector('a[href^="/portfolio/"]');
            return { w: f.width, h: f.height, ratio: f.width / f.height, attr: i.getAttribute('width') + 'x' + i.getAttribute('height'), ar: getComputedStyle(i.parentElement).aspectRatio, src: i.currentSrc || i.src, href: a && a.getAttribute('href') };
          });
        return { cards, cls: window.__cls };
      });
      const first = list.cards.find((c) => c.href) || {};
      let hero = null;
      if (first.href) {
        await page.goto(ORIGIN + first.href, { waitUntil: 'networkidle2', timeout: 45000 });
        // Stable hook: the hero photo is the non-SVG image whose alt equals the page H1 (the case-study title).
        // Never "the first img" (the nav logo is an SVG). Not found = unmeasured (exit 2).
        const pick = () => {
          const h1 = document.querySelector('h1');
          const t = h1 && h1.textContent.trim();
          return t ? [...document.images].find((x) => x.alt.trim() === t && !/\.svg(\?|$)/i.test(x.currentSrc || x.src)) || null : null;
        };
        await page.waitForFunction(`(${pick.toString()})() !== null`, { timeout: 20000 });
        await sleep(1200);
        hero = await page.evaluate(`(() => { const pick = ${pick.toString()}; const i = pick(); if (!i) return null;
          const f = i.parentElement.getBoundingClientRect(); const cs = getComputedStyle(i.parentElement);
          return { w: f.width, h: f.height, ratio: f.width / f.height, attr: i.getAttribute('width') + 'x' + i.getAttribute('height'), ar: cs.aspectRatio, maxH: cs.maxHeight, src: i.currentSrc || i.src }; })()`);
        // Instrument check: a hero that is an SVG (logo) or missing means the measure is wrong, not the product.
        if (!hero || /\.svg(\?|$)/i.test(hero.src)) throw new Error('INSTRUMENT: hero not found or is an SVG: ' + (hero && hero.src));
      }
      const ratios = list.cards.map((c) => c.ratio);
      const cardMin = Math.min(...ratios);
      const cardMax = Math.max(...ratios);
      const okCard = ratios.length > 0 && Math.abs(cardMin - TARGET) <= TOL && Math.abs(cardMax - TARGET) <= TOL;
      const okHero = !!hero && Math.abs(hero.ratio - TARGET) <= TOL;
      const sameCrop = first.src && hero ? JSON.stringify({ ...crop(first.src), w: 0, h: 0 }) === JSON.stringify({ ...crop(hero.src), w: 0, h: 0 }) : false;
      if (!okCard || !okHero || !sameCrop) bad++;
      const layout = await page.evaluate(() => document.querySelector('header[data-hero-layout]')?.getAttribute('data-hero-layout') || 'classic');
      if ((modeArg === 'on') !== (layout === 'photo-top')) { bad++; console.log('LAYOUT MISMATCH mode=' + modeArg + ' layout=' + layout); }
      rows.push({ mode: modeArg, vp: `${vp.width}x${vp.height}`, cards: ratios.length, cardMin: +cardMin.toFixed(4), cardMax: +cardMax.toFixed(4), cardW: Math.round(list.cards[0]?.w), cardH: Math.round(list.cards[0]?.h), cardAttr: first.attr, cardAspectRatio: first.ar, heroRatio: hero && +hero.ratio.toFixed(4), heroW: hero && Math.round(hero.w), heroH: hero && Math.round(hero.h), heroMaxH: hero && hero.maxH, heroAttr: hero && hero.attr, listCLS: +list.cls.toFixed(4), cardCrop: crop(first.src || 'http://x/'), heroCrop: hero && crop(hero.src), sameCropBox: sameCrop, okCard, okHero });
      console.log(`${modeArg.toUpperCase()} VP ${vp.width}x${vp.height} cards=${ratios.length} card=${cardMin.toFixed(4)}..${cardMax.toFixed(4)} (${okCard ? 'OK' : 'NIE'}) hero=${hero ? hero.ratio.toFixed(4) : 'none'} ${hero ? Math.round(hero.w) + 'x' + Math.round(hero.h) : ''} maxH=${hero?.maxH} (${okHero ? 'OK' : 'NIE'}) cls=${list.cls.toFixed(4)} sameCropBox=${sameCrop}`);
    } catch (e) {
      unmeasured++;
      console.log(`${modeArg.toUpperCase()} VP ${vp.width}x${vp.height} ERROR ${String(e.message).slice(0, 160)}`);
    }
    await page.close();
  }
} finally {
  await browser.close().catch(() => {});
  server.close();
}
await fs.writeFile(path.join(OUT, 'measure-' + modeArg + '.json'), JSON.stringify(rows, null, 1));
console.log(`MEASURE viewports=${rows.length} fail=${bad} unmeasured=${unmeasured}`);
process.exit(unmeasured || rows.length !== VPS.length ? 2 : bad ? 1 : 0);
