#!/usr/bin/env node
/**
 * MIX-1897: sonda ekranu wyniku /wycena/ po scaleniu terminów rozmowy (MIX-1814) z nowym wyglądem
 * (MIX-1867) i osią czasu (MIX-1816) na lokalnej budowie, przy 390 i 1366 px.
 *
 *   node .bieg/m1897/probe.mjs <dist> <out> <ui:0|1> <timeline:0|1> <booking:0|1>
 *
 * Budowa: VITE_MM_LEAD_CONFIG=1 + trzy przełączniki wg argumentów. API wyceny = atrapa,
 * Turnstile = atrapa, analityka zablokowana przez scripts/lib/prod-safe.mjs. Ruch do
 * calendar.google.com jest liczony i NIE wychodzi do sieci (po kliknięciu atrapa pustej strony),
 * reszta ruchu zewnętrznego przerwana. Mierzy: wygląd ekranu wyniku, obecność i kolejność ramki
 * terminów i osi czasu (oś ostatnia, terminy tuż przed nią), 0 ramek i 0 żądań do kalendarza przed
 * kliknięciem, zdarzenie calculator_booking_open, brak poziomego przewijania.
 * Kod wyjścia 0 = progi spełnione, 1 = nie, 2 = złe wywołanie.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { createProdSafe } from '../../scripts/lib/prod-safe.mjs';

const [distArg, outArg, uiA, tlA, bkA] = process.argv.slice(2);
const bit = (v) => (v === '0' || v === '1' ? v === '1' : null);
const UI = bit(uiA);
const TL = bit(tlA);
const BK = bit(bkA);
if (!distArg || !outArg || UI === null || TL === null || BK === null) {
  console.error('użycie: probe.mjs <dist> <out> <ui 0|1> <timeline 0|1> <booking 0|1>');
  process.exit(2);
}
const NAME = `u${uiA}-t${tlA}-b${bkA}`;
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
const FAKE_TURNSTILE = `window.turnstile = { render: () => 'w1', execute() {}, reset() {},
  getResponse: () => 'e2e-token', remove() {} };`;
const isCalendar = (h) => /(^|\.)calendar\.google\.com$/.test(h);

const VIEWPORTS = [
  { w: 390, h: 844, mobile: true },
  { w: 1366, h: 900, mobile: false },
];
const fails = [];
const results = [];
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
safe.watchBrowser(browser);

try {
  for (const vp of VIEWPORTS) {
    const tag = `${NAME}@${vp.w}`;
    const check = (ok, msg) => {
      if (!ok) fails.push(`${tag}: ${msg}`);
    };
    const log = { clicked: false, calendarBefore: 0, calendarAfter: 0, quotePosts: 0 };
    const r = { vp: vp.w };
    const page = await browser.newPage();
    await page.setViewport({
      width: vp.w,
      height: vp.h,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      deviceScaleFactor: 1,
    });
    await safe.protect(page, {
      handler: (req) => {
        const u = new URL(req.url());
        if (isCalendar(u.hostname)) {
          if (!log.clicked) {
            log.calendarBefore += 1;
            return req.abort();
          }
          log.calendarAfter += 1;
          return req.respond({
            status: 200,
            contentType: 'text/html',
            body: '<html><body>atrapa</body></html>',
          });
        }
        if (u.hostname === 'challenges.cloudflare.com') {
          return req.respond({ status: 200, contentType: 'text/javascript', body: FAKE_TURNSTILE });
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
            log.quotePosts += 1;
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
    page.on('pageerror', (e) => {
      console.error(`pageerror ${tag}: ${e.message}`);
      fails.push(`${tag}: pageerror ${e.message.slice(0, 120)}`);
    });
    try {
      await page.goto(`${ORIGIN}/wycena/`, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.waitForSelector('[role="radio"]', { timeout: 30000 });
      await page.evaluate(() =>
        [...document.querySelectorAll('[role="radio"]')]
          .find((e) => /Wizytówka/.test(e.textContent))
          .click(),
      );
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
      await clickText(/^Dalej/);
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.type('input[type="email"]', 'e2e@example.com');
      await new Promise((res) => setTimeout(res, 1000));
      r.calendarBeforeClick = log.calendarBefore;
      r.iframesBeforeClick = await page.evaluate(() => document.querySelectorAll('iframe').length);
      log.clicked = true;
      await clickText(/^Wyślij i umów rozmowę/);
      await page.waitForFunction(() => /orientacyjne widełki/i.test(document.body.innerText), {
        timeout: 15000,
      });
      if (BK)
        await page.waitForSelector('[data-testid="booking-embed"] iframe', { timeout: 10000 });
      await new Promise((res) => setTimeout(res, 800));
      Object.assign(
        r,
        await page.evaluate(() => {
          const newBox = document.querySelector('[data-testid="calc-result"]');
          const oldBox = document.querySelector('div.text-center.space-y-6');
          const box = newBox ?? oldBox;
          const bk = document.querySelectorAll('[data-testid="booking-embed"]');
          const tl = document.querySelectorAll('[data-testid="new-client-timeline"]');
          const kids = box ? [...box.children] : [];
          const idx = (el) => (el ? kids.indexOf(el) : -1);
          const rect = (el) => (el ? el.getBoundingClientRect() : null);
          const bkR = rect(bk[0]);
          const tlR = rect(tl[0]);
          return {
            newScreen: !!newBox,
            oldScreen: !!oldBox,
            bookingCount: bk.length,
            timelineCount: tl.length,
            bookingInBox: !!(bk[0] && box && bk[0].parentElement === box),
            timelineLast: !!(tl[0] && box && box.lastElementChild === tl[0]),
            bookingLast: !!(bk[0] && box && box.lastElementChild === bk[0]),
            bookingIdx: idx(bk[0]),
            timelineIdx: idx(tl[0]),
            children: kids.length,
            bookingAboveTimeline: !!(bkR && tlR && bkR.bottom <= tlR.top + 1),
            bookingWidth: bkR ? Math.round(bkR.width) : 0,
            iframes: document.querySelectorAll('iframe').length,
            scrollWidth: document.documentElement.scrollWidth,
          };
        }),
      );
      const attempts = await page.evaluate(() => window.__attempt);
      r.bookingOpen = attempts.filter(([e]) => e === 'calculator_booking_open').length;
      r.calendarAfterClick = log.calendarAfter;
      r.quotePosts = log.quotePosts;
      await page.screenshot({
        path: path.join(OUT, 'shots', `${NAME}-${vp.w}.jpg`),
        type: 'jpeg',
        quality: 60,
        fullPage: true,
      });

      check(
        r.calendarBeforeClick === 0,
        `żądania kalendarza przed kliknięciem ${r.calendarBeforeClick}`,
      );
      check(r.iframesBeforeClick === 0, `ramki przed kliknięciem ${r.iframesBeforeClick}`);
      check(r.quotePosts === 1, `POST public-quote ${r.quotePosts}`);
      check(UI ? r.newScreen && !r.oldScreen : r.oldScreen && !r.newScreen, 'zły wygląd wyniku');
      check(r.scrollWidth <= vp.w, `poziomy przewijacz ${r.scrollWidth}`);
      if (BK) {
        check(
          r.bookingCount === 1 && r.bookingInBox,
          `terminy: ${r.bookingCount}, w ekranie ${r.bookingInBox}`,
        );
        check(r.iframes === 1, `ramki po kliknięciu ${r.iframes}`);
        check(r.bookingOpen === 1, `calculator_booking_open ${r.bookingOpen}`);
        check(r.calendarAfterClick > 0, 'brak żądania do kalendarza po kliknięciu');
        check(r.bookingWidth > 0 && r.bookingWidth <= vp.w, `szerokość terminów ${r.bookingWidth}`);
      } else {
        check(
          r.bookingCount === 0 && r.iframes === 0,
          `terminy przy wyłączonym ${r.bookingCount}/${r.iframes}`,
        );
        check(r.bookingOpen === 0, `calculator_booking_open przy wyłączonym ${r.bookingOpen}`);
        check(r.calendarAfterClick === 0, `kalendarz przy wyłączonym ${r.calendarAfterClick}`);
      }
      if (TL) {
        check(
          r.timelineCount === 1 && r.timelineLast,
          `oś: ${r.timelineCount}, ostatnia ${r.timelineLast}`,
        );
        if (BK) {
          check(
            r.bookingIdx === r.timelineIdx - 1,
            `terminy nie tuż przed osią ${r.bookingIdx}/${r.timelineIdx}`,
          );
          check(r.bookingAboveTimeline, 'terminy nie nad osią na ekranie');
        }
      } else {
        check(r.timelineCount === 0, `oś przy wyłączonej ${r.timelineCount}`);
        if (BK) check(r.bookingLast, 'bez osi terminy nie są ostatnie');
      }
    } catch (e) {
      fails.push(`${tag}: BLAD ${e?.message || e}`);
    }
    results.push(r);
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
const guard = safe.finish();
await fs.writeFile(path.join(OUT, 'probe.json'), JSON.stringify({ NAME, results, fails }, null, 2));
console.log(`PROBE ${NAME} ${JSON.stringify(results)}`);
console.log(`PROBE ${NAME} fails=${fails.length} guard=${guard.ok} ${fails.join(' | ')}`);
process.exit(fails.length === 0 && guard.ok ? 0 : 1);
