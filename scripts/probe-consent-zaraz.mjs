// Sonda przeglądarkowa MIX-1389: zgoda → Zaraz Consent API na lokalnym buildzie (vite preview).
//
// Zaraz wstrzykuje edge Cloudflare, więc lokalnie go nie ma: sonda podstawia atrapę
// `window.zaraz`, której Consent API sonda sama ogłasza gotowym (zdarzenie
// `zarazConsentAPIReady`) dopiero wtedy, gdy aplikacja już czeka (odczytała wpis zgody i
// nasłuchuje zdarzenia), albo nigdy. Dzięki temu „API późne” jest późne względem aplikacji,
// a nie względem startu dokumentu (r1: stałe okno 3250 ms od startu dokumentu dawało wynik
// zależny od obciążenia maszyny, MIX-1389 r2).
//
// Bezpiecznik prod-safe (scripts/lib/prod-safe.mjs): protect() na każdej karcie (UA z
// dopiskiem MixtureE2E/1, analityka przerywana), watchBrowser() liczy przecieki, finish()
// daje kod 1 przy przecieku. Każde żądanie spoza pętli zwrotnej jest też PRZERYWANE, a
// żądania do hostów Google są liczone przed przerwaniem.
//
// Użycie (z katalogu repo, po `npx vite build`):
//   node scripts/probe-consent-zaraz.mjs [wynik.json]
// Kod wyjścia 0 = wszystkie scenariusze zgodne i bezpiecznik czysty, 1 = rozbieżność.
import puppeteer from 'puppeteer';
import { writeFileSync } from 'node:fs';
import { createProdSafe, isProdUrl } from './lib/prod-safe.mjs';
import { startPreviewOrExit } from './lib/preview-server.mjs';

const PORT = 4179;
const BASE = `http://127.0.0.1:${PORT}/`;
const OUT = process.argv[2] || '.bieg/m1389/probe.json';
const BANNER = '[aria-label="Baner plików cookies"]';
const GOOGLE_HOST =
  /(^|\.)(google|googletagmanager|google-analytics|doubleclick|googleadservices|googlesyndication|gstatic)\.[a-z.]+$/i;
// Ile sonda czeka, zanim ogłosi API gotowym (aplikacja już czeka), i ile po gotowości.
const HOLD_MS = 1000;
const AFTER_READY_MS = 5000;
const MOUNT_TIMEOUT_MS = 20000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Atrapa Zaraz (w stronie, przed skryptami aplikacji). Zapisuje czasy (performance.now, ms):
// read = aplikacja odczytała wpis zgody, listen = aplikacja nasłuchuje zarazConsentAPIReady,
// ready = sonda ogłosiła gotowość, calls[].at = consent.set. Gotowość tylko przez
// window.__probeReady() (wywołuje sonda); bez wywołania API nigdy nie jest gotowe.
const zarazStub = (stored) => {
  const t = (window.__probe = { calls: [] });
  const now = () => Math.round(performance.now());
  // Licznik dokumentów w karcie: aplikacja może sama przeładować stronę raz (chunkReload).
  try {
    t.doc = Number(window.sessionStorage.getItem('probe-docs') || '0') + 1;
    window.sessionStorage.setItem('probe-docs', String(t.doc));
  } catch {
    t.doc = -1;
  }
  if (stored !== undefined) {
    try {
      window.localStorage.setItem('cookie-consent-v2', stored);
    } catch {
      /* brak storage */
    }
  }
  const getItem = Storage.prototype.getItem;
  Storage.prototype.getItem = function (key) {
    if (key === 'cookie-consent-v2' && t.read === undefined) t.read = now();
    return getItem.call(this, key);
  };
  const addListener = document.addEventListener.bind(document);
  document.addEventListener = (name, ...rest) => {
    if (name === 'zarazConsentAPIReady' && t.listen === undefined) t.listen = now();
    return addListener(name, ...rest);
  };
  window.zaraz = {
    track: () => undefined,
    set: () => undefined,
    consent: {
      APIReady: false,
      set: (purposes) => t.calls.push({ at: now(), purposes }),
    },
  };
  window.__probeReady = () => {
    window.zaraz.consent.APIReady = true;
    t.ready = now();
    document.dispatchEvent(new Event('zarazConsentAPIReady'));
  };
};

const safe = createProdSafe(BASE);

const openPage = async (browser, { stored } = {}) => {
  const page = await browser.newPage();
  const google = [];
  const countGoogle = (url) => {
    let host = '';
    try {
      host = new URL(url).hostname;
    } catch {
      /* zły adres: nie Google, ale i tak przerwany niżej */
    }
    if (GOOGLE_HOST.test(host)) google.push(url.slice(0, 120));
  };
  await safe.protect(page, {
    onBlocked: (req) => countGoogle(req.url()),
    handler: (req) => {
      const url = req.url();
      countGoogle(url);
      // Fail-closed: lokalnie wolno tylko pętli zwrotnej; reszta (Google, CDN, API) przerwana.
      if (isProdUrl(url)) {
        req.abort('blockedbyclient').catch(() => {});
        return;
      }
      req.continue().catch(() => {});
    },
  });
  await page.evaluateOnNewDocument(zarazStub, stored);
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const doc = await settle(page);
  return { page, google, doc };
};

// Dokument strony (performance.timeOrigin) albo null w trakcie przeładowania.
const docOrigin = (page) => page.evaluate(() => performance.timeOrigin).catch(() => null);

// MIX-1389 r2: lokalny build bez VITE_SANITY_PROJECT_ID rzuca przy imporcie leniwego chunka
// („Configuration must contain `projectId`”) → vite:preloadError → utils/chunkReload.ts
// przeładowuje kartę RAZ ok. 0,8–1,2 s po wejściu (pomiar: .bieg/m1389-r2/diag4.log). Stan
// atrapy (gotowość, wywołania) żyje w jednym dokumencie, więc scenariusz startuje dopiero na
// dokumencie, który od SETTLE_MS się nie zmienia; zmiana później = scenariusz NIE (doc w pomiarze).
const SETTLE_MS = 2500;
const settle = async (page) => {
  const start = Date.now();
  let last = await docOrigin(page);
  let since = Date.now();
  while (Date.now() - start < MOUNT_TIMEOUT_MS) {
    await sleep(250);
    const origin = await docOrigin(page);
    if (origin !== last) {
      last = origin;
      since = Date.now();
    } else if (origin !== null && Date.now() - since >= SETTLE_MS) {
      return origin;
    }
  }
  throw new Error(`dokument nie ustabilizował się w ${MOUNT_TIMEOUT_MS} ms`);
};

const probeState = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.__probe)));
const fireReady = (page) => page.evaluate(() => window.__probeReady());
const bannerOpen = (page) => page.evaluate((sel) => !!document.querySelector(sel), BANNER);
// Aplikacja czeka na API: odczytała wpis i nasłuchuje zdarzenia gotowości.
const waitAppWaiting = (page) =>
  page
    .waitForFunction(() => window.__probe.listen !== undefined, { timeout: MOUNT_TIMEOUT_MS })
    .then(() => true)
    .catch(() => false);
const waitCalls = (page, n) =>
  page
    .waitForFunction((k) => window.__probe.calls.length >= k, { timeout: AFTER_READY_MS }, n)
    .then(() => true)
    .catch(() => false);
const timing = (s) => ({
  doc: s.doc,
  readMs: s.read,
  listenMs: s.listen,
  readyMs: s.ready,
  callMs: s.calls.map((c) => c.at),
});

const results = [];
const check = (name, ok, measured) => results.push({ name, ok: !!ok, measured });

// MIX-1441: własny serwer w osobnej grupie procesów; zajęty port / martwy serwer = kod 1, bez testów.
const server = await startPreviewOrExit({ port: PORT });
let browser;
try {
  browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  safe.watchBrowser(browser);

  // S1: nowy gość. API gotowe, zanim gość kliknie. Przed zgodą: 0 żądań Google, 0 consent.set.
  {
    const { page, google, doc } = await openPage(browser);
    await page.waitForSelector(BANNER, { timeout: MOUNT_TIMEOUT_MS });
    await fireReady(page);
    await sleep(HOLD_MS);
    const before = await probeState(page);
    check('S1 przed zgodą: 0 żądań Google', google.length === 0, { google: google.length });
    check('S1 przed zgodą: 0 wywołań consent.set', before.calls.length === 0, timing(before));
    const [btn] = await page.$$('xpath/.//button[contains(., "Akceptuję wszystkie")]');
    await btn.click();
    await waitCalls(page, 1);
    await sleep(300);
    const after = await probeState(page);
    const p = after.calls[0]?.purposes;
    check(
      'S1 klik zgody: cele ustawione raz {kese:true,Pzjv:true}',
      (await docOrigin(page)) === doc &&
        after.calls.length === 1 &&
        p.kese === true &&
        p.Pzjv === true,
      { calls: after.calls },
    );
    await page.close();
  }

  // S2: powracający gość, API późne względem aplikacji: 0 przed gotowością, dokładnie 1 po.
  {
    const stored = JSON.stringify({ analytics: true, marketing: false });
    const { page, google, doc } = await openPage(browser, { stored });
    const waiting = await waitAppWaiting(page);
    await sleep(HOLD_MS);
    const early = await probeState(page);
    check(
      'S2 powrót, API późne: 0 przed gotowością',
      waiting && early.calls.length === 0 && early.read !== undefined,
      { waiting, ...timing(early) },
    );
    await fireReady(page);
    await waitCalls(page, 1);
    await sleep(500);
    const late = await probeState(page);
    const p = late.calls[0]?.purposes;
    check(
      'S2 powrót, API późne: dokładnie 1 po gotowości {kese:true,Pzjv:false}',
      (await docOrigin(page)) === doc &&
        late.calls.length === 1 &&
        p.kese === true &&
        p.Pzjv === false &&
        late.calls[0].at >= late.ready,
      { calls: late.calls, ...timing(late) },
    );
    check('S2 baner zamknięty', waiting && !(await bannerOpen(page)), { waiting });
    check('S2 0 żądań Google', google.length === 0, { google: google.length });
    await page.close();
  }

  // S3 (bliźniak S2): powracający gość, API nigdy gotowe: aplikacja czeka, nic nie wysłane.
  {
    const stored = JSON.stringify({ analytics: true, marketing: true });
    const { page, doc } = await openPage(browser, { stored });
    const waiting = await waitAppWaiting(page);
    await sleep(HOLD_MS + 2000);
    const s = await probeState(page);
    const sameDoc = (await docOrigin(page)) === doc;
    check('S3 powrót, API nigdy: 0 wywołań', waiting && sameDoc && s.calls.length === 0, {
      sameDoc,
      waiting,
      ...timing(s),
    });
    await page.close();
  }

  // S4: podmieniony wpis → baner, 0 wywołań nawet po gotowości API.
  {
    const stored = '{"analytics":"true","marketing":true}';
    const { page, doc } = await openPage(browser, { stored });
    await page.waitForSelector(BANNER, { timeout: MOUNT_TIMEOUT_MS });
    await fireReady(page);
    await sleep(HOLD_MS);
    const s = await probeState(page);
    check(
      'S4 podmieniony wpis: baner + 0 wywołań',
      (await docOrigin(page)) === doc && s.calls.length === 0,
      timing(s),
    );
    await page.close();
  }
} catch (e) {
  check('sonda bez wyjątku', false, { error: String(e && e.message ? e.message : e) });
} finally {
  if (browser) await browser.close();
  await server.stop();
}

const verdict = safe.finish(); // bezpiecznik: przeciek analityki = exit 1
const ok = results.length > 0 && results.every((r) => r.ok) && verdict.ok;
writeFileSync(OUT, JSON.stringify({ ok, base: BASE, prodSafe: verdict, results }, null, 2));
for (const r of results)
  console.log(`${r.ok ? 'OK ' : 'NIE'} ${r.name} ${JSON.stringify(r.measured)}`);
console.log(`SONDA: ${results.filter((r) => r.ok).length}/${results.length} OK`);
process.exit(ok ? 0 : 1);
