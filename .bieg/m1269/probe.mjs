#!/usr/bin/env node
/**
 * MIX-1269: próba strony głównej z buildu (wzór .bieg/m1892/probe.mjs: serwer statyczny na
 * localhost, ruch poza localhost abortowany, UA z dopiskiem MixtureE2E/1).
 *
 *   node .bieg/m1269/probe.mjs <dist> <out> on|off
 *
 * Z pliku <dist>/index.html (prerender, to widzi robot): title, meta description, canonical,
 * liczba H1, tekst H1, fraza w title i H1, JSON-LD (każdy blok JSON.parse), linki pasa lokalnego
 * i status 200 każdego z nich z tego samego serwera (plik <dist>/<adres>/index.html).
 * W przeglądarce (390 i 1366 px): CLS (layout-shift bez hadRecentInput, wczytanie + 3 s + przewinięcie
 * do pasa linków), axe wcag2a/aa (serious/critical na całej stronie i w H1/pasie), jeden H1 po hydratacji.
 * Progi (on): title ≤ 60 z frazą raz, meta ≤ 155, H1 = 1 z frazą raz, canonical https://mixturemarketing.pl/,
 * JSON-LD poprawny, 3–5 linków z kodem 200, CLS ≤ 0,1, axe 0 serious/critical.
 * Progi (off): fraza w H1 0 razy, CLS ≤ 0,1, axe 0 serious/critical.
 * Wynik: <out>/probe-<tryb>.json; kod 0 = progi spełnione, 1 = nie, 2 = złe wywołanie.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const [distArg, outArg, mode] = process.argv.slice(2);
if (!distArg || !outArg || !['on', 'off'].includes(mode)) {
  console.error('użycie: probe.mjs <dist> <out> on|off');
  process.exit(2);
}
const DIST = path.resolve(distArg);
const OUT = path.resolve(outArg);
await fs.mkdir(OUT, { recursive: true });
const AXE_JS = path.resolve('node_modules/axe-core/axe.min.js');
const PHRASE = 'agencja marketingowa rzeszów';
const count = (t) => (t || '').toLocaleLowerCase('pl-PL').split(PHRASE).length - 1;

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
};
/** Ścisły serwer: brak pliku = 404 (bez przekierowania na index.html), żeby status linku był prawdziwy. */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let file = path.join(DIST, decodeURIComponent(url.pathname));
  if (!file.startsWith(DIST)) return res.writeHead(403).end();
  try {
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const body = await fs.readFile(file);
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

const fails = [];
const check = (ok, msg) => {
  if (!ok) fails.push(msg);
};
const results = { mode };

// --- 1. HTML z prerenderu
const raw = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');
const pick = (re) => (raw.match(re) || [])[1] ?? null;
const decode = (s) =>
  s == null
    ? s
    : s
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;|&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
const titles = [...raw.matchAll(/<title[^>]*>([^<]*)<\/title>/g)].map((m) => decode(m[1]));
const title = titles[0] ?? null;
const description = decode(pick(/<meta[^>]*name="description"[^>]*content="([^"]*)"/));
const canonical = pick(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/);
const h1s = [...raw.matchAll(/<h1[\s>][\s\S]*?<\/h1>/g)].map((m) =>
  decode(m[0].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim(),
);
const ld = [...raw.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
const ldOk = ld.filter((m) => {
  try {
    JSON.parse(m[1]);
    return true;
  } catch {
    return false;
  }
}).length;
const bandMatch = raw.match(/Lokalnie · Rzeszów[\s\S]*?<div class="flex flex-wrap gap-2">([\s\S]*?)<\/div>/);
const bandLinks = bandMatch ? [...bandMatch[1].matchAll(/href="([^"]+)"/g)].map((m) => m[1]) : [];
const statuses = {};
for (const href of bandLinks) {
  const r = await fetch(ORIGIN + href, { redirect: 'manual' });
  statuses[href] = r.status;
}
results.html = {
  titles,
  titleLen: title?.length ?? null,
  titlePhrase: count(title),
  description,
  descriptionLen: description?.length ?? null,
  canonical,
  h1Count: h1s.length,
  h1: h1s,
  h1Phrase: h1s.reduce((a, t) => a + count(t), 0),
  jsonLd: ld.length,
  jsonLdValid: ldOk,
  bandLinks,
  statuses,
};
check(titles.length === 1, `title: ${titles.length} znaczników`);
check(h1s.length === 1, `H1: ${h1s.length}`);
check(canonical === 'https://mixturemarketing.pl/', `canonical ${canonical}`);
check(ld.length > 0 && ldOk === ld.length, `JSON-LD ${ldOk}/${ld.length}`);
if (mode === 'on') {
  check(title && title.length <= 60, `title ${title?.length} > 60`);
  check(count(title) === 1, `fraza w title ${count(title)}×`);
  check(description && description.length <= 155, `meta ${description?.length} > 155`);
  check(results.html.h1Phrase === 1, `fraza w H1 ${results.html.h1Phrase}×`);
  check(bandLinks.length >= 3 && bandLinks.length <= 5, `linków ${bandLinks.length}`);
} else {
  check(results.html.h1Phrase === 0, `off: fraza w H1 ${results.html.h1Phrase}×`);
}
for (const [h, s] of Object.entries(statuses)) check(s === 200, `link ${h}: ${s}`);

// --- 2. Przeglądarka: CLS, axe, H1 po hydratacji
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 MixtureE2E/1';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const axeSrc = await fs.readFile(AXE_JS, 'utf8');
results.browser = {};
for (const vp of [
  { name: 'm390', width: 390, height: 844, mobile: true },
  { name: 'd1366', width: 1366, height: 768, mobile: false },
]) {
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    deviceScaleFactor: 1,
  });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin !== ORIGIN || req.method() !== 'GET') return req.abort();
    return req.continue();
  });
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem(
      'cookie-consent-v2',
      JSON.stringify({ analytics: false, marketing: false }),
    );
    window.__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 3000));
  const clsLoad = await page.evaluate(() => window.__cls);
  // Przewinięcie do pasa linków (sprawdza, że pas nie przesuwa układu przy dojeździe).
  await page.evaluate(() => {
    const p = [...document.querySelectorAll('p')].find((x) =>
      x.textContent.includes('Lokalnie · Rzeszów'),
    );
    p?.scrollIntoView({ block: 'center' });
  });
  await new Promise((r) => setTimeout(r, 1500));
  const clsAll = await page.evaluate(() => window.__cls);
  const live = await page.evaluate(() => ({
    h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.replace(/\s+/g, ' ').trim()),
    title: document.title,
    hScroll: document.documentElement.scrollWidth > window.innerWidth,
  }));
  await page.evaluate(axeSrc);
  const axeRes = await page.evaluate(async () => {
    const r = await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
    });
    const sc = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    const h1 = document.querySelector('h1');
    const band = [...document.querySelectorAll('p')]
      .find((x) => x.textContent.includes('Lokalnie · Rzeszów'))
      ?.closest('.rounded-3xl');
    const local = sc
      .map((v) => ({
        id: v.id,
        nodes: v.nodes.filter((n) => {
          const el = document.querySelector(n.target[0]);
          return el && ((h1 && h1.contains(el)) || (band && band.contains(el)));
        }).length,
      }))
      .filter((v) => v.nodes > 0);
    return {
      seriousCritical: sc.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
      local,
    };
  });
  results.browser[vp.name] = {
    clsLoad: +clsLoad.toFixed(4),
    clsAll: +clsAll.toFixed(4),
    ...live,
    axe: axeRes,
    errors,
  };
  check(clsAll <= 0.1, `${vp.name}: CLS ${clsAll}`);
  check(live.h1.length === 1, `${vp.name}: H1 po hydratacji ${live.h1.length}`);
  check(axeRes.seriousCritical.length === 0, `${vp.name}: axe ${JSON.stringify(axeRes.seriousCritical)}`);
  check(!live.hScroll, `${vp.name}: przewijanie poziome`);
  if (mode === 'on') check(count(live.h1.join(' ')) === 1, `${vp.name}: fraza w H1 po hydratacji`);
  await page.close();
}
await browser.close();
server.close();
results.fails = fails;
await fs.writeFile(path.join(OUT, `probe-${mode}.json`), JSON.stringify(results, null, 2));
console.log(`PROBE ${mode}: ${fails.length ? 'FAIL ' + fails.join('; ') : 'OK'}`);
console.log(JSON.stringify(results));
process.exit(fails.length ? 1 : 0);
