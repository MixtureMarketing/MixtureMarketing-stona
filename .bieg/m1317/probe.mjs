#!/usr/bin/env node
/**
 * MIX-1317: próba K1 „Oś procesu” na buildzie (serwer statyczny na 127.0.0.1, ruch poza localhost
 * abortowany, UA z dopiskiem MixtureE2E/1; wzór .bieg/m1269/probe.mjs).
 *
 *   node .bieg/m1317/probe.mjs <dist> <out> on|off [zrzuty=1]
 *
 * on, dla 6 podstron z sekcją procesu:
 *  - szerokość: przy 1280, 1366, 1600 px szerokość rzędu kroków (suma prostokątów <li>) względem
 *    wnętrza kontenera (najbliższy przodek z max-width, bez paddingu); próg ≥ 70 %;
 *    przy 390 px układ pionowy (1 kolumna);
 *  - widoczność: przy 390 i 1366 px przewijamy tak, że góra kroku k jest w połowie ekranu, i czytamy
 *    opacity treści kroków 1..k (próg: wszystkie = 1, czyli bez przewijania do końca sekcji);
 *    przed sekcją (oś tuż pod ekranem) opacity kroku 1 < 1 = animacja działa;
 *  - „ogranicz ruch” (390, 1366): 0 animacji w osi, wszystkie kroki opacity 1 bez przewijania;
 *  - CLS (390, 1366): layout-shift bez hadRecentInput, wczytanie + przewinięcie całej strony; ≤ 0,1;
 *  - axe wcag2a/aa w osi K1 (390, 1366) po przewinięciu i przy „ogranicz ruch”: 0 serious/critical;
 *    całą stronę liczymy informacyjnie;
 *  - zrzuty sekcji JPEG (1366, 1600, 390) jako base64 w logu (ZRZUT-START nazwa … ZRZUT-KONIEC).
 * off: CLS i axe całej strony (porównanie), brak [data-k1].
 * Wynik: <out>/probe-<tryb>.json; kod 0 = progi spełnione, 1 = nie, 2 = złe wywołanie.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const [distArg, outArg, mode, shotsArg = '1'] = process.argv.slice(2);
if (!distArg || !outArg || !['on', 'off'].includes(mode)) {
  console.error('użycie: probe.mjs <dist> <out> on|off [zrzuty]');
  process.exit(2);
}
const DIST = path.resolve(distArg);
const OUT = path.resolve(outArg);
await fs.mkdir(OUT, { recursive: true });
const PAGES = [
  ['/marketing/google-ads/', 'Jak prowadzimy konto'],
  ['/marketing/seo/', 'Jak wygląda pierwszy rok'],
  ['/web-development/systemy-ai-aplikacje/', 'Jak zaczynamy'],
  ['/web-development/custom-app/', 'Jak zaczynamy — zanim wydasz złotówkę.'],
  ['/agencja-seo-rzeszow/', 'Proces pozycjonowania krok po kroku'],
  ['/design/branding/', 'Jak powstaje marka?'],
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
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};
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
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 MixtureE2E/1';
const axeSrc = await fs.readFile(path.resolve('node_modules/axe-core/axe.min.js'), 'utf8');
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fails = [];
const check = (ok, msg) => {
  if (!ok) fails.push(msg);
};
let outside = 0;
const results = { mode, chrome: await browser.version(), pages: {} };

async function open(w, h, reduce = false, mobile = false) {
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setRequestInterception(true);
  page.on('request', (r) => {
    if (r.url().startsWith(ORIGIN) || r.url().startsWith('data:')) return r.continue();
    outside++;
    return r.abort();
  });
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' },
  ]);
  await page.evaluateOnNewDocument(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  return page;
}
async function go(page, p) {
  await page.goto(ORIGIN + p, { waitUntil: 'networkidle0', timeout: 60000 });
  await sleep(800);
}
/** Przewija tak, by góra elementu (selektor + indeks) była na ułamku `frac` wysokości ekranu. */
const scrollTo = (page, sel, idx, frac) =>
  page.evaluate(
    (sel, idx, frac) => {
      const el = document.querySelectorAll(sel)[idx];
      const top = el.getBoundingClientRect().top + window.scrollY;
      // Strona ma scroll-behavior: smooth; pomiar wymaga skoku od razu.
      window.scrollTo({ top: Math.max(0, top - window.innerHeight * frac), behavior: 'instant' });
    },
    sel,
    idx,
    frac,
  );
const opacities = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('[data-k1] .mm-k1-tresc')].map((e) =>
      Number(getComputedStyle(e).opacity),
    ),
  );
async function settle(page) {
  // Dwie klatki + chwila: oś przewijania przelicza się po scrollu.
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  );
  await sleep(400);
}
async function shot(page, name) {
  if (shotsArg !== '1') return;
  const box = await page.evaluate(() => {
    const k = document.querySelector('[data-k1]');
    const s = k.closest('section') || k.parentElement;
    const r = s.getBoundingClientRect();
    return { y: r.top + window.scrollY, h: r.height };
  });
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), box.y);
  await settle(page);
  // Na koniec przewijamy przez sekcję, żeby oś była w stanie „po przewinięciu”.
  const vp = page.viewport();
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: 'instant' }),
    Math.max(0, box.y + box.h - vp.height),
  );
  await settle(page);
  const el = await page.evaluateHandle(() => {
    const k = document.querySelector('[data-k1]');
    return k.closest('section') || k.parentElement;
  });
  const buf = await el.screenshot({ type: 'jpeg', quality: 55, captureBeyondViewport: true });
  console.log(`ZRZUT-START ${name}`);
  console.log(Buffer.from(buf).toString('base64'));
  console.log(`ZRZUT-KONIEC ${name} ${buf.length}`);
}
async function cls(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await sleep(500);
  return page.evaluate(() => window.__cls);
}
async function axeRun(page, include) {
  await page.evaluate(axeSrc);
  return page.evaluate(async (include) => {
    const r = await window.axe.run(include ? { include: [[include]] } : document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
    });
    return r.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id}(${v.nodes.length})`);
  }, include);
}

for (const [p, heading] of PAGES) {
  const slug = p.replace(/\//g, '-').replace(/^-|-$/g, '');
  const r = (results.pages[p] = {});
  // CLS + axe całej strony (on i off), 390 i 1366.
  for (const [w, h, mob] of [
    [390, 844, true],
    [1366, 900, false],
  ]) {
    const page = await open(w, h, false, mob);
    await go(page, p);
    const k1 = await page.$$eval('[data-k1]', (e) => e.length);
    const h2 = await page.$$eval('h2', (e, t) => e.filter((x) => x.textContent.trim() === t).length, heading);
    r[`k1_${w}`] = k1;
    r[`h2_${w}`] = h2;
    check(h2 === 1, `${p} ${w}: nagłówek sekcji ${h2}×`);
    check(mode === 'on' ? k1 === 1 : k1 === 0, `${p} ${w}: [data-k1] ${k1}×`);
    r[`axePage_${w}`] = await axeRun(page, null);
    r[`cls_${w}`] = await cls(page);
    check(r[`cls_${w}`] <= 0.1, `${p} ${w}: CLS ${r[`cls_${w}`]}`);
    await page.close();
  }
  if (mode !== 'on') continue;
  // Szerokość rzędu względem kontenera.
  for (const w of [1280, 1366, 1600, 390]) {
    const page = await open(w, w === 390 ? 844 : 900, false, w === 390);
    await go(page, p);
    const m = await page.evaluate(() => {
      const k = document.querySelector('[data-k1]');
      const lis = [...k.querySelectorAll('.mm-k1-krok')].map((l) => l.getBoundingClientRect());
      const left = Math.min(...lis.map((x) => x.left));
      const right = Math.max(...lis.map((x) => x.right));
      let c = k.parentElement;
      while (c && getComputedStyle(c).maxWidth === 'none') c = c.parentElement;
      c = c || document.body;
      const cs = getComputedStyle(c);
      const inner = c.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const cols = getComputedStyle(k.querySelector('.mm-k1-kroki')).gridTemplateColumns.split(' ').length;
      return { tresc: Math.round(right - left), kontener: Math.round(inner), cols, cls: c.className.slice(0, 60) };
    });
    m.proc = Math.round((m.tresc / m.kontener) * 1000) / 10;
    r[`szer_${w}`] = m;
    if (w === 390) check(m.cols === 1, `${p} 390: kolumn ${m.cols}`);
    else check(m.proc >= 70, `${p} ${w}: szerokość ${m.proc}% < 70%`);
    if (w === 1366 || w === 1600 || w === 390) await shot(page, `${slug}-${w}`);
    await page.close();
  }
  // Widoczność kroków po przewinięciu (bez przewijania do końca) + animacja działa.
  for (const [w, h, mob] of [
    [390, 844, true],
    [1366, 900, false],
  ]) {
    const page = await open(w, h, false, mob);
    await go(page, p);
    await scrollTo(page, '[data-k1]', 0, 1.0);
    await settle(page);
    const przed = await opacities(page);
    const n = przed.length;
    const po = [];
    for (let k = 0; k < n; k++) {
      await scrollTo(page, '[data-k1] .mm-k1-krok', k, 0.5);
      await settle(page);
      const o = await opacities(page);
      po.push(Math.min(...o.slice(0, k + 1)));
    }
    const anims = await page.evaluate(() => {
      const k = document.querySelector('[data-k1]');
      return document.getAnimations().filter((a) => k.contains(a.effect?.target)).length;
    });
    r[`widocznosc_${w}`] = { przedKrok1: przed[0], minPoKazdym: po, animacji: anims };
    // axe w osi po przewinięciu (kroki w stanie końcowym; przed wjazdem mają celowo opacity 0,2):
    // ostatni krok na 20 % wysokości ekranu, więc wszystkie animacje są za końcem zakresu.
    await scrollTo(page, '[data-k1] .mm-k1-krok', n - 1, 0.2);
    await settle(page);
    r[`axeK1_${w}`] = await axeRun(page, '[data-k1]');
    check(r[`axeK1_${w}`].length === 0, `${p} ${w}: axe w osi ${r[`axeK1_${w}`].join(',')}`);
    check(po.every((x) => x === 1), `${p} ${w}: kroki niewidoczne po przewinięciu ${po}`);
    check(przed[0] < 1, `${p} ${w}: animacja nie działa (krok 1 przed sekcją opacity ${przed[0]})`);
    check(anims > 0, `${p} ${w}: brak animacji`);
    await page.close();
  }
  // Ogranicz ruch: zero animacji, pełna widoczność bez przewijania.
  for (const [w, h, mob] of [
    [390, 844, true],
    [1366, 900, false],
  ]) {
    const page = await open(w, h, true, mob);
    await go(page, p);
    const o = await opacities(page);
    const anims = await page.evaluate(() => {
      const k = document.querySelector('[data-k1]');
      return document.getAnimations().filter((a) => k.contains(a.effect?.target)).length;
    });
    r[`ograniczRuch_${w}`] = { animacji: anims, minOpacity: Math.min(...o) };
    r[`axeK1Reduce_${w}`] = await axeRun(page, '[data-k1]');
    check(r[`axeK1Reduce_${w}`].length === 0, `${p} ${w} reduce: axe w osi ${r[`axeK1Reduce_${w}`].join(',')}`);
    check(anims === 0, `${p} ${w} reduce: animacji ${anims}`);
    check(o.every((x) => x === 1), `${p} ${w} reduce: opacity ${o}`);
    await page.close();
  }
}
await browser.close();
server.close();
results.pozaLocalhost = outside;
results.fails = fails;
await fs.writeFile(path.join(OUT, `probe-${mode}.json`), JSON.stringify(results, null, 1));
console.log(`PROBE ${mode} ${fails.length ? 'NIE' : 'OK'} bledy=${fails.length} pozaLocalhost=${outside}`);
for (const f of fails.slice(0, 30)) console.log(`  FAIL ${f}`);
console.log(`WYNIK ${JSON.stringify(results)}`);
process.exit(fails.length ? 1 : 0);
