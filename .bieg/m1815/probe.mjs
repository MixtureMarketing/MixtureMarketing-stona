#!/usr/bin/env node
/**
 * MIX-1815 (Z11): próba ekranu wyniku i przejścia do /contact/ na lokalnej budowie
 * (wzór .bieg/m1791/probe.mjs). Serwer statyczny na localhost; ruch poza localhost i każde żądanie
 * inne niż GET do własnego serwera jest abortowane (poza atrapą API wyceny). Turnstile = atrapa.
 *
 *   node .bieg/m1815/probe.mjs <dist> <out> on    (VITE_MM_RESULT_CONTACT=1 i VITE_MM_CONFIG_LINK=1)
 *   node .bieg/m1815/probe.mjs <dist> <out> off   (budowa bez przełączników)
 *
 * on (390 i 1366 px): pytanie views_count z tekstem P4; wynik „Twój projekt: … zł netto” z tekstem
 * P4; przyciski i linki wyniku ≥ 44×44 px; 0 px² nakładania WIDOCZNEGO przycisku ciasteczek na
 * przyciski wyniku (u góry i co 50 px przewijania); klik „Umów rozmowę” = /contact/ z ramką
 * konfiguracji (etykiety, netto, link ?k=) i e-mailem w kroku 1. Zrzuty: wynik i kontakt.
 * off (390 px): stary wynik (bez „netto”), tekst pytania z D1, /contact/ bez ramki i z pustym e-mailem.
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

const D1_VIEWS = 'Ile unikalnych podstron/widoków?';
const P4_VIEWS = 'Ile mniej więcej podstron? (Start, O nas, Oferta, Kontakt = 4)';
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
      sort_order: 0,
    },
    {
      code: 'views_count',
      text: D1_VIEWS,
      help_text: null,
      answer_type: 'number',
      options: null,
      visible_if: null,
      group: 'projekt',
      sort_order: 1,
    },
  ],
};
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
        { name: 'm390', width: 390, height: 844, mobile: true },
        { name: 'd1366', width: 1366, height: 768, mobile: false },
      ]
    : [{ name: 'm390', width: 390, height: 844, mobile: true }];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  const quoteCalls = [];
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
    if (u.pathname === '/api/estimation/public-quote' && req.method() === 'POST') {
      quoteCalls.push(JSON.parse(req.postData() || '{}'));
      return req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          priceRange: { min: 27500, max: 53000 },
          currency: 'PLN',
          status: 'ok',
        }),
      });
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
  });
  page.on('pageerror', (e) => console.error(`[${vp.name}] pageerror: ${e.message}`));
  await page.goto(`${ORIGIN}/wycena/`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('[role="radiogroup"]');
  await page.addStyleTag({ content: '*{transition:none!important;animation:none!important}' });
  const r = {};
  r.questionText = await page.evaluate(
    (a, b) => ({
      p4: document.body.innerText.includes(a),
      d1: document.body.innerText.includes(b),
    }),
    P4_VIEWS,
    D1_VIEWS,
  );
  // MIX-1815 r2: przycisk ciasteczek nad kontrolkami formularza (opcje, pola, przyciski kroków),
  // przewijanie co 50 px; liczy widoczny przycisk (visibility/opacity/display).
  const formSweep = async () => {
    const maxF = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    const out = { steps: 0, covered: 0, maxCover: 0, cookieButtons: 0 };
    for (let y = 0; y <= maxF; y += 50) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.evaluate(
        () => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))),
      );
      const m = await page.evaluate(() => {
        const box = document.querySelector('[data-testid="calc-form-box"]') ?? document.body;
        const ctrls = [...box.querySelectorAll('label, input, select, textarea, button, a[href]')];
        let cover = 0;
        const btns = document.querySelectorAll('.cookie-floating-btn');
        for (const c of btns) {
          const cs = getComputedStyle(c);
          if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0)
            continue;
          const cb = c.getBoundingClientRect();
          for (const a of ctrls) {
            const ab = a.getBoundingClientRect();
            const w = Math.min(ab.right, cb.right) - Math.max(ab.left, cb.left);
            const h = Math.min(ab.bottom, cb.bottom) - Math.max(ab.top, cb.top);
            if (w > 0 && h > 0) cover += Math.round(w * h);
          }
        }
        return { cover, n: btns.length };
      });
      out.steps += 1;
      out.cookieButtons = Math.max(out.cookieButtons, m.n);
      if (m.cover > 0) out.covered += 1;
      out.maxCover = Math.max(out.maxCover, m.cover);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    return out;
  };
  r.form1 = await formSweep();
  const clickText = async (sel, text) => {
    const h = await page.evaluateHandle(
      // r3: przy VITE_MM_LEAD_CONFIG=1 (Preview) przycisk wysyłki to „Wyślij i umów rozmowę”.
      (s, t) =>
        [...document.querySelectorAll(s)].find(
          (e) =>
            e.textContent.trim() === t ||
            (t === 'Poznaj widełki' && e.textContent.trim() === 'Wyślij i umów rozmowę'),
        ),
      sel,
      text,
    );
    const el = h.asElement();
    if (!el) throw new Error(`brak ${sel} „${text}”`);
    await el.click();
  };
  await clickText('[role="radio"]', 'Portal');
  await page.type('input[type="number"]', '6');
  await clickText('button', 'Dalej');
  await page.waitForSelector('input[type="email"]');
  r.form2 = await formSweep();
  await page.type('input[type="email"]', 'jan@firma.pl');
  await clickText('button', 'Poznaj widełki');
  await page.waitForFunction(() => /Policz jeszcze raz/.test(document.body.innerText), {
    timeout: 8000,
  });
  await sleep(300);
  const frames = () =>
    page.evaluate(
      () => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))),
    );
  const measure = () =>
    page.evaluate(() => {
      const root = document.querySelector('[data-testid="calc-result"]');
      const resultText = (root ?? document.querySelector('main') ?? document.body).innerText;
      const actions = [...document.querySelectorAll('a, button')].filter((e) =>
        ['Umów rozmowę', 'Policz jeszcze raz'].includes(e.textContent.trim()),
      );
      const sizes = actions.map((e) => {
        const b = e.getBoundingClientRect();
        return [e.textContent.trim(), Math.round(b.width), Math.round(b.height)];
      });
      let cover = 0;
      for (const c of document.querySelectorAll('.cookie-floating-btn')) {
        const cs = getComputedStyle(c);
        if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0)
          continue;
        const cb = c.getBoundingClientRect();
        for (const a of actions) {
          const ab = a.getBoundingClientRect();
          const w = Math.min(ab.right, cb.right) - Math.max(ab.left, cb.left);
          const h = Math.min(ab.bottom, cb.bottom) - Math.max(ab.top, cb.top);
          if (w > 0 && h > 0) cover += Math.round(w * h);
        }
      }
      return {
        netto: /Twój projekt: 27\s500\s–\s53\s000\szł netto/.test(resultText),
        p4: resultText.includes('To orientacja z naszego modelu wyceny, nie oferta.'),
        cookieButtons: document.querySelectorAll('.cookie-floating-btn').length,
        sizes,
        cover,
      };
    });
  await page.evaluate(() => window.scrollTo(0, 0));
  await frames();
  r.top = await measure();
  const maxY = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  );
  r.sweep = { steps: 0, maxCover: 0 };
  for (let y = 0; y <= maxY; y += 50) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await frames();
    const m = await measure();
    r.sweep.steps += 1;
    r.sweep.maxCover = Math.max(r.sweep.maxCover, m.cover);
  }
  await page.evaluate(() =>
    [...document.querySelectorAll('a')]
      .find((e) => e.textContent.trim() === 'Umów rozmowę')
      ?.scrollIntoView({ block: 'center', behavior: 'instant' }),
  );
  await frames();
  r.centered = await measure();
  await page.screenshot({
    path: path.join(OUT, 'shots', `${mode}-${vp.name}-wynik.jpg`),
    type: 'jpeg',
    quality: 70,
  });

  await clickText('a', 'Umów rozmowę');
  await page.waitForFunction(() => location.pathname === '/contact/', { timeout: 8000 });
  await page.waitForSelector('input[type="email"]', { timeout: 8000 });
  await sleep(500);
  r.contact = await page.evaluate(() => {
    const box = document.querySelector('[data-testid="contact-calculator-config"]');
    return {
      path: location.pathname,
      search: location.search,
      box: !!box,
      boxText: box?.innerText ?? '',
      email: document.querySelector('input[type="email"]')?.value ?? null,
    };
  });
  if (r.contact.box)
    await page.evaluate(() =>
      document
        .querySelector('[data-testid="contact-calculator-config"]')
        ?.scrollIntoView({ block: 'start', behavior: 'instant' }),
    );
  else
    await page.evaluate(() => document.querySelector('form')?.scrollIntoView({ block: 'start' }));
  await page.evaluate(() => window.scrollBy(0, -80));
  await frames();
  await page.screenshot({
    path: path.join(OUT, 'shots', `${mode}-${vp.name}-kontakt.jpg`),
    type: 'jpeg',
    quality: 70,
  });
  r.quoteCalls = quoteCalls.length;
  results[vp.name] = r;
  await page.close();

  const n = vp.name;
  if (mode === 'on') {
    check(
      r.questionText.p4 && !r.questionText.d1,
      `${n}: pytanie bez tekstu P4 ${JSON.stringify(r.questionText)}`,
    );
    check(r.top.netto && r.top.p4, `${n}: wynik bez treści P4 ${JSON.stringify(r.top)}`);
    check(
      r.top.sizes.length === 2 && r.top.sizes.every(([, w, h]) => w >= 44 && h >= 44),
      `${n}: przycisk wyniku < 44 px ${JSON.stringify(r.top.sizes)}`,
    );
    check(r.top.cookieButtons >= 1, `${n}: brak przycisku ciasteczek na stronie (próba bez sensu)`);
    for (const k of ['form1', 'form2']) {
      check(r[k].cookieButtons >= 1 && r[k].steps > 0, `${n}: ${k} bez przycisku ciasteczek`);
      check(r[k].covered === 0, `${n}: ciasteczka zasłaniają kontrolki ${k} ${JSON.stringify(r[k])}`);
    }
    check(
      r.top.cover + r.sweep.maxCover + r.centered.cover === 0,
      `${n}: ciasteczka zasłaniają ${JSON.stringify([r.top.cover, r.sweep, r.centered.cover])}`,
    );
    check(
      r.contact.path === '/contact/' && r.contact.search === '',
      `${n}: adres kontaktu ${r.contact.path}${r.contact.search}`,
    );
    check(r.contact.box, `${n}: brak ramki konfiguracji na /contact/`);
    for (const t of [
      'Jaki jest cel projektu? Portal',
      `${P4_VIEWS} 6`,
      'zł netto',
      'Link do konfiguracji: ',
    ])
      check(r.contact.boxText.includes(t), `${n}: ramka bez „${t}”`);
    check(
      !/\bportal\b/.test(r.contact.boxText.replace(/\/wycena\/\?k=\S+/, '')),
      `${n}: kod opcji zamiast etykiety`,
    );
    check(r.contact.email === 'jan@firma.pl', `${n}: e-mail w kroku 1 = ${r.contact.email}`);
  } else {
    check(
      !r.questionText.p4 && r.questionText.d1,
      `${n} off: tekst pytania ${JSON.stringify(r.questionText)}`,
    );
    check(!r.top.netto && !r.top.p4, `${n} off: nowe treści wyniku`);
    check(
      !r.contact.box && r.contact.email === '',
      `${n} off: konfiguracja na /contact/ ${JSON.stringify(r.contact)}`,
    );
  }
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
