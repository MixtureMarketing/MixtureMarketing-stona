import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  E2E_UA_TAG,
  createProdSafe,
  isAnalyticsUrl,
  isProdUrl,
  withE2eUa,
} from '../../scripts/lib/prod-safe.mjs';

const ROOT = path.resolve(__dirname, '../..');

// ---------------------------------------------------------------- atrapy Puppeteera
class FakeReq {
  handled = false;
  action: string | null = null;
  constructor(private u: string) {}
  url() {
    return this.u;
  }
  isInterceptResolutionHandled() {
    return this.handled;
  }
  abort(reason: string) {
    this.action = `abort:${reason}`;
    return Promise.resolve();
  }
  continue() {
    this.action = 'continue';
    return Promise.resolve();
  }
}
class FakePage extends EventEmitter {
  ua: string | undefined;
  interception = false;
  async setUserAgent(o: { userAgent: string }) {
    this.ua = o.userAgent;
  }
  async setRequestInterception(v: boolean) {
    this.interception = v;
  }
  browser() {
    return { userAgent: async () => 'Mozilla/5.0 HeadlessChrome/156.0.0.0 Safari/537.36' };
  }
  fire(url: string) {
    const req = new FakeReq(url);
    this.emit('request', req);
    return req;
  }
}
const silent = { log: () => {}, error: () => {} };

afterEach(() => {
  process.exitCode = undefined;
});

// ---------------------------------------------------------------- dopasowanie adresów
describe('isAnalyticsUrl: co jest analityką', () => {
  it.each([
    'https://mixturemarketing.pl/cdn-cgi/zaraz/i',
    'https://mixturemarketing.pl/cdn-cgi/zaraz/t',
    'https://mixturemarketing.pl/cdn-cgi/zaraz/s.js?z=eyJ4IjoxfQ',
    'https://mixturemarketing.pl/cdn-cgi/zaraz',
    'http://localhost:4173/cdn-cgi/zaraz/t',
    'https://inna-domena.example/cdn-cgi/zaraz/i',
    'https://mixturemarketing.pl/CDN-CGI/Zaraz/t',
    'https://mixturemarketing.pl//cdn-cgi//zaraz/t',
    'https://mixturemarketing.pl/cdn%2Dcgi/zaraz/t',
    'https://mixturemarketing.pl/%63dn-cgi/zaraz/t',
    'https://mixturemarketing.pl/cdn-cgi/rum?x=1',
    'https://mixturemarketing.pl/cdn-cgi/rum',
    'https://www.google-analytics.com/g/collect?v=2',
    'https://region1.google-analytics.com/g/collect',
    'https://analytics.google.com/g/collect',
    'https://www.googletagmanager.com/gtag/js?id=G-X',
    'https://stats.g.doubleclick.net/g/collect',
    'https://connect.facebook.net/en_US/fbevents.js',
    'https://www.facebook.com/tr/?id=1',
    'https://www.clarity.ms/tag/abc',
    'https://script.hotjar.com/modules.js',
    'https://static.hotjar.io/x',
    'https://static.cloudflareinsights.com/beacon.min.js',
    'https://www.google-analytics.com./g/collect',
    'nie-jest-adresem',
    '',
  ])('blokuje %s', (url) => {
    expect(isAnalyticsUrl(url)).toBe(true);
  });

  it.each([
    'https://mixturemarketing.pl/',
    'https://mixturemarketing.pl/cdn-cgi/image/width=800/assets/a.png',
    'https://mixturemarketing.pl/cdn-cgi/challenge-platform/h/b/orchestrate',
    'https://mixturemarketing.pl/api/contact-submit',
    'https://mixturemarketing.pl/zaraz/',
    'https://mixturemarketing.pl/blog/cdn-cgi-zaraz',
    'https://cdn.sanity.io/images/x/production/a-10x10.png',
    'https://notgoogle-analytics.com/x',
    'https://google-analytics.com.example.org/x',
    'https://challenges.cloudflare.com/turnstile/v0/api.js',
    'https://fonts.gstatic.com/s/a.woff2',
    'data:text/plain;base64,AAAA',
    'blob:https://mixturemarketing.pl/1234',
    'about:blank',
  ])('przepuszcza %s', (url) => {
    expect(isAnalyticsUrl(url)).toBe(false);
  });
});

describe('isProdUrl', () => {
  it('pętla zwrotna to nie produkcja', () => {
    for (const u of [
      'http://localhost:3000',
      'http://127.0.0.1:4173/x',
      'http://[::1]:8080/',
      'http://app.localhost/',
    ]) {
      expect(isProdUrl(u)).toBe(false);
    }
  });
  it('wszystko inne (też błędny adres) to produkcja', () => {
    for (const u of [
      'https://mixturemarketing.pl',
      'https://mixturemarketing.pl:443/',
      'https://localhost.evil.pl/',
      'http://192.168.1.10:3000',
      'https://x.pages.dev',
      'nie-adres',
    ]) {
      expect(isProdUrl(u)).toBe(true);
    }
  });
});

describe('withE2eUa', () => {
  it('dopisuje znacznik i zdejmuje „Headless”', () => {
    const ua = withE2eUa('Mozilla/5.0 HeadlessChrome/156.0 Safari/537.36');
    expect(E2E_UA_TAG).toBe('MixtureE2E/1');
    expect(ua).toBe('Mozilla/5.0 Chrome/156.0 Safari/537.36 MixtureE2E/1');
    expect(ua).not.toMatch(/Headless/);
  });
  it('jest idempotentne', () => {
    expect(withE2eUa(withE2eUa('Mozilla/5.0 Chrome/1'))).toBe('Mozilla/5.0 Chrome/1 MixtureE2E/1');
  });
});

// ---------------------------------------------------------------- protect
describe('protect: blokada na stronie', () => {
  it('ustawia UA z dopiskiem MixtureE2E/1 (podany i domyślny z przeglądarki)', async () => {
    const safe = createProdSafe('https://mixturemarketing.pl');
    const a = new FakePage();
    await safe.protect(a, { userAgent: 'Mozilla/5.0 (iPhone) Safari/604.1' });
    expect(a.ua).toBe('Mozilla/5.0 (iPhone) Safari/604.1 MixtureE2E/1');
    const b = new FakePage();
    await safe.protect(b);
    expect(b.ua).toMatch(/ MixtureE2E\/1$/);
    expect(b.ua).not.toMatch(/Headless/);
    expect(a.interception && b.interception).toBe(true);
  });

  it('przerywa żądania analityki i liczy je; resztę przepuszcza', async () => {
    const safe = createProdSafe('https://mixturemarketing.pl');
    const page = new FakePage();
    await safe.protect(page);
    const blocked = [
      'https://mixturemarketing.pl/cdn-cgi/zaraz/i',
      'https://mixturemarketing.pl/cdn-cgi/zaraz/s.js?z=abc',
      'https://www.googletagmanager.com/gtag/js',
    ].map((u) => page.fire(u));
    const allowed = [
      'https://mixturemarketing.pl/cdn-cgi/image/width=100/a.png',
      'https://mixturemarketing.pl/api/contact-submit',
    ].map((u) => page.fire(u));
    expect(blocked.map((r) => r.action)).toEqual(Array(3).fill('abort:blockedbyclient'));
    expect(allowed.map((r) => r.action)).toEqual(['continue', 'continue']);
    expect(safe.stats.blocked).toBe(3);
  });

  it('analityka nie dociera do handlera skryptu; reszta tak; onBlocked dostaje zablokowane', async () => {
    const safe = createProdSafe('https://mixturemarketing.pl');
    const page = new FakePage();
    const seen: string[] = [];
    const hooked: string[] = [];
    await safe.protect(page, {
      handler: (req: FakeReq) => seen.push(req.url()),
      onBlocked: (req: FakeReq) => hooked.push(req.url()),
    });
    page.fire('https://mixturemarketing.pl/cdn-cgi/zaraz/t');
    page.fire('https://mixturemarketing.pl/o-nas/');
    expect(seen).toEqual(['https://mixturemarketing.pl/o-nas/']);
    expect(hooked).toEqual(['https://mixturemarketing.pl/cdn-cgi/zaraz/t']);
  });

  it('nie rusza żądania już obsłużonego przez kogoś innego', async () => {
    const safe = createProdSafe('https://mixturemarketing.pl');
    const page = new FakePage();
    await safe.protect(page);
    const req = new FakeReq('https://mixturemarketing.pl/cdn-cgi/zaraz/t');
    req.handled = true;
    page.emit('request', req);
    expect(req.action).toBeNull();
    expect(safe.stats.blocked).toBe(0);
  });
});

// ---------------------------------------------------------------- bezpiecznik
function fakeBrowser() {
  const b = new EventEmitter();
  return b as EventEmitter & { emit: EventEmitter['emit'] };
}
function pageTarget(page: FakePage, opener: unknown = null) {
  return { type: () => 'page', page: async () => page, opener: () => opener };
}
const tick = () => new Promise((r) => setTimeout(r, 0));

describe('bezpiecznik (verdict / finish)', () => {
  it('produkcja bez zainstalowanej blokady = błąd z komunikatem i exit 1', () => {
    const safe = createProdSafe('https://mixturemarketing.pl');
    const errors: string[] = [];
    const v = safe.verdict();
    expect(v.ok).toBe(false);
    expect(v.problems.join()).toMatch(/blokada analityki nie została zainstalowana/);
    createProdSafe('https://mixturemarketing.pl', {
      log: { log: () => {}, error: (m: string) => errors.push(m) },
    }).finish();
    expect(process.exitCode).toBe(1);
    expect(errors[0]).toMatch(/^PROD-SAFE BŁĄD: blokada analityki nie została zainstalowana/);
  });

  it('produkcja z blokadą i bez przecieków = ok, exit code nietknięty', async () => {
    const safe = createProdSafe('https://mixturemarketing.pl', { log: silent });
    const page = new FakePage();
    await safe.protect(page);
    page.fire('https://mixturemarketing.pl/cdn-cgi/zaraz/t');
    expect(safe.finish().ok).toBe(true);
    expect(process.exitCode).toBeUndefined();
  });

  it('odpowiedź z adresu analityki (przeciek) = błąd z adresem, exit 1', async () => {
    const errors: string[] = [];
    const safe = createProdSafe('https://mixturemarketing.pl', {
      log: { log: () => {}, error: (m: string) => errors.push(m) },
    });
    const browser = fakeBrowser();
    safe.watchBrowser(browser);
    const page = new FakePage();
    await safe.protect(page);
    browser.emit('targetcreated', pageTarget(page));
    await tick();
    page.emit('response', { url: () => 'https://mixturemarketing.pl/cdn-cgi/zaraz/t' });
    expect(safe.stats.passed).toBe(1);
    expect(safe.finish().ok).toBe(false);
    expect(process.exitCode).toBe(1);
    expect(errors[0]).toMatch(
      /przepuszczono 1 żądań analityki: https:\/\/mixturemarketing\.pl\/cdn-cgi\/zaraz\/t/,
    );
  });

  it('odpowiedź z innego adresu nie jest przeciekiem', async () => {
    const safe = createProdSafe('https://mixturemarketing.pl', { log: silent });
    const browser = fakeBrowser();
    safe.watchBrowser(browser);
    const page = new FakePage();
    await safe.protect(page);
    browser.emit('targetcreated', pageTarget(page));
    await tick();
    page.emit('response', { url: () => 'https://mixturemarketing.pl/cdn-cgi/image/w=1/a.png' });
    expect(safe.stats.passed).toBe(0);
    expect(safe.verdict().ok).toBe(true);
  });

  it('karta otwarta bez protect() na produkcji = błąd; popup (opener) nie jest wymagany', async () => {
    const safe = createProdSafe('https://mixturemarketing.pl', { log: silent });
    const browser = fakeBrowser();
    safe.watchBrowser(browser);
    const guarded = new FakePage();
    await safe.protect(guarded);
    browser.emit('targetcreated', pageTarget(guarded));
    const popup = new FakePage();
    browser.emit('targetcreated', pageTarget(popup, {}));
    await tick();
    expect(safe.verdict().ok).toBe(true);
    const bare = new FakePage();
    browser.emit('targetcreated', pageTarget(bare));
    await tick();
    const v = safe.verdict();
    expect(v.ok).toBe(false);
    expect(v.problems.join()).toMatch(/1 kart bez blokady analityki/);
  });

  it('popup z przeciekiem analityki też liczy się jako przeciek', async () => {
    const safe = createProdSafe('https://mixturemarketing.pl', { log: silent });
    const browser = fakeBrowser();
    safe.watchBrowser(browser);
    const guarded = new FakePage();
    await safe.protect(guarded);
    const popup = new FakePage();
    browser.emit('targetcreated', pageTarget(popup, {}));
    await tick();
    popup.emit('response', { url: () => 'https://www.google-analytics.com/g/collect' });
    expect(safe.verdict().ok).toBe(false);
  });

  it('lokalnie brak blokady nie jest błędem, ale przeciek tak', async () => {
    const safe = createProdSafe('http://localhost:4173', { log: silent });
    expect(safe.isProd).toBe(false);
    expect(safe.verdict().ok).toBe(true);
    const browser = fakeBrowser();
    safe.watchBrowser(browser);
    const page = new FakePage();
    browser.emit('targetcreated', pageTarget(page));
    await tick();
    expect(safe.verdict().ok).toBe(true);
    page.emit('response', { url: () => 'http://localhost:4173/cdn-cgi/zaraz/t' });
    expect(safe.verdict().ok).toBe(false);
  });
});

// ---------------------------------------------------------------- pokrycie skryptów
describe('każdy skrypt przeglądarkowy używa blokady albo jest lokalny', () => {
  // Skrypty, które wchodzą wyłącznie na localhost (port z konstanty) — jawna lista; nowy skrypt
  // z Puppeteerem poza tą listą MUSI importować prod-safe.mjs.
  const LOCAL_ONLY = [
    'prerender.js',
    'scripts/audit-a11y.js',
    'scripts/audit-health.js',
    'scripts/audit-performance.js',
    'scripts/probe-live-price-bar.mjs',
  ];
  const candidates = [
    'prerender.js',
    ...fs
      .readdirSync(path.join(ROOT, 'scripts'))
      .filter((f) => /\.(m?js|cjs)$/.test(f))
      .map((f) => `scripts/${f}`),
  ].filter((f) => /from 'puppeteer'|require\('puppeteer'\)|from "puppeteer"/.test(read(f)));

  function read(rel: string) {
    return fs.readFileSync(path.join(ROOT, rel), 'utf8');
  }

  it('znajduje skrypty z Puppeteerem', () => {
    expect(candidates.length).toBeGreaterThanOrEqual(8);
  });

  it.each(candidates.filter((f) => !LOCAL_ONLY.includes(f)))(
    '%s importuje prod-safe i woła protect/watchBrowser/finish',
    (f) => {
      const src = read(f);
      expect(src).toMatch(/from '\.\/lib\/prod-safe\.mjs'/);
      expect(src).toMatch(/\.protect\(/);
      expect(src).toMatch(/\.watchBrowser\(/);
      expect(src).toMatch(/\.finish\(\)/);
    },
  );

  it.each(LOCAL_ONLY)('%s wchodzi tylko na localhost (brak adresu produkcji)', (f) => {
    const src = read(f);
    expect(src).not.toMatch(/https?:\/\/(?!localhost|127\.0\.0\.1)[a-z0-9.-]+\.[a-z]{2,}\//i);
    expect(src).not.toMatch(/mixturemarketing\.pl/);
  });
});

// ---------------------------------------------------------------- prawdziwa przeglądarka
describe('Puppeteer + prawdziwy Chrome: Zaraz z własnej domeny nie wychodzi', () => {
  it('blokuje /cdn-cgi/zaraz/* na tym samym hoście, przepuszcza /cdn-cgi/image i API', async () => {
    const hits: string[] = [];
    const server = http.createServer((req, res) => {
      hits.push(req.url || '');
      const ua = String(req.headers['user-agent'] || '');
      if (req.url === '/') {
        res.setHeader('content-type', 'text/html');
        res.end(`<!doctype html><title>t</title><script>
          const go = (u) => fetch(u).catch(() => {});
          Promise.all(['/cdn-cgi/zaraz/i','/cdn-cgi/zaraz/t','/cdn-cgi/zaraz/s.js?z=1','/cdn-cgi/rum?a=1',
            '/cdn-cgi/image/w=1/x.png','/api/contact-submit'].map(go)).then(() => { document.title = 'done'; });
          </script>`);
        return;
      }
      res.setHeader('x-ua', ua);
      res.end('ok');
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
    const { port } = server.address() as { port: number };
    const base = `http://127.0.0.1:${port}`;
    let browser;
    try {
      const puppeteer = (await import('puppeteer')).default;
      try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
      } catch (e) {
        console.warn('Chrome niedostępny, pomijam test integracyjny:', String(e).slice(0, 120));
        return;
      }
      const safe = createProdSafe(base, { log: silent });
      safe.watchBrowser(browser);
      const page = await browser.newPage();
      await safe.protect(page);
      await page.goto(`${base}/`, { waitUntil: 'networkidle0' });
      await page.waitForFunction(() => document.title === 'done', { timeout: 10000 });
      const ua = await page.evaluate(() => navigator.userAgent);
      expect(ua).toMatch(/MixtureE2E\/1$/);
      expect(ua).not.toMatch(/Headless/);
      expect(
        hits.filter((h) => h.startsWith('/cdn-cgi/zaraz') || h.startsWith('/cdn-cgi/rum')),
      ).toEqual([]);
      expect(hits).toContain('/cdn-cgi/image/w=1/x.png');
      expect(hits).toContain('/api/contact-submit');
      expect(safe.stats.blocked).toBe(4);
      expect(safe.stats.passed).toBe(0);
      expect(safe.verdict().ok).toBe(true);
    } finally {
      await browser?.close();
      await new Promise((r) => server.close(r));
    }
  }, 60000);
});
