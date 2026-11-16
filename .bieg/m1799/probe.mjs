#!/usr/bin/env node
/**
 * MIX-1799: próba z .bieg/m1799/probe.mjs (link do konfiguracji) rozszerzona o przycisk ciasteczek:
 * dłuższa lista „Twój zakres" (6 pozycji), pomiar nakładania WIDOCZNEGO przycisku ciasteczek na
 * podgląd, listę zakresu i przyciski linku co 50 px przewijania (przycisk z visibility:hidden albo
 * opacity:0 nic nie zasłania, ale musi wrócić: widoczny na górze strony).
 * Pierwotnie MIX-1791: próba linku do konfiguracji na lokalnej budowie (wzór .bieg/m1790/probe.mjs).
 * Serwer statyczny na localhost; ruch poza localhost i każde żądanie inne niż GET do własnego
 * serwera jest abortowane. API wyceny to atrapa (public-questions, public-preview), Turnstile to
 * atrapa `window.turnstile`, Web Share to atrapa `navigator.share` (żeby zmierzyć „Udostępnij").
 *
 *   node .bieg/m1799/probe.mjs <dist> <out> on    (VITE_MM_CONFIG_LINK=1, pasek ceny i podgląd =1)
 *   node .bieg/m1799/probe.mjs <dist> <out> off   (budowa bez przełączników)
 *
 * on: 390/1024/1366 px; `/wycena/?k=<dobry>` odtwarza odpowiedzi (radio, liczba), pasek ceny
 * pyta o te same odpowiedzi; przyciski ≥ 44×44 px; 0 px² nakładania przycisków linku z paskiem
 * ceny, Wstecz, Dalej i podglądem (po odtworzeniu, u góry i co 100 px przewijania); złośliwy
 * `?k=` (HTML, __proto__, za długi) = pusty formularz, 0 wykonania, 0 przycisków.
 * off: dobry `?k=` ignorowany, 0 przycisków, 0 zapytań public-preview.
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
const ANSWERS = { project_goal: 'sklep', languages: 2 };
const k = (json) => Buffer.from(json, 'utf8').toString('base64url');
const GOOD_K = k(JSON.stringify(ANSWERS));
const BAD = {
  html: k(
    '{"project_goal":"<img src=x onerror=\\"window.__xss=1\\">","languages":"<script>window.__xss=2</script>"}',
  ),
  proto: k('{"project_goal":"sklep","__proto__":{"polluted":1}}'),
  long: GOOD_K + 'A'.repeat(1500),
};
const SCOPE = [
  ['Koszyk i płatności online', 'Klient wybiera produkty, płaci kartą albo BLIKIEM i dostaje potwierdzenie.'],
  ['Strona na telefon', 'Układ dopasowany do ekranu telefonu i tabletu.'],
  ['Wersje językowe', 'Treści w kilku językach z przełącznikiem.'],
  ['Panel zamówień', 'Lista zamówień i ich statusów dla obsługi sklepu.'],
  ['Pozycjonowanie podstawowe', null],
  ['Szkolenie z obsługi', 'Dwugodzinne spotkanie online po wdrożeniu.'],
].map(([client_name, client_description]) => ({ client_name, client_description }));
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

async function openPage(vp, search) {
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
    Object.defineProperty(navigator, 'share', {
      value: () => Promise.resolve(),
      configurable: true,
    });
  });
  page.on('pageerror', (e) => console.error(`[${vp.name}] pageerror: ${e.message}`));
  await page.goto(`${ORIGIN}/wycena/${search}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('[role="radiogroup"]');
  await new Promise((r) => setTimeout(r, 300));
  return { page, previewCalls };
}

const formState = (page) =>
  page.evaluate(() => ({
    checked: [...document.querySelectorAll('[role="radio"][aria-checked="true"]')].map((e) =>
      e.textContent.trim(),
    ),
    number: document.querySelector('input[type="number"]')?.value ?? null,
    linkBlocks: document.querySelectorAll('[data-testid="config-link"]').length,
    xss: window.__xss ?? null,
    polluted: Object.prototype.polluted ?? null,
    injected:
      [...document.querySelectorAll('img')].filter((i) => i.getAttribute('src') === 'x').length +
      [...document.scripts].filter((s) => s.textContent.includes('__xss')).length,
  }));

for (const vp of VIEWPORTS) {
  if (mode === 'off') {
    const { page, previewCalls } = await openPage(vp, `?k=${GOOD_K}`);
    const restored = await formState(page);
    const radio = await page.evaluateHandle(() =>
      [...document.querySelectorAll('[role="radio"]')].find(
        (e) => e.textContent.trim() === 'Sklep internetowy',
      ),
    );
    await radio.asElement().click();
    await new Promise((r) => setTimeout(r, 2000));
    const after = await formState(page);
    results[vp.name] = { restored, after, previewRequests: previewCalls.length };
    check(restored.checked.length === 0 && restored.number === '', `${vp.name} off: ?k= odczytany`);
    check(after.linkBlocks === 0, `${vp.name} off: przyciski linku w DOM`);
    check(
      previewCalls.length === 0,
      `${vp.name} off: ${previewCalls.length} zapytań public-preview`,
    );
    await page.close();
    continue;
  }

  // 1) dobry link: odtworzenie + pasek ceny jak po ręcznym wyborze
  const { page, previewCalls } = await openPage(vp, `?k=${GOOD_K}`);
  await page
    .waitForFunction(
      () => /27/.test(document.querySelector('[data-testid="live-price-bar"]')?.textContent ?? ''),
      {
        timeout: 6000,
        polling: 50,
      },
    )
    .catch(() => {});
  const restored = await formState(page);
  const barText = await page.evaluate(
    () => document.querySelector('[data-testid="live-price-bar"]')?.textContent ?? '',
  );
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
      const links = [r(btn('Skopiuj link')), r(btn('Udostępnij'))].filter(Boolean);
      const cookieEl = [...document.querySelectorAll('.cookie-floating-btn')].find(
        (e) => e.getBoundingClientRect().width > 0,
      );
      const cs = cookieEl ? getComputedStyle(cookieEl) : null;
      const cookieShown = !!cookieEl && cs.visibility !== 'hidden' && Number(cs.opacity) > 0;
      const cookie = cookieShown ? r(cookieEl) : null;
      const others = {
        bar: r(document.querySelector('[data-testid="live-price-bar"]')),
        wstecz: r(btn('Wstecz')),
        dalej: r(btn('Dalej')),
        podglad: r(document.querySelector('[data-testid="config-preview"]')),
      };
      const out = {
        links: links.length,
        sizes: links.map((l) => [Math.round(l.w), Math.round(l.h)]),
      };
      for (const [name, o] of Object.entries(others))
        out[name] = links.reduce((s, l) => s + ov(l, o), 0);
      out.cookieShown = cookieShown;
      out.podgladCookie = ov(others.podglad, cookie);
      out.listaCookie = ov(r(document.querySelector('[data-testid="config-scope"]')), cookie);
      out.linkCookie = links.reduce((s, l) => s + ov(l, cookie), 0);
      out.barCookie = ov(others.bar, cookie);
      out.wsteczCookie = ov(others.wstecz, cookie);
      out.dalejCookie = ov(others.dalej, cookie);
      return out;
    });
  await frames();
  const afterRestore = await covers();
  await page.evaluate(() => window.scrollTo(0, 0));
  await frames();
  const atTop = await covers();
  const maxY = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  );
  const COOKIE_KEYS = ['podgladCookie', 'listaCookie', 'linkCookie', 'barCookie', 'wsteczCookie', 'dalejCookie'];
  const sweep = { steps: 0, bar: 0, wstecz: 0, dalej: 0, podglad: 0, cookieHiddenSteps: 0 };
  for (const key of COOKIE_KEYS) sweep[key] = 0;
  for (let y = 0; y <= maxY; y += 50) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await frames();
    const c = await covers();
    sweep.steps += 1;
    for (const key of ['bar', 'wstecz', 'dalej', 'podglad', ...COOKIE_KEYS])
      sweep[key] = Math.max(sweep[key], c[key]);
    if (!c.cookieShown) sweep.cookieHiddenSteps += 1;
  }
  if (vp.shots) {
    await page.evaluate(() =>
      document
        .querySelector('[data-testid="config-link"]')
        ?.scrollIntoView({ block: 'center', behavior: 'instant' }),
    );
    await frames();
    await page.screenshot({
      path: path.join(OUT, 'shots', `${vp.name}-link.jpg`),
      type: 'jpeg',
      quality: 70,
    });
  }
  const sentAnswers = previewCalls[0]?.answers ?? null;
  await page.close();

  // 2) złośliwe linki
  const bad = {};
  for (const [name, kk] of Object.entries(BAD)) {
    const o = await openPage(vp, `?k=${kk}`);
    await new Promise((r) => setTimeout(r, 900));
    bad[name] = { ...(await formState(o.page)), previewRequests: o.previewCalls.length };
    await o.page.close();
  }

  results[vp.name] = { restored, barText, sentAnswers, afterRestore, atTop, sweep, bad };
  check(
    restored.checked.join() === 'Sklep internetowy' && restored.number === '2',
    `${vp.name}: link nie odtworzył odpowiedzi ${JSON.stringify(restored)}`,
  );
  check(/27/.test(barText), `${vp.name}: pasek ceny bez widełek po odtworzeniu`);
  check(
    JSON.stringify(sentAnswers) === JSON.stringify(ANSWERS),
    `${vp.name}: podgląd z innymi odpowiedziami ${JSON.stringify(sentAnswers)}`,
  );
  check(
    afterRestore.links === 2,
    `${vp.name}: ${afterRestore.links} przycisków linku (oczekiwane 2)`,
  );
  check(
    afterRestore.sizes.every(([w, h]) => w >= 44 && h >= 44),
    `${vp.name}: przycisk < 44 px ${JSON.stringify(afterRestore.sizes)}`,
  );
  for (const [label, v] of [
    ['poOdtworzeniu', afterRestore],
    ['gora', atTop],
    ['przewijanie', sweep],
  ])
    check(
      v.bar + v.wstecz + v.dalej + v.podglad === 0,
      `${vp.name} ${label}: nakładanie ${JSON.stringify(v)}`,
    );
  for (const [label, v] of [
    ['poOdtworzeniu', afterRestore],
    ['gora', atTop],
    ['przewijanie', sweep],
  ])
    check(
      COOKIE_KEYS.every((key) => v[key] === 0),
      `${vp.name} ${label}: przycisk ciasteczek nakłada się ${JSON.stringify(COOKIE_KEYS.map((key) => [key, v[key]]))}`,
    );
  check(atTop.cookieShown, `${vp.name}: przycisk ciasteczek niewidoczny na górze strony`);
  check(
    sweep.cookieHiddenSteps < sweep.steps,
    `${vp.name}: przycisk ciasteczek schowany na ${sweep.cookieHiddenSteps}/${sweep.steps} krokach`,
  );
  for (const [name, s] of Object.entries(bad))
    check(
      s.checked.length === 0 &&
        s.number === '' &&
        s.linkBlocks === 0 &&
        s.xss === null &&
        s.polluted === null &&
        s.injected === 0 &&
        s.previewRequests === 0,
      `${vp.name} zły link ${name}: ${JSON.stringify(s)}`,
    );
}

await browser.close();
server.close();
results.fails = fails;
await fs.writeFile(path.join(OUT, 'probe.json'), JSON.stringify(results, null, 2));
for (const [key, v] of Object.entries(results)) {
  if (key === 'fails' || key === 'mode') continue;
  console.log(`PROBE ${mode} ${key}: ${JSON.stringify(v)}`);
}
console.log(`PROBE ${mode} fails ${fails.length}: ${JSON.stringify(fails)}`);
process.exit(fails.length ? 1 : 0);
