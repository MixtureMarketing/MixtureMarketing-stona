#!/usr/bin/env node
/**
 * MIX-1385: próba paska widełek na żywo na lokalnej budowie (zrzuty 390 i 1366 px, pomiary).
 *
 *   node scripts/probe-live-price-bar.mjs <katalog-dist> <katalog-wyników>
 *
 * Budowa z przełącznikiem: VITE_MM_LIVE_PRICE_BAR=1 npx vite build --outDir <katalog-dist>.
 * Skrypt sam serwuje dist (SPA) na wolnym porcie localhost, a cały ruch zewnętrzny i każde
 * żądanie inne niż GET do własnego serwera jest ABORTOWANE (zero ruchu w sieć). API wyceny to
 * atrapa przeglądarki: public-questions (3 pytania) i public-preview (cena zależy od odpowiedzi,
 * opóźnienie 150 ms). Turnstile to atrapa `window.turnstile`. Wyniki: probe.json + zrzuty.
 * Kod wyjścia 0 = wszystkie progi spełnione, 1 = któryś próg nie.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const [distArg, outArg] = process.argv.slice(2);
if (!distArg || !outArg) {
  console.error('użycie: probe-live-price-bar.mjs <dist> <out>');
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
    file = path.join(DIST, 'index.html'); // SPA fallback
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
const PRICES = {
  sklep: { min: 27500, max: 53000 },
  wizytowka: { min: 8000, max: 15000 },
  portal: { min: 40000, max: 90000 },
};
const MOCK_DELAY_MS = 150;
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 MixtureE2E/1';

const rectOf = (r) => ({
  x: Math.round(r.x),
  y: Math.round(r.y),
  w: Math.round(r.width),
  h: Math.round(r.height),
});
const overlapPx = (a, b) => {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
};

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const results = {};
const fails = [];
const check = (ok, msg) => {
  if (!ok) fails.push(msg);
};

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
  const previewCalls = [];
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin !== ORIGIN) return req.abort();
    if (u.pathname === '/api/estimation/public-questions' && req.method() === 'GET') {
      return req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(QUESTIONS),
      });
    }
    if (u.pathname === '/api/estimation/public-preview' && req.method() === 'POST') {
      const body = JSON.parse(req.postData() || '{}');
      previewCalls.push({ t: Date.now(), body });
      return setTimeout(
        () =>
          req.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              priceRange: PRICES[body.answers?.project_goal] ?? PRICES.sklep,
              preview_token: 'prev-mock',
            }),
          }),
        MOCK_DELAY_MS,
      );
    }
    if (req.method() !== 'GET') return req.abort();
    return req.continue();
  });
  await page.evaluateOnNewDocument(() => {
    // Zgoda już zapisana: przycisk ciasteczek (zamiast otwartego baneru) jest widoczny.
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
  });

  await page.goto(`${ORIGIN}/wycena/`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('[role="radiogroup"]');
  const noBarBefore = (await page.$('[data-testid="live-price-bar"]')) === null;

  const clickRadio = async (label) => {
    const h = await page.evaluateHandle(
      (l) =>
        [...document.querySelectorAll('[role="radio"]')].find((e) => e.textContent.trim() === l),
      label,
    );
    await h.asElement().click();
  };
  const priceText = () =>
    page.evaluate(
      () => document.querySelector('[data-testid="live-price-bar"]')?.textContent ?? '',
    );

  // Pomiar: od kliknięcia odpowiedzi do pojawienia się ceny w pasku.
  const timeToPrice = async (label, expected) => {
    const t0 = Date.now();
    await clickRadio(label);
    await page.waitForFunction(
      (re) =>
        new RegExp(re).test(
          document.querySelector('[data-testid="live-price-bar"]')?.textContent ?? '',
        ),
      { timeout: 5000, polling: 25 },
      expected,
    );
    return Date.now() - t0;
  };

  const t1 = await timeToPrice('Sklep internetowy', '27\\s500');
  await page.screenshot({ path: path.join(OUT, 'shots', `${vp.name}-sklep.png`) });
  const t2 = await timeToPrice('Wizytówka', '8\\s000');
  await page.screenshot({ path: path.join(OUT, 'shots', `${vp.name}-wizytowka.png`) });
  // Powrót do wcześniejszych odpowiedzi: pamięć, zero nowego zapytania.
  const callsBefore = previewCalls.length;
  const t3 = await timeToPrice('Sklep internetowy', '27\\s500');
  const memoNewCalls = previewCalls.length - callsBefore;

  const geo = await page.evaluate(() => {
    const r = (e) => {
      if (!e) return null;
      const b = e.getBoundingClientRect();
      return { x: b.x, y: b.y, width: b.width, height: b.height };
    };
    const bar = document.querySelector('[data-testid="live-price-bar"]');
    const cookie = document.querySelector('.cookie-floating-btn');
    const interactive = (root) =>
      [...root.querySelectorAll('a,button,input,select,textarea,[role="radio"],[tabindex]')]
        .map((e) => ({ tag: e.tagName, ...r(e) }))
        .filter((x) => x.width > 0 && x.height > 0);
    return {
      bar: r(bar),
      cookie: r(cookie),
      barInteractive: bar ? interactive(bar) : [],
      calculatorTargets: interactive(document.querySelector('[role="radiogroup"]').parentElement)
        .filter((x) => x.tag === 'BUTTON')
        .map((x) => Math.round(x.height)),
      scrollWidth: document.documentElement.scrollWidth,
      stickyFlag: document.body.dataset.stickyMobileBar ?? null,
      viewportH: window.innerHeight,
    };
  });
  const bar = rectOf(geo.bar);
  const cookie = rectOf(geo.cookie);
  const overlap = overlapPx(bar, cookie);
  const targets = [
    ...geo.barInteractive.map((x) => Math.min(x.width, x.height)),
    Math.min(cookie.w, cookie.h),
  ];

  results[vp.name] = {
    msToPrice: { first: t1, change: t2, backToMemo: t3 },
    memoNewRequests: memoNewCalls,
    previewRequests: previewCalls.length,
    barBeforeAnswer: noBarBefore ? 'brak' : 'JEST',
    bar,
    cookie,
    overlapPx2: overlap,
    barInteractiveCount: geo.barInteractive.length,
    minTargetPx: Math.round(Math.min(...targets)),
    calculatorButtonHeightsPx: geo.calculatorTargets,
    scrollWidth: geo.scrollWidth,
    stickyFlag: geo.stickyFlag,
  };
  check(noBarBefore, `${vp.name}: pasek przed pierwszą odpowiedzią`);
  check(t1 <= 1000 && t2 <= 1000, `${vp.name}: cena później niż 1 s (${t1}/${t2} ms)`);
  check(memoNewCalls === 0, `${vp.name}: pamięć nie zadziałała (${memoNewCalls} zapytań)`);
  check(overlap === 0, `${vp.name}: przycisk ciasteczek nachodzi na pasek (${overlap} px2)`);
  check(Math.min(...targets) >= 44, `${vp.name}: cel dotyku < 44 px`);
  check(geo.scrollWidth <= vp.width, `${vp.name}: strona szersza niż ekran`);
  await page.close();
}

await browser.close();
server.close();
results.fails = fails;
await fs.writeFile(path.join(OUT, 'probe.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
process.exit(fails.length ? 1 : 0);
