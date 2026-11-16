#!/usr/bin/env node
/**
 * MIX-1790: próba podglądu konfiguracji na lokalnej budowie (wzór: scripts/probe-live-price-bar.mjs,
 * MIX-1412). Skrypt serwuje dist (SPA) na wolnym porcie localhost; ruch poza localhost i każde
 * żądanie inne niż GET do własnego serwera jest abortowane. API wyceny to atrapa przeglądarki
 * (public-questions, public-preview z `scope` kontraktu v2, w tym pozycja z HTML), Turnstile to
 * atrapa `window.turnstile`.
 *
 *   node .bieg/m1790/probe.mjs <dist> <out> on    (VITE_MM_CONFIG_PREVIEW=1 i VITE_MM_LIVE_PRICE_BAR=1)
 *   node .bieg/m1790/probe.mjs <dist> <out> off   (budowa bez przełączników)
 *
 * on: 390/1024/1366 px; podgląd poniżej pierwszego ekranu, element LCP poza podglądem, 0 px²
 * nakładania podglądu z paskiem widełek, Wstecz i Dalej (po odpowiedzi, u
 * góry i co 100 px przewijania; przycisk ciasteczek tylko zapisany: stały, więc przewijana treść
 * zawsze pod nim przechodzi), HTML z API jako tekst, nieznany typ = brak szkicu i lista zostaje.
 * Zrzuty 390 i 1366 px (JPEG, widok). off: 0 elementów podglądu i 0 zapytań public-preview.
 * Wynik: <out>/probe.json; kod 0 = progi spełnione, 1 = nie, 2 = złe wywołanie.
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
};
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let file = path.join(DIST, decodeURIComponent(url.pathname));
  if (!file.startsWith(DIST)) {
    res.writeHead(403).end();
    return;
  }
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

const QUESTIONS = {
  questions: [
    {
      code: 'project_goal',
      text: 'Jaki jest cel projektu?',
      help_text: null,
      answer_type: 'select',
      options: [
        { value: 'sklep', label: 'Sklep internetowy' },
        { value: 'wizytowka', label: 'Wizytówka' },
        { value: 'portal', label: 'Portal' },
      ],
      visible_if: null,
      group: 'projekt',
      sort_order: 1,
    },
    {
      code: 'languages',
      text: 'Ile wersji językowych?',
      help_text: null,
      answer_type: 'number',
      options: null,
      visible_if: null,
      group: 'projekt',
      sort_order: 2,
    },
  ],
};
const XSS_NAME = '<img src=x onerror="window.__xss=1">';
const XSS_DESC = '<script>window.__xss=2</script>';
const SCOPE = [
  { client_name: 'Koszyk i płatności online', client_description: 'Zakupy bez zakładania konta.' },
  { client_name: 'Dwie wersje językowe', client_description: 'Polski i angielski.' },
  { client_name: 'Logowanie klientów', client_description: null },
  { client_name: XSS_NAME, client_description: XSS_DESC },
];
const PRICES = { sklep: { min: 27500, max: 53000 }, wizytowka: { min: 8000, max: 15000 } };
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 MixtureE2E/1';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const results = { mode };
const fails = [];
const check = (ok, msg) => {
  if (!ok) fails.push(msg);
};

const VIEWPORTS =
  mode === 'on'
    ? [
        { name: 'm390', width: 390, height: 844, mobile: true, shots: true },
        { name: 'd1024', width: 1024, height: 768, mobile: false, shots: false },
        { name: 'd1366', width: 1366, height: 768, mobile: false, shots: true },
      ]
    : [{ name: 'm390', width: 390, height: 844, mobile: true, shots: false }];

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    deviceScaleFactor: 1,
  });
  const previewCalls = [];
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin !== ORIGIN) return req.abort();
    if (u.pathname === '/api/estimation/public-questions' && req.method() === 'GET')
      return req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(QUESTIONS),
      });
    if (u.pathname === '/api/estimation/public-preview' && req.method() === 'POST') {
      const body = JSON.parse(req.postData() || '{}');
      previewCalls.push(body);
      return setTimeout(
        () =>
          req.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              priceRange: PRICES[body.answers?.project_goal] ?? PRICES.sklep,
              scope: SCOPE,
              preview_token: 'prev-mock',
            }),
          }),
        150,
      );
    }
    if (req.method() !== 'GET') return req.abort();
    return req.continue();
  });
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem(
      'cookie-consent-v2',
      JSON.stringify({ analytics: false, marketing: false }),
    );
    window.turnstile = {
      render: () => 'w1',
      execute: () => {},
      reset: () => {},
      getResponse: () => 'tok-mock',
      remove: () => {},
    };
    window.__lcp = [];
    new PerformanceObserver((l) => {
      for (const e of l.getEntries())
        window.__lcp.push({
          inPreview: !!e.element?.closest?.('[data-testid="config-preview"]'),
          tag: e.element?.tagName ?? null,
          t: Math.round(e.startTime),
        });
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  page.on('pageerror', (e) => console.error(`[${vp.name}] pageerror: ${e.message}`));

  await page.goto(`${ORIGIN}/wycena/`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('[role="radiogroup"]');
  const count = (sel) => page.evaluate((s) => document.querySelectorAll(s).length, sel);
  const previewBefore = await count('[data-testid="config-preview"]');

  const clickRadio = async (label) => {
    const h = await page.evaluateHandle(
      (l) =>
        [...document.querySelectorAll('[role="radio"]')].find((e) => e.textContent.trim() === l),
      label,
    );
    await h.asElement().evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await h.asElement().click();
  };

  if (mode === 'off') {
    await clickRadio('Sklep internetowy');
    await new Promise((r) => setTimeout(r, 2500));
    const r = {
      previewBefore,
      previewAfter: await count('[data-testid="config-preview"]'),
      sketchSvgs: await count('[data-testid="config-sketch"]'),
      livePriceBar: await count('[data-testid="live-price-bar"]'),
      previewRequests: previewCalls.length,
    };
    results[vp.name] = r;
    check(r.previewAfter === 0 && r.sketchSvgs === 0, `${vp.name} off: element podglądu w DOM`);
    check(r.previewRequests === 0, `${vp.name} off: ${r.previewRequests} zapytań public-preview`);
    await page.close();
    continue;
  }

  await clickRadio('Sklep internetowy');
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="config-scope"] li').length > 0,
    { timeout: 5000, polling: 25 },
  );
  await page.addStyleTag({ content: '*{transition:none!important}' });
  const frames = () =>
    page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

  const xss = await page.evaluate(() => {
    const box = document.querySelector('[data-testid="config-preview"]');
    return {
      flag: window.__xss ?? null,
      elements: box.querySelectorAll('img, script').length,
      text: box.textContent,
      items: box.querySelectorAll('li').length,
      sketch: !!box.querySelector('[data-testid="config-sketch"] svg'),
      sketchBytes: box.querySelector('[data-testid="config-sketch"] svg')?.outerHTML.length ?? 0,
    };
  });
  const covers = () =>
    page.evaluate(() => {
      const r = (e) => {
        if (!e) return null;
        const b = e.getBoundingClientRect();
        return { x: b.x, y: b.y, w: b.width, h: b.height };
      };
      const ov = (a, b) => {
        if (!a || !b) return 0;
        const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        return w > 0 && h > 0 ? Math.round(w * h) : 0;
      };
      const btn = (t) =>
        [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === t);
      const prev = r(document.querySelector('[data-testid="config-preview"]'));
      const bar = r(document.querySelector('[data-testid="live-price-bar"]'));
      const cookie = r(document.querySelector('.cookie-floating-btn'));
      const back = r(btn('Wstecz'));
      const next = r(btn('Dalej'));
      return {
        scrollY: Math.round(window.scrollY),
        previewTop: prev ? Math.round(prev.y + window.scrollY) : null,
        prevBar: ov(prev, bar),
        prevWstecz: ov(prev, back),
        prevDalej: ov(prev, next),
        prevCookie: ov(prev, cookie),
        barWstecz: ov(bar, back),
        barDalej: ov(bar, next),
      };
    });
  await frames();
  const afterAnswer = await covers();
  await page.evaluate(() => window.scrollTo(0, 0));
  await frames();
  const atTop = await covers();
  const fold = await page.evaluate(() => {
    const p = document.querySelector('[data-testid="config-preview"]').getBoundingClientRect();
    return { previewTopAtScroll0: Math.round(p.top), viewportH: window.innerHeight };
  });
  const maxY = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  );
  const sweep = { steps: 0, prevBar: 0, prevWstecz: 0, prevDalej: 0, prevCookie: 0, barBtn: 0 };
  for (let y = 0; y <= maxY; y += 100) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await frames();
    const c = await covers();
    sweep.steps += 1;
    for (const k of ['prevBar', 'prevWstecz', 'prevDalej', 'prevCookie'])
      sweep[k] = Math.max(sweep[k], c[k]);
    sweep.barBtn = Math.max(sweep.barBtn, c.barWstecz, c.barDalej);
  }

  if (vp.shots) {
    await page.evaluate(() =>
      document
        .querySelector('[data-testid="config-preview"]')
        .scrollIntoView({ block: 'center', behavior: 'instant' }),
    );
    await frames();
    await page.screenshot({
      path: path.join(OUT, 'shots', `${vp.name}-podglad.jpg`),
      type: 'jpeg',
      quality: 70,
    });
    await page.evaluate(() =>
      document
        .querySelector('[data-testid="config-preview"]')
        .scrollIntoView({ block: 'end', behavior: 'instant' }),
    );
    await frames();
    await page.screenshot({
      path: path.join(OUT, 'shots', `${vp.name}-dol.jpg`),
      type: 'jpeg',
      quality: 70,
    });
  }

  // K5: typ spoza listy szkiców (atrapa: „portal") = brak szkicu, lista zostaje.
  await clickRadio('Portal');
  await new Promise((r) => setTimeout(r, 1800));
  const unknownType = {
    sketch: await count('[data-testid="config-sketch"]'),
    items: await count('[data-testid="config-scope"] li'),
  };
  const lcp = await page.evaluate(() => window.__lcp);

  results[vp.name] = {
    previewBefore,
    xss,
    fold,
    lcp,
    firstView: [afterAnswer, atTop],
    sweep,
    unknownType,
    previewRequests: previewCalls.length,
  };
  check(previewBefore === 0, `${vp.name}: podgląd przed odpowiedzią`);
  check(xss.flag === null && xss.elements === 0, `${vp.name}: HTML z API wykonany`);
  check(xss.text.includes(XSS_NAME) && xss.text.includes(XSS_DESC), `${vp.name}: brak tekstu HTML`);
  check(xss.sketch && xss.items === SCOPE.length, `${vp.name}: brak szkicu albo pozycji`);
  check(fold.previewTopAtScroll0 >= fold.viewportH, `${vp.name}: podgląd w pierwszym ekranie`);
  check(
    lcp.every((e) => !e.inPreview),
    `${vp.name}: LCP w podglądzie`,
  );
  for (const [k, v] of [
    ['poOdpowiedzi', afterAnswer],
    ['gora', atTop],
  ])
    check(
      v.prevBar + v.prevWstecz + v.prevDalej + v.barWstecz + v.barDalej === 0,
      `${vp.name} ${k}: nakładanie ${JSON.stringify(v)}`,
    );
  check(
    sweep.prevBar + sweep.prevWstecz + sweep.prevDalej + sweep.barBtn === 0,
    `${vp.name} przewijanie: nakładanie ${JSON.stringify(sweep)}`,
  );
  check(
    unknownType.sketch === 0 && unknownType.items === SCOPE.length,
    `${vp.name}: nieznany typ ${JSON.stringify(unknownType)}`,
  );
  await page.close();
}

await browser.close();
server.close();
results.fails = fails;
await fs.writeFile(path.join(OUT, 'probe.json'), JSON.stringify(results, null, 2));
for (const [k, v] of Object.entries(results)) {
  if (k === 'fails' || k === 'mode') continue;
  const s = { ...v };
  delete s.lcp;
  if (s.xss) s.xss = { ...s.xss, text: `${s.xss.text.length} znaków` };
  console.log(`PROBE ${mode} ${k}: ${JSON.stringify(s)}`);
}
console.log(`PROBE ${mode} fails ${fails.length}: ${JSON.stringify(fails)}`);
process.exit(fails.length ? 1 : 0);
