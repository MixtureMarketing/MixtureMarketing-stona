// MIX-1300: próba w przeglądarce, że audyt (/audyt-360/) i kalkulator (/wycena/) wysyłają
// zdarzenia GA4 audit_request i calculator_submit — BEZ tworzenia leada.
// Uruchom po `npm run build`: node scripts/e2e-ga4-key-events.mjs [port]
//  - serwuje dist przez `vite preview` lokalnie,
//  - window.zaraz to atrapa zapisująca zdarzenia (żadna analityka nie jest ładowana),
//  - Turnstile to atrapa (żadnego żądania do Cloudflare),
//  - POST-y tworzące leada (capture-lead, public-quote) są przechwycone i PRZERWANE,
//  - każde żądanie poza localhost jest blokowane.
// Kod wyjścia 0 = oba zdarzenia poszły, oba POST-y przerwane, zero żądań zewnętrznych.
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer';

const PORT = Number(process.argv[2] || 4179);
const BASE = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
const AUDIT = { data: { client: { url: 'https://example.com', total_score: 61 } } };
const FAKE_TURNSTILE = `window.turnstile = { render: () => 'w1', execute() {}, reset() {},
  getResponse: () => 'e2e-token', remove() {} };`;

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${BASE}/`);
      if (r.ok) return;
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
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    window.__ga4 = [];
    window.zaraz = {
      track: (e, d) => {
        window.__ga4.push([e, d]);
        return Promise.resolve();
      },
      consent: { set() {} },
    };
  });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const u = new URL(req.url());
    const local = u.hostname === '127.0.0.1' || u.hostname === 'localhost';
    if (u.hostname === 'challenges.cloudflare.com') {
      log.turnstileStub++;
      return req.respond({ status: 200, contentType: 'text/javascript', body: FAKE_TURNSTILE });
    }
    if (!local || u.pathname.startsWith('/cdn-cgi/')) {
      log.blocked.push(u.hostname + u.pathname);
      return req.abort();
    }
    if (u.pathname === '/api/estimation/public-questions') {
      return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(QUESTIONS) });
    }
    if (u.pathname === '/api/audit/run_audit') {
      return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(AUDIT) });
    }
    if (req.method() === 'POST' && u.pathname.startsWith('/api/')) {
      log.abortedPosts.push(u.pathname);
      return req.abort();
    }
    if (u.pathname.startsWith('/api/')) {
      return req.respond({ status: 404, body: '' });
    }
    return req.continue();
  });
  return page;
}

const events = (page) => page.evaluate(() => window.__ga4.map(([e, d]) => ({ e, d })));

async function main() {
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
    stdio: 'ignore',
  });
  let rc = 1;
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    await waitForServer();

    // --- Kalkulator ---
    const logC = { blocked: [], abortedPosts: [], turnstileStub: 0 };
    const pc = await newPage(browser, logC);
    await pc.goto(`${BASE}/wycena/`, { waitUntil: 'networkidle0', timeout: 60000 });
    await pc.waitForSelector('[role="radio"]', { timeout: 30000 });
    await pc.click('[role="radio"]');
    await sleep(300);
    if (!(await pc.$('input[type="email"]'))) await clickButton(pc, /^\s*Dalej\s*$/);
    await pc.waitForSelector('input[type="email"]', { timeout: 10000 });
    await pc.type('input[type="email"]', 'e2e@example.com');
    const beforeC = (await events(pc)).filter((x) => x.e === 'calculator_submit').length;
    await clickButton(pc, /Poznaj widełki/);
    await pc.waitForFunction(() => window.__ga4.some(([e]) => e === 'calculator_submit'), { timeout: 30000 });
    await sleep(1500);
    const evC = (await events(pc)).filter((x) => x.e === 'calculator_submit');
    console.log(`KALKULATOR przed_kliknieciem=${beforeC} calculator_submit=${evC.length} dane=${JSON.stringify(evC[0]?.d)} przerwane_POST=${JSON.stringify(logC.abortedPosts)} turnstile_atrapa=${logC.turnstileStub} zablokowane_zewn=${logC.blocked.length}`);

    // --- Audyt ---
    const logA = { blocked: [], abortedPosts: [], turnstileStub: 0 };
    const pa = await newPage(browser, logA);
    await pa.goto(`${BASE}/audyt-360/?url=https://example.com`, { waitUntil: 'networkidle0', timeout: 60000 });
    await pa.waitForSelector('input[type="email"]', { timeout: 60000 });
    await pa.type('input[type="email"]', 'e2e@example.com');
    const beforeA = (await events(pa)).filter((x) => x.e === 'audit_request').length;
    await clickButton(pa, /Pokaż raport/);
    await pa.waitForFunction(() => window.__ga4.some(([e]) => e === 'audit_request'), { timeout: 30000 });
    // capture-lead idzie po generowaniu PDF i tokenie — czekamy na przerwany POST.
    for (let i = 0; i < 60 && !logA.abortedPosts.includes('/api/audit/capture-lead'); i++) await sleep(500);
    const evA = (await events(pa)).filter((x) => x.e === 'audit_request');
    console.log(`AUDYT przed_kliknieciem=${beforeA} audit_request=${evA.length} dane=${JSON.stringify(evA[0]?.d)} przerwane_POST=${JSON.stringify(logA.abortedPosts)} zablokowane_zewn=${logA.blocked.length}`);

    const emailLeak = JSON.stringify([...evC, ...evA]).includes('e2e@example.com');
    const ok =
      beforeC === 0 &&
      evC.length === 1 &&
      logC.abortedPosts.includes('/api/estimation/public-quote') &&
      beforeA === 0 &&
      evA.length === 1 &&
      logA.abortedPosts.includes('/api/audit/capture-lead') &&
      !emailLeak;
    console.log(`WYNIK ok=${ok} email_w_zdarzeniach=${emailLeak}`);
    rc = ok ? 0 : 1;
  } catch (e) {
    console.error('BLAD', e?.message || e);
  } finally {
    await browser.close();
    server.kill();
  }
  process.exit(rc);
}

main();
