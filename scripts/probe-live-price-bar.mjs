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
 * MIX-1412: szerokości 390/1024/1280/1366; nakładanie paska na Wstecz/Dalej i przycisku ciasteczek
 * na Wstecz w pierwszym widoku (po odpowiedzi i u góry strony) oraz w przeglądzie przewijania co
 * 100 px; wysokość przycisków opcji ≥ 44 px.
 *
 * MIX-1466, tryb adresu (bez atrap: prawdziwe API i Turnstile wdrożonej strony):
 *
 *   PROBE_ACCESS_ID_FILE=<plik> PROBE_ACCESS_SECRET_FILE=<plik> \
 *     node scripts/probe-live-price-bar.mjs --url <https://host> <katalog-wyników>
 *
 * Nagłówki Cloudflare Access (gdy podane oba pliki) idą WYŁĄCZNIE do hosta z --url (przechwycenie
 * żądań), nigdy do stron trzecich; ich wartości nie trafiają do wyników. Zapis: każde żądanie
 * /api/* (metoda, status, ms), błędy konsoli, tekst paska, czas od kliknięcia do ceny albo do
 * komunikatu zastępczego, zrzuty 390 i 1366 px. Kod wyjścia 0 = cena po zmianie odpowiedzi
 * w ≤ 1 s na obu szerokościach, 1 = nie, 2 = złe wywołanie.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

if (process.argv[2] === '--url') {
  await runUrlMode(process.argv[3], process.argv[4]);
}

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
  { name: 'd1024', width: 1024, height: 768, mobile: false },
  { name: 'd1280', width: 1280, height: 800, mobile: false },
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
    await h.asElement().evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await h.asElement().click();
  };
  const priceText = () =>
    page.evaluate(
      () => document.querySelector('[data-testid="live-price-bar"]')?.textContent ?? '',
    );
  page.on('pageerror', (e) => console.error(`[${vp.name}] pageerror: ${e.message}`));

  // Pomiar: od kliknięcia odpowiedzi do pojawienia się ceny w pasku.
  const timeToPrice = async (label, expected) => {
    const t0 = Date.now();
    await clickRadio(label);
    try {
      await page.waitForFunction(
        (re) =>
          new RegExp(re).test(
            document.querySelector('[data-testid="live-price-bar"]')?.textContent ?? '',
          ),
        { timeout: 5000, polling: 25 },
        expected,
      );
    } catch (e) {
      await page.screenshot({ path: path.join(OUT, 'shots', `${vp.name}-BLAD.png`) });
      console.error(
        `[${vp.name}] brak ceny po "${label}": pasek="${await priceText()}", zapytań=${previewCalls.length}`,
      );
      throw e;
    }
    return Date.now() - t0;
  };

  const t1 = await timeToPrice('Sklep internetowy', '27\\s500');
  await page.screenshot({ path: path.join(OUT, 'shots', `${vp.name}-sklep.png`) });
  const t2 = await timeToPrice('Wizytówka', '8\\s?000');
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
      barFlag: document.body.dataset.livePriceBar ?? null,
      viewportH: window.innerHeight,
    };
  });
  // MIX-1412: kto co zasłania (px²). Przejścia CSS wyłączone, żeby mierzyć stan końcowy.
  await page.addStyleTag({ content: '*{transition:none!important}' });
  const frames = () =>
    page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
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
      const bar = r(document.querySelector('[data-testid="live-price-bar"]'));
      const cookie = r(document.querySelector('.cookie-floating-btn'));
      const back = r(btn('Wstecz'));
      const next = r(btn('Dalej'));
      return {
        scrollY: Math.round(window.scrollY),
        raised: document.body.dataset.livePriceBar === 'true',
        barWstecz: ov(bar, back),
        barDalej: ov(bar, next),
        cookieWstecz: ov(cookie, back),
        cookieBar: ov(cookie, bar),
      };
    });
  await frames();
  const afterAnswer = await covers();
  await page.evaluate(() => window.scrollTo(0, 0));
  await frames();
  const atTop = await covers();
  await page.screenshot({ path: path.join(OUT, 'shots', `${vp.name}-gora.png`) });
  const maxY = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  );
  const sweep = {
    steps: 0,
    barWstecz: 0,
    barDalej: 0,
    raisedCookieWstecz: 0,
    cookieBar: 0,
    plainCookieWstecz: 0,
  };
  for (let y = 0; y <= maxY; y += 100) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await frames();
    const c = await covers();
    sweep.steps += 1;
    sweep.barWstecz = Math.max(sweep.barWstecz, c.barWstecz);
    sweep.barDalej = Math.max(sweep.barDalej, c.barDalej);
    sweep.cookieBar = Math.max(sweep.cookieBar, c.cookieBar);
    if (c.raised) sweep.raisedCookieWstecz = Math.max(sweep.raisedCookieWstecz, c.cookieWstecz);
    else sweep.plainCookieWstecz = Math.max(sweep.plainCookieWstecz, c.cookieWstecz);
  }
  const firstView = [afterAnswer, atTop];
  for (const [k, v] of [
    ['poOdpowiedzi', afterAnswer],
    ['gora', atTop],
  ]) {
    check(
      v.barWstecz === 0 && v.barDalej === 0,
      `${vp.name} ${k}: pasek na Wstecz/Dalej (${v.barWstecz}/${v.barDalej} px2)`,
    );
    check(v.cookieWstecz === 0, `${vp.name} ${k}: ciasteczka na Wstecz (${v.cookieWstecz} px2)`);
  }
  check(
    sweep.barWstecz === 0 && sweep.barDalej === 0,
    `${vp.name} przewijanie: pasek na Wstecz/Dalej`,
  );
  check(sweep.raisedCookieWstecz === 0, `${vp.name} przewijanie: podniesione ciasteczka na Wstecz`);
  check(
    geo.calculatorTargets.length > 0 && Math.min(...geo.calculatorTargets) >= 44,
    `${vp.name}: przycisk opcji < 44 px (${geo.calculatorTargets.join(',')})`,
  );

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
    barFlag: geo.barFlag,
    firstView,
    sweep,
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

// ---------------------------------------------------------------------------------------------
// MIX-1466: tryb adresu. Całość w funkcji (hoisting), tryb lokalny zostaje bez zmian.
async function runUrlMode(baseArg, outArg2) {
  let base = null;
  try {
    base = new URL(baseArg);
  } catch {
    /* niżej: kod 2 */
  }
  if (!base || base.protocol !== 'https:' || !outArg2) {
    console.error('użycie: probe-live-price-bar.mjs --url <https://host> <out>');
    process.exit(2);
  }
  const out = path.resolve(outArg2);
  await fs.mkdir(path.join(out, 'shots'), { recursive: true });
  const access = {};
  const idFile = process.env.PROBE_ACCESS_ID_FILE;
  const secretFile = process.env.PROBE_ACCESS_SECRET_FILE;
  if (idFile || secretFile) {
    if (!idFile || !secretFile) {
      console.error('podaj oba pliki Access albo żaden');
      process.exit(2);
    }
    access['CF-Access-Client-Id'] = (await fs.readFile(idFile, 'utf8')).trim();
    access['CF-Access-Client-Secret'] = (await fs.readFile(secretFile, 'utf8')).trim();
  }
  const PRICE_RE = String.raw`\d[\d\s ]*–[\d\s ]*zł`;
  const FALLBACK_RE = 'Nie udało się|Liczymy za często|pokażemy na końcu';
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const res = { base: base.origin, accessHeaders: Object.keys(access).length > 0 };
  const fails = [];
  for (const vp of [
    { name: 'm390', width: 390, height: 844, mobile: true },
    { name: 'd1366', width: 1366, height: 768, mobile: false },
  ]) {
    const page = await browser.newPage();
    // Bez „Headless” w UA: strona /wycena/ nie montuje kalkulatora przy prerenderze.
    await page.setUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 MixtureE2E/1',
    );
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      deviceScaleFactor: 1,
    });
    const api = [];
    const consoleErrors = [];
    const started = new Map();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const u = new URL(req.url());
      if (u.origin !== base.origin) return req.continue();
      if (u.pathname.startsWith('/api/')) started.set(req, Date.now());
      return req.continue({ headers: { ...req.headers(), ...access } });
    });
    const done = (req, status) => {
      const t0 = started.get(req);
      if (t0 === undefined) return;
      api.push({
        method: req.method(),
        path: new URL(req.url()).pathname,
        status,
        ms: Date.now() - t0,
      });
    };
    page.on('requestfinished', (req) => done(req, req.response()?.status() ?? 0));
    page.on('requestfailed', (req) => done(req, `failed:${req.failure()?.errorText ?? '?'}`));
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200));
    });
    page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message.slice(0, 200)}`));
    const r = { api, consoleErrors };
    try {
      await page.goto(`${base.origin}/wycena/`, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForSelector('[role="radiogroup"]', { timeout: 15000 });
      r.barBeforeAnswer = (await page.$('[data-testid="live-price-bar"]')) !== null;
      const radios = async () => page.$$('[role="radiogroup"]:first-of-type [role="radio"]');
      const barText = () =>
        page.evaluate(
          () => document.querySelector('[data-testid="live-price-bar"]')?.textContent ?? null,
        );
      const answer = async (i, tag) => {
        const before = await barText();
        const el = (await radios())[i];
        const option = await el.evaluate((e) => e.textContent.trim());
        await el.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
        const t0 = Date.now();
        await el.click();
        let kind = 'timeout';
        try {
          const h = await page.waitForFunction(
            (pre, fb, prev) => {
              const bar = document.querySelector('[data-testid="live-price-bar"]');
              const t = bar?.textContent;
              if (!t || t === prev || bar.getAttribute('aria-busy') === 'true') return false;
              if (new RegExp(fb).test(t)) return 'fallback';
              if (new RegExp(pre).test(t)) return 'price';
              return false;
            },
            { timeout: 8000, polling: 25 },
            PRICE_RE,
            FALLBACK_RE,
            before,
          );
          kind = await h.jsonValue();
        } catch {
          /* kind zostaje 'timeout' */
        }
        const ms = Date.now() - t0;
        await page.screenshot({ path: path.join(out, 'shots', `${vp.name}-${tag}.png`) });
        return { option, kind, ms, bar: await barText() };
      };
      r.first = await answer(0, 'odp1');
      r.change = await answer(1, 'odp2');
    } catch (e) {
      r.error = `${e.name}: ${String(e.message).slice(0, 200)}`;
      await page.screenshot({ path: path.join(out, 'shots', `${vp.name}-BLAD.png`) });
    }
    if (!(r.change?.kind === 'price' && r.change.ms <= 1000)) {
      const why = r.change ? `${r.change.kind}, ${r.change.ms} ms` : r.error;
      fails.push(`${vp.name}: brak ceny po zmianie odpowiedzi w <= 1 s (${why})`);
    }
    res[vp.name] = r;
    await page.close();
  }
  await browser.close();
  res.fails = fails;
  await fs.writeFile(path.join(out, 'probe-url.json'), JSON.stringify(res, null, 2));
  console.log(JSON.stringify(res, null, 2));
  process.exit(fails.length ? 1 : 0);
}
