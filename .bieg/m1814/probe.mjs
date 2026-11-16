#!/usr/bin/env node
/**
 * MIX-1814 (Z9, wariant A): próba harmonogramu rozmów pod wynikiem /wycena/ na lokalnej budowie.
 *
 *   node .bieg/m1814/probe.mjs <katalog-dist> <katalog-wyników> on|off
 *
 * Budowa: VITE_MM_LEAD_CONFIG=1 VITE_MM_BOOKING_EMBED=1 npx vite build --outDir <dist> (on).
 * Skrypt serwuje dist na 127.0.0.1. API wyceny to atrapa (public-questions, public-quote 200);
 * Turnstile to atrapa `window.turnstile`; `window.zaraz.track` zapisuje próby zdarzeń. Blokada
 * analityki ze wspólnego scripts/lib/prod-safe.mjs (protect/watchBrowser/finish). Ruch zewnętrzny:
 * przerwany, OPRÓCZ hostów Google potrzebnych ramce harmonogramu (calendar.google.com, *.gstatic.com,
 * *.googleapis.com, *.googleusercontent.com, accounts/apis.google.com) — tylko GET, tylko po
 * kliknięciu (wcześniej każde żądanie do calendar.google.com jest liczone i przerywane).
 * Mierzy (390 x 844): żądania do calendar.google.com przed kliknięciem, POST public-quote,
 * kolejność POST → pierwsze żądanie do kalendarza, zdarzenia calculator_booking_open, ramkę i godziny
 * wolnych terminów w jej tekście; zrzuty przed i po kliknięciu. Wyniki: probe.json + shots/.
 * Kod wyjścia 0 = progi spełnione, 1 = nie, 2 = złe wywołanie.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { createProdSafe } from '../../scripts/lib/prod-safe.mjs';

const [distArg, outArg, mode] = process.argv.slice(2);
if (!distArg || !outArg || !['on', 'off'].includes(mode)) {
  console.error('użycie: probe.mjs <dist> <out> on|off');
  process.exit(2);
}
const ON = mode === 'on';
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
const safe = createProdSafe(ORIGIN);

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
      ],
      visible_if: null,
      group: 'projekt',
      sort_order: 1,
    },
  ],
};
const QUOTE = { priceRange: { min: 8000, max: 15000 }, currency: 'PLN', status: 'ok' };
const GOOGLE_OK = [
  /(^|\.)calendar\.google\.com$/,
  /(^|\.)gstatic\.com$/,
  /(^|\.)googleapis\.com$/,
  /(^|\.)googleusercontent\.com$/,
  /^(accounts|apis|ssl|www)\.google\.com$/,
];
const isCalendar = (h) => /(^|\.)calendar\.google\.com$/.test(h);

const log = { t0: Date.now(), clicked: null, calendar: [], quotePosts: [], blocked: [] };
const now = () => Date.now() - log.t0;

const browser = await puppeteer.launch({
  headless: true,
  // Ramka Google w tym samym procesie: przechwytywanie żądań obejmuje też jej dokument.
  args: ['--no-sandbox', '--disable-features=site-per-process,IsolateOrigins'],
});
safe.watchBrowser(browser);
const fails = [];
const check = (ok, msg) => {
  if (!ok) fails.push(msg);
};
const result = { mode };

try {
  const page = await browser.newPage();
  await page.setViewport({
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  await safe.protect(page, {
    userAgent:
      'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36',
    onBlocked: (req) => log.blocked.push(new URL(req.url()).hostname),
    handler: (req) => {
      const u = new URL(req.url());
      if (isCalendar(u.hostname)) {
        log.calendar.push({ t: now(), afterClick: log.clicked !== null, method: req.method() });
        if (log.clicked === null) return req.abort();
      }
      if (u.origin === ORIGIN) {
        if (u.pathname === '/api/estimation/public-questions') {
          return req.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(QUESTIONS),
          });
        }
        if (u.pathname === '/api/estimation/public-quote' && req.method() === 'POST') {
          log.quotePosts.push({ t: now(), keys: Object.keys(JSON.parse(req.postData() || '{}')) });
          return req.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(QUOTE),
          });
        }
        if (u.pathname.startsWith('/api/') || u.pathname.startsWith('/cdn-cgi/')) {
          return req.respond({ status: 404, body: '' });
        }
        return req.continue();
      }
      if (log.clicked !== null && req.method() === 'GET' && GOOGLE_OK.some((r) => r.test(u.hostname)))
        return req.continue();
      log.blocked.push(u.hostname);
      return req.abort();
    },
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
    window.__attempt = [];
    window.zaraz = {
      track: (e, d) => {
        window.__attempt.push([e, d]);
        return Promise.resolve();
      },
      consent: { APIReady: true, set: () => {} },
    };
  });
  page.on('pageerror', (e) => console.error(`pageerror: ${e.message}`));

  await page.goto(`${ORIGIN}/wycena/`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForSelector('[role="radio"]', { timeout: 30000 });
  const radio = await page.evaluateHandle(() =>
    [...document.querySelectorAll('[role="radio"]')].find(
      (e) => e.textContent.trim() === 'Wizytówka',
    ),
  );
  await radio.asElement().click();
  const clickText = async (re) => {
    const ok = await page.evaluate((src) => {
      const b = [...document.querySelectorAll('button')].find((x) =>
        new RegExp(src).test(x.textContent.trim()),
      );
      if (b) {
        b.scrollIntoView({ block: 'center', behavior: 'instant' });
        b.click();
      }
      return !!b;
    }, re.source);
    if (!ok) throw new Error(`brak przycisku ${re}`);
  };
  await clickText(/^Dalej$/);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.type('input[type="email"]', 'e2e@example.com');
  const btnLabel = ON ? 'Wyślij i umów rozmowę' : 'Poznaj widełki';
  await new Promise((r) => setTimeout(r, 1500)); // „cisza” przed kliknięciem: nic nie woła kalendarza
  result.calendarBeforeClick = log.calendar.length;
  result.iframesBeforeClick = await page.evaluate(() => document.querySelectorAll('iframe').length);
  result.calendarInDomBeforeClick = await page.evaluate(
    () => (document.documentElement.outerHTML.match(/calendar\.google\.com/g) ?? []).length,
  );
  await page.screenshot({ path: path.join(OUT, 'shots', `m390-${mode}-przed.jpg`), type: 'jpeg', quality: 70 });

  log.clicked = now();
  await clickText(new RegExp(`^${btnLabel}$`));
  await page.waitForFunction(() => /Orientacyjne widełki/.test(document.body.innerText), {
    timeout: 15000,
  });

  if (ON) {
    const frameEl = await page.waitForSelector('[data-testid="booking-embed"] iframe', {
      timeout: 10000,
    });
    result.frameVisibleMs = now() - log.clicked;
    await frameEl.evaluate((e) =>
      e.closest('section').scrollIntoView({ block: 'start', behavior: 'instant' }),
    );
    // Wolne terminy: godziny HH:MM w tekście ramki Google (do 25 s, sieć chmury bywa wolna).
    let frameText = '';
    const t1 = Date.now();
    while (Date.now() - t1 < 25000) {
      const fr = page.frames().find((f) => /calendar\.google\.com/.test(f.url()));
      if (fr) {
        try {
          frameText = await fr.evaluate(() => document.body?.innerText ?? '');
        } catch {
          frameText = '';
        }
        if (/\b\d{1,2}:\d{2}\b/.test(frameText)) break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    result.slotTimes = [...new Set(frameText.match(/\b\d{1,2}:\d{2}\b/g) ?? [])].slice(0, 12);
    result.frameTextChars = frameText.length;
    result.slotsMs = result.slotTimes.length ? now() - log.clicked : null;
    await new Promise((r) => setTimeout(r, 1000));
  } else {
    await new Promise((r) => setTimeout(r, 2000));
  }
  await page.screenshot({ path: path.join(OUT, 'shots', `m390-${mode}-po.jpg`), type: 'jpeg', quality: 70 });

  result.iframesAfter = await page.evaluate(() => document.querySelectorAll('iframe').length);
  result.calendarAfterClick = log.calendar.filter((c) => c.afterClick).length;
  result.quotePosts = log.quotePosts.length;
  result.postBeforeCalendar =
    log.quotePosts.length > 0 &&
    (log.calendar.length === 0 || log.quotePosts[0].t <= log.calendar[0].t);
  const attempts = await page.evaluate(() => window.__attempt);
  result.bookingOpen = attempts.filter(([e]) => e === 'calculator_booking_open').length;
  result.bookingOpenParams = attempts
    .filter(([e]) => e === 'calculator_booking_open')
    .map(([, d]) => d);
  result.emailInEvents = JSON.stringify(attempts).includes('e2e@example.com');
  result.blockedHosts = [...new Set(log.blocked)].slice(0, 20);
  result.scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);

  check(result.calendarBeforeClick === 0, `żądania do kalendarza przed kliknięciem: ${result.calendarBeforeClick}`);
  check(result.iframesBeforeClick === 0, `ramki przed kliknięciem: ${result.iframesBeforeClick}`);
  check(result.calendarInDomBeforeClick === 0, 'adres kalendarza w DOM przed kliknięciem');
  check(result.quotePosts === 1, `POST public-quote: ${result.quotePosts}`);
  check(!result.emailInEvents, 'e-mail w zdarzeniach');
  check(result.scrollWidth <= 390, `poziomy przewijacz: ${result.scrollWidth}`);
  if (ON) {
    check(result.bookingOpen === 1, `calculator_booking_open: ${result.bookingOpen}`);
    check(result.iframesAfter === 1, `ramki po kliknięciu: ${result.iframesAfter}`);
    check(result.calendarAfterClick > 0, 'brak żądania do kalendarza po kliknięciu');
    check(result.postBeforeCalendar, 'kalendarz przed zapisem leada');
    check(result.slotTimes.length > 0, 'brak godzin wolnych terminów w ramce');
  } else {
    check(result.bookingOpen === 0, `calculator_booking_open przy wyłączonym: ${result.bookingOpen}`);
    check(result.iframesAfter === 0, `ramki przy wyłączonym: ${result.iframesAfter}`);
    check(result.calendarAfterClick === 0, 'żądania do kalendarza przy wyłączonym');
  }
} catch (e) {
  fails.push(`BLAD ${e?.message || e}`);
  await fs.writeFile(path.join(OUT, 'log.json'), JSON.stringify(log, null, 2));
} finally {
  await browser.close();
  server.close();
}
const guard = safe.finish();
result.fails = fails;
await fs.writeFile(path.join(OUT, 'probe.json'), JSON.stringify(result, null, 2));
console.log(`PROBE ${mode} ${JSON.stringify(result)}`);
console.log(`PROBE ${mode} fails=${fails.length} ${fails.join(' | ')}`);
process.exit(fails.length === 0 && guard.ok ? 0 : 1);
