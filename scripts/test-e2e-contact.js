// E2E formularza kontaktowego na /contact/ (InlineContactForm: krok 1 → 2 → 3 → sukces).
//
// NIC nie idzie na produkcję: `/api/contact-submit` (Pages Function — vite jej nie serwuje)
// jest mockowany per `action` (create/update/send_notification/get_lead), skrypt Turnstile
// podstawiony stubem, a każde inne żądanie poza testowanym hostem jest blokowane.
// Dawna wersja mockowała nieistniejący już endpoint PHP (sprzed Pages Functions) i klikała CTA
// „Wypełnij Brief Online”, którego już nie ma — nie miała prawa przejść.
//
// Użycie:
//   npm run test:e2e                                  # wymaga `npm run build` (dist/), startuje
//                                                     # własny `vite preview` na porcie 4174
//   E2E_BASE_URL=http://127.0.0.1:5173 npm run test:e2e   # na już działającym serwerze (np. dev)
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import http from 'node:http';

const PORT = 4174; // inny niż prerender (4173)
const BASE_URL = (process.env.E2E_BASE_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
const CONTACT_URL = `${BASE_URL}/contact/`;
const API_PATH = '/api/contact-submit';

const TURNSTILE_STUB = `window.turnstile = {
  render: function () { return 'e2e-widget'; },
  reset: function () {},
  execute: function () {},
  getResponse: function () { return 'e2e-turnstile-token'; },
  remove: function () {},
};`;

async function waitForServer(url, timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const ok = await new Promise((resolve) => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve(res.statusCode !== undefined && res.statusCode < 500);
      });
      req.on('error', () => resolve(false));
    });
    if (ok) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Serwer ${url} nie odpowiedział w ${timeout} ms`);
}

/** Klik w przycisk po widocznym tekście (Puppeteer nie ma :has-text). */
async function clickButton(page, text) {
  const clicked = await page.evaluate((t) => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.innerText.includes(t),
    );
    if (!btn) return false;
    btn.click();
    return true;
  }, text);
  if (!clicked) throw new Error(`Nie znaleziono przycisku „${text}”`);
}

async function waitForText(page, text, timeout = 15000) {
  await page.waitForFunction((t) => document.body.innerText.includes(t), { timeout }, text);
}

async function runTest() {
  console.log('🚀 E2E: formularz kontaktowy (/contact/)');

  let server = null;
  if (!process.env.E2E_BASE_URL) {
    server = spawn('npm', ['run', 'preview', '--', '--port', String(PORT), '--strictPort'], {
      stdio: 'ignore',
      shell: true,
      detached: true,
    });
  }

  let browser;
  const apiCalls = [];
  try {
    await waitForServer(BASE_URL);
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
    // UA bez „Headless” — część komponentów traktuje go jak prerender.
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    );
    await page.setViewport({ width: 1280, height: 800 });

    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.origin === BASE_URL && url.pathname === API_PATH) {
        let body = {};
        try {
          body = JSON.parse(request.postData() || '{}');
        } catch {
          /* GET get_lead */
        }
        const action = body.action || url.searchParams.get('action') || 'unknown';
        apiCalls.push({ action, body });
        console.log(`💉 mock ${API_PATH} action=${action}`);
        const responses = {
          create: { success: true, id: body.lead?.id },
          update: { success: true },
          send_notification: { success: true },
          get_lead: { lead: null },
        };
        return request.respond({
          status: responses[action] ? 200 : 400,
          contentType: 'application/json',
          body: JSON.stringify(responses[action] || { message: `Nieznana akcja ${action}` }),
        });
      }
      if (url.hostname === 'challenges.cloudflare.com') {
        return request.respond({
          status: 200,
          contentType: 'text/javascript',
          body: TURNSTILE_STUB,
        });
      }
      if (url.origin !== BASE_URL) return request.abort(); // analityka, Zaraz, kalendarz itd.
      return request.continue();
    });

    console.log(`🌐 ${CONTACT_URL}`);
    await page.goto(CONTACT_URL, { waitUntil: 'domcontentloaded' });
    await waitForText(page, 'Rozpocznijmy współpracę', 60000);

    // Krok 1: dane kontaktowe (→ action=create z tokenem Turnstile)
    await page.waitForSelector('input[name="name"]');
    await page.type('input[name="name"]', 'Test Automatyczny');
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="phone"]', '600100200');
    await page.click('input[name="privacy"]');
    await clickButton(page, 'Zapisz i przejdź dalej');

    // Krok 2: szczegóły (pola zależne od typu formularza — dla „general” opcjonalne)
    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll('button')).some(
          (b) => b.innerText.includes('Dalej') && !b.innerText.includes('Zapisz'),
        ),
      { timeout: 15000 },
    );
    await clickButton(page, 'Dalej');

    // Krok 3: wiadomość i wysyłka (→ update + send_notification)
    await page.waitForSelector('textarea[name="message"]', { timeout: 15000 });
    await page.type('textarea[name="message"]', 'Automatyczny test E2E. Proszę zignorować.');
    await clickButton(page, 'Wyślij zgłoszenie');

    await waitForText(page, 'Twój brief trafił do naszego systemu');

    const actions = apiCalls.map((c) => c.action);
    const create = apiCalls.find((c) => c.action === 'create');
    if (!create) throw new Error(`Brak action=create (wywołania: ${actions.join(', ')})`);
    if (create.body.lead?.captcha_token !== 'e2e-turnstile-token') {
      throw new Error('action=create bez tokenu Turnstile');
    }
    if (!actions.includes('update')) throw new Error('Brak action=update');
    if (!actions.includes('send_notification')) throw new Error('Brak action=send_notification');
    console.log(`🎉 OK — sukces widoczny; wywołania API: ${actions.join(' → ')}`);
  } catch (error) {
    console.error('❌ Test nieudany:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (server?.pid) {
      try {
        process.kill(-server.pid, 'SIGTERM');
      } catch {
        server.kill();
      }
    }
  }
}

runTest();
