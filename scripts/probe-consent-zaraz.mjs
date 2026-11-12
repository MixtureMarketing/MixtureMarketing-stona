// Sonda przeglądarkowa MIX-1389: zgoda → Zaraz Consent API na lokalnym buildzie (vite preview).
//
// Zaraz wstrzykuje edge Cloudflare, więc lokalnie go nie ma: sonda podstawia atrapę
// `window.zaraz` z Consent API gotowym po opóźnieniu (zdarzenie `zarazConsentAPIReady`)
// albo nigdy. Każde żądanie spoza pętli zwrotnej i każda analityka są PRZERYWANE
// (scripts/lib/prod-safe.mjs); żądania do hostów Google są liczone przed przerwaniem.
//
// Użycie (z katalogu repo, po `npx vite build`):
//   node scripts/probe-consent-zaraz.mjs [wynik.json]
// Kod wyjścia 0 = wszystkie scenariusze zgodne, 1 = rozbieżność.
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { writeFileSync } from 'node:fs';
import { isAnalyticsUrl, isProdUrl, withE2eUa } from './lib/prod-safe.mjs';

const PORT = 4179;
const BASE = `http://127.0.0.1:${PORT}/`;
const OUT = process.argv[2] || '.bieg/m1389/probe.json';
const KEY = 'cookie-consent-v2';
const GOOGLE_HOST =
  /(^|\.)(google|googletagmanager|google-analytics|doubleclick|googleadservices|googlesyndication|gstatic)\.[a-z.]+$/i;
const API_DELAY_MS = 1500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const waitForServer = async (url, timeout = 60000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const ok = await new Promise((resolve) => {
      http
        .get(url, (res) => {
          res.resume();
          resolve(res.statusCode !== undefined && res.statusCode < 500);
        })
        .on('error', () => resolve(false));
    });
    if (ok) return;
    await sleep(500);
  }
  throw new Error(`serwer ${url} nie wstał w ${timeout} ms`);
};

// Atrapa Zaraz: consent.set zapisuje wywołania; API gotowe po `delay` ms (null = nigdy).
const zarazStub = (delay, stored) => {
  if (stored !== undefined) {
    try {
      window.localStorage.setItem('cookie-consent-v2', stored);
    } catch {
      /* brak storage */
    }
  }
  window.__consentCalls = [];
  window.zaraz = {
    track: () => undefined,
    set: () => undefined,
    consent: {
      APIReady: false,
      set: (p) => window.__consentCalls.push(p),
    },
  };
  if (delay !== null) {
    setTimeout(() => {
      window.zaraz.consent.APIReady = true;
      document.dispatchEvent(new Event('zarazConsentAPIReady'));
    }, delay);
  }
};

const openPage = async (browser, { delay, stored }) => {
  const page = await browser.newPage();
  const google = [];
  await page.setUserAgent({ userAgent: withE2eUa(await browser.userAgent()) });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    let host = '';
    try {
      host = new URL(url).hostname;
    } catch {
      /* zły adres = przerwany */
    }
    if (GOOGLE_HOST.test(host)) google.push(url.slice(0, 120));
    if (isAnalyticsUrl(url) || isProdUrl(url) || GOOGLE_HOST.test(host)) {
      req.abort('blockedbyclient').catch(() => {});
      return;
    }
    req.continue().catch(() => {});
  });
  await page.evaluateOnNewDocument(zarazStub, delay, stored);
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  return { page, google };
};

const calls = (page) => page.evaluate(() => window.__consentCalls);
const bannerOpen = (page) =>
  page.evaluate(() => !!document.querySelector('[aria-label="Baner plików cookies"]'));

const results = [];
const check = (name, ok, measured) => results.push({ name, ok: !!ok, measured });

const server = spawn(
  'npx',
  ['vite', 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'],
  {
    stdio: 'ignore',
  },
);
let browser;
try {
  await waitForServer(BASE);
  browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

  // S1: nowy gość, API późne. Przed zgodą: 0 żądań Google, 0 wywołań consent.set.
  {
    const { page, google } = await openPage(browser, { delay: API_DELAY_MS });
    await page.waitForSelector('[aria-label="Baner plików cookies"]', { timeout: 20000 });
    await sleep(API_DELAY_MS + 1000);
    const before = await calls(page);
    check('S1 przed zgodą: 0 żądań Google', google.length === 0, { google: google.length });
    check('S1 przed zgodą: 0 wywołań consent.set', before.length === 0, { calls: before });
    const [btn] = await page.$$('xpath/.//button[contains(., "Akceptuję wszystkie")]');
    await btn.click();
    await sleep(300);
    const after = await calls(page);
    check(
      'S1 klik zgody: cele ustawione raz {kese:true,Pzjv:true}',
      after.length === 1 && after[0].kese === true && after[0].Pzjv === true,
      { calls: after },
    );
    await page.close();
  }

  // S2: powracający gość, API późne: 0 przed gotowością, dokładnie 1 po.
  {
    const stored = JSON.stringify({ analytics: true, marketing: false });
    const { page, google } = await openPage(browser, { delay: API_DELAY_MS, stored });
    await sleep(API_DELAY_MS / 2);
    const early = await calls(page);
    await sleep(API_DELAY_MS + 1000);
    const late = await calls(page);
    check('S2 powrót, API późne: 0 przed gotowością', early.length === 0, { calls: early });
    check(
      'S2 powrót, API późne: dokładnie 1 po gotowości {kese:true,Pzjv:false}',
      late.length === 1 && late[0].kese === true && late[0].Pzjv === false,
      { calls: late },
    );
    check('S2 baner zamknięty', !(await bannerOpen(page)), {});
    check('S2 0 żądań Google', google.length === 0, { google: google.length });
    await page.close();
  }

  // S3: powracający gość, API nigdy: nic nie wysłane.
  {
    const stored = JSON.stringify({ analytics: true, marketing: true });
    const { page } = await openPage(browser, { delay: null, stored });
    await sleep(API_DELAY_MS + 1500);
    const c = await calls(page);
    check('S3 powrót, API nigdy: 0 wywołań', c.length === 0, { calls: c });
    await page.close();
  }

  // S4: podmieniony wpis → baner, 0 wywołań nawet po gotowości API.
  {
    const stored = '{"analytics":"true","marketing":true}';
    const { page } = await openPage(browser, { delay: 200, stored });
    await page.waitForSelector('[aria-label="Baner plików cookies"]', { timeout: 20000 });
    await sleep(800);
    const c = await calls(page);
    check('S4 podmieniony wpis: baner + 0 wywołań', c.length === 0, { calls: c });
    await page.close();
  }
} catch (e) {
  check('sonda bez wyjątku', false, { error: String(e && e.message ? e.message : e) });
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}

const ok = results.length > 0 && results.every((r) => r.ok);
writeFileSync(OUT, JSON.stringify({ ok, base: BASE, results }, null, 2));
for (const r of results)
  console.log(`${r.ok ? 'OK ' : 'NIE'} ${r.name} ${JSON.stringify(r.measured)}`);
console.log(`SONDA: ${results.filter((r) => r.ok).length}/${results.length} OK`);
process.exit(ok ? 0 : 1);
