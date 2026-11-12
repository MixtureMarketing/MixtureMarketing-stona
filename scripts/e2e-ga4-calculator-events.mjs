// MIX-1384 (Z3): próba w przeglądarce zdarzeń GA4 kalkulatora /wycena/ na lokalnej zbudowanej stronie.
// Uruchom po `npm run build`: node scripts/e2e-ga4-calculator-events.mjs [port]
//  - serwuje dist przez `vite preview`, żadnej analityki nie ładuje (żądania poza localhost blokowane),
//  - window.zaraz to atrapa, która ODWZOROWUJE bramkę zgody Zaraz: zdarzenie jest „dostarczone do GA4”
//    (window.__ga4) tylko, gdy ostatnie zaraz.consent.set miało kese=true (cel „analityka”);
//    wszystko, czego aplikacja próbowała (window.__attempt), jest liczone osobno,
//  - POST /api/ jest przerywany (żaden lead nie powstaje), Turnstile to atrapa,
//  - zgodę klika się prawdziwym banerem (CookieBanner): przycisk szukany w regionie banera
//    (role="region", aria-label z CookieBanner.tsx) po DOKŁADNEJ etykiecie, którą skrypt najpierw
//    znajduje w źródle komponentu; brak etykiety w źródle, brak banera albo przycisku = BLAD, kod 1,
//  - każdy scenariusz ma własny, czysty kontekst przeglądarki (zgoda z A nie przechodzi do B),
//  - blokada analityki ze wspólnego modułu scripts/lib/prod-safe.mjs (protect/watchBrowser/finish),
//    tak jak w scripts/audit-render.mjs; przeciek analityki = kod 1.
// Sprawdza: 0 zdarzeń dostarczonych przed zgodą; po akceptacji każda akcja = dokładnie 1 zdarzenie;
// po odrzuceniu 0 dostarczonych; w parametrach brak e-maila. Kod 0 = wszystko się zgadza.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import puppeteer from 'puppeteer';
import { createProdSafe } from './lib/prod-safe.mjs';

const PORT = Number(process.argv[2] || 4181);
const BASE = `http://127.0.0.1:${PORT}`;
const EMAIL = 'e2e@example.com';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const safe = createProdSafe(BASE);

// Baner zgody: region i etykiety przycisków jak w components/features/CookieBanner.tsx.
const BANNER_FILE = 'components/features/CookieBanner.tsx';
const BANNER_LABEL = 'Baner plików cookies';
const CONSENT = { accept: 'Akceptuję wszystkie', reject: 'Odrzuć opcjonalne' };

/** Każda etykieta, której skrypt używa, musi występować w źródle banera (fail-closed). */
function checkBannerSource() {
  let src;
  try {
    src = fs.readFileSync(BANNER_FILE, 'utf8');
  } catch (e) {
    throw new Error(`nie da się odczytać ${BANNER_FILE}: ${e?.message || e}`);
  }
  if (!src.includes(`aria-label="${BANNER_LABEL}"`) || !src.includes('role="region"')) {
    throw new Error(`${BANNER_FILE} nie ma regionu aria-label="${BANNER_LABEL}"`);
  }
  for (const label of Object.values(CONSENT)) {
    if (!new RegExp(`>\\s*${label}\\s*<`).test(src)) {
      throw new Error(`etykieta „${label}” nie występuje w ${BANNER_FILE}`);
    }
  }
}

/** Klika w banerze zgody przycisk o dokładnie tej etykiecie; brak banera lub przycisku = błąd. */
async function clickConsent(page, label) {
  const sel = `[role="region"][aria-label="${BANNER_LABEL}"]`;
  await page.waitForSelector(sel, { visible: true, timeout: 10000 }).catch(() => {
    throw new Error(`brak banera zgody ${sel}`);
  });
  const ok = await page.evaluate(
    (s, l) => {
      const b = [...document.querySelectorAll(`${s} button`)].find(
        (x) => (x.textContent || '').replace(/\s+/g, ' ').trim() === l && !x.disabled,
      );
      if (b) b.click();
      return !!b;
    },
    sel,
    label,
  );
  if (!ok) throw new Error(`brak przycisku „${label}” w banerze zgody`);
}

const QUESTIONS = {
  questions: [
    {
      code: 'project_goal',
      text: 'Jaki jest cel projektu?',
      help_text: null,
      answer_type: 'select',
      options: [{ value: 'sklep', label: 'Sklep internetowy' }],
      visible_if: null,
      group: 'projekt',
      sort_order: 1,
    },
  ],
};
const FAKE_TURNSTILE = `window.turnstile = { render: () => 'w1', execute() {}, reset() {},
  getResponse: () => 'e2e-token', remove() {} };`;

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${BASE}/`)).ok) return;
    } catch {
      /* jeszcze nie wstał */
    }
    await sleep(500);
  }
  throw new Error('vite preview nie wstał');
}

async function clickButton(page, re) {
  const ok = await page.evaluate((src) => {
    const rx = new RegExp(src);
    const b = [...document.querySelectorAll('button')].find(
      (x) => rx.test(x.textContent || '') && !x.disabled,
    );
    if (b) b.click();
    return !!b;
  }, re.source);
  if (!ok) throw new Error(`brak przycisku ${re}`);
}

async function newPage(browser, log) {
  // Czysty kontekst: localStorage (zapisana zgoda) nie przechodzi między scenariuszami.
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.evaluateOnNewDocument(() => {
    window.__ga4 = []; // dostarczone do GA4 (zgoda analityczna była przyznana)
    window.__attempt = []; // wszystko, co aplikacja wysłała do zaraz.track
    let granted = false;
    window.zaraz = {
      track: (e, d) => {
        window.__attempt.push([e, d]);
        if (granted) window.__ga4.push([e, d]);
        return Promise.resolve();
      },
      consent: {
        set: (c) => {
          granted = c && c.kese === true;
        },
      },
    };
  });
  // Strony wykrywają prerender po „Headless” w UA (wtedy kalkulator i baner się nie montują);
  // protect() i tak zdejmuje „Headless” i dopisuje MixtureE2E/1.
  await safe.protect(page, {
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
    onBlocked: (req) => log.blocked.push(req.url()),
    handler: (req) => route(req, log),
  });
  return page;
}

// Żądania poza analityką (analitykę przerywa prod-safe, zanim trafi tutaj).
function route(req, log) {
  const u = new URL(req.url());
  const local = u.hostname === '127.0.0.1' || u.hostname === 'localhost';
  if (u.hostname === 'challenges.cloudflare.com') {
    return req.respond({ status: 200, contentType: 'text/javascript', body: FAKE_TURNSTILE });
  }
  if (!local || u.pathname.startsWith('/cdn-cgi/')) {
    log.blocked.push(u.hostname + u.pathname);
    return req.abort();
  }
  if (u.pathname === '/api/estimation/public-questions') {
    return req.respond({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(QUESTIONS),
    });
  }
  if (req.method() === 'POST' && u.pathname.startsWith('/api/')) {
    log.abortedPosts.push(u.pathname);
    return req.abort();
  }
  if (u.pathname.startsWith('/api/')) return req.respond({ status: 404, body: '' });
  return req.continue();
}

const names = (page, key, prefix = 'calculator_') =>
  page.evaluate(
    (k, p) => window[k].filter(([e]) => e.startsWith(p)).map(([e, d]) => ({ e, d })),
    key,
    prefix,
  );
const count = (list, name) => list.filter((x) => x.e === name).length;

// Scenariusz: odpowiedź, Dalej (przed decyzją o zgodzie), klik zgody, Wstecz, Dalej, e-mail, wysyłka.
async function scenario(page, consentLabel) {
  await page.goto(`${BASE}/wycena/`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForSelector('[role="radio"]', { timeout: 30000 });
  await sleep(1000);
  const loadAttempt = (await names(page, '__attempt')).length;
  await page.evaluate(() => document.querySelector('[role="radio"]').click());
  await page.waitForSelector('[role="radio"][aria-checked="true"]', { timeout: 10000 });
  await clickButton(page, /^\s*Dalej\s*$/); // przed decyzją o zgodzie
  await sleep(400);
  const beforeConsentDelivered = (await names(page, '__ga4', '')).length;
  const beforeConsentAttempt = (await names(page, '__attempt')).length;
  await clickConsent(page, consentLabel);
  await sleep(500);
  await clickButton(page, /^\s*Wstecz\s*$/);
  await sleep(300);
  await clickButton(page, /^\s*Dalej\s*$/);
  await sleep(300);
  await page.type('input[type="email"]', EMAIL);
  await clickButton(page, /Poznaj widełki/);
  await page.waitForFunction(() => window.__attempt.some(([e]) => e === 'calculator_submit'), {
    timeout: 30000,
  });
  await sleep(1500);
  return { loadAttempt, beforeConsentDelivered, beforeConsentAttempt };
}

async function main() {
  const server = spawn(
    'npx',
    ['vite', 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'],
    { stdio: 'ignore' },
  );
  let rc = 1;
  let ok = false;
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  safe.watchBrowser(browser);
  try {
    checkBannerSource();
    await waitForServer();

    // --- A: zgoda przyznana ---
    const logA = { blocked: [], abortedPosts: [] };
    const pa = await newPage(browser, logA);
    const a = await scenario(pa, CONSENT.accept);
    const delA = await names(pa, '__ga4');
    const allA = await names(pa, '__ga4', '');
    console.log(
      `A_zgoda load_attempt=${a.loadAttempt} przed_zgoda_dostarczone=${a.beforeConsentDelivered} przed_zgoda_proby=${a.beforeConsentAttempt}`,
    );
    const stepsA = delA.filter((x) => x.e === 'calculator_step');
    console.log(
      `A_zgoda step=${count(delA, 'calculator_step')} submit=${count(delA, 'calculator_submit')} preview=${count(delA, 'calculator_preview')} share=${count(delA, 'calculator_share')} booking_open=${count(delA, 'calculator_booking_open')} kierunki=${JSON.stringify(stepsA.map((x) => x.d.direction))} post_przerwany=${JSON.stringify(logA.abortedPosts)} zewn_zablokowane=${logA.blocked.length}`,
    );
    const leakA = JSON.stringify(allA).includes(EMAIL);

    // --- B: zgoda odrzucona ---
    const logB = { blocked: [], abortedPosts: [] };
    const pb = await newPage(browser, logB);
    const b = await scenario(pb, CONSENT.reject);
    const delB = await names(pb, '__ga4', '');
    const attB = await names(pb, '__attempt');
    console.log(
      `B_odmowa dostarczone=${delB.length} proby_aplikacji=${attB.length} przed_zgoda_dostarczone=${b.beforeConsentDelivered}`,
    );

    ok =
      a.loadAttempt === 0 &&
      a.beforeConsentDelivered === 0 &&
      a.beforeConsentAttempt === 1 &&
      count(delA, 'calculator_step') === 2 &&
      count(delA, 'calculator_submit') === 1 &&
      count(delA, 'calculator_preview') === 0 &&
      count(delA, 'calculator_share') === 0 &&
      count(delA, 'calculator_booking_open') === 0 &&
      JSON.stringify(stepsA.map((x) => x.d.direction)) === '["back","next"]' &&
      !leakA &&
      logA.abortedPosts.includes('/api/estimation/public-quote') &&
      logA.blocked.length === 0 &&
      delB.length === 0 &&
      b.beforeConsentDelivered === 0;
    console.log(`WYNIK ok=${ok} email_w_zdarzeniach=${leakA}`);
  } catch (e) {
    console.error('BLAD', e?.message || e);
  } finally {
    await browser.close();
    server.kill();
  }
  // Bezpiecznik prod-safe: przeciek analityki = kod 1 niezależnie od wyniku scenariuszy.
  const guard = safe.finish();
  rc = ok && guard.ok ? 0 : 1;
  process.exit(rc);
}

main();
